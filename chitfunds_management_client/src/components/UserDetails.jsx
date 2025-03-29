import React from 'react';
import '../styles/UserDetails.css';

const UserDetails = ({ user, status = 'Active' }) => {
	if (!user) return null;

	const { full_name, phone, email, address, city, state, pincode } = user;

	const fullAddress = `${address}, ${city}, ${state} ${pincode}`;

	return (
		<div className="user-details-container">
			<div className="user-header">
				<h2>{full_name}</h2>
				<span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
			</div>

			<div className="user-info">
				<div className="info-item">
					<i className="fas fa-user"></i>
					<div>
						<span className="info-label">Full Name</span>
						<span className="info-value">{full_name}</span>
					</div>
				</div>

				<div className="info-item">
					<i className="fas fa-phone"></i>
					<div>
						<span className="info-label">Phone</span>
						<span className="info-value">+91 {phone}</span>
					</div>
				</div>

				<div className="info-item">
					<i className="fas fa-envelope"></i>
					<div>
						<span className="info-label">Email</span>
						<span className="info-value">{email}</span>
					</div>
				</div>

				<div className="info-item">
					<i className="fas fa-map-marker-alt"></i>
					<div>
						<span className="info-label">Address</span>
						<span className="info-value">{fullAddress}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserDetails;
