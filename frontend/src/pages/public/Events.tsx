import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, ChevronLeft, ChevronRight, CheckCircle2, ExternalLink, Users, AlertCircle, Loader2
} from 'lucide-react';
import PixelBlast from '../../components/animations/PixelBlast'; // 👈 Swapped VantaGlobe for PixelBlast

// 1. Interface
interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image?: string;
  gallery?: string[]; 
  registration_link?: string;
  registration_status?: string; 
}

// 2. Event Card Component
const PublicEventCard = ({ event, isLoggedIn, rsvpStatus, onRsvp, isPast }: any) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const allImages = [event.image, ...(event.gallery || [])].filter(Boolean);

  const nextImage = () => setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  const status = event.registration_status || 'open';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden group border border-gray-100 dark:border-slate-800"
    >
      {/* IMAGE SLIDER */}
      <div className="h-56 w-full bg-gray-200 dark:bg-slate-800 relative overflow-hidden">
        {allImages.length > 0 ? (
          <img 
            src={allImages[currentImgIndex]} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-slate-800 text-blue-200 dark:text-slate-600">
            <Calendar className="w-16 h-16 opacity-50" />
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-2 text-center shadow-lg min-w-[70px] z-10 border border-white/50 dark:border-slate-700">
          <span className="block text-xs font-bold text-red-600 uppercase tracking-widest">
            {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
          </span>
          <span className="block text-2xl font-extrabold text-gray-900 dark:text-white leading-none">
            {new Date(event.event_date).getDate()}
          </span>
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); prevImage(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 z-10">
              <ChevronLeft size={20} />
            </button>
            <button onClick={(e) => { e.preventDefault(); nextImage(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 z-10">
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
           {isPast ? (
             <span className="bg-gray-800/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-gray-600">Past Event</span>
           ) : status === 'full' ? (
             <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">Slots Full</span>
           ) : (
             <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
               <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> Open
             </span>
           )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Clock size={16} className="mr-2 text-blue-500 flex-shrink-0" />
            <span>{event.event_time}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <MapPin size={16} className="mr-2 text-red-500 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
          {event.description}
        </p>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-auto">
          {isPast ? (
             <button disabled className="w-full bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 font-medium py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 cursor-not-allowed text-sm">
               Event Concluded
             </button>
          ) : (
            <>
              {status === 'full' ? (
                <button disabled className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 font-bold py-2.5 rounded-xl border border-red-100 dark:border-red-900 cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                  <AlertCircle size={16} /> Registration Full
                </button>
              ) : status === 'closed' ? (
                <button disabled className="w-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold py-2.5 rounded-xl cursor-not-allowed text-sm">
                  Registration Closed
                </button>
              ) : (
                <>
                  {isLoggedIn ? (
                    <button 
                      onClick={() => onRsvp(event.id)}
                      disabled={rsvpStatus === 'Confirmed'}
                      className={`w-full font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm ${
                        rsvpStatus === 'Confirmed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default border border-green-200 dark:border-green-800' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                      }`}
                    >
                      {rsvpStatus === 'Confirmed' ? <><CheckCircle2 size={18} /> Confirmed</> : <><Users size={18} /> Quick Member RSVP</>}
                    </button>
                  ) : (
                    event.registration_link ? (
                      <a href={event.registration_link} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-white dark:bg-transparent border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm">
                        Register Now <ExternalLink size={16} />
                      </a>
                    ) : (
                      <button disabled className="w-full bg-gray-100 dark:bg-slate-800 text-gray-400 font-bold py-2.5 rounded-xl cursor-not-allowed text-sm">
                        Registration Closed
                      </button>
                    )
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const { token } = useAuth(); 
  const isLoggedIn = !!token; 

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [rsvpStatus, setRsvpStatus] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/events/public');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleMemberRsvp = async (eventId: number) => {
    if (!isLoggedIn) return; 
    try {
      await axios.post(`/events/${eventId}/rsvp`, { status: 'going' });
      setRsvpStatus({ ...rsvpStatus, [eventId]: 'Confirmed' });
      alert("Success! You are registered for this event.");
    } catch (error) {
      alert("Failed to RSVP. You might already be registered.");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.event_date);
    return filter === 'upcoming' ? eventDate >= today : eventDate < today;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.event_date).getTime();
    const dateB = new Date(b.event_date).getTime();
    return filter === 'upcoming' ? dateA - dateB : dateB - dateA;
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-sans transition-colors duration-300">
      
      {/* 🚀 BOX CARD HERO SECTION (Matches Projects.tsx Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-[450px] w-full flex flex-col items-center justify-center text-center overflow-hidden bg-black dark:bg-white rounded-3xl shadow-2xl isolate transition-colors duration-500">
          
          {/* 🟢 1. Animation Layer */}
          <div className="absolute inset-0 z-0">
            <PixelBlast
              variant="square"
              pixelSize={4}
              color="#284fe3" // Stays Blue in both modes
              patternScale={2}
              patternDensity={1}
              pixelSizeJitter={0}
              enableRipples={true}
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid={false}
              speed={0.5}
              edgeFade={0.1}
              transparent={true} // Transparent to let bg-black/bg-white show
            />
          </div>

          {/* 🟢 2. The Text Content */}
          <div className="relative z-10 px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-300 dark:text-blue-600 text-sm font-bold mb-4 backdrop-blur-md uppercase tracking-widest shadow-sm">
                Get Involved
              </span>
              {/* 🟢 Text Inversion: White in Light Mode, Slate-900 in Dark Mode */}
              <h1 className="text-5xl md:text-7xl font-extrabold text-white dark:text-slate-900 mb-6 tracking-tight drop-shadow-2xl dark:drop-shadow-none">
                Events & Campaigns
              </h1>
              <p className="text-xl text-slate-300 dark:text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                Join us in our mission. Participate in our upcoming medical camps, fundraisers, and awareness drives.
              </p>
            </motion.div>
          </div>
          
          {/* 🟢 3. Bottom Card Fade (Inverts with theme) */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 dark:from-white/90 to-transparent z-10 pointer-events-none transition-colors duration-500" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 inline-flex relative">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${
                filter === 'upcoming' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${
                filter === 'past' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <AnimatePresence mode='wait'>
          {sortedEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800 max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-gray-400 dark:text-slate-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Events Found</h3>
              <p className="text-slate-500 dark:text-slate-400">
                {filter === 'upcoming' ? 'We are planning something exciting! Check back soon.' : 'No past event history available.'}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {sortedEvents.map((event) => (
                <PublicEventCard 
                  key={event.id}
                  event={event}
                  isLoggedIn={isLoggedIn}
                  rsvpStatus={rsvpStatus[event.id]}
                  onRsvp={handleMemberRsvp}
                  isPast={filter === 'past'}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Events;