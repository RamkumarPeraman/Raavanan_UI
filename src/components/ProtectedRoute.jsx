import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return role;
  }

  const aliases = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    VOLUNTEER_COORDINATOR: 'volunteer_coordinator',
    MEMBER: 'member',
    VOLUNTEER: 'volunteer',
    DONOR: 'donor',
  };

  return aliases[role.trim().toUpperCase()] || role.trim().toLowerCase();
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('authToken');

  if (!token || !user) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  const normalizedRequiredRoles = Array.isArray(requiredRole) ? requiredRole.map(normalizeRole) : [];
  const userRole = normalizeRole(user.role);

  if (normalizedRequiredRoles.length > 0 && !normalizedRequiredRoles.includes(userRole)) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
