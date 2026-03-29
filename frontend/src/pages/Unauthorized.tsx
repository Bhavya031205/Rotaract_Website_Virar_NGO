import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white p-4 rounded-full shadow-xl border-2 border-red-50 flex items-center justify-center">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Access Denied</h1>
          <p className="text-gray-500 text-lg">
            You don't have permission to view this page. <br />
            It requires specific role access.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-lg hover:shadow-gray-900/20"
          >
            <Home size={18} /> Home Page
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Error Code: 403 Forbidden
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;