// src/pages/admin/AppointmentsManagementScreen.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, orderBy,doc, deleteDoc } from 'firebase/firestore'; // Importamos 'where'
import { db } from '../../firebaseConfig';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AppointmentsManagement.css';

const AppointmentsManagementScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBarber, setSelectedBarber] = useState('todos');
  const navigate = useNavigate();

  // Cargar solo los barberos una vez al inicio
  useEffect(() => {
    const qBarbers = query(collection(db, "barbers"), orderBy("name"));
    const unsubscribeBarbers = onSnapshot(qBarbers, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBarbers(data);
    });
    return () => unsubscribeBarbers();
  }, []);

  // ¡¡ESTE ES EL CAMBIO PRINCIPAL!!
  // Este useEffect se ejecutará cada vez que cambie la fecha o el barbero seleccionado
  useEffect(() => {
    setLoading(true);

    // Calculamos el inicio y el fin del día seleccionado
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Creamos la consulta base a Firestore
    let q = query(
      collection(db, "appointments"),
      where("date", ">=", startOfDay), // Dame citas DESPUÉS del inicio del día
      where("date", "<=", endOfDay),   // y ANTES del final del día
      orderBy("date", "asc")            // Ordenadas por hora
    );

    // Si se ha seleccionado un barbero específico, añadimos otro filtro 'where'
    if (selectedBarber !== 'todos') {
      q = query(q, where("barberId", "==", selectedBarber));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener citas: ", error);
      alert("No se pudieron cargar las citas.");
      setLoading(false);
    });

    // Limpiamos la suscripción anterior para evitar fugas de memoria
    return () => unsubscribe();
  }, [selectedDate, selectedBarber]); // Se vuelve a ejecutar si cambia la fecha o el barbero

  const handleDelete = async (appointmentId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.")) {
      try {
        await deleteDoc(doc(db, "appointments", appointmentId));
        alert("Cita eliminada correctamente.");
      } catch (error) {
        console.error("Error al eliminar la cita: ", error);
        alert("Ocurrió un error al intentar eliminar la cita.");
      }
    }
  };

   const handleEdit = (appointmentId) => {
    navigate(`/admin/appointment/edit/${appointmentId}`);
  };


  return (
    <div className="appointments-container">
      <div className="management-header"> {/* Usamos el mismo estilo de header */}
        <h1>Gestión de Citas</h1>
        {/* ¡NUEVO BOTÓN PARA AGENDAR! */}
        <Link to="/admin/appointment/add" className="add-button">Agendar Nueva Cita</Link>
      </div>
      <Link to="/" className="back-button">Volver al Panel</Link>

      <div className="content-layout">
        <div className="filters-column">
          <h3>Selecciona una fecha</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} className="custom-calendar" />
          <h3 style={{marginTop: '20px'}}>Filtrar por Barbero</h3>
          <select value={selectedBarber} onChange={(e) => setSelectedBarber(e.target.value)} className="barber-filter">
            <option value="todos">Todos los barberos</option>
            {barbers.map(barber => (
              <option key={barber.id} value={barber.id}>{barber.name}</option>
            ))}
          </select>
        </div>

        <div className="appointments-list-column">
          <h2>Citas para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
          {loading ? (
            <p>Cargando citas...</p>
          ) : appointments.length > 0 ? (
            appointments.map(app => (
              <div key={app.id} className="appointment-card">
              <div> {/* Contenedor para la info */}
                <p><strong>Cliente:</strong> {app.clientName}</p>
                <p><strong>Servicio:</strong> {app.serviceName}</p>
                <p><strong>Hora:</strong> {app.date.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p><strong>Barbero:</strong> {barbers.find(b => b.id === app.barberId)?.name || 'No asignado'}</p>
              </div>
              <div className="appointment-actions"> {/* Contenedor para los botones */}
                <button onClick={() => handleEdit(app.id)} className="edit-button">Editar</button>
                <button onClick={() => handleDelete(app.id)} className="delete-button">Eliminar</button>
              </div>
            </div>
            ))
          ) : (
            <p>No hay citas agendadas para este día y/o barbero.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsManagementScreen;