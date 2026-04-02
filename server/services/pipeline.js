import { logsBucket } from '../config/storage.js';
import { uploadToGCS } from './storage.js';
import { callVertexAI, extractInlineImage, extractUsage } from './vertex.js';
import { MODEL_CONFIG, GENERATION_CONFIG, SAFETY_SETTINGS } from '../config/constants.js';
import { calculateCost } from '../utils/pricing.js';

export const executePipeline = async ({ modelImages, productImages, postureText, skipCollage, runTimestamp, generationModel }, onStepComplete) => {
    const logs = {};
    const usageStats = {
        totalCost: 0,
        totalTokens: { input: 0, output: 0 },
        steps: {}
    };

    console.log(`[Pipeline] Starting run: ${runTimestamp}`);

    // 0. Upload Inputs
    logs.models = [];
    for (let i = 0; i < modelImages.length; i++) {
        const buf = Buffer.from(modelImages[i], 'base64');
        const result = await uploadToGCS(buf, logsBucket, `input_model_${i}_${runTimestamp}.png`);
        logs.models.push(result);
    }
    
    logs.products = [];
    for (let i = 0; i < productImages.length; i++) {
        const buf = Buffer.from(productImages[i], 'base64');
        const result = await uploadToGCS(buf, logsBucket, `input_product_${i}_${runTimestamp}.png`);
        logs.products.push(result);
    }

    // 1. Posture
    console.log("[Pipeline] Step 1: Posture...");
    const posturePayload = {
        contents: [{ role: 'user', parts: [{ text: `Generate a very simple, minimalist stick figure sketch on a white background. Do NOT generate a realistic photo, a detailed drawing, or a human face. Use simple black lines for limbs and a circle for the head to represent the pose. The image must be a black and white line drawing. Pose description: ${postureText}` }] }],
        generationConfig: GENERATION_CONFIG,
        safetySettings: SAFETY_SETTINGS
    };
    const postureResp = await callVertexAI(MODEL_CONFIG.posture, posturePayload);
    const pPart = extractInlineImage(postureResp);
    
    // Usage 1
    const pUsage = extractUsage(postureResp);
    const pCost = calculateCost(MODEL_CONFIG.posture, pUsage.promptTokenCount, pUsage.candidatesTokenCount);
    usageStats.steps.posture = { ...pUsage, cost: pCost };
    usageStats.totalTokens.input += pUsage.promptTokenCount;
    usageStats.totalTokens.output += pUsage.candidatesTokenCount;
    usageStats.totalCost += pCost;

    let postureB64 = null;
    if (pPart?.inlineData?.data) {
            postureB64 = pPart.inlineData.data;
            const buf = Buffer.from(postureB64, 'base64');
            logs.posture = await uploadToGCS(buf, logsBucket, `step1_posture_${runTimestamp}.png`);
            if (onStepComplete) onStepComplete('posture', logs.posture.signedUrl);
    }

    // 2. Collage
    let collageB64 = null;
    if (!skipCollage) {
        console.log("[Pipeline] Step 2: Collage...");
        const productParts = productImages.map(b64 => ({ inlineData: { mimeType: 'image/png', data: b64 } }));
        const collagePayload = {
            contents: [{ role: 'user', parts: [...productParts, { text: "Create a clean flat lay collage of these fashion items arranged in a coherent outfit layout. IMPORTANT: Use the provided images AS IS. Do NOT alter, distort, or modify the appearance of the products. Maintain the original texture, color, and details of each item." }] }],
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS
        };
        const collageResp = await callVertexAI(MODEL_CONFIG.collage, collagePayload);
        const cPart = extractInlineImage(collageResp);
        
        // Usage 2
        const cUsage = extractUsage(collageResp);
        const cCost = calculateCost(MODEL_CONFIG.collage, cUsage.promptTokenCount, cUsage.candidatesTokenCount);
        usageStats.steps.collage = { ...cUsage, cost: cCost };
        usageStats.totalTokens.input += cUsage.promptTokenCount;
        usageStats.totalTokens.output += cUsage.candidatesTokenCount;
        usageStats.totalCost += cCost;

        if (cPart?.inlineData?.data) {
            collageB64 = cPart.inlineData.data;
            const buf = Buffer.from(collageB64, 'base64');
            logs.collage = await uploadToGCS(buf, logsBucket, `step2_collage_${runTimestamp}.png`);
            if (onStepComplete) onStepComplete('collage', logs.collage.signedUrl);
        }
    }

    // 3. Final Gen
    console.log("[Pipeline] Step 3: Final Gen...");
    logs.finals = [];
    
    for (let i = 0; i < modelImages.length; i++) {
        const modelImage = modelImages[i];
        console.log(`[Pipeline] Generating for Model ${i+1}/${modelImages.length}...`);
        
        const finalParts = [{ inlineData: { mimeType: 'image/png', data: modelImage } }];
        if (postureB64) finalParts.push({ inlineData: { mimeType: 'image/png', data: postureB64 } });
        
        let itemsRef = "";
        if (!skipCollage && collageB64) {
                finalParts.push({ inlineData: { mimeType: 'image/png', data: collageB64 } });
                itemsRef = "[Collage Image]";
        } else {
                productImages.forEach(b64 => finalParts.push({ inlineData: { mimeType: 'image/png', data: b64 } }));
                itemsRef = "[Product Images]";
        }

        finalParts.push({ text: `Generate a high-quality, photorealistic image of the person from the [Model Image] given in this part wearing the full outfit displayed in the ${itemsRef}. The person must be in the exact pose depicted in the [Posture Guide Image].
        - Subject: Use the face and physique from the [Model Image] given in this part. Facial and physical features must be strictly consistent with that model image.
        - Apparel: Wear the items from ${itemsRef} exactly as they appear. Retain the original texture, color, and design of each item, but focus on how it fits realistically on this specific body type.
        - Pose: Strictly follow the body position and limb placement from [Posture Guide Image].
        Original pose description: ${postureText}` });

        const finalResp = await callVertexAI(generationModel || MODEL_CONFIG.generation, { 
            contents: [{ role: 'user', parts: finalParts }],
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS
        });
        
        const fPart = extractInlineImage(finalResp);
        
        // Usage 3
        const fUsage = extractUsage(finalResp);
        const fCost = calculateCost(MODEL_CONFIG.generation, fUsage.promptTokenCount, fUsage.candidatesTokenCount);
        usageStats.totalCost += fCost;
        usageStats.totalTokens.input += fUsage.promptTokenCount;
        usageStats.totalTokens.output += fUsage.candidatesTokenCount;
        
        if (!usageStats.steps.generations) usageStats.steps.generations = [];
        usageStats.steps.generations.push({ ...fUsage, cost: fCost, modelIndex: i });

        if (fPart?.inlineData?.data) {
                const finalB64 = fPart.inlineData.data;
                const buf = Buffer.from(finalB64, 'base64');
                const uploaded = await uploadToGCS(buf, logsBucket, `step3_final_model_${i}_${runTimestamp}.png`);
                logs.finals.push(uploaded);
                if (onStepComplete) onStepComplete(`final_model_${i}`, uploaded.signedUrl);
        } else {
            throw new Error(`Failed to generate final image for model ${i}`);
        }
    }

    // 4. Eval
    console.log("[Pipeline] Step 4: Eval (SKIPPED)");
    let evaluation = { 
        passed: true, 
        report: "Evaluation skipped by user request.", 
        scores: {
            missingProducts: 10,
            productConsistency: 10,
            modelConsistency: 10
        } 
    };

    return {
        logs,
        usageStats,
        evaluation,
        config: { postureText, skipCollage, runTimestamp }
    };
};
