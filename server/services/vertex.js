import fetch from 'node-fetch';
import { auth } from '../config/auth.js';
import { PROJECT_ID, LOCATION } from '../config/constants.js';

export const callVertexAI = async (modelId, payload) => {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const token = accessToken.token;

    const apiEndpoint = LOCATION === 'global' ? 'aiplatform.googleapis.com' : `${LOCATION}-aiplatform.googleapis.com`;
    const url = `https://${apiEndpoint}/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelId}:streamGenerateContent`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI Error (${response.status}): ${errorText}`);
    }
    return await response.json();
};

export const extractInlineImage = (response) => {
    const chunks = Array.isArray(response) ? response : [response];
    for (const chunk of chunks) {
        const candidate = chunk.candidates?.[0];
        const part = candidate?.content?.parts?.find(p => p.inlineData?.data);
        if (part) return part;
    }
    return null;
};

export const extractUsage = (response) => {
    const chunks = Array.isArray(response) ? response : [response];
    let promptTokenCount = 0;
    let candidatesTokenCount = 0;

    // Find the last chunk with usageMetadata
    for (let i = chunks.length - 1; i >= 0; i--) {
        if (chunks[i].usageMetadata) {
            promptTokenCount = chunks[i].usageMetadata.promptTokenCount || 0;
            candidatesTokenCount = chunks[i].usageMetadata.candidatesTokenCount || 0;
            break; 
        }
    }
    return { promptTokenCount, candidatesTokenCount };
};
