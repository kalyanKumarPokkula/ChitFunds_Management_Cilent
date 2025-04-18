import { useState, useEffect } from 'react';
import Modal from './Modal';
import LoadingStatus from './ui/LoadingStatus';
import { useNotification } from '../context/NotificationContext';
import '../styles/RecordPaymentModal.css';

const RecordPaymentModal = ({ isOpen, onClose, onPaymentAdded }) => {
	const [step, setStep] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [userChits, setUserChits] = useState([]);
	const [unpaidInstallments, setUnpaidInstallments] = useState([]);
	const [selectedInstallments, setSelectedInstallments] = useState([]);
	const [totalPaymentAmount, setTotalPaymentAmount] = useState('');
	const [paymentMethods, setPaymentMethods] = useState([
		{ method: 'Cash', amount: '', id: Date.now() },
	]);
	const [referenceNumber, setReferenceNumber] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [remainingAmount, setRemainingAmount] = useState(0);
	const { showSuccess, showError } = useNotification();

	// Fetch users on component mount
	useEffect(() => {
		if (isOpen && step === 1) {
			fetchUsers();
		}
	}, [isOpen]);

	// Update remaining amount when selected installments change
	useEffect(() => {
		if (totalPaymentAmount) {
			const total = selectedInstallments.reduce(
				(sum, inst) => sum + inst.overdue_amount,
				0
			);
			setRemainingAmount(parseInt(totalPaymentAmount) - total);
		}
	}, [selectedInstallments, totalPaymentAmount]);

	// Calculate total payment amount when payment methods change
	useEffect(() => {
		const total = paymentMethods.reduce((sum, method) => {
			return sum + (method.amount ? parseInt(method.amount) : 0);
		}, 0);
		setTotalPaymentAmount(total.toString());
	}, [paymentMethods]);

	// Filter users based on search query
	useEffect(() => {
		if (users.length > 0) {
			const filtered = users.filter(
				(user) =>
					user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					user.phone.includes(searchQuery)
			);
			setFilteredUsers(filtered);
		}
	}, [searchQuery, users]);

	// Fetch all users from API
	const fetchUsers = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch('http://127.0.0.1:5001/users');
			if (!response.ok) {
				throw new Error('Failed to fetch users');
			}
			const data = await response.json();
			setUsers(data.data);
			setFilteredUsers(data.data);
		} catch (err) {
			setError('Error fetching users: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	// Fetch unpaid installments for a specific user
	const fetchUnpaidInstallments = async (userId) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`http://127.0.0.1:5001/get_members_unpaid_installments?user_id=${userId}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch installments');
			}
			const data = await response.json();
			setUnpaidInstallments(data);
		} catch (err) {
			setError('Error fetching installments: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	// Process payment
	const processPayment = async () => {
		setIsSubmitting(true);
		setError(null);
		try {
			// Calculate cash and online payment amounts
			let cashAmount = 0;
			let onlineAmount = 0;
			let onlinePaymentMethod = '';
			let referenceNum = '';

			paymentMethods.forEach((pm) => {
				if (pm.method === 'Cash') {
					cashAmount += parseInt(pm.amount) || 0;
				} else {
					onlineAmount += parseInt(pm.amount) || 0;
					// Use the first online payment method and reference
					if (!onlinePaymentMethod && pm.amount && parseInt(pm.amount) > 0) {
						onlinePaymentMethod = pm.method.toLowerCase();
						referenceNum = pm.reference || '';
					}
				}
			});

			// Format installments for API
			const installments = selectedInstallments.map((inst) => ({
				chit_member_id: inst.chit_member_id,
				installment_id: inst.installment_id.toString(),
			}));

			const payload = {
				cash_amount: cashAmount,
				online_amount: onlineAmount,
				online_payment_method: onlinePaymentMethod,
				total_amount: parseInt(totalPaymentAmount),
				reference_number: referenceNum,
				installments: installments,
			};

			const response = await fetch('http://127.0.0.1:5001/process_payments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error('Failed to process payment');
			}

			// Show success notification
			showSuccess(
				`Payment of ₹${parseInt(
					totalPaymentAmount
				).toLocaleString()} recorded successfully for ${selectedUser.full_name}`
			);

			// Refresh payments data if callback is provided
			if (typeof onPaymentAdded === 'function') {
				onPaymentAdded();
			}

			// Close modal after successful payment
			handleClose();
		} catch (err) {
			setError('Error processing payment: ' + err.message);
			showError(`Failed to record payment: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle user selection
	const handleUserSelect = (user) => {
		setSelectedUser(user);
		setStep(2);
	};

	// Handle payment method change
	const handlePaymentMethodChange = (id, field, value) => {
		setPaymentMethods((prevMethods) =>
			prevMethods.map((method) =>
				method.id === id ? { ...method, [field]: value } : method
			)
		);
	};

	// Add new payment method
	const addPaymentMethod = () => {
		setPaymentMethods([
			...paymentMethods,
			{ method: 'Cash', amount: '', reference: '', id: Date.now() },
		]);
	};

	// Remove payment method
	const removePaymentMethod = (id) => {
		setPaymentMethods((prevMethods) =>
			prevMethods.filter((method) => method.id !== id)
		);
	};

	// Handle next from amount entry
	const handleAmountNext = () => {
		// Check if total payment amount is valid
		if (!totalPaymentAmount || parseInt(totalPaymentAmount) <= 0) {
			setError('Please enter a valid payment amount');
			return;
		}

		// Check if all payment methods have valid amounts
		const invalidPaymentMethod = paymentMethods.find(
			(method) => !method.amount || parseInt(method.amount) <= 0
		);

		if (invalidPaymentMethod) {
			setError('Please enter valid amounts for all payment methods');
			return;
		}

		fetchUnpaidInstallments(selectedUser.user_id);
		setRemainingAmount(parseInt(totalPaymentAmount));
		setStep(3);
	};

	// Handle modal close
	const handleClose = () => {
		setStep(1);
		setSearchQuery('');
		setSelectedUser(null);
		setUnpaidInstallments([]);
		setSelectedInstallments([]);
		setTotalPaymentAmount('');
		setPaymentMethods([{ method: 'Cash', amount: '', id: Date.now() }]);
		setReferenceNumber('');
		setRemainingAmount(0);
		onClose();
	};

	// Handle installment selection
	const handleInstallmentToggle = (chitGroup, installment) => {
		const isSelected = selectedInstallments.some(
			(item) =>
				item.installment_id.toString() === installment.installment_id.toString()
		);

		if (isSelected) {
			// Remove this installment
			setSelectedInstallments(
				selectedInstallments.filter(
					(item) =>
						item.installment_id.toString() !==
						installment.installment_id.toString()
				)
			);
		} else {
			// Add this installment with chit information
			setSelectedInstallments([
				...selectedInstallments,
				{
					...installment,
					chit_name: chitGroup.chit_name,
					chit_member_id: chitGroup.chit_member_id,
				},
			]);
		}
	};

	// Continue to payment summary
	const handleContinueToSummary = () => {
		if (selectedInstallments.length === 0) {
			setError('Please select at least one installment to pay');
			return;
		}
		setError(null);
		setStep(4);
	};

	// Render modal title based on current step
	const renderTitle = () => {
		switch (step) {
			case 1:
				return 'Record Payment';
			case 2:
				return 'Payment Amount';
			case 3:
				return 'Select Installments to Pay';
			case 4:
				return 'Payment Summary';
			case 5:
				return 'Record Payment';
			default:
				return 'Record Payment';
		}
	};

	// Check if an installment is already selected
	const isInstallmentSelected = (installmentId) => {
		return selectedInstallments.some(
			(item) => item.installment_id.toString() === installmentId.toString()
		);
	};

	// Render modal content based on current step
	const renderContent = () => {
		if (error) {
			return (
				<>
					<div className="error">{error}</div>
					{renderStepContent()}
				</>
			);
		}

		return renderStepContent();
	};

	const renderStepContent = () => {
		switch (step) {
			case 1:
				return (
					<div className="search-user-container">
						<div className="search-input-wrapper">
							<i className="fas fa-search search-icon"></i>
							<input
								type="text"
								placeholder="Search member by name or phone..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="search-input"
							/>
						</div>
						{loading ? (
							<LoadingStatus message="Loading users...." />
						) : (
							<div className="users-list">
								{filteredUsers.map((user) => (
									<div
										key={user.user_id}
										className="user-item"
										onClick={() => handleUserSelect(user)}
									>
										<div className="user-name">{user.full_name}</div>
										<div className="user-phone">+91 {user.phone}</div>
									</div>
								))}
								{filteredUsers.length === 0 && (
									<div className="no-results">No users found</div>
								)}
							</div>
						)}
					</div>
				);
			case 2:
				return (
					<div className="payment-amount-container">
						<div className="selected-user">
							<div className="user-info">
								<div className="user-name">{selectedUser?.full_name}</div>
								<div className="user-phone">+91 {selectedUser?.phone}</div>
							</div>
							<button className="change-button" onClick={() => setStep(1)}>
								<i className="fas fa-times"></i> Change
							</button>
						</div>

						<div className="payment-methods-form">
							<div className="payment-methods-header">
								<div className="section-title">Payment Methods</div>
								<div className="payment-total-display">
									Total: ₹{parseInt(totalPaymentAmount || 0).toLocaleString()}
								</div>
							</div>

							<div className="payment-methods-list">
								{paymentMethods.map((method, index) => (
									<div key={method.id} className="payment-method-row">
										<div className="payment-method-select-container">
											<select
												value={method.method}
												onChange={(e) =>
													handlePaymentMethodChange(
														method.id,
														'method',
														e.target.value
													)
												}
												className="payment-method-select"
											>
												<option value="Cash">Cash</option>
												<option value="UPI/GPay">UPI/GPay</option>
												<option value="UPI/PhonePay">UPI/PhonePay</option>
												<option value="UPI/Paytm">UPI/Paytm</option>
												<option value="Cheque">Cheque</option>
											</select>
										</div>

										<div className="payment-amount-container">
											<input
												type="text"
												value={method.amount}
												onChange={(e) =>
													handlePaymentMethodChange(
														method.id,
														'amount',
														e.target.value.replace(/[^0-9]/g, '')
													)
												}
												placeholder="Enter amount"
												className="payment-amount-input"
											/>
										</div>

										{method.method !== 'Cash' && (
											<div className="payment-reference-container">
												<input
													type="text"
													value={method.reference || ''}
													onChange={(e) =>
														handlePaymentMethodChange(
															method.id,
															'reference',
															e.target.value
														)
													}
													placeholder="Reference #"
													className="payment-reference-input"
												/>
											</div>
										)}

										{paymentMethods.length > 1 && (
											<button
												className="remove-payment-method"
												onClick={() => removePaymentMethod(method.id)}
											>
												<i className="fas fa-times"></i>
											</button>
										)}
									</div>
								))}
							</div>

							<button className="add-payment-method" onClick={addPaymentMethod}>
								<i className="fas fa-plus"></i> Add Payment Method
							</button>

							<div className="nav-buttons">
								<button className="back-button" onClick={() => setStep(1)}>
									<i className="fas fa-arrow-left"></i> Back
								</button>
								<button
									className="continue-button"
									onClick={handleAmountNext}
									disabled={
										!totalPaymentAmount || parseInt(totalPaymentAmount) <= 0
									}
								>
									Continue <i className="fas fa-arrow-right"></i>
								</button>
							</div>
						</div>
					</div>
				);
			case 3:
				return (
					<div className="select-installments-container">
						<div className="selected-user">
							<div className="user-info">
								<div className="user-name">{selectedUser?.full_name}</div>
								<div className="payment-info">
									Payment: ₹{parseInt(totalPaymentAmount).toLocaleString()}
								</div>
							</div>
							<button className="change-button" onClick={() => setStep(1)}>
								<i className="fas fa-times"></i> Change
							</button>
						</div>

						<div className="select-installments-header">
							<div className="section-title">Select Installments to Pay</div>
							<div className="remaining-amount">
								Remaining: ₹{remainingAmount.toLocaleString()}
							</div>
						</div>

						{loading ? (
							<LoadingStatus message="Loading installments..." />
						) : (
							<div className="chit-groups-installments">
								{unpaidInstallments.length > 0 ? (
									unpaidInstallments.map((chitGroup) => (
										<div
											key={chitGroup.chit_group_id}
											className="chit-group-section"
										>
											<div className="chit-group-header">
												<span>{chitGroup.chit_name}</span>
												{chitGroup.unpaid_installments.some((inst) =>
													isInstallmentSelected(inst.installment_id)
												) && (
													<button
														className="close-button"
														onClick={() => {
															setSelectedInstallments(
																selectedInstallments.filter(
																	(item) =>
																		!chitGroup.unpaid_installments.some(
																			(unpaid) =>
																				unpaid.installment_id.toString() ===
																				item.installment_id.toString()
																		)
																)
															);
														}}
													>
														<i className="fas fa-times"></i>
													</button>
												)}
											</div>

											<div className="installments-table">
												<div className="installments-header">
													<div className="column month">Month</div>
													<div className="column other-amount">
														Total Amount
													</div>
													<div className="column other-amount">Paid Amount</div>
													<div className="column amount">Due Amount</div>
													<div className="column status">Status</div>
												</div>
												<div className="installments-body">
													{chitGroup.unpaid_installments.map((installment) => (
														<div
															key={installment.installment_id}
															className={`installment-row ${
																isInstallmentSelected(
																	installment.installment_id
																)
																	? 'selected'
																	: ''
															}`}
															onClick={() =>
																handleInstallmentToggle(chitGroup, installment)
															}
														>
															<div className="column month">
																{isInstallmentSelected(
																	installment.installment_id
																) && (
																	<i className="fas fa-check check-icon"></i>
																)}
																Month {installment.month_number}
															</div>
															<div className="column other-amount">
																₹{installment.total_amount.toLocaleString()}
															</div>
															<div className="column other-amount">
																₹{installment.paid_amount.toLocaleString()}
															</div>
															<div className="column amount">
																₹{installment.overdue_amount.toLocaleString()}
															</div>
															<div className="column status">
																<span className="status-badge unpaid">
																	{installment.status}
																</span>
															</div>
														</div>
													))}
												</div>
											</div>
										</div>
									))
								) : (
									<div className="no-results">No unpaid installments found</div>
								)}

								{selectedInstallments.length > 0 && (
									<div className="payment-summary">
										<div className="payment-total">
											<span>
												Selected: {selectedInstallments.length} installments
											</span>
											<span>
												Total: ₹
												{selectedInstallments
													.reduce((sum, inst) => sum + inst.overdue_amount, 0)
													.toLocaleString()}
											</span>
										</div>
										<div className="nav-buttons">
											<button
												className="back-button"
												onClick={() => setStep(2)}
											>
												<i className="fas fa-arrow-left"></i> Back
											</button>
											<button
												className="continue-button"
												onClick={handleContinueToSummary}
												disabled={selectedInstallments.length === 0}
											>
												Continue <i className="fas fa-arrow-right"></i>
											</button>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				);
			case 4:
				return (
					<div className="payment-summary-container">
						<div className="selected-user">
							<div className="user-info">
								<div className="user-name">{selectedUser?.full_name}</div>
								<div className="payment-info">
									Payment: ₹{parseInt(totalPaymentAmount).toLocaleString()}
								</div>
							</div>
							<button className="change-button" onClick={() => setStep(1)}>
								<i className="fas fa-times"></i> Change
							</button>
						</div>

						<div className="payment-summary-section">
							<div className="section-title">Payment Summary</div>

							<div className="summary-details">
								<div className="summary-row">
									<div className="summary-label">Total Installments:</div>
									<div className="summary-value">
										{selectedInstallments.length}
									</div>
								</div>
								<div className="summary-row">
									<div className="summary-label">Chit Schemes:</div>
									<div className="summary-value">
										{
											new Set(
												selectedInstallments.map((inst) => inst.chit_name)
											).size
										}
									</div>
								</div>
								<div className="summary-row">
									<div className="summary-label">Payment Amount:</div>
									<div className="summary-value">
										₹{parseInt(totalPaymentAmount).toLocaleString()}
									</div>
								</div>
								<div className="summary-row">
									<div className="summary-label">Applied to Installments:</div>
									<div className="summary-value">
										₹
										{selectedInstallments
											.reduce((sum, inst) => sum + inst.overdue_amount, 0)
											.toLocaleString()}
									</div>
								</div>
								<div className="summary-row">
									<div className="summary-label">Remaining Amount:</div>
									<div className="summary-value">
										₹{remainingAmount.toLocaleString()}
									</div>
								</div>
							</div>
						</div>

						<div className="payment-methods-section">
							<div className="section-title">Payment Methods</div>

							<div className="payment-methods-summary">
								{paymentMethods.map((method, index) => (
									<div key={method.id} className="payment-method-summary-row">
										<div className="payment-method-name">{method.method}</div>
										<div className="payment-method-amount">
											₹{parseInt(method.amount).toLocaleString()}
										</div>
										{method.method !== 'Cash' && method.reference && (
											<div className="payment-method-reference">
												Ref: {method.reference}
											</div>
										)}
									</div>
								))}
							</div>
						</div>

						<div className="nav-buttons payment-action-buttons">
							<button className="back-button" onClick={() => setStep(3)}>
								<i className="fas fa-arrow-left"></i> Back
							</button>
							<button
								className="record-payment-button"
								onClick={processPayment}
								disabled={isSubmitting || selectedInstallments.length === 0}
							>
								{isSubmitting ? (
									<>
										<i className="fas fa-spinner fa-spin"></i> Processing...
									</>
								) : (
									<>
										<i className="fas fa-money-bill-wave"></i> Record Payment
									</>
								)}
							</button>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={renderTitle()}
			size="medium"
			closeOnOverlayClick={false}
		>
			{renderContent()}
			{step === 1 && (
				<div className="modal-custom-footer">
					<button className="cancel-button" onClick={handleClose}>
						Cancel
					</button>
				</div>
			)}
		</Modal>
	);
};

export default RecordPaymentModal;
