import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserId, getSessionData } from '../../services';

// Define the shape of auth context data
interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  loading: boolean;
  refreshAuth: () => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  token: null,
  loading: true,
  refreshAuth: () => {},
  logout: () => {}
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to refresh auth state
  const refreshAuth = () => {
    const storedToken = getSessionData();
    const currentUserId = getCurrentUserId();

    setToken(storedToken);
    setUserId(currentUserId);
    setIsAuthenticated(!!storedToken && !!currentUserId);
    setLoading(false);
  };

  // Function to handle logout
  const logout = () => {
    // Clear session storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user_id');
    
    // Update state
    setToken(null);
    setUserId(null);
    setIsAuthenticated(false);
  };

  // Check authentication on initial load
  useEffect(() => {
    refreshAuth();
  }, []);

  // Value object that will be available to consumer components
  const value = {
    isAuthenticated,
    userId,
    token,
    loading,
    refreshAuth,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
