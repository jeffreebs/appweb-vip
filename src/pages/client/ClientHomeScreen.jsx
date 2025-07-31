// src/pages/client/ClientHomeScreen.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Para obtener el nombre del usuario
import { auth } from '../../firebaseConfig';
import './ClientHomeScreen.css'; // Crearemos estilos nuevos

const ClientHomeScreen = () => {
  const { currentUser } = useAuth(); // Obtenemos el usuario actual del contexto

  const handleLogout = () => {
    auth.signOut();
  };

  // Extraemos el nombre del email si no tenemos un nombre de perfil aún
  const displayName = currentUser?.displayName || currentUser?.email.split('@')[0];

  return (
    <div className="client-dashboard">
      <header className="client-header">
        <h1>¡Bienvenido, {displayName}!</h1>
        <p>¿Listo para tu próximo corte?</p>
      </header>
      
      <nav className="client-menu">
        <Link to="/booking" className="menu-item primary">
          <h2>Agendar Nueva Cita</h2>
          <p>Encuentra tu espacio ideal</p>
        </Link>
        <Link to="/my-appointments" className="menu-item">
          <h3>Mis Citas</h3>
          <p>Ver historial y próximas citas</p>
        </Link>
        <Link to="/profile" className="menu-item">
          <h3>Mi Perfil</h3>
          <p>Actualiza tus datos</p>
        </Link>
        <Link to="/gallery" className="menu-item">
          <h3>Galería</h3>
          <p>Inspírate con nuestros trabajos</p>
        </Link>
        <Link to="/contact" className="menu-item">
          <h3>Ubicación y Contacto</h3>
          <p>Encuéntranos y habla con nosotros</p>
        </Link>
        <Link to="/products" className="menu-item">
          <h3>Productos</h3>
          <p>Descubre lo que ofrecemos</p>
        </Link>
      </nav>
      
      <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
    </div>
  );
};

export default ClientHomeScreen;