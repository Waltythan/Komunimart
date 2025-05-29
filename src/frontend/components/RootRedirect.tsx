// src/frontend/components/RootRedirect.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getSessionData } from '../../services/authServices';

const RootRedirect: React.FC = () => {
  const token = getSessionData();
  
  useEffect(() => {
    // This component will only render briefly before redirecting
  }, []);
  
  if (token) {
    // User is logged in, redirect to home
    return <Navigate to="/home" replace />;
  } else {
    // User is not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
};

export default RootRedirect;
