import express from 'express';
import { generateImage, saveGeneration } from '../controllers/generation.js';
import { getHistory } from '../controllers/history.js';
import { logsBucket, assetsBucket } from '../config/storage.js';

const router = express.Router();

router.post('/generate', generateImage);
router.post('/save', saveGeneration);
router.get('/history', getHistory);

// Proxy Endpoint
router.get('/proxy-image', async (req, res) => {
    const { bucket, file } = req.query;
    if (!bucket || !file) return res.status(400).send("Missing bucket or file param");

    try {
        // Determine which bucket object to use based on name, or just create a new reference if safe
        // For safety, let's map known bucket names
        let bucketObj;
        if (bucket === logsBucket.name) bucketObj = logsBucket;
        else if (bucket === assetsBucket.name) bucketObj = assetsBucket;
        else return res.status(403).send("Unauthorized bucket");

        const fileObj = bucketObj.file(file);
        const [exists] = await fileObj.exists();
        if (!exists) return res.status(404).send("File not found");

        res.setHeader('Content-Type', 'image/png');
        fileObj.createReadStream().pipe(res);
    } catch (err) {
        console.error("Proxy Error:", err);
        res.status(500).send("Error fetching image");
    }
});

export default router;
