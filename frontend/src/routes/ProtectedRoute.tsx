import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from "jwt-decode";

interface Props {
  allowedRoles?: string[];
}

interface DecodedToken {
  role: string;
  exp: number;
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { token } = useAuth(); // We only trust the token string
  const location = useLocation();

  // 1. No Token? Kick them out immediately.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    // 2. Decode the token to get the REAL role
    const decoded: DecodedToken = jwtDecode(token);
    const userRole = decoded.role;
    const currentTime = Date.now() / 1000;

    // 3. Check for Token Expiry
    if (decoded.exp < currentTime) {
      localStorage.clear(); // Or use your logout function
      return <Navigate to="/login" replace />;
    }

    // 4. ROLE CHECK (The Critical Fix)
    // If allowedRoles are set, and the user's role isn't in the list -> BLOCK THEM
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // 5. Access Granted
    return <Outlet />;

  } catch (error) {
    // If token is invalid/corrupted
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;