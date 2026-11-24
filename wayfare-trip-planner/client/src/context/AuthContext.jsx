import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wf_user'));
    } catch {
      return null;
    }
  });

  const signIn = ({ token, user }) => {
    localStorage.setItem('wf_token', token);
    localStorage.setItem('wf_user', JSON.stringify(user));
    setUser(user);
  };

  const signOut = () => {
    localStorage.removeItem('wf_token');
    localStorage.removeItem('wf_user');
    setUser(null);
  };

  const isPartner = user && user.role !== 'user';

  return <AuthContext.Provider value={{ user, isPartner, signIn, signOut }}>{children}</AuthContext.Provider>;
}
