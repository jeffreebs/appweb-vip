// src/pages/client/MyAppointmentsScreen.jsx (VERSIÓN FINAL COMPLETA)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { Rating } from 'react-simple-star-rating';
import './MyAppointmentsScreen.css';
import fondoBarberia from '../../assets/logo_mejorado.png';

const RatingComponent = ({ appointment }) => {
    const [rating, setRating] = useState(appointment.rating || 0);
    const [comment, setComment] = useState(appointment.comment || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleRating = async (rate) => {
        setIsSaving(true);
        setRating(rate);
        try {
            const appointmentRef = doc(db, "appointments", appointment.id);
            await updateDoc(appointmentRef, { rating: rate });
        } catch (error) {
            console.error("Error al guardar la calificación: ", error);
        }
        setIsSaving(false);
    };
    
    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleCommentBlur = async () => {
        if(comment !== (appointment.comment || '')) {
            setIsSaving(true);
            try {
                const appointmentRef = doc(db, "appointments", appointment.id);
                await updateDoc(appointmentRef, { comment: comment });
            } catch (error) {
                console.error("Error al guardar el comentario: ", error);
            }
            setIsSaving(false);
        }
    };
    
    return (
        <div className="rating-section">
            <p>Califica tu experiencia:</p>
            <Rating onClick={handleRating} initialValue={rating} size={25} transition fillColor='gold' emptyColor='gray' />
            <textarea
                className="comment-box"
                placeholder="Deja un comentario (opcional)..."
                value={comment}
                onChange={handleCommentChange}
                onBlur={handleCommentBlur}
                rows="3"
            ></textarea>
            {isSaving && <small style={{marginTop: '5px', display: 'block'}}>Guardando...</small>}
        </div>
    );
};

const MyAppointmentsScreen = () => {
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const qServices = query(collection(db, "services"));
        const unsubServices = onSnapshot(qServices, (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        
        if (!currentUser) return;
        const qAppointments = query(
            collection(db, "appointments"),
            where("clientId", "==", currentUser.uid),
            orderBy("date", "desc")
        );
        const unsubAppointments = onSnapshot(qAppointments, (snapshot) => {
            const userAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(userAppointments);
            setLoading(false);
        });

        return () => {
            unsubServices();
            unsubAppointments();
        };
    }, [currentUser]);

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
            await deleteDoc(doc(db, "appointments", appointmentId));
        }
    };

    const handleEdit = (appointmentId) => {
        navigate(`/booking/edit/${appointmentId}`);
    };

    const now = new Date();
    const upcomingAppointments = appointments.filter(app => app.date.toDate() >= now);
    const pastAppointments = appointments.filter(app => app.date.toDate() < now);
    const appointmentsToShow = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    return (
    <div className="my-appointments-background" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${fondoBarberia})` }}>
      <div className="my-appointments-container">
        
        <header className="my-appointments-header">
          <h1>Mis Citas</h1>
          <Link to="/" className="back-link">Volver al Inicio</Link>
        </header>

        <div className="tabs">
          <button className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Próximas ({upcomingAppointments.length})</button>
          <button className={`tab-button ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Historial ({pastAppointments.length})</button>
        </div>

        <main className="appointments-list">
          {loading ? <p>Cargando tus citas...</p> : appointmentsToShow.length > 0 ? (
            appointmentsToShow.map(app => {
              const appointmentDate = app.date.toDate();
              const service = services.find(s => s.id === app.serviceId);
              const duration = service ? service.duration : 60;
              const appointmentEndDate = new Date(appointmentDate.getTime() + duration * 60 * 1000);
              const twentyFourHoursAfter = new Date(appointmentEndDate.getTime() + 24 * 60 * 60 * 1000);
              const twoHoursBefore = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
              const canEdit = now < twoHoursBefore;
              const canRate = now > appointmentEndDate && now < twentyFourHoursAfter;

              return (
                <div key={app.id} className="appointment-card">
                  <div className="appointment-details">
                    <h3>{app.serviceName}</h3>
                    <p><strong>Fecha:</strong> {appointmentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p><strong>Hora:</strong> {appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="appointment-actions">
                    {activeTab === 'upcoming' && (
                      <>
                        <button onClick={() => handleEdit(app.id)} className="edit-btn" disabled={!canEdit} title={!canEdit ? "No se puede editar con menos de 2 horas de antelación." : ""}>Editar</button>
                        <button onClick={() => handleCancelAppointment(app.id)} className="cancel-btn">Cancelar</button>
                      </>
                    )}
                    {activeTab === 'past' && canRate && !app.rating && (
                      <RatingComponent appointment={app} />
                    )}
                    {activeTab === 'past' && app.rating && (
                      <div className="rating-display">
                        <p>Tu calificación:</p>
                        <Rating initialValue={app.rating} readonly size={20} fillColor='gold' emptyColor='gray'/>
                        {app.comment && <p className="comment-display">"{app.comment}"</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : <p className="no-appointments-message">No tienes citas en esta sección.</p>}
        </main>
      </div>
    </div>
  );
};

export default MyAppointmentsScreen;