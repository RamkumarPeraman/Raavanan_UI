import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ensureAccess, selectAccess } from '../store/accessStore';

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

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const dispatch = useDispatch();
  const access = useSelector(selectAccess);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('authToken');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRequiredRoles = Array.isArray(requiredRole) ? requiredRole.map(normalizeRole) : [];
  const userRole = normalizeRole(user.role);

  if (normalizedRequiredRoles.length > 0 && !normalizedRequiredRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermission && (access.token !== token || ['idle', 'loading'].includes(access.status))) return <div className="p-8 text-center text-gray-500">Checking access...</div>;
  if (requiredPermission && access.status === 'failed') return <div className="p-8 text-center text-gray-500">Could not verify access. <button type="button" onClick={() => { void dispatch(ensureAccess()); }} className="text-primary-700 underline">Retry</button></div>;
  if (requiredPermission && !access.permissions.includes(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
