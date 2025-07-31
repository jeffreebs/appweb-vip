// src/pages/barber/BarberAgendaScreen.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../admin/AppointmentsManagement.css'; 

const BarberAgendaScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]=useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { barberProfileId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Usamos el ID del perfil del barbero (ej. hM3p4j9...) que viene del AuthContext
    if (!barberProfileId) { 
      setLoading(false); 
      return; 
    }
    setLoading(true);
    const startOfDay = new Date(selectedDate); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate); endOfDay.setHours(23, 59, 59, 999);
    
    const q = query(
      collection(db, "appointments"),
      where("barberId", "==", barberProfileId),
      where("date", ">=", startOfDay),
      where("date", "<=", endOfDay),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate, barberProfileId]);

  const handleCancel = async (appointmentId) => {
    if (window.confirm("¿Seguro que quieres cancelar esta cita?")) {
      await deleteDoc(doc(db, "appointments", appointmentId));
    }
  };
  

  const handleEdit = (appointmentId) => {
    navigate(`/barber/appointment/edit/${appointmentId}`);
  };

  return (
    <div className="appointments-container">
      <h1>Mi Agenda</h1>
      <Link to="/" className="back-button">Volver al Panel</Link>
      
      <div className="content-layout">
        <div className="filters-column">
          <h3>Selecciona una fecha</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} className="custom-calendar" />
        </div>
        <div className="appointments-list-column">
          <h2>Citas para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
          {loading ? <p>Cargando...</p> : appointments.length > 0 ? (
            appointments.map(app => (
              <div key={app.id} className="appointment-card">
                <div>
                  <p><strong>Cliente:</strong> {app.clientName}</p>
                  <p><strong>Servicio:</strong> {app.serviceName}</p>
                  <p><strong>Hora:</strong> {app.date.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="appointment-actions">
                  {/* ¡AQUÍ ESTÁ LA CORRECCIÓN! Quitamos los paréntesis extra */}
                  <button onClick={() => handleEdit(app.id)} className="edit-button">Editar</button>
                  <button onClick={() => handleCancel(app.id)} className="delete-button">Cancelar</button>
                </div>
              </div>
            ))
          ) : ( <p>No tienes citas para este día.</p> )}
        </div>
      </div>
    </div>
  );
};

export default BarberAgendaScreen;