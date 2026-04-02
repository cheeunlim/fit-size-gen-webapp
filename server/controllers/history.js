import firestore from '../config/firebase.js';
import { getProxyUrl } from '../services/storage.js';

export const getHistory = async (req, res) => {
    try {
        const snapshot = await firestore.collection('fitSizeGenerations').orderBy('timestamp', 'desc').limit(50).get();
        const events = [];
        
        for (const doc of snapshot.docs) {
            const d = doc.data();
            
            // Helper to get Signed/Proxy URL
            const getUrl = (uri) => {
                if (!uri) return null;
                const parts = uri.replace('gs://', '').split('/');
                const bucketName = parts.shift();
                const filename = parts.join('/');
                return getProxyUrl(bucketName, filename);
            };

            const source = d.saved ? d.assets : d.logs;
            const safeSource = source || {};

            events.push({
                id: doc.id,
                timestamp: d.timestamp.toDate(),
                saved: d.saved,
                finalImage: getUrl(safeSource.final),
                modelImage: getUrl(safeSource.model),
                postureImage: getUrl(safeSource.posture),
                collageImage: getUrl(safeSource.collage),
                productImages: (safeSource.products || []).map(p => getUrl(p)),
                evaluation: d.evaluation,
                postureText: d.config?.postureText,
                usage: d.usage 
            });
        }
        res.json({ history: events });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: error.message });
    }
};
