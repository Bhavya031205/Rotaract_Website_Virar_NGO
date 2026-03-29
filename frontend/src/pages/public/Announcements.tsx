import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Tag, 
  Bell, 
  Loader2, 
  AlertCircle 
} from 'lucide-react'; // 🟢 Removed 'Megaphone' to fix warning
import PixelBlast from '../../components/animations/PixelBlast';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const Announcements = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get('/announcements');
        setList(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Helper to determine styles based on category
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Urgent':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800',
          accent: 'bg-red-500'
        };
      case 'News':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800',
          accent: 'bg-emerald-500'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-700 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800',
          accent: 'bg-blue-500'
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading updates...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
      {/* 🚀 HERO SECTION: PIXEL BLAST (Inverted Box Card Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-[450px] w-full flex flex-col items-center justify-center text-center overflow-hidden bg-black dark:bg-white rounded-3xl shadow-2xl isolate transition-colors duration-500">
          
          {/* 🟢 1. Animation Layer */}
          <div className="absolute inset-0 z-0">
            <PixelBlast
              variant="square"
              pixelSize={4}
              color="#284fe3" // Matches your blue theme
              patternScale={2}
              patternDensity={1}
              pixelSizeJitter={0}
              enableRipples={true}
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid={false}
              speed={0.5}
              edgeFade={0.1}
              transparent={true} 
            />
          </div>

          {/* 🟢 2. The Text Content */}
          <div className="relative z-10 px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-300 dark:text-blue-600 text-sm font-bold mb-4 backdrop-blur-md uppercase tracking-widest shadow-sm">
                Latest Updates
              </span>
              {/* Text Inversion: White in Light Mode, Slate-900 in Dark Mode */}
              <h1 className="text-4xl md:text-6xl font-extrabold text-white dark:text-slate-900 mb-6 tracking-tight drop-shadow-2xl dark:drop-shadow-none leading-tight">
                News & Announcements
              </h1>
              <p className="text-xl text-slate-300 dark:text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                Stay updated with the latest happenings, urgent alerts, and stories from our NGO.
              </p>
            </motion.div>
          </div>
          
          {/* 🟢 3. Bottom Card Fade */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 dark:from-white/90 to-transparent z-10 pointer-events-none transition-colors duration-500" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        <AnimatePresence mode='wait'>
          {list.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-gray-400 dark:text-slate-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">All Caught Up!</h3>
              <p className="text-gray-500 dark:text-slate-400">No new announcements at the moment.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {list.map((item) => {
                const styles = getCategoryStyles(item.category);
                
                return (
                  <motion.div 
                    key={item.id} 
                    variants={itemVariants}
                    className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-800 relative"
                  >
                    {/* Colored Accent Line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.accent}`} />

                    <div className="p-6 sm:p-8 pl-8 sm:pl-10">
                      
                      {/* Meta Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                        <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
                          {item.category === 'Urgent' ? <AlertCircle size={14} /> : <Tag size={14} />}
                          {item.category}
                        </span>
                        
                        <div className="flex items-center text-gray-400 dark:text-slate-500 text-sm font-medium">
                          <Calendar size={16} className="mr-2" />
                          {new Date(item.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h2>
                      <div className="prose prose-blue dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                          {item.content}
                        </p>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Announcements;