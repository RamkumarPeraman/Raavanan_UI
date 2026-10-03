import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pagePermissionByPath } from '../constants/pageAccess';
import { ensureAccess, selectAccess } from '../store/accessStore';

const PageAccessGate = ({ pathname, children }) => {
  const dispatch = useDispatch();
  const access = useSelector(selectAccess);
  const token = localStorage.getItem('authToken');
  const permission = pagePermissionByPath[pathname];

  if (!token || !permission) return children;
  if (access.token !== token || ['idle', 'loading'].includes(access.status)) {
    return <div className="p-8 text-center text-gray-500">Checking access...</div>;
  }
  if (access.status === 'failed') {
    return <div className="mx-auto max-w-xl px-4 py-32 text-center"><h1 className="text-2xl font-semibold text-gray-900">Could not verify access</h1><p className="mt-3 text-gray-600">{access.error}</p><button type="button" onClick={() => { void dispatch(ensureAccess()); }} className="mt-4 rounded bg-primary-600 px-4 py-2 text-white">Retry</button></div>;
  }
  if (!access.permissions.includes(permission)) {
    return <div className="mx-auto max-w-xl px-4 py-32 text-center"><h1 className="text-2xl font-semibold text-gray-900">Access restricted</h1><p className="mt-3 text-gray-600">Your role does not have access to this page.</p></div>;
  }
  return children;
};

export default PageAccessGate;
