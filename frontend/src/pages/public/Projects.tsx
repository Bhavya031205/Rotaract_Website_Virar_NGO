import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'; // 🟢 Added Link
import { 
  MapPin, 
  Users, 
  ArrowRight, 
  Loader2, 
  Filter, 
  Layout 
} from 'lucide-react';
import PixelBlast from '../../components/animations/PixelBlast';

// 1. DEFINE BACKEND URL & HELPER
const API_BASE_URL = "http://localhost:5000"; 

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; 
  
  let cleanPath = imagePath.replace(/\\/g, '/');
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

  return `${API_BASE_URL}/${cleanPath}`;
};

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  location: string;
  beneficiaries: string;
  image: string;
}

// 2. SUB-COMPONENT: Project Card
const ProjectCard = ({ project, index }: { project: Project, index: number }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-slate-800 ${
        index % 2 === 1 ? 'md:flex-row-reverse' : ''
      }`}
    >
      
      {/* IMAGE SIDE */}
      <div className="md:w-1/2 relative overflow-hidden h-72 md:h-auto">
        {project.image && !imgError ? (
          <div className="h-full w-full overflow-hidden">
            <img 
              src={getImageUrl(project.image) || ''} 
              alt={project.title} 
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
              onError={() => setImgError(true)} 
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-slate-800 text-blue-200 dark:text-slate-600 absolute top-0 left-0">
             <Layout size={64} className="opacity-50" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 md:opacity-30 transition-opacity"></div>

        <div className="absolute top-6 left-6">
          <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg text-white backdrop-blur-md
            ${project.status === 'Completed' ? 'bg-green-500/90' : 
              project.status === 'Planned' ? 'bg-yellow-500/90' : 'bg-blue-600/90'}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* CONTENT SIDE */}
      <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center relative">
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
            <MapPin size={16} className="mr-2 text-red-500" /> 
            {project.location || "Location N/A"}
          </div>
          <div className="flex items-center text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
            <Users size={16} className="mr-2 text-blue-500" /> 
            {project.beneficiaries || "Beneficiaries N/A"}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-lg mb-8 line-clamp-4 font-light">
          {project.description}
        </p>
        
        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800">
          {/* 🟢 CHANGED TO LINK */}
          <Link 
            to={`/projects/${project.id}`} 
            className="text-blue-700 dark:text-blue-400 font-bold hover:text-blue-900 dark:hover:text-blue-300 transition flex items-center group/btn"
          >
            View Full Details 
            <ArrowRight size={18} className="ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

    </motion.div>
  );
};

// 3. MAIN COMPONENT
const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (filter === 'ALL') return true;
    return project.status.toUpperCase() === filter;
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Loading projects...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
      {/* 🚀 BOX CARD HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-[450px] w-full flex flex-col items-center justify-center text-center overflow-hidden bg-black dark:bg-white rounded-3xl shadow-2xl isolate transition-colors duration-500">
          
          {/* 🟢 1. Animation Layer */}
          <div className="absolute inset-0 z-0">
            <PixelBlast
              variant="square"
              pixelSize={4}
              color="#284fe3" // Stays Blue in both modes
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
                Our Initiatives
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white dark:text-slate-900 mb-6 tracking-tight drop-shadow-2xl dark:drop-shadow-none">
                Our Projects
              </h1>
              <p className="text-xl text-slate-300 dark:text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                Driving real change through sustainable initiatives and community action.
              </p>
            </motion.div>
          </div>
          
          {/* 🟢 3. Bottom Card Fade */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 dark:from-white/90 to-transparent z-10 pointer-events-none transition-colors duration-500" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* FILTER TABS */}
        <div className="flex justify-center mb-16">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 inline-flex flex-wrap justify-center gap-1">
            {['ALL', 'ONGOING', 'COMPLETED', 'PLANNED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative ${
                  filter === status 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {status === 'ALL' ? 'All Projects' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* PROJECTS GRID */}
        <motion.div layout className="space-y-16">
          <AnimatePresence mode='popLayout'>
            {filteredProjects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800 shadow-sm"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="text-gray-400 dark:text-slate-500" size={32} />
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-lg">No {filter.toLowerCase()} projects found.</p>
                <button onClick={() => setFilter('ALL')} className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  View all projects
                </button>
              </motion.div>
            ) : (
              filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Projects;