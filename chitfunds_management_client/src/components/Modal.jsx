import React from 'react';
import '../styles/Modal.css';

/**
 * Reusable Modal component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Content to render in the modal body
 * @param {React.ReactNode} props.footer - Content to render in the modal footer
 * @param {string} props.size - Modal size (small, medium, large)
 * @param {boolean} props.closeOnOverlayClick - Whether to close the modal when clicking the overlay
 */
const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	footer,
	size = 'medium',
	closeOnOverlayClick = true,
}) => {
	if (!isOpen) return null;

	const handleOverlayClick = (e) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose();
		}
	};

	const sizeClass = `modal-container-${size}`;

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div
				className={`modal-container ${sizeClass} w-full`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>{title}</h2>
					<button className="close-button" onClick={onClose} type="button">
						<i className="fas fa-times"></i>
					</button>
				</div>

				<div className="modal-content">{children}</div>

				{footer && <div className="modal-footer">{footer}</div>}
			</div>
		</div>
	);
};

export default Modal;
