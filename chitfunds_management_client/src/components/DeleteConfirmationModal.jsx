import React from 'react';
import ActionButton from './ActionButton';
import '../styles/Modal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-container" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Confirm Deletion</h2>
					<button className="close-button" onClick={onClose}>
						<i className="fas fa-times"></i>
					</button>
				</div>

				<div className="modal-content">
					<div className="confirmation-message">
						<i className="fas fa-exclamation-triangle warning-icon"></i>
						<div>
							<h3>Are you sure you want to delete this chit?</h3>
							<p>
								This action cannot be undone. All associated data including
								members and payment records will be permanently removed.
							</p>
						</div>
					</div>
				</div>

				<div className="modal-footer">
					<ActionButton label="Cancel" variant="secondary" onClick={onClose} />
					<ActionButton
						label="Delete"
						variant="danger"
						icon="trash"
						onClick={onConfirm}
					/>
				</div>
			</div>
		</div>
	);
};

export default DeleteConfirmationModal;
