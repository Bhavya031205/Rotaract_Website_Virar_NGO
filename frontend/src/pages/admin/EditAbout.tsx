import { useEffect, useState } from 'react';
import { getPageContent, updatePageContent, type AboutPageData } from '../../api/content';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  LayoutTemplate, 
  Target, 
  Eye, 
  History,
  Type,
  FileText
} from 'lucide-react';

const EditAbout = () => {
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Fetch current data on load
  useEffect(() => {
    const loadData = async () => {
      try {
        const content = await getPageContent('about');
        setData(content);
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to load data.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // 2. Handle Text Input Changes
  const handleChange = (section: keyof AboutPageData, key: string, value: string) => {
    if (!data) return;
    
    // Check if the section is an object (like 'hero', 'mission')
    if (typeof data[section] === 'object' && !Array.isArray(data[section])) {
      setData({
        ...data,
        [section]: {
          ...data[section] as any, 
          [key]: value
        }
      });
    } else if (typeof data[section] === 'string') {
      // Direct string update (like 'history')
      setData({ ...data, [section]: value });
    }
  };

  // 3. Save Changes to Backend
  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    try {
      await updatePageContent('about', data);
      setMessage({ type: 'success', text: 'Changes published successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  // Loading State
  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading content...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
      <p>Error loading data. Please try refreshing.</p>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8 pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit About Us</h1>
          <p className="text-gray-500 mt-1">Manage your organization's mission, vision, and story.</p>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 backdrop-blur-sm ${
              message.type === 'success' 
                ? 'bg-green-50/90 border-green-200 text-green-800' 
                : 'bg-red-50/90 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        
        {/* HERO SECTION */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
              <LayoutTemplate size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Hero Section</h2>
          </div>
          
          <div className="p-6 grid gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Type size={16} className="text-blue-500" /> Main Title
              </label>
              <input 
                type="text" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none"
                placeholder="Enter the main headline..."
                value={data.hero.title}
                onChange={(e) => handleChange('hero', 'title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText size={16} className="text-blue-500" /> Subtitle
              </label>
              <textarea 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none resize-none"
                rows={2}
                placeholder="Enter the supporting text..."
                value={data.hero.subtitle}
                onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* STRATEGY GRID (Mission & Vision) */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* MISSION */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-b border-emerald-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                <Target size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Mission</h2>
            </div>
            <div className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                  value={data.mission.title}
                  onChange={(e) => handleChange('mission', 'title', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none min-h-[120px]"
                  value={data.mission.description}
                  onChange={(e) => handleChange('mission', 'description', e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* VISION */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 border-b border-violet-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm text-violet-600">
                <Eye size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Vision</h2>
            </div>
            <div className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all outline-none"
                  value={data.vision.title}
                  onChange={(e) => handleChange('vision', 'title', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all outline-none min-h-[120px]"
                  value={data.vision.description}
                  onChange={(e) => handleChange('vision', 'description', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* HISTORY SECTION */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-amber-600">
              <History size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">History & Story</h2>
          </div>
          <div className="p-6">
             <textarea 
               className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none leading-relaxed"
               rows={6}
               placeholder="Tell the story of how it all began..."
               value={data.history}
               onChange={(e) => setData({ ...data, history: e.target.value })}
             />
             <p className="text-xs text-gray-400 mt-2 text-right">Markdown formatting supported</p>
          </div>
        </motion.div>

        {/* FLOATING ACTION BAR */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-4xl px-4 z-40 pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 flex items-center justify-between pointer-events-auto">
            <span className="text-sm text-gray-500 font-medium ml-2">
              {saving ? 'Syncing changes...' : 'Unsaved changes are lost upon refresh.'}
            </span>
            <button 
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'
              }`}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Publishing...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

      </form>
    </motion.div>
  );
};

export default EditAbout;