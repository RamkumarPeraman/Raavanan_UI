import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const NotificationsInboxPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await apiService.getNotifications();
        setNotifications(data);
      } catch (error) {
        toast.error(error.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeTab === 'unread' && notification.isRead) {
        return false;
      }

      if (activeTab === 'read' && !notification.isRead) {
        return false;
      }

      if (!searchTerm.trim()) {
        return true;
      }

      const needle = searchTerm.trim().toLowerCase();
      return (
        notification.title?.toLowerCase().includes(needle) ||
        notification.message?.toLowerCase().includes(needle) ||
        notification.sender?.name?.toLowerCase().includes(needle)
      );
    });
  }, [activeTab, notifications, searchTerm]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) {
      return 'Just now';
    }

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      toast.error(error.message || 'Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error(error.message || 'Failed to update notifications');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 pt-20">
        <div className="container-custom flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-20">
      <div className="container-custom">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 flex items-center text-3xl font-bold text-gray-900">
              <FiBell className="mr-3 text-primary-600" />
              Notifications
            </h1>
            <p className="text-gray-600">Direct messages and group messages appear here.</p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition hover:bg-primary-700"
            >
              <FiCheck className="mr-2" />
              Mark All Read
            </button>
          )}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{notifications.length}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Unread</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{unreadCount}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Read</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{notifications.length - unreadCount}</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search notifications..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            />
            <div className="flex gap-2">
              {['all', 'unread', 'read'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'unread' ? 'Unread' : 'Read'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <FiBell className="mx-auto mb-4 h-14 w-14 text-gray-300" />
              <p className="text-lg font-medium text-gray-700">No notifications found</p>
              <p className="mt-2 text-sm text-gray-500">New direct messages and group messages will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className={`p-5 ${notification.isRead ? 'bg-white' : 'bg-primary-50/70'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        <FiMessageCircle size={18} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-gray-900">{notification.title}</h2>
                          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary-600"></span>}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>{notification.sender?.name || 'System'}</span>
                          <span>{getTimeAgo(notification.createdAt)}</span>
                          <span>{notification.type === 'group_message' ? 'Group message' : 'Direct message'}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {notification.conversationId && (
                            <Link
                              to={`/messages?conversation=${notification.conversationId}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                              Open chat
                            </Link>
                          )}
                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {notification.isRead && <FiCheckCircle className="mt-1 text-green-600" size={18} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsInboxPage;
