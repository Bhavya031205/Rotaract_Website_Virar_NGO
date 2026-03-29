import { useEffect, useState } from 'react';
import { getPageContent, updatePageContent, type ContactPageData } from '../../api/content';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin,
  Globe
} from 'lucide-react';

const EditContact = () => {
  const [data, setData] = useState<ContactPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const content = await getPageContent('contact');
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

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // 2. Save Data
  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    try {
      await updatePageContent('contact', data);
      setMessage({ type: 'success', text: 'Contact info updated successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  // 3. Handle Changes
  const handleChange = (section: 'info' | 'socials', key: string, value: string) => {
    if (!data) return;
    setData({
      ...data,
      [section]: { ...data[section], [key]: value }
    });
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading contact info...</p>
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      className="max-w-4xl mx-auto space-y-8 pb-24"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Contact Info</h1>
        <p className="text-gray-500 mt-1">Update your public contact details and social media links.</p>
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
        
        {/* CARD 1: GENERAL INFORMATION */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">General Information</h2>
          </div>
          
          <div className="p-6 grid gap-6 md:grid-cols-2">
            
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                <MapPin size={14} /> Address
              </label>
              <input 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                value={data.info.address}
                onChange={(e) => handleChange('info', 'address', e.target.value)}
                placeholder="123 NGO St, City, Country"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                <Phone size={14} /> Phone
              </label>
              <input 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                value={data.info.phone}
                onChange={(e) => handleChange('info', 'phone', e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                <Mail size={14} /> Email
              </label>
              <input 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                value={data.info.email}
                onChange={(e) => handleChange('info', 'email', e.target.value)}
                placeholder="contact@example.org"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                <Clock size={14} /> Working Hours
              </label>
              <input 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                value={data.info.workingHours}
                onChange={(e) => handleChange('info', 'workingHours', e.target.value)}
                placeholder="Mon - Fri: 9:00 AM - 5:00 PM"
              />
            </div>
          </div>
        </motion.div>

        {/* CARD 2: SOCIAL MEDIA */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b border-pink-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-pink-600">
              <Instagram size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Social Media Links</h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
                <Facebook size={18} />
              </div>
              <input 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                value={data.socials.facebook}
                onChange={(e) => handleChange('socials', 'facebook', e.target.value)}
                placeholder="https://facebook.com/your-page"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-600">
                <Instagram size={18} />
              </div>
              <input 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all outline-none"
                value={data.socials.instagram}
                onChange={(e) => handleChange('socials', 'instagram', e.target.value)}
                placeholder="https://instagram.com/your-page"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-700">
                <Linkedin size={18} />
              </div>
              <input 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
                value={data.socials.linkedin || ''}
                onChange={(e) => handleChange('socials', 'linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/your-page"
              />
            </div>
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
              {saving ? 'Updating info...' : 'Make sure to save your changes.'}
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
              {saving ? 'Saving...' : 'Save Info'}
            </button>
          </div>
        </motion.div>

      </form>
    </motion.div>
  );
};

export default EditContact;