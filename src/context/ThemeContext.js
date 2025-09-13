// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Pega o tema salvo no localStorage ou usa 'sariat' como padrão
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'sariat');

    useEffect(() => {
        // Remove classes de tema antigas e aplica a nova no body
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
        // Salva a escolha no localStorage para persistir
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook customizado para facilitar o uso do contexto
export const useTheme = () => useContext(ThemeContext);