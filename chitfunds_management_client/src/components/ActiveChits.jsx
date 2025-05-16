import React, { useState } from 'react';
import ActionButton from './ActionButton';
import MemberPaymentHistoryModal from './MemberPaymentHistoryModal';
import '../styles/ActiveChits.css';

const ActiveChits = ({ currentMonthPayments }) => {

	
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const monthNames = [
		  'January', 'February', 'March', 'April', 'May', 'June',
		  'July', 'August', 'September', 'October', 'November', 'December'
		];
		const currentMonthIndex = new Date().getMonth(); // 0-11
		return monthNames[currentMonthIndex];
	});
	const [selectedChit, setSelectedChit] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const formatCurrency = (amount) => {
		return `₹${parseInt(amount).toLocaleString('en-IN')}`;
	};

	const handleChitClick = (chit) => {
		setSelectedChit(chit);
		setIsModalOpen(true);
	};

	return (
		<div className="active-chits-container">
			<div className="active-chits-header">
				<h3>Active Chits</h3>
				<div className="month-selector">
					<i className="fas fa-calendar"></i>
					<select
						value={selectedMonth}
						onChange={(e) => setSelectedMonth(e.target.value)}
					>
						<option value="January">January</option>
						<option value="February">February</option>
						<option value="March">March</option>
						<option value="April">April</option>
						<option value="May">May</option>
						<option value="June">June</option>
						<option value="July">July</option>
						<option value="August">August</option>
						<option value="September">September</option>
						<option value="October">October</option>
						<option value="November">November</option>
						<option value="December">December</option>
					</select>
				</div>
			</div>

			<div className="active-chits-list">
				{currentMonthPayments && currentMonthPayments.length > 0 ? (
					currentMonthPayments.map((chit, index) => (
						<div
							key={`${chit.chit_group_id}-${index}`}
							className="active-chit-card clickable"
							onClick={() => handleChitClick(chit)}
							title="Click to view payment history"
						>
							<div className="chit-info">
								<div className="chit-title">
									<h4>{chit.chit_name}</h4>
									<span className="chit-number">#{index + 1}</span>
								</div>

								<div className="payment-info">
									<div className="payment-amount">
										<span className="label">Monthly Payment:</span>
										<span className="amount">
											{formatCurrency(chit.total_amount)}
										</span>
									</div>

									<div className="payment-status">
										<span className="label">{selectedMonth} Status:</span>
										<span className={`status-pill ${chit.status.toLowerCase()}`}>
											{chit.status.toUpperCase()}
											</span>
				
									</div>
								</div>
							</div>

							{chit.status_x === 'unpaid' && (
								<div className="payment-actions">
									<ActionButton
										label="Pay Now"
										icon="money-bill-wave"
										variant="primary"
										onClick={(e) => {
											e.stopPropagation(); // Prevent card click
											console.log('Pay now for', chit.chit_name);
										}}
									/>
								</div>
							)}
						</div>
					))
				) : (
					<div className="no-chits-message">
						<i className="fas fa-info-circle"></i>
						<p>No active chits found for this month</p>
					</div>
				)}
			</div>

			{/* Payment History Modal */}
			<MemberPaymentHistoryModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				memberData={selectedChit}
				chitName={selectedChit?.chit_name}
			/>
		</div>
	);
};

export default ActiveChits;
