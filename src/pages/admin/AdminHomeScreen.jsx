// src/pages/admin/AdminHomeScreen.jsx

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const AdminHomeScreen = () => {
  const [todayStats, setTodayStats] = useState({ appointments: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  // Cargar lista de servicios para tener los precios disponibles
  useEffect(() => {
    const qServices = query(collection(db, "services"));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubServices();
  }, []);

  // Calcular las estadísticas del día de hoy
  useEffect(() => {
    if (services.length === 0) return; // Esperamos a que los servicios se carguen

    const fetchTodayStats = async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const q = query(
        collection(db, "appointments"),
        where("date", ">=", startOfDay),
        where("date", "<=", endOfDay)
      );

      const querySnapshot = await getDocs(q);
      const appointmentsToday = querySnapshot.docs.map(doc => doc.data());

      let revenueToday = 0;
      appointmentsToday.forEach(app => {
        const serviceInfo = services.find(s => s.id === app.serviceId);
        if (serviceInfo) {
          revenueToday += serviceInfo.price;
        }
      });

      setTodayStats({
        appointments: appointmentsToday.length,
        revenue: revenueToday,
      });
      setLoading(false);
    };

    fetchTodayStats();
  }, [services]); // Se recalcula si la lista de servicios cambia


  const handleLogout = () => {
    auth.signOut();
  };

  // --- Estilos para esta página (para mantenerlo simple y encapsulado) ---
  const containerStyle = { padding: '40px', maxWidth: '1200px', margin: 'auto',color: 'white' };
  const headerStyle = { borderBottom: '1px solid #4a5568', paddingBottom: '10px', marginBottom: '20px' };
  const statsContainerStyle = { display: 'flex', gap: '20px', marginBottom: '30px' };
  const statCardStyle = { flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' };
  const statValueStyle = { fontSize: '2.5em', fontWeight: 'bold', color: '#333', margin: 0 };
  const statLabelStyle = { fontSize: '1.2em', color: '#666', margin: 0 };
  const navStyle = { display: 'flex', gap: '15px', flexWrap: 'wrap' };
  const linkStyle = { padding: '15px 20px', color: 'white', textDecoration: 'none', borderRadius: '8px', display: 'inline-block', textAlign: 'center', fontWeight: '600' };
  const logoutButtonStyle = {
    marginTop: '40px',
    padding: '10px 20px',
    backgroundColor: '#e53e3e', // Rojo para acciones destructivas/finales
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Panel de Administrador</h1>
        <p>¡Bienvenido, Admin! Aquí tienes un resumen de tu día.</p>
      </div>

      {/* --- SECCIÓN DE ESTADÍSTICAS RÁPIDAS --- */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <p style={statValueStyle}>{loading ? '...' : todayStats.appointments}</p>
          <p style={statLabelStyle}>Citas para Hoy</p>
        </div>
        <div style={statCardStyle}>
          <p style={statValueStyle}>{loading ? '...' : `₡${todayStats.revenue.toLocaleString('es-CR')}`}</p>
          <p style={statLabelStyle}>Ingresos de Hoy</p>
        </div>
      </div>

      {/* --- SECCIÓN DE ACCESOS DIRECTOS --- */}
      <h2>Accesos Directos</h2>
      <nav style={navStyle}>
        <Link to="/admin/appointments" style={{ ...linkStyle, backgroundColor: '#b7791f' }}>
          Ver Calendario de Citas
        </Link>
        <Link to="/admin/barbers" style={{ ...linkStyle, backgroundColor: '#3182ce' }}>
          Gestionar Barberos
        </Link>
        <Link to="/admin/services" style={{ ...linkStyle, backgroundColor: '#2c7a7b' }}>
          Gestionar Servicios
        </Link>
        <Link to="/admin/reports" style={{ ...linkStyle, backgroundColor: '#6b46c1' }}>
          Generar Informes
        </Link>
      </nav>

      <button onClick={handleLogout} style={logoutButtonStyle}>Cerrar Sesión</button>
    </div>
  );
};

export default AdminHomeScreen;