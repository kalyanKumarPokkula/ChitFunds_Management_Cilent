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
					<p>
						Are you sure you want to delete this chit? This action cannot be
						undone.
					</p>
				</div>

				<div className="modal-footer">
					<ActionButton label="Cancel" variant="secondary" onClick={onClose} />
					<ActionButton label="Delete" variant="danger" onClick={onConfirm} />
				</div>
			</div>
		</div>
	);
};

export default DeleteConfirmationModal;
