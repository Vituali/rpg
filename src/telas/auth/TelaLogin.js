import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUsuario } from '../../firebase/dataService'; // Caminho corrigido
import './Auth.css';

function TelaLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const result = await loginUsuario(email, senha);
        if (result.error) {
            setError('Falha no login. Verifique seu e-mail e senha.');
        } else {
            navigate('/jogar');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleLogin} className="auth-form">
                <h2>Login</h2>
                {error && <p className="auth-error">{error}</p>}
                <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                <button type="submit">Entrar</button>
                <p className="auth-link">
                    Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
                </p>
            </form>
        </div>
    );
}
export default TelaLogin;