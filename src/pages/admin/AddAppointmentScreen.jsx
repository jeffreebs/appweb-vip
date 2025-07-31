// src/pages/admin/AddAppointmentScreen.jsx (VERSIÓN FINAL COMPLETA)

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, onSnapshot, query, where, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './AddEditBarber.css';

const AddAppointmentScreen = () => {
    const { appointmentId } = useParams();
    const { userRole, barberProfileId } = useAuth();
    const isEditMode = !!appointmentId;
    const navigate = useNavigate();
    
    const [clientName, setClientName] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedBarberId, setSelectedBarberId] = useState(userRole === 'barbero' ? barberProfileId : '');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [existingAppointments, setExistingAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const qServices = query(collection(db, "services"), orderBy("name"));
        const unsubServices = onSnapshot(qServices, (snapshot) => {
            setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qBarbers = query(collection(db, "barbers"), orderBy("name"));
        const unsubBarbers = onSnapshot(qBarbers, (snapshot) => {
            setBarbers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubServices(); unsubBarbers(); };
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const fetchAppointment = async () => {
                const docRef = doc(db, "appointments", appointmentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const appDate = data.date.toDate();
                    setClientName(data.clientName);
                    setSelectedServiceId(data.serviceId);
                    setSelectedBarberId(data.barberId);
                    setDate(appDate.toISOString().split('T')[0]);
                    setTime(appDate.toTimeString().slice(0, 5));
                }
            };
            fetchAppointment();
        }
    }, [isEditMode, appointmentId]);

    useEffect(() => {
        if (selectedBarberId && date) {
            const startOfDay = new Date(`${date}T00:00:00`);
            const endOfDay = new Date(`${date}T23:59:59`);
            const q = query(
                collection(db, "appointments"),
                where("barberId", "==", selectedBarberId),
                where("date", ">=", startOfDay),
                where("date", "<=", endOfDay)
            );
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const appointments = snapshot.docs
                    .filter(doc => doc.id !== appointmentId)
                    .map(doc => doc.data());
                setExistingAppointments(appointments);
            });
            return () => unsubscribe();
        }
    }, [selectedBarberId, date, appointmentId]);

    const availableTimeSlots = useMemo(() => {
        if (!selectedServiceId || !selectedBarberId || !date) return [];
        const workHours = { start: 9, end: 19 };
        const timeSlots = [];
        const occupiedSlots = new Set();
        const selectedService = services.find(s => s.id === selectedServiceId);
        if (!selectedService) return [];
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
    }, [selectedServiceId, selectedBarberId, date, existingAppointments, services]);
    
    const handleSave = async (e) => {
        e.preventDefault();
        if (!clientName || !selectedServiceId || !selectedBarberId || !date || !time) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        setLoading(true);
        const dateTimeString = `${date}T${time}`;
        const appointmentDate = new Date(dateTimeString);
        const firestoreTimestamp = Timestamp.fromDate(appointmentDate);
        const selectedService = services.find(s => s.id === selectedServiceId);
        
        const appointmentData = {
            clientName,
            serviceId: selectedServiceId,
            serviceName: selectedService.name,
            barberId: selectedBarberId,
            date: firestoreTimestamp,
        };

        try {
            if (isEditMode) {
                await setDoc(doc(db, "appointments", appointmentId), appointmentData);
                alert("¡Cita actualizada con éxito!");
            } else {
                await addDoc(collection(db, "appointments"), appointmentData);
                alert("¡Cita agendada con éxito!");
            }

            if (userRole === 'barbero') {
                navigate('/');
            } else {
                navigate('/admin/appointments');
            }
        } catch (error) {
            console.error("Error al guardar la cita: ", error);
            alert("Ocurrió un error al guardar.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSelectionChange = (setter) => (e) => {
        setter(e.target.value);
        setTime('');
    };

    return (
        <div className="form-container">
            <h1>{isEditMode ? 'Editar Cita' : 'Agendar Nueva Cita'}</h1>
            <form onSubmit={handleSave} className="barber-form">
                <div className="form-group">
                    <label>Nombre del Cliente</label>
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Servicio</label>
                    <select value={selectedServiceId} onChange={handleSelectionChange(setSelectedServiceId)} required>
                        <option value="" disabled>Selecciona un servicio...</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name} (₡{s.price})</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Barbero</label>
                    <select 
                        value={selectedBarberId} 
                        onChange={handleSelectionChange(setSelectedBarberId)} 
                        required
                        disabled={userRole === 'barbero'}
                    >
                        {userRole === 'administrador' && <option value="" disabled>Selecciona un barbero...</option>}
                        {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Fecha</label>
                    <input type="date" value={date} onChange={handleSelectionChange(setDate)} required />
                </div>
                <div className="form-group">
                    <label>Hora</label>
                    <select value={time} onChange={(e) => setTime(e.target.value)} required disabled={!selectedServiceId || !selectedBarberId || !date}>
                        <option value="" disabled>
                            { availableTimeSlots.length > 0 || time ? "Selecciona una hora disponible..." : "No hay horarios disponibles..." }
                        </option>
                        {isEditMode && !availableTimeSlots.includes(time) && time && <option key={time} value={time}>{time} (Horario actual)</option>}
                        {availableTimeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                </div>
                <div className="form-actions">
                    <Link to={userRole === 'barbero' ? '/' : '/admin/appointments'} className="cancel-button">
                        Cancelar
                    </Link>
                    <button type="submit" className="save-button" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Agendar Cita')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAppointmentScreen;