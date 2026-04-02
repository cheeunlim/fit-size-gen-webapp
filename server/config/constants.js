export const PROJECT_ID = process.env.PROJECT_ID || 'musinsa-snap-prototype';
export const LOCATION = 'global';

export const PRICING_CONFIG = {
    'gemini-2.5-flash-image': {
        inputRate: 0.30,
        outputRate: 30.00
    },
    'gemini-3.1-flash-image-preview': {
        inputRate: 0.30,
        outputRate: 30.00
    },
    'gemini-3-pro-image-preview': {
        inputRate: 2.00,   // Per 1M tokens
        outputRate: 120.00 // Per 1M tokens
    },
    'gemini-3-pro-preview': {
        inputRate: 2.00,
        outputRate: 120.00
    }
};

export const MODEL_CONFIG = {
    posture: 'gemini-2.5-flash-image', 
    collage: 'gemini-2.5-flash-image', 
    generation: 'gemini-3-pro-image-preview',
    evaluation: 'gemini-3-pro-preview'
};

export const GENERATION_CONFIG = {
    maxOutputTokens: 32768,
    temperature: 1,
    topP: 0.95,
    responseModalities: ["IMAGE"],
    imageConfig: { aspectRatio: "1:1", imageSize: "2K" }
};

export const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
];
