import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader message="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader message="Checking authorization..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
