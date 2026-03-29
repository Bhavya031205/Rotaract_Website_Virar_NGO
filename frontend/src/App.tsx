import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import { ThemeProvider } from "./context/ThemeContext"; 
import { ScrollProgress } from './components/animations/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import SiteFooter from './components/layout/SiteFooter';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Projects from './pages/public/Projects';
import PublicEvents from './pages/public/Events';
import Announcements from './pages/public/Announcements';
import Members from './pages/public/Members';
import BecomeMember from './pages/public/BecomeMember';
import Donate from './pages/public/Donate';
import Contact from './pages/public/Contact';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost'; 

// 🟢 NEW: IMPORT PROJECT DETAILS PAGE
import ProjectDetails from './pages/public/ProjectDetails';

// Auth & Errors
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminLayout from './layouts/AdminLayout';
import AdminEvents from './pages/admin/EventsPage';
import AdminAnnouncements from './pages/admin/AnnouncementsPage';
import MembershipRequests from './pages/admin/MembershipRequests';
import MembersPage from './pages/admin/MembersPage';
import EditAbout from './pages/admin/EditAbout';
import EditHome from './pages/admin/EditHome';
import AdminProjects from './pages/admin/AdminProjects';
import EditContact from './pages/admin/EditContact'; 
import AdminFAQ from './pages/admin/AdminFAQ';
import AdminProfile from "./pages/admin/AdminProfile";
import DonationHistory from './pages/admin/DonationHistory';
import DonationSettings from './pages/admin/DonationSettings';
import AdminBlog from './pages/admin/AdminBlog'; 

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import MemberEvents from './pages/member/EventsPage';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-slate-950 dark:text-white flex flex-col">
        
        <ScrollToTop />
        <ScrollProgress />
        
        {!isAdminRoute && <Navbar />}

        <main className="flex-grow">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            
            {/* 🟢 PROJECTS ROUTES */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} /> 
            
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/members" element={<Members />} />
            <Route path="/become-member" element={<BecomeMember />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* BLOG ROUTES */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<ActivityLogs />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="requests" element={<MembershipRequests />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="donations" element={<DonationHistory />} />
                <Route path="settings" element={<DonationSettings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="edit-home" element={<EditHome />} />
                <Route path="edit-about" element={<EditAbout />} />
                <Route path="edit-contact" element={<EditContact />} />
                <Route path="faqs" element={<AdminFAQ />} />
                <Route path="blog" element={<AdminBlog />} /> 
              </Route>
            </Route>

            {/* MEMBER ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
              <Route path="/member" element={<MemberDashboard />} />
              <Route path="/member/events" element={<MemberEvents />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {!isAdminRoute && <SiteFooter />}

      </div>
    </ThemeProvider>
  );
}

export default App;