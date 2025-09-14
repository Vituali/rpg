// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './componentes/RotaProtegida';
import PainelUsuario from './componentes/PainelUsuario';

// Telas
import TelaInicial from './TelaInicial';
import TelaCriarFicha from './telas/TelaCriarFicha';
import TelaOpcoes from './telas/TelaOpcoes';

// Telas de Autenticação
import TelaLogin from './telas/auth/TelaLogin';
import TelaCadastro from './telas/auth/TelaCadastro';
import TelaUsuario from './telas/auth/TelaUsuario';

// Telas de Jogo
import TelaJogar from './telas/jogador/TelaJogar';
import TelaInventario from './telas/jogador/TelaInventario';
import TelaHabilidades from './telas/jogador/TelaHabilidades';
import TelaRituais from './telas/jogador/TelaRituais';

// Telas de Mestre
import TelaGrupo from './telas/mestre/TelaGrupo';
import TelaMestrar from './telas/mestre/TelaMestrar';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <PainelUsuario />
          <div className="App">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<TelaInicial />} />
              <Route path="/login" element={<TelaLogin />} />
              <Route path="/cadastro" element={<TelaCadastro />} />

              {/* Rotas Protegidas */}
              <Route path="/jogar" element={<RotaProtegida><TelaJogar /></RotaProtegida>} />
              <Route path="/criar-ficha" element={<RotaProtegida><TelaCriarFicha /></RotaProtegida>} />
              <Route path="/opcoes" element={<RotaProtegida><TelaOpcoes /></RotaProtegida>} />
              <Route path="/usuario" element={<RotaProtegida><TelaUsuario /></RotaProtegida>} />
              
              <Route path="/grupo" element={<RotaProtegida><TelaGrupo /></RotaProtegida>} />
              <Route path="/mestrar" element={<RotaProtegida gmOnly={true}><TelaMestrar /></RotaProtegida>} />
              
              <Route path="/inventario/:fichaId" element={<RotaProtegida><TelaInventario /></RotaProtegida>} />
              <Route path="/habilidades/:fichaId" element={<RotaProtegida><TelaHabilidades /></RotaProtegida>} />
              <Route path="/rituais/:fichaId" element={<RotaProtegida><TelaRituais /></RotaProtegida>} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;