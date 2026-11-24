import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// area: 'user' for travellers, 'admin' for travel/accommodation partners
export default function ProtectedRoute({ area, children }) {
  const { user, isPartner } = useAuth();
  if (!user) return <Navigate to={area === 'admin' ? '/admin/login' : '/login'} replace />;
  if (area === 'admin' && !isPartner) return <Navigate to="/plan" replace />;
  if (area === 'user' && isPartner) return <Navigate to="/admin" replace />;
  return children;
}
