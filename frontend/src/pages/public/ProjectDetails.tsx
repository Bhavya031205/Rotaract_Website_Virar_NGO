import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users, Calendar, Layout, CheckCircle, Clock, AlertCircle } from "lucide-react";
import api from "../../api/axios";

// --- HELPERS ---
const API_BASE_URL = "http://localhost:5000"; 

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; 
  let cleanPath = imagePath.replace(/\\/g, '/');
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
  return `${API_BASE_URL}/${cleanPath}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError("Failed to load the project details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="animate-pulse text-blue-600 font-bold">Loading Project...</div>
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 gap-4">
      <p className="text-red-500">{error || "Project not found"}</p>
      <Link to="/projects" className="text-blue-600 hover:underline">Back to Projects</Link>
    </div>
  );

  const fullImageUrl = getImageUrl(project.image);
  
  // Status Colors Helper
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-500 text-white';
      case 'PLANNED': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'PLANNED': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-slate-900 overflow-hidden">
        {fullImageUrl ? (
          <img 
            src={fullImageUrl} 
            alt={project.title} 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center opacity-60">
             <Layout size={100} className="text-slate-700" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-slate-950 via-transparent to-black/40"></div>

        {/* Back Button */}
        <Link to="/projects" className="absolute top-24 left-4 md:left-8 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all z-50">
          <ArrowLeft size={24} />
        </Link>

        {/* Title Block */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-6xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
           >
             <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-lg ${getStatusColor(project.status)}`}>
               {getStatusIcon(project.status)}
               {project.status}
             </div>
             
             <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-xl mb-6 leading-tight">
               {project.title}
             </h1>

             {/* Quick Stats Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg"><MapPin size={18} /></div>
                  <div>
                    <p className="text-xs opacity-70 uppercase font-bold">Location</p>
                    <p className="font-semibold text-sm truncate">{project.location || "N/A"}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg"><Users size={18} /></div>
                  <div>
                    <p className="text-xs opacity-70 uppercase font-bold">Impact</p>
                    <p className="font-semibold text-sm truncate">{project.beneficiaries || "N/A"}</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg"><Calendar size={18} /></div>
                  <div>
                    <p className="text-xs opacity-70 uppercase font-bold">Date</p>
                    <p className="font-semibold text-sm truncate">{formatDate(project.start_date)}</p>
                  </div>
                </div>
             </div>
           </motion.div>
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <article className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 min-h-[400px]">
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
            About this Initiative
          </h2>
          
          <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
             <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
               {project.description}
             </p>
          </div>

          {/* Footer of card */}
          {project.end_date && (
             <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-500 text-sm">
                <CheckCircle size={16} className="text-green-500" />
                Project completed on <span className="font-bold text-slate-900 dark:text-white">{formatDate(project.end_date)}</span>
             </div>
          )}
        </div>
      </article>

    </div>
  );
};

export default ProjectDetails;