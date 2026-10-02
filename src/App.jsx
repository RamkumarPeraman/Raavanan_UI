import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/common/Header';
import Footer from './components/common/FoundationFooter';
import CommonTooltip from './components/common/CommonTooltip';
import ProtectedRoute from './components/ProtectedRoute';

// Pages for raavanan

import HomePage from './pages/HomePage';
import DonationPage from './pages/DonationPage';
import VolunteerPage from './pages/VolunteerPage';
import ProjectsPage from './pages/ProjectsPage';
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
  const isAdminDashboard = ['/admin', '/my-groups'].includes(location.pathname);
  const hideFooter = ['/login', '/forgot-password', '/verify-signup', '/messages', '/admin', '/profile', '/my-groups', '/roles'].includes(location.pathname);

  return (
    <div className={isAdminDashboard ? 'fixed inset-0 overflow-hidden' : 'min-h-screen'}>
      <ScrollToTop />
      <Header />
      <div className={isAdminDashboard ? 'flex h-full w-full flex-col overflow-hidden' : 'flex min-h-screen w-full flex-col'}>
        <main className={isAdminDashboard ? 'min-h-0 flex-1 overflow-hidden' : 'flex-grow'}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
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
            <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
              <UserGroupPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/roles" element={
            <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
              <RolesManagementPage />
            </ProtectedRoute>
          } />
          </Routes>
        </main>
        {!hideFooter && <Footer />}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
      <CommonTooltip />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

