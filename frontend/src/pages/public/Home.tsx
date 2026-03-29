import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPageContent, type HomePageData } from '../../api/content';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Loader2, Activity, Layers, ArrowUpRight } from 'lucide-react';
import { VantaGlobe } from '../../components/3d/VantaGlobe';

const Home = () => {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const content = await getPageContent('home');
        setData(content);
      } catch (error) {
        console.error('Failed to load Home page content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading impact...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-red-500">Unable to load content.</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-white dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <div className="relative min-h-[85vh] flex items-center overflow-hidden">
        
        {/* === ANIMATION LAYER (Background) === */}
        <VantaGlobe />
        
        {/* === CONTENT LAYER (Split Layout) === */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* LEFT COLUMN: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left" // 👈 Moved text to Left
            >
              {/* TITLE: Always Dark Blue (to contrast with White Globe in both modes) */}
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-sm text-blue-950 dark:text-blue-900">
                {data.hero.title}
              </h1>
              
              {/* SUBTITLE: Slightly smaller font as requested */}
              <p className="mt-4 text-lg md:text-xl text-slate-700 dark:text-slate-800 font-medium leading-relaxed max-w-lg">
                {data.hero.subtitle}
              </p>
              
              {/* BUTTONS: Aligned Left */}
              <div className="mt-8 flex flex-wrap gap-4 pointer-events-auto">
                <Link 
                  to={data.hero.ctaLink} 
                  className="px-7 py-3.5 bg-blue-600 text-white text-base font-bold rounded-full hover:bg-blue-700 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                >
                  {data.hero.ctaText} <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/become-member" 
                  className="px-7 py-3.5 bg-white/80 text-blue-900 border-2 border-blue-600 text-base font-bold rounded-full hover:bg-blue-50 hover:scale-105 transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm"
                >
                  Become a Member <Heart size={18} className="fill-current text-blue-600" />
                </Link>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Empty to show the Globe Animation */}
            <div className="hidden md:block h-full min-h-[500px]">
               {/* The Vanta Globe is visible here in the background */}
            </div>

          </div>
        </div>
      </div>

      {/* 2. STATS SECTION */}
      <div className="bg-slate-900 py-20 relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Impact in Numbers</h2>
            <div className="w-20 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
          </motion.div>

          <motion.dl 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {data.stats.map((stat, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300"
              >
                <div className="mb-4 p-3 bg-blue-500/20 rounded-full">
                  {stat.image ? (
                    <img src={stat.image} alt={stat.label} className="h-8 w-8 object-contain filter brightness-0 invert" />
                  ) : (
                    <Activity className="h-8 w-8 text-blue-400" />
                  )}
                </div>
                <dd className="text-5xl font-extrabold text-white mb-2 tracking-tight">
                  {stat.value}
                </dd>
                <dt className="text-sm font-medium text-blue-200 uppercase tracking-widest">
                  {stat.label}
                </dt>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>

      {/* 3. INITIATIVES SECTION */}
      <div className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm bg-blue-100 dark:bg-blue-900/30 py-1 px-3 rounded-full">
              What We Do
            </span>
            <h2 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
              Our Key Initiatives
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Driving sustainable change through focused projects and community engagement.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {data.features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-800 hover:-translate-y-2"
              >
                <div className="h-56 w-full bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
                  {feature.image ? (
                    <img 
                      src={feature.image} 
                      alt={feature.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center">
                        <Layers className="text-blue-300 dark:text-slate-600 h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-1 mb-6">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Home;