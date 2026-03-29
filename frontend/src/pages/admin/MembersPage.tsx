
import { useEffect, useState } from "react";
import api from "../../api/axios";
import ImageUpload from "../../components/ImageUpload";
import { Trash2, Edit, Plus, X, Save, User, Linkedin } from "lucide-react"; // 🟢 Removed ExternalLink

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  is_public: boolean;
  designation?: string;
  bio?: string;
  image?: string;
  linkedin?: string;
}

const AdminMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    email: '',
    password: '', 
    designation: '',
    bio: '',
    image: '',
    linkedin: '',
    is_public: false,
    role: 'MEMBER'
  });

  const fetchMembers = async () => {
    try {
      const res = await api.get("/members");
      setMembers(res.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/members/${formData.id}`, formData);
        alert("✅ Member updated successfully!");
      } else {
        await api.post("/members", formData);
        alert("✅ Member Account Created!");
      }
      setShowForm(false);
      resetForm();
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("⚠️ Are you sure you want to delete this member?\n\nThis will remove their login access and profile permanently.")) return;
    
    try {
      await api.delete(`/members/${id}`);
      setMembers(members.filter(m => m.id !== id));
      alert("Member deleted successfully.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete member.");
    }
  };

  const resetForm = () => {
    setFormData({ id: 0, name: '', email: '', password: '', designation: '', bio: '', image: '', linkedin: '', is_public: false, role: 'MEMBER' });
    setIsEditing(false);
  };

  const handleEdit = (m: Member) => {
    setFormData({
      id: m.id,
      name: m.name,
      email: m.email,
      password: '', 
      designation: m.designation || '',
      bio: m.bio || '',
      image: m.image || '',
      linkedin: m.linkedin || '',
      is_public: m.is_public,
      role: m.role
    });
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo(0,0);
  };

  const handleTogglePublic = async (member: Member) => {
    const newStatus = !member.is_public;
    setMembers(members.map(m => m.id === member.id ? { ...m, is_public: newStatus } : m));
    try { await api.put(`/members/${member.id}/toggle-public`, { is_public: newStatus }); } 
    catch (err) { alert("Failed to update visibility"); fetchMembers(); }
  };

  if (loading) return <div className="p-10 flex justify-center text-gray-500">Loading directory...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">Member Directory</h1>
           <p className="text-gray-500 mt-1">Manage accounts, profiles, and public visibility.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5 font-medium"
        >
          {showForm ? <><X size={18} /> Close Form</> : <><Plus size={18} /> Create Member</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 mb-10 animate-fade-in">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 border-b pb-4">
            {isEditing ? <Edit className="text-blue-600"/> : <Plus className="text-green-600"/>}
            {isEditing ? `Edit Profile: ${formData.name}` : "Create New Member Account"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                       <input required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                    </div>
                    
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Email (Login ID) *</label>
                       <input required type="email" disabled={isEditing} className={`w-full border border-gray-300 p-3 rounded-lg outline-none ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                    </div>

                    {!isEditing && (
                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                         <label className="block text-sm font-bold text-yellow-800 mb-1">Temporary Password *</label>
                         <input required minLength={6} type="text" placeholder="e.g. Member@123" className="w-full border border-yellow-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                         <p className="text-xs text-yellow-600 mt-2">⚠️ You must share this password with the member manually.</p>
                      </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Public Designation</label>
                       <input placeholder="e.g. Secretary / Volunteer" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                    </div>
                    
                    <div>
                       {/* 🟢 FIXED: Removed 'block' and kept 'flex' to fix conflict */}
                       <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                         <Linkedin size={14} className="text-blue-600"/> LinkedIn Profile URL
                       </label>
                       <input type="url" placeholder="https://linkedin.com/in/..." className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                       <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                          <input type="checkbox" id="publicSwitch" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked={formData.is_public} onChange={e => setFormData({...formData, is_public: e.target.checked})} />
                          <label htmlFor="publicSwitch" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.is_public ? 'bg-green-500' : 'bg-gray-300'}`}></label>
                       </div>
                       <label htmlFor="publicSwitch" className="text-sm font-bold text-gray-700 cursor-pointer">Make Profile Publicly Visible?</label>
                    </div>
                </div>
             </div>

             <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Short Bio</label>
                <textarea rows={3} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Write a short description..." />
             </div>

             {/* IMAGE UPLOAD */}
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Profile Photo</label>
                <div className="w-32 h-32 md:w-40 md:h-40"> 
                   <ImageUpload currentImage={formData.image} onUpload={(url) => setFormData({...formData, image: url})} />
                </div>
             </div>

             {/* ACTIONS */}
             <div className="flex gap-3 pt-6 border-t mt-6">
                <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">
                  <Save size={20} /> {isEditing ? "Save Changes" : "Create Account"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">
                  Cancel
                </button>
             </div>
          </form>
        </div>
      )}

      {/* MEMBER LIST TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Profile</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500">No members found.</td></tr>
            ) : members.map((member) => (
              <tr key={member.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                      {member.image ? (
                        <img src={member.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="text-gray-400" size={24} />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      {member.linkedin && (
                         <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                           <Linkedin size={10} /> LinkedIn
                         </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {member.designation || <span className="text-gray-400 italic">None</span>}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleTogglePublic(member)} 
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${member.is_public ? 'bg-green-500' : 'bg-gray-200'}`}
                      title="Toggle Public Visibility"
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${member.is_public ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{member.is_public ? 'Public' : 'Hidden'}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => handleEdit(member)} 
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition"
                      title="Edit Member"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(member.id)} 
                      className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition"
                      title="Delete Member"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMembers;