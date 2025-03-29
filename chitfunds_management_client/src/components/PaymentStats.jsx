import { useState, useEffect } from 'react';
import '../styles/PaymentStats.css';

const PaymentStats = () => {
	const [stats, setStats] = useState({
		total_due_this_month: 0,
		total_paid_this_month: 0,
		total_unpaid_this_month: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchPaymentStats();
	}, []);

	const fetchPaymentStats = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(
				'http://127.0.0.1:5001/get_all_chit_groups_current_month_payment_stats'
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();

			if (result.data) {
				setStats(result.data);
			}
		} catch (err) {
			console.error('Error fetching payment stats:', err);
			setError('Failed to load payment statistics');
		} finally {
			setIsLoading(false);
		}
	};

	const formatCurrency = (amount) => {
		return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
	};

	// Calculate percentage of paid amount
	const paidPercentage =
		stats.total_due_this_month > 0
			? Math.round(
					(stats.total_paid_this_month / stats.total_due_this_month) * 100
			  )
			: 0;

	if (isLoading) {
		return (
			<div className="payment-stats-wrapper loading">
				<div className="loading-spinner">
					<i className="fas fa-spinner fa-spin"></i>
					<span>Loading payment statistics...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="payment-stats-wrapper error">
				<div className="error-message">
					<i className="fas fa-exclamation-triangle"></i>
					<span>{error}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="payment-stats-wrapper">
			<div className="payment-stats-container">
				<div className="stats-card trust">
					<div className="stats-icon">
						<i className="fas fa-money-check-alt"></i>
					</div>
					<div className="stats-content">
						<h3>Total Due This Month</h3>
						<div className="stats-amount">
							{formatCurrency(stats.total_due_this_month)}
						</div>
					</div>
				</div>

				<div className="stats-card paid">
					<div className="stats-icon">
						<i className="fas fa-check-circle"></i>
					</div>
					<div className="stats-content">
						<h3>Paid Amount</h3>
						<div className="stats-amount">
							{formatCurrency(stats.total_paid_this_month)}
						</div>
						<div className="stats-percentage">{paidPercentage}% Collected</div>
					</div>
				</div>

				<div className="stats-card due">
					<div className="stats-icon">
						<i className="fas fa-exclamation-circle"></i>
					</div>
					<div className="stats-content">
						<h3>Unpaid Amount</h3>
						<div className="stats-amount">
							{formatCurrency(stats.total_unpaid_this_month)}
						</div>
						<div className="stats-percentage">
							{100 - paidPercentage}% Pending
						</div>
					</div>
				</div>
			</div>

			<div className="payment-progress-container">
				<div className="progress-label">
					<span>Collection Progress</span>
					<span>{paidPercentage}%</span>
				</div>
				<div className="progress-bar">
					<div
						className="progress-fill"
						style={{ width: `${paidPercentage}%` }}
					></div>
				</div>
			</div>
		</div>
	);
};

export default PaymentStats;
