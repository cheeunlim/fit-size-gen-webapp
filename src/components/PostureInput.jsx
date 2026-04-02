import React from 'react';

const PostureInput = ({ value, onChange }) => {
  return (
    <div className="section posture-section">
      <div className="section-header">
        <h2>2. Posture Description</h2>
        <p className="subtitle">Guide the model's pose. The same pose will be used across all uploaded models to ensure a fair comparison of fit and size.</p>
      </div>
      <div className="input-control">
        <textarea
          placeholder="Describe the desired pose (e.g., 'Walking towards camera, hands in pockets')..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="premium-textarea"
        />
      </div>
    </div>
  );
};

export default PostureInput;
