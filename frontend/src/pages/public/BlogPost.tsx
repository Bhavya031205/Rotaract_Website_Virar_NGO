import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Clock, Share2, Play } from "lucide-react";
import api from "../../api/axios";

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:5000"; 

// --- HELPERS ---
const getMediaUrl = (path: string) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
};

const isVideo = (url: string) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)$/i);
};

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/blog/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        setError("Failed to load the story.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="animate-pulse text-blue-600 font-bold">Loading Story...</div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 gap-4">
      <p className="text-red-500">{error || "Story not found"}</p>
      <Link to="/blog" className="text-blue-600 hover:underline">Back to Blog</Link>
    </div>
  );

  const mediaPath = post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null;
  const fullMediaUrl = getMediaUrl(mediaPath);
  const isVideoFile = isVideo(mediaPath || "");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans pb-20">
      {/* HERO SECTION */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-slate-900 overflow-hidden">
        {fullMediaUrl ? (
          isVideoFile ? (
            <video 
              src={fullMediaUrl} 
              className="w-full h-full object-cover opacity-80"
              autoPlay muted loop playsInline
            />
          ) : (
            <img 
              src={fullMediaUrl} 
              alt={post.title} 
              className="w-full h-full object-cover opacity-80"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900" />
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-slate-950 via-transparent to-black/30"></div>

        {/* Back Button */}
        <Link to="/blog" className="absolute top-24 left-4 md:left-8 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all z-50">
          <ArrowLeft size={24} />
        </Link>

        {/* Title & Info */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-5xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
               {post.category_name || "Update"}
             </span>
             <h1 className="text-3xl md:text-5xl md:leading-tight font-black text-white drop-shadow-lg mb-6">
               {post.title}
             </h1>
             
             <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-medium">
               <div className="flex items-center gap-2">
                 <User size={16} className="text-blue-400" />
                 {post.author_name} <span className="text-white/50">({post.author_role})</span>
               </div>
               <div className="flex items-center gap-2">
                 <Calendar size={16} className="text-blue-400" />
                 {new Date(post.created_at).toLocaleDateString()}
               </div>
               <div className="flex items-center gap-2">
                 <Clock size={16} className="text-blue-400" />
                 {Math.max(1, Math.ceil(post.content.length / 500))} min read
               </div>
             </div>
           </motion.div>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <article className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10">
          
          <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
             <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
               {post.content}
             </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
             <div className="text-slate-500 text-sm">
               Posted in <span className="font-bold text-slate-900 dark:text-white">{post.category_name}</span>
             </div>
          </div>

        </div>
      </article>
    </div>
  );
};

export default BlogPost;