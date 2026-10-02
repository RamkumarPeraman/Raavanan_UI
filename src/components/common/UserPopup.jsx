import CommonPopup from './CommonPopup';
import CommonSelect from './CommonSelect';
import React, { useState, useEffect } from 'react';
import {
  FiUser, FiCalendar,
  FiAward, FiClock, FiHeart, FiShield,
  FiCamera, FiSave
} from 'react-icons/fi';
import { FaUserShield, FaUserCog, FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { processImageFile } from '../../utils/imageUpload';
import apiService from '../../services/api';

const UserPopup = ({ mode, user, onClose, onSave, busy = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'member',
    department: '',
    status: 'active',
    location: '',
    bio: '',
    joinDate: new Date().toISOString().split('T')[0],
    volunteerHours: 0,
    eventsAttended: 0,
    donations: 0,
    profileImage: null,
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    interests: [],
    skills: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiService.getRoles();
        const rolesData = response?.data || response || [];
        setAvailableRoles(Array.isArray(rolesData) ? rolesData : []);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);

  // Role definitions
  const roles = {
    super_admin: { name: 'Super Admin', icon: FaUserShield, color: 'purple' },
    admin: { name: 'Admin', icon: FaUserCog, color: 'red' },
    manager: { name: 'Manager', icon: FaUserTie, color: 'blue' },
    volunteer_coordinator: { name: 'Coordinator', icon: FaUserGraduate, color: 'green' },
    member: { name: 'Member', icon: FiUser, color: 'gray' },
    volunteer: { name: 'Volunteer', icon: FiHeart, color: 'pink' },
    donor: { name: 'Donor', icon: FiAward, color: 'yellow' }
  };

  // Departments
  const departments = [
    'Administration',
    'Education',
    'Healthcare',
    'Women Empowerment',
    'Environment',
    'Fundraising',
    'Communications',
    'HR',
    'Finance',
    'Events',
    'Field Operations',
    'Volunteer Management'
  ];

  // Interest options
  const interestOptions = [
    'Education', 'Healthcare', 'Environment', 'Women Empowerment',
    'Child Welfare', 'Animal Welfare', 'Elderly Care', 'Disaster Relief',
    'Skill Development', 'Community Development'
  ];

  // Skill options
  const skillOptions = [
    'Teaching', 'Healthcare', 'Counseling', 'Event Management',
    'Social Media', 'Content Writing', 'Photography', 'Fundraising',
    'First Aid', 'Project Management', 'Data Entry', 'Public Speaking'
  ];

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      // Populate form with user data
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        role: user.role || 'member',
        department: user.department || '',
        status: user.status || 'active',
        location: user.location || '',
        bio: user.bio || '',
        joinDate: user.joinDate || new Date().toISOString().split('T')[0],
        volunteerHours: user.volunteerHours || 0,
        eventsAttended: user.eventsAttended || 0,
        donations: user.donations || 0,
        profileImage: user.profileImage || null,
        address: user.address || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        socialLinks: user.socialLinks || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        },
        interests: user.interests || [],
        skills: user.skills || []
      });

      if (user.profileImage) {
        setPreviewUrl(user.profileImage);
      }
    }
  }, [user, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'interests' || name === 'skills') {
      const array = formData[name] || [];
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...array, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: array.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageError('');

      processImageFile(file)
        .then((compressedImage) => {
          setPreviewUrl(compressedImage);
        })
        .catch(() => {
          setPreviewUrl(formData.profileImage || null);
          setImageError('Selected image is too large. Please choose a smaller image.');
        });
    }
  };

  const handleSave = () => {
    if (mode === 'view') return;

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (mode === 'add' && !formData.password) {
      alert('Please enter a password');
      return;
    }

    onSave({
      ...formData,
      profileImage: previewUrl || formData.profileImage,
      id: user?.id || Date.now()
    });
  };

  const getTitle = () => {
    switch(mode) {
      case 'add': return 'Add New Member';
      case 'edit': return 'Edit Member';
      case 'view': return 'Member Profile';
      default: return 'Member Details';
    }
  };

  const isViewMode = mode === 'view';
  const isAddMode = mode === 'add';

  return (
    <CommonPopup title={getTitle()} onClose={onClose} busy={busy} size="lg" footer={(
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>

          {!isViewMode && (
            <button
              onClick={handleSave}
              disabled={busy}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <FiSave className="mr-2" />
              {busy ? 'Saving…' : isAddMode ? 'Add Member' : 'Save Changes'}
            </button>
          )}
        </div>
    )}>
        {/* Tabs */}
        <div className="mb-3 border-b border-gray-200">
          <div className="admin-table-scroll flex gap-1 overflow-x-auto">
            {['basic', 'personal', 'professional', 'social'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 py-2 px-2 text-xs font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'basic' && 'Basic Info'}
                {tab === 'personal' && 'Personal Details'}
                {tab === 'professional' && 'Professional'}
                {tab === 'social' && 'Social & Interests'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0">
          {/* Basic Info Tab - 3 columns */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Profile Image - Column 1 */}
              <div className="col-span-1">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-primary-100 mx-auto overflow-hidden border-4 border-white shadow-lg">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary-600">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    {!isViewMode && (
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 shadow-lg">
                        <FiCamera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {isViewMode ? 'Profile Photo' : 'Click camera to upload'}
                  </p>
                  {!isViewMode && (
                    <p className="mt-1 text-xs text-gray-400">
                      Large images are automatically resized before upload.
                    </p>
                  )}
                  {imageError && (
                    <p className="mt-2 text-sm text-red-600">{imageError}</p>
                  )}
                </div>
              </div>

              {/* Basic Details - Column 2 & 3 */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900 font-medium">{formData.name || 'Not specified'}</p>
                    ) : (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter full name"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">{formData.email || 'Not specified'}</p>
                    ) : (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter email"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">{formData.phone || 'Not specified'}</p>
                    ) : (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter phone number"
                      />
                    )}
                  </div>

                  {!isViewMode && isAddMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter password"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    {isViewMode ? (
                      <div className="flex items-center">
                        {formData.role && roles[formData.role] && (
                          <>
                            {React.createElement(roles[formData.role].icon, {
                              className: `text-${roles[formData.role].color}-600 mr-2`
                            })}
                            <span>{roles[formData.role].name}</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <CommonSelect name="role" label="role" value={formData.role || ''} onChange={value => handleInputChange({ target: { name: 'role', value } })} options={availableRoles.map(r => ({ value: r.name.toLowerCase(), label: r.name.replace(/_/g, ' ') }))} />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">{formData.department || 'Not assigned'}</p>
                    ) : (
                      <CommonSelect name="department" label="department" value={formData.department || ''} onChange={value => handleInputChange({ target: { name: 'department', value } })} options={[{ value: '', label: 'Select Department' }, ...departments]} />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    {isViewMode ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        formData.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.status || 'active'}
                      </span>
                    ) : (
                      <CommonSelect name="status" label="status" value={formData.status || ''} onChange={value => handleInputChange({ target: { name: 'status', value } })} options={[{"value":"active","label":"Active"},{"value":"inactive","label":"Inactive"}]} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Details Tab - 3 columns */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column 1 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Personal Info</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.dateOfBirth || 'Not specified'}</p>
                  ) : (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.gender || 'Not specified'}</p>
                  ) : (
                    <CommonSelect name="gender" label="gender" value={formData.gender || ''} onChange={value => handleInputChange({ target: { name: 'gender', value } })} options={[{"value":"","label":"Select Gender"},{"value":"Male","label":"Male"},{"value":"Female","label":"Female"},{"value":"Other","label":"Other"},{"value":"Prefer not to say","label":"Prefer not to say"}]} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.bloodGroup || 'Not specified'}</p>
                  ) : (
                    <CommonSelect name="bloodGroup" label="bloodGroup" value={formData.bloodGroup || ''} onChange={value => handleInputChange({ target: { name: 'bloodGroup', value } })} options={[{"value":"","label":"Select Blood Group"},{"value":"A+","label":"A+"},{"value":"A-","label":"A-"},{"value":"B+","label":"B+"},{"value":"B-","label":"B-"},{"value":"O+","label":"O+"},{"value":"O-","label":"O-"},{"value":"AB+","label":"AB+"},{"value":"AB-","label":"AB-"}]} />
                  )}
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Address</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.address?.street || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address?.street || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Street address"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">{formData.address?.city || 'Not specified'}</p>
                    ) : (
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address?.city || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="City"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">{formData.address?.state || 'Not specified'}</p>
                    ) : (
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address?.state || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="State"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">{formData.address?.pincode || 'Not specified'}</p>
                    ) : (
                      <input
                        type="text"
                        name="address.pincode"
                        value={formData.address?.pincode || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Pincode"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">{formData.address?.country || 'India'}</p>
                    ) : (
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address?.country || 'India'}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Country"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Location & Join Date</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Location
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.location || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="City, State"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.joinDate || 'Not specified'}</p>
                  ) : (
                    <input
                      type="date"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900 text-sm">{formData.bio || 'No bio provided'}</p>
                  ) : (
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Tell us about yourself..."
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Professional Tab - 3 columns */}
          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column 1 - Stats */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Impact Stats</h3>

                {[
                  { name: 'volunteerHours', label: 'Volunteer Hours', icon: FiClock, color: 'bg-primary-50 text-primary-700' },
                  { name: 'eventsAttended', label: 'Events Attended', icon: FiCalendar, color: 'bg-green-50 text-green-700' },
                  { name: 'donations', label: 'Donations', icon: FiHeart, color: 'bg-amber-50 text-amber-700' },
                ].map(({ name, label, icon: Icon, color }) => (
                  <div key={name} className={`flex min-h-9 items-center gap-2 rounded px-2.5 py-1.5 ${color}`}>
                    <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    <label htmlFor={isViewMode ? undefined : `impact-${name}`} className="min-w-0 flex-1 text-xs font-medium">{label}</label>
                    {isViewMode ? (
                      <span className="text-xs font-semibold tabular-nums">{name === 'donations' ? '₹' : ''}{formData[name] || 0}</span>
                    ) : (
                      <input id={`impact-${name}`} type="number" name={name} value={formData[name]} onChange={handleInputChange} min="0" className="w-20 text-right" />
                    )}
                  </div>
                ))}
              </div>

              {/* Column 2 - Occupation */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Work Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.occupation || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="e.g., Software Engineer"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  {isViewMode ? (
                    <p className="text-gray-900">{formData.organization || 'Not specified'}</p>
                  ) : (
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Company/Organization"
                    />
                  )}
                </div>
              </div>

              {/* Column 3 - Skills */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Skills</h3>

                {isViewMode ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills && formData.skills.length > 0 ? (
                      formData.skills.map(skill => (
                        <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {skillOptions.map(skill => (
                      <label key={skill} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="skills"
                          value={skill}
                          checked={formData.skills?.includes(skill)}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social & Interests Tab - 3 columns */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column 1 - Social Links */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Social Media</h3>

                {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {platform}
                    </label>
                    {isViewMode ? (
                      <p className="text-gray-900">
                        {formData.socialLinks?.[platform] || 'Not provided'}
                      </p>
                    ) : (
                      <input
                        type="url"
                        name={`socialLinks.${platform}`}
                        value={formData.socialLinks?.[platform] || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder={`https://${platform}.com/username`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Column 2 - Interests */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Interests</h3>

                {isViewMode ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests && formData.interests.length > 0 ? (
                      formData.interests.map(interest => (
                        <span key={interest} className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No interests selected</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {interestOptions.map(interest => (
                      <label key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="interests"
                          value={interest}
                          checked={formData.interests?.includes(interest)}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{interest}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 3 - Membership */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Membership</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member ID
                  </label>
                  <p className="text-gray-900 font-mono">{formData.membershipId || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Type
                  </label>
                  <p className="text-gray-900">{formData.membershipType || 'Regular Member'}</p>
                </div>

                <div className="pt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <FiShield className="inline mr-2 text-primary-600" />
                      Member since {formData.joinDate ? new Date(formData.joinDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

    </CommonPopup>
  );
};

export default UserPopup;
