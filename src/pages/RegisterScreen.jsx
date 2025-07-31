// src/pages/RegisterScreen.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 1. Importamos las funciones necesarias de Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Importamos nuestra configuración

import './Auth.css'; // Reutilizamos los mismos estilos del login

const RegisterScreen = () => {
  // 2. Estados para los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 3. Función que se ejecuta al enviar el formulario
  const handleRegister = async (e) => {
    e.preventDefault();

    // Validaciones
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 4. PASO 1: Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Usuario creado en Auth con UID:", user.uid);

      // 5. PASO 2: Crear el documento en Firestore
      // Usamos 'setDoc' para especificar nuestro propio ID (el UID del usuario)
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        rol: 'cliente', // Rol por defecto para nuevos registros
        createdAt: serverTimestamp() // Guarda la fecha de creación
      });
      console.log("Documento de usuario creado en Firestore.");

      alert('¡Registro Exitoso! Serás redirigido a tu panel.');
      // Nuestro AuthContext detectará el nuevo usuario y App.jsx lo redirigirá solo.
      // Pero por si acaso, forzamos la navegación.
      navigate('/');

    } catch (error) {
      console.error("Error en el registro:", error.code);
      if (error.code === 'auth/email-already-in-use') {
        alert("Error: Este correo electrónico ya está en uso.");
      } else {
        alert("Ocurrió un error durante el registro.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Crear Cuenta</h1>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            className="auth-input"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
        <div className="auth-link-container">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="auth-link">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;