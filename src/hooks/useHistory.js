import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getHistory();
            setHistory(data.history || []);
        } catch (err) {
            console.error("Failed to fetch history", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveItem = async (id) => {
        try {
            await api.save(id);
            setHistory(prev => prev.map(item => 
                item.id === id ? { ...item, saved: true } : item
            ));
            return true;
        } catch (err) {
            console.error("Error saving item", err);
            return false;
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        loading,
        error,
        refresh: fetchHistory,
        saveItem
    };
};
