// src/componentes/PainelUsuario.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUsuario } from '../firebase/dataService';
import './PainelUsuario.css';

function PainelUsuario() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUsuario();
        navigate('/login'); // Redireciona para o login após o logout
    };

    if (!currentUser) {
        return null; // Não mostra nada se o usuário não estiver logado
    }

    return (
        <div className="painel-usuario-container">
            <span className="user-email">{currentUser.email}</span>
            <div className="user-actions">
                <button onClick={() => navigate('/usuario')}>Minha Conta</button>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </div>
    );
}

export default PainelUsuario;