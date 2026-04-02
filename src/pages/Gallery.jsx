
import React, { useState } from 'react';
import ImageDetailModal from '../components/ImageDetailModal';
import { useHistory } from '../hooks/useHistory';

const Gallery = () => {
  const { history, loading, saveItem } = useHistory();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSave = async (id) => {
    const success = await saveItem(id);
    if (!success) alert("Failed to save");
  };

  if (loading) return <div className="gallery-loading">Loading Gallery...</div>;

  return (
    <div className="section gallery-section">
      <div className="section-header">
        <h2>Generation Gallery</h2>
        <p className="subtitle">Your history of generated snaps.</p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">No history found. Go generate some snaps!</div>
      ) : (
        <div className="gallery-grid">
          {history.map(item => (
            <div key={item.id} className={`gallery-item ${item.saved ? 'saved' : 'temp'}`} onClick={() => setSelectedItem(item)}>
              <div className="gallery-image">
                {item.finalImage ? (
                  <img src={item.finalImage} alt="Snap" loading="lazy" />
                ) : (
                  <div className="placeholder">Image Expired</div>
                )}
                <div className="gallery-overlay">
                    {item.saved ? (
                        <span className="saved-badge">✓ Saved</span>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); handleSave(item.id); }} className="gallery-save-btn">
                            ♥ Save
                        </button>
                    )}
                </div>
              </div>
              <div className="gallery-info">
                <span className="timestamp">{new Date(item.timestamp).toLocaleString()}</span>
                {item.postureText && <p className="caption" title={item.postureText}>{item.postureText}</p>}
                {item.evaluation && (
                    <div className="mini-score">
                        Quality: {item.evaluation.passed ? 'PASS' : 'FAIL'}
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      
      {selectedItem && (
        <ImageDetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

export default Gallery;
