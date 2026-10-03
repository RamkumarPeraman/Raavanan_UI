import CommonLoader from '../../components/common/CommonLoader';
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
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadError(false);
        const response = await apiService.getCurrentUser();
        setUser(response.user);
        setFormData(response.user);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login', { replace: true });
        } else {
          setLoadError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, loadAttempt]);

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
  const roleLabel = (user.role || 'member').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const fieldClassName = 'w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:border-transparent disabled:bg-ink-50 disabled:text-ink-700';

  const profileStats = [
    { label: 'Volunteer hours', value: stats.volunteerHours || 0, icon: FiUsers, colors: 'bg-primary-50 text-primary-700' },
    { label: 'Events attended', value: stats.eventsAttended || 0, icon: FiCalendar, colors: 'bg-blue-50 text-blue-700' },
    { label: 'Total donated', value: `₹${Number(stats.totalDonated || 0).toLocaleString('en-IN')}`, icon: FiHeart, colors: 'bg-rose-50 text-rose-700' },
    { label: 'Impact score', value: stats.impactScore || 0, icon: FiAward, colors: 'bg-amber-50 text-amber-700' },
  ];

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <CommonLoader />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 pt-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Could not load your profile</h1>
        <p className="mt-2 text-sm text-gray-600">The server did not respond. Please try again.</p>
        <button type="button" onClick={() => { setLoading(true); setLoadAttempt(attempt => attempt + 1); }} className="mt-5 rounded-lg bg-primary-700 px-5 py-2.5 font-semibold text-white hover:bg-primary-800">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-16 pt-24">
      <div className="container-custom mx-auto max-w-[1500px] space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_22px_60px_-38px_rgba(20,26,32,0.45)]">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary-700 via-primary-500 to-accent-500" />
          <div className="grid gap-6 p-6 pt-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-8 lg:pt-10">
            <div className="relative w-fit">
              <div className="h-28 w-28 overflow-hidden rounded-[2rem] bg-primary-50 ring-4 ring-primary-50 md:h-32 md:w-32">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary-700">
                    {getInitials(formData.name)}
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary-700 text-white shadow-lg transition hover:bg-primary-800" aria-label="Change profile picture">
                  <FiEdit2 />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-bold text-ink-950 md:text-4xl">{user.name || 'Member'}</h2>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700">{roleLabel}</span>
              </div>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">{user.bio || 'Add a short bio so the community can get to know you better.'}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
                <span className="inline-flex items-center gap-2"><FiShield className="text-primary-600" />{user.membershipType || 'Regular Member'}</span>
                <span className="inline-flex items-center gap-2"><FiCalendar className="text-primary-600" />Member since {formatDate(user.joinDate)}</span>
                <span className="inline-flex items-center gap-2"><FiMapPin className="text-primary-600" />{user.location || user.address?.city || 'Location not added'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="inline-flex items-center justify-center rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800">
                  <FiEdit2 className="mr-2" />Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={handleSaveProfile} disabled={saving} className="inline-flex items-center justify-center rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50">
                    <FiSave className="mr-2" />{saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setFormData(user); setIsEditing(false); }} className="inline-flex items-center justify-center rounded-full border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
                    <FiX className="mr-2" />Cancel
                  </button>
                </>
              )}              
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {profileStats.map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-[0_14px_40px_-32px_rgba(20,26,32,0.55)]">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.colors}`}>
                <item.icon size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-ink-950">{item.value}</div>
                <div className="text-sm text-ink-500">{item.label}</div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-12">
          <section className="rounded-[1.75rem] border border-ink-100 bg-white p-6 shadow-[0_16px_50px_-38px_rgba(20,26,32,0.5)] md:p-7 xl:col-span-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-ink-950">Personal information</h2>
              <p className="mt-1 text-sm text-ink-500">Your core profile and contact details.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-ink-700">Full name<input name="name" value={formData.name || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Full name" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">Email address<input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Email address" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">Phone number<input name="phone" value={formData.phone || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Phone number" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">Location<input name="location" value={formData.location || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Location" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">Date of birth<input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} disabled={!isEditing} className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">Gender<input name="gender" value={formData.gender || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Gender" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700 md:col-span-2">About you<textarea name="bio" rows="4" value={formData.bio || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Write a short bio" className={fieldClassName} /></label>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-ink-100 bg-white p-6 shadow-[0_16px_50px_-38px_rgba(20,26,32,0.5)] md:p-7 xl:col-span-5">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-ink-950">Address & membership</h2>
              <p className="mt-1 text-sm text-ink-500">Where you are based and your member record.</p>
            </div>
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-primary-50 p-4">
                <FiMail className="text-primary-700" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Email</p>
                <p className="mt-1 break-all text-sm font-semibold text-ink-800">{user.email || 'Not set'}</p>
              </div>
              <div className="rounded-2xl bg-accent-50 p-4">
                <FiShield className="text-accent-700" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Membership ID</p>
                <p className="mt-1 text-sm font-semibold text-ink-800">{user.membershipId || 'Pending'}</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-ink-700 sm:col-span-2">Street address<input name="address.street" value={formData.address?.street || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Street address" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">City<input name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="City" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">State<input name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="State" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">Pincode<input name="address.pincode" value={formData.address?.pincode || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Pincode" className={fieldClassName} /></label>
              <label className="space-y-2 text-sm font-semibold text-ink-700">Country<input name="address.country" value={formData.address?.country || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Country" className={fieldClassName} /></label>
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.75rem] border border-ink-100 bg-white p-6 shadow-[0_16px_50px_-38px_rgba(20,26,32,0.5)] md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-ink-950">Password & security</h2>
                <p className="mt-1 text-sm text-ink-500">Keep your account protected with a strong password.</p>
              </div>
              <button onClick={() => setShowPasswordSection((prev) => !prev)} className="inline-flex items-center rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100">
                <FiKey className="mr-2" />{showPasswordSection ? 'Close' : 'Change password'}
              </button>
            </div>
            {showPasswordSection && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input type="password" placeholder="Current password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))} className={`${fieldClassName} sm:col-span-2`} />
                <input type="password" placeholder="New password" value={passwordData.newPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))} className={fieldClassName} />
                <input type="password" placeholder="Confirm new password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))} className={fieldClassName} />
                <button onClick={handlePasswordChange} disabled={saving} className="w-fit rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50">Update password</button>
              </div>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-red-100 bg-red-50/50 p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700"><FiTrash2 /></div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-red-800">Delete account</h2>
                <p className="mt-1 text-sm leading-6 text-red-700/75">Permanently remove your account and profile data. This action cannot be undone.</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input type="password" placeholder="Enter password to confirm" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100" />
                  <button onClick={handleDeleteAccount} disabled={saving} className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50">
                    <FiTrash2 className="mr-2" />Delete account
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageApi;
