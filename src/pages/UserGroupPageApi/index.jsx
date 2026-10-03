import { createPortal } from 'react-dom';
import CommonPopup from '../../components/common/CommonPopup';
import CommonSelect from '../../components/common/CommonSelect';
import Pagination from '../../components/common/Pagination';
import CommonLoader from '../../components/common/CommonLoader';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiEdit2, FiEye, FiFilter, FiUsers, FiCheckCircle, FiShield, FiHeart, FiLock, FiPlus, FiSearch, FiTrash2, FiUnlock, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import apiService from '../../services/api';
import UserPopup from '../../components/common/UserPopup';
import { selectPermissions } from '../../store/accessStore';

const roles = {
  super_admin: { name: 'Super Admin' },
  admin: { name: 'Admin' },
  manager: { name: 'Manager' },
  volunteer_coordinator: { name: 'Coordinator' },
  member: { name: 'Member' },
  volunteer: { name: 'Volunteer' },
  donor: { name: 'Donor' },
};

const departments = ['all', 'Administration', 'Education', 'Healthcare', 'Women Empowerment', 'Environment', 'Fundraising', 'Communications', 'HR', 'Finance', 'Events', 'Field Operations', 'Volunteer Management'];

const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return role;
  }

  const aliases = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  };

  return aliases[role.trim().toUpperCase()] || role.trim().toLowerCase();
};

