// src/pages/admin/ServicesManagementScreen.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './ServicesManagement.css'; 
import fondoBarberia from '../../assets/logo_mejorado.png';



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
    <div className="services-management-background" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${fondoBarberia})` }}>
      <div className="services-management-container">
        
        <header className="services-header">
          <div className="sm-title">
            <h1>Gestión de Servicios</h1>
          </div>
          <div className="sm-actions">
            <Link to="/" className="sm-button secondary">Volver al Panel</Link>
            <Link to="/admin/service/add" className="sm-button primary">Añadir Servicio</Link>
          </div>
        </header>

        <main className="services-list">
          {services.length > 0 ? (
            services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-info">
                  <h3>{service.name} <span className="service-category">({service.category})</span></h3>
                  <p className="service-details">
                    <span>Precio: ₡{service.price.toLocaleString('es-CR')}</span>
                    <span>Duración: {service.duration} min</span>
                  </p>
                </div>
                <div className="service-actions">
                  <button onClick={() => handleEdit(service.id)} className="edit-button">Editar</button>
                  <button onClick={() => handleDelete(service.id, service.name)} className="delete-button">Eliminar</button>
                </div>
              </div>
            ))
          ) : (
            <div className="service-card-empty">
                <p>No hay servicios registrados. Haz clic en "Añadir Servicio" para empezar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ServicesManagementScreen;