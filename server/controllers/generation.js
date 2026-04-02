import firestore from '../config/firebase.js';
import { executePipeline } from '../services/pipeline.js';
import { saveAsset } from '../services/storage.js';
import { scrapeProductImages } from '../services/scraper.js';
import { selectBestProductImage } from '../services/imageSelection.js';

export const generateImage = async (req, res) => {
    console.log("Received Generation Request");
    const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
        let { modelImages, productImages, productUrls, postureText, skipCollage, generationModel } = req.body;
        if (typeof skipCollage === 'string') skipCollage = skipCollage === 'true';

        // Preprocess Product URLs if provided
        productImages = productImages || [];
        if (productUrls && productUrls.length > 0) {
            console.log(`[Controller] Preprocessing ${productUrls.length} product URLs...`);
            for (const url of productUrls) {
                try {
                    const candidateUrls = await scrapeProductImages(url);
                    const bestImageB64 = await selectBestProductImage(candidateUrls);
                    productImages.push(bestImageB64);
                } catch (error) {
                    console.error(`[Controller] Failed to process URL ${url}:`, error.message);
                }
            }
        }

        if (!modelImages || modelImages.length === 0 || productImages.length === 0) {
            return res.status(400).json({ error: "Missing required inputs (Model images or at least one Product)." });
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const onStepComplete = (step, imageUrl) => {
             res.write(`data: ${JSON.stringify({ event: 'step-complete', step, imageUrl })}\n\n`);
        };

        const result = await executePipeline({ 
            modelImages, 
            productImages, 
            postureText, 
            skipCollage,
            runTimestamp,
            generationModel
        }, onStepComplete);

        console.log("[Controller] Pipeline execution complete, attempting to save to Firestore...");

        console.log("[Controller] Pipeline execution complete, attempting to save to Firestore...");

        const savedIds = [];
        const numFinals = result.logs.finals ? result.logs.finals.length : 1;

        if (result.logs.finals && result.logs.finals.length > 0) {
            for (let i = 0; i < result.logs.finals.length; i++) {
                const final = result.logs.finals[i];
                const model = result.logs.models ? result.logs.models[i] : (result.logs.model || null);
                
                const docRef = await firestore.collection('fitSizeGenerations').add({
                    timestamp: new Date(),
                    type: 'log',
                    saved: false,
                    logs: {
                        model: model ? (model.uri || model) : null,
                        products: result.logs.products ? result.logs.products.map(p => p.uri || p) : [],
                        posture: result.logs.posture?.uri || null,
                        collage: result.logs.collage?.uri || null,
                        final: final.uri || final
                    },
                    config: {
                        ...result.config,
                        productUrls: productUrls || []
                    },
                    evaluation: final.evaluation || result.evaluation || null,
                    usage: {
                       totalTokens: result.usageStats ? {
                           input: Math.ceil(result.usageStats.totalTokens.input / numFinals),
                           output: Math.ceil(result.usageStats.totalTokens.output / numFinals)
                       } : null,
                       totalCost: result.usageStats ? result.usageStats.totalCost / numFinals : null,
                       isEstimate: true
                    }
                });
                savedIds.push(docRef.id);
            }
        } else {
             // Fallback if no finals?
             console.log("[Controller] No final images to save separately.");
        }

        res.write(`data: ${JSON.stringify({
            event: 'complete',
            generationIds: savedIds,
            postureImage: result.logs.posture?.signedUrl,
            collageImage: result.logs.collage?.signedUrl,
            finalImages: result.logs.finals ? result.logs.finals.map(f => f.signedUrl || f) : [],
            evaluation: result.evaluation,
            usage: result.usageStats,
            productUrls: productUrls || []
        })}\n\n`);
        
        res.end();

    } catch (error) {
        console.error("Pipeline Error:", error);
        res.write(`data: ${JSON.stringify({ event: 'error', message: error.message })}\n\n`);
        res.end();
    }
};

export const saveGeneration = async (req, res) => {
    const { generationId } = req.body;
    try {
        const docRef = firestore.collection('fitSizeGenerations').doc(generationId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return res.status(404).json({ error: "Generation not found" });
        
        const data = docSnap.data();
        if (data.saved) return res.json({ success: true, message: "Already saved" });

        const runFolderId = data.config?.runTimestamp || generationId;
        const folderPath = `runs/${runFolderId}/`;

        const assets = {};
        
        if (data.logs.model) assets.model = (await saveAsset(data.logs.model, 'model.png', folderPath))?.uri;
        if (data.logs.final) assets.final = (await saveAsset(data.logs.final, 'final.png', folderPath))?.uri;
        if (data.logs.posture) assets.posture = (await saveAsset(data.logs.posture, 'posture.png', folderPath))?.uri;
        if (data.logs.collage) assets.collage = (await saveAsset(data.logs.collage, 'collage.png', folderPath))?.uri;

        assets.products = [];
        if (data.logs.products && Array.isArray(data.logs.products)) {
            for (let i = 0; i < data.logs.products.length; i++) {
                const pUri = data.logs.products[i];
                const saved = await saveAsset(pUri, `product_${i}.png`, folderPath);
                if (saved) assets.products.push(saved.uri);
            }
        }

        await docRef.update({
            saved: true,
            savedAt: new Date(),
            assets: {
                model: assets.model || null,
                final: assets.final || null,
                posture: assets.posture || null,
                collage: assets.collage || null,
                products: assets.products
            }
        });

        res.json({ success: true, assets });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ error: error.message });
    }
};
