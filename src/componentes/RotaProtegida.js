// src/componentes/RotaProtegida.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Adicione a propriedade 'gmOnly'
function RotaProtegida({ children, gmOnly = false }) {
    const { currentUser, isGM } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Se a rota é apenas para o Mestre e o usuário não é, redireciona
    if (gmOnly && !isGM) {
        return <Navigate to="/jogar" />; // ou para a tela de grupo
    }

    return children;
}

export default RotaProtegida;
