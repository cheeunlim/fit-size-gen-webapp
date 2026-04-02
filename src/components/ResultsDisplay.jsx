import React, { useState } from 'react';
import ProductSidebar from './ProductSidebar';

const LoadingCard = ({ step, title }) => (
  <div className="result-card loading-card">
    <div className="card-header">
      <span className="step-badge">Step {step}</span>
      <h3>{title}</h3>
    </div>
    <div className="image-container loading-container-inner">
      <div className="loading-spinner"></div>
      <p>Generating...</p>
    </div>
  </div>
);

const ResultsDisplay = ({ results, loading, onSave, skipCollage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModelIndex, setActiveModelIndex] = useState(0);

  if (!results && !loading) return null;

  const { postureImage, collageImage, finalImages, evaluation, usage } = results || {};

  return (
    <div className="section results-section">
      <div className="section-header">
        <h2>3. Generation Results</h2>
        <p className="subtitle">Compare the fits of the clothing item on different models using the tabs below.</p>
      </div>
      
      <div className="pipeline-grid">
        {postureImage ? (
            <div className="result-card">
              <div className="card-header">
                <span className="step-badge">Step 1</span>
                <h3>Posture Guide</h3>
              </div>
              <div className="image-container">
                <img src={postureImage} alt="Posture Guide" />
              </div>
            </div>
        ) : loading ? (
            <LoadingCard step="1" title="Posture Guide" />
        ) : null}

        {collageImage ? (
            <div className="result-card">
              <div className="card-header">
                <span className="step-badge">Step 2</span>
                <h3>Product Collage</h3>
              </div>
              <div className="image-container">
                <img src={collageImage} alt="Product Collage" />
              </div>
            </div>
        ) : loading && !skipCollage ? (
            <LoadingCard step="2" title="Product Collage" />
        ) : skipCollage ? (
            <div className="result-card skipped-card">
              <div className="card-header">
                <span className="step-badge skipped">Step 2</span>
                <h3>Product Collage</h3>
              </div>
              <div className="image-container skipped-container">
                <span className="skipped-icon">⏭️</span>
                <p className="skipped-text">Step Skipped</p>
                <small className="skipped-note">Raw product images were used directly for generation.</small>
              </div>
            </div>
        ) : null}
      </div>

      {finalImages && finalImages.length > 0 ? (
        <div className="result-card final-card">
            <div className="card-header">
            <span className="step-badge highlight">Step 3</span>
            <h3>Final Generated Images</h3>
            </div>

            {finalImages.length > 1 && (
              <div className="model-tabs" style={{ display: 'flex', gap: '10px', padding: '15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {finalImages.map((_, index) => (
                  <button 
                    key={index} 
                    className={`tab-btn ${activeModelIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveModelIndex(index)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      background: activeModelIndex === index ? '#0f172a' : '#fff',
                      color: activeModelIndex === index ? '#fff' : '#1e293b',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease',
                      boxShadow: activeModelIndex === index ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Model {index + 1}
                  </button>
                ))}
              </div>
            )}

            <div className="image-container main-image-container">
              {finalImages.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={`Final Generation Model ${index + 1}`} 
                  className={`main-image ${activeModelIndex === index ? 'active' : 'hidden'}`}
                  style={{ display: activeModelIndex === index ? 'block' : 'none' }}
                />
              ))}
            </div>
            {(results?.generationId || results?.generationIds) && (
                <div className="card-actions">
                    <button 
                        className="save-btn" 
                        onClick={() => onSave(results.generationIds ? results.generationIds[activeModelIndex] : results.generationId)}
                        disabled={results.saved}
                    >
                        {results.saved ? '✓ Saved' : '♥ Save to Gallery'}
                    </button>
                    {results.productUrls && results.productUrls.length > 0 && (
                        <button 
                            className="view-products-btn" 
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            🛍️ View Products
                        </button>
                    )}
                </div>
            )}
        </div>
      ) : loading ? (
        <LoadingCard step="3" title="Final Generated Image" />
      ) : null}

      {/* Generation Stats - Only show if not loading and usage exists */}
      {!loading && usage && (
          <div className="result-card stats-card">
            <div className="card-header">
              <span className="step-badge info">Info</span>
              <h3>Generation Stats</h3>
            </div>
            <div className="stats-content">
                <div className="stat-item">
                    <label>Total Cost</label>
                    <div className="stat-value cost">${usage.totalCost?.toFixed(4)}</div>
                </div>
                <div className="stat-item">
                    <label>Total Tokens</label>
                    <div className="stat-value">
                        {((usage.totalTokens?.input || 0) + (usage.totalTokens?.output || 0)).toLocaleString()}
                    </div>
                </div>
                <div className="stat-details">
                    <small>Input: {usage.totalTokens?.input?.toLocaleString()} | Output: {usage.totalTokens?.output?.toLocaleString()}</small>
                </div>
            </div>
          </div>
      )}

      {loading ? (
         <div className="result-card evaluation-card">
            <div className="card-header">
            <span className="step-badge">Step 4</span>
            <h3>Quality Evaluation</h3>
            </div>
            <div className="evaluation-content loading-content">
                <div className="loading-spinner small"></div>
                <p>Running Evaluation...</p>
            </div>
         </div>
      ) : (
        evaluation && (
            <div className="result-card evaluation-card">
                <div className="card-header">
                <span className="step-badge">Step 4</span>
                <h3>Quality Evaluation</h3>
                </div>
                <div className="evaluation-content">
                <div className={`status-pill ${evaluation.passed ? 'pass' : 'fail'}`}>
                    {evaluation.passed ? '✓ QUALITY PASSED' : '✗ QUALITY FAILED'}
                </div>
                
                <div className="metrics-grid">
                    <div className="metric-item">
                    <label>Product Visibility</label>
                    <div className="score">{evaluation.scores?.missingProducts ?? 'N/A'}/10</div>
                    </div>
                    <div className="metric-item">
                    <label>Product Consistency</label>
                    <div className="score">{evaluation.scores?.productConsistency ?? 'N/A'}/10</div>
                    </div>
                    <div className="metric-item">
                    <label>Model Consistency</label>
                    <div className="score">{evaluation.scores?.modelConsistency ?? 'N/A'}/10</div>
                    </div>
                </div>

                <div className="evaluation-report-box">
                    <h4>Detailed Analysis</h4>
                    <p>{evaluation.report}</p>
                </div>
                </div>
            </div>
        )
      )}

      {/* Product Sidebar Rendering */}
      <ProductSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        productUrls={results?.productUrls || []} 
      />
    </div>
  );
};

export default ResultsDisplay;
