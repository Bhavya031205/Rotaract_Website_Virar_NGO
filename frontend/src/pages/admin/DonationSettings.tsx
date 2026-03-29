
import { useState, useEffect, useRef } from 'react';
import { 
  Save, Landmark, CreditCard, Mail, Loader2, IndianRupee, 
  QrCode, Upload, X, ImageIcon 
} from 'lucide-react';
import api from '../../api/axios';

const DonationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    upi_id: '',
    contact_email: '',
    qr_code: '', // 👈 New Field
    preset_amounts: [500, 1000, 2500, 5000]
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings/donation');
      setFormData({
        ...data,
        preset_amounts: Array.isArray(data.preset_amounts) ? data.preset_amounts : [500, 1000, 2000]
      });
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueString = e.target.value;
    const values = valueString.split(',').map(v => v.trim()).filter(v => v !== '');
    const numValues = values.map(Number).filter(n => !isNaN(n));
    setFormData({ ...formData, preset_amounts: numValues });
  };

  // 🟢 HANDLE QR IMAGE UPLOAD
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const { data } = await api.post('/upload', uploadData);
      // Backend returns relative path (e.g., /uploads/xyz.png)
      setFormData(prev => ({ ...prev, qr_code: data.url }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload QR Code image.");
    } finally {
      setUploadingQr(false);
      // Reset input to allow re-uploading same file if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeQrCode = () => {
    setFormData(prev => ({ ...prev, qr_code: '' }));
  };

  // Helper to resolve full image URL
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${apiUrl.replace(/\/api$/, '')}${path}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/donation', formData);
      alert("✅ Donation Settings Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Donation Settings</h1>
          <p className="text-gray-500 mt-1">Manage bank details, QR code, and donation options.</p>
        </div>
        <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
          <Landmark size={32} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: BANK DETAILS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b">
            <CreditCard size={24} className="text-blue-600" /> Bank Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Text Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="HDFC Bank" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name</label>
                <input type="text" name="account_name" value={formData.account_name || ''} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="NGO Foundation" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                <input type="text" name="account_number" value={formData.account_number || ''} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="50100..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                <input type="text" name="ifsc_code" value={formData.ifsc_code || ''} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase" placeholder="HDFC000..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Branch Address</label>
                <input type="text" name="branch_name" value={formData.branch_name || ''} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nariman Point, Mumbai" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID (Optional)</label>
                <input type="text" name="upi_id" value={formData.upi_id || ''} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="ngo@okaxis" />
              </div>
            </div>

            {/* Right Column: QR Code Upload */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center">
               <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                 <QrCode size={20} /> Payment QR Code
               </h3>
               
               <div className="relative group w-64 h-64 bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center hover:border-blue-400 transition-colors">
                  {formData.qr_code ? (
                    <>
                      <img 
                        src={getImageUrl(formData.qr_code)} 
                        alt="QR Code" 
                        className="w-full h-full object-contain p-2"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white p-2 rounded-full text-blue-600 hover:scale-110 transition"
                          title="Change Image"
                        >
                          <Upload size={20} />
                        </button>
                        <button 
                          type="button" 
                          onClick={removeQrCode}
                          className="bg-white p-2 rounded-full text-red-600 hover:scale-110 transition"
                          title="Remove Image"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-center cursor-pointer p-6"
                    >
                      {uploadingQr ? (
                        <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" />
                      ) : (
                        <ImageIcon className="text-gray-300 mx-auto mb-2" size={48} />
                      )}
                      <p className="text-sm text-gray-500 font-medium">
                        {uploadingQr ? "Uploading..." : "Click to Upload QR Image"}
                      </p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleQrUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
               </div>
               <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
                 Upload a square image of your UPI QR code (JPG/PNG). This will be shown on the public donation page.
               </p>
            </div>

          </div>
        </div>

        {/* SECTION 2: CONFIGURATION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b">
            <IndianRupee size={24} className="text-green-600" /> Donation Options
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preset Amounts (Comma Separated)</label>
              <input 
                type="text" 
                value={formData.preset_amounts?.join(', ')} 
                onChange={handleAmountChange} 
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg" 
                placeholder="500, 1000, 2000"
              />
              <p className="text-xs text-gray-500 mt-2">These amounts will appear as quick-select buttons on the public donation page.</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Mail size={16} /> Receipt Support Email
              </label>
              <input type="email" name="contact_email" value={formData.contact_email || ''} onChange={handleChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="accounts@ngo.org" />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pb-12">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
};

export default DonationSettings;