import React from 'react';

function LoadingSpinner({ size = 'medium', overlay = false }) {
  const spinnerClasses = `loading-spinner size-${size}${overlay ? ' with-overlay' : ''}`;
  
  return (
    <div className={spinnerClasses}>
      <div className="spinner"></div>
      {overlay && <div className="overlay"></div>}
    </div>
  );
}

export default LoadingSpinner; 