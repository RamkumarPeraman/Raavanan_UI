import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/common/Header';
import Footer from './components/common/FoundationFooter';
import CommonTooltip from './components/common/CommonTooltip';
import SiteTranslator from './components/common/SiteTranslator';
import ProtectedRoute from './components/ProtectedRoute';
import PageAccessGate from './components/PageAccessGate';
import AccessBootstrap from './components/AccessBootstrap';

// Pages for raavanan

import HomePage from './pages/HomePage';
import DonationPage from './pages/DonationPage';
import VolunteerPage from './pages/VolunteerPage';
import PublicationsPage from './pages/PublicationsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SignupOtpPage from './pages/SignupOtpPage';
import BlogsMediaPage from './pages/BlogsMediaPage';
import EventsPage from './pages/EventsPageApi';
import ProfilePage from './pages/ProfilePageApi';
import UserGroupPage from './pages/UserGroupPageApi';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ReportsPage from './pages/ReportsPageApi';
import ContactPage from './pages/ContactPage';
import NotificationsInboxPage from './pages/NotificationsInboxPage';
import MessengerPage from './pages/MessengerPage';
import MyImpactPage from './pages/MyImpactPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import RolesManagementPage from './pages/RolesManagementPage';
import WingsPage from './pages/WingsPage';
import ProjectFormsPage from './pages/ProjectFormsPage';
import OurStoryPage from './pages/OurStoryPage';
import KeyFiguresPage from './pages/KeyFiguresPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isFullHeightPage = ['/admin', '/my-groups', '/roles', '/wings', '/project-forms', '/events', '/volunteer'].includes(location.pathname);
  const isScrollablePage = ['/', '/contact', '/donate', '/profile', '/our-story', '/key-figures', '/reports', '/blogs', '/publications'].includes(location.pathname) || location.pathname.startsWith('/projects');
  const isViewportPage = isFullHeightPage || isScrollablePage;
  const hideFooter = ['/login', '/forgot-password', '/verify-signup', '/messages', '/admin', '/profile', '/my-groups', '/roles', '/wings', '/project-forms', '/events', '/volunteer', '/donate'].includes(location.pathname);

  return (
    <div className={isViewportPage ? 'fixed inset-0 overflow-hidden' : 'min-h-screen'}>
      <ScrollToTop />
      <Header />
      <div className={isViewportPage ? 'flex h-full w-full flex-col overflow-hidden' : 'flex min-h-screen w-full flex-col'}>
        <main key={location.pathname} className={['/volunteer', '/events', '/project-forms'].includes(location.pathname) ? 'mt-14 min-h-0 flex-1 overflow-hidden md:mt-[3.75rem]' : isScrollablePage ? `${['/donate', '/profile'].includes(location.pathname) ? 'admin-table-scroll ' : ''}mt-14 min-h-0 flex-1 overflow-y-auto overscroll-contain md:mt-[3.75rem]` : isFullHeightPage ? 'min-h-0 flex-1 overflow-hidden' : 'flex-grow'}>
          <PageAccessGate key={location.pathname} pathname={location.pathname}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/projects" element={<Navigate to="/publications" replace />} />
          <Route path="/projects/:id" element={<Navigate to="/publications" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-signup" element={<SignupOtpPage />} />
          <Route path="/blogs" element={<BlogsMediaPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/key-figures" element={<KeyFiguresPage />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/my-impact" element={
            <ProtectedRoute>
              <MyImpactPage />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessengerPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsInboxPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/my-groups" element={
            <ProtectedRoute requiredPermission="users:read">
              <UserGroupPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/roles" element={
            <ProtectedRoute requiredPermission="roles:read">
              <RolesManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/wings" element={
            <ProtectedRoute requiredPermission="page:wings">
              <WingsPage />
            </ProtectedRoute>
          } />
          <Route path="/project-forms" element={
            <ProtectedRoute requiredPermission="page:project_forms">
              <ProjectFormsPage />
            </ProtectedRoute>
          } />
          </Routes>
          </PageAccessGate>
          {['/', '/contact', '/publications', '/our-story', '/key-figures', '/reports', '/blogs'].includes(location.pathname) ? <Footer /> : null}
        </main>
        {!hideFooter && !isScrollablePage && <Footer />}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
      <CommonTooltip />
      <SiteTranslator />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AccessBootstrap />
      <AppLayout />
    </Router>
  );
}

export default App;

