import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiChevronDown,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import ravanaLogo from '../../asset/image/ravanan.png';
import apiService from '../../services/api';
import { pagePermissionByPath } from '../../constants/pageAccess';
import { selectPermissions } from '../../store/accessStore';

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
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const permissions = useSelector(selectPermissions);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMobileMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    desktop.addEventListener('change', closeOnDesktop);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;
    const closeOutside = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setIsUserMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        userMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isUserMenuOpen]);

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
  const canViewUsers = isAdmin || permissions.includes('users:read');
  const canViewRoles = isAdmin || permissions.includes('roles:read');
  const canOpenPage = path => !isLoggedIn || permissions.includes(pagePermissionByPath[path]);
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#092b2d] text-white transition-shadow duration-300 ${
      scrolled
        ? 'shadow-[0_12px_28px_rgba(3,25,26,0.18)]'
        : ''
    }`}>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-[#14565a]/55 to-transparent" />
      <div className="container-custom">
        <div className="relative flex h-16 items-center gap-3 md:h-[4.5rem]">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => {
              setIsUserMenuOpen(false);
              setIsMobileMenuOpen((open) => !open);
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2.5" aria-label="Raavana Thalaigal Trust home">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff2cf] ring-2 ring-[#eebd62]/70 shadow-[0_0_0_5px_rgba(238,189,98,0.1)] transition-transform duration-300 group-hover:rotate-[-7deg] md:h-11 md:w-11">
              <img src={ravanaLogo} alt="Raavana Thalaigal Trust logo" className="block h-full w-full object-cover" />
            </div>
            <span className="min-w-0 leading-tight">
              <span className="block max-w-[8rem] truncate text-sm font-bold tracking-tight text-white sm:max-w-[11rem] sm:text-base lg:max-w-none lg:text-lg">Raavana Thalaigal</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.34em] text-[#efc16f]">Trust</span>
            </span>
          </Link>

          <nav className="ml-auto hidden h-full items-center md:flex lg:gap-1" aria-label="Main navigation">
            {navigationItems.filter(item => canOpenPage(item.path)).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex h-full items-center px-2 text-sm font-semibold transition-colors after:absolute after:bottom-3 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition-opacity lg:px-3 lg:after:left-3 lg:after:right-3 ${
                  isActive(item.path)
                    ? 'text-[#f4cb87] after:bg-[#f4a94f] after:opacity-100'
                    : 'text-white/75 after:bg-[#f4a94f] after:opacity-0 hover:text-white hover:after:opacity-80'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-2 lg:ml-3">
            {canOpenPage('/donate') && <Link
              to="/donate"
              className="flex h-10 items-center justify-center rounded-lg bg-[#f1ad55] px-3 font-bold text-[#123537] shadow-[0_4px_0_#bd702f] transition-all hover:-translate-y-0.5 hover:bg-[#ffc174] md:px-5"
              aria-label="Donate now"
            >
              <FiHeart className="lg:hidden" size={19} />
              <span className="hidden lg:inline">Donate Now</span>
            </Link>}

            {isLoggedIn ? (
              <div ref={userMenuRef} className="relative">
                <button
                  ref={userMenuButtonRef}
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 p-1 transition-colors hover:bg-white/10"
                  aria-label={isUserMenuOpen ? 'Close account menu' : 'Open account menu'}
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-200 font-semibold text-primary-700 ring-1 ring-primary-300/60">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    {user?.profileImage && (
                      <img
                        src={user.profileImage}
                        alt={`${user.name || 'User'} profile`}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => { event.currentTarget.style.display = 'none'; }}
                      />
                    )}
                  </span>
                  <FiChevronDown className="hidden text-white/75 sm:block" size={16} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white py-2 shadow-2xl">
                    {canOpenPage('/profile') && <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiUser className="mr-3" />My Profile</Link>}

                    {(isAdmin || canViewUsers || canViewRoles) && (
                      <div className="mt-1 border-t border-gray-100 pt-1">
                        {isAdmin && canOpenPage('/admin') && <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiBarChart2 className="mr-3" />Admin Dashboard</Link>}
                        {canViewUsers && canOpenPage('/my-groups') && <Link to="/my-groups" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiUsers className="mr-3" />User Management</Link>}
                        {canViewRoles && canOpenPage('/roles') && <Link to="/roles" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiShield className="mr-3" />Roles Management</Link>}
                      </div>
                    )}

                    <div className="mt-1 border-t border-gray-100 pt-1">
                      <button type="button" onClick={handleLogout} className="flex w-full items-center px-4 py-2.5 text-red-600 hover:bg-red-50"><FiLogOut className="mr-3" />Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex h-10 items-center gap-1 rounded-lg border border-white/15 px-2 text-white transition-colors hover:bg-white/10 sm:px-3">
                <FiUser size={18} />
                <span className="hidden lg:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-x-0 bottom-0 top-16 z-[45] md:hidden">
        <button
          type="button"
          className="absolute inset-0 h-full w-full bg-ink-950/35"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation"
        />
      <aside id="mobile-navigation" className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto overscroll-contain border-r border-white/10 bg-[#092b2d] p-4 shadow-2xl">
        <nav className="space-y-2" aria-label="Mobile navigation">
          {navigationItems.filter(item => canOpenPage(item.path)).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 font-semibold transition-colors ${
                isActive(item.path)
                  ? 'bg-[#f1ad55] text-[#123537]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Header;
