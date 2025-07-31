// src/pages/client/ContactScreen.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './ContactScreen.css'; // Crearemos este archivo de estilos

const ContactScreen = () => {

    // --- ¡REEMPLAZA ESTOS DATOS POR LOS TUYOS! ---
    const contactInfo = {
        phone: '88888888', // Solo el número, sin espacios ni guiones
        address: 'Calle Falsa 123, San José, Costa Rica',
        schedule: 'Lunes a Sábado: 9:00 AM - 7:00 PM',
        googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.983951552554!2d-84.0765955852066!3d9.93633849289669!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e342c52d32ff%3A0x12532d733d317a7e!2sTeatro%20Nacional%20de%20Costa%20Rica!5e0!3m2!1ses-419!2scr!4v1678886400000!5m2!1ses-419!2scr' // Busca tu negocio en Google Maps -> Compartir -> Insertar un mapa -> Copia el 'src' del iframe
    };

    const whatsappLink = `https://wa.me/506${contactInfo.phone}`;

    return (
        <div className="contact-container">
            <h1>Ubicación y Contacto</h1>
            <Link to="/" className="back-link">Volver al Inicio</Link>

            <div className="contact-grid">
                <div className="contact-card">
                    <h3>Dirección</h3>
                    <p>{contactInfo.address}</p>
                    
                    <div className="map-container">
                        <iframe 
                            src={contactInfo.googleMapsEmbedUrl} 
                            width="100%" 
                            height="300" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación de la Barbería"
                        ></iframe>
                    </div>
                </div>

                <div className="contact-card">
                    <h3>Contacto y Horarios</h3>
                    <p><strong>Horario:</strong> {contactInfo.schedule}</p>
                    <p><strong>Teléfono / WhatsApp:</strong> {contactInfo.phone}</p>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-button">
                        Contactar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ContactScreen;