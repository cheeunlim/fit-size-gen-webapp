import React, { useState, useEffect } from 'react';

const UploadSection = ({ onModelUpload, onProductsUpload, modelImages, productImages }) => {
  const [modelPreviews, setModelPreviews] = useState([]);
  const [productPreviews, setProductPreviews] = useState([]);
  const [localUrlsText, setLocalUrlsText] = useState('');

  useEffect(() => {
    const files = modelImages.filter(file => file instanceof File);
    if (files.length === 0) {
      setModelPreviews([]);
      return;
    }
    const urls = files.map(file => URL.createObjectURL(file));
    setModelPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [modelImages]);

  useEffect(() => {
    const files = productImages.filter(file => file instanceof File);
    if (files.length === 0) {
      setProductPreviews([]);
      return;
    }
    const urls = files.map(file => URL.createObjectURL(file));
    setProductPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [productImages]);

  return (
    <div className="section upload-section">
      <h2>1. Upload Images</h2>
      <div className="upload-group">
        <div className="upload-item">
          <label>Model Images (Upload Multiple for Size/Fit Comparison)</label>
          <div className="upload-control">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={(e) => {
                const files = Array.from(e.target.files);
                onModelUpload(files);
              }} 
            />
            {modelPreviews.length > 0 && (
              <div className="image-preview grid">
                {modelPreviews.map((url, index) => (
                  <div key={index} className="preview-thumb">
                    <img src={url} alt={`Model ${index}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="upload-item">
          <label>Product Images / Links (Max 10)</label>
          <div className="upload-hint">✨ You can upload images AND paste links together!</div>
          
          <div className="upload-control combined-upload">
            <div className="file-upload-section">
              <label className="sub-label">Product Files</label>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const existingUrls = productImages.filter(p => typeof p === 'string');
                  onProductsUpload([...existingUrls, ...files]);
                }} 
              />
              {productPreviews.length > 0 && (
                <div className="image-preview grid">
                  {productPreviews.map((url, index) => (
                    <div key={index} className="preview-thumb">
                      <img src={url} alt={`Product ${index}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="url-upload-section">
              <label className="sub-label">Product URLs</label>
              <div className="url-input-container">
                <div className="url-chips">
                  {localUrlsText.split('\n').map(u => u.trim()).filter(Boolean).map((url, index) => (
                    <div key={index} className="url-chip">
                      <span className="chip-icon">🔗</span>
                      <span className="chip-text">{url}</span>
                      <button 
                        type="button" 
                        className="chip-delete" 
                        onClick={() => {
                          const urls = localUrlsText.split('\n').map(u => u.trim()).filter(Boolean);
                          const filtered = urls.filter((_, i) => i !== index);
                          setLocalUrlsText(filtered.join('\n'));
                          const existingFiles = productImages.filter(p => p instanceof File);
                          onProductsUpload([...existingFiles, ...filtered]);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <textarea 
                  placeholder="Enter product URLs (one per line)..."
                  value={localUrlsText}
                  onChange={(e) => {
                    setLocalUrlsText(e.target.value);
                    const urls = e.target.value.split('\n').map(u => u.trim()).filter(Boolean);
                    const existingFiles = productImages.filter(p => p instanceof File);
                    onProductsUpload([...existingFiles, ...urls]);
                  }}
                  rows={4}
                  className="url-textarea borderless"
                />
              </div>
              <span className="subtitle">Each URL should point to a valid product page. Gemini will extract the best image.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
