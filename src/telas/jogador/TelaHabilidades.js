// src/telas/jogador/TelaHabilidades.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    carregarHabilidades, 
    adicionarHabilidade, 
    atualizarHabilidade, 
    removerHabilidade 
} from '../../firebase/dataService';
// Importa o CSS Module da tela de criar itens
import styles from '../mestre/TelaCriarItens.module.css';

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

    const fetchHabilidades = useCallback(async () => {
        setLoading(true);
        const data = await carregarHabilidades(temporada, fichaId);
        setHabilidades(data);
        setLoading(false);
    }, [temporada, fichaId]);

    useEffect(() => {
        fetchHabilidades();
    }, [fetchHabilidades]);

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
            fetchHabilidades();
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
                fetchHabilidades();
                handleNovo();
            } else {
                alert("Falha ao remover a habilidade.");
            }
        }
    };

    if (loading) {
        return <div className={styles.paginaContainer}>Carregando habilidades...</div>;
    }

    return (
        // Aplica classes do CSS Module importado
        <div className={styles.paginaContainer}>
            <div className={styles.gerenciadorItensContainer}>
                <div className={styles.listaItensPainel}>
                    <h2>Habilidades</h2>
                    <button onClick={handleNovo}>+ Nova Habilidade</button>
                    <ul className={styles.listaDeItens}>
                        {Object.entries(habilidades).map(([id, hab]) => (
                            <li 
                                key={id} 
                                onClick={() => handleSelecionar(id, hab)} 
                                className={editandoId === id ? styles.selecionado : ''}
                            >
                                {hab.nome}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.editorItemPainel}>
                    <h3>{editandoId ? 'Editando Habilidade' : 'Nova Habilidade'}</h3>
                    
                    <label>Nome:</label>
                    <input type="text" name="nome" value={itemAtual.nome} onChange={handleChange} />
                    
                    <label>Elemento:</label>
                    <input type="text" name="elemento" value={itemAtual.elemento} onChange={handleChange} placeholder="Ex: Sangue, Conhecimento..." />
                    
                    <label>Custo:</label>
                    <input type="text" name="custo" value={itemAtual.custo} onChange={handleChange} placeholder="Ex: 5 PE, 1 Ação Padrão..." />
                    
                    <label>Dados Usados / Efeito:</label>
                    <textarea name="dados" value={itemAtual.dados} onChange={handleChange} placeholder="Ex: 2d6+FOR, +5 em testes de..." style={{minHeight: '100px'}}></textarea>
                    
                    <div className={styles.editorActions}>
                        <button className={styles.salvarBtn} onClick={handleSalvar}>Salvar</button>
                        {editandoId && (
                            <button className={styles.removerBtn} onClick={() => handleRemover(editandoId, itemAtual.nome)}>
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
