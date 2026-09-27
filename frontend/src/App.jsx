import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import BookSlot from './pages/farmer/BookSlot';
import BookingConfirmation from './pages/farmer/BookingConfirmation';
import LiveQueue from './pages/farmer/LiveQueue';
import ProcurementTracking from './pages/farmer/ProcurementTracking';
import PaymentStatus from './pages/farmer/PaymentStatus';
import BookingHistory from './pages/farmer/BookingHistory';

import CentreDashboard from './pages/centre/CentreDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCentres from './pages/admin/ManageCentres';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Shared - any authenticated user */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Farmer routes */}
      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute roles={['farmer']}>
            <FarmerDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/book-slot"
        element={
          <RoleProtectedRoute roles={['farmer']}>
            <BookSlot />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/booking-confirmation/:id"
        element={
          <RoleProtectedRoute roles={['farmer']}>
            <BookingConfirmation />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <RoleProtectedRoute roles={['farmer']}>
            <BookingHistory />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/queue/:id"
        element={
          <ProtectedRoute>
            <LiveQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/procurement/:id"
        element={
          <ProtectedRoute>
            <ProcurementTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute>
            <PaymentStatus />
          </ProtectedRoute>
        }
      />

      {/* Centre operator routes */}
      <Route
        path="/centre"
        element={
          <RoleProtectedRoute roles={['centre', 'admin']}>
            <CentreDashboard />
          </RoleProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/centres"
        element={
          <RoleProtectedRoute roles={['admin']}>
            <ManageCentres />
          </RoleProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
