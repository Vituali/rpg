// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';
import { GM_UIDS } from '../config/gmConfig'; // Importa a lista de mestres

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isGM, setIsGM] = useState(false); // Novo state para o Mestre
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            // Verifica se o UID do usuário logado está na lista de Mestres
            setIsGM(user ? GM_UIDS.includes(user.uid) : false);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        isGM // Fornece a informação se é Mestre ou não
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);