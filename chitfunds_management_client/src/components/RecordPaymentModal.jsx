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
	const [selectedChit, setSelectedChit] = useState(null);
	const [installments, setInstallments] = useState([]);
	const [selectedInstallments, setSelectedInstallments] = useState([]);
	const [paymentAmount, setPaymentAmount] = useState(0);
	const [paymentMethod, setPaymentMethod] = useState('NEFT');
	const [referenceNumber, setReferenceNumber] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { showSuccess, showError } = useNotification();

	// Fetch users on component mount
	useEffect(() => {
		if (isOpen && step === 1) {
			fetchUsers();
		}
	}, [isOpen]);

	// Calculate total payment amount when selected installments change
	useEffect(() => {
		const total = selectedInstallments.reduce((sum, id) => {
			const installment = installments.find(
				(inst) => inst.installment_id.toString() === id.toString()
			);
			return sum + (installment ? installment.total_amount : 0);
		}, 0);
		setPaymentAmount(total);
	}, [selectedInstallments, installments]);

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

	// Fetch chits for a specific user
	const fetchUserChits = async (userId) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`http://127.0.0.1:5001/get_chit_groups_by_user_id?user_id=${userId}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch chits');
			}
			const data = await response.json();
			setUserChits(data);
		} catch (err) {
			setError('Error fetching chits: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	// Fetch installments for a specific chit member
	const fetchInstallments = async (chitMemberId) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`http://127.0.0.1:5001/get_members_unpaid_installments?chit_member_id=${chitMemberId}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch installments');
			}
			const data = await response.json();
			setInstallments(data);
			setSelectedInstallments([]);
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
			const payload = {
				chit_member_id: selectedChit.chit_member_id,
				installment_ids: selectedInstallments,
				payment_amount: paymentAmount,
				payment_method: paymentMethod.toLowerCase(),
				reference_number: referenceNumber || paymentMethod.toLowerCase(),
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
				`Payment of ₹${paymentAmount.toLocaleString()} recorded successfully for ${
					selectedUser.full_name
				}`
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
		fetchUserChits(user.user_id);
		setStep(2);
	};

	// Handle chit selection
	const handleChitSelect = (chit) => {
		setSelectedChit(chit);
		fetchInstallments(chit.chit_member_id);
		setStep(3);
	};

	// Handle modal close
	const handleClose = () => {
		setStep(1);
		setSearchQuery('');
		setSelectedUser(null);
		setSelectedChit(null);
		setInstallments([]);
		setSelectedInstallments([]);
		setPaymentAmount(0);
		setPaymentMethod('NEFT');
		setReferenceNumber('');
		onClose();
	};

	// Handle installment selection toggle
	const handleInstallmentToggle = (installmentId) => {
		const id = installmentId.toString();
		if (selectedInstallments.includes(id)) {
			setSelectedInstallments(selectedInstallments.filter((i) => i !== id));
		} else {
			setSelectedInstallments([...selectedInstallments, id]);
		}
	};

	// Continue to payment details
	const handleContinueToPayment = () => {
		if (selectedInstallments.length === 0) {
			setError('Please select at least one installment to pay');
			return;
		}
		setError(null);
		setStep(4);
	};

	// Handle payment amount change
	const handlePaymentAmountChange = (e) => {
		const value = parseInt(e.target.value) || 0;
		setPaymentAmount(value);
	};

	// Handle user change in step 2, 3, or 4
	const handleUserChange = () => {
		setStep(1);
		setSelectedUser(null);
		setSelectedChit(null);
		setInstallments([]);
		setSelectedInstallments([]);
	};

	// Handle chit change in step 3 or 4
	const handleChitChange = () => {
		setStep(2);
		setSelectedChit(null);
		setInstallments([]);
		setSelectedInstallments([]);
	};

	// Render modal title based on current step
	const renderTitle = () => {
		switch (step) {
			case 1:
				return 'Record Payment';
			case 2:
				return 'Select Chit Scheme';
			case 3:
				return 'Select Installments to Pay';
			case 4:
				return 'Record Payment';
			default:
				return 'Record Payment';
		}
	};

	// Render modal content based on current step
	const renderContent = () => {
		if (error) {
			return <div className="error">{error}</div>;
		}

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
					<div className="select-chit-container">
						<div className="selected-user">
							<div className="user-info">
								<div className="user-name">
									<h3>{selectedUser?.full_name}</h3>
									<span>{selectedUser?.phone}</span>
								</div>
							</div>
							<button className="change-button" onClick={handleUserChange}>
								<i className="fas fa-times"></i> Change
							</button>
						</div>
						<div className="section-title">Select Chit Scheme</div>
						{loading ? (
							<LoadingStatus message="Loading Chits..." />
						) : (
							<div className="chits-list">
								{userChits.length > 0 ? (
									userChits.map((chit) => (
										<div
											key={chit.chit_member_id}
											className="chit-item"
											onClick={() => handleChitSelect(chit)}
										>
											<div className="chit-name">
												{chit.chit_name} {chit.chit_amount / 100000}L
											</div>
											<div className="chit-amount">
												Monthly Payment: ₹
												{(chit.chit_amount / 12).toLocaleString()}
											</div>
										</div>
									))
								) : (
									<div className="no-results">
										No chit schemes found for this user
									</div>
								)}
							</div>
						)}
					</div>
				);
			case 3:
				return (
					<div className="select-installments-container">
						<div className="selected-user">
							<div className="user-info">
								<div className="user-name">{selectedUser?.full_name}</div>
								<div className="user-details">
									{selectedChit?.chit_name} {selectedChit?.chit_amount / 100000}
									L
								</div>
							</div>
							<button className="change-button" onClick={handleUserChange}>
								<i className="fas fa-times"></i> Change
							</button>
						</div>
						<div className="section-title">Select Installments to Pay</div>
						{loading ? (
							<LoadingStatus message="Loading Installments..." />
						) : (
							<>
								<div className="installments-table">
									<div className="installments-header">
										<div className="column month">Month</div>
										<div className="column amount">Amount</div>
										<div className="column status">Status</div>
									</div>
									<div className="installments-body">
										{installments.length > 0 ? (
											installments.map((installment) => (
												<div
													key={installment.installment_id}
													className={`installment-row ${
														selectedInstallments.includes(
															installment.installment_id.toString()
														)
															? 'selected'
															: ''
													}`}
													onClick={() =>
														handleInstallmentToggle(installment.installment_id)
													}
												>
													<div className="column month">
														{selectedInstallments.includes(
															installment.installment_id.toString()
														) && <i className="fas fa-check check-icon"></i>}
														Month {installment.month_number}
													</div>
													<div className="column amount">
														₹{installment.total_amount.toLocaleString()}
													</div>
													<div className="column status">
														<span className="status-badge unpaid">
															{installment.status}
														</span>
													</div>
												</div>
											))
										) : (
											<div className="no-results">
												No unpaid installments found
											</div>
										)}
									</div>
								</div>
								{installments.length > 0 && (
									<div className="payment-summary">
										<div className="payment-total">
											<span>
												Selected: {selectedInstallments.length} installments
											</span>
											<span>Total: ₹{paymentAmount.toLocaleString()}</span>
										</div>
										<div className="continue-button-container">
											<button
												className="continue-button"
												onClick={handleContinueToPayment}
												disabled={selectedInstallments.length === 0}
											>
												Continue to Payment
											</button>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				);
			case 4:
				return (
					<div className="payment-details-container">
						<div className="selected-user">
							<div className="user-info">
								<div className="user-name">{selectedUser?.full_name}</div>
								<div className="user-details">
									{selectedChit?.chit_name} {selectedChit?.chit_amount / 100000}
									L
								</div>
							</div>
							<button className="change-button" onClick={handleUserChange}>
								<i className="fas fa-times"></i> Change
							</button>
						</div>

						<div className="payment-form">
							<div className="form-group">
								<label htmlFor="payment-amount">Payment Amount (₹)</label>
								<input
									type="number"
									id="payment-amount"
									value={paymentAmount}
									onChange={handlePaymentAmountChange}
									className="payment-input"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="payment-method">Payment Method</label>
								<div className="payment-method-dropdown">
									<select
										id="payment-method"
										value={paymentMethod}
										onChange={(e) => setPaymentMethod(e.target.value)}
										className="payment-select"
									>
										<option value="NEFT">NEFT</option>
										<option value="IMPS">IMPS</option>
										<option value="UPI">UPI</option>
										<option value="Cash">Cash</option>
										<option value="Cheque">Cheque</option>
									</select>
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="reference-number">Reference Number</label>
								<input
									type="text"
									id="reference-number"
									value={referenceNumber}
									onChange={(e) => setReferenceNumber(e.target.value)}
									placeholder="Enter reference number"
									className="payment-input"
								/>
							</div>
						</div>

						<div className="payment-action-buttons">
							<button
								className="cancel-button"
								onClick={handleClose}
								disabled={isSubmitting}
							>
								Cancel
							</button>
							<button
								className="record-payment-button"
								onClick={processPayment}
								disabled={isSubmitting || paymentAmount <= 0}
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
			{step < 4 && (
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
