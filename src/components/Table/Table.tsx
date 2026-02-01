import './Table.css';
import type { AudioDTO } from '../../models/AudioDTO';

export const Table = ({ audios }: { audios: AudioDTO[] }) => (
    <div className="table-wrapper">
        <table className="audio-table">
            <thead>
                <tr>
                    {['Name', 'Transcription Preview', 'Uploaded At', 'Direct Link'].map(h => <th key={h}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {audios.map(({ id, fileName, transcriptionPreview, createdAt, fileUrl }) => (
                    <tr key={id}>
                        <td>{fileName}</td>
                        <td className="transcription-cell">{transcriptionPreview || "Processando..."}</td>
                        <td>{new Date(createdAt).toLocaleDateString()}</td>
                        <td>
                            <a href={fileUrl} target="_blank" rel="noreferrer" className="link-btn">
                                Open Link
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);