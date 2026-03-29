import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPageContent, type AboutPageData } from '../../api/content';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, ArrowRight, Loader2 } from 'lucide-react';
import DotGrid from '../../components/animations/DotGrid'; // 👈 1. Import DotGrid

const About = () => {
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const content = await getPageContent('about');
        setData(content);
      } catch (error) {
        console.error('Failed to load About page content', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading our story...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-red-500">Unable to load content. Please try again later.</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
      {/* 🚀 HERO SECTION: DOT GRID (Inverted Box Card Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-[450px] w-full flex flex-col items-center justify-center text-center overflow-hidden bg-black dark:bg-white rounded-3xl shadow-2xl isolate transition-colors duration-500">
          
          {/* 🟢 1. Animation Layer */}
          <div className="absolute inset-0 z-0">
            <DotGrid
              dotSize={4}
              gap={20}
              baseColor="#64748b" // Visible on both Black & White
              activeColor="#284fe3" // Vibrant Blue interaction
              proximity={100}
              shockRadius={200}
              shockStrength={10}
            />
          </div>

          {/* 🟢 2. The Text Content */}
          <div className="relative z-10 px-4 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 dark:text-blue-600 text-sm font-semibold mb-6 backdrop-blur-md shadow-sm">
                About Our Organization
              </span>
              {/* Text Inverts: White in Light Mode, Slate-900 in Dark Mode */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-6 leading-tight text-white dark:text-slate-900 drop-shadow-xl dark:drop-shadow-none">
                {data.hero.title}
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-300 dark:text-slate-600 leading-relaxed font-light">
                {data.hero.subtitle}
              </p>
            </motion.div>
          </div>

          {/* 🟢 3. Bottom Card Fade */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 dark:from-white/90 to-transparent z-10 pointer-events-none transition-colors duration-500" />
        </div>
      </div>

      {/* 2. MISSION & VISION GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Mission Card */}
          <motion.div variants={itemVariants} className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-3xl"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Target size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{data.mission.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-lg">
              {data.mission.description}
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div variants={itemVariants} className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-3xl"></div>
              <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Eye size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{data.vision.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-lg">
              {data.vision.description}
            </p>
          </motion.div>

        </div>
      </motion.div>

      {/* 3. OUR STORY SECTION */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24 relative overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:text-center mb-16"
          >
            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-2">Our History</h2>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
              How We Started
            </p>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg mx-auto text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 leading-loose"
          >
            <p>{data.history}</p>
          </motion.div>
        </div>
      </div>

      {/* 5. CTA SECTION */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Want to make a difference?</h2>
            <p className="mt-4 text-blue-100 text-xl max-w-2xl">
              Join our team as a volunteer or become a member today. Every hand helps.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link 
              to="/become-member" 
              className="flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-gray-50 transition-all transform hover:-translate-y-0.5"
            >
              Join Us <ArrowRight size={18} />
            </Link>
            <Link 
              to="/donate" 
              className="flex items-center justify-center gap-2 bg-blue-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-blue-900 transition-all transform hover:-translate-y-0.5 border border-blue-700"
            >
              <Heart size={18} className="fill-current" /> Donate
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;