// src/componentes/PainelUsuario.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUsuario } from '../firebase/dataService';
import './PainelUsuario.css';

function PainelUsuario() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLogout = async () => {
        await logoutUsuario();
        navigate('/login');
    };

    if (!currentUser) {
        return null;
    }

    const togglePanel = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`painel-usuario-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {isExpanded ? (
                <>
                    <span className="user-email">{currentUser.email}</span>
                    <div className="user-actions">
                        <button onClick={() => navigate('/usuario')}>Minha Conta</button>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                    <button onClick={togglePanel} className="close-panel-btn">×</button>
                </>
            ) : (
                <button onClick={togglePanel} className="user-icon-btn">
                    {/* Ícone SVG de utilizador */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
            )}
        </div>
    );
}

export default PainelUsuario;
