import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiX, FiHome, FiHeart, FiCalendar, FiFileText,
  FiUsers, FiMail, FiPhone,
  FiUser, FiSettings, FiLogOut, FiChevronDown, FiBell,
  FiGrid, FiBookOpen, FiAward, FiMessageCircle, FiBarChart2, FiShield
} from 'react-icons/fi';
import { FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ravanaLogo from '../../asset/image/ravanan.png';
import apiService from '../../services/api';
import Tooltip from './Tooltip';

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

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const syncAuthState = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    syncAuthState();

    const handleAuthChanged = () => syncAuthState();
    const handleStorage = () => syncAuthState();

    window.addEventListener('auth-changed', handleAuthChanged);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
    document.body.style.overflow = 'unset';
    syncAuthState();
  }, [location]);

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    document.body.style.overflow = !isSidebarOpen ? 'hidden' : 'unset';
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    document.body.style.overflow = 'unset';
  };

  const isAdmin = ['admin', 'super_admin'].includes(normalizeRole(user?.role));

  const sidebarNavItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Projects', path: '/projects', icon: FiGrid },
    { name: 'Blogs & Media', path: '/blogs', icon: FiFileText },
    { name: 'Events', path: '/events', icon: FiCalendar },
    { name: 'Volunteer', path: '/volunteer', icon: FiUsers },
    { name: 'Donate', path: '/donate', icon: FiHeart },
    { name: 'Reports', path: '/reports', icon: FiBookOpen },
    { name: 'Contact', path: '/contact', icon: FiMail },
  ];

  if (isAdmin) {
    sidebarNavItems.push({ name: 'Admin Dashboard', path: '/admin', icon: FiBarChart2 });
    sidebarNavItems.push({ name: 'Roles Management', path: '/roles', icon: FiShield });
  }

  const userMenuItems = isLoggedIn ? [
    { name: 'My Profile', path: '/profile', icon: FiUser },
    { name: 'My Groups', path: '/my-groups', icon: FaUserFriends },
    { name: 'My Impact', path: '/my-impact', icon: FiAward },
    { name: 'Messages', path: '/messages', icon: FiMessageCircle },
    { name: 'Notifications', path: '/notifications', icon: FiBell },
    { name: 'Account Settings', path: '/settings', icon: FiSettings },
  ] : [];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 md:left-20 ${
        scrolled
          ? 'bg-[#fffaf1]/95 shadow-lg shadow-ink-950/5 backdrop-blur-xl'
          : 'bg-[#fffaf1]/72 backdrop-blur-xl'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-14 md:h-18">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-4 rounded-lg p-2 text-ink-800 transition-colors hover:bg-white/70 md:hidden"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>

              <Link to="/" className="flex min-w-0 items-center space-x-2" aria-label="Raavana Thalaigal Trust home">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff2cf] ring-1 ring-[#b36a12]/20 md:h-10 md:w-10">
                  <img
                    src={ravanaLogo}
                    alt="Raavana Thalaigal Trust logo"
                    className="block h-full w-full object-cover"
                  />
                </div>
                <span className="truncate text-sm font-bold text-ink-950 sm:text-base md:text-xl">
                  Raavana Thalaigal Trust
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Link
                to="/donate"
                className="rounded-full bg-primary-700 px-3 py-1.5 font-semibold text-white transition-all hover:bg-primary-800 md:px-4 md:py-2"
              >
                <span className="hidden md:inline">Donate Now</span>
                <FiHeart className="md:hidden" size={20} />
              </Link>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-white/70 md:p-2"
                  >
                    <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <FiChevronDown className="text-ink-700" size={16} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                      <Link to="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}><FiUser className="mr-2" />My Profile</Link>
                      <Link to="/my-impact" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}><FiAward className="mr-2" />My Impact</Link>
                      <Link to="/messages" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}><FiMessageCircle className="mr-2" />Messages</Link>
                      <Link to="/notifications" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}><FiBell className="mr-2" />Notifications</Link>
                      <Link to="/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsUserMenuOpen(false)}><FiSettings className="mr-2" />Account Settings</Link>

                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link to="/admin" className="flex items-center px-4 py-2 text-purple-600 hover:bg-purple-50" onClick={() => setIsUserMenuOpen(false)}><FiBarChart2 className="mr-2" />Admin Dashboard</Link>
                          <Link to="/my-groups" className="flex items-center px-4 py-2 text-purple-600 hover:bg-purple-50" onClick={() => setIsUserMenuOpen(false)}><FiUsers className="mr-2" />User Management</Link>
                          <Link to="/roles" className="flex items-center px-4 py-2 text-purple-600 hover:bg-purple-50" onClick={() => setIsUserMenuOpen(false)}><FiShield className="mr-2" />Roles Management</Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50"><FiLogOut className="mr-2" />Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 rounded-lg px-3 py-1.5 text-ink-800 transition-colors hover:bg-white/70">
                  <FiUser size={18} />
                  <span className="hidden md:inline">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden" onClick={closeSidebar} />}

      <aside className={`fixed left-0 top-0 z-50 h-full w-20 transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="relative flex items-center justify-center border-b border-gray-200 bg-white px-2 py-4">
            <Tooltip label="Raavana Thalaigal Trust">
              <Link to="/" onClick={closeSidebar} aria-label="Raavana Thalaigal Trust home">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-gray-200">
                  <img
                    src={ravanaLogo}
                    alt="Raavana Thalaigal Trust logo"
                    className="block h-full w-full object-cover"
                  />
                </div>
              </Link>
            </Tooltip>
            <button onClick={closeSidebar} className="absolute -right-3 top-1 h-7 w-7 rounded-full bg-white text-ink-800 shadow-md hover:bg-gray-100 md:hidden" aria-label="Close menu"><FiX className="mx-auto" size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto py-3">
            <nav className="flex flex-col items-center gap-2 px-2">
              {sidebarNavItems.map((item) => (
                <Tooltip key={item.path} label={item.name}>
                  <Link
                    to={item.path}
                    aria-label={item.name}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${location.pathname === item.path ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}
                    onClick={closeSidebar}
                  >
                    <item.icon size={21} />
                  </Link>
                </Tooltip>
              ))}
            </nav>

            {isLoggedIn && userMenuItems.length > 0 && (
              <nav className="mx-2 mt-3 flex flex-col items-center gap-2 border-t border-gray-200 pt-3">
                {userMenuItems.map((item) => (
                  <Tooltip key={item.path} label={item.name}>
                    <Link
                      to={item.path}
                      aria-label={item.name}
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${location.pathname === item.path ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}
                      onClick={closeSidebar}
                    >
                      <item.icon size={21} />
                    </Link>
                  </Tooltip>
                ))}
                <Tooltip label="Logout">
                  <button onClick={() => { handleLogout(); closeSidebar(); }} className="flex h-11 w-11 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50" aria-label="Logout">
                    <FiLogOut size={21} />
                  </button>
                </Tooltip>
              </nav>
            )}

            {!isLoggedIn && (
              <div className="mx-2 mt-3 flex flex-col items-center gap-2 border-t border-gray-200 pt-3">
                <Tooltip label="Login / Sign Up">
                  <Link to="/login" aria-label="Login or sign up" className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700" onClick={closeSidebar}>
                    <FiUser size={21} />
                  </Link>
                </Tooltip>
                <Tooltip label="Donate Now">
                  <Link to="/donate" aria-label="Donate now" className="flex h-11 w-11 items-center justify-center rounded-full text-green-700 transition-colors hover:bg-green-50" onClick={closeSidebar}>
                    <FiHeart size={21} />
                  </Link>
                </Tooltip>
              </div>
            )}

            <div className="mx-2 mt-3 flex justify-center border-t border-gray-200 pt-3">
              <Tooltip label="Call +91 94878 14418">
                <a href="tel:+919487814418" aria-label="Call Raavana Thalaigal Trust" className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700">
                  <FiPhone size={21} />
                </a>
              </Tooltip>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Header;
