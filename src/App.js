// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import TelaInicial from './TelaInicial';
import TelaJogar from './telas/TelaJogar';
import TelaCriarFicha from './telas/TelaCriarFicha';
import TelaOpcoes from './telas/TelaOpcoes';
import TelaMestrar from './telas/TelaMestrar';
import TelaInventario from './telas/TelaInventario';
import TelaHabilidades from './telas/TelaHabilidades';
import TelaRituais from './telas/TelaRituais';


function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<TelaInicial />} />
            <Route path="/jogar" element={<TelaJogar />} />
            <Route path="/criar-ficha" element={<TelaCriarFicha />} />
            <Route path="/opcoes" element={<TelaOpcoes />} />
            <Route path="/mestrar" element={<TelaMestrar />} />
            <Route path="/inventario/:fichaId" element={<TelaInventario />} />
            <Route path="/habilidades/:fichaId" element={<TelaHabilidades />} />
            <Route path="/rituais/:fichaId" element={<TelaRituais />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;