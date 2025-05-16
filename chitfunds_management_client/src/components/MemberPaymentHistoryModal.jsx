import { useState, useEffect } from 'react';
import Modal from './Modal';
import LoadingStatus from './ui/LoadingStatus';
import '../styles/MemberPaymentHistoryModal.css';

const MemberPaymentHistoryModal = ({
	isOpen,
	onClose,
	memberData,
	chitName,
}) => {
	const [installments, setInstallments] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (isOpen && memberData) {
			fetchMemberInstallments();
		}
	}, [isOpen, memberData]);

	const fetchMemberInstallments = async () => {
		if (!memberData) return;

		try {
			setIsLoading(true);
			setError(null);

			// Use the chit_member_id if available, otherwise fall back to user_id
			const memberId = memberData.chit_member_id;

			console.log('Fetching installments for member ID:', memberId);

			if (!memberId) {
				console.error('Missing chit_member_id in memberData:', memberData);
				throw new Error('Missing member ID required for fetching installments');
			}

			const response = await fetch(
				`http://127.0.0.1:5001/get_chit_group_member_installments?chit_member_id=${memberId}`
			);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('API error response:', errorText);
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();
			console.log('API response:', result);

			// The API returns an array directly, not wrapped in a data property
			setInstallments(Array.isArray(result) ? result : []);
		} catch (error) {
			console.error('Error fetching member installments:', error);
			setError('Failed to load installment history. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const formatCurrency = (amount) => {
		if (!amount) return '₹0';
		const numAmount = parseFloat(amount);
		return `₹${numAmount.toLocaleString('en-IN')}`;
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Format month name and year
	const formatMonth = (dateString) => {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				month: 'long',
				year: 'numeric',
			});
		} catch (e) {
			return 'N/A';
		}
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`${memberData?.full_name || ''} ${
				chitName || ''
			} - Payment History`}
			size="small"
		>
			<div className="payment-history-modal-content">
				{isLoading ? (
					<LoadingStatus message="Loading payment history..." />
				) : error ? (
					<div className="error-message">{error}</div>
				) : (
					<table className="payment-history-table">
						<thead>
							<tr>
								<th>MONTH</th>
								<th>AMOUNT</th>
								<th>PAID AMOUNT</th>
								<th>STATUS</th>
								<th>PAID ON</th>
							</tr>
						</thead>
						<tbody>
							{installments.length === 0 ? (
								<tr>
									<td colSpan="4" className="no-data">
										No payment history found
									</td>
								</tr>
							) : (
								installments.map((item, index) => (
									<tr key={index}>
										<td>{formatMonth(item.due_date)}</td>
										<td>{formatCurrency(item.total_amount)}</td>
										<td>{formatCurrency(item.paid_amount)}</td>
										<td>
											<span className={`status-pill ${item.status?.toLowerCase()}`}>
												{{
													'PAID': 'PAID',
													'PARTIAL': 'PARTIAL',
													'UNPAID': 'UNPAID'
												}[item.status] || 'UNPAID'}
											</span>
										</td>
										<td>
											{item.payment_date ? formatDate(item.payment_date) : '-'}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				)}
			</div>
		</Modal>
	);
};

export default MemberPaymentHistoryModal;
