import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button/Button';
import type { AudioDTO } from '../../models/AudioDTO';
import axios from 'axios';
import './Table.css';

export const Table = ({ audios }: { audios: AudioDTO[] }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isSlowed, setIsSlowed] = useState(false);
    const [slowedExists, setSlowedExists] = useState(false);

    const getSlowedUrl = (url: string) => url.replace(/\.(aac|mp3|wav)$/, '_slowed.$1');

    // Função para limitar o texto na tabela (Preview)
    const truncateText = (text: string | null, limit: number = 50) => {
        if (!text) return "";
        return text.length > limit ? text.substring(0, limit) + "..." : text;
    };

    useEffect(() => {
        if (expandedId) {
            const audio = audios.find(a => a.id === expandedId);
            if (audio) {
                axios.head(getSlowedUrl(audio.fileUrl))
                    .then(() => setSlowedExists(true))
                    .catch(() => setSlowedExists(false));
            }
        }
    }, [expandedId, audios]);

    const toggleRow = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
        setIsSlowed(false);
        setSlowedExists(false);
    };

    return (
        <div className="table-wrapper">
            <table className="audio-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Prévia da Transcrição</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    {audios.map((audio) => (
                        <React.Fragment key={audio.id}>
                            <tr 
                                className={`main-row ${expandedId === audio.id ? 'active' : ''}`} 
                                onClick={() => toggleRow(audio.id)}
                            >
                                <td className="font-bold">{audio.fileName}</td>
                                <td className="preview-cell">
                                    {truncateText(audio.transcription)}
                                </td>
                                <td>{new Date(audio.createdAt).toLocaleDateString()}</td>
                            </tr>

                            {expandedId === audio.id && (
                                <tr className="drawer-row">
                                    <td colSpan={3}>
                                        <div className="drawer-content">
                                            <div className="full-transcription">
                                                <label>Transcrição Completa:</label>
                                                <p>{audio.transcription || "O motor de IA está finalizando o texto..."}</p>
                                            </div>

                                            <div className="player-section">
                                                <div className="mode-buttons">
                                                    <Button 
                                                        text={!isSlowed ? "● Original" : "Original"} 
                                                        onClick={() => setIsSlowed(false)} 
                                                    />
                                                    
                                                        <Button
                                                            text={!slowedExists ? "Slowed Indisponível" : (isSlowed ? "● Slowed" : "Slowed")}
                                                            onClick={() => setIsSlowed(true)}
                                                            disabled={!slowedExists}
                                                        />  
                                                    
                                                </div>

                                                <audio 
                                                    key={isSlowed ? 'slow' : 'norm'} 
                                                    controls 
                                                    src={isSlowed ? getSlowedUrl(audio.fileUrl) : audio.fileUrl}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};