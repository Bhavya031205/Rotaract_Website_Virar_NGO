import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

// 1. Define your 3 Slider Images here
const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1474&q=80",
    text: "Empower Change",
    subtext: "The best way to find yourself is to lose yourself in the service of others."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    text: "Join the Movement",
    subtext: "Small acts, when multiplied by millions of people, can transform the world."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    text: "Make an Impact",
    subtext: "We make a living by what we get, but we make a life by what we give."
  }
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play Slider Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  // Form State
  const [activeTab, setActiveTab] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log("Server Response:", response.data);

      // 1. EXTRACT TOKEN
      const token = response.data.accessToken || response.data.token;
      
      // 2. EXTRACT FULL USER DATA (Fix for Admin Dashboard Button)
      // We need the whole object, not just the role string
      const userData = response.data.user || response.data; 
      
      if (!userData) throw new Error("User data missing from response");

      // Normalize Role
      const rawRole = userData.role || 'MEMBER';
      const role = rawRole.toUpperCase();

      // 3. SECURITY CHECK: Tab Mismatch
      if (role !== activeTab) {
        setError(`Access Denied. You are trying to login as ${activeTab} but this account is a ${role}.`);
        setLoading(false);
        return;
      }

      // 4. CONSTRUCT SAFE USER OBJECT
      const safeUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: role as 'ADMIN' | 'MEMBER',
        image: userData.image || ''
      };

      // 5. LOGIN WITH FULL OBJECT (This fixes the Navbar issue)
      login(token, safeUser);

      // 6. REDIRECT
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/member');
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid Email or Password');
      } else {
        setError('Login Failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* ================= LEFT SIDE: SLIDER ================= */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 justify-center items-center relative overflow-hidden">
        
        {/* Animated Slides */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide} 
            initial={{ opacity: 0, x: 100 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -100 }} 
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
             {/* Background Image */}
             <div 
               className="absolute inset-0 bg-cover bg-center"
               style={{ backgroundImage: `url('${SLIDES[currentSlide].image}')` }}
             />
             {/* Dark Overlay */}
             <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply" />
          </motion.div>
        </AnimatePresence>

        {/* Static Content Layer (Text & Dots) */}
        <div className="relative z-20 text-white p-12 text-center w-full max-w-lg">
          
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold mb-6">{SLIDES[currentSlide].text}</h2>
              <p className="text-lg text-blue-100 mb-10 leading-relaxed">
                "{SLIDES[currentSlide].subtext}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-4">
             {SLIDES.map((_, index) => (
               <button
                 key={index}
                 onClick={() => setCurrentSlide(index)}
                 className={`transition-all duration-300 rounded-full ${
                   currentSlide === index 
                     ? "w-8 h-2 bg-white" 
                     : "w-2 h-2 bg-white/50 hover:bg-white/80"
                 }`}
               />
             ))}
          </div>

        </div>
      </div>

      {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="lg:hidden absolute top-0 left-0 w-full h-48 bg-blue-900 rounded-b-[3rem]"></div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl lg:shadow-none p-8 z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          {/* TABS */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8 relative">
            <div 
              className={`w-1/2 h-full absolute top-0 bottom-0 m-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out transform ${activeTab === 'ADMIN' ? 'translate-x-[96%]' : 'translate-x-0'}`}
            ></div>
            <button
              type="button" onClick={() => setActiveTab('MEMBER')}
              className={`relative z-10 w-1/2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'MEMBER' ? 'text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Member Login
            </button>
            <button
              type="button" onClick={() => setActiveTab('ADMIN')}
              className={`relative z-10 w-1/2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'ADMIN' ? 'text-blue-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Admin Login
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-100">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">✉️</span>
                <input
                  type="email" name="email" required
                  placeholder={activeTab === 'ADMIN' ? 'admin@ngo.org' : 'member@example.com'}
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                <input
                  type="password" name="password" required placeholder="••••••••"
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition-all transform hover:scale-[1.02] ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? "Signing in..." : `Sign in as ${activeTab === 'ADMIN' ? 'Admin' : 'Member'}`}
            </button>
          </form>

          {activeTab === 'MEMBER' && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Not a member yet? <Link to="/become-member" className="font-bold text-blue-600 hover:text-blue-500">Join the Mission</Link>
            </p>
          )}
          <div className="mt-6 text-center">
              <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;