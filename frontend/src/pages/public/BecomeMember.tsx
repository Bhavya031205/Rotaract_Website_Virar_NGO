import { useState } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from "lucide-react";

const BecomeMember = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    work_details: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear status when user starts typing again
    if (status) setStatus(null);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    if (!form.name || !form.email || !form.phone) {
      setStatus({ type: 'error', message: "Name, Email, and Phone are required fields." });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      await api.post("/membership-request", form);

      setStatus({ type: 'success', message: "Membership request submitted successfully! Our team will contact you shortly." });

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        work_details: "",
      });
    } catch (error: any) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || "Failed to submit request. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight">
            Join Our Community
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Become a member and help us drive sustainable change.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header Strip */}
          <div className="bg-blue-600 h-2 w-full"></div>

          <div className="p-8 sm:p-10">
            
            {/* Status Message */}
            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    status.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={submitRequest} className="space-y-6">
              
              {/* Name & Email Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      name="name"
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      name="email"
                      type="email"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <textarea
                    name="address"
                    rows={3}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none resize-none"
                    placeholder="Street, City, Zip Code"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Work Details */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Work / Professional Background</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                    <Briefcase size={18} />
                  </div>
                  <textarea
                    name="work_details"
                    rows={4}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none resize-none"
                    placeholder="Tell us a bit about your profession or skills..."
                    value={form.work_details}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Membership Request <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          By submitting this form, you agree to be contacted by our administration team.
        </p>
      </motion.div>
    </div>
  );
};

export default BecomeMember;