import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBell, FiCheckCircle, FiClock, FiCalendar, FiHeart,
  FiUsers, FiFileText, FiDollarSign, FiAward, FiStar,
  FiFilter, FiCheck, FiX, FiTrash2, FiSettings,
  FiMessageCircle, FiMail, FiSmartphone, FiAlertCircle,
  FiChevronLeft, FiChevronRight, FiEye, FiEyeOff
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const notificationsPerPage = 10;

  // Notification types with colors
  const notificationTypes = {
    all: { label: 'All', color: 'gray' },
    volunteer: { label: 'Volunteer', icon: FiUsers, color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    donation: { label: 'Donation', icon: FiDollarSign, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    event: { label: 'Event', icon: FiCalendar, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    project: { label: 'Project', icon: FiFileText, color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    achievement: { label: 'Achievement', icon: FiAward, color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    message: { label: 'Message', icon: FiMessageCircle, color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
    system: { label: 'System', icon: FiAlertCircle, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
  };

  // Notification preferences
  const [preferences, setPreferences] = useState({
    email: {
      enabled: true,
      volunteer: true,
      donation: true,
      event: true,
      project: true,
      achievement: true,
      message: true,
      system: true
    },
    push: {
      enabled: true,
      volunteer: true,
      donation: true,
      event: true,
      project: true,
      achievement: true,
      message: true,
      system: false
    },
    sms: {
      enabled: false,
      volunteer: false,
      donation: true,
      event: false,
      project: false,
      achievement: false,
      message: false,
      system: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeTab, selectedType, searchTerm]);

  const loadNotifications = () => {
    // Mock notifications data
    const mockNotifications = [
      {
        id: 1,
        type: 'volunteer',
        title: 'New Volunteer Opportunity',
        message: 'We need volunteers for the upcoming Education Camp on March 15th.',
        date: '2024-02-22T10:30:00',
        read: false,
        priority: 'high',
        actionUrl: '/volunteer',
        actionable: true,
        sender: 'Volunteer Coordinator',
        expiresAt: '2024-03-01'
      },
      {
        id: 2,
        type: 'donation',
        title: 'Donation Received - Thank You!',
        message: 'Your donation of ₹5,000 to Education Fund has been received. Thank you for your support!',
        date: '2024-02-21T15:45:00',
        read: false,
        priority: 'medium',
        actionUrl: '/donations',
        actionable: true,
        sender: 'Finance Team',
        amount: 5000
      },
      {
        id: 3,
        type: 'event',
        title: 'Upcoming Event: Annual Fundraising Gala',
        message: 'Join us for our Annual Fundraising Gala on March 10th at 6:00 PM.',
        date: '2024-02-21T09:15:00',
        read: true,
        priority: 'medium',
        actionUrl: '/events/1',
        actionable: true,
        sender: 'Events Team',
        location: 'Chennai Convention Center'
      },
      {
        id: 4,
        type: 'achievement',
        title: 'Congratulations! You earned a new badge',
        message: 'You have completed 50 volunteer hours! You earned the "Silver Volunteer" badge.',
        date: '2024-02-20T14:20:00',
        read: false,
        priority: 'low',
        actionUrl: '/profile',
        actionable: true,
        sender: 'System',
        badge: 'Silver Volunteer'
      },
      {
        id: 5,
        type: 'project',
        title: 'Project Update: Education Initiative',
        message: 'Our Education Initiative has reached 1,000 children this month. Read the full impact report.',
        date: '2024-02-20T11:00:00',
        read: true,
        priority: 'medium',
        actionUrl: '/projects/1',
        actionable: true,
        sender: 'Program Manager'
      },
      {
        id: 6,
        type: 'message',
        title: 'New message from Priya Sharma',
        message: 'Hi, I wanted to discuss the upcoming volunteer orientation. Can we connect?',
        date: '2024-02-19T16:30:00',
        read: false,
        priority: 'medium',
        actionUrl: '/messages/1',
        actionable: true,
        sender: 'Priya Sharma',
        avatar: null
      },
      {
        id: 7,
        type: 'system',
        title: 'Profile Update Required',
        message: 'Please update your profile information to continue receiving notifications.',
        date: '2024-02-19T09:00:00',
        read: true,
        priority: 'low',
        actionUrl: '/profile/edit',
        actionable: true,
        sender: 'System'
      },
      {
        id: 8,
        type: 'volunteer',
        title: 'Volunteer Hours Approved',
        message: 'Your 4 volunteer hours from the Tree Plantation Drive have been approved.',
        date: '2024-02-18T13:45:00',
        read: false,
        priority: 'low',
        actionUrl: '/volunteer/hours',
        actionable: true,
        sender: 'Volunteer Coordinator',
        hours: 4
      },
      {
        id: 9,
        type: 'donation',
        title: 'Tax Receipt Available',
        message: 'Your 80G tax receipt for FY 2023-24 is now available for download.',
        date: '2024-02-18T10:15:00',
        read: true,
        priority: 'medium',
        actionUrl: '/donations/receipts',
        actionable: true,
        sender: 'Finance Team'
      },
      {
        id: 10,
        type: 'event',
        title: 'Event Reminder: Volunteer Orientation',
        message: 'Reminder: Volunteer Orientation is tomorrow at 10:00 AM at our Chennai office.',
        date: '2024-02-17T09:00:00',
        read: true,
        priority: 'high',
        actionUrl: '/events/2',
        actionable: true,
        sender: 'Events Team'
      },
      {
        id: 11,
        type: 'achievement',
        title: 'Milestone Reached: First Donation',
        message: 'Thank you for your first donation! You have unlocked the "First Donor" badge.',
        date: '2024-02-16T11:20:00',
        read: true,
        priority: 'low',
        actionUrl: '/profile/badges',
        actionable: true,
        sender: 'System',
        badge: 'First Donor'
      },
      {
        id: 12,
        type: 'project',
        title: 'New Project Launched: Women Empowerment',
        message: 'We have launched a new project to support women entrepreneurs. Learn more and get involved.',
        date: '2024-02-15T14:30:00',
        read: false,
        priority: 'medium',
        actionUrl: '/projects/3',
        actionable: true,
        sender: 'Program Manager'
      }
    ];

    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
    setLoading(false);
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.sender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredNotifications(filtered);
    setCurrentPage(1);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotification = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      setNotifications(prev =>
        prev.filter(n => n.id !== selectedNotification.id)
      );
      setShowDeleteModal(false);
      setSelectedNotification(null);
      toast.success('Notification deleted');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      setNotifications([]);
      toast.success('All notifications cleared');
    }
  };

  const handlePreferenceChange = (channel, type) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type]
      }
    }));
    toast.success('Preferences updated');
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Pagination
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FiBell className="mr-3 text-primary-600" />
              Notifications
            </h1>
            <p className="text-gray-600">
              Stay updated with your activities, events, and opportunities
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <FiSettings className="mr-2" />
              Settings
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
              >
                <FiCheck className="mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <FiBell className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <FiEye className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Read</p>
                <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => {
                    const date = new Date(n.date);
                    const now = new Date();
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    return date > weekAgo;
                  }).length}
                </p>
              </div>
              <FiCalendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <FiMail className="mr-2 text-primary-600" />
                  Email Notifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(notificationTypes).map(([key, type]) => {
                    if (key === 'all') return null;
                    return (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.email[key]}
                          onChange={() => handlePreferenceChange('email', key)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <FiSmartphone className="mr-2 text-primary-600" />
                  Push Notifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(notificationTypes).map(([key, type]) => {
                    if (key === 'all') return null;
                    return (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.push[key]}
                          onChange={() => handlePreferenceChange('push', key)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SMS Notifications */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <FiMessageCircle className="mr-2 text-primary-600" />
                  SMS Notifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(notificationTypes).map(([key, type]) => {
                    if (key === 'all') return null;
                    return (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.sms[key]}
                          onChange={() => handlePreferenceChange('sms', key)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Quiet Hours</h3>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.quietHours.enabled}
                      onChange={() => setPreferences(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
                      }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm">Enable quiet hours</span>
                  </label>
                  
                  {preferences.quietHours.enabled && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                {Object.entries(notificationTypes).map(([key, type]) => {
                  if (key === 'all') return null;
                  return (
                    <option key={key} value={key}>{type.label}</option>
                  );
                })}
              </select>
            </div>

            {/* Clear All */}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                <FiTrash2 className="inline mr-2" />
                Clear All
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === 'unread'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'read'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {currentNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {currentNotifications.map(notification => {
                const type = notificationTypes[notification.type] || notificationTypes.system;
                const TypeIcon = type.icon;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 ${type.bgColor} rounded-full flex items-center justify-center`}>
                        <TypeIcon className={type.textColor} size={20} />
                      </div>

                      {/* Content */}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${type.bgColor} ${type.textColor}`}>
                              {type.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{getTimeAgo(notification.date)}</span>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>

                        {/* Metadata */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {notification.sender && (
                            <span>From: {notification.sender}</span>
                          )}
                          {notification.amount && (
                            <span>Amount: ₹{notification.amount}</span>
                          )}
                          {notification.hours && (
                            <span>Hours: {notification.hours}</span>
                          )}
                          {notification.badge && (
                            <span>Badge: {notification.badge}</span>
                          )}
                          {notification.location && (
                            <span>Location: {notification.location}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3 mt-3">
                          {notification.actionable && (
                            <Link
                              to={notification.actionUrl}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              View Details →
                            </Link>
                          )}
                          
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Mark as read
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteNotification(notification)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </nav>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <FiTrash2 className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Delete Notification</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this notification? This action cannot be undone.
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
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;