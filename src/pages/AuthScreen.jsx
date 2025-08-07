// src/pages/AuthScreen.jsx

import React, { useState } from 'react';
// 1. Importamos 'useNavigate' para poder redirigir al usuario
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './Auth.css';
import fondoBarberia from '../assets/logo_mejorado.png';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // 2. Preparamos la herramienta para navegar
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    console.log("Botón 'Entrar' presionado. Ejecutando handleLogin...");
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // 3. ¡AQUÍ ESTÁ LA MAGIA! Después del login, llévame a la página de inicio ('/').
      navigate('/');
    } catch (error) {
      console.error("Error en el inicio de sesión:", error.code);
      alert("Error: El correo o la contraseña son incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  // El formulario se queda igual que antes
  return (
    // ====================== ¡AQUÍ ESTÁ LA CORRECCIÓN! ======================
    // Movemos el 'style' al 'div' principal que tiene la clase "auth-container".
    <div 
      className="auth-container" 
    >
      {/* Ahora todo el contenido, incluida la caja blanca, está DENTRO del div con fondo. */}
      <div className="auth-box">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="auth-input"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="auth-link-container">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="auth-link">Regístrate aquí</Link>
        </div>
        
        {/* Y MUY IMPORTANTE: Borramos el div extra que estaba aquí antes. */}

      </div>
    </div>
    // =======================================================================
  );
};

export default AuthScreen;