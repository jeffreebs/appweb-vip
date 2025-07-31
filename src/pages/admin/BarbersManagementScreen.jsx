// src/pages/admin/BarbersManagementScreen.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './BarbersManagement.css';

const BarbersManagementScreen = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "barbers"), orderBy("name"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const barbersData = [];
      querySnapshot.forEach((doc) => {
        barbersData.push({ id: doc.id, ...doc.data() });
      });
      setBarbers(barbersData);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener los barberos: ", error);
      alert("No se pudieron cargar los datos de los barberos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (barberId, barberName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${barberName}?`)) {
      try {
        await deleteDoc(doc(db, "barbers", barberId));
        alert("Barbero eliminado correctamente.");
      } catch (error) {
        console.error("Error al eliminar el barbero: ", error);
        alert("Ocurrió un error al intentar eliminar el barbero.");
      }
    }
  };
  
  // ¡NUEVA FUNCIÓN! Para navegar a la pantalla de edición
  const handleEdit = (barberId) => {
    navigate(`/admin/barber/edit/${barberId}`);
  };

  if (loading) {
    return <div className="loading-container">Cargando barberos...</div>;
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Gestión de Barberos</h1>
        <Link to="/admin/barber/add" className="add-button">Añadir Barbero</Link>
      </div>
      <Link to="/" className="back-button" style={{marginBottom: '20px', display: 'inline-block'}}>Volver al Panel</Link>

      <div className="barber-list">
        {barbers.length > 0 ? (
          barbers.map((barber) => (
            <div key={barber.id} className="barber-item">
              <img 
                src={barber.imageUrl || 'https://via.placeholder.com/150'} 
                alt={barber.name} 
                className="barber-avatar"
              />
              <div className="barber-info">
                <p className="barber-name">{barber.name}</p>
                <p className="barber-specialty">{barber.specialty}</p>
              </div>
              <div className="barber-actions">
                <button onClick={() => handleEdit(barber.id)} className="edit-button">Editar</button>
                <button onClick={() => handleDelete(barber.id, barber.name)} className="delete-button">Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay barberos registrados. Haz clic en "Añadir Barbero" para empezar.</p>
        )}
      </div>
    </div>
  );
};

export default BarbersManagementScreen;