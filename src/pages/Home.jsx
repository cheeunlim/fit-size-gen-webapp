
import React, { useState } from 'react';
import UploadSection from '../components/UploadSection';
import PostureInput from '../components/PostureInput';
import ResultsDisplay from '../components/ResultsDisplay';
import { usePipeline } from '../hooks/usePipeline';

const Home = () => {
  const [modelImages, setModelImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [postureText, setPostureText] = useState('');
  const [skipCollage, setSkipCollage] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-image-preview');

  const { generate, saveResult, isProcessing, results } = usePipeline();

  const handleGenerate = async () => {
    if (!modelImages || modelImages.length === 0 || productImages.length === 0 || !postureText) {
      alert("Please provide all required inputs (Model Images, Products, Posture).");
      return;
    }

    try {
      await generate({
        modelImages,
        productImages,
        postureText,
        skipCollage,
        generationModel: selectedModel
      });
    } catch (error) {
      alert("Generation failed. " + error.message);
    }
  };

  const handleSave = async (id) => {
    const success = await saveResult(id);
    if (success) alert("Saved to Gallery!");
    else alert("Failed to save.");
  };

  return (
    <div className="home-container">
      <UploadSection 
        onModelUpload={setModelImages} 
        onProductsUpload={setProductImages} 
        modelImages={modelImages}
        productImages={productImages}
      />
      
      <PostureInput 
        value={postureText} 
        onChange={setPostureText} 
      />

      <section className="section action-section">
        <div className="section-header">
          <h2>3. Generation Settings</h2>
          <p className="subtitle">Configure pipeline options and start generation.</p>
        </div>
        
        <div className="action-controls">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={skipCollage} 
              onChange={(e) => setSkipCollage(e.target.checked)} 
            />
            <span className="checkmark"></span>
            <strong>Skip Collage Step</strong>
            <span className="label-detail">(Use raw product images instead of Step 2 collage)</span>
          </label>

          <div className="model-selector-container">
            <label className="sub-label">Generation Model Selection</label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              <option value="gemini-3-pro-image-preview">Gemini 3.0 Pro Image (Default)</option>
              <option value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image (Nano Banana 2)</option>
            </select>
            <span className="subtitle">Choose Flash for speed or Pro for visual accuracy.</span>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isProcessing}
          className="generate-btn"
        >
          {isProcessing ? 'Processing Fit Comparison...' : 'Generate Fit & Size Comparison'}
        </button>
      </section>

      {(isProcessing || results) && (
           <ResultsDisplay results={results} loading={isProcessing} onSave={handleSave} skipCollage={skipCollage} />
      )}

      <section className="section system-section">
        <div className="section-header">
          <h3>System Configuration</h3>
          <p className="subtitle">Backend and model technical specifications.</p>
        </div>
        <div className="status-grid">
          <div className="status-item">
            <label>Posture Model</label>
            <span>Gemini 2.5 Flash Image</span>
          </div>
          <div className="status-item">
            <label>Generation Model</label>
            <span>Gemini 3 Pro / 3.1 Flash Image</span>
          </div>
          <div className="status-item">
            <label>Eval Model</label>
            <span>Gemini 3 Pro/Flash</span>
          </div>
          <div className="status-item">
            <label>Auth Status</label>
            <span className="success">Managed by Backend (ADC)</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