const UserAvatar = ({ user, size = 'large' }) => {
  const sizeClass = size === 'small' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base';

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-bold text-primary-700 ring-1 ring-primary-200 ${sizeClass}`}>
      {user.name?.charAt(0)?.toUpperCase() || 'U'}
      {user.profileImage && (
        <img
          src={user.profileImage}
          alt={`${user.name || 'User'} profile`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />
      )}
    </div>
  );
};

const UserGroupPageApi = () => {
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const rolePermissions = useSelector(selectPermissions);
  const [availableRoles, setAvailableRoles] = useState(roles); // default to hardcoded

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiService.getRoles();
        const rolesData = response?.data || response || [];
        if (Array.isArray(rolesData) && rolesData.length > 0) {
          const rolesMap = {};
          rolesData.forEach(r => {
            rolesMap[r.name.toLowerCase()] = { name: r.displayName || r.name.replace(/_/g, ' ') };
          });
          setAvailableRoles(rolesMap);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);
  const [users, setUsers] = useState([]);
  const requestIdRef = useRef(0);
  const [stats, setStats] = useState({ total: 0, active: 0, leadership: 0, volunteers: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filterPosition, setFilterPosition] = useState(null);
  const [draftFilters, setDraftFilters] = useState({ role: 'all', department: 'all', status: 'all' });
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const openFilters = () => {
    if (filterPosition) { setFilterPosition(null); return; }
    setDraftFilters({ role: selectedRole, department: selectedDepartment, status: selectedStatus });
    const rect = filterButtonRef.current.getBoundingClientRect();
    setFilterPosition({ top: Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - 330)), left: Math.max(8, Math.min(rect.left, window.innerWidth - 304)) });
  };
  useEffect(() => {
    if (!filterPosition) return undefined;
    const dismiss = (event) => {
      if (!filterPanelRef.current?.contains(event.target) && !filterButtonRef.current?.contains(event.target) && !event.target.closest?.('[role="listbox"]')) setFilterPosition(null);
    };
    const keydown = (event) => { if (event.key === 'Escape') { setFilterPosition(null); filterButtonRef.current?.focus(); } };
    const resize = () => setFilterPosition(null);
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', keydown);
    window.addEventListener('resize', resize);
    filterPanelRef.current?.focus();
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', keydown); window.removeEventListener('resize', resize); };
  }, [filterPosition]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('view');
  const [selectedUser, setSelectedUser] = useState(null);

  const canEdit = useMemo(() => ['admin', 'super_admin'].includes(normalizeRole(currentUser?.role)) || rolePermissions.includes('users:write'), [currentUser, rolePermissions]);
  const canDelete = useMemo(() => normalizeRole(currentUser?.role) === 'super_admin' || rolePermissions.includes('users:delete'), [currentUser, rolePermissions]);

  const loadUsers = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const [userResponse, statsResponse] = await Promise.all([
        apiService.getUsers({
          search: searchTerm || undefined,
          role: ['leadership', 'volunteers'].includes(selectedRole) ? 'all' : selectedRole,
          department: selectedDepartment,
          status: selectedStatus,
        }),
        apiService.getUserStats(),
      ]);
      if (requestId !== requestIdRef.current) return;
      const result = userResponse.data || [];
      setUsers(selectedRole === 'leadership' ? result.filter(user => ['admin', 'super_admin', 'manager'].includes(normalizeRole(user.role))) : selectedRole === 'volunteers' ? result.filter(user => ['volunteer', 'volunteer_coordinator'].includes(normalizeRole(user.role))) : result);
      setStats(statsResponse.data || {});
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      toast.error(error.response?.data?.message || error.message || 'Failed to load users');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [searchTerm, selectedRole, selectedDepartment, selectedStatus]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSaveUser = async (userData) => {
    setSaving(true);
    try {
      const data = ['admin', 'super_admin'].includes(normalizeRole(currentUser?.role)) ? userData : { ...userData };
      if (!['admin', 'super_admin'].includes(normalizeRole(currentUser?.role)) && popupMode === 'edit') delete data.role;
      if (popupMode === 'add') {
        await apiService.createUser(data);
        toast.success('User created successfully');
      } else if (popupMode === 'edit') {
        await apiService.updateUser(selectedUser.id || selectedUser._id, data);
        toast.success('User updated successfully');
      }
      setShowPopup(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    setDeleting(true);

    try {
      await apiService.deleteUser(user.id || user._id);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const nextStatus = user.status === 'active' ? 'inactive' : 'active';
      await apiService.updateUserStatus(user.id || user._id, nextStatus);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update status');
    }
  };

  const openPopup = (mode, user = null) => {
    setPopupMode(mode);
    setSelectedUser(user);
    setShowPopup(true);
  };


  const currentPage = Math.min(page, Math.max(1, Math.ceil(users.length / pageSize)));
  const visibleUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const changeFilter = (setter) => (value) => { setter(value); setPage(1); };
  const formatDate = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  const statusBadge = (user) => <span className={`rounded-full px-2 py-0.5 text-xs ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{user.status || 'inactive'}</span>;
  const actions = (user) => <div className="flex items-center justify-end gap-1">
    <button aria-label="View user" data-tooltip="View user" onClick={() => openPopup('view', user)} className="rounded p-2 text-sky-700 hover:bg-sky-50"><FiEye /></button>
    {canEdit && <button aria-label={user.status === 'active' ? 'Deactivate user' : 'Activate user'} data-tooltip={user.status === 'active' ? 'Deactivate user' : 'Activate user'} onClick={() => toggleUserStatus(user)} className="rounded p-2 text-amber-700 hover:bg-amber-50">{user.status === 'active' ? <FiLock /> : <FiUnlock />}</button>}
    {canEdit && <button aria-label="Edit user" data-tooltip="Edit user" onClick={() => openPopup('edit', user)} className="rounded p-2 text-blue-700 hover:bg-blue-50"><FiEdit2 /></button>}
    {canDelete && (currentUser?.id || currentUser?._id) !== (user.id || user._id) && <button aria-label="Delete user" data-tooltip="Delete user" onClick={() => setDeleteTarget(user)} className="rounded p-2 text-red-700 hover:bg-red-50"><FiTrash2 /></button>}
  </div>;
  const summaries = [
    { label: 'ALL', count: stats.total, icon: FiUsers, active: selectedRole === 'all' && selectedStatus === 'all', action: () => { setSelectedRole('all'); setSelectedStatus('all'); setSelectedDepartment('all'); }, color: 'blue' },
    { label: 'Active', count: stats.active, icon: FiCheckCircle, active: selectedStatus === 'active', action: () => { setSelectedRole('all'); setSelectedStatus('active'); }, color: 'green' },
    { label: 'Leadership', count: stats.leadership, icon: FiShield, active: selectedRole === 'leadership', action: () => { setSelectedRole('leadership'); setSelectedStatus('all'); }, color: 'purple' },
    { label: 'Volunteers', count: stats.volunteers, icon: FiHeart, active: selectedRole === 'volunteers', action: () => { setSelectedRole('volunteers'); setSelectedStatus('all'); }, color: 'teal' },
    { label: 'Members', count: stats.members, icon: FiUsers, active: selectedRole === 'member', action: () => { setSelectedRole('member'); setSelectedStatus('all'); }, color: 'indigo' },
  ];
  const colors = { blue: 'bg-blue-50 text-blue-700 border-blue-200', green: 'bg-green-50 text-green-700 border-green-200', purple: 'bg-purple-50 text-purple-700 border-purple-200', teal: 'bg-teal-50 text-teal-700 border-teal-200', indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200' };

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-gray-50 px-[5px] pt-20">
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">        
        {summaries.map(({ icon: Icon, ...summary }) => <button key={summary.label} type="button" aria-pressed={summary.active} aria-label={summary.label} data-tooltip={summary.label} onClick={() => { summary.action(); setPage(1); }} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-xs ${colors[summary.color]} ${summary.active ? 'ring-1 ring-current font-semibold brightness-95' : ''}`}><Icon /><span>{summary.label}</span><span>{summary.count || 0}</span></button>)}
        <div className="relative w-full sm:ml-auto sm:w-48"><FiSearch className="absolute left-2.5 top-2.5 text-gray-400" /><input aria-label="Search users" value={searchTerm} onChange={(e) => changeFilter(setSearchTerm)(e.target.value)} placeholder="Search users…" className="h-[34px] w-full rounded-md border border-gray-200 bg-white pl-8 pr-2 text-xs focus:border-primary-500 focus:outline-none" /></div>
        <button ref={filterButtonRef} type="button" aria-expanded={Boolean(filterPosition)} aria-controls="user-filter-panel" onClick={openFilters} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-primary-700 hover:bg-primary-50"><FiFilter />Filters</button>
        {canEdit && <button onClick={() => openPopup('add')} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary-600 px-3 text-xs font-medium text-white hover:bg-primary-700"><FiPlus />Add User</button>}
      </div>
      {filterPosition && createPortal(
        <section ref={filterPanelRef} id="user-filter-panel" role="dialog" aria-label="User filters" tabIndex={-1} style={filterPosition} className="fixed z-50 w-72 max-w-[calc(100vw-16px)] max-h-[calc(100dvh-16px)] overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl outline-none">
          <div className="flex items-center justify-between px-4 pt-3 text-sm font-semibold text-slate-800">Filters<button aria-label="Close filters" onClick={() => setFilterPosition(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><FiX /></button></div>
                <div className="space-y-4 p-4">
        <div><label className="mb-1.5 block text-xs font-medium text-slate-500">Role</label><CommonSelect label="Role" value={draftFilters.role} onChange={value => setDraftFilters(previous => ({ ...previous, role: value }))} options={[{ value: 'all', label: 'All Roles' }, { value: 'leadership', label: 'Leadership' }, { value: 'volunteers', label: 'Volunteers' }, ...Object.entries(availableRoles).map(([value, role]) => ({ value, label: role.name }))]} />
</div>
        <div><label className="mb-1.5 block text-xs font-medium text-slate-500">Department</label><CommonSelect label="Department" value={draftFilters.department} onChange={value => setDraftFilters(previous => ({ ...previous, department: value }))} options={departments.map(value => ({ value, label: value === 'all' ? 'All Departments' : value }))} />
</div>
        <div><label className="mb-1.5 block text-xs font-medium text-slate-500">Status</label><CommonSelect label="Status" value={draftFilters.status} onChange={value => setDraftFilters(previous => ({ ...previous, status: value }))} options={[{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
</div>
      </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <button onClick={() => setDraftFilters({ role: 'all', department: 'all', status: 'all' })} className="text-xs text-slate-500 hover:text-slate-900">Clear</button>
            <button onClick={() => { setSelectedRole(draftFilters.role); setSelectedDepartment(draftFilters.department); setSelectedStatus(draftFilters.status); setPage(1); setFilterPosition(null); filterButtonRef.current?.focus(); }} className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">Apply</button>
          </div>
        </section>, document.body
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-md border border-gray-200 bg-white">
        {loading ? <div className="flex min-h-0 flex-1 items-center justify-center"><CommonLoader /></div> : users.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-gray-500"><FiFilter size={28} />No users found for these filters.</div> : <>
          <div className="hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex">
            <div className="admin-table-scroll shrink-0 overflow-y-hidden bg-gray-50 [scrollbar-gutter:stable]"><table className="w-full table-fixed text-sm"><thead><tr>{['Member', 'Role', 'Department', 'Status', 'Phone', 'Join Date', 'Actions'].map((label, i) => <th key={label} className={`border-b px-3 py-3 text-left text-xs font-medium uppercase text-slate-500 ${i === 0 ? 'w-[26%]' : ''}`}>{label}</th>)}</tr></thead></table></div>
            <div className="admin-table-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
            <table className="w-full table-fixed text-sm"><colgroup><col style={{ width: '26%' }} />{Array.from({ length: 6 }, (_, index) => <col key={index} />)}</colgroup>
              <tbody className="divide-y divide-gray-100">{visibleUsers.map(user => <tr key={user.id || user._id} className="hover:bg-slate-50">
                <td className="px-3 py-3"><div className="flex min-w-0 items-center gap-3"><UserAvatar user={user} size="small" /><div className="min-w-0"><div className="truncate font-medium" data-tooltip={user.name}>{user.name}</div><div className="truncate text-xs text-gray-500" data-tooltip={user.email}>{user.email}</div></div></div></td>
                <td className="truncate px-3 py-3" data-tooltip={availableRoles[normalizeRole(user.role)]?.name || user.role}>{availableRoles[normalizeRole(user.role)]?.name || user.role}</td>
                <td className="truncate px-3 py-3" data-tooltip={user.department}>{user.department || '-'}</td><td className="px-3 py-3">{statusBadge(user)}</td>
                <td className="truncate px-3 py-3" data-tooltip={user.phone}>{user.phone || '-'}</td><td className="px-3 py-3 text-xs">{formatDate(user.joinDate)}</td><td className="px-2 py-3">{actions(user)}</td>
              </tr>)}</tbody>
            </table>
            </div>
          </div>
          <div className="admin-table-scroll min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-2 lg:hidden">{visibleUsers.map(user => <article key={user.id || user._id} className="rounded-lg border bg-white p-3 text-sm"><div className="flex items-start gap-3"><UserAvatar user={user} size="small" /><div className="min-w-0 flex-1"><div className="font-semibold text-primary-700 [overflow-wrap:anywhere]">{user.name}</div><div className="mt-1 text-xs text-gray-500 [overflow-wrap:anywhere]">{user.email}</div></div>{statusBadge(user)}</div><div className="mt-3 space-y-1 text-xs text-slate-600"><p>{availableRoles[normalizeRole(user.role)]?.name || user.role}</p><p className="[overflow-wrap:anywhere]">{user.phone || 'No phone'} · {user.department || 'No department'}</p><p>Joined {formatDate(user.joinDate)}</p></div><div className="mt-2 border-t pt-2">{actions(user)}</div></article>)}</div>
        </>}
        <Pagination page={currentPage} pageSize={pageSize} total={users.length} onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} disabled={loading} itemLabel="Users" />
      </div>
      {showPopup && <UserPopup mode={popupMode} user={selectedUser} busy={saving} onClose={() => { if (!saving) { setShowPopup(false); setSelectedUser(null); } }} onSave={handleSaveUser} currentUser={currentUser} canAssignRoles={['admin', 'super_admin'].includes(normalizeRole(currentUser?.role))} />}
      {deleteTarget && <CommonPopup title="Delete user" size="sm" busy={deleting} onClose={() => setDeleteTarget(null)} footer={<div className="flex justify-end gap-2"><button disabled={deleting} onClick={() => setDeleteTarget(null)} className="border border-gray-300">Cancel</button><button disabled={deleting} onClick={() => handleDeleteUser(deleteTarget)} className="bg-red-600 text-white">{deleting ? 'Deleting…' : 'Delete'}</button></div>}><p>Delete {deleteTarget.name}? This cannot be undone.</p></CommonPopup>}
    </div>
  );
};

export default UserGroupPageApi;
