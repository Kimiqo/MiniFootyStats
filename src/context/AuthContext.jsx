import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as loginApi } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('admin');
    
    if (storedToken && storedAdmin) {
      const adminData = JSON.parse(storedAdmin);
      setToken(storedToken);
      setAdmin(adminData);
      setGroupId(adminData.groupId);
      setGroup(adminData.group);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginApi({ email, password });
      const { token: newToken, admin: adminData } = response;
      
      setToken(newToken);
      setAdmin(adminData);
      setGroupId(adminData.groupId);
      setGroup(adminData.group);
      
      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('admin', JSON.stringify(adminData));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    setGroupId(null);
    setGroup(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  };

  const isAuthenticated = !!token && !!admin;

  return (
    <AuthContext.Provider value={{ 
      admin, 
      token, 
      groupId, 
      group,
      login, 
      logout, 
      isAuthenticated, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
