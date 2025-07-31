// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [barberProfileId, setBarberProfileId] = useState(null);
  const [barberProfile, setBarberProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user ? user.uid : null);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let role = null;
        if (userDocSnap.exists()) {
          role = userDocSnap.data().rol;
          setUserRole(role);
          console.log("User role found in 'users' collection:", role);
        } else {
          console.log("No document found for this user in 'users' collection.");
        }
        
        if (role === 'barbero') {
          console.log("Role is 'barbero', searching for profile in 'barbers' collection...");
          const barbersQuery = query(collection(db, "barbers"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(barbersQuery);
          
          if (!querySnapshot.empty) {
            const barberDocId = querySnapshot.docs[0].id;
            setBarberProfileId(barberDocId);
            console.log("Barber profile found! Document ID:", barberDocId);
          } else {
            console.log("Could not find a matching profile in 'barbers' collection for this userId.");
          }
        } else {
            setBarberProfileId(null);
        }
        
        setCurrentUser(user);
      } else {
        console.log("User logged out.");
        setCurrentUser(null);
        setUserRole(null);
        setBarberProfileId(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    barberProfileId,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};