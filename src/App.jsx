// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Importaciones
import AuthScreen from './pages/AuthScreen.jsx';
import RegisterScreen from './pages/RegisterScreen.jsx';
// Admin
import AdminHomeScreen from './pages/admin/AdminHomeScreen.jsx';
import BarbersManagementScreen from './pages/admin/BarbersManagementScreen.jsx';
import AddEditBarberScreen from './pages/admin/AddEditBarberScreen.jsx';
import ServicesManagementScreen from './pages/admin/ServicesManagementScreen.jsx';
import AddEditServiceScreen from './pages/admin/AddEditServiceScreen.jsx';
import AppointmentsManagementScreen from './pages/admin/AppointmentsManagementScreen.jsx';
import AddAppointmentScreen from './pages/admin/AddAppointmentScreen.jsx';
import ReportsScreen from './pages/admin/ReportsScreen.jsx';
// Cliente
import ClientHomeScreen from './pages/client/ClientHomeScreen.jsx';
import BookingScreen from './pages/client/BookingScreen.jsx';
import MyAppointmentsScreen from './pages/client/MyAppointmentsScreen.jsx';
import ProfileScreen from './pages/client/ProfileScreen.jsx';
import ContactScreen from './pages/client/ContactScreen.jsx';
import GalleryScreen from './pages/client/GalleryScreen.jsx';
import ProductsScreen from './pages/client/ProductsScreen.jsx';
// Barbero
import BarberHomeScreen from './pages/barber/BarberHomeScreen.jsx';
import BarberAgendaScreen from './pages/barber/BarberAgendaScreen.jsx';
import BarberHistoryScreen from './pages/barber/BarberHistoryScreen.jsx';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) { return <Navigate to="/login" replace />; }
  return children;
};

function App() {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {userRole === 'administrador' && (
        <>
          <Route path="/" element={<ProtectedRoute><AdminHomeScreen /></ProtectedRoute>} />
          <Route path="/admin/barbers" element={<ProtectedRoute><BarbersManagementScreen /></ProtectedRoute>} />
          <Route path="/admin/barber/add" element={<ProtectedRoute><AddEditBarberScreen /></ProtectedRoute>} />
          <Route path="/admin/barber/edit/:barberId" element={<ProtectedRoute><AddEditBarberScreen /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute><ServicesManagementScreen /></ProtectedRoute>} />
          <Route path="/admin/service/add" element={<ProtectedRoute><AddEditServiceScreen /></ProtectedRoute>} />
          <Route path="/admin/service/edit/:serviceId" element={<ProtectedRoute><AddEditServiceScreen /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute><AppointmentsManagementScreen /></ProtectedRoute>} />
          <Route path="/admin/appointment/add" element={<ProtectedRoute><AddAppointmentScreen /></ProtectedRoute>} />
          <Route path="/admin/appointment/edit/:appointmentId" element={<ProtectedRoute><AddAppointmentScreen /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><ReportsScreen /></ProtectedRoute>} />
        </>
      )}

      {userRole === 'cliente' && (
        <>
          <Route path="/" element={<ProtectedRoute><ClientHomeScreen /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><BookingScreen /></ProtectedRoute>} />
          <Route path="/booking/edit/:appointmentId" element={<ProtectedRoute><BookingScreen /></ProtectedRoute>} />
          <Route path="/my-appointments" element={<ProtectedRoute><MyAppointmentsScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactScreen /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><GalleryScreen /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsScreen /></ProtectedRoute>} />
        </>
      )}

      {userRole === 'barbero' && (
        <>
          <Route path="/" element={<ProtectedRoute><BarberHomeScreen /></ProtectedRoute>} />
          <Route path="/barber/agenda" element={<ProtectedRoute><BarberAgendaScreen /></ProtectedRoute>} />
          <Route path="/barber/appointment/add" element={<ProtectedRoute><AddAppointmentScreen /></ProtectedRoute>} />
          <Route path="/barber/appointment/edit/:appointmentId" element={<ProtectedRoute><AddAppointmentScreen /></ProtectedRoute>} />
          <Route path="/barber/history" element={<ProtectedRoute><BarberHistoryScreen /></ProtectedRoute>} />
          
          {/* ¡RUTA PARA EL PERFIL DEL BARBERO ACTIVADA! */}
          <Route path="/barber/profile" element={<ProtectedRoute><AddEditBarberScreen /></ProtectedRoute>} />
          
          <Route path="/barber/history" element={<Navigate to="/" replace />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;