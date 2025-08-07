// src/pages/admin/ReportsScreen.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './ReportsScreen.css';
import fondoBarberia from '../../assets/logo_mejorado.png'


const ReportsScreen = () => {
  // --- ESTADOS ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('todos');
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]); // ¡NUEVO! Para tener los precios
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- EFECTOS DE CARGA ---
  // Cargar barberos y servicios al inicio
  useEffect(() => {
    const qBarbers = query(collection(db, "barbers"), orderBy("name"));
    const unsubBarbers = onSnapshot(qBarbers, (snapshot) => {
      setBarbers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qServices = query(collection(db, "services"), orderBy("name"));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubBarbers();
      unsubServices();
    };
  }, []);

  // --- FUNCIÓN PRINCIPAL ---
  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecciona una fecha de inicio y una fecha de fin.");
      return;
    }

    setLoading(true);
    setReportData(null);

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    // ¡CORRECCIÓN DEL FILTRO! La consulta se construye en partes.
    let appointmentsQuery = query(
      collection(db, "appointments"),
      where("date", ">=", start),
      where("date", "<=", end)
    );

    // Aplicamos el filtro de barbero SOLO si no es "todos"
    if (selectedBarber !== 'todos') {
      appointmentsQuery = query(appointmentsQuery, where("barberId", "==", selectedBarber));
    }

    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments = querySnapshot.docs.map(doc => doc.data());

    // --- PROCESAMIENTO DE DATOS ---
    const serviceDetails = {};
    let totalRevenue = 0;
    let totalServices = 0;

    appointments.forEach(appointment => {
      const serviceInfo = services.find(s => s.id === appointment.serviceId);
      if (serviceInfo) {
        const serviceName = serviceInfo.name;
        if (!serviceDetails[serviceName]) {
          serviceDetails[serviceName] = { count: 0, revenue: 0 };
        }
        serviceDetails[serviceName].count += 1;
        serviceDetails[serviceName].revenue += serviceInfo.price;
        
        totalRevenue += serviceInfo.price;
        totalServices += 1;
      }
    });

    setReportData({
      details: serviceDetails,
      totalRevenue,
      totalServices,
    });
    setLoading(false);
  };

  return (
    <div className="reports-background" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${fondoBarberia})` }}>
      <div className="reports-container">
        <header className="reports-header">
          <div className="rp-title">
            <h1>Informes de Servicios</h1>
          </div>
          <div className="rp-actions">
            <Link to="/" className="rp-button secondary">Volver al Panel</Link>
          </div>
        </header>

        <section className="filters-panel">
          <div className="filter-group">
            <label>Fecha de Inicio</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Fecha de Fin</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Barbero</label>
            <select value={selectedBarber} onChange={e => setSelectedBarber(e.target.value)}>
              <option value="todos">Todos los barberos</option>
              {barbers.map(barber => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
            </select>
          </div>
          <button onClick={handleGenerateReport} disabled={loading} className="rp-button primary">
            {loading ? 'Generando...' : 'Generar Informe'}
          </button>
        </section>

        <section className="report-results">
          <h2>Resultados</h2>
          {loading && <p>Cargando...</p>}
          {reportData ? (
            <>
              <div className="report-summary">
                <div className="summary-item">
                  <span className="summary-value">{reportData.totalServices}</span>
                  <span className="summary-label">Servicios Realizados</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">₡{reportData.totalRevenue.toLocaleString('es-CR')}</span>
                  <span className="summary-label">Ingresos Totales</span>
                </div>
              </div>
              
              <div className="report-details">
                <h3>Desglose por Servicio</h3>
                {Object.keys(reportData.details).length > 0 ? (
                  <ul className="details-list">
                    {Object.entries(reportData.details).map(([serviceName, data]) => (
                      <li key={serviceName}>
                        <span className="detail-name">{serviceName} ({data.count})</span>
                        <span className="detail-revenue">₡{data.revenue.toLocaleString('es-CR')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-results-text">No se encontraron citas que coincidan con los filtros.</p>
                )}
              </div>
            </>
          ) : (
            !loading && <p className="no-results-text">Selecciona los filtros y haz clic en "Generar Informe".</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReportsScreen;