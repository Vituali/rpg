// src/telas/TelaCriarFicha.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salvarFichaCompleta } from '../firebase/dataService';
import { useAuth } from '../context/AuthContext';
import styles from './TelaCriarFicha.module.css'; // Importa o CSS Module

const periciasPadrao = {
    acrobacia: { valor: 0, atributo: 'agilidade' },
    adestramento: { valor: 0, atributo: 'presenca' },
    artes: { valor: 0, atributo: 'presenca' },
    atletismo: { valor: 0, atributo: 'forca' },
    atualidades: { valor: 0, atributo: 'inteligencia' },
    ciencias: { valor: 0, atributo: 'inteligencia' },
    crime: { valor: 0, atributo: 'agilidade' },
    cultura: { valor: 0, atributo: 'inteligencia' },
    diplomacia: { valor: 0, atributo: 'presenca' },
    enganacao: { valor: 0, atributo: 'presenca' },
    fortitude: { valor: 0, atributo: 'vigor' },
    furtividade: { valor: 0, atributo: 'agilidade' },
    iniciativa: { valor: 0, atributo: 'agilidade' },
    intimidacao: { valor: 0, atributo: 'presenca' },
    intuicao: { valor: 0, atributo: 'presenca' },
    investigacao: { valor: 0, atributo: 'inteligencia' },
    luta: { valor: 0, atributo: 'forca' },
    medicina: { valor: 0, atributo: 'inteligencia' },
    ocultismo: { valor: 0, atributo: 'presenca' },
    oficio: { valor: 0, atributo: 'inteligencia' },
    percepcao: { valor: 0, atributo: 'presenca' },
    pilotagem: { valor: 0, atributo: 'agilidade' },
    pontaria: { valor: 0, atributo: 'agilidade' },
    reflexos: { valor: 0, atributo: 'agilidade' },
    religiao: { valor: 0, atributo: 'inteligencia' },
    sobrevivencia: { valor: 0, atributo: 'inteligencia' },
    tatica: { valor: 0, atributo: 'inteligencia' },
    tecnologia: { valor: 0, atributo: 'inteligencia' },
    vontade: { valor: 0, atributo: 'presenca' }
};

