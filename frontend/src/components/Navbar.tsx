import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, User, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import FlyoutLink from './FlyoutLink';
import RotatingText from './animations/RotatingText'; // 👈 1. Import RotatingText

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<string | null>(null);

  // Robust Role Check
  const normalizedRole = (user?.role || "").toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  // 🌍 DEFINING THE MENU STRUCTURE
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { 
      name: 'Get Involved', 
      path: '#',
      subLinks: [
        { name: 'Become a Member', path: '/become-member' },
        { name: 'Our Team', path: '/members' },
        { name: 'Contact', path: '/contact' },
      ]
    },
    { 
      name: 'Our Causes', 
      path: '/projects',
      subLinks: [
        { name: 'All Projects', path: '/projects' },
        { name: 'Upcoming Events', path: '/events' },
        { name: 'Donations', path: '/donate' },
      ]
    },
    { name: 'News', path: '/announcements' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 font-sans ${
        scrolled 
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-md border-b border-gray-100 dark:border-slate-800 py-2' 
          : 'bg-white dark:bg-slate-950 py-4 border-b border-gray-100 dark:border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* === LOGO (UPDATED WITH ANIMATION) === */}
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
             <img 
               src="/ngologo.png" 
               alt="NGO Logo" 
               className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
             />
             <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
               Rotaract
               {/* 🟢 ANIMATED TEXT HERE */}
               <RotatingText
                 texts={['Club', 'Virar']}
                 mainClassName="text-blue-600 overflow-hidden py-0.5 justify-center rounded-lg"
                 staggerFrom={"last"}
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "-120%" }}
                 staggerDuration={0.025}
                 splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                 transition={{ type: "spring", damping: 30, stiffness: 400 }}
                 rotationInterval={3000}
               />
             </span>
          </Link>

          {/* === DESKTOP MEGA MENU === */}
          <div className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => (
              item.subLinks ? (
                <FlyoutLink 
                  key={item.name} 
                  label={item.name} 
                  subLinks={item.subLinks} 
                />
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path 
                    ? 'text-blue-600 dark:text-blue-400 font-bold' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Donate Button */}
            <Link 
              to="/donate" 
              className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 dark:bg-yellow-500 dark:text-black px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Donate
            </Link>
          </div>

          {/* === RIGHT SIDE ACTIONS === */}
          <div className="hidden lg:flex items-center space-x-4 pl-6 border-l border-gray-200 dark:border-gray-700 ml-2">
            <ThemeToggle />

            {!token ? (
              <Link 
                to="/login" 
                className="group flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-lg font-bold text-sm"
              >
                Login
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link to="/admin" className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-700 transition-all shadow-lg">
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/member" className="flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-100 transition">
                    <User size={16} />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>

          {/* === MOBILE TOGGLE === */}
          <div className="flex items-center gap-4 lg:hidden">
            <ThemeToggle />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 focus:outline-none p-2">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* === MOBILE MENU === */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 py-4 shadow-2xl h-screen overflow-y-auto pb-24 absolute w-full left-0 top-16 z-40">
          <div className="px-4 space-y-2 pt-2">
            {menuItems.map((item) => (
              <div key={item.name} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                {item.subLinks ? (
                  <div>
                    <button 
                      onClick={() => setMobileSubMenuOpen(mobileSubMenuOpen === item.name ? null : item.name)}
                      className="w-full flex justify-between items-center px-5 py-4 text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      {item.name}
                      <ChevronDown size={16} className={`transition-transform ${mobileSubMenuOpen === item.name ? "rotate-180" : ""}`} />
                    </button>
                    
                    {/* Mobile Submenu Accordion */}
                    {mobileSubMenuOpen === item.name && (
                      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl mb-2 mx-2">
                        {item.subLinks.map(sub => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            onClick={closeMenu}
                            className="block px-8 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={closeMenu}
                    className="block px-5 py-4 rounded-xl text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Auth Buttons Mobile */}
            <div className="my-6 pt-2 space-y-3 px-2">
               <Link to="/donate" onClick={closeMenu} className="block w-full text-center px-4 py-3 rounded-xl font-bold bg-yellow-400 text-yellow-900 shadow-md">
                 Donate Now
               </Link>
               
               {!token ? (
                 <Link to="/login" onClick={closeMenu} className="block w-full text-center px-4 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-md">
                   Login
                 </Link>
               ) : (
                 <button onClick={handleLogout} className="block w-full text-center px-4 py-3 rounded-xl font-bold text-red-600 border border-red-200 bg-red-50">
                   Logout
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;