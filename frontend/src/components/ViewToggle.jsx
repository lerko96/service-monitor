import React from 'react';

const ViewToggle = ({ viewMode, onViewModeChange, isMobile }) => {
  // Don't show toggle on mobile - always use list view
  if (isMobile) {
    return null;
  }

  return (
    <div className="view-toggle" role="radiogroup" aria-label="View mode selection">
      <button
        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
        onClick={() => onViewModeChange('grid')}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          {/* Grid icon - 4 squares */}
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      <button
        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => onViewModeChange('list')}
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          {/* List icon - horizontal lines */}
          <rect x="3" y="5" width="18" height="2" rx="1" />
          <rect x="3" y="11" width="18" height="2" rx="1" />
          <rect x="3" y="17" width="18" height="2" rx="1" />
        </svg>
      </button>
    </div>
  );
};

export default ViewToggle; 