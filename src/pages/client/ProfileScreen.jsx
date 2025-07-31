// src/pages/client/ProfileScreen.jsx (VERSIÓN FINAL COMPLETA)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import './ProfileScreen.css';

const RankCard = ({ rankName, rankDescription }) => {
    const rankClass = rankName.toLowerCase().replace(/ /g, '-');
    return (
        <div className={`rank-card rank-${rankClass}`}>
            <h4>{rankName}</h4>
            <p>{rankDescription}</p>
        </div>
    );
};

const ProfileScreen = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ fullName: '', phone: '', gender: '' });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [rank, setRank] = useState({ name: 'Novato', description: '¡Agenda tu primera cita para empezar!' });

    useEffect(() => {
        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            const fetchProfileAndRank = async () => {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileData({
                        fullName: data.fullName || currentUser.displayName || '',
                        phone: data.phone || '',
                        gender: data.gender || '',
                    });
                }

                const twoMonthsAgo = new Date();
                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

                const appointmentsQuery = query(
                    collection(db, "appointments"),
                    where("clientId", "==", currentUser.uid),
                    where("date", ">=", Timestamp.fromDate(twoMonthsAgo)),
                    where("date", "<", Timestamp.now())
                );

                const querySnapshot = await getDocs(appointmentsQuery);
                const count = querySnapshot.size;

                let currentRank = { name: 'Fan Ocasional', description: `Has completado ${count} cita(s) en los últimos 2 meses.` };
                if (count >= 5) {
                    currentRank = { name: 'Embajador Vipcuts', description: `¡Gracias por tu lealtad! Has completado ${count} citas recientemente.` };
                } else if (count >= 3) {
                    currentRank = { name: 'Cliente Frecuente', description: `Nos encanta verte. Has completado ${count} citas en los últimos 2 meses.` };
                } else if (count === 0) {
                    currentRank = { name: 'Novato', description: '¡Agenda tu primera cita para empezar a subir de rango!' };
                }
                
                setRank(currentRank);
                await updateDoc(userDocRef, { rank: currentRank.name });
                setLoading(false);
            };
            fetchProfileAndRank();
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile(auth.currentUser, { displayName: profileData.fullName });
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                fullName: profileData.fullName,
                phone: profileData.phone,
                gender: profileData.gender,
            });
            alert("¡Perfil actualizado con éxito!");
            navigate('/');
        } catch (error) {
            console.error("Error al actualizar el perfil: ", error);
            alert("Ocurrió un error al guardar tu perfil.");
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando perfil y calculando tu rango...</p>;
    }

    return (
        <div className="profile-container">
            <h1>Mi Perfil</h1>
            <Link to="/" className="back-link">Volver al Inicio</Link>

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                    <h3>Información Personal</h3>
                    <div className="form-group-profile">
                        <label htmlFor="fullName">Nombre Completo</label>
                        <input type="text" id="fullName" name="fullName" value={profileData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group-profile">
                        <label htmlFor="email">Correo Electrónico (no editable)</label>
                        <input type="email" id="email" name="email" value={currentUser.email} disabled />
                    </div>
                    <div className="form-group-profile">
                        <label htmlFor="phone">Número de Teléfono</label>
                        <input type="tel" id="phone" name="phone" value={profileData.phone} onChange={handleChange} placeholder="Ej: 8888-8888" />
                    </div>
                    <div className="form-group-profile">
                        <label htmlFor="gender">Género</label>
                        <select id="gender" name="gender" value={profileData.gender} onChange={handleChange}>
                            <option value="">Prefiero no decirlo</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Tu Rango en Vipcuts</h3>
                    <RankCard rankName={rank.name} rankDescription={rank.description} />
                </div>
                
                <button type="submit" className="save-btn-profile" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
};

export default ProfileScreen;