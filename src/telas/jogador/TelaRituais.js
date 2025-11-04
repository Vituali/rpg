// src/telas/jogador/TelaRituais.js
import React, { useState, useEffect, useCallback } from 'react'; // 1. Importe o useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { 
    carregarRituais, 
    adicionarRitual, 
    atualizarRitual, 
    removerRitual 
} from '../../firebase/dataService';
import '../mestre/TelaCriarItens.css';

const modeloVazio = {
    nome: '',
    elemento: '',
    custo: '',
    dados: ''
};

function TelaRituais() {
    const { fichaId } = useParams();
    const navigate = useNavigate();
    const temporada = 'pacto';

    const [rituais, setRituais] = useState({});
    const [itemAtual, setItemAtual] = useState(modeloVazio);
    const [editandoId, setEditandoId] = useState(null);
    const [loading, setLoading] = useState(true);

    // 2. Defina a função AQUI FORA, mas envolta em 'useCallback'
    // Liste 'temporada' e 'fichaId' como dependências dela
    const fetchRituais = useCallback(async () => {
        setLoading(true);
        const data = await carregarRituais(temporada, fichaId);
        setRituais(data);
        setLoading(false);
    }, [temporada, fichaId]); 

    // 3. Agora o useEffect usa a função 'fetchRituais' e
    //    DEPENDE dela.
    useEffect(() => {
        fetchRituais();
    }, [fetchRituais]); // O ESLint ficará feliz!

    const handleSelecionar = (id, ritual) => {
        setItemAtual(ritual);
        setEditandoId(id);
    };

    const handleNovo = () => {
        setItemAtual(modeloVazio);
        setEditandoId(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemAtual(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvar = async () => {
        if (!itemAtual.nome) {
            alert("O nome é obrigatório!");
            return;
        }

        let sucesso;
        if (editandoId) {
            sucesso = await atualizarRitual(temporada, fichaId, editandoId, itemAtual);
        } else {
            sucesso = await adicionarRitual(temporada, fichaId, itemAtual);
        }

        if (sucesso) {
            alert("Ritual salvo com sucesso!");
            fetchRituais(); // <-- Agora funciona!
            handleNovo();
        } else {
            alert("Falha ao salvar o ritual.");
        }
    };

    const handleRemover = async (id, nome) => {
        if (window.confirm(`Tem certeza que deseja remover "${nome}"?`)) {
            const sucesso = await removerRitual(temporada, fichaId, id);
            if (sucesso) {
                alert("Ritual removido!");
                fetchRituais(); // <-- Agora funciona!
                handleNovo();
            } else {
                alert("Falha ao remover o ritual.");
            }
        }
    };

    if (loading) {
        return <div className="pagina-container">Carregando rituais...</div>;
    }

    return (
        // ... O resto do seu JSX continua igual ...
        <div className="pagina-container">
            <div className="gerenciador-itens-container">
                <div className="lista-itens-painel">
                    <h2>Rituais</h2>
                    <button onClick={handleNovo}>+ Novo Ritual</button>
                    <ul className="lista-de-itens">
                        {Object.entries(rituais).map(([id, rit]) => (
                            <li 
                                key={id} 
                                onClick={() => handleSelecionar(id, rit)} 
                                className={editandoId === id ? 'selecionado' : ''}
                            >
                                {rit.nome}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="editor-item-painel">
                    <h3>{editandoId ? 'Editando Ritual' : 'Novo Ritual'}</h3>
                    
                    <label>Nome:</label>
                    <input type="text" name="nome" value={itemAtual.nome} onChange={handleChange} />
                    
                    <label>Elemento:</label>
                    <input type="text" name="elemento" value={itemAtual.elemento} onChange={handleChange} placeholder="Ex: Sangue, Conhecimento..." />
                    
                    <label>Custo:</label>
                    <input type="text" name="custo" value={itemAtual.custo} onChange={handleChange} placeholder="Ex: 5 PE, 1 Ação Padrão..." />
                    
                    <label>Dados Usados / Efeito:</label>
                    <textarea name="dados" value={itemAtual.dados} onChange={handleChange} placeholder="Ex: 2d6+FOR, +5 em testes de..." style={{minHeight: '100px'}}></textarea>
                    
                    <div className="editor-actions">
                        <button className="salvar-btn" onClick={handleSalvar}>Salvar</button>
                        {editandoId && (
                            <button className="remover-btn" onClick={() => handleRemover(editandoId, itemAtual.nome)}>
                                Remover
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <button onClick={() => navigate('/jogar')} style={{ marginTop: '30px' }}>Voltar</button>
        </div>
    );
}

export default TelaRituais;