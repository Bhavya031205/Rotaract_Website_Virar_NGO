import { useEffect, useState } from 'react';
import { getPageContent, type ContactPageData } from '../../api/content';
import axios from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin, Send, MessageCircle, ChevronDown, ChevronUp, CheckCircle, HelpCircle, Loader2
} from 'lucide-react';
import DotGrid from '../../components/animations/DotGrid'; 
// Removed Antigravity import
import SpotlightCard from '../../components/animations/SpotLightCard';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const Contact = () => {
  const [pageData, setPageData] = useState<ContactPageData | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const content = await getPageContent('contact');
        setPageData(content);
        const faqRes = await axios.get('/faqs/public');
        setFaqs(faqRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      await axios.post('/faqs/ask', { question: newQuestion });
      setSubmitStatus('success');
      setNewQuestion('');
    } catch (err) {
      setSubmitStatus('error');
    }
  };

  if (!pageData) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
      {/* 🚀 HERO SECTION: DOT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-[450px] w-full flex flex-col items-center justify-center text-center overflow-hidden bg-black dark:bg-white rounded-3xl shadow-2xl isolate transition-colors duration-500">
          
          <div className="absolute inset-0 z-0">
            <DotGrid
              dotSize={4}
              gap={20}
              baseColor="#64748b" 
              activeColor="#284fe3" 
              proximity={100}
              shockRadius={200}
              shockStrength={10}
            />
          </div>

          <div className="relative z-10 px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-white dark:text-slate-900 mb-6 tracking-tight drop-shadow-2xl dark:drop-shadow-none">
                Contact Us
              </h1>
              <p className="text-xl text-slate-300 dark:text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                We are here to help. Reach out to us or find answers below.
              </p>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 dark:from-white/90 to-transparent z-10 pointer-events-none transition-colors duration-500" />
        </div>
      </div>

      {/* 🚀 MAIN CONTENT AREA */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8"
      >
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
            
           {/* === LEFT: CONTACT INFO CARD (Spotlight Added) === */}
           <motion.div variants={itemVariants} className="h-full">
             {/* 🟢 Replaced direct styling with SpotlightCard wrapper */}
             <SpotlightCard 
               className="h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 hover:shadow-2xl transition-all"
               spotlightColor="rgba(40, 79, 227, 0.35)"
             >
               {/* Inner container to handle flex justify-between correctly within SpotlightCard */}
               <div className="flex flex-col justify-between h-full">
                 <div>
                   <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg backdrop-blur-md">
                       <MapPin size={24} />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-sm">Get in Touch</h2>
                   </div>
                   
                   <div className="space-y-4">
                     {/* ADDRESS */}
                     <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                       <div className="flex items-center mb-1">
                          <div className="mr-3 text-blue-600 dark:text-blue-400"><MapPin size={18} /></div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</p>
                       </div>
                       <p className="text-xl font-bold text-slate-900 dark:text-white pl-8 leading-tight">{pageData.info.address}</p>
                     </div>

                     {/* PHONE */}
                     <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <div className="flex items-center mb-1">
                          <div className="mr-3 text-green-600 dark:text-green-400"><Phone size={18} /></div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</p>
                       </div>
                       <p className="text-xl font-bold text-slate-900 dark:text-white pl-8 leading-tight">{pageData.info.phone}</p>
                     </div>

                     {/* EMAIL */}
                     <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                       <div className="flex items-center mb-1">
                          <div className="mr-3 text-purple-600 dark:text-purple-400"><Mail size={18} /></div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                       </div>
                       <p className="text-xl font-bold text-slate-900 dark:text-white pl-8 leading-tight">{pageData.info.email}</p>
                     </div>

                     {/* HOURS */}
                     <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <div className="flex items-center mb-1">
                          <div className="mr-3 text-yellow-600 dark:text-yellow-400"><Clock size={18} /></div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Office Hours</p>
                       </div>
                       <p className="text-xl font-bold text-slate-900 dark:text-white pl-8 leading-tight">{pageData.info.workingHours}</p>
                     </div>
                     
                   </div>
                 </div>

                 {/* SOCIAL MEDIA */}
                 <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Follow Us</h3>
                   <div className="flex space-x-4">
                     {pageData.socials.facebook && (
                       <a href={pageData.socials.facebook} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 dark:bg-white/10 text-blue-600 dark:text-white rounded-full hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all transform hover:scale-110 shadow-sm backdrop-blur-sm border border-gray-100 dark:border-transparent">
                         <Facebook size={20} />
                       </a>
                     )}
                     {pageData.socials.instagram && (
                       <a href={pageData.socials.instagram} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 dark:bg-white/10 text-pink-600 dark:text-white rounded-full hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition-all transform hover:scale-110 shadow-sm backdrop-blur-sm border border-gray-100 dark:border-transparent">
                         <Instagram size={20} />
                       </a>
                     )}
                     {pageData.socials.linkedin && (
                       <a href={pageData.socials.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 dark:bg-white/10 text-blue-700 dark:text-white rounded-full hover:bg-blue-700 hover:text-white dark:hover:bg-blue-700 transition-all transform hover:scale-110 shadow-sm backdrop-blur-sm border border-gray-100 dark:border-transparent">
                         <Linkedin size={20} />
                       </a>
                     )}
                   </div>
                 </div>
               </div>
             </SpotlightCard>
           </motion.div>

           {/* === RIGHT: ASK QUESTION FORM (Spotlight Added) === */}
           <motion.div variants={itemVariants} className="h-full">
             <SpotlightCard 
               className="h-full bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col hover:shadow-2xl transition-all"
               spotlightColor="rgba(40, 79, 227, 0.35)"
             >
               <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                      <HelpCircle size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Have a Question?</h2>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Submit your query below. Our team will answer it publicly in the FAQ section.</p>
               </div>
               
               {submitStatus === 'success' ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex flex-col items-center justify-center h-full bg-green-50 dark:bg-green-900/10 p-8 rounded-xl border border-green-100 dark:border-green-900 text-center"
                 >
                   <CheckCircle size={64} className="text-green-500 mb-4" />
                   <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Question Submitted!</h3>
                   <p className="text-green-700 dark:text-green-400 mb-6">Thank you for reaching out. Please check the FAQ section later for an answer.</p>
                   <button 
                     onClick={() => setSubmitStatus('idle')} 
                     className="px-6 py-2 bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 font-bold rounded-lg shadow-sm border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-slate-700 transition"
                   >
                     Ask another question
                   </button>
                 </motion.div>
               ) : (
                 <form onSubmit={handleAskSubmit} className="space-y-6 flex-1 flex flex-col justify-center">
                   <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Question</label>
                     <div className="relative">
                       <textarea 
                         rows={6} 
                         className="block w-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none resize-none shadow-inner" 
                         placeholder="e.g., How do I apply for a scholarship?"
                         value={newQuestion}
                         onChange={(e) => setNewQuestion(e.target.value)}
                       />
                       <MessageCircle className="absolute top-4 right-4 text-gray-300 dark:text-slate-600" size={20} />
                     </div>
                   </div>
                   
                   <button 
                     type="submit" 
                     className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                   >
                     <Send size={18} /> Submit Question
                   </button>
                   
                   {submitStatus === 'error' && (
                     <p className="text-red-500 text-center text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">Failed to submit. Please try again.</p>
                   )}
                 </form>
               )}
             </SpotlightCard>
           </motion.div>
        </div>

        {/* === FAQ SECTION === */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          {/* ... (FAQ Code Unchanged) ... */}
           <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <motion.div 
                key={faq.id} 
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                initial={false}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className={`w-full flex justify-between items-center p-6 text-left focus:outline-none transition-colors ${
                    openFaq === faq.id 
                      ? 'bg-blue-50 dark:bg-slate-800/50 text-blue-800 dark:text-blue-300' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-lg pr-8 flex items-center gap-3">
                    <span className="text-blue-500 dark:text-blue-400">Q.</span> {faq.question}
                  </span>
                  <span className={`text-blue-500 dark:text-blue-400 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`}>
                    {openFaq === faq.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </span>
                </button>
                
                <AnimatePresence>
                  {openFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 bg-blue-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-blue-100/50 dark:border-slate-700/50">
                        <div className="flex gap-3">
                           <span className="font-bold text-green-600 dark:text-green-400 mt-1">A.</span>
                           <span>{faq.answer}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Contact;