import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Calendar, 
  Megaphone, 
  Briefcase, 
  Home, 
  FileText, 
  Phone, 
  HelpCircle,
  Globe,
  UserCircle,
  HandCoins,
  PenTool, // <--- New Icon for Donations
  Settings   // <--- New Icon for Settings
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // 1. Management Links (Added 'Donations')
  const menuItems = [
    { name: 'Activity Logs', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={20} /> },
    { name: 'Membership Requests', path: '/admin/requests', icon: <Mail size={20} /> },
    { name: 'Donations', path: '/admin/donations', icon: <HandCoins size={20} /> }, // <--- NEW
    { name: 'Events', path: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={20} /> },
    { name: 'Projects', path: '/admin/projects', icon: <Briefcase size={20} /> },
  ];

  // 2. Content Links (Added 'Donation Settings')
  const contentItems = [
    { name: 'Edit Home', path: '/admin/edit-home', icon: <Home size={20} /> },
    { name: 'Edit About Us', path: '/admin/edit-about', icon: <FileText size={20} /> },
    { name: 'Edit Contact', path: '/admin/edit-contact', icon: <Phone size={20} /> },
    { name: 'Donation Settings', path: '/admin/settings', icon: <Settings size={20} /> }, // <--- NEW
    { name: 'Stories & Updates', path: '/admin/blog', icon: <PenTool size={20} /> },
    { name: 'Q&A Manager', path: '/admin/faqs', icon: <HelpCircle size={20} /> },
  ];

  // 3. Account Section
  const accountItems = [
    { name: 'My Profile', path: '/admin/profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen flex-shrink-0 shadow-xl z-20">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-wider text-white">NGO Admin</h2>
        <p className="text-xs text-slate-400 mt-1">Management System</p>
      </div>

      {/* Scrollable Nav Area */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-8 custom-scrollbar">
        
        {/* Main Management Section */}
        <div>
          <p className="px-6 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Management
          </p>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 transition-all duration-200 group ${
                    isActive(item.path) 
                      ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`mr-3 transition-transform ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Website Content Section */}
        <div>
          <p className="px-6 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Website Content
          </p>
          <ul>
            {contentItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 transition-all duration-200 group ${
                    isActive(item.path) 
                      ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`mr-3 transition-transform ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account Section */}
        <div>
          <p className="px-6 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Account
          </p>
          <ul>
            {accountItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 transition-all duration-200 group ${
                    isActive(item.path) 
                      ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`mr-3 transition-transform ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </nav>

      {/* Footer / Back to Website */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all"
        >
          <Globe size={16} />
          <span>← Back to Website</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;