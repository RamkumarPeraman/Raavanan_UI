import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { FiEdit2, FiPlus, FiTrash2, FiShield } from 'react-icons/fi';
import CommonPopup from '../../components/common/CommonPopup';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';
import { refreshAccess } from '../../store/accessStore';
import { accountFlowPages, pageGroups, pagePermissions } from '../../constants/pageAccess';

const isProtectedRole = role => role.isSystem || ['super_admin', 'admin', 'member'].includes(role.name?.toLowerCase());

const RolesManagementPage = () => {
  const dispatch = useDispatch();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionGroups, setPermissionGroups] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ displayName: '', description: '', permissions: ['page:home'] });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = currentUser.role?.toLowerCase() === 'super_admin';

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const [response, permissionResponse] = await Promise.all([apiService.getRoles(), apiService.getRolePermissions()]);
      const rolesData = response?.data || [];
      if (!pagePermissions.every(permission => permissionResponse?.data?.grouped?.page?.includes(permission))) {
        throw new Error('The API page permission catalog is unavailable. Restart the API and retry.');
      }
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissionGroups(permissionResponse?.data?.grouped || {});
    } catch (error) {
      setLoadError(true);
      toast.error(error.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleSaveRole = async (e) => {
    e.preventDefault();
    const displayName = draft.displayName.trim();
    const name = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!displayName || (editing.mode === 'create' && !name)) {
      toast.error('Enter a valid role name');
      return;
    }
    if (!draft.permissions.some(permission => permission.startsWith('page:'))) {
      toast.error('Select at least one page');
      return;
    }
    setSubmitting(true);
    try {
      const permissions = [...new Set([
        ...draft.permissions,
        'page:home',
        ...(draft.permissions.includes('page:my_groups') ? ['users:read'] : []),
        ...(draft.permissions.includes('page:roles') ? ['roles:read'] : []),
      ])];
      const payload = { displayName, description: draft.description.trim(), permissions };
      if (editing.mode === 'create') await apiService.createRole({ ...payload, name });
      else await apiService.updateRole(editing.role.id, payload);
      await dispatch(refreshAccess());
      if (editing.mode === 'create') setPage(Math.ceil((roles.length + 1) / pageSize));
      toast.success(editing.mode === 'create' ? 'Role created successfully' : 'Role updated successfully');
      setEditing(null);
      await fetchRoles();
    } catch (error) {
      toast.error(error.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    setDeletingId(deleteTarget.id);
    try {
      await apiService.deleteRole(deleteTarget.id);
      await dispatch(refreshAccess());
      toast.success('Role deleted successfully');
      setDeleteTarget(null);
      await fetchRoles();
    } catch (error) {
      toast.error(error.message || 'Failed to delete role');
    } finally {
      setDeletingId(null);
    }
  };

  const formatRoleName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const togglePermission = (permission) => {
    setDraft(previous => {
      const selected = previous.permissions.includes(permission);
      let permissions = selected
        ? previous.permissions.filter(item => item !== permission)
        : [...previous.permissions, permission];
      if (permission === 'users:read' && selected) permissions = permissions.filter(item => !['users:write', 'users:delete'].includes(item));
      if (permission.startsWith('users:') && permission !== 'users:read' && !selected && !permissions.includes('users:read')) permissions.push('users:read');
      return { ...previous, permissions };
    });
  };

  const togglePage = (permission) => {
    setDraft(previous => {
      const selected = previous.permissions.includes(permission);
      let permissions = selected ? previous.permissions.filter(item => item !== permission) : [...previous.permissions, permission];
      if (permission === 'page:my_groups') {
        permissions = selected ? permissions.filter(item => !item.startsWith('users:')) : [...new Set([...permissions, 'users:read'])];
      }
      if (permission === 'page:roles') {
        permissions = selected ? permissions.filter(item => item !== 'roles:read') : [...new Set([...permissions, 'roles:read'])];
      }
      return { ...previous, permissions };
    });
  };

  const openEditRole = (role) => {
    const saved = Array.isArray(role.permissions) ? role.permissions : [];
    const privileged = ['admin', 'super_admin'].includes(role.name);
    const legacyPages = pagePermissions.filter(permission =>
      (permission !== 'page:admin' || privileged)
      && (permission !== 'page:my_groups' || privileged || saved.includes('users:read'))
      && (permission !== 'page:roles' || privileged || saved.includes('roles:read')));
    const permissions = saved.some(permission => permission.startsWith('page:')) ? saved : [...saved, ...legacyPages];
    setDraft({ displayName: role.displayName || formatRoleName(role.name), description: role.description || '', permissions: [...new Set([...permissions, 'page:home'])] });
    setEditing({ mode: 'edit', role });
  };

  const currentPage = Math.min(page, Math.max(1, Math.ceil(roles.length / pageSize)));
  const visibleRoles = roles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-gray-50 px-[5px] pt-20">
      <div className="mb-3 flex shrink-0 justify-end">
          {canManage && (
            <button
              disabled={submitting || Boolean(deletingId)}
              onClick={() => { setDraft({ displayName: '', description: '', permissions: ['page:home'] }); setEditing({ mode: 'create' }); }}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary-600 px-3 text-xs font-medium text-white hover:bg-primary-700"
            >
              <FiPlus /> Add Role
            </button>
          )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-md border border-gray-200 bg-white">
        {loading ? <div className="flex min-h-0 flex-1 items-center justify-center text-gray-500">Loading roles...</div>
          : loadError ? <div className="flex min-h-0 flex-1 items-center justify-center text-gray-600">Could not load roles. <button onClick={fetchRoles} className="ml-1 text-primary-700 underline">Retry</button></div>
            : roles.length === 0 ? <div className="flex min-h-0 flex-1 items-center justify-center text-gray-500">No roles found</div>
              : <>
          <div className="admin-table-scroll hidden min-h-0 flex-1 overflow-auto overscroll-contain lg:block">
            <table className="w-full table-fixed text-sm">
              <colgroup><col className="w-[23%]" /><col className="w-[42%]" /><col className="w-[15%]" /><col className={canManage ? 'w-[10%]' : 'w-[20%]'} />{canManage && <col className="w-[10%]" />}</colgroup>
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">Access</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                  {canManage && (
                    <th className="px-3 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <FiShield className={`shrink-0 ${isProtectedRole(role) ? 'text-purple-500' : 'text-gray-400'}`} />
                        <span className="truncate font-medium text-gray-900" title={role.displayName || formatRoleName(role.name)}>{role.displayName || formatRoleName(role.name)}</span>
                      </div>
                    </td>
                    <td className="truncate px-3 py-3 text-gray-500" title={role.description || ''}>{role.description || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{role.permissions?.length || 0} permissions</td>
                    <td className="px-3 py-3">
                      {isProtectedRole(role) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">System</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Custom</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <button onClick={() => openEditRole(role)} disabled={submitting} data-tooltip="Edit role" className="rounded p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40" aria-label={`Edit ${role.displayName || role.name}`}><FiEdit2 size={16} /></button>
                        {!isProtectedRole(role) && (
                          <button
                            onClick={() => setDeleteTarget(role)}
                            disabled={Boolean(deletingId)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded hover:bg-red-50 transition-colors"
                            data-tooltip="Delete role" aria-label="Delete role"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-table-scroll min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-2 lg:hidden">
            {visibleRoles.map(role => <article key={role.id} className="rounded-lg border bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2 font-semibold text-gray-900"><FiShield className="shrink-0 text-primary-600" /><span className="min-w-0 break-words">{role.displayName || formatRoleName(role.name)}</span></div><span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${isProtectedRole(role) ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{isProtectedRole(role) ? 'System' : 'Custom'}</span></div>
              <p className="mt-2 text-gray-600">{role.description || 'No description'}</p>
              <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-gray-500"><span>{role.permissions?.length || 0} permissions</span>{canManage && <div className="flex items-center gap-1"><button onClick={() => openEditRole(role)} disabled={submitting} data-tooltip="Edit role" className="rounded p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40" aria-label={`Edit ${role.displayName || role.name}`}><FiEdit2 size={16} /></button>{!isProtectedRole(role) && <button onClick={() => setDeleteTarget(role)} disabled={Boolean(deletingId)} data-tooltip="Delete role" className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-40" aria-label={`Delete ${role.displayName || role.name}`}><FiTrash2 size={16} /></button>}</div>}</div>
            </article>)}
          </div>
        </>}
        <Pagination page={currentPage} pageSize={pageSize} total={roles.length} onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} disabled={loading} itemLabel="Roles" pageSizeOptions={[5, 10, 20, 50]} />
      </div>
      <CommonPopup open={Boolean(editing)} title={editing?.mode === 'create' ? 'Add Role' : 'Edit Role'} description="Choose the pages and actions this role can access." onClose={() => setEditing(null)} busy={submitting} closeWhileBusy size="lg" footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded border px-4 py-2">Cancel</button><button type="submit" form="role-form" disabled={submitting} className="rounded bg-primary-600 px-4 py-2 text-white disabled:opacity-50">{submitting ? 'Saving...' : 'Save Role'}</button></div>}>
        <form id="role-form" onSubmit={handleSaveRole} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="min-w-0"><label htmlFor="role-name" className="mb-1 block font-medium">Role name *</label><input id="role-name" required maxLength={80} value={draft.displayName} onChange={event => setDraft({ ...draft, displayName: event.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none" placeholder="e.g. Team Lead" /></div>
            <div className="min-w-0"><label htmlFor="role-description" className="mb-1 block font-medium">Description</label><textarea id="role-description" rows={1} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} className="w-full resize-y rounded border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none" placeholder="What can this role do?" /></div>
          </div>
          <fieldset className="min-w-0">
            <legend className="mb-2 font-semibold">Page access</legend>
            <div className="admin-table-scroll max-h-[44dvh] min-h-[180px] space-y-4 overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
            {pageGroups.map(group => <div key={group.label}>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">{group.label}</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{group.pages.filter(([, , key]) => permissionGroups.page?.includes(`page:${key}`)).map(([label, path, key]) => {
                const permission = `page:${key}`;
                const locked = key === 'home' || editing?.role?.name === 'super_admin' || (key === 'admin' && !['admin', 'super_admin'].includes(editing?.role?.name));
                return <label key={path} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${locked ? 'cursor-not-allowed bg-gray-50 text-gray-400' : 'cursor-pointer hover:border-primary-300'}`}>
                  <input type="checkbox" checked={draft.permissions.includes(permission)} disabled={locked} onChange={() => togglePage(permission)} className="accent-primary-600" />
                  <span>{label}</span>
                </label>;
              })}</div>
            </div>)}
            <div><h3 className="mb-2 text-sm font-semibold text-gray-800">Account access</h3><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{accountFlowPages.map(([label, path]) => <div key={path} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-500">{label} · Public</div>)}</div></div>
            {draft.permissions.includes('page:my_groups') && <fieldset><legend className="mb-2 font-semibold">User Management actions</legend><div className="flex flex-wrap gap-4">{(permissionGroups.users || []).filter(permission => permission !== 'users:read').map(permission => <label key={permission} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={draft.permissions.includes(permission)} onChange={() => togglePermission(permission)} className="accent-primary-600" />{formatRoleName(permission.split(':')[1])}</label>)}</div></fieldset>}
            </div>
          </fieldset>
        </form>
      </CommonPopup>
      <CommonPopup open={Boolean(deleteTarget)} title="Delete role" onClose={() => setDeleteTarget(null)} busy={Boolean(deletingId)} closeWhileBusy size="sm" footer={<div className="flex justify-end gap-2"><button onClick={() => setDeleteTarget(null)} className="rounded border px-4 py-2">Cancel</button><button onClick={handleDeleteRole} disabled={Boolean(deletingId)} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50">{deletingId ? 'Deleting...' : 'Delete Role'}</button></div>}><p>Delete <strong>{deleteTarget?.displayName || deleteTarget?.name}</strong>? Roles assigned to users cannot be deleted.</p></CommonPopup>
    </div>
  );
};

export default RolesManagementPage;
