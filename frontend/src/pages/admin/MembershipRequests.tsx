
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Eye, Check, X, Loader2, Copy, Trash2 } from "lucide-react";

interface Request {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  work_details?: string;
  status: string;
  created_at: string;
}

interface Credentials {
  email: string;
  password: string;
}

const MembershipRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
 
  // State for "View Details" Modal
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // State for "Success Credentials" Modal
  const [approvedCreds, setApprovedCreds] = useState<Credentials | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/membership-request");
      // Sort by newest first
      const sorted = res.data.sort((a: Request, b: Request) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRequests(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approve = async (id: number) => {
    if(!confirm("Are you sure you want to approve this member?")) return;
    try {
      const res = await api.patch(`/membership-request/${id}/approve`);
      setApprovedCreds(res.data.credentials);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert("Failed to approve request.");
    }
  };

  const reject = async (id: number) => {
    if(!confirm("Reject this request? This cannot be undone.")) return;
    try {
      await api.patch(`/membership-request/${id}/reject`);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert("Failed to reject request.");
    }
  };

  // 🟢 NEW: DELETE FUNCTION
  const deleteRequest = async (id: number) => {
    if(!confirm("Permanently delete this request record?")) return;
    try {
      await api.delete(`/membership-request/${id}`);
      fetchRequests(); // Refresh list
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete request.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Membership Requests</h1>
      <p className="text-gray-500 mb-6">Review applications and coordinate with prospective members.</p>

      {/* REQUESTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                   No pending requests found.
                 </td>
               </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{r.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{r.email}</div>
                    <div className="text-xs text-gray-500">{r.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${r.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                      ${r.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                     
                      {/* VIEW DETAILS */}
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition"
                        title="View Full Details"
                      >
                        <Eye size={18} />
                      </button>

                      {/* APPROVE / REJECT (Only for Pending) */}
                      {r.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => approve(r.id)}
                            className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-lg hover:bg-green-100 transition"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => reject(r.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}

                      {/* DELETE BUTTON (Always visible for cleanup) */}
                      <button
                        onClick={() => deleteRequest(r.id)}
                        className="text-gray-500 hover:text-red-600 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
               <h3 className="text-xl font-bold text-gray-800">Application Details</h3>
               <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                 <X size={24} />
               </button>
            </div>
           
            <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Applicant Name</label>
                 <p className="text-lg font-medium text-gray-900">{selectedRequest.name}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                    <p className="text-gray-800">{selectedRequest.email}</p>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                    <p className="text-gray-800">{selectedRequest.phone}</p>
                 </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                 <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                   {selectedRequest.address || 'Not Provided'}
                 </p>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Work / Background</label>
                 <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                   {selectedRequest.work_details || 'Not Provided'}
                 </p>
               </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t">
               {/* Show Approve/Reject only if pending */}
               {selectedRequest.status === 'PENDING' ? (
                 <>
                   <button onClick={() => reject(selectedRequest.id)} className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50">
                      Reject
                   </button>
                   <button onClick={() => approve(selectedRequest.id)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                      Approve Member
                   </button>
                 </>
               ) : (
                 <button onClick={() => deleteRequest(selectedRequest.id)} className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Delete Record
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CREDENTIALS MODAL */}
      {approvedCreds && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-t-4 border-green-500">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Member Approved!</h3>
              <p className="text-sm text-gray-500 mb-6">
                The account has been created. Please copy these credentials and send them to the member manually (or via email).
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Login Email</label>
                <p className="font-mono text-gray-800 font-bold">{approvedCreds.email}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Temporary Password</label>
                <div className="flex justify-between items-center bg-white border p-2 rounded-lg mt-1">
                  <span className="font-mono text-blue-600 font-bold">{approvedCreds.password}</span>
                  <button
                    onClick={() => copyToClipboard(approvedCreds.password)}
                    className="text-gray-400 hover:text-blue-600 transition"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setApprovedCreds(null)}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MembershipRequests;