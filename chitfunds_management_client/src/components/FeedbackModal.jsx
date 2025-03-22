import React from 'react';
import ActionButton from './ActionButton';
import '../styles/Modal.css';

const FeedbackModal = ({ isOpen, onClose, message }) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-container" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Feedback</h2>
					<button className="close-button" onClick={onClose}>
						<i className="fas fa-times"></i>
					</button>
				</div>

				<div className="modal-content">
					<p>{message}</p>
				</div>

				<div className="modal-footer">
					<ActionButton label="OK" variant="primary" onClick={onClose} />
				</div>
			</div>
		</div>
	);
};

export default FeedbackModal;
