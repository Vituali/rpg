// src/telas/TelaCadastro.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cadastrarUsuario } from '../firebase/dataService';
import './Auth.css';

function TelaCadastro() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');

    const handleCadastro = async (e) => {
        e.preventDefault();
        setError('');
        const result = await cadastrarUsuario(email, senha);
        if (result.error) {
            setError('Falha no cadastro. O e-mail pode já estar em uso.');
        } else {
            navigate('/jogar');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleCadastro} className="auth-form">
                <h2>Cadastro</h2>
                {error && <p className="auth-error">{error}</p>}
                <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Senha (mínimo 8 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                <button type="submit">Cadastrar</button>
                <p className="auth-link">
                    Já tem uma conta? <Link to="/login">Faça o login</Link>                </p>
            </form>
        </div>
    );
}

export default TelaCadastro;