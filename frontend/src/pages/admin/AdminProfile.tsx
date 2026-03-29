import { useState, useEffect } from "react";
import axios from "../../api/axios";
import ImageUpload from "../../components/ImageUpload";
import { useAuth } from "../../context/AuthContext"; 
import { ExternalLink } from "lucide-react"; 

const AdminProfile = () => {
  const { updateUser } = useAuth();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/members/me");
        setProfile({
            // 🟢 FIX: Added || "" to ensure these are never undefined
            name: res.data.name || "",
            email: res.data.email || "",
            image: res.data.image || ""
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      await axios.put("/members/me/update", {
        name: profile.name,
        image: profile.image,
        password: passwords.currentPassword, 
        newPassword: passwords.newPassword 
      });

      updateUser(profile.name, profile.image);

      alert("Profile Updated Successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      alert(err.response?.data?.message || "Update Failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile Settings</h1>

      {/* District Login Link Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border border-slate-700">
        <div className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/a/a2/Rotaract_Logo.png" 
              alt="Rotaract" 
              className="h-8 brightness-0 invert" 
            />
            District 3141 Admin Portal
          </h2>
          <p className="text-slate-300 text-sm max-w-lg">
            Access the official district administrative tools, reports, and member data here.
          </p>
        </div>
        <a 
          href="https://app.rotaract3141.org/authentication/login" 
          target="_blank" 
          rel="noopener noreferrer"
          className="whitespace-nowrap px-4 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 text-sm shadow-sm"
        >
          Open District Login <ExternalLink size={16} />
        </a>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Image Section */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
               <div className="w-40 h-40 mb-4 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                 <ImageUpload 
                   currentImage={profile.image} 
                   onUpload={(url) => setProfile({...profile, image: url})} 
                 />
               </div>
               <p className="text-xs text-gray-400">Click image to update</p>
            </div>

            {/* Details Section */}
            <div className="w-full md:w-2/3 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Display Name</label>
                 <input 
                   className="w-full border p-2 rounded mt-1" 
                   value={profile.name} 
                   onChange={e => setProfile({...profile, name: e.target.value})} 
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700">Email (Read Only)</label>
                 <input disabled className="w-full border p-2 rounded mt-1 bg-gray-100 text-gray-500" value={profile.email} />
               </div>

               <div className="border-t pt-4 mt-4">
                 <h3 className="text-md font-bold text-gray-800 mb-4">Change Password</h3>
                 
                 <div className="space-y-3">
                   <input 
                     type="password" 
                     placeholder="Current Password (Required to change)" 
                     className="w-full border p-2 rounded"
                     value={passwords.currentPassword}
                     onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                   />
                   <input 
                     type="password" 
                     placeholder="New Password" 
                     className="w-full border p-2 rounded"
                     value={passwords.newPassword}
                     onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                   />
                   <input 
                     type="password" 
                     placeholder="Confirm New Password" 
                     className="w-full border p-2 rounded"
                     value={passwords.confirmPassword}
                     onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                   />
                 </div>
               </div>

               <div className="pt-4">
                 <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 shadow">
                   Save Changes
                 </button>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;