// src/pages/client/BookingScreen.jsx (VERSIÓN FINAL COMPLETA)

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, onSnapshot, query, where, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingScreen.css';

const BookingScreen = () => {
    const { appointmentId } = useParams();
    const isEditMode = !!appointmentId;

    const [step, setStep] = useState(isEditMode ? 3 : 1);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [existingAppointments, setExistingAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const qServices = query(collection(db, "services"), orderBy("name"));
        const unsubServices = onSnapshot(qServices, (snap) => setServices(snap.docs.map(d => ({id: d.id, ...d.data()}))));
        const qBarbers = query(collection(db, "barbers"), orderBy("name"));
        const unsubBarbers = onSnapshot(qBarbers, (snap) => setBarbers(snap.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => { unsubServices(); unsubBarbers(); };
    }, []);

    useEffect(() => {
        if (isEditMode && services.length > 0 && barbers.length > 0) {
            const fetchAppointment = async () => {
                const docRef = doc(db, "appointments", appointmentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const service = services.find(s => s.id === data.serviceId);
                    const barber = barbers.find(b => b.id === data.barberId);
                    if (service && barber) {
                        setSelectedService(service);
                        setSelectedBarber(barber);
                        setSelectedDate(data.date.toDate());
                        setSelectedTime(data.date.toDate().toTimeString().slice(0, 5));
                    }
                } else {
                    alert("Cita no encontrada.");
                    navigate("/my-appointments");
                }
            };
            fetchAppointment();
        }
    }, [isEditMode, appointmentId, services, barbers, navigate]);

    useEffect(() => {
        if (selectedBarber && selectedDate) {
            const start = new Date(selectedDate); start.setHours(0,0,0,0);
            const end = new Date(selectedDate); end.setHours(23,59,59,999);
            const q = query(collection(db, "appointments"), where("barberId", "==", selectedBarber.id), where("date", ">=", start), where("date", "<=", end));
            const unsub = onSnapshot(q, (snap) => {
                const appointments = snap.docs
                    .filter(doc => doc.id !== appointmentId)
                    .map(d => d.data());
                setExistingAppointments(appointments);
            });
            return () => unsub();
        }
    }, [selectedBarber, selectedDate, appointmentId]);

    const availableTimeSlots = useMemo(() => {
        if (!selectedService || !selectedBarber || !selectedDate) return [];
        const workHours = { start: 9, end: 19 };
        const timeSlots = [];
        const occupiedSlots = new Set();
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const blocksNeeded = Math.ceil(selectedService.duration / 60);
        existingAppointments.forEach(app => {
            const appointmentDate = app.date.toDate();
            const startHour = appointmentDate.getHours();
            const existingService = services.find(s => s.id === app.serviceId) || { duration: 60 };
            const blocksOccupied = Math.ceil(existingService.duration / 60);
            for (let i = 0; i < blocksOccupied; i++) {
                occupiedSlots.add(startHour + i);
            }
        });
        for (let hour = workHours.start; hour <= workHours.end - blocksNeeded; hour++) {
            const slotTime = new Date(selectedDate);
            slotTime.setHours(hour, 0, 0, 0);
            if (slotTime < twoHoursFromNow) continue;
            let isAvailable = true;
            for (let i = 0; i < blocksNeeded; i++) {
                if (occupiedSlots.has(hour + i)) {
                    isAvailable = false;
                    break;
                }
            }
            if (isAvailable) {
                timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            }
        }
        return timeSlots;
    }, [selectedService, selectedBarber, selectedDate, existingAppointments, services]);
    
    const handleSelectService = (service) => { setSelectedService(service); setStep(2); };
    const handleSelectBarber = (barber) => { setSelectedBarber(barber); setStep(3); };
    const handleSelectTime = (time) => { setSelectedTime(time); };
    
    const handleConfirmBooking = async () => {
        setLoading(true);
        const [hour, minute] = selectedTime.split(':');
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(hour, minute, 0, 0);
        const appointmentData = {
            clientName: currentUser.displayName || currentUser.email,
            clientId: currentUser.uid,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            barberId: selectedBarber.id,
            date: Timestamp.fromDate(appointmentDate),
        };
        try {
            if (isEditMode) {
                await setDoc(doc(db, "appointments", appointmentId), appointmentData);
                alert("¡Tu cita ha sido actualizada!");
            } else {
                await addDoc(collection(db, "appointments"), appointmentData);
                alert("¡Tu cita ha sido agendada!");
            }
            navigate('/my-appointments');
        } catch (error) {
            console.error("Error al guardar cita: ", error);
            alert("Ocurrió un error. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };
    const tileDisabled = ({ date, view }) => {
        if (view === 'month') {
            const day = date.getDay();
            const today = new Date(); today.setHours(0,0,0,0);
            return day === 0 || date < today;
        }
    };

    return (
        <div className="booking-container">
            <h1>{isEditMode ? 'Editar Cita' : 'Agendar Nueva Cita'}</h1>

            {/* Mostramos el indicador de pasos solo si NO estamos en modo edición */}
            {!isEditMode && (
                <div className="step-indicator">
                    <div className={`step-item ${step >= 1 ? 'active' : ''}`}><div className="step-circle">1</div><div className="step-label">Servicio</div></div>
                    <div className={`step-item ${step >= 2 ? 'active' : ''}`}><div className="step-circle">2</div><div className="step-label">Barbero</div></div>
                    <div className={`step-item ${step >= 3 ? 'active' : ''}`}><div className="step-circle">3</div><div className="step-label">Fecha y Hora</div></div>
                </div>
            )}

            <div className="step-content">
                {/* --- CONTENIDO DEL PASO 1: SERVICIOS --- */}
                {step === 1 && (
                    <div>
                        <h2>Paso 1: Selecciona un servicio</h2>
                        <div className="selection-grid">
                            {services.map(s => (
                                <div key={s.id} className={`selection-card ${selectedService?.id === s.id ? 'selected' : ''}`} onClick={() => handleSelectService(s)}>
                                    <p className="service-name">{s.name}</p>
                                    <p className="service-details">₡{s.price} - {s.duration} min</p>
                                    {s.description && <p className="service-description">{s.description}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- CONTENIDO DEL PASO 2: BARBEROS --- */}
                {step === 2 && (
                    <div>
                        <h2>Paso 2: Selecciona tu barbero</h2>
                        <div className="selection-grid">
                            {barbers.map(b => (
                                <div key={b.id} className={`selection-card ${selectedBarber?.id === b.id ? 'selected' : ''}`} onClick={() => handleSelectBarber(b)}>
                                    <p className="service-name">{b.name}</p>
                                    <p className="service-details">{b.specialty}</p>
                                </div>
                            ))}
                        </div>
                        <div className="action-buttons" style={{ justifyContent: 'flex-start' }}>
                            <button onClick={() => setStep(1)} className="back-btn">Volver a Servicios</button>
                        </div>
                    </div>
                )}
                
                {/* --- CONTENIDO DEL PASO 3: FECHA Y HORA --- */}
                {step === 3 && (
                     <div>
                        <h2>{isEditMode ? 'Modifica la fecha y hora' : 'Paso 3: Elige la fecha y hora'}</h2>
                        <div className="date-time-picker">
                            <div className="calendar-container">
                                <Calendar onChange={setSelectedDate} value={selectedDate} tileDisabled={tileDisabled} />
                            </div>
                            <div className="time-slots-container">
                                <h3>Horarios Disponibles</h3>
                                <div className="time-slots-grid">
                                    {/* Muestra el horario actual si estamos editando y ya no está en la lista de disponibles */}
                                    {isEditMode && !availableTimeSlots.includes(selectedTime) && selectedTime && (
                                        <div key="current-time" className="time-slot selected" onClick={() => handleSelectTime(selectedTime)}>
                                            {selectedTime} (Actual)
                                        </div>
                                    )}
                                    {/* Muestra la lista de horarios disponibles */}
                                    {availableTimeSlots.map(t => (
                                        <div key={t} className={`time-slot ${selectedTime === t ? 'selected' : ''}`} onClick={() => handleSelectTime(t)}>
                                            {t}
                                        </div>
                                    ))}
                                    {/* Mensaje si no hay horarios */}
                                    {availableTimeSlots.length === 0 && !isEditMode && <p>No hay horarios disponibles.</p>}
                                </div>
                            </div>
                        </div>
                        {selectedTime && (
                            <div className="confirmation-summary">
                                <h3>Resumen de tu Cita</h3>
                                <p><strong>Servicio:</strong> {selectedService?.name}</p>
                                <p><strong>Barbero:</strong> {selectedBarber?.name}</p>
                                <p><strong>Fecha:</strong> {selectedDate.toLocaleDateString('es-ES')}</p>
                                <p><strong>Hora:</strong> {selectedTime}</p>
                            </div>
                        )}
                        <div className="action-buttons">
                            <button onClick={() => isEditMode ? navigate('/my-appointments') : setStep(2)} className="back-btn">
                                {isEditMode ? 'Cancelar' : 'Volver a Barberos'}
                            </button>
                            <button onClick={handleConfirmBooking} className="confirm-btn" disabled={!selectedTime || loading}>
                                {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Confirmar Cita')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default BookingScreen;