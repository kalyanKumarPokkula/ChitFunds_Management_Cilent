import React from 'react';
import ActionButton from './ActionButton';
import '../styles/ChitCard.css';

const ChitCard = ({ chit, onView }) => {
	const formatCurrency = (amount) => {
		return `₹${parseInt(amount).toLocaleString('en-IN')}`;
	};

	const formatDate = (dateString) => {
		// Extract just the month and year for a cleaner display
		const date = new Date(dateString);
		return date.toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	const getShortDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-IN', {
			month: 'short',
			year: 'numeric',
		});
	};

	const getStatusClass = (status) => {
		switch (status.toLowerCase()) {
			case 'active':
				return 'active';
			case 'upcoming':
				return 'upcoming';
			case 'completed':
				return 'completed';
			default:
				return '';
		}
	};

	return (
		<div className="chit-card">
			<div className="chit-card-header">
				<h3 className="chit-name">{chit.chit_name}</h3>
				<div className="status-badge-container">
					<span className={`status-badge ${getStatusClass(chit.status)}`}>
						{chit.status.charAt(0).toUpperCase() + chit.status.slice(1)}
					</span>
				</div>
			</div>

			<div className="chit-details-layout">
				<div className="chit-value">
					<p>Total Value: {formatCurrency(chit.chit_amount)}</p>
				</div>

				<div className="chit-details-grid">
					<div className="detail-row">
						<div className="detail-icon">
							<i className="fas fa-money-bill-wave"></i>
						</div>
						<div className="detail-value">
							{formatCurrency(chit.monthly_installment)}
						</div>
						<div className="detail-label">monthly</div>
					</div>

					<div className="detail-row">
						<div className="detail-icon">
							<i className="fas fa-users"></i>
						</div>
						<div className="detail-value">{chit.total_members}</div>
						<div className="detail-label">members</div>
					</div>
				</div>

				<div className="chit-details-grid">
					<div className="detail-row">
						<div className="detail-icon">
							<i className="fas fa-calendar-alt"></i>
						</div>
						<div className="detail-value">{chit.duration_months}</div>
						<div className="detail-label">months</div>
					</div>

					<div className="detail-row">
						<div className="detail-icon">
							<i className="fas fa-calendar-check"></i>
						</div>
						<div className="detail-value">Started:</div>
						<div className="detail-label">{getShortDate(chit.start_date)}</div>
					</div>
				</div>

				<div className="chit-end-date">
					<p>End Date: {getShortDate(chit.end_date)}</p>
				</div>

				<div className="chit-card-actions">
					{onView && (
						<ActionButton
							label="Manage"
							icon="cog"
							variant="secondary"
							onClick={() => onView(chit.chit_group_id)}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChitCard;
