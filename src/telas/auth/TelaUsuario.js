
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { enviarEmailRedefinicaoSenha } from '../../firebase/dataService';
import '../MenuPaginas.css';
function TelaUsuario() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [mensagem, setMensagem] = useState('');
    const [isError, setIsError] = useState(false);

    const handlePasswordReset = async () => {
        setMensagem('');
        setIsError(false);
        const result = await enviarEmailRedefinicaoSenha(currentUser.email);
        if (result.success) {
            setMensagem('E-mail de redefinição de senha enviado com sucesso! Verifique sua caixa de entrada.');
        } else {
            setMensagem('Ocorreu um erro ao enviar o e-mail. Tente novamente mais tarde.');
            setIsError(true);
        }
    };

    return (
        <div className="pagina-container">
            <h1>Minha Conta</h1>
            <p><strong>E-mail:</strong> {currentUser?.email}</p>
            <div className="user-management">
                <h3>Alterar Senha</h3>
                <p>Clique no botão abaixo para receber um e-mail com o link para redefinir sua senha.</p>
                <button onClick={handlePasswordReset}>Redefinir Senha</button>
                {mensagem && ( <p className={isError ? 'auth-error' : 'auth-success'}>{mensagem}</p> )}
            </div>
            <button onClick={() => navigate(-1)} style={{marginTop: '30px'}}>Voltar</button>
        </div>
    );
}
export default TelaUsuario;
