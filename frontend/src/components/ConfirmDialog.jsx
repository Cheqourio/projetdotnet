const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Supprimer', cancelText = 'Annuler' }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h3 className="confirm-title">{title}</h3>
        <div className="confirm-message">{message}</div>

        <div className="confirm-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button type="button" className="button danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
