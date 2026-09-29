import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiChevronDown,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiSettings,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import ravanaLogo from '../../asset/image/ravanan.png';
import apiService from '../../services/api';

const normalizeRole = (role) => {
  if (typeof role !== 'string') return role;

  const aliases = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  };

  return aliases[role.trim().toUpperCase()] || role.trim().toLowerCase();
};

const navigationItems = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Events', path: '/events' },
  { name: 'Volunteer', path: '/volunteer' },
  { name: 'Blogs & Media', path: '/blogs' },
  { name: 'Reports', path: '/reports' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        setUser(JSON.parse(userData));
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    syncAuthState();
  }, [location]);

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isAdmin = ['admin', 'super_admin'].includes(normalizeRole(user?.role));
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
      scrolled
        ? 'bg-[#fffaf1]/95 shadow-lg shadow-ink-950/5 backdrop-blur-xl'
        : 'bg-[#fffaf1]/90 backdrop-blur-xl'
    }`}>
      <div className="container-custom">
        <div className="flex h-16 items-center gap-3 md:h-18">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-800 transition-colors hover:bg-white/80 xl:hidden"
            aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2" aria-label="Raavana Thalaigal Trust home">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff2cf] ring-1 ring-[#b36a12]/20 md:h-11 md:w-11">
              <img src={ravanaLogo} alt="Raavana Thalaigal Trust logo" className="block h-full w-full object-cover" />
            </div>
            <span className="max-w-[9rem] truncate text-sm font-bold text-ink-950 sm:max-w-none sm:text-base md:text-xl">
              Raavana Thalaigal Trust
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-ink-700 hover:bg-white/80 hover:text-primary-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 xl:ml-3">
            <Link
              to="/donate"
              className="flex h-10 items-center justify-center rounded-full bg-primary-700 px-3 font-semibold text-white transition-colors hover:bg-primary-800 md:px-5"
              aria-label="Donate now"
            >
              <FiHeart className="sm:hidden" size={19} />
              <span className="hidden sm:inline">Donate Now</span>
            </Link>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-white/80"
                  aria-label="Open account menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-200 font-semibold text-primary-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                  <FiChevronDown className="hidden text-ink-700 sm:block" size={16} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white py-2 shadow-2xl">
                    <Link to="/profile" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiUser className="mr-3" />My Profile</Link>
                    <Link to="/my-impact" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiAward className="mr-3" />My Impact</Link>
                    <Link to="/messages" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiMessageCircle className="mr-3" />Messages</Link>
                    <Link to="/notifications" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiBell className="mr-3" />Notifications</Link>
                    <Link to="/settings" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiSettings className="mr-3" />Account Settings</Link>

                    {isAdmin && (
                      <div className="mt-1 border-t border-gray-100 pt-1">
                        <Link to="/admin" className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiBarChart2 className="mr-3" />Admin Dashboard</Link>
                        <Link to="/my-groups" className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiUsers className="mr-3" />User Management</Link>
                        <Link to="/roles" className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiShield className="mr-3" />Roles Management</Link>
                      </div>
                    )}

                    <div className="mt-1 border-t border-gray-100 pt-1">
                      <button type="button" onClick={handleLogout} className="flex w-full items-center px-4 py-2.5 text-red-600 hover:bg-red-50"><FiLogOut className="mr-3" />Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex h-10 items-center gap-1 rounded-full px-2 text-ink-800 transition-colors hover:bg-white/80 sm:px-3">
                <FiUser size={18} />
                <span className="hidden md:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={`overflow-hidden border-t border-ink-100 bg-white/95 transition-all duration-300 xl:hidden ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 border-transparent opacity-0'
      }`}>
        <nav className="container-custom grid grid-cols-2 gap-2 py-4 sm:grid-cols-3" aria-label="Mobile navigation">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-ink-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
