// src/pages/admin/ServicesManagementScreen.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './ServicesManagement.css'; // Usaremos un CSS nuevo

const ServicesManagementScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (serviceId, serviceName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${serviceName}"?`)) {
      await deleteDoc(doc(db, "services", serviceId));
      alert("Servicio eliminado.");
    }
  };

  const handleEdit = (serviceId) => {
    navigate(`/admin/service/edit/${serviceId}`);
  };

  if (loading) {
    return <div className="loading-container">Cargando servicios...</div>;
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Gestión de Servicios</h1>
        <Link to="/admin/service/add" className="add-button">Añadir Servicio</Link>
      </div>
      <Link to="/" className="back-button" style={{marginBottom: '20px', display: 'inline-block'}}>Volver al Panel</Link>

      <div className="service-list">
        {services.length > 0 ? (
          services.map(service => (
            <div key={service.id} className="service-item">
              <div className="service-info">
                <p className="service-name">{service.name} <span className="service-category">({service.category})</span></p>
                <p className="service-details">Precio: ₡{service.price} - Duración: {service.duration} min</p>
              </div>
              <div className="service-actions">
                <button onClick={() => handleEdit(service.id)} className="edit-button">Editar</button>
                <button onClick={() => handleDelete(service.id, service.name)} className="delete-button">Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay servicios registrados. Haz clic en "Añadir Servicio" para empezar.</p>
        )}
      </div>
    </div>
  );
};

export default ServicesManagementScreen;