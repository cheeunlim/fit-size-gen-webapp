import React from 'react';

const ProductSidebar = ({ isOpen, onClose, productUrls = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="glass-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <h3>Tagged Products</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="sidebar-content">
          {productUrls.length === 0 ? (
            <p className="empty-msg">No products tagged for this generation.</p>
          ) : (
            <div className="product-list">
              {productUrls.map((url, index) => {
                let domain = "";
                try {
                  domain = new URL(url).hostname;
                } catch (e) {
                  domain = url;
                }
                
                return (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="product-card-link"
                  >
                    <div className="product-icon-box">
                      <span className="shop-icon">🛍️</span>
                    </div>
                    <div className="product-info">
                      <span className="product-title">Product {index + 1}</span>
                      <span className="product-domain">{domain}</span>
                    </div>
                    <span className="arrow-icon">→</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSidebar;
