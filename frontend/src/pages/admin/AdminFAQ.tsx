import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageCircle, 
  CheckCircle2, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  HelpCircle,
  Clock,
  Send,
  Loader2
} from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer?: string;
  is_published: boolean;
  created_at: string;
}

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({}); 
  
  // State for Creating New FAQ
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [isCreating, setIsCreating] = useState(false);

  // State for Editing Existing FAQ
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '' });

  const fetchFaqs = async () => {
    try {
      const res = await axios.get('/faqs/admin');
      setFaqs(res.data);
    } catch (error) {
      console.error("Error fetching FAQs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaqs(); }, []);

  // --- ACTIONS ---

  const handlePublish = async (id: number) => {
    if (!replyText[id]) return alert("Please write an answer first.");
    await axios.put(`/faqs/${id}/answer`, { answer: replyText[id] });
    fetchFaqs();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;
    await axios.post('/faqs/admin/create', newFaq);
    setNewFaq({ question: '', answer: '' });
    setIsCreating(false);
    fetchFaqs();
  };

  const startEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setEditForm({ question: faq.question, answer: faq.answer || '' });
  };

  const handleUpdate = async (id: number) => {
    await axios.put(`/faqs/${id}`, editForm);
    setEditingId(null);
    fetchFaqs();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      await axios.delete(`/faqs/${id}`);
      fetchFaqs();
    }
  };

  // Helper filters
  const pendingFaqs = faqs.filter(f => !f.is_published);
  const publishedFaqs = faqs.filter(f => f.is_published);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium animate-pulse">Loading Q&A...</p>
      </div>
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Q&A Manager</h1>
          <p className="text-gray-500 mt-1">Answer user questions and manage published FAQs.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
            isCreating ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isCreating ? <X size={20} /> : <Plus size={20} />}
          {isCreating ? 'Cancel' : 'Add New FAQ'}
        </button>
      </div>

      {/* CREATE NEW FAQ FORM */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <HelpCircle size={20} /> Create New FAQ
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input 
                  className="w-full p-3 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400"
                  placeholder="Enter the question here..."
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  autoFocus
                />
                <textarea 
                  className="w-full p-3 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400 min-h-[100px]"
                  placeholder="Enter the official answer..."
                  rows={3}
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                />
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCreating(false)} 
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"
                  >
                    <Save size={18} /> Save & Publish
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: PENDING QUESTIONS */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-gray-800">Pending Questions</h2>
            {pendingFaqs.length > 0 && (
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                {pendingFaqs.length} New
              </span>
            )}
          </div>

          <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-4 min-h-[300px]">
            {pendingFaqs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <CheckCircle2 size={48} className="mb-4 text-green-200" />
                <p className="font-medium text-gray-500">All caught up!</p>
                <p className="text-sm">No pending questions from users.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingFaqs.map(faq => (
                  <motion.div 
                    layout
                    key={faq.id} 
                    className="bg-white p-5 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1 p-1.5 bg-amber-100 text-amber-600 rounded-full flex-shrink-0">
                        <HelpCircle size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{faq.question}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock size={12} /> Received: {new Date(faq.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pl-11 space-y-3">
                       <textarea
                         className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                         placeholder="Type your official answer here..."
                         rows={2}
                         onChange={(e) => setReplyText({ ...replyText, [faq.id]: e.target.value })}
                       />
                       <div className="flex gap-2">
                         <button 
                           onClick={() => handlePublish(faq.id)} 
                           className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm"
                         >
                           <Send size={14} /> Publish Answer
                         </button>
                         <button 
                           onClick={() => handleDelete(faq.id)} 
                           className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                           title="Delete as Spam"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: PUBLISHED FAQS */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-gray-800">Published FAQs</h2>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold border border-green-200">
              Live
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[300px]">
            {publishedFaqs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <MessageCircle size={48} className="mb-4 text-gray-200" />
                <p>No FAQs published yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {publishedFaqs.map(faq => (
                  <div key={faq.id} className="p-5 hover:bg-gray-50 transition-colors group">
                    
                    {editingId === faq.id ? (
                      // EDIT MODE
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                      >
                        <input 
                          className="w-full p-2 border border-blue-200 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={editForm.question}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          autoFocus
                        />
                        <textarea 
                          className="w-full p-2 border border-blue-200 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                          rows={3}
                          value={editForm.answer}
                          onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm hover:underline px-2">Cancel</button>
                          <button 
                            onClick={() => handleUpdate(faq.id)} 
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm"
                          >
                            Save Changes
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      // VIEW MODE
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-blue-600 text-sm mt-0.5">Q:</span>
                            <p className="font-bold text-gray-800 text-sm">{faq.question}</p>
                          </div>
                          <div className="flex items-start gap-2">
                             <span className="font-bold text-green-600 text-sm mt-0.5">A:</span>
                             <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(faq)} 
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(faq.id)} 
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AdminFAQ;