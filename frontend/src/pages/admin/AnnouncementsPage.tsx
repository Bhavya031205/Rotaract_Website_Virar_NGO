import { useEffect, useState } from 'react';
import axios from '../../api/axios';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const AnnouncementsPage = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/announcements');
      setList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/announcements', form);
      setForm({ title: '', content: '', category: 'General' }); // Reset
      fetchAnnouncements();
      alert('Announcement Posted!');
    } catch (err) {
      alert('Failed to post announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this announcement?')) {
      await axios.delete(`/announcements/${id}`);
      fetchAnnouncements();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Announcements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: CREATE FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Post New Update</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  required
                  className="w-full border p-2 rounded mt-1"
                  placeholder="e.g. Health Camp Success"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select 
                  className="w-full border p-2 rounded mt-1"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="News">News</option>
                  <option value="Urgent">Urgent / Alert</option>
                  <option value="Event">Event Update</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border p-2 rounded mt-1"
                  placeholder="Write your announcement here..."
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
              >
                {isSubmitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: LIST */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-700">Recent Announcements</h2>
          
          {list.length === 0 && <p className="text-gray-500 italic">No announcements yet.</p>}

          {list.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full 
                    ${item.category === 'Urgent' ? 'bg-red-100 text-red-700' : 
                      item.category === 'News' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{item.content}</p>
              </div>
              
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-gray-400 hover:text-red-600 ml-4"
                title="Delete Announcement"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AnnouncementsPage;