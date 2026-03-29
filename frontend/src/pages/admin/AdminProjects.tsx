import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import ImageUpload from '../../components/ImageUpload';

// 1. DEFINE BACKEND URL
const API_BASE_URL = "http://localhost:5000";

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date?: string;
  location: string;
  beneficiaries: string;
  image: string;
}

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    status: 'Ongoing', 
    start_date: '', 
    end_date: '',
    location: '', 
    beneficiaries: '', 
    image: ''
  });

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // =========================================================
  // 2. THE FIX: CORRECTLY CONSTRUCT THE IMAGE URL
  // =========================================================
  // ... inside AdminProjects component ...

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // 1. If it's already a full valid URL (which new uploads will be), use it directly!
    if (imagePath.startsWith('http')) return imagePath; 
    
    // 2. Fallback for old data: Extract filename and rebuild URL
    const filename = imagePath.split(/[/\\]/).pop();
    if (!filename) return null;

    return `${API_BASE_URL}/uploads/${filename}`;
  };

  // ... rest of the code ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/projects/${editingId}`, form);
        alert('Project Updated Successfully!');
      } else {
        await axios.post('/projects', form);
        alert('Project Created Successfully!');
      }
      // Reset form & state
      setForm({ title: '', description: '', status: 'Ongoing', start_date: '', end_date: '', location: '', beneficiaries: '', image: '' });
      setShowForm(false);
      setEditingId(null);
      fetchProjects(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert('Operation failed. Check console for details.');
    }
  };

  const handleEdit = (p: Project) => {
    setForm({
      title: p.title, 
      description: p.description, 
      status: p.status, 
      start_date: p.start_date ? p.start_date.split('T')[0] : '', 
      end_date: p.end_date ? p.end_date.split('T')[0] : '',
      location: p.location || '', 
      beneficiaries: p.beneficiaries || '', 
      image: p.image || '' // Keep the filename so it shows in the edit form
    });
    setEditingId(p.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/projects/${id}`);
        fetchProjects();
      } catch (err) {
        alert('Failed to delete project.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Project Management</h1>
          <p className="text-gray-500">Showcase your NGO's work and impact.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', description: '', status: 'Ongoing', start_date: '', end_date: '', location: '', beneficiaries: '', image: '' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          {showForm ? 'Close Form' : '+ Add New Project'}
        </button>
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-4">{editingId ? 'Edit Project' : 'Create New Project'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                <input required className="w-full border p-2 rounded mt-1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full border p-2 rounded mt-1" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" className="w-full border p-2 rounded mt-1" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                <input type="date" className="w-full border p-2 rounded mt-1" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input placeholder="e.g. Nabha, Punjab" className="w-full border p-2 rounded mt-1" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Beneficiaries / Impact</label>
                <input placeholder="e.g. 500+ Students" className="w-full border p-2 rounded mt-1" value={form.beneficiaries} onChange={e => setForm({...form, beneficiaries: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea required rows={4} className="w-full border p-2 rounded mt-1" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            
            {/* IMAGE UPLOAD PREVIEW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Cover Image</label>
              
              <div className="flex items-center gap-4 mb-2">
                 {/* Show Current Image in Form if exists */}
                 {form.image && (
                   <div className="h-20 w-20 border rounded overflow-hidden relative bg-gray-100 flex-shrink-0">
                     <img 
                        src={getImageUrl(form.image) || ''} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-red-500 p-1 block text-center">Error</span>';
                        }} 
                     />
                   </div>
                 )}
                 <div className="flex-1">
                    <ImageUpload onUpload={(url) => setForm({...form, image: url})} currentImage={form.image} />
                 </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow-sm">
                {editingId ? 'Update Project' : 'Save Project'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. PROJECTS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition">
            
            {/* List Item Image */}
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              {p.image ? (
                <img 
                  src={getImageUrl(p.image) || ''} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  alt={p.title} 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'; // Hide if broken
                    e.currentTarget.nextElementSibling?.classList.remove('hidden'); // Show placeholder
                  }}
                />
              ) : null}
              
              {/* Fallback Placeholder */}
              <div className={`w-full h-full flex items-center justify-center text-gray-400 absolute top-0 left-0 bg-gray-100 ${p.image ? 'hidden' : ''}`}>
                <span className="text-sm">No Image</span>
              </div>
              
              <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded uppercase shadow-sm
                ${p.status === 'Completed' ? 'bg-green-500 text-white' : 
                  p.status === 'Planned' ? 'bg-yellow-500 text-white' : 'bg-blue-600 text-white'}`}>
                {p.status}
              </span>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{p.title}</h3>
              <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center">📍 {p.location || 'N/A'}</span>
                <span className="flex items-center">👥 {p.beneficiaries || 'N/A'}</span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">{p.description}</p>
              
              <div className="flex justify-between items-center border-t pt-3">
                 <span className="text-xs text-gray-400">
                   Started: {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'}
                 </span>
                 <div className="flex gap-3">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 text-sm font-semibold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 text-sm font-semibold hover:underline">Delete</button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;