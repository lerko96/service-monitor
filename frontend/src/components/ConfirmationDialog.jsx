import React from 'react';

function ConfirmationDialog({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm, 
  onCancel,
  isDestructive = false
}) {
  if (!isOpen) return null;

  return (
    <div className="confirmation-dialog-overlay" onClick={onCancel}>
      <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirmation-dialog-actions">
          <button 
            className="cancel"
            onClick={onCancel}
            autoFocus={!isDestructive}
          >
            {cancelLabel}
          </button>
          <button 
            className={`confirm ${isDestructive ? 'destructive' : ''}`}
            onClick={onConfirm}
            autoFocus={isDestructive}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog; 