function TelaCriarFicha() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [ficha, setFicha] = useState({
        nome: '',
        jogador: '',
        profissao: 'investigador',
        profissaoPersonalizada: '',
        caminho: 'combatente',
        caminhoPersonalizado: '',
        vida: 10, vidaMax: 10,
        sanidade: 10, sanidadeMax: 10,
        esforco: 10, esforcoMax: 10,
        esquiva: 10,
        imagem: '',
        atributos: { forca: 1, agilidade: 1, inteligencia: 1, vigor: 1, presenca: 1 },
        pericias: periciasPadrao
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFicha(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleAttributeChange = (e) => {
        const { name, value } = e.target;
        let valorFinal = 0;
        if (value !== '') {
            const valorNumerico = parseInt(value, 10);
            if (!isNaN(valorNumerico)) {
                valorFinal = Math.max(0, Math.min(valorNumerico, 19)); // Limita entre 0 e 19
            }
        }
        setFicha(prev => ({
            ...prev,
            atributos: { ...prev.atributos, [name]: valorFinal }
        }));
    };

    const handlePericiaChange = (nomePericia, campo, valor) => {
         let valorFinal = valor; // Para o campo 'atributo', mantém a string

        if (campo === 'valor') {
            let valorProcessado = valor;
            // Remove o '0' inicial se o usuário digitar outro número
            if (valor.startsWith('0') && valor.length > 1 && valor !== '0') {
                 valorProcessado = valor.substring(1);
            }

            if (valorProcessado === '') {
                valorFinal = 0; // Trata input vazio como 0
            } else {
                 const valorNumerico = parseInt(valorProcessado, 10);
                if (!isNaN(valorNumerico)) {
                     // Adiciona um limite máximo se desejar, ex: 99
                     valorFinal = Math.max(0, Math.min(valorNumerico, 99));
                } else {
                    valorFinal = 0; // Se não for número, volta para 0
                }
            }
        }

        setFicha(prev => ({
            ...prev,
            pericias: {
                ...prev.pericias,
                [nomePericia]: {
                    ...prev.pericias[nomePericia],
                    [campo]: valorFinal
                }
            }
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ficha.nome) {
            alert('O nome do personagem é obrigatório!');
            return;
        }
        if (!currentUser) {
            alert('Você precisa de estar ligado para criar uma ficha!');
            return;
        }

        const fichaParaSalvar = {
            ...ficha,
            ownerId: currentUser.uid,
            ownerEmail: currentUser.email,
            // Garante que profissao/caminho personalizado seja salvo corretamente
            profissao: ficha.profissao === 'personalizado' ? ficha.profissaoPersonalizada : ficha.profissao,
            caminho: ficha.caminho === 'personalizado' ? ficha.caminhoPersonalizado : ficha.caminho,
        };
        // Remove os campos temporários se existirem
        delete fichaParaSalvar.profissaoPersonalizada;
        delete fichaParaSalvar.caminhoPersonalizado;


        const novoId = await salvarFichaCompleta(fichaParaSalvar);
        if (novoId) {
            alert('Ficha criada com sucesso!');
            navigate('/jogar');
        } else {
             alert('Erro ao salvar a ficha.');
        }
    };

    // Ajusta o valor a ser exibido no input (evita '0' quando vazio no JS)
    const getPericiaInputValue = (nomePericia) => {
        const valor = ficha.pericias[nomePericia]?.valor;
         return valor !== undefined ? String(valor) : '0';
    };

    return (
        // Aplica a classe principal do CSS Module
        <div className={styles.formContainer}>
            <h2>Criar Nova Ficha</h2>
            <form onSubmit={handleSubmit}>
                <label>Nome do Personagem:</label>
                <input type="text" name="nome" value={ficha.nome} onChange={handleChange} required />

                <label>Nome do Jogador (Opcional):</label>
                <input type="text" name="jogador" value={ficha.jogador} onChange={handleChange} />

                <label>Profissão:</label>
                <select name="profissao" value={ficha.profissao} onChange={handleChange}>
                    <option value="investigador">Investigador</option>
                    <option value="medico_legista">Médico Legista</option>
                    <option value="agente_de_campo">Agente de Campo</option>
                    <option value="ocultista_teorico">Ocultista Teórico</option>
                    <option value="personalizado">Outra (Personalizada)</option>
                </select>
                {ficha.profissao === 'personalizado' && (
                    <div className={styles.campoPersonalizado}> {/* Usa classe do CSS Module */}
                        <input type="text" name="profissaoPersonalizada" placeholder="Digite a profissão personalizada" value={ficha.profissaoPersonalizada} onChange={handleChange}/>
                    </div>
                )}

                <label>Caminho:</label>
                <select name="caminho" value={ficha.caminho} onChange={handleChange}>
                    <option value="combatente">Combatente</option>
                    <option value="especialista">Especialista</option>
                    <option value="ocultista">Ocultista</option>
                    <option value="personalizado">Outro (Personalizado)</option>
                </select>
                 {ficha.caminho === 'personalizado' && (
                    <div className={styles.campoPersonalizado}> {/* Usa classe do CSS Module */}
                        <input type="text" name="caminhoPersonalizado" placeholder="Digite o caminho personalizado" value={ficha.caminhoPersonalizado} onChange={handleChange}/>
                    </div>
                )}

                <h3>Atributos</h3>
                 {/* Aplica classe do CSS Module */}
                <div className={styles.statsGrid}>
                    <label>Forca:</label><input type="text" pattern="[0-9]*" inputMode="numeric" maxLength="2" name="forca" value={ficha.atributos.forca === 0 && document.activeElement?.name === 'forca' ? '' : ficha.atributos.forca} onChange={handleAttributeChange} />
                    <label>Agilidade:</label><input type="text" pattern="[0-9]*" inputMode="numeric" maxLength="2" name="agilidade" value={ficha.atributos.agilidade === 0 && document.activeElement?.name === 'agilidade' ? '' : ficha.atributos.agilidade} onChange={handleAttributeChange} />
                    <label>Inteligencia:</label><input type="text" pattern="[0-9]*" inputMode="numeric" maxLength="2" name="inteligencia" value={ficha.atributos.inteligencia === 0 && document.activeElement?.name === 'inteligencia' ? '' : ficha.atributos.inteligencia} onChange={handleAttributeChange} />
                    <label>Vigor:</label><input type="text" pattern="[0-9]*" inputMode="numeric" maxLength="2" name="vigor" value={ficha.atributos.vigor === 0 && document.activeElement?.name === 'vigor' ? '' : ficha.atributos.vigor} onChange={handleAttributeChange} />
                    <label>Presenca:</label><input type="text" pattern="[0-9]*" inputMode="numeric" maxLength="2" name="presenca" value={ficha.atributos.presenca === 0 && document.activeElement?.name === 'presenca' ? '' : ficha.atributos.presenca} onChange={handleAttributeChange} />
                </div>


                <h3>Perícias</h3>
                {/* Aplica classe do CSS Module */}
                <div className={styles.periciasGrid}>
                     {/* Itera sobre as chaves originais (kebab-case) */}
                    {Object.keys(periciasPadrao).map((nomePericia) => (
                         // Aplica classes do CSS Module
                        <div key={nomePericia} className={styles.periciaItem}>
                            <label>{nomePericia.charAt(0).toUpperCase() + nomePericia.slice(1)}</label>
                            {/* Aplica classe do CSS Module */}
                            <div className={styles.periciaControls}>
                                 <select
                                    value={ficha.pericias[nomePericia].atributo}
                                    onChange={(e) => handlePericiaChange(nomePericia, 'atributo', e.target.value)}
                                >
                                    <option value="forca">Força</option>
                                    <option value="agilidade">Agilidade</option>
                                    <option value="inteligencia">Inteligência</option>
                                    <option value="vigor">Vigor</option>
                                    <option value="presenca">Presença</option>
                                </select>
                                <input
                                    type="text" // Alterado para text
                                    pattern="[0-9]*" // Permite apenas números
                                    inputMode="numeric" // Teclado numérico em mobile
                                    maxLength="2" // Limita a 2 dígitos
                                    value={getPericiaInputValue(nomePericia)} // Usa a função helper
                                    onChange={(e) => handlePericiaChange(nomePericia, 'valor', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button type="submit">Salvar Ficha</button>
                <button type="button" onClick={() => navigate('/jogar')}>Cancelar</button>
            </form>
        </div>
    );
}

export default TelaCriarFicha;

