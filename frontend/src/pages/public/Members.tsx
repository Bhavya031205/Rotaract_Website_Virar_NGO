import React, { useEffect, useRef, useState } from 'react';
import axios from '../../api/axios';
import { motion } from 'framer-motion';
import { 
  User, 
  Linkedin, 
  Mail, 
  Loader2
} from 'lucide-react';
import DotGrid from '../../components/animations/DotGrid'; 

// ==========================================
// 1. SPOTLIGHT CARD COMPONENT (Fixed for Dark Mode)
// ==========================================
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setOpacity(1);
  };

  const handleBlur = () => {
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // 🟢 FIX: Define CSS variable for spotlight color
      // Light Mode: Subtle Blue (0.15 opacity)
      // Dark Mode: Brighter/Stronger Blue (0.35 opacity) so it GLOWS
      className={`
        relative overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-800 
        bg-white dark:bg-slate-900 transition-colors duration-300 group 
        [--spotlight-color:rgba(59,130,246,0.15)] dark:[--spotlight-color:rgba(96,165,250,0.35)]
        ${className}
      `}
    >
      {/* Spotlight Gradient Layer */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10"
        style={{
          opacity,
          // 🟢 Use the CSS variable we defined above
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, var(--spotlight-color), transparent 40%)`,
        }}
      />
      
      {/* Content Container */}
      <div className="relative h-full z-20">
        {children}
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN MEMBERS PAGE
// ==========================================

interface Member {
  id: number;
  name: string;
  designation: string;
  bio: string;
  image: string;
  linkedin?: string;
  email?: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get('/members/public');
        setMembers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading team...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
      {/* 🚀 HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-[450px] w-full flex flex-col items-center justify-center text-center overflow-hidden bg-black dark:bg-white rounded-3xl shadow-2xl isolate transition-colors duration-500">
          
          <div className="absolute inset-0 z-0">
            <DotGrid
              dotSize={4}
              gap={20}
              baseColor="#64748b" 
              activeColor="#284fe3" 
              proximity={100}
              shockRadius={200}
              shockStrength={10}
            />
          </div>

          <div className="relative z-10 px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-white dark:text-slate-900 mb-6 tracking-tight drop-shadow-2xl dark:drop-shadow-none">
                Meet Our Team
              </h1>
              <p className="text-xl text-slate-300 dark:text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                The dedicated individuals working tirelessly behind the scenes to drive change and make a lasting impact.
              </p>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 dark:from-white/90 to-transparent z-10 pointer-events-none transition-colors duration-500" />
        </div>
      </div>

      {/* 🚀 MEMBERS GRID */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        
        {members.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No team members are currently listed.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {members.map((member) => (
              <motion.div 
                key={member.id} 
                variants={itemVariants}
                className="h-[450px] w-full" 
              >
                <SpotlightCard className="w-full h-full shadow-lg hover:shadow-2xl">
                  
                  {/* === Main Card Content (Static) === */}
                  <div className="absolute inset-0">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600">
                        <User size={64} className="opacity-50 mb-2" />
                        <span className="text-sm font-bold">No Image</span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    
                    {/* Bottom Info Section */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                      
                      {/* Left Side: Name & Designation */}
                      <div className="flex flex-col items-start gap-2">
                        <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">
                          {member.name}
                        </h3>
                        <div className="inline-block px-3 py-1 bg-blue-600/90 backdrop-blur-sm rounded-lg text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                          {member.designation}
                        </div>
                      </div>

                      {/* Right Side: Social Links (Only LinkedIn & Email) */}
                      <div className="flex gap-3">
                         {/* LinkedIn Link */}
                        <a 
                          href={member.linkedin || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 shadow-lg"
                          title="LinkedIn Profile"
                        >
                          <Linkedin size={18} />
                        </a>

                        {/* Email Link */}
                        <a 
                          href={`mailto:${member.email || "#"}`}
                          className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-red-500 hover:border-red-400 transition-all duration-300 shadow-lg"
                          title="Send Email"
                        >
                          <Mail size={18} />
                        </a>
                      </div>

                    </div>
                  </div>

                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Members;