import React from 'react';
import './ImageDetailModal.css'; // We'll create this or add to App.css

const ImageDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h3>Generated Snap</h3>
          <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
        </div>

        <div className="modal-body">
          {/* Left Column: Final Result */}
          <div className="result-column">
            <div className="main-image-container">
              {item.finalImage ? (
                <img src={item.finalImage} alt="Final Result" className="final-image" />
              ) : (
                <div className="error-placeholder">Image Not Available</div>
              )}
            </div>
            {item.evaluation && (
                <div className={`status-badge ${item.evaluation.passed ? 'pass' : 'fail'}`}>
                    {item.evaluation.passed ? 'PASSED' : 'FLAGGED'}
                </div>
            )}
            {/* Stats in left column or right? Right seems better for details */}
          </div>

          {/* Right Column: Inputs & Details */}
          <div className="details-column">
            
            {/* New Stats Section */}
            {item.usage && (
                <div className="detail-section stats-section">
                    <h4>Generation Stats</h4>
                    <div className="stats-row">
                        <div className="stat-pill">
                            <span className="label">Total Cost</span>
                            <span className="value cost">${item.usage.totalCost?.toFixed(4)}</span>
                        </div>
                        <div className="stat-pill">
                            <span className="label">Total Tokens</span>
                            <span className="value">{((item.usage.totalTokens?.input || 0) + (item.usage.totalTokens?.output || 0)).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="detail-section">
                <h4>Model & Posture</h4>
                <div className="input-row">
                    <div className="input-item">
                        <span className="input-label">Model</span>
                        {item.modelImage ? (
                            <img src={item.modelImage} alt="Model" className="input-thumb" />
                        ) : <div className="missing">N/A</div>}
                    </div>
                    <div className="input-item">
                        <span className="input-label">Posture Guide</span>
                        {item.postureImage ? (
                            <img src={item.postureImage} alt="Posture" className="input-thumb" />
                        ) : <div className="missing">N/A</div>}
                    </div>
                </div>
                {item.postureText && (
                    <div className="posture-text">
                        <strong>Prompt:</strong> {item.postureText}
                    </div>
                )}
            </div>

            <div className="detail-section">
                <h4>Apparel</h4>
                {item.collageImage && (
                    <div className="collage-preview">
                        <span className="input-label">Collage</span>
                        <img src={item.collageImage} alt="Collage" className="collage-thumb" />
                    </div>
                )}
                
                <div className="products-grid">
                    {item.productImages && item.productImages.length > 0 ? (
                        item.productImages.map((img, idx) => (
                            <div key={idx} className="product-thumb-container">
                                <img src={img} alt={`Product ${idx}`} className="product-thumb" />
                            </div>
                        ))
                    ) : (
                        <div className="no-products">No products linked</div>
                    )}
                </div>
            </div>

            <div className="detail-section">
                <h4>Product Links</h4>
                {item.config?.productUrls && item.config.productUrls.length > 0 ? (
                    <div className="product-links-list">
                        {item.config.productUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="product-link-item">
                                <span className="link-icon">🔗</span>
                                <span className="link-text">{url}</span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="no-products">No external links provided</div>
                )}
            </div>

            {item.evaluation && item.evaluation.scores && (
                <div className="detail-section scores-section">
                    <h4>Quality Scores</h4>
                    <div className="score-row">
                        <span>Product Consistency:</span>
                        <div className="score-bar">
                            <div className="score-fill" style={{width: `${(item.evaluation.scores.productConsistency || 0) * 10}%`}}></div>
                        </div>
                    </div>
                    <div className="score-row">
                        <span>Model Consistency:</span>
                        <div className="score-bar">
                            <div className="score-fill" style={{width: `${(item.evaluation.scores.modelConsistency || 0) * 10}%`}}></div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal;
