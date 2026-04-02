const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); 
        reader.onerror = error => reject(error);
    });
};

export const api = {
    generate: async (inputs, onProgress) => {
        const { modelImages, productImages, postureText, skipCollage, generationModel } = inputs;
        
        const productFiles = productImages.filter(p => p instanceof File);
        const productUrls = productImages.filter(p => typeof p === 'string');

        const modelB64s = await Promise.all(modelImages.map(fileToBase64));
        const productB64s = await Promise.all(productFiles.map(fileToBase64));

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                modelImages: modelB64s,
                productImages: productB64s,
                productUrls,
                postureText,
                skipCollage,
                generationModel
            })
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMsg = "Generation Failed";
            try {
                const json = JSON.parse(text);
                errorMsg = json.error || errorMsg;
            } catch (e) {
                errorMsg = text || `Generation Failed (Status: ${response.status})`;
            }
            throw new Error(errorMsg);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let finalResult = null;
        let accumulator = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            accumulator += decoder.decode(value, { stream: true });
            const lines = accumulator.split('\n');
            accumulator = lines.pop(); // Keep the last incomplete line in accumulator

            for (const line of lines) {
                if (!line.trim()) continue;
                if (line.startsWith('data: ')) {
                    let errorToThrow = null;
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.event === 'step-complete' && onProgress) {
                            onProgress(data);
                        } else if (data.event === 'complete') {
                            finalResult = data;
                        } else if (data.event === 'error') {
                            errorToThrow = new Error(data.message);
                        }
                    } catch (e) {
                        console.error("[API] Stream parse error:", e, line);
                    }
                    if (errorToThrow) throw errorToThrow;
                }
            }
        }

        if (!finalResult) throw new Error("Stream ended without completion event");
        return finalResult;
    },

    save: async (generationId) => {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ generationId })
        });
        
        if (!response.ok) throw new Error((await response.json()).error || "Save Failed");
        return await response.json();
    },

    getHistory: async () => {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error((await response.json()).error || "Fetch History Failed");
        return await response.json();
    }
};
