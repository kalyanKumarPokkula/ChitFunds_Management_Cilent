import React, { useEffect } from 'react';
import '../styles/Notification.css'; // Create a CSS file for styling

const Notification = ({ message, type, onClose, duration = 5000 }) => {
	// Automatically close the notification after duration
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [onClose, duration]);

	// Icon based on notification type
	const getIcon = () => {
		switch (type) {
			case 'success':
				return <i className="fas fa-check-circle"></i>;
			case 'error':
				return <i className="fas fa-exclamation-circle"></i>;
			case 'info':
				return <i className="fas fa-info-circle"></i>;
			case 'warning':
				return <i className="fas fa-exclamation-triangle"></i>;
			default:
				return null;
		}
	};

	return (
		<div className={`notification notification-${type} notification-show`}>
			<div className="notification-icon">{getIcon()}</div>
			<div className="notification-content">
				<p>{message}</p>
			</div>
			<button className="notification-close" onClick={onClose}>
				<i className="fas fa-times"></i>
			</button>
		</div>
	);
};

export default Notification;
