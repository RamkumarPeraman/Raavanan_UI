import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiHeart,
  FiEdit2, FiSave, FiX, FiCamera, FiAward, FiClock,
  FiBookmark, FiLogOut, FiSettings, FiShield, FiUsers,
  FiCheckCircle, FiAlertCircle, FiLock, FiKey, FiGlobe,
  FiDownload, FiUpload, FiTrash2, FiEye, FiEyeOff
} from 'react-icons/fi';
import { FaUserFriends, FaUserShield, FaHandHoldingHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiService from '../../services/api';
import { processImageFile } from '../../utils/imageUpload';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // User data with default values to prevent undefined errors
  const [user, setUser] = useState({
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 94878 14418',
    alternatePhone: '+91 87654 32109',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    bloodGroup: 'O+',
    address: {
      street: '123 NGO Colony',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      country: 'India'
    },
    occupation: 'Software Engineer',
    organization: 'Tech Solutions Ltd',
    joinDate: '2023-01-15',
    membershipType: 'Premium Member',
    membershipId: 'RTNGO2023015',
    profileImage: null,
    bio: 'Passionate about social work and community development. Volunteering with Raavana Thalaigal Trust for 2 years.',
    interests: ['Education', 'Healthcare', 'Environment'],
    skills: ['Teaching', 'Event Management', 'Fundraising'],
    socialLinks: {
      facebook: 'https://facebook.com/rajesh.kumar',
      twitter: 'https://twitter.com/rajesh_k',
      linkedin: 'https://linkedin.com/in/rajeshkumar',
      instagram: 'https://instagram.com/rajesh.k'
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappUpdates: true,
      newsletter: true,
      eventReminders: true,
      volunteerOpportunities: true
    },
    privacy: {
      showEmail: false,
      showPhone: true,
      showAddress: false,
      showDonations: true
    },
    role: 'member'
  });

  // User statistics
  const [stats, setStats] = useState({
    volunteerHours: 245,
    eventsAttended: 18,
    donationsMade: 12,
    totalDonated: 45000,
    projectsSupported: 8,
    badges: 15,
    followers: 124,
    following: 89,
    impactScore: 850
  });

  // Activity history
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'volunteer',
      title: 'Volunteered at Education Camp',
      date: '2024-01-20',
      points: 50,
      description: 'Taught mathematics to 20 children'
    },
    {
      id: 2,
      type: 'donation',
      title: 'Donated to Education Fund',
      date: '2024-01-15',
      amount: 5000,
      description: 'Supporting child education'
    },
    {
      id: 3,
      type: 'event',
      title: 'Attended Annual Fundraising Gala',
      date: '2024-01-10',
      points: 30,
      description: 'Networked with fellow volunteers'
    },
    {
      id: 4,
      type: 'badge',
      title: 'Earned "Super Volunteer" Badge',
      date: '2024-01-05',
      badge: 'super-volunteer',
      description: 'Completed 200 volunteer hours'
    }
  ]);

  // Badges earned
  const [badges, setBadges] = useState([
    { id: 1, name: 'Super Volunteer', icon: '🌟', earned: '2024-01-05', description: 'Completed 200 hours' },
    { id: 2, name: 'First Donation', icon: '🎁', earned: '2023-06-20', description: 'Made first donation' },
    { id: 3, name: 'Event Star', icon: '⭐', earned: '2023-12-10', description: 'Attended 15 events' },
    { id: 4, name: 'Team Player', icon: '🤝', earned: '2023-09-30', description: 'Joined 5 group activities' }
  ]);

  // Saved items
  const [savedItems, setSavedItems] = useState({
    events: [1, 3, 5],
    blogs: [2, 4],
    projects: [1, 2]
  });

  // Form data for editing
  const [formData, setFormData] = useState({ ...user });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please login to view your profile');
      navigate('/login');
      return;
    }
    
    // Load user data from localStorage with safe parsing
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Merge with default user to ensure all fields exist
        setUser(prevUser => ({
          ...prevUser,
          ...parsedUser,
          address: { ...prevUser.address, ...(parsedUser.address || {}) },
          socialLinks: { ...prevUser.socialLinks, ...(parsedUser.socialLinks || {}) },
          preferences: { ...prevUser.preferences, ...(parsedUser.preferences || {}) },
          privacy: { ...prevUser.privacy, ...(parsedUser.privacy || {}) }
        }));
        setFormData(prevForm => ({
          ...prevForm,
          ...parsedUser,
          address: { ...prevForm.address, ...(parsedUser.address || {}) },
          socialLinks: { ...prevForm.socialLinks, ...(parsedUser.socialLinks || {}) },
          preferences: { ...prevForm.preferences, ...(parsedUser.preferences || {}) },
          privacy: { ...prevForm.privacy, ...(parsedUser.privacy || {}) }
        }));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('socialLinks.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...(prev.socialLinks || {}),
          [platform]: value
        }
      }));
    } else if (name.includes('preferences.')) {
      const pref = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...(prev.preferences || {}),
          [pref]: checked
        }
      }));
    } else if (name.includes('privacy.')) {
      const privacy = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        privacy: {
          ...(prev.privacy || {}),
          [privacy]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file)
        .then((image) => {
          setFormData(prev => ({
            ...prev,
            profileImage: image
          }));
          toast.success('Profile picture updated');
        })
        .catch(() => {
          toast.error('Unable to process the selected image. Please choose a smaller image.');
        });
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUser(formData);
      localStorage.setItem('user', JSON.stringify(formData));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
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

  const handleLogout = () => {
    apiService.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getActivityIcon = (type) => {
    switch(type) {
      case 'volunteer': return <FaHandHoldingHeart className="text-green-600" />;
      case 'donation': return <FiHeart className="text-red-600" />;
      case 'event': return <FiCalendar className="text-blue-600" />;
      case 'badge': return <FiAward className="text-yellow-600" />;
      default: return <FiClock className="text-gray-600" />;
    }
  };

  // Safe access to nested properties
  const safeAddress = user.address || {};
  const safeSocialLinks = user.socialLinks || {};
  const safePreferences = user.preferences || {};
  const safePrivacy = user.privacy || {};

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 relative">
            {user.role === 'admin' || user.role === 'super_admin' ? (
              <Link
                to="/my-groups"
                className="absolute bottom-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                <FiUsers className="inline mr-2" />
                Manage Users
              </Link>
            ) : (
              <button className="absolute bottom-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                <FiCamera className="inline mr-2" />
                Change Cover
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-600">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCamera className="text-white" size={24} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Name and Title */}
              <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    <p className="text-gray-600 flex items-center mt-1">
                      <FiUser className="mr-2" size={16} />
                      {user.membershipType} • Member since {formatDate(user.joinDate)}
                      {user.role && (
                        <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                          {user.role}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {!isEditing ? (
                    <div className="mt-4 md:mt-0 space-x-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <FiEdit2 className="inline mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiLogOut className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 md:mt-0 space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <FiSave className="inline mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiX className="inline mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {isEditing ? (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            ) : (
              user.bio && (
                <p className="mt-4 text-gray-700">{user.bio}</p>
              )
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiClock, label: 'Volunteer Hours', value: stats.volunteerHours },
            { icon: FiCalendar, label: 'Events Attended', value: stats.eventsAttended },
            { icon: FiHeart, label: 'Donations', value: stats.donationsMade },
            { icon: FiAward, label: 'Impact Score', value: stats.impactScore }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
              <stat.icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Rest of the component remains the same... */}
        {/* For brevity, I'm not repeating all the tab content here, but keep everything else as before */}
        {/* Make sure to use safeAddress, safeSocialLinks, safePreferences, safePrivacy in the JSX */}

        {/* Example of safe address rendering */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Profile Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <FiMapPin className="w-5 h-5 text-primary-600 mr-3 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {safeAddress.street}, {safeAddress.city}, {safeAddress.state} - {safeAddress.pincode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
