import { useState } from 'react';
import { api } from '../services/api';

export const usePipeline = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const generate = async (inputs) => {
        setIsProcessing(true);
        setResults(null);
        setError(null);
        try {
            const onProgress = (data) => {
                if (data.event === 'step-complete') {
                    setResults(prev => {
                        const updated = prev ? { ...prev } : {};
                        if (data.step === 'posture') updated.postureImage = data.imageUrl;
                        if (data.step === 'collage') updated.collageImage = data.imageUrl;
                        if (data.step === 'final') updated.finalImage = data.imageUrl;
                        return updated;
                    });
                }
            };

            const output = await api.generate(inputs, onProgress);
            setResults(prev => ({ ...prev, ...output }));
            return output;
        } catch (err) {
            console.error("Pipeline failed", err);
            setError(err.message);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    const saveResult = async (id) => {
        try {
            await api.save(id);
            setResults(prev => prev ? { ...prev, saved: true } : null);
            return true;
        } catch (err) {
            console.error("Save failed", err);
            setError(err.message);
            return false;
        }
    };

    return {
        generate,
        saveResult,
        isProcessing,
        results,
        error
    };
};
