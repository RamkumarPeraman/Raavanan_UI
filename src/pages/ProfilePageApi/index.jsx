import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiAward,
  FiCalendar,
  FiEdit2,
  FiHeart,
  FiKey,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import { processImageFile } from '../../utils/imageUpload';

const createEmptyUser = () => ({
  id: '',
  name: '',
  email: '',
  phone: '',
  role: 'member',
  joinDate: '',
  membershipType: 'Regular Member',
  membershipId: '',
  profileImage: null,
  bio: '',
  dateOfBirth: '',
  gender: '',
  location: '',
  address: { street: '', city: '', state: '', pincode: '', country: 'India' },
  stats: { volunteerHours: 0, eventsAttended: 0, totalDonated: 0, impactScore: 0 },
});

const ProfilePageApi = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(createEmptyUser());
  const [formData, setFormData] = useState(createEmptyUser());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiService.getCurrentUser();
        setUser(response.user);
        setFormData(response.user);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Please login to view your profile');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const stats = useMemo(() => user.stats || createEmptyUser().stats, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processImageFile(file)
      .then((image) => {
        setFormData((prev) => ({ ...prev, profileImage: image }));
        toast.success('Profile picture updated');
      })
      .catch(() => {
        toast.error('Unable to process the selected image. Please choose a smaller image.');
      });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiService.updateProfile(formData);
      setUser(response.user);
      setFormData(response.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Enter your password to delete the account');
      return;
    }

    try {
      setSaving(true);
      await apiService.deleteMyAccount(deletePassword);
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };

  const getInitials = (name) => (name || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleDateString('en-IN') : 'Not set');

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-b-2 border-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom space-y-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-primary-700 via-primary-600 to-orange-500" />
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-end gap-5">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-primary-100 overflow-hidden shadow-lg">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary-700">
                        {getInitials(formData.name)}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-white rounded-full shadow p-2 cursor-pointer">
                      <FiEdit2 />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700">{user.role}</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">{user.membershipType}</span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">Member since {formatDate(user.joinDate)}</span>
                  </div>
                  <p className="mt-3 text-gray-600 max-w-2xl">{user.bio || 'Add a short bio to complete your profile.'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Link to="/my-groups" className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                    <FiUsers className="inline mr-2" />
                    Manage Users
                  </Link>
                )}
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                    <FiEdit2 className="inline mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                      <FiSave className="inline mr-2" />
                      Save
                    </button>
                    <button onClick={() => { setFormData(user); setIsEditing(false); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                      <FiX className="inline mr-2" />
                      Cancel
                    </button>
                  </>
                )}
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <FiLogOut className="inline mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <FiUsers className="mx-auto text-primary-600 mb-2" />
            <div className="text-2xl font-bold">{stats.volunteerHours || 0}</div>
            <div className="text-sm text-gray-500">Volunteer Hours</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <FiCalendar className="mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{stats.eventsAttended || 0}</div>
            <div className="text-sm text-gray-500">Events Attended</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <FiHeart className="mx-auto text-rose-600 mb-2" />
            <div className="text-2xl font-bold">{stats.totalDonated || 0}</div>
            <div className="text-sm text-gray-500">Total Donated</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <FiAward className="mx-auto text-amber-600 mb-2" />
            <div className="text-2xl font-bold">{stats.impactScore || 0}</div>
            <div className="text-sm text-gray-500">Impact Score</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow p-6 space-y-5">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input name="name" value={formData.name || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Full Name" className="p-3 border rounded-lg disabled:bg-gray-50" />
              <input name="email" value={formData.email || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Email" className="p-3 border rounded-lg disabled:bg-gray-50" />
              <input name="phone" value={formData.phone || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Phone" className="p-3 border rounded-lg disabled:bg-gray-50" />
              <input name="location" value={formData.location || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Location" className="p-3 border rounded-lg disabled:bg-gray-50" />
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} disabled={!isEditing} className="p-3 border rounded-lg disabled:bg-gray-50" />
              <input name="gender" value={formData.gender || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Gender" className="p-3 border rounded-lg disabled:bg-gray-50" />
            </div>
            <textarea name="bio" rows="4" value={formData.bio || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Bio" className="w-full p-3 border rounded-lg disabled:bg-gray-50" />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-5">
            <h2 className="text-xl font-semibold">Contact and Address</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3"><FiMail className="mt-1 text-primary-600" /><div><div className="text-sm text-gray-500">Email</div><div>{user.email || 'Not set'}</div></div></div>
              <div className="flex items-start gap-3"><FiPhone className="mt-1 text-primary-600" /><div><div className="text-sm text-gray-500">Phone</div><div>{user.phone || 'Not set'}</div></div></div>
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 text-primary-600" />
                <div className="w-full grid md:grid-cols-2 gap-4">
                  <input name="address.street" value={formData.address?.street || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Street" className="p-3 border rounded-lg disabled:bg-gray-50" />
                  <input name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="City" className="p-3 border rounded-lg disabled:bg-gray-50" />
                  <input name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="State" className="p-3 border rounded-lg disabled:bg-gray-50" />
                  <input name="address.pincode" value={formData.address?.pincode || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Pincode" className="p-3 border rounded-lg disabled:bg-gray-50" />
                </div>
              </div>
              <div className="flex items-start gap-3"><FiShield className="mt-1 text-primary-600" /><div><div className="text-sm text-gray-500">Membership</div><div>{user.membershipType} ({user.membershipId || 'Pending'})</div></div></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Security</h2>
              <button onClick={() => setShowPasswordSection((prev) => !prev)} className="text-primary-600 hover:text-primary-700">
                <FiKey className="inline mr-2" />
                Change Password
              </button>
            </div>
            {showPasswordSection && (
              <div className="space-y-3">
                <input type="password" placeholder="Current password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))} className="w-full p-3 border rounded-lg" />
                <input type="password" placeholder="New password" value={passwordData.newPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))} className="w-full p-3 border rounded-lg" />
                <input type="password" placeholder="Confirm new password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))} className="w-full p-3 border rounded-lg" />
                <button onClick={handlePasswordChange} disabled={saving} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">Update Password</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
            <p className="text-sm text-gray-600">Delete your account permanently. This action cannot be undone.</p>
            <input type="password" placeholder="Enter password to confirm" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full p-3 border rounded-lg" />
            <button onClick={handleDeleteAccount} disabled={saving} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
              <FiTrash2 className="inline mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageApi;
