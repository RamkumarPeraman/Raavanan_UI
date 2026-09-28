import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiEye, FiFilter, FiGrid, FiList, FiLock, FiPlus, FiSearch, FiTrash2, FiUnlock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import UserPopup from '../../components/common/UserPopup';

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

const UserGroupPageApi = () => {
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [availableRoles, setAvailableRoles] = useState(roles); // default to hardcoded

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiService.getRoles();
        const rolesData = response?.data || response || [];
        if (Array.isArray(rolesData) && rolesData.length > 0) {
          const rolesMap = {};
          rolesData.forEach(r => {
            rolesMap[r.name.toLowerCase()] = { name: r.name.replace(/_/g, ' ') };
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
  const [stats, setStats] = useState({ total: 0, active: 0, leadership: 0, volunteers: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('view');
  const [selectedUser, setSelectedUser] = useState(null);

  const canEdit = useMemo(() => ['admin', 'super_admin'].includes(normalizeRole(currentUser?.role)), [currentUser]);
  const canDelete = useMemo(() => normalizeRole(currentUser?.role) === 'super_admin', [currentUser]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [userResponse, statsResponse] = await Promise.all([
        apiService.getUsers({
          search: searchTerm || undefined,
          role: selectedRole,
          department: selectedDepartment,
          status: selectedStatus,
        }),
        apiService.getUserStats(),
      ]);
      setUsers(userResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole, selectedDepartment, selectedStatus]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSaveUser = async (userData) => {
    try {
      if (popupMode === 'add') {
        await apiService.createUser(userData);
        toast.success('User created successfully');
      } else if (popupMode === 'edit') {
        await apiService.updateUser(selectedUser.id || selectedUser._id, userData);
        toast.success('User updated successfully');
      }
      setShowPopup(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;

    try {
      await apiService.deleteUser(user.id || user._id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
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

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <div key={user.id || user._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`h-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{availableRoles[user.role]?.name || user.role}</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div>{user.phone || 'No phone'}</div>
              <div>{user.department || 'No department'}</div>
              <div>{user.location || 'No location'}</div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
              <button onClick={() => openPopup('view', user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEye /></button>
              {canEdit && <button onClick={() => toggleUserStatus(user)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">{user.status === 'active' ? <FiLock /> : <FiUnlock />}</button>}
              {canEdit && <button onClick={() => openPopup('edit', user)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><FiEdit2 /></button>}
              {canDelete && currentUser?.id !== user.id && <button onClick={() => handleDeleteUser(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Member', 'Role', 'Department', 'Status', 'Contact', 'Join Date', 'Actions'].map((label) => (
              <th key={label} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id || user._id}>
              <td className="px-6 py-4"><div className="font-medium">{user.name}</div><div className="text-sm text-gray-500">{user.email}</div></td>
              <td className="px-6 py-4">{availableRoles[user.role]?.name || user.role}</td>
              <td className="px-6 py-4">{user.department || '-'}</td>
              <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.status}</span></td>
              <td className="px-6 py-4">{user.phone || '-'}</td>
              <td className="px-6 py-4">{user.joinDate || '-'}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => openPopup('view', user)} className="text-blue-600"><FiEye className="inline" /></button>
                {canEdit && <button onClick={() => toggleUserStatus(user)} className="text-orange-600">{user.status === 'active' ? <FiLock className="inline" /> : <FiUnlock className="inline" />}</button>}
                {canEdit && <button onClick={() => openPopup('edit', user)} className="text-green-600"><FiEdit2 className="inline" /></button>}
                {canDelete && currentUser?.id !== user.id && <button onClick={() => handleDeleteUser(user)} className="text-red-600"><FiTrash2 className="inline" /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">All member data is loaded from the API and stored in PostgreSQL.</p>
          </div>
          {canEdit && <button onClick={() => openPopup('add')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><FiPlus className="inline mr-2" />Add User</button>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4"><div className="text-2xl font-bold">{stats.total || 0}</div><div className="text-sm text-gray-600">Total</div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="text-2xl font-bold text-green-600">{stats.active || 0}</div><div className="text-sm text-gray-600">Active</div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="text-2xl font-bold text-purple-600">{stats.leadership || 0}</div><div className="text-sm text-gray-600">Leadership</div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="text-2xl font-bold text-blue-600">{stats.volunteers || 0}</div><div className="text-sm text-gray-600">Volunteers</div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="text-2xl font-bold text-indigo-600">{stats.members || 0}</div><div className="text-sm text-gray-600">Members</div></div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search members..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Roles</option>
              {Object.entries(availableRoles).map(([key, role]) => <option key={key} value={key}>{role.name}</option>)}
            </select>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              {departments.map((department) => <option key={department} value={department}>{department === 'all' ? 'All Departments' : department}</option>)}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end mt-4">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}><FiGrid className="inline mr-2" />Grid</button>
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}><FiList className="inline mr-2" />List</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="h-12 w-12 rounded-full border-b-2 border-primary-600 animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500"><FiFilter className="mx-auto mb-4" size={32} />No users found for the current filters.</div>
        ) : viewMode === 'grid' ? renderCards() : renderTable()}

        {showPopup && <UserPopup mode={popupMode} user={selectedUser} onClose={() => { setShowPopup(false); setSelectedUser(null); }} onSave={handleSaveUser} currentUser={currentUser} />}
      </div>
    </div>
  );
};

export default UserGroupPageApi;
