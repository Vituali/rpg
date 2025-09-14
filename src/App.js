// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './componentes/RotaProtegida';
import TelaLogin from './telas/TelaLogin';
import TelaCadastro from './telas/TelaCadastro';
import TelaInicial from './TelaInicial';
import TelaJogar from './telas/TelaJogar';
import TelaCriarFicha from './telas/TelaCriarFicha';
import TelaOpcoes from './telas/TelaOpcoes';
import TelaMestrar from './telas/TelaMestrar';
import TelaInventario from './telas/TelaInventario';
import TelaHabilidades from './telas/TelaHabilidades';
import TelaRituais from './telas/TelaRituais';
import TelaGrupo from './telas/TelaGrupo';
import PainelUsuario from './componentes/PainelUsuario';
import TelaUsuario from './telas/TelaUsuario';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<TelaInicial />} />
              <Route path="/login" element={<TelaLogin />} />
              <Route path="/cadastro" element={<TelaCadastro />} />
              <Route path="/jogar" element={<RotaProtegida><TelaJogar /></RotaProtegida>} />
              <Route path="/grupo" element={<RotaProtegida><TelaGrupo /></RotaProtegida>} />
              <Route path="/mestrar" element={<RotaProtegida gmOnly={true}><TelaMestrar /></RotaProtegida>} />
              <Route path="/criar-ficha" element={<RotaProtegida><TelaCriarFicha /></RotaProtegida>} />
              <Route path="/opcoes" element={<RotaProtegida><TelaOpcoes /></RotaProtegida>} />
              <Route path="/inventario/:fichaId" element={<RotaProtegida><TelaInventario /></RotaProtegida>} />
              <Route path="/habilidades/:fichaId" element={<RotaProtegida><TelaHabilidades /></RotaProtegida>} />
              <Route path="/rituais/:fichaId" element={<RotaProtegida><TelaRituais /></RotaProtegida>} />
              <Route path="/usuario" element={<RotaProtegida><TelaUsuario /></RotaProtegida>} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;