// src/pages/admin/AddEditServiceScreen.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './AddEditService.css'; 
import fondoBarberia from '../../assets/logo_mejorado.png';



const AddEditServiceScreen = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [description, setDescription] = useState('');
  
  const navigate = useNavigate();
  const { serviceId } = useParams();

  useEffect(() => {
    if (serviceId) {
      setIsEditMode(true);
      const fetchService = async () => {
        const docRef = doc(db, "services", serviceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name);
          setCategory(data.category);
          setPrice(data.price);
          setDuration(data.duration);
          setDescription(data.description || '');
        }
      };
      fetchService();
    }
  }, [serviceId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const serviceData = { 
      name, 
      category, 
      price: Number(price), 
      duration: Number(duration), 
      description,
    };

    try {
      if (isEditMode) {
        await setDoc(doc(db, "services", serviceId), serviceData, { merge: true });
        alert("¡Servicio actualizado!");
      } else {
        await addDoc(collection(db, "services"), serviceData);
        alert("¡Servicio añadido!");
      }
      navigate('/admin/services');
    } catch (error) {
      console.error("Error al guardar el servicio: ", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-background" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${fondoBarberia})` }}>
      <div className="form-container">
        <h1>{isEditMode ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}</h1>
        <form onSubmit={handleSave} className="service-form">
          <div className="form-group">
            <label>Nombre del Servicio</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Categoría (Ej: Sencillo, VIP, Color)</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Precio (₡)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Duración (minutos)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Detalla qué incluye el servicio..."
            ></textarea>
          </div>
          <div className="form-actions">
            <Link to="/admin/services" className="form-button secondary">Cancelar</Link>
            <button type="submit" className="form-button primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditServiceScreen;