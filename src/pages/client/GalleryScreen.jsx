// src/pages/client/GalleryScreen.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './GalleryScreen.css'; // Crearemos este archivo de estilos
import fondoBarberia from '../../assets/logo_mejorado.png';



// --- DATOS DE EJEMPLO ---
// Más adelante, estos datos podrían venir de Firestore
const galleryImages = [
  { id: 1, url: 'https://i.pinimg.com/1200x/d2/77/49/d277499f0a36505e937306c6d47f3a61.jpg', description: 'Fade clásico con textura' },
  { id: 2, url: 'https://i.pinimg.com/736x/33/1d/3e/331d3e73f1a5be948e86ff506b359af8.jpg', description: 'Arreglo de barba con navaja' },
  { id: 3, url: 'https://i.pinimg.com/736x/3b/e4/a2/3be4a296fc5e0deadd9cc4d995ccb4ee.jpg', description: 'Corte moderno texturizado' },
  { id: 4, url: 'https://i.pinimg.com/1200x/09/e3/05/09e3051184ebb30f4fbd13456d44e984.jpg', description: 'Diseño de líneas precisas' },
  { id: 5, url: 'https://i.pinimg.com/1200x/7e/49/88/7e49888af4dd83ff04453e532173e012.jpg', description: 'Coloración y estilo' },
  { id: 6, url: 'https://i.pinimg.com/736x/72/45/18/724518aa27d1aa8b8f052afcdd73c9e6.jpg', description: 'Mantenimiento de barba larga' },
];

const trends = [
  { id: 1, title: 'El "Taper Fade"', description: 'Una tendencia que sigue fuerte. Consiste en un degradado suave en las patillas y la nuca, manteniendo longitud en la parte superior para mayor versatilidad y estilo.' },
  { id: 2, title: 'Textura Natural', description: 'Se abandona el look ultra-peinado por estilos más relajados que resaltan la textura natural del cabello, usando productos ligeros como ceras en polvo o sprays de sal marina.' },
  { id: 3, title: 'La Barba "Vikinga"', description: 'Para los más atrevidos, la barba larga y bien cuidada sigue siendo un símbolo de masculinidad. El secreto está en el mantenimiento con aceites y bálsamos de calidad.' },
];

const GalleryScreen = () => {
    return (
        <div className="gallery-background" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${fondoBarberia})` }}>
            <div className="gallery-container">
                <header className="gallery-header">
                    <h1>Galería y Tendencias</h1>
                    <Link to="/" className="back-link">Volver al Inicio</Link>
                </header>

                <main>
                    <section className="gallery-section">
                        <h2>Nuestros Trabajos</h2>
                        <div className="image-grid">
                            {galleryImages.map(image => (
                                <div key={image.id} className="book-card"> {/* Renombramos la clase principal */}
                                    {/* El texto que se revela al abrir */}
                                    <p className="book-content">{image.description}</p>
                                    
                                    {/* La portada del libro, que es la imagen */}
                                    <div className="cover">
                                        <img src={image.url} alt={image.description} />
                                        <div className="cover-overlay">
                                            <p>{image.description}</p>
                                        </div>
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
                </main>
            </div>
        </div>
    );
};

export default GalleryScreen;