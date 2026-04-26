import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Renders children only if authenticated, otherwise shows login prompt overlay
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        flexDirection: 'column',
        gap: '16px',
        color: '#6c757d'
      }}>
        <div className="spinner" />
        <p>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // App.js will show Login instead
  }

  return children;
};

export default ProtectedRoute;
