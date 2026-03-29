import { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Search, X, Save, Loader2, 
  MessageSquareQuote, Newspaper, Handshake, 
  LayoutGrid, List, Filter, Image as ImageIcon,
  User, Upload, Edit3, Video, FileVideo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios"; 

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const AdminBlog = () => {
  // --- STATE MANAGEMENT ---
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form & Drawer State
  const [showDrawer, setShowDrawer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // We split media into:
  // 1. existing_images: String URLs (already on server)
  // 2. newFiles: File objects (waiting to be uploaded)
  const [formData, setFormData] = useState({
    title: "", excerpt: "", content: "", category_id: "", 
    existing_images: [] as string[], 
    author_name: "", author_role: "" 
  });
  
  const [newFiles, setNewFiles] = useState<File[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, postsRes] = await Promise.all([
        api.get("/blog/categories"),
        api.get("/blog/posts")
      ]);
      setCategories(catsRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  // 1. Open Drawer for Creating
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ 
      title: "", excerpt: "", content: "", category_id: "", 
      existing_images: [], author_name: "", author_role: "" 
    });
    setNewFiles([]);
    setShowDrawer(true);
  };

  // 2. Open Drawer for Editing
  const handleOpenEdit = (post: any) => {
    setIsEditing(true);
    setEditId(post.id);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category_id: post.category_id,
      existing_images: post.image_urls || [],
      author_name: post.author_name || "",
      author_role: post.author_role || ""
    });
    setNewFiles([]);
    setShowDrawer(true);
  };

  // 3. Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const totalCount = formData.existing_images.length + newFiles.length + selectedFiles.length;
      
      if (totalCount > 5) {
        alert("Maximum 5 media items allowed.");
        return;
      }
      setNewFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  // 4. Remove Media
  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existing_images: prev.existing_images.filter((_, i) => i !== index)
    }));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 5. Submit Form (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // We must use FormData for file uploads
    const data = new FormData();
    data.append("title", formData.title);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    data.append("category_id", formData.category_id);
    data.append("author_name", formData.author_name);
    data.append("author_role", formData.author_role);

    // Append Existing URLs
    formData.existing_images.forEach(url => {
      data.append("existing_images", url);
    });

    // Append New Files
    newFiles.forEach(file => {
      data.append("media", file);
    });

    try {
      if (isEditing && editId) {
        // UPDATE
        await api.put(`/blog/posts/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Story updated successfully!");
      } else {
        // CREATE
        await api.post("/blog/posts", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Story created successfully!");
      }
      
      setShowDrawer(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Operation failed. See console.");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this story?")) return;
    try {
      await api.delete(`/blog/posts/${id}`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  // --- HELPERS ---
  const getCategoryIcon = (name: string) => {
    if (name?.includes('Testimonial')) return <MessageSquareQuote size={14} />;
    if (name?.includes('Media')) return <Newspaper size={14} />;
    return <Handshake size={14} />;
  };

  const getCategoryColor = (name: string) => {
    if (name?.includes('Testimonial')) return "bg-blue-50 text-blue-700 border-blue-100";
    if (name?.includes('Media')) return "bg-purple-50 text-purple-700 border-purple-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg|mov)$/i);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Content Manager</h1>
          <p className="text-gray-500 mt-1">Curate your NGO's impact stories, news, and partnerships.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center min-w-[100px]">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
             <span className="text-2xl font-black text-blue-600">{posts.length}</span>
           </div>
           <button 
             onClick={handleOpenCreate}
             className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 transform hover:-translate-y-1 transition-all"
           >
             <Plus size={20} /> <span className="hidden sm:inline">New Story</span>
           </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center mb-8 sticky top-4 z-20 backdrop-blur-md bg-white/90">
        <div className="relative flex-1 max-w-md ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mr-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* CONTENT GRID */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        <AnimatePresence>
          {filteredPosts.map((post) => (
            <motion.div key={post.id} variants={itemVariants} layout className={`bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${viewMode === 'list' ? 'flex items-center p-2' : 'flex flex-col'}`}>
              
              {/* IMAGE / VIDEO SECTION */}
              <div className={viewMode === 'grid' ? "h-48 w-full relative overflow-hidden bg-gray-100" : "h-20 w-20 rounded-2xl relative overflow-hidden bg-gray-100 flex-shrink-0 ml-2"}>
                {post.image_urls && post.image_urls.length > 0 ? (
                  // Check if the first file is a video
                  isVideo(post.image_urls[0]) ? (
                      <video 
                        src={`http://localhost:5000${post.image_urls[0]}`} 
                        className="w-full h-full object-cover" 
                        muted 
                      />
                  ) : (
                      <img 
                        src={`http://localhost:5000${post.image_urls[0]}`} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={viewMode === 'grid' ? 40 : 20} />
                  </div>
                )}
                
                {/* GRID OVERLAY BUTTONS */}
                {viewMode === 'grid' && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button onClick={() => handleOpenEdit(post)} className="bg-white text-blue-600 p-2 rounded-full hover:scale-110 transition-transform shadow-lg" title="Edit">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="bg-white text-red-500 p-2 rounded-full hover:scale-110 transition-transform shadow-lg" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                )}
              </div>

              {/* TEXT CONTENT */}
              <div className={`flex-1 ${viewMode === 'grid' ? 'p-6' : 'px-6 py-2'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getCategoryColor(post.category_name)}`}>
                    {getCategoryIcon(post.category_name)} {post.category_name}
                  </span>
                  
                  {/* LIST MODE ACTIONS */}
                  {viewMode === 'list' && (
                    <div className="flex gap-2">
                         <button onClick={() => handleOpenEdit(post)} className="text-blue-400 hover:text-blue-600 transition p-1"><Edit3 size={16}/></button>
                         <button onClick={() => handleDelete(post.id)} className="text-gray-300 hover:text-red-500 transition p-1"><Trash2 size={16}/></button>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                
                {viewMode === 'grid' && (
                  <>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shadow-inner">
                        {post.author_name ? post.author_name.charAt(0) : <User size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{post.author_name || 'Admin'}</p>
                        <p className="text-[10px] text-gray-400 uppercase truncate">{post.author_role || 'Editor'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* DRAWER FORM */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-100"
            >
              <div className="p-8 pb-32">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">{isEditing ? "Edit Story" : "Draft New Story"}</h2>
                  <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category_id: cat.id })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            Number(formData.category_id) === cat.id 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-100 hover:border-blue-100 text-gray-500'
                          }`}
                        >
                          {getCategoryIcon(cat.name)}
                          <span className="text-xs font-bold">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Story Title</label>
                    <input required type="text" className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition font-bold text-lg" placeholder="Enter title..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>

                  {/* Author */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User size={14} /> Author Info
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" className="w-full p-3 rounded-xl bg-white border border-gray-200 outline-none text-sm" placeholder="Name" value={formData.author_name} onChange={e => setFormData({...formData, author_name: e.target.value})} />
                      <input type="text" className="w-full p-3 rounded-xl bg-white border border-gray-200 outline-none text-sm" placeholder="Role" value={formData.author_role} onChange={e => setFormData({...formData, author_role: e.target.value})} />
                    </div>
                  </div>

                  {/* === MEDIA UPLOAD SECTION === */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Gallery Media (Max 5)
                      <span className="block text-xs font-normal text-gray-400">Supported: Images & Videos (MP4/WebM)</span>
                    </label>
                    
                    <div className="space-y-3">
                       {/* 1. Existing Media (From Server) */}
                       {formData.existing_images.map((url, i) => (
                          <div key={`exist-${i}`} className="flex items-center gap-3 bg-blue-50 p-2 rounded-lg border border-blue-100">
                             <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex items-center justify-center">
                               {isVideo(url) ? <Video size={20} className="text-blue-500"/> : <img src={`http://localhost:5000${url}`} className="w-full h-full object-cover"/>}
                             </div>
                             <span className="text-xs text-blue-800 font-mono truncate flex-1">...{url.split('/').pop()}</span>
                             <button type="button" onClick={() => removeExistingImage(i)} className="text-red-400 hover:text-red-600 p-2"><X size={16}/></button>
                          </div>
                       ))}

                       {/* 2. New Uploads (Files) */}
                       {newFiles.map((file, i) => (
                          <div key={`new-${i}`} className="flex items-center gap-3 bg-green-50 p-2 rounded-lg border border-green-100">
                             <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex items-center justify-center relative">
                               {file.type.startsWith('video') ? <FileVideo size={20} className="text-green-600"/> : <img src={URL.createObjectURL(file)} className="w-full h-full object-cover"/>}
                             </div>
                             <div className="flex-1 overflow-hidden">
                               <p className="text-xs text-green-800 font-bold truncate">{file.name}</p>
                               <p className="text-[10px] text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                             </div>
                             <button type="button" onClick={() => removeNewFile(i)} className="text-red-400 hover:text-red-600 p-2"><X size={16}/></button>
                          </div>
                       ))}

                       {/* 3. Upload Box */}
                       {(formData.existing_images.length + newFiles.length) < 5 && (
                          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group">
                             <Upload className="text-gray-400 group-hover:text-blue-500 mb-2" />
                             <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600">Click to upload</p>
                             <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Short Excerpt</label>
                    <textarea required className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none" rows={2} placeholder="Brief summary..." value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}></textarea>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Story</label>
                    <textarea required className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none h-40" placeholder="Write full content..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
                  </div>

                  {/* Actions */}
                  <div className="fixed bottom-0 right-0 w-full md:w-[600px] bg-white p-6 border-t border-gray-100 flex justify-end gap-3 z-50">
                    <button type="button" onClick={() => setShowDrawer(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition flex items-center gap-2">
                      <Save size={20} /> {isEditing ? "Update Story" : "Publish"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminBlog;