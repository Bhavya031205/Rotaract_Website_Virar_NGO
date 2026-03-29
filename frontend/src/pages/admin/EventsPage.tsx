import { useEffect, useState } from "react";
import axios from "../../api/axios";
import ImageUpload from "../../components/ImageUpload";
import GalleryUpload from "../../components/GalleryUpload";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image: string;
  registration_link: string;
  gallery: string[];
  registration_status: string; // <--- NEW STATUS FIELD
}

interface Rsvp {
  name: string;
  email: string;
  status: string;
}

// === NEW: Event Card with ALWAYS VISIBLE Slider ===
const EventCard = ({ event, onEdit, onDelete, onViewRsvps, isSelected }: any) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Combine Main Image + Gallery
  const allImages = [event.image, ...(event.gallery || [])].filter(Boolean);

  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className={`bg-white rounded-lg shadow border overflow-hidden hover:shadow-lg transition ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      
      {/* IMAGE SLIDER AREA */}
      <div className="h-48 bg-gray-100 relative group">
        {allImages.length > 0 ? (
          <img src={allImages[currentImgIndex]} alt={event.title} className="w-full h-full object-cover transition-all duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}

        {/* Navigation Arrows - ALWAYS VISIBLE if > 1 image */}
        {allImages.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-10"
              title="Previous Image"
            >
              ◀
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-10"
              title="Next Image"
            >
              ▶
            </button>
            
            {/* Image Counter Badge */}
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {currentImgIndex + 1} / {allImages.length}
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/20 p-1 rounded-full">
              {allImages.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        {/* Status Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded uppercase shadow-sm ${
            event.registration_status === 'full' ? 'bg-red-600 text-white' : 
            event.registration_status === 'closed' ? 'bg-gray-600 text-white' : 
            'bg-green-600 text-white'
        }`}>
            {event.registration_status === 'full' ? 'Slots Full' : event.registration_status || 'Open'}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{event.title}</h3>
        <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
          {new Date(event.event_date).toLocaleDateString()} • {event.event_time}
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{event.description}</p>
        
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm pt-3 border-t">
          <div className="flex gap-2">
            <button onClick={() => onEdit(event)} className="text-blue-600 font-medium hover:underline">Edit</button>
            <button onClick={() => onDelete(event.id)} className="text-red-600 font-medium hover:underline">Delete</button>
          </div>
          <button onClick={() => onViewRsvps(event.id)} className="bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 text-xs font-bold border">
            View RSVPs
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Event>>({
    title: "", description: "", event_date: "", event_time: "", 
    location: "", image: "", registration_link: "", gallery: [],
    registration_status: "open"
  });
  const [isEditing, setIsEditing] = useState(false);

  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await axios.put(`/events/${formData.id}`, formData);
        alert("Event Updated!");
      } else {
        await axios.post("/events", formData);
        alert("Event Created!");
      }
      setShowForm(false);
      setIsEditing(false);
      setFormData({ 
        title: "", description: "", event_date: "", event_time: "", 
        location: "", image: "", registration_link: "", gallery: [], registration_status: "open" 
      });
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Failed to save event");
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({ 
        ...event, 
        gallery: event.gallery || [],
        registration_status: event.registration_status || "open"
    });
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo(0,0);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this event?")) {
      await axios.delete(`/events/${id}`);
      fetchEvents();
    }
  };

  const viewRsvps = async (id: number) => {
    try {
      const res = await axios.get(`/events/${id}/rsvps`);
      setRsvps(res.data);
      setSelectedEventId(id);
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
    } catch (err) {
      console.error(err);
      alert("Could not load RSVPs. Check console for details.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Events Management</h1>
          <p className="text-gray-500">Manage Upcoming & Past Events</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setIsEditing(false); setFormData({ gallery: [], registration_status: "open" }); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          {showForm ? "Close Form" : "+ Create Event"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 text-blue-900">{isEditing ? "Edit Event" : "Add New Event"}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Title</label>
                <input required placeholder="Event Title" className="w-full border p-2 rounded mt-1"
                  value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input placeholder="Location" className="w-full border p-2 rounded mt-1"
                  value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input required type="date" className="w-full border p-2 rounded mt-1"
                  value={formData.event_date ? formData.event_date.split('T')[0] : ""} 
                  onChange={e => setFormData({...formData, event_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input placeholder="Time (e.g. 10:00 AM)" className="w-full border p-2 rounded mt-1"
                  value={formData.event_time || ""} onChange={e => setFormData({...formData, event_time: e.target.value})} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea required rows={3} className="w-full border p-2 rounded mt-1"
                value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Link</label>
                    <input placeholder="https://forms.google.com/..." className="w-full border p-2 rounded mt-1"
                    value={formData.registration_link || ""} onChange={e => setFormData({...formData, registration_link: e.target.value})} />
                </div>
                
                {/* STATUS DROPDOWN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Status</label>
                    <select 
                        className="w-full border p-2 rounded mt-1 bg-gray-50 font-bold"
                        value={formData.registration_status} 
                        onChange={e => setFormData({...formData, registration_status: e.target.value})}
                    >
                        <option value="open">🟢 Open (Taking Registrations)</option>
                        <option value="full">🔴 Slots Full</option>
                        <option value="closed">⚪ Closed / Completed</option>
                    </select>
                </div>
            </div>

            <div className="border-t pt-4 mt-4">
               <h3 className="text-md font-bold text-gray-800 mb-4">Event Visuals</h3>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Main Cover Image</label>
                    <ImageUpload onUpload={(url) => setFormData({...formData, image: url})} currentImage={formData.image} />
                 </div>
                 <div className="lg:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Event Gallery (Max 6)</label>
                    <GalleryUpload images={formData.gallery || []} onChange={(newGallery) => setFormData({...formData, gallery: newGallery})} />
                 </div>
               </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow">
                {isEditing ? "Update Event" : "Save Event"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EVENTS LIST WITH SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard 
            key={event.id}
            event={event}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewRsvps={viewRsvps}
            isSelected={selectedEventId === event.id}
          />
        ))}
      </div>

      {selectedEventId && (
        <div className="mt-12 bg-white p-8 rounded-lg shadow-xl border border-blue-100 animate-slide-up">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">
              RSVP List: <span className="text-blue-600">{events.find(e => e.id === selectedEventId)?.title}</span>
            </h3>
            <button onClick={() => setSelectedEventId(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
          </div>
          {rsvps.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No RSVPs received for this event yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rsvps.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase 
                          ${r.status === 'going' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;