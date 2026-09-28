import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/common/Header';
import Footer from './components/common/FoundationFooter';
import ProjectChatbot from './components/common/ProjectChatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Pages for raavanan

import HomePage from './pages/HomePage';
import DonationPage from './pages/DonationPage';
import VolunteerPage from './pages/VolunteerPage';
import ProjectsPage from './pages/ProjectsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
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
  const hideFooter = location.pathname === '/messages';

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
      <ProjectChatbot />
      <ToastContainer position="top-right" autoClose={5000} />
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

