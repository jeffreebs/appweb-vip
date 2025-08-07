// src/pages/admin/BarbersManagementScreen.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './BarbersManagement.css';
import fondoBarberia from '../../assets/logo_mejorado.png';


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
    <div className="barbers-management-background" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${fondoBarberia})` }}>
      <div className="barbers-management-container">
        
        <header className="barbers-header">
          <div className="bm-title">
            <h1>Gestión de Barberos</h1>
          </div>
          <div className="bm-actions">
            <Link to="/" className="bm-button secondary">Volver al Panel</Link>
            <Link to="/admin/barber/add" className="bm-button primary">Añadir Barbero</Link>
          </div>
        </header>

        <main className="barbers-list">
          {barbers.length > 0 ? (
            barbers.map((barber) => (
              <div key={barber.id} className="barber-card">
                <div className="barber-avatar">
                  <img 
                    src={barber.imageUrl || 'https://i.pravatar.cc/150?u=' + barber.id} // Placeholder más variado
                    alt={barber.name} 
                  />
                </div>
                <div className="barber-info">
                  <h3>{barber.name}</h3>
                  <p>{barber.specialty}</p>
                </div>
                <div className="barber-actions">
                  <button onClick={() => handleEdit(barber.id)} className="edit-button">Editar</button>
                  <button onClick={() => handleDelete(barber.id, barber.name)} className="delete-button">Eliminar</button>
                </div>
              </div>
            ))
          ) : (
            <div className="barber-card-empty">
              <p>No hay barberos registrados. Haz clic en "Añadir Barbero" para empezar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BarbersManagementScreen;