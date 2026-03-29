// frontend/src/components/layout/SiteFooter.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Facebook, Instagram, Linkedin, ArrowRight, Heart, Mail, Code2, X
} from 'lucide-react';

const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-20 pb-10 overflow-hidden border-t border-slate-900">
        {/* Subtle Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full"></div>
        </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* COLUMN 1: Brand & About */}
          <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Heart className="text-white" size={20} fill="currentColor" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors">RotractClub</span>
            </Link>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Empowering communities and transforming lives through sustainable initiatives in healthcare, education, and community development. Join us in making a difference.
            </p>
            
            {/* CLUB SOCIAL LINKS */}
            <div className="flex space-x-4">
              <SocialIcon 
                icon={<Facebook size={20} />} 
                href="https://facebook.com/" 
                label="Facebook" 
                color="hover:bg-[#1877F2]" 
              />
              <SocialIcon 
                icon={<Instagram size={20} />} 
                href="https://instagram.com/" 
                label="Instagram" 
                color="hover:bg-[#E4405F]" 
              />
              <SocialIcon 
                icon={<Linkedin size={20} />} 
                href="https://www.linkedin.com/in/rotaract-virar" 
                label="LinkedIn" 
                color="hover:bg-[#0A66C2]" 
              />
            </div>
          </motion.div>

          {/* COLUMN 2: Quick Links */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 lg:pl-8">
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/about" label="About Us" />
              <FooterLink to="/projects" label="Our Projects" />
              <FooterLink to="/events" label="Events" />
              <FooterLink to="/blog" label="Latest News" />
            </ul>
          </motion.div>

           {/* COLUMN 3: Get Involved */}
           <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-6">Get Involved</h3>
            <ul className="space-y-3">
              <FooterLink to="/contact" label="Contact Us" />
              <FooterLink to="/become-member" label="Membership" />
              <FooterLink to="/donate" label="Ways to Give" />
              <FooterLink to="/faqs" label="FAQs" />
            </ul>
          </motion.div>

          {/* COLUMN 4: Newsletter & CTA */}
          <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-4">
            <h3 className="text-white font-bold text-lg mb-6">Stay Updated</h3>
            <p className="text-slate-400 mb-4 text-sm">Subscribe to our newsletter for the latest impact stories and events.</p>
            
            <form className="mb-6 relative" onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="email" 
                    placeholder="Your email address"
                    className="w-full bg-slate-900 border border-slate-800 rounded-full py-3 pl-6 pr-14 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button 
                    type="submit"
                    className="absolute right-1.5 top-1.5 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 transition-transform hover:scale-105 active:scale-95"
                >
                    <ArrowRight size={18} />
                </button>
            </form>

            {/* Big Donate CTA Card */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h4 className="text-white font-bold mb-2 relative z-10">Make an Immediate Impact</h4>
                <p className="text-sm text-slate-400 mb-4 relative z-10">Your contribution directly supports our on-ground initiatives.</p>
                <Link to="/donate">
                  <button className="w-full py-3 bg-yellow-500 text-slate-900 font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/20 relative z-10 flex items-center justify-center gap-2 transform group-hover:-translate-y-0.5">
                    <Heart size={18} fill="currentColor" /> Donate Now
                  </button>
                </Link>
            </div>
          </motion.div>
        </div>

        {/* 🟢 BOTTOM BAR WITH COMBINED DEVELOPER CREDITS */}
        <motion.div 
          variants={itemVariants} 
          className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
        >
          {/* Copyright */}
          <div className="text-slate-500 order-2 md:order-1">
            <p>© {currentYear} RotractClub. All rights reserved.</p>
          </div>

          {/* 🟢 NEW: Centered Developer Credits (Clickable) */}
          <div className="order-1 md:order-2">
             <DeveloperTooltip />
          </div>

          {/* Legal Links */}
          <div className="flex space-x-6 order-3 md:order-3 text-slate-500">
            <Link to="/privacy" className="hover:text-blue-400 transition-colors text-xs">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-400 transition-colors text-xs">Terms of Service</Link>
          </div>
        </motion.div>
      </motion.div>
    </footer> 
  );
};

// --- HELPER COMPONENTS ---

// 1. Social Icon Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SocialIcon = ({ icon, href, label, color }: any) => (
  <a 
    href={href} 
    aria-label={label}
    target="_blank" 
    rel="noopener noreferrer"
    className={`w-10 h-10 bg-slate-900 flex items-center justify-center rounded-full text-slate-400 transition-all duration-300 hover:text-white hover:-translate-y-1 ${color} border border-slate-800`}
  >
    {icon}
  </a>
);

// 2. Footer Link Helper
const FooterLink = ({ to, label }: { to: string, label: string }) => (
  <li>
    <Link 
      to={to} 
      className="inline-block text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300"
    >
      {label}
    </Link>
  </li>
);

// 3. 🟢 New Developer Tooltip Component
const DeveloperTooltip = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Toggle on click for mobile/desktop
    const toggleOpen = () => setIsOpen(!isOpen);
    
    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* The Trigger Text */}
            <div 
                onClick={toggleOpen}
                className="flex items-center gap-1.5 text-slate-400 cursor-pointer group select-none"
            >
                <span>Made & managed by</span>
                <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors border-b border-transparent group-hover:border-blue-400/50">
                    Dheraya & Bhavya
                </span>
            </div>

            {/* The Popup Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-md bg-slate-900/95"
                    >
                        {/* Arrow Pointer */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-slate-700 transform rotate-45"></div>

                        {/* Header */}
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Code2 size={14} /> Developers
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white md:hidden">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Developer 1 */}
                        <div className="mb-3">
                            <p className="text-sm font-semibold text-white mb-1">Dheraya Kamdar</p>
                            <div className="flex gap-2">
                                <a 
                                    href="https://linkedin.com/in/dheraya-kamdar-26-" 
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-[#0A66C2] text-slate-300 hover:text-white text-xs py-1.5 rounded transition-colors"
                                >
                                    <Linkedin size={12} /> LinkedIn
                                </a>
                                <a 
                                    href="mailto:dherayakamdar26@gmail.com" 
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-yellow-600 text-slate-300 hover:text-white text-xs py-1.5 rounded transition-colors"
                                >
                                    <Mail size={12} /> Email
                                </a>
                            </div>
                        </div>

                        {/* Developer 2 */}
                        <div>
                            <p className="text-sm font-semibold text-white mb-1">Bhavya Damani</p>
                            <div className="flex gap-2">
                                <a 
                                    href="https://linkedin.com/in/bhavya-dahttps://www.linkedin.com/in/bhavya-damani-1009b6277/mani-027184253" 
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-[#0A66C2] text-slate-300 hover:text-white text-xs py-1.5 rounded transition-colors"
                                >
                                    <Linkedin size={12} /> LinkedIn
                                </a>
                                <a 
                                    href="mailto:bhavyadamani1@gmail.com" 
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-yellow-600 text-slate-300 hover:text-white text-xs py-1.5 rounded transition-colors"
                                >
                                    <Mail size={12} /> Email
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SiteFooter;