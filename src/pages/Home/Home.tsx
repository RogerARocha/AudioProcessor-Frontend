import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Header } from '../../components/Header/Header';
import { Button } from '../../components/Button/Button';
import { Table } from '../../components/Table/Table';
import type { AudioDTO } from '../../models/AudioDTO';
import workerAudioValidator from '../../workers/audioValidator.worker?worker';
import './Home.css';

const API_URL = 'http://localhost:5174/api/Audio';

export const Home = () => {
    const [audios, setAudios] = useState<AudioDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadAudios = async () => {
        try {
            const response = await axios.get(`${API_URL}/audios`);
            setAudios(response.data);
        } catch (err) {
            console.error('Erro ao carregar áudios:', err);
        }
    };

    useEffect(() => {
        loadAudios();
    }, []);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setValidating(true);

        try {
            // Validação paralela (client-side)
            const isValidMusic = await runParallelValidation(file);

            if (!isValidMusic) {
                alert("O arquivo não foi reconhecido como uma música válida pelo nosso modelo.");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            setLoading(true);
            await axios.post(`${API_URL}/upload`, formData);
            await loadAudios();
        } catch (err) {
            console.error('Erro no upload:', err);
        } finally {
            setLoading(false);
            setValidating(false);
        }
    };

    const runParallelValidation = (file: File): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const worker = new workerAudioValidator();

            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const audioCtx = new AudioContext({ sampleRate: 16000});
                    const decodedData = await audioCtx.decodeAudioData(
                        e.target?.result as ArrayBuffer
                    );

                    // envia apenas o primeiro canal
                    worker.postMessage({
                        audioData: decodedData.getChannelData(0),
                    });

                    await audioCtx.close();
                } catch (error) {
                    console.error('Erro ao decodificar áudio:', error);
                    worker.terminate();
                    reject(false);
                }
            };

            reader.onerror = () => {
                worker.terminate();
                reject(false);
            };

            worker.onmessage = (msg) => {
                worker.terminate();
                resolve(msg.data.isValid);
            };

            reader.readAsArrayBuffer(file);
        });
    };

    return (
        <div className="home-container">
            <Header />
            <main className="main-content">
                <section className="top-section">
                    <b className="section-title">Audios</b>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="audio/*"
                    />
                    <Button
                        text={validating ? "Validating..." : loading ? "Uploading..." : "Upload New Audio"}
                        onClick={() => fileInputRef.current?.click()}
                    />
                </section>

                <section className="table-section">
                    <b className="subtitle">Uploaded Audios</b>
                    <Table audios={audios} />
                </section>
            </main>
        </div>
    );
};