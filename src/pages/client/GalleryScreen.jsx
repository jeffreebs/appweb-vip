// src/pages/client/GalleryScreen.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './GalleryScreen.css'; // Crearemos este archivo de estilos

// --- DATOS DE EJEMPLO ---
// Más adelante, estos datos podrían venir de Firestore
const galleryImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1599338446212-d391f9b3b04c?q=80&w=1887', description: 'Fade clásico con textura' },
  { id: 2, url: 'https://images.unsplash.com/photo-1621605815971-80a42d314278?q=80&w=1887', description: 'Arreglo de barba con navaja' },
  { id: 3, url: 'https://images.unsplash.com/photo-1622288432453-24161e4c718c?q=80&w=1887', description: 'Corte moderno texturizado' },
  { id: 4, url: 'https://images.unsplash.com/photo-1567894340345-a61621959324?q=80&w=1887', description: 'Diseño de líneas precisas' },
  { id: 5, url: 'https://plus.unsplash.com/premium_photo-1661386221469-236b2b730594?q=80&w=1887', description: 'Coloración y estilo' },
  { id: 6, url: 'https://images.unsplash.com/photo-1623366302587-b35941de3a23?q=80&w=1887', description: 'Mantenimiento de barba larga' },
];

const trends = [
  { id: 1, title: 'El "Taper Fade"', description: 'Una tendencia que sigue fuerte. Consiste en un degradado suave en las patillas y la nuca, manteniendo longitud en la parte superior para mayor versatilidad y estilo.' },
  { id: 2, title: 'Textura Natural', description: 'Se abandona el look ultra-peinado por estilos más relajados que resaltan la textura natural del cabello, usando productos ligeros como ceras en polvo o sprays de sal marina.' },
  { id: 3, title: 'La Barba "Vikinga"', description: 'Para los más atrevidos, la barba larga y bien cuidada sigue siendo un símbolo de masculinidad. El secreto está en el mantenimiento con aceites y bálsamos de calidad.' },
];

const GalleryScreen = () => {
    return (
        <div className="gallery-container">
            <h1>Galería y Tendencias</h1>
            <Link to="/" className="back-link">Volver al Inicio</Link>

            <section className="gallery-section">
                <h2>Nuestros Trabajos</h2>
                <div className="image-grid">
                    {galleryImages.map(image => (
                        <div key={image.id} className="image-card">
                            <img src={image.url} alt={image.description} />
                            <div className="image-overlay">
                                <p>{image.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="trends-section">
                <h2>Tendencias Actuales</h2>
                <div className="trends-list">
                    {trends.map(trend => (
                        <div key={trend.id} className="trend-card">
                            <h3>{trend.title}</h3>
                            <p>{trend.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default GalleryScreen;