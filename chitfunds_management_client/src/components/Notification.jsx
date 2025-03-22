import React from 'react';
import '../styles/Notification.css'; // Create a CSS file for styling

const Notification = ({ message, type, onClose }) => {
	return (
		<div className={`notification ${type}`} onClick={onClose}>
			<p>{message}</p>
		</div>
	);
};

export default Notification;
