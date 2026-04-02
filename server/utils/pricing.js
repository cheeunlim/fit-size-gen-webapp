import { PRICING_CONFIG } from '../config/constants.js';

export const calculateCost = (modelId, inputTokens, outputTokens) => {
    const pricing = PRICING_CONFIG[modelId];
    if (!pricing) return 0;
    
    const inputCost = (inputTokens / 1000000) * pricing.inputRate;
    const outputCost = (outputTokens / 1000000) * pricing.outputRate;
    return inputCost + outputCost;
};
