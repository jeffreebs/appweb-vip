import React from 'react';
import { Link } from 'react-router-dom';
import './ProductsScreen.css'; // Crearemos este archivo de estilos

// --- DATOS DE EJEMPLO ---
// Más adelante, el admin podría gestionar estos productos
const productsData = [
    {
        id: 1,
        name: 'Cera Moldeadora "Efecto Mate"',
        description: 'Fijación fuerte pero flexible con un acabado natural sin brillo. Ideal para peinados texturizados y con volumen.',
        imageUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=1964'
    },
    {
        id: 2,
        name: 'Aceite Premium para Barba',
        description: 'Hidrata y acondiciona la barba y la piel debajo de ella. Ayuda a prevenir la picazón y la caspa, dejando un aroma fresco y masculino.',
        imageUrl: 'https://images.unsplash.com/photo-1632335332067-8e6f3d537f2d?q=80&w=1887'
    },
    {
        id: 3,
        name: 'Shampoo Fortalecedor con Biotina',
        description: 'Limpia profundamente mientras nutre el cabello desde la raíz, promoviendo un crecimiento más fuerte y saludable.',
        imageUrl: 'https://images.unsplash.com/photo-1598454293212-9cddc1584e1b?q=80&w=1887'
    },
    {
        id: 4,
        name: 'Bálsamo para después de Afeitar',
        description: 'Calma la irritación y el enrojecimiento al instante. Su fórmula sin alcohol deja la piel fresca, suave y revitalizada.',
        imageUrl: 'https://images.unsplash.com/photo-1629102438186-21876a44118c?q=80&w=1887'
    }
];

const ProductsScreen = () => {
    return (
        <div className="products-container">
            <h1>Nuestros Productos</h1>
            <p className="products-subtitle">Disponibles para la venta exclusivamente en nuestra barbería.</p>
            <Link to="/" className="back-link">Volver al Inicio</Link>

            <div className="product-grid">
                {productsData.map(product => (
                    <div key={product.id} className="product-card">
                        <img src={product.imageUrl} alt={product.name} className="product-image" />
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsScreen;