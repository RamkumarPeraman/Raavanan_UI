import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import { pagePermissionByPath } from '../constants/pageAccess';

const PageAccessGate = ({ pathname, children }) => {
  const [access, setAccess] = useState(null);
  const token = localStorage.getItem('authToken');
  const permission = pagePermissionByPath[pathname];

  useEffect(() => {
    if (!token || !permission) return undefined;
    let active = true;
    apiService.getMyRoleAccess()
      .then(result => { if (active) setAccess(result.permissions?.includes(permission) || false); })
      .catch(() => { if (active) setAccess(false); });
    return () => { active = false; };
  }, [permission, token]);

  if (!token || !permission) return children;
  if (access === null) return <div className="p-8 text-center text-gray-500">Checking access...</div>;
  if (!access) return <div className="mx-auto max-w-xl px-4 py-32 text-center"><h1 className="text-2xl font-semibold text-gray-900">Access restricted</h1><p className="mt-3 text-gray-600">Your role does not have access to this page.</p></div>;
  return children;
};

export default PageAccessGate;
