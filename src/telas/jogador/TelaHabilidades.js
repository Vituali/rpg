// src/telas/jogador/TelaHabilidades.js
import React, { useState, useEffect, useCallback } from 'react'; // MUDANÇA 1: Importar o useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { 
    carregarHabilidades, 
    adicionarHabilidade, 
    atualizarHabilidade, 
    removerHabilidade 
} from '../../firebase/dataService';
import '../mestre/TelaCriarItens.css'; // Reutilizando o CSS da tela de criar itens

const modeloVazio = {
    nome: '',
    elemento: '',
    custo: '',
    dados: ''
};

function TelaHabilidades() {
    const { fichaId } = useParams();
    const navigate = useNavigate();
    const temporada = 'pacto';

    const [habilidades, setHabilidades] = useState({});
    const [itemAtual, setItemAtual] = useState(modeloVazio);
    const [editandoId, setEditandoId] = useState(null);
    const [loading, setLoading] = useState(true);

    // MUDANÇA 2: A função volta para cá, mas envolvida com 'useCallback'
    // Colocamos 'temporada' e 'fichaId' como dependências dela.
    const fetchHabilidades = useCallback(async () => {
        setLoading(true);
        const data = await carregarHabilidades(temporada, fichaId);
        setHabilidades(data);
        setLoading(false);
    }, [temporada, fichaId]);

    // MUDANÇA 3: O useEffect agora depende da função 'fetchHabilidades'
    useEffect(() => {
        fetchHabilidades();
    }, [fetchHabilidades]); // Agora o ESLint fica feliz

    const handleSelecionar = (id, habilidade) => {
        setItemAtual(habilidade);
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
            sucesso = await atualizarHabilidade(temporada, fichaId, editandoId, itemAtual);
        } else {
            sucesso = await adicionarHabilidade(temporada, fichaId, itemAtual);
        }

        if (sucesso) {
            alert("Habilidade salva com sucesso!");
            fetchHabilidades(); // E as chamadas aqui voltam a funcionar!
            handleNovo();
        } else {
            alert("Falha ao salvar a habilidade.");
        }
    };

    const handleRemover = async (id, nome) => {
        if (window.confirm(`Tem certeza que deseja remover "${nome}"?`)) {
            const sucesso = await removerHabilidade(temporada, fichaId, id);
            if (sucesso) {
                alert("Habilidade removida!");
                fetchHabilidades(); // E aqui também!
                handleNovo();
            } else {
                alert("Falha ao remover a habilidade.");
            }
        }
    };

    if (loading) {
        return <div className="pagina-container">Carregando habilidades...</div>;
    }

    return (
        <div className="pagina-container">
            <div className="gerenciador-itens-container">
                <div className="lista-itens-painel">
                    <h2>Habilidades</h2>
                    <button onClick={handleNovo}>+ Nova Habilidade</button>
                    <ul className="lista-de-itens">
                        {Object.entries(habilidades).map(([id, hab]) => (
                            <li 
                                key={id} 
                                onClick={() => handleSelecionar(id, hab)} 
                                className={editandoId === id ? 'selecionado' : ''}
                            >
                                {hab.nome}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="editor-item-painel">
                    <h3>{editandoId ? 'Editando Habilidade' : 'Nova Habilidade'}</h3>
                    
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

export default TelaHabilidades;
