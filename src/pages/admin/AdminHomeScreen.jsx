
// src/pages/admin/AdminHomeScreen.jsx

// src/pages/admin/AdminHomeScreen.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Importa el archivo CSS para los estilos
import './AdminHomeScreen.css';
// Importa la imagen de fondo

const AdminHomeScreen = () => {
  const [todayStats, setTodayStats] = useState({ appointments: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  // Lógica de carga de datos unificada en un solo useEffect para mayor robustez
  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // --- Paso 1: Cargar los servicios y sus precios ---
        const servicesQuery = query(collection(db, "services"));
        const servicesSnapshot = await getDocs(servicesQuery);
        // Creamos un mapa de precios para buscar fácilmente: { serviceId: price, ... }
        const pricesMap = new Map();
        servicesSnapshot.forEach(doc => {
          pricesMap.set(doc.id, doc.data().price);
        });

        // --- Paso 2: Cargar las citas del día de hoy ---
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("date", ">=", startOfDay),
          where("date", "<=", endOfDay)
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsToday = appointmentsSnapshot.docs;

        // --- Paso 3: Calcular los ingresos usando el mapa de precios ---
        let revenueToday = 0;
        appointmentsToday.forEach(doc => {
          const appointmentData = doc.data();
          const servicePrice = pricesMap.get(appointmentData.serviceId);
          if (servicePrice) {
            revenueToday += servicePrice;
          }
        });
        
        // --- Paso 4: Actualizar el estado con los datos finales ---
        setTodayStats({
          appointments: appointmentsToday.length,
          revenue: revenueToday,
        });

      } catch (error) {
        // Si algo falla, lo veremos en la consola del navegador.
        console.error("Error al cargar los datos del panel de administrador:", error);
        // Opcional: podrías mostrar un mensaje de error en la UI.
        setTodayStats({ appointments: 'Error', revenue: 'Error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []); // El array de dependencias vacío [] asegura que esto se ejecute solo una vez al montar el componente.

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="admin-home-background">
      <div className="admin-home-container">
        <div className="admin-home-header">
          <h1>Panel de Administrativo</h1>
          <p>¡Bienvenido Brayan ! Así pinta el día hoy para la barbería.</p>
        </div>

        {/* --- SECCIÓN DE ESTADÍSTICAS RÁPIDAS --- */}
        <div className="stats-container">
          <div className="stat-card">
            <p className="stat-value">{loading ? '...' : todayStats.appointments}</p>
            <p className="stat-label">Citas para Hoy</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{loading ? '...' : `₡${todayStats.revenue.toLocaleString('es-CR')}`}</p>
            <p className="stat-label">Ingresos de Hoy</p>
          </div>
        </div>

        {/* --- SECCIÓN DE ACCESOS DIRECTOS --- */}
        <h2>Accesos Directos</h2>
        <nav className="nav-container">
          <Link to="/admin/appointments" className="button-neumorphic">
            <div className="button-outer">
              <div className="button-inner">
                <span>Ver Calendario de Citas</span>
              </div>
            </div>
          </Link>
          <Link to="/admin/barbers" className="button-neumorphic">
            <div className="button-outer">
              <div className="button-inner">
                <span>Gestionar Barberos</span>
              </div>
            </div>
          </Link>
          <Link to="/admin/services" className="button-neumorphic">
            <div className="button-outer">
              <div className="button-inner">
                <span>Gestionar Servicios</span>
              </div>
            </div>
          </Link>
          <Link to="/admin/reports" className="button-neumorphic">
            <div className="button-outer">
              <div className="button-inner">
                <span>Generar Informes</span>
              </div>
            </div>
          </Link>
        </nav>

        <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default AdminHomeScreen;






// // src/pages/admin/AdminHomeScreen.jsx

// import React, { useState, useEffect } from 'react';
// import { auth } from '../../firebaseConfig';
// import { Link } from 'react-router-dom';
// import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
// import { db } from '../../firebaseConfig';

// const AdminHomeScreen = () => {
//   const [todayStats, setTodayStats] = useState({ appointments: 0, revenue: 0 });
//   const [loading, setLoading] = useState(true);
//   const [services, setServices] = useState([]);

//   // Cargar lista de servicios para tener los precios disponibles
//   useEffect(() => {
//     const qServices = query(collection(db, "services"));
//     const unsubServices = onSnapshot(qServices, (snapshot) => {
//       setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     });
//     return () => unsubServices();
//   }, []);

//   // Calcular las estadísticas del día de hoy
//   useEffect(() => {
//     if (services.length === 0) return; // Esperamos a que los servicios se carguen

//     const fetchTodayStats = async () => {
//       const today = new Date();
//       const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//       const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//       const q = query(
//         collection(db, "appointments"),
//         where("date", ">=", startOfDay),
//         where("date", "<=", endOfDay)
//       );

//       const querySnapshot = await getDocs(q);
//       const appointmentsToday = querySnapshot.docs.map(doc => doc.data());

//       let revenueToday = 0;
//       appointmentsToday.forEach(app => {
//         const serviceInfo = services.find(s => s.id === app.serviceId);
//         if (serviceInfo) {
//           revenueToday += serviceInfo.price;
//         }
//       });

//       setTodayStats({
//         appointments: appointmentsToday.length,
//         revenue: revenueToday,
//       });
//       setLoading(false);
//     };

//     fetchTodayStats();
//   }, [services]); // Se recalcula si la lista de servicios cambia


//   const handleLogout = () => {
//     auth.signOut();
//   };

//   // --- Estilos para esta página (para mantenerlo simple y encapsulado) ---
//   const containerStyle = { padding: '40px', maxWidth: '1200px', margin: 'auto',color: 'white' };
//   const headerStyle = { borderBottom: '1px solid #4a5568', paddingBottom: '10px', marginBottom: '20px' };
//   const statsContainerStyle = { display: 'flex', gap: '20px', marginBottom: '30px' };
//   const statCardStyle = { flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' };
//   const statValueStyle = { fontSize: '2.5em', fontWeight: 'bold', color: '#333', margin: 0 };
//   const statLabelStyle = { fontSize: '1.2em', color: '#666', margin: 0 };
//   const navStyle = { display: 'flex', gap: '15px', flexWrap: 'wrap' };
//   const linkStyle = { padding: '15px 20px', color: 'white', textDecoration: 'none', borderRadius: '8px', display: 'inline-block', textAlign: 'center', fontWeight: '600' };
//   const logoutButtonStyle = {
//     marginTop: '40px',
//     padding: '10px 20px',
//     backgroundColor: '#ce5c5cff', // Rojo para acciones destructivas/finales
//     color: 'white',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     fontWeight: '600',
//     fontSize: '16px',
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={headerStyle}>
//         <h1>Panel de Administrador</h1>
//         <p>¡Bienvenido, Admin! Aquí tienes un resumen de tu día.</p>
//       </div>

//       {/* --- SECCIÓN DE ESTADÍSTICAS RÁPIDAS --- */}
//       <div style={statsContainerStyle}>
//         <div style={statCardStyle}>
//           <p style={statValueStyle}>{loading ? '...' : todayStats.appointments}</p>
//           <p style={statLabelStyle}>Citas para Hoy</p>
//         </div>
//         <div style={statCardStyle}>
//           <p style={statValueStyle}>{loading ? '...' : `₡${todayStats.revenue.toLocaleString('es-CR')}`}</p>
//           <p style={statLabelStyle}>Ingresos de Hoy</p>
//         </div>
//       </div>

//       {/* --- SECCIÓN DE ACCESOS DIRECTOS --- */}
//       <h2>Accesos Directos</h2>
//       <nav style={navStyle}>
//         <Link to="/admin/appointments" style={{ ...linkStyle, backgroundColor: '#b4973f' }}>
//           Ver Calendario de Citas
//         </Link>
//         <Link to="/admin/barbers" style={{ ...linkStyle, backgroundColor: '#b4973f' }}>
//           Gestionar Barberos
//         </Link>
//         <Link to="/admin/services" style={{ ...linkStyle, backgroundColor: '#b4973f' }}>
//           Gestionar Servicios
//         </Link>
//         <Link to="/admin/reports" style={{ ...linkStyle, backgroundColor: '#b4973f' }}>
//           Generar Informes
//         </Link>
//       </nav>

//       <button onClick={handleLogout} style={logoutButtonStyle}>Cerrar Sesión</button>
//     </div>
//   );
// };

// export default AdminHomeScreen;