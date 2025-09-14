// src/TelaInicial.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './TelaInicial.css';
import logo from './assets/logo.png';

function TelaInicial() {
  const { isGM } = useAuth();

  return (
    <div className="tela-container">
      <img src={logo} alt="Logo do Jogo" className="game-logo" />
      <nav className="main-menu">
        <ul>
          <li><Link to="/jogar">Jogar</Link></li>
          <li><Link to="/grupo">Ver Grupo</Link></li>
          {isGM && <li><Link to="/mestrar">Painel do Mestre</Link></li>}
          <li><Link to="/opcoes">Opções</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default TelaInicial;