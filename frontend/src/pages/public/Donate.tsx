import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, CreditCard, Landmark, Copy, CheckCircle, 
  ShieldCheck, Gift, ArrowRight, User, Mail, Loader2, 
  FileText, QrCode
} from 'lucide-react';
import api from '../../api/axios';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
interface DonationSettings {
  preset_amounts?: number[];
  contact_email?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  branch_name?: string;
  upi_id?: string;
  qr_code?: string; // 👈 Added this field
}

interface QrFormState {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  transaction_id: string;
}

// Load Razorpay SDK Wrapper
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Donate = () => {
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'bank'>('online');
  const [loading, setLoading] = useState(false); 
  const [pageLoading, setPageLoading] = useState(true); 
  const [copied, setCopied] = useState<string | null>(null);

  // Dynamic Settings
  const [settings, setSettings] = useState<DonationSettings | null>(null);

  // Online Donor Details
  const [donorDetails, setDonorDetails] = useState({ name: '', email: '' });

  // Manual/QR Form State
  const [qrForm, setQrForm] = useState<QrFormState>({
    name: '', email: '', phone: '', city: '', state: '', transaction_id: ''
  });

  // Fetch Settings on Load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/donation');
        setSettings(data);
        if (data.preset_amounts && data.preset_amounts.length > 0) {
          setAmount(data.preset_amounts[1] || data.preset_amounts[0]); 
        }
      } catch (error) {
        console.error("Failed to load donation settings", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 🟢 HELPER: Construct Full Image URL
  const getQrImageUrl = (path: string | undefined) => {
    if (!path) return "https://placehold.co/200x200?text=QR+Not+Found"; // Fallback
    if (path.startsWith('http')) return path;
    
    // Construct full URL using Vite Env Variable or default to localhost
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove '/api' from the end to get the base server URL (e.g., http://localhost:5000)
    const baseUrl = apiUrl.replace(/\/api$/, '');
    
    return `${baseUrl}${path}`;
  };

  const handleCopy = (text: string | undefined, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOnlineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDonorDetails({ ...donorDetails, [e.target.name]: e.target.value });
  };

  const handleQrInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrForm({ ...qrForm, [e.target.name]: e.target.value });
  };

  // ==========================================
  // 2. RAZORPAY INTEGRATION (Secure)
  // ==========================================
  const handleOnlineDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert("Please enter a valid donation amount.");
    if (!donorDetails.name || !donorDetails.email) return alert("Please enter your name and email for the receipt.");

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      const { data: order } = await api.post("/payment/create-order", {
        amount: Number(amount)
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: "INR",
        name: "NGO Foundation",
        description: "Donation for a Cause",
        image: "/logo.png",
        order_id: order.id,
        prefill: {
          name: donorDetails.name,
          email: donorDetails.email,
        },
        theme: { color: "#2563EB" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            await api.post("/payment/verify", {
              ...response,
              donationData: {
                name: donorDetails.name,
                email: donorDetails.email,
                amount: Number(amount),
                purpose: "NGO Donation"
              },
            });
            alert(`Thank you, ${donorDetails.name}! Your donation was successful. Receipt sent to email.`);
            setAmount('');
            setCustomAmount('');
            setDonorDetails({ name: '', email: '' });
          } catch (verifyError) {
            console.error("Verification Failed", verifyError);
            alert("Payment successful but verification failed. Please contact support.");
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong initializing payment.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. MANUAL / QR FORM SUBMISSION
  // ==========================================
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert("Please enter the amount you donated.");
    if (!qrForm.name || !qrForm.email || !qrForm.transaction_id || !qrForm.city || !qrForm.state) {
      return alert("Please fill all required fields to generate your 80G receipt.");
    }

    setLoading(true);
    try {
      await api.post('/donations/manual', {
        ...qrForm,
        amount: Number(amount)
      });
      
      alert("Details Submitted Successfully! We will verify the transaction and email your receipt within 24 hours.");
      
      // Reset Form
      setQrForm({ name: '', email: '', phone: '', city: '', state: '', transaction_id: '' });
      setAmount('');
      setCustomAmount('');
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to submit details. Please ensure the Transaction ID is unique and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const presetAmounts = settings?.preset_amounts || [500, 1000, 2000];

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
      {/* HERO SECTION */}
      <div className="relative bg-blue-900 text-white py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-blue-200 text-sm font-semibold mb-6 border border-white/20">
            <Heart size={16} className="text-pink-500 fill-current" /> Official Donation Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Make a Difference Today
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Your contribution helps us provide healthcare, education, and resources to those who need it most.
          </p>
        </motion.div>
      </div>

      {/* TRUST BADGES */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full mb-1">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">100% Secure Payment</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Government Regulated & Audited</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full mb-1">
                <Landmark size={28} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Tax Exemption</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">80G Certificate Issued</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full mb-1">
                <Gift size={28} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Transparent Impact</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Annual Reports Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN DONATION SECTION */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: INFO */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-blue-600 dark:bg-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="flex-shrink-0 mt-1 text-blue-300" size={20} />
                  <span><strong>₹500</strong> can provide a medical kit for a child.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="flex-shrink-0 mt-1 text-blue-300" size={20} />
                  <span><strong>₹1,000</strong> sends a child to school for a month.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="flex-shrink-0 mt-1 text-blue-300" size={20} />
                  <span><strong>₹5,000</strong> sponsors a community health camp.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Contact our support team for receipt assistance.</p>
              <a href={`mailto:${settings?.contact_email || 'support@ngo.org'}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-2">
                {settings?.contact_email || 'support@ngo.org'} <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* RIGHT: DONATION FORM */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
              
              {/* TABS */}
              <div className="flex border-b border-gray-100 dark:border-slate-800">
                <button 
                  onClick={() => setPaymentMethod('online')}
                  className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'online' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <CreditCard size={18} /> Donate Online
                </button>
                <button 
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'bank' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Landmark size={18} /> Pay via QR / UPI
                </button>
              </div>

              {/* CONTENT AREA */}
              <div className="p-6 md:p-8">
                <AnimatePresence mode='wait'>
                  
                  {/* === ONLINE FORM === */}
                  {paymentMethod === 'online' && (
                    <motion.div 
                      key="online"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Select Amount (INR)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {presetAmounts.map((amt: number) => (
                          <button
                            key={amt}
                            onClick={() => { setAmount(amt); setCustomAmount(''); }}
                            className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                              amount === amt 
                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600' 
                                : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Or Enter Custom Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">₹</span>
                          <input 
                            type="number" 
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-lg placeholder-gray-400 dark:placeholder-gray-600"
                            placeholder="0"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setAmount(Number(e.target.value));
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <h4 className="font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">Your Details (For Tax Receipt)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Full Name</label>
                            <div className="relative">
                              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input 
                                type="text"
                                name="name"
                                value={donorDetails.name}
                                onChange={handleOnlineInputChange}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder="John Doe"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Email Address</label>
                            <div className="relative">
                              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input 
                                type="email"
                                name="email"
                                value={donorDetails.email}
                                onChange={handleOnlineInputChange}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder="john@example.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleOnlineDonate}
                        disabled={loading || !amount}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${
                          loading || !amount ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed text-gray-500 dark:text-gray-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                        }`}
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                        {loading ? 'Processing...' : `Donate ₹${amount || '0'} Now`}
                      </button>
                    </motion.div>
                  )}

                  {/* === BANK / QR FORM === */}
                  {paymentMethod === 'bank' && settings && (
                    <motion.div 
                      key="bank"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="grid md:grid-cols-2 gap-8"
                    >
                      {/* Left: Bank Details & QR */}
                      <div className="space-y-6">
                         <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 flex items-start gap-3">
                            <QrCode className="text-yellow-700 dark:text-yellow-500 flex-shrink-0" size={24} />
                            <div>
                              <h4 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm">Scan & Pay</h4>
                              <p className="text-xs text-yellow-700 dark:text-yellow-500/80 mt-1">
                                Use GPay, PhonePe, Paytm or any UPI App.
                              </p>
                            </div>
                         </div>
                         
                         <div className="flex justify-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                             {/* 🟢 DYNAMIC QR CODE LOGIC */}
                             <img 
                               src={getQrImageUrl(settings.qr_code)} 
                               alt="Official NGO QR" 
                               className="w-40 h-40 object-contain" 
                             />
                         </div>

                         <div className="space-y-3">
                            {[
                                { label: "Bank Name", value: settings.bank_name, key: 'bank' },
                                { label: "Account No.", value: settings.account_number, key: 'acc_num' },
                                { label: "IFSC Code", value: settings.ifsc_code, key: 'ifsc' },
                            ].map((item) => (
                                <div key={item.key} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-slate-800 pb-2">
                                    <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-gray-800 dark:text-white">{item.value || 'N/A'}</span>
                                        <button onClick={() => handleCopy(item.value, item.key)} className="text-blue-500 hover:text-blue-700">
                                            {copied === item.key ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                      </div>

                      {/* Right: Submission Form */}
                      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
                         <h4 className="font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                             <FileText size={18} className="text-blue-500"/> Submit Details
                         </h4>
                         <p className="text-xs text-gray-500 mb-4">Mandatory for generating 80G Tax Receipt.</p>

                         <form onSubmit={handleManualSubmit} className="space-y-3">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <input type="number" name="amount" required placeholder="Amount Donated" className="w-full pl-7 p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 text-sm" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                            </div>

                            <input type="text" name="transaction_id" required placeholder="Transaction ID / UTR Number" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 text-sm" value={qrForm.transaction_id} onChange={handleQrInputChange} />

                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" name="name" required placeholder="Full Name" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 text-sm" value={qrForm.name} onChange={handleQrInputChange} />
                                <input type="email" name="email" required placeholder="Email" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 text-sm" value={qrForm.email} onChange={handleQrInputChange} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" name="city" required placeholder="City" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 text-sm" value={qrForm.city} onChange={handleQrInputChange} />
                                <input type="text" name="state" required placeholder="State" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 text-sm" value={qrForm.state} onChange={handleQrInputChange} />
                            </div>

                            <input type="tel" name="phone" placeholder="Phone Number (Optional)" className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-blue-500 text-sm" value={qrForm.phone} onChange={handleQrInputChange} />

                            <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                                {loading ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>}
                                {loading ? 'Submitting...' : 'Submit & Get Receipt'}
                            </button>
                         </form>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;