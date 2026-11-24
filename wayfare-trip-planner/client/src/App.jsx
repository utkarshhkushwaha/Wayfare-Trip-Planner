import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Planner from './pages/Planner.jsx';
import MyTrips from './pages/MyTrips.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="wrap page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth portal="user" mode="login" />} />
          <Route path="/register" element={<Auth portal="user" mode="register" />} />
          <Route path="/admin/login" element={<Auth portal="admin" mode="login" />} />
          <Route path="/admin/register" element={<Auth portal="admin" mode="register" />} />
          <Route path="/plan" element={<ProtectedRoute area="user"><Planner /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute area="user"><MyTrips /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute area="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="foot">
        <div className="wrap foot-in"><strong>Wayfare</strong><span>Compare routes and stays, then pick the itinerary that fits your budget.</span></div>
      </footer>
    </>
  );
}
