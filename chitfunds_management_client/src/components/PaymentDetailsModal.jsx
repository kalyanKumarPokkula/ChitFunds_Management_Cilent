import React, { useState, useEffect } from 'react';
import '../styles/PaymentDetailsModal.css';

const PaymentDetailsModal = ({ isOpen, onClose, paymentId, userName }) => {
	const [paymentDetails, setPaymentDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (isOpen && paymentId && userName) {
			fetchPaymentDetails();
		}
	}, [isOpen, paymentId, userName]);

	const fetchPaymentDetails = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`http://127.0.0.1:5001/get_payments_details?payment_id=${paymentId}&user_name=${userName}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch payment details');
			}

			const data = await response.json();
			setPaymentDetails(data);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching payment details:', err);
		} finally {
			setLoading(false);
		}
	};

	const handlePrintReceipt = () => {
		if (!paymentDetails) return;

		// Create a new window for printing
		const printWindow = window.open('', '_blank');

		// Create the receipt content
		const receiptContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Payment Receipt - ${paymentDetails.payment_id}</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						margin: 0;
						padding: 20px;
						color: #333;
					}
					.receipt {
						max-width: 800px;
						margin: 0 auto;
						border: 1px solid #ddd;
						padding: 20px;
						border-radius: 8px;
					}
					.header {
						text-align: center;
						margin-bottom: 20px;
						padding-bottom: 15px;
						border-bottom: 2px solid #eaeaea;
					}
					.header h1 {
						margin: 0;
						font-size: 24px;
						color: #2196f3;
					}
					.header p {
						margin: 5px 0 0;
						color: #666;
					}
					.info-grid {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 15px;
						margin-bottom: 25px;
					}
					.info-item {
						margin-bottom: 8px;
					}
					.info-label {
						font-weight: bold;
						color: #666;
						margin-right: 10px;
					}
					.status {
						display: inline-block;
						padding: 5px 12px;
						border-radius: 20px;
						font-weight: bold;
						text-transform: capitalize;
					}
					.status.success {
						background-color: #e8f5e9;
						color: #2e7d32;
					}
					.status.pending {
						background-color: #fff8e1;
						color: #ff8f00;
					}
					.status.failed {
						background-color: #ffebee;
						color: #c62828;
					}
					.table {
						width: 100%;
						border-collapse: collapse;
						margin-top: 20px;
					}
					.table th, .table td {
						padding: 12px 15px;
						text-align: left;
						border-bottom: 1px solid #eaeaea;
					}
					.table th {
						font-weight: bold;
						color: #666;
						background-color: #f9fafb;
					}
					.total-row td {
						border-top: 2px solid #eaeaea;
						font-weight: bold;
					}
					.total-label {
						text-align: right;
					}
					.total-amount {
						color: #2196f3;
					}
					.footer {
						margin-top: 30px;
						text-align: center;
						color: #999;
						font-size: 12px;
					}
					@media print {
						body {
							padding: 0;
						}
						.receipt {
							border: none;
							padding: 0;
						}
						.print-button {
							display: none;
						}
					}
				</style>
			</head>
			<body>
				<div class="receipt">
					<div class="header">
						<h1>ChitFund Manager</h1>
						<p>Payment Receipt</p>
					</div>
					
					<div class="info-grid">
						<div class="info-item">
							<span class="info-label">Payment ID:</span>
							${paymentDetails.payment_id}
						</div>
						<div class="info-item">
							<span class="info-label">Date:</span>
							${formatDate(paymentDetails.payment_date)}
						</div>
						<div class="info-item">
							<span class="info-label">Member:</span>
							${paymentDetails.user_name}
						</div>
						<div class="info-item">
							<span class="info-label">Payment Method:</span>
							${capitalizeFirst(paymentDetails.payment_method)}
						</div>
						<div class="info-item">
							<span class="info-label">Status:</span>
							<span class="status ${paymentDetails.payment_status}">
								${capitalizeFirst(paymentDetails.payment_status)}
							</span>
						</div>
						<div class="info-item">
							<span class="info-label">Total Amount:</span>
							${formatCurrency(paymentDetails.payment_amount)}
						</div>
					</div>
					
					<h2>Installment Details</h2>
					<table class="table">
						<thead>
							<tr>
								<th>Chit Scheme</th>
								<th>Month</th>
								<th>Amount</th>
							</tr>
						</thead>
						<tbody>
							${paymentDetails.installment_details
								.map(
									(installment) => `
								<tr>
									<td>${installment.chit_name}</td>
									<td>Month ${installment.month_number}</td>
									<td>${formatCurrency(installment.paid_amount)}</td>
								</tr>
							`
								)
								.join('')}
							<tr class="total-row">
								<td colspan="2" class="total-label">Total:</td>
								<td class="total-amount">${formatCurrency(paymentDetails.payment_amount)}</td>
							</tr>
						</tbody>
					</table>
					
					<div class="footer">
						<p>Thank you for your payment.</p>
						<p>This is an electronically generated receipt.</p>
					</div>
				</div>
			</body>
			</html>
		`;

		// Write to the new window and print
		printWindow.document.open();
		printWindow.document.write(receiptContent);
		printWindow.document.close();

		// Wait for content to load before printing
		printWindow.onload = function () {
			printWindow.print();
		};
	};

	if (!isOpen) return null;

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});
	};

	const formatCurrency = (amount) => {
		return `₹${Number(amount).toLocaleString('en-IN')}`;
	};

	const capitalizeFirst = (text) => {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	};

	return (
		<div className="modal-overlay">
			<div className="payment-details-modal">
				<div className="modal-header">
					<h2>Payment Details</h2>
					<button className="close-button" onClick={onClose}>
						<i className="fas fa-times"></i>
					</button>
				</div>

				<div className="modal-content">
					{loading ? (
						<div className="loading">Loading payment details...</div>
					) : error ? (
						<div className="error">{error}</div>
					) : paymentDetails ? (
						<>
							<div className="payment-summary">
								<h3>Payment Summary</h3>

								<div className="payment-info-grid">
									<div className="info-item">
										<div className="info-icon">
											<i className="fas fa-calendar"></i>
										</div>
										<div className="info-content">
											<span className="label">Date</span>
											<span className="value">
												{formatDate(paymentDetails.payment_date)}
											</span>
										</div>
									</div>

									<div className="info-item">
										<div className="info-icon">
											<i className="fas fa-user"></i>
										</div>
										<div className="info-content">
											<span className="label">Member</span>
											<span className="value">{paymentDetails.user_name}</span>
										</div>
									</div>
								</div>

								<div className="payment-info-grid">
									<div className="info-item">
										<div className="info-icon">
											<i className="fas fa-rupee-sign"></i>
										</div>
										<div className="info-content">
											<span className="label">Amount</span>
											<span className="value">
												{formatCurrency(paymentDetails.payment_amount)}
											</span>
										</div>
									</div>

									<div className="info-item">
										<div className="info-icon">
											<i className="fas fa-credit-card"></i>
										</div>
										<div className="info-content">
											<span className="label">Payment Method</span>
											<span className="value">
												{capitalizeFirst(paymentDetails.payment_method)}
											</span>
										</div>
									</div>
								</div>

								<div className="payment-info-grid">
									<div className="info-item">
										<div className="info-icon">
											<i className="fas fa-hashtag"></i>
										</div>
										<div className="info-content">
											<span className="label">Reference Number</span>
											<span className="value">{paymentDetails.payment_id}</span>
										</div>
									</div>

									<div className="info-item">
										<div className="info-icon">
											<i className="fas fa-check-circle"></i>
										</div>
										<div className="info-content">
											<span className="label">Status</span>
											<span
												className={`status-value ${paymentDetails.payment_status}`}
											>
												{capitalizeFirst(paymentDetails.payment_status)}
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className="installments-section">
								<h3>Paid Installments</h3>
								<div className="installment-table-container">
									<table className="installment-table">
										<thead>
											<tr>
												<th>Chit Scheme</th>
												<th>Month</th>
												<th>Amount</th>
											</tr>
										</thead>
										<tbody>
											{paymentDetails.installment_details.map(
												(installment, index) => (
													<tr key={index}>
														<td>{installment.chit_name}</td>
														<td>Month {installment.month_number}</td>
														<td>{formatCurrency(installment.paid_amount)}</td>
													</tr>
												)
											)}
										</tbody>
										<tfoot>
											<tr>
												<td colSpan="2" className="total-label">
													Total:
												</td>
												<td className="total-amount">
													{formatCurrency(paymentDetails.payment_amount)}
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						</>
					) : (
						<div className="no-data">No payment details found</div>
					)}
				</div>

				<div className="modal-footer">
					<button className="btn close-btn" onClick={onClose}>
						Close
					</button>
					<button className="btn print-btn" onClick={handlePrintReceipt}>
						Print Receipt
					</button>
				</div>
			</div>
		</div>
	);
};

export default PaymentDetailsModal;
