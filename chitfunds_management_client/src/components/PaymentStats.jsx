import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import '../styles/PaymentStats.css';
import "../styles/Home.css";
import LoadingStatus from './ui/LoadingStatus';

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

			const response = await apiRequest('/get_all_chit_groups_current_month_payment_stats');

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
				<LoadingStatus message="Loading Payments Stats...." />
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
		<>
              

		<div className="key-metrics-grid">
			<div className="metric-card trust">
				<div className="metric-icon">
					<i className="fas fa-money-check-alt"></i>
				</div>
				<div className="metric-content">
					<h3>Total Due This Month</h3>
					<div className="metric-value">
						{formatCurrency(stats.total_due_this_month)}
					</div>
				</div>
			</div>
			<div className="metric-card semi-trust">
				<div className="metric-icon">
					<i className="fas fa-money-bill-wave"></i>
				</div>
				<div className="metric-content">
					<h3>Total Payout Due This Month</h3>
					<div className="metric-value">
						{formatCurrency(stats.unpaid_current_month_projections)}
					</div>
				</div>
			</div>

			<div className="metric-card paid">
				<div className="metric-icon">
					<i className="fas fa-check-circle"></i>
				</div>
				<div className="metric-content">
					<h3>Total Paid This Month</h3>
					<div className="metric-value">
						{formatCurrency(stats.total_paid_this_month)}
						{paidPercentage && (
							<div className="metric-percentage">{paidPercentage}% Collected</div>
						)}
					</div>
				</div>
			</div>

			<div className="metric-card due">
				<div className="metric-icon">
					<i className="fas fa-exclamation-circle"></i>
				</div>
				<div className="metric-content">
					<h3>Unpaid Amount</h3>
					<div className="metric-value">
						{formatCurrency(stats.total_unpaid_this_month)}
						{paidPercentage && (
							<div className="metric-percentage">{100 - paidPercentage}% Pending</div>
						)}
					</div>

				</div>
			</div>
		</div>
		 <div className="collection-progress-section">
                    <div className="progress-header">
                        <span>Collection Progress</span>
                        <span>{paidPercentage}%</span>
                        </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${paidPercentage}%` }}></div>
                    </div>
                                </div>

	</>
	);
};

export default PaymentStats;
