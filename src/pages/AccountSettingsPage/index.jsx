import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiLock, FiBell, FiShield,
  FiEye, FiEyeOff, FiSave, FiCamera, FiGlobe, FiMoon,
  FiSun, FiSmartphone, FiMonitor, FiClock, FiFlag,
  FiDollarSign, FiHeart, FiUsers, FiCalendar, FiMapPin,
  FiEdit2, FiCheck, FiX, FiAlertCircle, FiTrash2,
  FiLogOut, FiKey, FiCreditCard, FiDownload, FiUpload,
  FiMessageCircle, FiTwitter, FiFacebook, FiGithub,
  FiInstagram, FiLinkedin, FiYoutube, FiStar, FiAward,
  FiSettings, FiHelpCircle, FiInfo, FiAlertTriangle
} from 'react-icons/fi';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { processImageFile } from '../../utils/imageUpload';

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // User data
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    profileImage: null
  });

  // Profile form data
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    occupation: '',
    organization: '',
    dateOfBirth: '',
    gender: '',
    language: 'English',
    timezone: 'Asia/Kolkata'
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: {
      newsletter: true,
      eventReminders: true,
      volunteerOpportunities: true,
      donationReceipts: true,
      projectUpdates: true,
      marketingEmails: false
    },
    pushNotifications: {
      enabled: true,
      newMessages: true,
      eventReminders: true,
      volunteerUpdates: true,
      donationAlerts: true
    },
    smsNotifications: {
      enabled: false,
      emergencyAlerts: true,
      eventReminders: false
    }
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: true,
    showAddress: false,
    showDonations: true,
    showVolunteerHours: true,
    showBadges: true,
    allowMessages: 'members',
    allowFriendRequests: 'members'
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    deviceManagement: true,
    sessionTimeout: 30,
    passwordExpiry: 90
  });

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState([
    { provider: 'google', connected: false, email: '', icon: FaGoogle, color: 'text-red-500' },
    { provider: 'facebook', connected: false, email: '', icon: FiFacebook, color: 'text-blue-600' },
    { provider: 'twitter', connected: false, email: '', icon: FiTwitter, color: 'text-blue-400' },
    { provider: 'github', connected: false, email: '', icon: FiGithub, color: 'text-gray-900' },
    { provider: 'microsoft', connected: false, email: '', icon: FaMicrosoft, color: 'text-blue-500' },
    { provider: 'linkedin', connected: false, email: '', icon: FiLinkedin, color: 'text-blue-700' }
  ]);

  // Active sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Chennai, India',
      ip: '192.168.1.1',
      lastActive: 'Now',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Mumbai, India',
      ip: '192.168.1.2',
      lastActive: '2 hours ago',
      current: false
    },
    {
      id: 3,
      device: 'Firefox on Mac',
      location: 'Bangalore, India',
      ip: '192.168.1.3',
      lastActive: '3 days ago',
      current: false
    }
  ]);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    isLongEnough: false
  });

  // Language options
  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  // Timezone options
  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Kolkata' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
    { value: 'Asia/Singapore', label: 'Singapore Time (SGT) - Singapore' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET) - Sydney' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London' },
    { value: 'Europe/Paris', label: 'Central European Time (CET) - Paris' },
    { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
    { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' }
  ];

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      
      // Populate profile form
      setProfileForm({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        bio: parsed.bio || '',
        location: parsed.location || '',
        website: parsed.website || '',
        occupation: parsed.occupation || '',
        organization: parsed.organization || '',
        dateOfBirth: parsed.dateOfBirth || '',
        gender: parsed.gender || '',
        language: parsed.language || 'English',
        timezone: parsed.timezone || 'Asia/Kolkata'
      });
    } else {
      toast.error('Please login to access settings');
      navigate('/login');
    }
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (category, setting) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
    toast.success('Notification preferences updated');
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacy(prev => ({ ...prev, [setting]: value }));
    toast.success('Privacy settings updated');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      isLongEnough: password.length >= 8
    };

    // Calculate score
    if (strength.hasLower) strength.score++;
    if (strength.hasUpper) strength.score++;
    if (strength.hasNumber) strength.score++;
    if (strength.hasSpecial) strength.score++;
    if (strength.isLongEnough) strength.score++;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    const score = passwordStrength.score;
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    const score = passwordStrength.score;
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Validate
      if (!profileForm.name || !profileForm.email || !profileForm.phone) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Update user in localStorage
      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogoutAllDevices = () => {
    // Keep only current session
    setActiveSessions(prev => prev.filter(s => s.current));
    toast.success('Logged out from all other devices');
  };

  const handleRemoveSession = (sessionId) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success('Session removed');
  };

  const handleConnectAccount = (provider) => {
    setConnectedAccounts(prev =>
      prev.map(acc =>
        acc.provider === provider
          ? { ...acc, connected: true, email: `${user.email}` }
          : acc
      )
    );
    toast.success(`Connected to ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
  };

  const handleDisconnectAccount = (provider) => {
    setConnectedAccounts(prev =>
      prev.map(acc =>
        acc.provider === provider
          ? { ...acc, connected: false, email: '' }
          : acc
      )
    );
    toast.success(`Disconnected from ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file)
        .then((image) => {
          setUser(prev => ({ ...prev, profileImage: image }));
          toast.success('Profile picture updated');
        })
        .catch(() => {
          toast.error('Unable to process the selected image. Please choose a smaller image.');
        });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences, security, and notifications
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-primary-100 mx-auto overflow-hidden border-4 border-white shadow-lg">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-600">
                          {getInitials(user.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 shadow-lg">
                    <FiCamera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <h2 className="text-xl font-bold mt-4">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">Member since 2023</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Profile Information', icon: FiUser },
                  { id: 'notifications', label: 'Notifications', icon: FiBell },
                  { id: 'privacy', label: 'Privacy & Security', icon: FiShield },
                  { id: 'connected', label: 'Connected Accounts', icon: FiGlobe },
                  { id: 'sessions', label: 'Active Sessions', icon: FiMonitor },
                  { id: 'preferences', label: 'Preferences', icon: FiSettings },
                  { id: 'billing', label: 'Billing & Donations', icon: FiCreditCard }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="mr-3" size={18} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Danger Zone */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 className="mr-3" size={18} />
                  <span className="text-sm font-medium">Delete Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                  
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileForm.dateOfBirth}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={profileForm.gender}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={profileForm.location}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Work Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Occupation
                        </label>
                        <input
                          type="text"
                          name="occupation"
                          value={profileForm.occupation}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="e.g., Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          name="organization"
                          value={profileForm.organization}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="Company/Organization"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={profileForm.website}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
                      >
                        <FiSave className="mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-8">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiMail className="mr-2 text-primary-600" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(notifications.emailNotifications).map(([key, value]) => (
                          <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="relative inline-block w-12 h-6 rounded-full cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={() => handleNotificationChange('emailNotifications', key)}
                                className="sr-only"
                              />
                              <span className={`block w-12 h-6 rounded-full transition-colors ${
                                value ? 'bg-primary-600' : 'bg-gray-300'
                              }`}>
                                <span className={`block w-5 h-5 mt-0.5 ml-0.5 bg-white rounded-full shadow transform transition-transform ${
                                  value ? 'translate-x-6' : ''
                                }`} />
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiSmartphone className="mr-2 text-primary-600" />
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Enable Push Notifications</span>
                          <div className="relative inline-block w-12 h-6 rounded-full cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.pushNotifications.enabled}
                              onChange={() => handleNotificationChange('pushNotifications', 'enabled')}
                              className="sr-only"
                            />
                            <span className={`block w-12 h-6 rounded-full transition-colors ${
                              notifications.pushNotifications.enabled ? 'bg-primary-600' : 'bg-gray-300'
                            }`}>
                              <span className={`block w-5 h-5 mt-0.5 ml-0.5 bg-white rounded-full shadow transform transition-transform ${
                                notifications.pushNotifications.enabled ? 'translate-x-6' : ''
                              }`} />
                            </span>
                          </div>
                        </label>

                        {notifications.pushNotifications.enabled && (
                          <div className="pl-6 space-y-3">
                            {Object.entries(notifications.pushNotifications).map(([key, value]) => {
                              if (key === 'enabled') return null;
                              return (
                                <label key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                  <span className="text-gray-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => handleNotificationChange('pushNotifications', key)}
                                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiPhone className="mr-2 text-primary-600" />
                        SMS Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Enable SMS Notifications</span>
                          <div className="relative inline-block w-12 h-6 rounded-full cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.smsNotifications.enabled}
                              onChange={() => handleNotificationChange('smsNotifications', 'enabled')}
                              className="sr-only"
                            />
                            <span className={`block w-12 h-6 rounded-full transition-colors ${
                              notifications.smsNotifications.enabled ? 'bg-primary-600' : 'bg-gray-300'
                            }`}>
                              <span className={`block w-5 h-5 mt-0.5 ml-0.5 bg-white rounded-full shadow transform transition-transform ${
                                notifications.smsNotifications.enabled ? 'translate-x-6' : ''
                              }`} />
                            </span>
                          </div>
                        </label>

                        {notifications.smsNotifications.enabled && (
                          <div className="pl-6 space-y-3">
                            {Object.entries(notifications.smsNotifications).map(([key, value]) => {
                              if (key === 'enabled') return null;
                              return (
                                <label key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                  <span className="text-gray-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={() => handleNotificationChange('smsNotifications', key)}
                                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-8">
                    {/* Password Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Password</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-4">
                          Change your password to keep your account secure
                        </p>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <FiKey className="inline mr-2" />
                          Change Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium">Add extra security to your account</p>
                            <p className="text-sm text-gray-500">
                              Require a verification code in addition to your password
                            </p>
                          </div>
                          <button
                            onClick={() => setShowTwoFactorModal(true)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              twoFactorEnabled
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                          >
                            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                          </button>
                        </div>
                        {twoFactorEnabled && (
                          <div className="flex items-center text-green-600">
                            <FiCheck className="mr-2" />
                            <span className="text-sm">Two-factor authentication is enabled</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Visibility
                          </label>
                          <select
                            value={privacy.profileVisibility}
                            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          >
                            <option value="public">Public - Anyone can view</option>
                            <option value="members">Members Only - Only logged in members</option>
                            <option value="private">Private - Only me</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          {[
                            { key: 'showEmail', label: 'Show Email Address' },
                            { key: 'showPhone', label: 'Show Phone Number' },
                            { key: 'showAddress', label: 'Show Address' },
                            { key: 'showDonations', label: 'Show Donations Publicly' },
                            { key: 'showVolunteerHours', label: 'Show Volunteer Hours' },
                            { key: 'showBadges', label: 'Show Badges & Achievements' }
                          ].map(item => (
                            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">{item.label}</span>
                              <input
                                type="checkbox"
                                checked={privacy[item.key]}
                                onChange={(e) => handlePrivacyChange(item.key, e.target.checked)}
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                            </label>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Who can message you?
                          </label>
                          <select
                            value={privacy.allowMessages}
                            onChange={(e) => handlePrivacyChange('allowMessages', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                          >
                            <option value="everyone">Everyone</option>
                            <option value="members">Members Only</option>
                            <option value="nobody">Nobody</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Login Alerts */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Login Alerts</h3>
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Get alerts for new logins</p>
                          <p className="text-sm text-gray-500">Receive email when someone logs into your account</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={security.loginAlerts}
                          onChange={(e) => setSecurity({ ...security, loginAlerts: e.target.checked })}
                          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Connected Accounts Tab */}
              {activeTab === 'connected' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Connected Accounts</h2>
                  
                  <div className="space-y-4">
                    {connectedAccounts.map(account => {
                      const IconComponent = account.icon;
                      return (
                        <div key={account.provider} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <IconComponent className={`${account.color} text-2xl mr-3`} />
                              <div>
                                <p className="font-medium capitalize">{account.provider}</p>
                                {account.connected && (
                                  <p className="text-sm text-gray-500">{account.email}</p>
                                )}
                              </div>
                            </div>
                            
                            {account.connected ? (
                              <button
                                onClick={() => handleDisconnectAccount(account.provider)}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Disconnect
                              </button>
                            ) : (
                              <button
                                onClick={() => handleConnectAccount(account.provider)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                Connect
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Sessions Tab */}
              {activeTab === 'sessions' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Active Sessions</h2>
                    <button
                      onClick={handleLogoutAllDevices}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiLogOut className="inline mr-2" />
                      Logout All Devices
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {activeSessions.map(session => (
                      <div key={session.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {session.device.includes('iPhone') || session.device.includes('Mobile') ? (
                              <FiSmartphone className="text-gray-600 text-xl mr-3" />
                            ) : (
                              <FiMonitor className="text-gray-600 text-xl mr-3" />
                            )}
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{session.device}</p>
                                {session.current && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {session.location} • IP: {session.ip}
                              </p>
                              <p className="text-xs text-gray-400">Last active: {session.lastActive}</p>
                            </div>
                          </div>
                          
                          {!session.current && (
                            <button
                              onClick={() => handleRemoveSession(session.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiX size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiClock className="mr-2 text-primary-600" />
                        Timezone
                      </h3>
                      <select
                        value={profileForm.timezone}
                        onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        {timezoneOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiGlobe className="mr-2 text-primary-600" />
                        Display Language
                      </h3>
                      <select
                        value={profileForm.language}
                        onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        {languageOptions.map(lang => (
                          <option key={lang.code} value={lang.name}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiMoon className="mr-2 text-primary-600" />
                        Theme Preference
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button className="p-4 border-2 border-primary-600 bg-white rounded-lg flex flex-col items-center justify-center hover:bg-gray-50">
                          <FiSun className="w-6 h-6 text-yellow-500 mb-2" />
                          <span className="text-sm font-medium">Light</span>
                        </button>
                        <button className="p-4 border border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50">
                          <FiMoon className="w-6 h-6 text-gray-700 mb-2" />
                          <span className="text-sm font-medium">Dark</span>
                        </button>
                        <button className="p-4 border border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50">
                          <FiMonitor className="w-6 h-6 text-gray-700 mb-2" />
                          <span className="text-sm font-medium">System</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiCalendar className="mr-2 text-primary-600" />
                        Date Format
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(format => (
                          <button key={format} className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing & Donations Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Billing & Donations</h2>
                  
                  <div className="space-y-6">
                    {/* Donation Summary */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Total Donations</h3>
                      <p className="text-4xl font-bold mb-2">₹45,000</p>
                      <p className="text-primary-100">You've made 12 donations to 8 projects</p>
                    </div>

                    {/* Donation History */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Donation History</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          {[
                            { date: '2024-01-15', amount: 5000, project: 'Education Fund', status: 'completed' },
                            { date: '2023-12-10', amount: 2500, project: 'Healthcare Initiative', status: 'completed' },
                            { date: '2023-11-05', amount: 10000, project: 'Women Empowerment', status: 'completed' },
                            { date: '2023-10-20', amount: 3000, project: 'Environment Campaign', status: 'completed' },
                            { date: '2023-09-15', amount: 7500, project: 'Child Welfare', status: 'completed' }
                          ].map((donation, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div>
                                <p className="font-medium">₹{donation.amount.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">{donation.project}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{donation.date}</p>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  {donation.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button className="mt-4 text-primary-600 font-medium hover:text-primary-700">
                          View All Donations →
                        </button>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex items-center">
                              <FiCreditCard className="text-primary-600 mr-3" size={24} />
                              <div>
                                <p className="font-medium">•••• •••• •••• 4242</p>
                                <p className="text-sm text-gray-500">Expires 12/25</p>
                              </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Default
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex items-center">
                              <FiCreditCard className="text-gray-400 mr-3" size={24} />
                              <div>
                                <p className="font-medium">•••• •••• •••• 1234</p>
                                <p className="text-sm text-gray-500">Expires 08/24</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors">
                          + Add Payment Method
                        </button>
                      </div>
                    </div>

                    {/* Tax Receipts */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tax Receipts (80G)</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {['2023-24', '2022-23', '2021-22'].map(year => (
                            <div key={year} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="font-medium">Financial Year {year}</span>
                              <button className="text-primary-600 hover:text-primary-700 flex items-center">
                                <FiDownload className="mr-1" size={16} />
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recurring Donations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recurring Donations</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-center py-4">
                          <FiHeart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">No recurring donations set up</p>
                          <button className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Set Up Monthly Donation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showCurrent ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm({...passwordForm, showCurrent: !passwordForm.showCurrent})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {passwordForm.showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showNew ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm({...passwordForm, showNew: !passwordForm.showNew})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {passwordForm.showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  
                  {passwordForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs ml-2 font-medium">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <span className={passwordStrength.isLongEnough ? 'text-green-600' : 'text-gray-400'}>
                          ✓ 8+ characters
                        </span>
                        <span className={passwordStrength.hasLower ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Lowercase
                        </span>
                        <span className={passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Uppercase
                        </span>
                        <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Number
                        </span>
                        <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}>
                          ✓ Special char
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordForm.showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm({...passwordForm, showConfirm: !passwordForm.showConfirm})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {passwordForm.showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Two-Factor Modal */}
        {showTwoFactorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Two-Factor Authentication</h3>
              
              {!twoFactorEnabled ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  
                  <div className="bg-gray-100 w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                    <div className="text-center">
                      <FiShield className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">QR Code Placeholder</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Or enter this code manually:</p>
                    <div className="bg-gray-100 p-3 text-center font-mono text-lg tracking-wider">
                      ABCD EFGH IJKL MNOP
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      maxLength="6"
                    />
                  </div>
                </>
              ) : (
                <p className="text-gray-600 mb-6">
                  Two-factor authentication is currently enabled. Disabling it will make your account less secure.
                </p>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTwoFactorModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    setShowTwoFactorModal(false);
                    toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled successfully');
                  }}
                  className={`px-4 py-2 ${
                    twoFactorEnabled
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  } rounded-lg`}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <FiAlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Delete Account</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsPage;
