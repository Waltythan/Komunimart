// src/frontend/components/AuthRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getSessionData } from '../../services/authServices';

interface AuthRouteProps {
  children: ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const token = getSessionData();
  
  if (token) {
    // User is already logged in, redirect to home
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

export default AuthRoute;
