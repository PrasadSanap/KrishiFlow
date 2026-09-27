import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const RoleProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin' : user.role === 'centre' ? '/centre' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
