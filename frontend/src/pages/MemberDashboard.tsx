import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { motion } from 'framer-motion';
import { 
  Mail, Save, LogOut, ExternalLink, Camera, Loader2, Linkedin, Trash2, Upload 
} from 'lucide-react';

// Define the shape of our Member Data
interface MemberProfile {
  id: number;
  name: string;
  email: string;
  designation: string;
  bio: string;
  image: string;
  linkedin?: string;
}

const MemberDashboard = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // 🟢 NEW: File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    bio: '',
    image: '',
    email: '',
    linkedin: ''
  });

  // Fetch Profile Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/members/me'); 
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          designation: res.data.designation || '',
          bio: res.data.bio || '',
          image: res.data.image || '',
          email: res.data.email || '',
          linkedin: res.data.linkedin || ''
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 🟢 NEW: Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create local preview
    }
  };

  // 🟢 NEW: Remove Image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({ ...formData, image: '' });
  };

  // 🟢 UPDATE: Handle Profile Update (with Image Upload)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image;

      // 1. If a new file is selected, upload it first
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        
        // Assuming your backend has a generic /upload endpoint
        // If not, ensure this matches your backend route
        const uploadRes = await axios.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        imageUrl = uploadRes.data.url; // Get the URL from server
      }

      // 2. Update the profile with new data (and new image URL)
      const updatedData = { ...formData, image: imageUrl };
      await axios.put('/members/me', updatedData);
      
      setProfile({ ...profile!, ...updatedData });
      setFormData(updatedData); // Sync state
      
      // Cleanup
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
      
      alert("Profile updated successfully!");

    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 1. HEADER & LOGOUT */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your personal details here.</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* 2. EXTERNAL LOGIN CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/a/a2/Rotaract_Logo.png" 
                alt="Rotaract" 
                className="h-8 brightness-0 invert" 
              />
              District 3141 Portal
            </h2>
            <p className="text-blue-200 max-w-lg">
              To access official district tools, reports, and administrative tasks, please login to the main Rotaract District 3141 portal.
            </p>
          </div>
          <a 
            href="https://app.rotaract3141.org/authentication/login" 
            target="_blank" 
            rel="noopener noreferrer"
            className="whitespace-nowrap px-6 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
          >
            Go to District Login <ExternalLink size={18} />
          </a>
        </motion.div>

        {/* 3. PROFILE EDITOR CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* LEFT: Profile Picture (Now Interactive) */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md relative">
                    <img 
                      src={previewUrl || formData.image || "https://via.placeholder.com/150"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 🟢 Overlay for Editing */}
                    {isEditing && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera size={24} />
                        <span className="text-xs font-bold mt-1">Change</span>
                      </div>
                    )}
                  </div>

                  {/* 🟢 File Input (Hidden) */}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* 🟢 Edit Mode Controls for Image */}
                  {isEditing && (
                    <div className="flex gap-2 mt-3">
                       <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                        title="Upload New Photo"
                      >
                        <Upload size={16} />
                      </button>
                      {(previewUrl || formData.image) && (
                        <button 
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 font-medium hover:underline text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* RIGHT: Details Form */}
              <div className="flex-1 space-y-6">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                      {/* Name & Designation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                          <input 
                            type="text" 
                            value={formData.designation}
                            onChange={(e) => setFormData({...formData, designation: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Email & LinkedIn Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                          <input 
                            type="url" 
                            placeholder="https://linkedin.com/in/..."
                            value={formData.linkedin}
                            onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                      
                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea 
                          rows={4}
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          type="submit"
                          disabled={uploading}
                          className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          {uploading ? 'Uploading...' : 'Save Changes'}
                        </button>
                        <button 
                          type="button"
                          disabled={uploading}
                          onClick={() => {
                            setIsEditing(false);
                            setSelectedFile(null); // Reset file selection on cancel
                            setPreviewUrl(null);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mt-2">
                        {profile?.designation || "Member"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={18} />
                        <span>{profile?.email}</span>
                      </div>
                      {profile?.linkedin && (
                        <div className="flex items-center gap-2 text-blue-700">
                          <Linkedin size={18} />
                          <a 
                            href={profile.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:underline text-sm font-medium"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {profile?.bio || "No bio added yet."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;