import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiChevronDown,
  FiClipboard,
  FiGlobe,
  FiHeart,
  FiLayers,
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
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { translate } from '../../i18n/translate';

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
  { name: 'Events', path: '/events' },
  { name: 'Volunteer', path: '/volunteer' },
  { name: 'Publications', path: '/publications' },
];


const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const languageMenuRef = useRef(null);
  const languageButtonRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const permissions = useSelector(selectPermissions);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [language, changeLanguage] = useSiteLanguage();
  const label = (english) => translate('header', english, language);

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

  useEffect(() => {
    if (!isLanguageMenuOpen) return undefined;
    const closeOutside = (event) => {
      if (!languageMenuRef.current?.contains(event.target)) setIsLanguageMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsLanguageMenuOpen(false);
        languageButtonRef.current?.focus();
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
  }, [isLanguageMenuOpen]);

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
    setIsLanguageMenuOpen(false);
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
  const canViewWings = isAdmin || permissions.includes('page:wings');
  const canViewProjectForms = isAdmin || permissions.includes('page:project_forms');
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
        <div className="relative flex h-14 items-center gap-1.5 sm:gap-3 md:h-[3.75rem]">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => {
              setIsUserMenuOpen(false);
              setIsLanguageMenuOpen(false);
              setIsMobileMenuOpen((open) => !open);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white transition-colors hover:bg-white/10 sm:h-10 sm:w-10 md:hidden"
            aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link to="/" className="group flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5 md:flex-none" aria-label={label('Raavana Thalaigal Trust - TamilNadu')}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fff2cf] ring-2 ring-[#eebd62]/70 shadow-[0_0_0_5px_rgba(238,189,98,0.1)] transition-transform duration-300 group-hover:rotate-[-7deg] sm:h-9 sm:w-9 md:h-10 md:w-10">
              <img src={ravanaLogo} alt="Raavana Thalaigal Trust logo" className="block h-full w-full object-cover" />
            </div>
            <span className="min-w-0 flex-1 leading-tight md:flex-none">
              <span className={`block break-words font-bold text-white sm:max-w-[13rem] sm:truncate lg:max-w-none ${language === 'ta' ? 'text-xs leading-[1.1] sm:text-sm lg:text-base' : 'text-[13px] leading-[1.1] tracking-tight min-[360px]:text-base lg:text-lg'}`}>{label('Raavana Thalaigal')}</span>
              <span className={`block break-words font-semibold text-[#EEC709] sm:max-w-[13rem] sm:truncate lg:max-w-none ${language === 'ta' ? 'text-[10px] leading-[1.1] sm:text-xs lg:text-sm' : 'text-[9px] leading-[1.1] uppercase tracking-[0.12em] min-[360px]:text-[11px] min-[360px]:tracking-[0.08em] sm:text-[10.4px] sm:tracking-[0.34em]'}`}>{label('Trust-TamilNadu')}</span>
            </span>
          </Link>

          <nav className="ml-auto hidden h-full items-center md:flex lg:gap-1" aria-label="Main navigation">
            {navigationItems.filter(item => canOpenPage(item.path)).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex h-full items-center px-2 text-sm font-semibold transition-colors after:absolute after:bottom-2 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:transition-opacity lg:px-3 lg:after:left-3 lg:after:right-3 ${
                  isActive(item.path)
                    ? 'text-[#EEC709] after:bg-[#EEC709] after:opacity-100'
                    : 'text-white/75 after:bg-[#EEC709] after:opacity-0 hover:text-white hover:after:opacity-80'
                }`}
              >
                {label(item.name)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:ml-auto sm:gap-2 md:ml-2 lg:ml-3">
            {canOpenPage('/donate') && <Link
              to="/donate"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEC709] font-bold text-[#123537] shadow-[0_4px_0_#bd702f] transition-all hover:-translate-y-0.5 hover:bg-[#EEC702] sm:h-10 sm:w-auto sm:px-3 md:px-5"
              aria-label={label('Donate Now')}
            >
              <FiHeart className="lg:hidden" size={17} />
              <span className="hidden lg:inline">{label('Donate Now')}</span>
            </Link>}

            <div ref={languageMenuRef} className="relative">
              <button
                ref={languageButtonRef}
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsLanguageMenuOpen((open) => !open);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 sm:h-10 sm:w-10"
                aria-label={language === 'ta' ? 'மொழியைத் தேர்ந்தெடுக்கவும்' : 'Choose language'}
                aria-expanded={isLanguageMenuOpen}
                aria-controls="site-language-options"
                title={language === 'ta' ? 'மொழி' : 'Language'}
              >
                <FiGlobe size={20} aria-hidden="true" />
              </button>
              {isLanguageMenuOpen && (
                <div id="site-language-options" className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#e4ddd2] bg-white py-2 text-ink-900 shadow-2xl">
                  <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wide text-ink-500">{language === 'ta' ? 'மொழி' : 'Language'}</p>
                  {[{ code: 'en', name: 'English' }, { code: 'ta', name: 'தமிழ்' }].map((option) => (
                    <button key={option.code} type="button" lang={option.code} aria-pressed={language === option.code} onClick={() => { changeLanguage(option.code); setIsLanguageMenuOpen(false); languageButtonRef.current?.focus(); }} className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-primary-50 ${language === option.code ? 'text-primary-800' : 'text-ink-700'}`}>
                      {option.name}<span aria-hidden="true">{language === option.code ? '✓' : ''}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <div ref={userMenuRef} className="relative">
              <button
                  ref={userMenuButtonRef}
                  type="button"
                  onClick={() => { setIsLanguageMenuOpen(false); setIsUserMenuOpen((open) => !open); }}
                  className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 p-0.5 transition-colors hover:bg-white/10 sm:p-1"
                  aria-label={isUserMenuOpen ? 'Close account menu' : 'Open account menu'}
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary-200 font-semibold text-primary-700 ring-1 ring-primary-300/60 sm:h-9 sm:w-9">
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
                    {canOpenPage('/profile') && <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiUser className="mr-3" />{label('My Profile')}</Link>}

                    {(isAdmin || canViewUsers || canViewRoles || canViewWings || canViewProjectForms) && (
                      <div className="mt-1 border-t border-gray-100 pt-1">
                        {isAdmin && canOpenPage('/admin') && <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiBarChart2 className="mr-3" />{label('Admin Dashboard')}</Link>}
                        {canViewUsers && canOpenPage('/my-groups') && <Link to="/my-groups" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiUsers className="mr-3" />{label('User Management')}</Link>}
                        {canViewRoles && canOpenPage('/roles') && <Link to="/roles" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiShield className="mr-3" />{label('Roles Management')}</Link>}
                        {canViewWings && canOpenPage('/wings') && <Link to="/wings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiLayers className="mr-3" />{label('Wings & Departments')}</Link>}
                        {canViewProjectForms && canOpenPage('/project-forms') && <Link to="/project-forms" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-purple-700 hover:bg-purple-50"><FiClipboard className="mr-3" />{label('Project Forms')}</Link>}
                      </div>
                    )}

                    <div className="mt-1 border-t border-gray-100 pt-1">
                      <button type="button" onClick={handleLogout} className="flex w-full items-center px-4 py-2.5 text-red-600 hover:bg-red-50"><FiLogOut className="mr-3" />{label('Logout')}</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex h-10 items-center gap-1 rounded-lg border border-white/15 px-2 text-white transition-colors hover:bg-white/10 sm:px-3">
                <FiUser size={18} />
                <span className="hidden lg:inline">{label('Login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-x-0 bottom-0 top-14 z-[45] md:hidden">
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
              {label(item.name)}
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
