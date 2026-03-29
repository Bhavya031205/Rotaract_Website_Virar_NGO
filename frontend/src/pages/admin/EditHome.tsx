
import { useEffect, useState, useRef } from 'react';
import { getPageContent, updatePageContent, type HomePageData } from '../../api/content';
import axios from '../../api/axios'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Loader2, AlertCircle, CheckCircle2, Layout, BarChart3, CreditCard,
  ImageIcon, Type, Link as LinkIcon, Upload, Trash2
} from 'lucide-react';

// ==========================================
// 🟢 HELPER: Smart Image Field (Fixed UI)
// ==========================================
const ImageField = ({ 
  label, 
  value, 
  onChange, 
  aspectRatio = "video" 
}: { 
  label?: string, 
  value: string | undefined, 
  onChange: (url: string) => void,
  aspectRatio?: "video" | "square"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset error state when value changes
  useEffect(() => { setImgError(false); }, [value]);

  const getDisplayImage = () => {
    // 1. If empty or explicitly placeholder, show clean placeholder
    if (!value || value.includes('via.placeholder') || value.trim() === '') {
      return `https://placehold.co/600x400/f1f5f9/94a3b8?text=${encodeURIComponent(label || 'Upload Image')}`; 
    }
    // 2. If image failed to load previously
    if (imgError) {
      return "https://placehold.co/600x400/fee2e2/ef4444?text=Image+Error";
    }
    // 3. Handle relative paths from backend
    if (value.startsWith('/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      return `${baseUrl}${value}`;
    }
    return value;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/upload', formData);
      const url = res.data.url; // Backend returns relative path usually
      onChange(url);
      setImgError(false);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Check server connection.");
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const hasValidImage = value && !value.includes('via.placeholder') && value.trim() !== '';

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <ImageIcon size={14} className="text-blue-500" /> {label}
          </label>
        </div>
      )}
      
      <div 
        className={`relative group overflow-hidden rounded-xl border-2 border-dashed transition-all 
        ${hasValidImage ? 'border-gray-200 bg-white' : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50'} 
        ${aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'}`}
      >
        {/* IMAGE PREVIEW */}
        <img 
          src={getDisplayImage()} 
          alt="Preview" 
          className={`w-full h-full object-cover transition-opacity duration-300 ${uploading ? 'opacity-50' : 'opacity-100'}`}
          onError={() => setImgError(true)}
        />

        {/* LOADING STATE */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="text-blue-600 animate-spin" size={32} />
          </div>
        )}

        {/* HOVER OVERLAY (UPLOAD TRIGGER) */}
        {!uploading && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all cursor-pointer flex flex-col items-center justify-center z-10"
          >
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-200 flex flex-col items-center text-white">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mb-2">
                <Upload size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Change Image</span>
            </div>
          </div>
        )}

        {/* REMOVE BUTTON (Distinct Badge) */}
        {hasValidImage && !uploading && (
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering upload
              onChange('');
            }}
            className="absolute top-2 right-2 z-30 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-md transition-colors opacity-0 group-hover:opacity-100"
            title="Remove Image"
          >
            <Trash2 size={16} />
          </button>
        )}
        
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const EditHome = () => {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const content = await getPageContent('home');
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

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await updatePageContent('home', data);
      setMessage({ type: 'success', text: 'Home page updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (section: 'stats' | 'features', index: number, key: string, value: string) => {
    if (!data) return;
    const newArray = [...data[section]];
    (newArray[index] as any)[key] = value;
    setData({ ...data, [section]: newArray });
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  if (!data) return <div className="p-12 text-center text-red-500 font-bold border rounded-xl bg-red-50">Error loading content. Please refresh.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Home Page</h1>
          <p className="text-gray-500 mt-1">Manage hero section, stats, and key initiatives.</p>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className={`fixed top-24 right-8 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 backdrop-blur-sm ${message.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 'bg-red-50/90 border-red-200 text-red-800'}`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
        
        {/* 1. HERO SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Layout size={20} /></div>
             <h2 className="text-lg font-bold text-gray-800">Hero Section</h2>
          </div>
          <div className="p-6 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ImageField 
                label="Background Image" 
                value={data.hero.image || ''} 
                onChange={(url) => setData({ ...data, hero: { ...data.hero, image: url } })} 
                aspectRatio="video" 
              />
              <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">Recommended: 1920x1080px</p>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"><Type size={14}/> Headline</label>
                <input className="w-full p-3 border border-gray-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subtitle</label>
                <textarea className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-600 leading-relaxed" rows={3} value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Button Text</label>
                    <input className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={data.hero.ctaText} onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaText: e.target.value } })} />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><LinkIcon size={14}/> Link Destination</label>
                    <input className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={data.hero.ctaLink} onChange={(e) => setData({ ...data, hero: { ...data.hero, ctaLink: e.target.value } })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. STATS SECTION (Clean, no images) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><BarChart3 size={20} /></div>
            <h2 className="text-lg font-bold text-gray-800">Impact Statistics</h2>
          </div>
          <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {data.stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative hover:shadow-md transition-all flex flex-col justify-center gap-4 group">
                <span className="absolute top-3 right-3 text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-full uppercase">Stat {i + 1}</span>
                
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 text-center group-hover:text-emerald-500 transition-colors">Number Value</label>
                    <input 
                        className="w-full bg-transparent text-center font-bold text-emerald-600 text-3xl p-1 border-b-2 border-transparent focus:border-emerald-500 outline-none transition-all placeholder-gray-200" 
                        value={stat.value} 
                        onChange={(e) => handleArrayChange('stats', i, 'value', e.target.value)} 
                        placeholder="00" 
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 text-center">Description</label>
                    <input 
                        className="w-full bg-transparent text-center font-semibold text-gray-600 text-sm p-1 border-b-2 border-transparent focus:border-emerald-500 outline-none transition-all" 
                        value={stat.label} 
                        onChange={(e) => handleArrayChange('stats', i, 'label', e.target.value)} 
                        placeholder="Label" 
                    />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. INITIATIVES SECTION (Fixed Layout) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><CreditCard size={20} /></div>
            <h2 className="text-lg font-bold text-gray-800">Key Initiatives</h2>
          </div>
          <div className="p-6 grid md:grid-cols-3 gap-8">
            {data.features.map((feature, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-4">
                {/* Image Area - Flexible height */}
                <div className="w-full">
                  <ImageField 
                    label={`Initiative ${i+1}`}
                    value={feature.image || ''} 
                    onChange={(url) => handleArrayChange('features', i, 'image', url)} 
                    aspectRatio="video" 
                  />
                </div>
                
                {/* Inputs Area */}
                <div className="space-y-3 flex-1">
                  <input 
                    className="w-full font-bold text-gray-800 text-lg border-b border-gray-100 focus:border-violet-500 outline-none pb-2 transition-colors placeholder-gray-300" 
                    value={feature.title} 
                    onChange={(e) => handleArrayChange('features', i, 'title', e.target.value)} 
                    placeholder="Initiative Title" 
                  />
                  <textarea 
                    className="w-full text-sm text-gray-500 border border-transparent hover:border-gray-100 focus:border-violet-200 bg-gray-50/50 rounded-lg p-2 outline-none h-24 resize-none transition-all" 
                    value={feature.description} 
                    onChange={(e) => handleArrayChange('features', i, 'description', e.target.value)} 
                    placeholder="Short description of this initiative..." 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 left-0 right-0 mx-auto w-max z-40">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-gray-200/50">
            <button 
              type="submit" 
              disabled={saving} 
              className={`px-8 py-3 rounded-full font-bold text-white shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40'}`}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {saving ? 'Publishing Changes...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default EditHome;