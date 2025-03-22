import React from 'react';
import ActionButton from './ActionButton';
import Modal from './Modal';
import '../styles/Modal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
	const modalFooter = (
		<>
			<ActionButton label="Cancel" variant="secondary" onClick={onClose} />
			<ActionButton
				label="Delete"
				variant="danger"
				icon="trash"
				onClick={onConfirm}
			/>
		</>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Confirm Deletion"
			footer={modalFooter}
			size="small"
		>
			<div className="confirmation-message">
				<i className="fas fa-exclamation-triangle warning-icon"></i>
				<div>
					<h3>Are you sure you want to delete this chit?</h3>
					<p>
						This action cannot be undone. All associated data including members
						and payment records will be permanently removed.
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default DeleteConfirmationModal;
