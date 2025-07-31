// src/pages/barber/BarberHistoryScreen.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import '../client/MyAppointmentsScreen.css';

const BarberHistoryScreen = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const { barberProfileId } = useAuth();

    useEffect(() => {
        if (!barberProfileId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "appointments"),
            where("barberId", "==", barberProfileId),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [barberProfileId]);

    const now = new Date();
    const upcomingAppointments = appointments.filter(app => app.date.toDate() >= now);
    const pastAppointments = appointments.filter(app => app.date.toDate() < now);
    const appointmentsToShow = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    return (
        <div className="my-appointments-container">
            <h1>Mi Historial de Citas</h1>
            <Link to="/" className="back-link">Volver al Panel</Link>

            <div className="tabs">
                <button className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
                    Próximas ({upcomingAppointments.length})
                </button>
                <button className={`tab-button ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
                    Pasadas ({pastAppointments.length})
                </button>
            </div>

            <div className="appointments-list">
                {loading ? ( <p>Cargando citas...</p> ) : 
                 appointmentsToShow.length > 0 ? (
                    appointmentsToShow.map(app => (
                        <div key={app.id} className="appointment-item-client">
                            <div className="appointment-details">
                                <p className="service-name-client">{app.serviceName}</p>
                                <p><strong>Cliente:</strong> {app.clientName}</p>
                                <p><strong>Fecha:</strong> {app.date.toDate().toLocaleDateString('es-ES')}</p>
                                <p><strong>Hora:</strong> {app.date.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))
                ) : ( <p>No tienes citas en esta sección.</p> )}
            </div>
        </div>
    );
};

export default BarberHistoryScreen;