import * as tf from '@tensorflow/tfjs';

let model: tf.GraphModel | null = null;

async function loadModel() {
    if (!model) {
        model = await tf.loadGraphModel(
            'https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1',
            { fromTFHub: true }
        );
    }
}

self.onmessage = async (event: MessageEvent<{ audioData: Float32Array }>) => {
    try {
        const { audioData } = event.data;

        if (!audioData || audioData.length === 0) {
            self.postMessage({ isValid: false });
            return;
        }

        await loadModel();

        const waveform = tf.tensor1d(audioData);
        const [scores] = model!.predict(waveform) as tf.Tensor[];
        const meanScores = scores.mean(0);
        const values = await meanScores.data();

        const musicIndexes = 132;
        const musicScore = values[musicIndexes];

        const isMusic = musicScore > 0.15;

        self.postMessage({ isValid: isMusic });

        waveform.dispose();
        scores.dispose();
        meanScores.dispose();
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage({ isValid: false, error: 'Erro ao classificar áudio' });
    }
};