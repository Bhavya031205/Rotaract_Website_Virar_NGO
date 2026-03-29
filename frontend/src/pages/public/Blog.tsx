import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 🟢 Added Link Import
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  MessageSquareQuote, Newspaper, Handshake, Loader2, 
  ExternalLink, Quote, Sparkles, ArrowUpRight, Play 
} from "lucide-react";
import api from "../../api/axios";
import { VantaGlobe } from '../../components/3d/VantaGlobe';

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:5000"; 

// --- HELPERS ---
const isVideo = (url: string) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)$/i);
};

const getMediaUrl = (path: string) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
};

// ==========================================
// 1. ANIMATION VARIANTS
// ==========================================
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50 } 
  }
};

// ==========================================
// 2. TESTIMONIAL CARD
// ==========================================
const TestimonialCard = ({ post }: { post: any }) => {
  const avatarUrl = post.image_urls && post.image_urls.length > 0 
    ? getMediaUrl(post.image_urls[0]) 
    : null;

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700 hover:shadow-2xl hover:border-blue-200 transition-all group overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-50 group-hover:bg-blue-200 transition-colors"></div>
      
      <Quote className="absolute top-6 right-6 text-blue-100 dark:text-slate-700 group-hover:text-blue-200 transition-colors rotate-180" size={48} />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg overflow-hidden">
          {avatarUrl ? (
             <img src={avatarUrl} alt="Author" className="w-full h-full rounded-full object-cover bg-white" />
          ) : (
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl">
              {post.author_name ? post.author_name.charAt(0) : 'U'}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{post.author_name}</h3>
          <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold uppercase tracking-wider">
            {post.author_role}
          </p>
        </div>
      </div>

      <p className="text-gray-600 dark:text-slate-300 italic leading-relaxed text-lg mb-4 relative z-10">
        "{post.excerpt || post.content}"
      </p>
    </motion.div>
  );
};

// ==========================================
// 3. MEDIA CARD (NOW CLICKABLE)
// ==========================================
const MediaCard = ({ post }: { post: any }) => {
  const mediaPath = post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null;
  const fullMediaUrl = getMediaUrl(mediaPath);
  const isVideoFile = isVideo(mediaPath || "");

  // 🟢 WRAPPED IN LINK TO SINGLE POST PAGE
  return (
    <Link to={`/blog/${post.id}`} className="block h-full">
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl cursor-pointer bg-slate-900"
      >
        <div className="absolute inset-0 bg-gray-900">
          {fullMediaUrl ? (
            isVideoFile ? (
              <video 
                src={fullMediaUrl} 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-all duration-700 ease-out"
              />
            ) : (
              <img 
                src={fullMediaUrl} 
                alt={post.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700 ease-out" 
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">No Media</div>
          )}
        </div>

        {/* Video Indicator */}
        {isVideoFile && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-full">
              <Play size={16} fill="white" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>

        <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Newspaper size={14} /> Press Feature
          </div>
          <h3 className="text-white text-2xl font-bold leading-tight mb-3 drop-shadow-md">
            {post.title}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-2 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
            Read Article <ArrowUpRight size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ==========================================
// 4. COLLABORATION CARD (NOW CLICKABLE)
// ==========================================
const CollaborationCard = ({ post }: { post: any }) => {
  const mediaPath = post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null;
  const fullMediaUrl = getMediaUrl(mediaPath);
  const isVideoFile = isVideo(mediaPath || "");

  // 🟢 WRAPPED IN LINK TO SINGLE POST PAGE
  return (
    <Link to={`/blog/${post.id}`} className="block">
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row group"
      >
        <div className="md:w-5/12 relative overflow-hidden h-64 md:h-auto bg-gray-100 dark:bg-slate-800">
          <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
          {fullMediaUrl ? (
             isVideoFile ? (
               <video src={fullMediaUrl} autoPlay muted loop className="w-full h-full object-cover" />
             ) : (
               <img src={fullMediaUrl} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
             )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Handshake size={40} />
            </div>
          )}
        </div>

        <div className="p-8 md:w-7/12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-purple-100 dark:border-purple-800">
              Official Partner
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-6">
            {post.excerpt}
          </p>
          
          <div className="self-start px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold flex items-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-100 transition-colors shadow-lg hover:shadow-blue-500/30">
            View Project Details <ExternalLink size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
const Blog = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('testimonials');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, postRes] = await Promise.all([
          api.get("/blog/categories"),
          api.get("/blog/posts")
        ]);
        setCategories(catRes.data);
        setPosts(postRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = posts.filter(p => {
    const currentCat = categories.find(c => c.slug === activeTab);
    return currentCat && p.category_id === currentCat.id;
  });

  const tabs = [
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote size={18} /> },
    { id: 'media', label: 'Media Coverage', icon: <Newspaper size={18} /> },
    { id: 'collaborations', label: 'Collaborations', icon: <Handshake size={18} /> },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-400 font-medium animate-pulse">Loading Stories...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[500px] w-full bg-white flex items-center overflow-hidden rounded-b-3xl shadow-xl">
          <VantaGlobe />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-left pointer-events-auto"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold mb-6 backdrop-blur-md">
                  <Sparkles size={16} className="text-yellow-500" /> Our Impact Journey
                </span>
                
                <h1 className="text-5xl md:text-7xl font-black text-blue-950 mb-6 tracking-tight leading-tight drop-shadow-lg">
                  Stories That <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Inspire</span>
                </h1>
                
                <p className="text-slate-600 text-xl max-w-lg leading-relaxed font-light">
                  Explore the voices of our community, our highlights in the press, and the partnerships driving real change.
                </p>
              </motion.div>

              <div className="hidden md:block h-full min-h-[400px]"></div>
            </div>
          </div>
      </div>

      {/* 2. FLOATING TABS */}
      <div className="sticky top-4 z-40 px-4 mt-[-3rem]">
        <div className="max-w-3xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-full shadow-2xl p-2 border border-white/50 dark:border-slate-700 ring-1 ring-black/5 flex justify-between">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-bold transition-colors z-10 ${
                  isActive ? 'text-white' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-20 min-h-[600px]">
        
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
          >
            {activeTab === 'testimonials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => <TestimonialCard key={post.id} post={post} />)}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => <MediaCard key={post.id} post={post} />)}
              </div>
            )}

            {activeTab === 'collaborations' && (
              <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                {filteredPosts.map(post => <CollaborationCard key={post.id} post={post} />)}
              </div>
            )}

            {filteredPosts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-slate-500">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Coming Soon</h3>
                <p className="text-gray-500 dark:text-slate-400 max-w-md mt-2">
                  We haven't posted any {activeTab.replace('-', ' ')} stories yet. Check back soon!
                </p>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Blog;