// src/pages/admin/AddEditBarberScreen.jsx (VERSIÓN FINAL COMPLETA)

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './AddEditBarber.css';

const AddEditBarberScreen = () => {
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const navigate = useNavigate();
    let { barberId } = useParams();
    const { userRole, barberProfileId } = useAuth();

    // Si es un barbero, solo puede editar su propio perfil
    if (userRole === 'barbero' && !barberId) {
        barberId = barberProfileId;
    }

    useEffect(() => {
        if (barberId) {
            setIsEditMode(true);
            setLoading(true);
            const fetchBarber = async () => {
                const docRef = doc(db, "barbers", barberId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const barberData = docSnap.data();
                    setName(barberData.name);
                    setSpecialty(barberData.specialty);
                    setImageUrl(barberData.imageUrl || '');
                } else {
                    alert("No se encontró el perfil del barbero.");
                    navigate(userRole === 'barbero' ? '/' : '/admin/barbers');
                }
                setLoading(false);
            };
            fetchBarber();
        }
    }, [barberId, navigate, userRole]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || !specialty) {
            alert("Por favor, rellena el nombre y la especialidad.");
            return;
        }

        setLoading(true);
        const barberData = { name, specialty, imageUrl };

        try {
            if (isEditMode) {
                const docRef = doc(db, "barbers", barberId);
                await setDoc(docRef, barberData, { merge: true });
                alert("¡Perfil actualizado con éxito!");
            } else if (userRole === 'administrador') {
                await addDoc(collection(db, "barbers"), barberData);
                alert("¡Barbero añadido con éxito!");
            }
            navigate(userRole === 'barbero' ? '/' : '/admin/barbers');
        } catch (error) {
            console.error("Error al guardar el barbero: ", error);
            alert("Ocurrió un error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <div className="loading-container">Cargando datos del perfil...</div>;
    }

    return (
        <div className="form-container">
            <h1>{isEditMode ? 'Editar Perfil' : 'Añadir Nuevo Barbero'}</h1>
            <form onSubmit={handleSave} className="barber-form">
                <div className="form-group">
                    <label htmlFor="name">Nombre</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Carlos Rivas" required />
                </div>
                <div className="form-group">
                    <label htmlFor="specialty">Especialidad</label>
                    <input id="specialty" type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ej: Cortes clásicos y barba" required />
                </div>
                <div className="form-group">
                    <label htmlFor="imageUrl">URL de la Imagen (Opcional)</label>
                    <input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/foto.jpg" />
                </div>
                <div className="form-actions">
                    <Link to={userRole === 'barbero' ? '/' : '/admin/barbers'} className="cancel-button">
                        {userRole === 'barbero' ? 'Volver al Panel' : 'Cancelar'}
                    </Link>
                    <button type="submit" className="save-button" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Barbero')}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default AddEditBarberScreen;