import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Header } from '../../components/Header/Header';
import { Button } from '../../components/Button/Button';
import { Table } from '../../components/Table/Table';
import type { AudioDTO } from '../../models/AudioDTO';
import './Home.css';

const API_URL = 'http://localhost:5174/api/Audio';

export const Home = () => {
    const [audios, setAudios] = useState<AudioDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadAudios = async () => {
        const response = await axios.get(`${API_URL}/audios`);
        setAudios(response.data);
    };

    useEffect(() => { loadAudios(); }, []);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

        try {
            await axios.post(`${API_URL}/upload`, formData);
            await loadAudios();
        } finally {
            setLoading(false);
        }
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
                        text={loading ? "Uploading..." : "Upload New Audio"} 
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