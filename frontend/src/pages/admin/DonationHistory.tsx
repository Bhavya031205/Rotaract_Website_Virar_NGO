
import { useState, useEffect } from 'react';
import { 
  Download, Plus, Search, CheckCircle, Clock, 
  CreditCard, Banknote, Calendar, Loader2, Trash2, Archive, RotateCcw
} from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';

interface Donation {
  id: number;
  name: string;
  email: string;
  amount: number;
  purpose: string;
  payment_status: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
  is_deleted: boolean;
}

const DonationHistory = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Toggle to show deleted items
  const [showArchived, setShowArchived] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [manualData, setManualData] = useState({
    name: '', email: '', amount: '', phone: '', city: '', state: '', transaction_id: ''
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data } = await api.get('/donations'); 
      setDonations(data);
    } catch (error) {
      console.error("Failed to fetch donations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    if(!confirm("Are you sure? This will hide the donation from the total, but keep a record.")) return;
    try {
      await api.delete(`/donations/${id}`);
      setDonations(prev => prev.map(d => d.id === id ? { ...d, is_deleted: true } : d));
    } catch (error) {
      alert("Failed to archive donation");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/donations/manual', {
         ...manualData,
         transaction_id: manualData.transaction_id || `CASH_${Date.now()}` 
      });
      alert("✅ Donation Recorded Successfully");
      setShowModal(false);
      setManualData({ name: '', email: '', amount: '', phone: '', city: '', state: '', transaction_id: '' });
      fetchDonations(); 
    } catch (error) {
      console.error(error);
      alert("Failed to record donation");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Filter by Search Term
  const searchFiltered = donations.filter(d => {
    const search = searchTerm.toLowerCase();
    const name = (d.name || '').toLowerCase();
    const email = (d.email || '').toLowerCase();
    const txnId = (d.transaction_id || '').toLowerCase();
    return name.includes(search) || email.includes(search) || txnId.includes(search);
  });

  // 2. Filter Active vs Archived based on Toggle
  const displayedDonations = searchFiltered.filter(d => d.is_deleted === showArchived);

  // 3. Calculate Total ONLY for Active (Non-Deleted) donations
  const totalRaised = donations
    .filter(d => !d.is_deleted)
    .reduce((sum, d) => sum + Number(d.amount), 0);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      
      {/* HEADER STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Donation History</h1>
          <p className="text-gray-500">Official financial record of the NGO.</p>
        </div>
        <div className="bg-green-50 text-green-700 px-6 py-3 rounded-2xl border border-green-100 flex flex-col items-end shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider">Net Total Raised</span>
          <span className="text-3xl font-extrabold">₹{totalRaised.toLocaleString()}</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* ARCHIVE TOGGLE */}
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition border ${
              showArchived 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {showArchived ? <RotateCcw size={18} /> : <Archive size={18} />}
            {showArchived ? 'View Active' : 'View Deleted'}
          </button>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition">
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <Plus size={18} /> Add Entry
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b ${showArchived ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Donor</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedDonations.length > 0 ? (
                displayedDonations.map((d) => (
                  <tr key={d.id} className={`transition-colors ${d.is_deleted ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{d.name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">{d.email || '-'}</div>
                    </td>
                    <td className="p-4 font-bold text-gray-800">₹{Number(d.amount).toLocaleString()}</td>
                    <td className="p-4">
                      {d.payment_method === 'QR_MANUAL' || d.payment_method === 'OFFLINE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <Banknote size={12} /> Offline
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          <CreditCard size={12} /> Online
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {d.is_deleted ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-sm font-bold bg-red-100 px-2 py-1 rounded-md">
                          <Trash2 size={14} /> Voided
                        </span>
                      ) : d.payment_status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-md">
                          <CheckCircle size={14} /> Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-600 text-sm font-bold bg-yellow-50 px-2 py-1 rounded-md">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {/* 🟢 FIXED: Added Calendar Icon usage here */}
                        <Calendar size={14} className="text-gray-400" />
                        {d.created_at ? format(new Date(d.created_at), 'dd MMM yyyy') : 'N/A'}
                      </div>
                    </td>
                    
                    {/* ACTION COLUMN */}
                    <td className="p-4 text-right">
                      {!d.is_deleted ? (
                        <button 
                          onClick={() => handleArchive(d.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Void / Archive Transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <span className="text-xs text-red-400 font-mono">ARCHIVED</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      {showArchived ? <Trash2 size={32} className="text-gray-300"/> : <Search size={32} className="text-gray-300" />}
                      <p>{showArchived ? "No deleted records found." : "No active donations found matching your search."}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL ENTRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Record Offline Donation</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Donor Name *</label>
                <input required type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹) *</label>
                  <input required type="number" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={manualData.amount} onChange={e => setManualData({...manualData, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Txn ID / Ref</label>
                  <input type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={manualData.transaction_id} onChange={e => setManualData({...manualData, transaction_id: e.target.value})} placeholder="Auto-generated if empty" />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2">
                   {submitting ? <Loader2 className="animate-spin" size={18} /> : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DonationHistory;