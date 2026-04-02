import { callVertexAI } from './vertex.js';
import fetch from 'node-fetch';

export const selectBestProductImage = async (candidateUrls) => {
    console.log(`[ImageSelection] Selecting best image from ${candidateUrls.length} candidates.`);

    // Take top 5 candidates to save bandwidth
    const topCandidates = candidateUrls.slice(0, 5);
    const downloadedImages = [];

    for (let i = 0; i < topCandidates.length; i++) {
        try {
            const resp = await fetch(topCandidates[i]);
            if (!resp.ok) continue;
            const arrayBuffer = await resp.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            downloadedImages.push({
                index: i,
                url: topCandidates[i],
                base64: buffer.toString('base64'),
                mimeType: resp.headers.get('content-type') || 'image/png'
            });
        } catch (e) {
            console.warn(`[ImageSelection] Failed to download candidate ${i}:`, e.message);
        }
    }

    if (downloadedImages.length === 0) {
        throw new Error("No valid candidate images could be downloaded.");
    }

    // Pass images to Gemini with explicit labels
    const parts = [];
    downloadedImages.forEach((img, index) => {
        parts.push({ text: `Candidate ${index}:` });
        parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
    });

    parts.push({
        text: "You are an expert fashion stylist. Examine the candidate images and determine which one is the absolute BEST representation for a product thumbnail.\n\nCriteria:\n- Clear focus: Detailed flat lay or clean model shot.\n- Single subject: No distractions or multiple items.\n- No text/watermarks.\n\nTask:\n1. Choose the best candidate image.\n2. Write a brief 1-sentence explanation of why it is the best.\n3. Output the 0-based index of the selected image.\n\nFormat:\nReason: [Your reason]\nIndex: [X]"
    });

    try {
        // Use gemini-3.1-flash-lite-preview for fast selection
        const response = await callVertexAI('gemini-3.1-flash-lite-preview', {
            contents: [{ role: 'user', parts }],
            generationConfig: {
                maxOutputTokens: 100, // Increase tokens to allow reasoning
                temperature: 0.1, 
                responseModalities: ["TEXT"] 
            }
        });

        // Parse response to find the index
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "0";
        console.log(`[ImageSelection] Gemini response:\n${text}`);
        
        // Extract from "Index: X" or fallback to any digit
        const match = text.match(/Index:\s*(\d+)/i) || text.match(/Candidate\s*(\d+)/i) || text.match(/\d+/);
        const matchedIndex = parseInt(match?.[1] || match?.[0] || "0", 10);
        const selected = downloadedImages[matchedIndex] || downloadedImages[0];

        console.log(`[ImageSelection] Selected candidate index ${matchedIndex} (Map to array index ${downloadedImages.indexOf(selected)})`);
        
        return selected.base64; // Return base64 for pipeline usage

    } catch (error) {
        console.error("[ImageSelection] Gemini selection failed, falling back to first candidate:", error);
        return downloadedImages[0].base64; // Fallback
    }
};
