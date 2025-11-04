// src/telas/mestre/TelaGrupo.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarFichasPorTemporada, escutarTodosStatusDaTemporada } from '../../firebase/dataService.js';
// MUDANÇA 1: Importar styles do CSS Module
import styles from './TelaGrupo.module.css';

function TelaGrupo() {
    const navigate = useNavigate();
    const [fichas, setFichas] = useState({});
    const [statusAoVivo, setStatusAoVivo] = useState({});
    const [loading, setLoading] = useState(true);
    
    const temporadaAtiva = 'pacto';
    const logoPath = `${process.env.PUBLIC_URL}/assets/logo.png`;

    useEffect(() => {
        let pararDeEscutar;
        setLoading(true);
        const buscaDadosIniciais = async () => {
            const dadosFichas = await carregarFichasPorTemporada(temporadaAtiva);
            setFichas(dadosFichas);
            pararDeEscutar = escutarTodosStatusDaTemporada(temporadaAtiva, (dadosStatus) => {
                setStatusAoVivo(dadosStatus);
                setLoading(false);
            });
        };
        buscaDadosIniciais();
        return () => {
            if (pararDeEscutar) {
                pararDeEscutar();
            }
        };
    }, [temporadaAtiva]);

    // FUNÇÃO DE IMAGEM ATUALIZADA
    const getImagemPersonagem = (ficha) => {
        if (!ficha) return logoPath;
        
        if (ficha.imagem) {
            return `${process.env.PUBLIC_URL}/assets/personagens/${ficha.imagem}`;
        }
        
        if (ficha.nome) {
            const nomeArquivo = ficha.nome.toLowerCase().replace(/ /g, '_') + '.png';
            return `${process.env.PUBLIC_URL}/assets/personagens/${nomeArquivo}`;
        }
        
        return logoPath;
    };
    
    const handleImageError = (e) => {
        e.target.src = logoPath;
    };

    // MUDANÇA 2: Função atualizada para usar classes do CSS Module
    const getCharacterImageClasses = (status) => {
        let classes = styles.jogadorImg; // Classe base
        if (!status) return classes;

        if (status.vida <= 0) classes += ` ${styles.semVida}`;
        if (status.sanidade <= 0) classes += ` ${styles.semSanidade}`;
        if (status.esforco <= 0) classes += ` ${styles.semEsforco}`;
        
        return classes;
    };

    if (loading) {
        // Usa a classe global de `.pagina-container` se existir, ou um estilo simples
        return <div className="pagina-container">Carregando painel do grupo...</div>;
    }

    // MUDANÇA 3: Aplicar classes do CSS Module ao JSX
    return (
        <div className={styles.grupoContainer}>
            <div className={styles.grupoHeader}>
                <h1>Painel do Grupo</h1>
                <button onClick={() => navigate('/')}>Voltar ao Menu</button>
            </div>
            <div className={styles.gridJogadores}>
                {Object.keys(fichas).length === 0 ? (
                    <p>Nenhuma ficha encontrada para a temporada "{temporadaAtiva}".</p>
                ) : (
                    Object.entries(fichas).map(([id, ficha]) => {
                        const statusAtual = statusAoVivo[id];
                        const statusParaExibir = {
                            vida: statusAtual?.vida,
                            vidaMax: ficha.vidaMax,
                            sanidade: statusAtual?.sanidade,
                            sanidadeMax: ficha.sanidadeMax,
                            esforco: statusAtual?.esforco,
                            esforcoMax: ficha.esforcoMax
                        };

                        return (
                            
                            <div key={id} className={styles.jogadorCard}>
                                <h2>{ficha.nome}</h2>
                                <div className={styles.imagemContainer}>
                                    <img 
                                        src={getImagemPersonagem(ficha)} // Passa a ficha inteira
                                        alt={ficha.nome} 
                                        className={getCharacterImageClasses(statusParaExibir)} 
                                        onError={handleImageError}
                                    />
                                    <div className={`${styles.statOverlay} ${styles.statVida}`} title={`Vida: ${statusParaExibir.vida} / ${statusParaExibir.vidaMax}`}>
                                        {`${statusParaExibir.vida ?? '?'}/${statusParaExibir.vidaMax || '?'}`}
                                    </div>
                                    <div className={`${styles.statOverlay} ${styles.statSanidade}`} title={`Sanidade: ${statusParaExibir.sanidade} / ${statusParaExibir.sanidadeMax}`}>
                                        {`${statusParaExibir.sanidade ?? '?'}/${statusParaExibir.sanidadeMax || '?'}`}
                                    </div>
                                    <div className={`${styles.statOverlay} ${styles.statEsforco}`} title={`Esforço: ${statusParaExibir.esforco} / ${statusParaExibir.esforcoMax}`}>
                                        {`${statusParaExibir.esforco ?? '?'}/${statusParaExibir.esforcoMax || '?'}`}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default TelaGrupo;
