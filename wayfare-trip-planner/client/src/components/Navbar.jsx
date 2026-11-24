import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from './Icons.jsx';

export default function Navbar() {
  const { user, isPartner, signOut } = useAuth();
  const nav = useNavigate();

  const logout = () => {
    const to = isPartner ? '/admin/login' : '/login';
    signOut();
    nav(to);
  };

  return (
    <header className="topbar">
      <div className="wrap topbar-in">
        <Link to="/" className="brand"><Logo /> Wayfare</Link>
        <nav className="links">
          {!user && (
            <>
              <NavLink to="/login">Traveller sign in</NavLink>
              <NavLink to="/admin/login">Partner sign in</NavLink>
              <Link to="/register" className="btn sm">Get started</Link>
            </>
          )}
          {user && !isPartner && (
            <>
              <NavLink to="/plan">Plan a trip</NavLink>
              <NavLink to="/trips">My itineraries</NavLink>
            </>
          )}
          {isPartner && <NavLink to="/admin">Partner dashboard</NavLink>}
          {user && (
            <span className="who">
              <span className="avatar">{user.name?.[0]?.toUpperCase()}</span>
              <button className="linkbtn" onClick={logout}>Sign out</button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
