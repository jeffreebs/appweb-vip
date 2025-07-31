// src/pages/barber/BarberHomeScreen.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebaseConfig';
import '../client/ClientHomeScreen.css'; // Reutilizamos estilos del cliente

const BarberHomeScreen = () => {
    const { currentUser } = useAuth();

    const handleLogout = () => {
        auth.signOut();
    };

    const displayName = currentUser?.displayName || currentUser?.email.split('@')[0];

    return (
        <div className="client-dashboard">
            <header className="client-header">
                <h1>Panel de Barbero</h1>
                <h2>¡Bienvenido, {displayName}!</h2>
            </header>
            
            <nav className="client-menu">
                <Link to="/barber/agenda" className="menu-item primary">
                    <h2>Ver Mi Agenda</h2>
                    <p>Revisa tu calendario de citas</p>
                </Link>
                <Link to="/barber/appointment/add" className="menu-item">
                    <h3>Agendar Nueva Cita</h3>
                    <p>Crea una nueva reserva para un cliente</p>
                </Link>
                <Link to="/barber/profile" className="menu-item">
                    <h3>Mi Perfil</h3>
                    <p>Actualiza tus datos y especialidad</p>
                </Link>
                <Link to="/barber/history" className="menu-item">
                    <h3>Historial de Citas</h3>
                    <p>Consulta tus citas pasadas</p>
                </Link>
            </nav>
      
            <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
        </div>
    );
};

export default BarberHomeScreen;