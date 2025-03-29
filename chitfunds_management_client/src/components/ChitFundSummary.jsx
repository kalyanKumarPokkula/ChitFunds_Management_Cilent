import React from 'react';
import '../styles/ChitFundSummary.css';

const ChitFundSummary = ({ chitCount, paymentOverdues }) => {
	// Calculate total active chits count
	const totalChits = chitCount || 0;

	// Calculate the monthly contribution (sum of all overdues divided by total overdue months)
	const calculateMonthlyContribution = () => {
		if (!paymentOverdues || paymentOverdues.length === 0) return 0;

		let totalAmount = 0;
		let totalMonths = 0;

		paymentOverdues.forEach((overdue) => {
			totalAmount += overdue.total_overdue_amount;
			totalMonths += overdue.overdue_months;
		});

		// If no months, return the total amount (assuming it's the monthly contribution)
		if (totalMonths === 0) return totalAmount;

		// Return average per month
		return Math.round(totalAmount / totalMonths);
	};

	const formatCurrency = (amount) => {
		return `₹${amount.toLocaleString('en-IN')}`;
	};

	const monthlyContribution = calculateMonthlyContribution();

	return (
		<div className="chit-fund-summary-container">
			<h3>Chit Fund Summary</h3>

			<div className="summary-stats">
				<div className="stat-card">
					<span className="stat-label">Total Chits</span>
					<span className="stat-value">{totalChits}</span>
				</div>

				<div className="stat-card">
					<span className="stat-label">Monthly Contribution</span>
					<span className="stat-value">
						{formatCurrency(monthlyContribution)}
					</span>
				</div>
			</div>

			<div className="dues-section">
				<h4>Previous Dues</h4>

				<table className="dues-table">
					<thead>
						<tr>
							<th>Chit Name</th>
							<th>Total Due Amount</th>
							<th>Due Months</th>
							<th>Last Paid Date</th>
						</tr>
					</thead>
					<tbody>
						{paymentOverdues && paymentOverdues.length > 0 ? (
							paymentOverdues.map((overdue, index) => (
								<tr key={`${overdue.chit_group_id}-${index}`}>
									<td>{overdue.chit_name}</td>
									<td className="amount">
										{formatCurrency(overdue.total_overdue_amount)}
									</td>
									<td>{overdue.overdue_months}</td>
									<td>{/* Last Paid Date - Not available in the data */}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="4" className="no-dues">
									No previous dues found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ChitFundSummary;
