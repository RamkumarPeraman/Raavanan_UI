import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiShield, FiUsers, FiX } from 'react-icons/fi';
import apiService from '../../services/api';

const RolesManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (currentUser.role || '').toLowerCase();
  const canManage = ['admin', 'super_admin'].includes(userRole);

  // System roles that cannot be deleted
  const systemRoles = ['SUPER_ADMIN', 'ADMIN', 'MEMBER'];

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRoles();
      const rolesData = response?.data || response || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Role name is required');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.createRole({ name: newRoleName.trim(), description: newRoleDescription.trim() });
      toast.success('Role created successfully');
      setNewRoleName('');
      setNewRoleDescription('');
      setShowAddForm(false);
      fetchRoles();
    } catch (error) {
      toast.error(error.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (systemRoles.includes(role.name)) {
      toast.error('System roles cannot be deleted');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;

    setDeletingId(role.id);
    try {
      await apiService.deleteRole(role.id);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error(error.message || 'Failed to delete role');
    } finally {
      setDeletingId(null);
    }
  };

  const formatRoleName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiShield className="text-primary-600" />
              Roles Management
            </h1>
            <p className="mt-1 text-gray-500">Manage user roles and permissions</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {showAddForm ? <FiX /> : <FiPlus />}
              {showAddForm ? 'Cancel' : 'Add Role'}
            </button>
          )}
        </div>

        {/* Add Role Form */}
        {showAddForm && canManage && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h2>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Team Lead"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">Will be auto-formatted to UPPER_SNAKE_CASE (e.g., TEAM_LEAD)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Brief description of this role"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Role'}
              </button>
            </form>
          </div>
        )}

        {/* Roles Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading roles...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  {canManage && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiShield className={systemRoles.includes(role.name) ? 'text-purple-500' : 'text-gray-400'} />
                        <span className="font-medium text-gray-900">{formatRoleName(role.name)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{role.description || '—'}</td>
                    <td className="px-6 py-4">
                      {systemRoles.includes(role.name) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">System</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Custom</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        {systemRoles.includes(role.name) ? (
                          <span className="text-xs text-gray-400">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            disabled={deletingId === role.id}
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
            {roles.length === 0 && (
              <div className="text-center py-8 text-gray-500">No roles found</div>
            )}
          </div>
        )}

        {/* Info note */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> System roles (Super Admin, Admin, Member) are protected and cannot be deleted.
            Custom roles can be deleted only if no users are currently assigned to them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RolesManagementPage;
