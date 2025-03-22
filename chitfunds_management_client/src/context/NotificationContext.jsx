import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/Notification';

// Create context
const NotificationContext = createContext();

// Generate a unique ID for each notification
const generateId = () =>
	`notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Provider component
export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);

	// Add a notification
	const showNotification = (message, type = 'info', duration = 5000) => {
		const id = generateId();
		const newNotification = { id, message, type, duration };

		setNotifications((prevNotifications) => [
			...prevNotifications,
			newNotification,
		]);

		return id;
	};

	// Helper methods for different notification types
	const showSuccess = (message, duration) =>
		showNotification(message, 'success', duration);
	const showError = (message, duration) =>
		showNotification(message, 'error', duration);
	const showInfo = (message, duration) =>
		showNotification(message, 'info', duration);
	const showWarning = (message, duration) =>
		showNotification(message, 'warning', duration);

	// Remove a notification
	const closeNotification = (id) => {
		setNotifications((prevNotifications) =>
			prevNotifications.filter((notification) => notification.id !== id)
		);
	};

	// Clear all notifications
	const clearNotifications = () => {
		setNotifications([]);
	};

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				showNotification,
				showSuccess,
				showError,
				showInfo,
				showWarning,
				closeNotification,
				clearNotifications,
			}}
		>
			{children}
			<div className="notifications-container">
				{notifications.map((notification) => (
					<Notification
						key={notification.id}
						message={notification.message}
						type={notification.type}
						duration={notification.duration}
						onClose={() => closeNotification(notification.id)}
					/>
				))}
			</div>
		</NotificationContext.Provider>
	);
};

// Hook to use the notification context
export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			'useNotification must be used within a NotificationProvider'
		);
	}
	return context;
};

export default NotificationContext;
