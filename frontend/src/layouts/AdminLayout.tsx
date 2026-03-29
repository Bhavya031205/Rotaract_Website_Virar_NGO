import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  // 1. Get the full user object (contains name, image, etc.)
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Admin Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          
          <div className="flex items-center gap-4">
            {/* Dynamic Welcome Message */}
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-bold text-blue-600">{user?.name || 'Admin'}</span>
            </span>

            {/* Profile Image (or Fallback Initials) */}
            {user?.image ? (
               <img 
                 src={user.image} 
                 alt="Profile" 
                 className="w-9 h-9 rounded-full border border-gray-200 object-cover shadow-sm" 
               />
            ) : (
               <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 border border-blue-200">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
               </div>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            <button 
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-bold transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;