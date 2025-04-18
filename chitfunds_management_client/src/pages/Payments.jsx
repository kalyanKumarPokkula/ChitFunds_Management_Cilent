import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import RecordPaymentModal from '../components/RecordPaymentModal';
import LoadingStatus from '../components/ui/LoadingStatus';
import '../styles/Payments.css';
import { useState, useEffect, useRef } from 'react';

const Payments = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');
	const [chitSchemeFilter, setChitSchemeFilter] = useState('All Schemes');
	const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [originalPayments, setOriginalPayments] = useState([]);
	const [uniqueChitSchemes, setUniqueChitSchemes] = useState([]);
	const startDateInputRef = useRef(null);
	const endDateInputRef = useRef(null);

	useEffect(() => {
		fetchPayments();
	}, []);

	// Extract unique chit schemes when payments data is loaded
	useEffect(() => {
		if (originalPayments.length > 0) {
			const schemes = [
				...new Set(originalPayments.map((payment) => payment.chitScheme)),
			];
			setUniqueChitSchemes(schemes.sort());
		}
	}, [originalPayments]);

	// Filter payments when date range changes
	useEffect(() => {
		if (originalPayments.length > 0) {
			let filteredPayments = [...originalPayments];

			// Apply start date filter if set
			if (startDate) {
				const startDateTime = new Date(startDate);
				startDateTime.setHours(0, 0, 0, 0);

				filteredPayments = filteredPayments.filter((payment) => {
					const paymentDate = new Date(payment.rawDate);
					return paymentDate >= startDateTime;
				});
			}

			// Apply end date filter if set
			if (endDate) {
				const endDateTime = new Date(endDate);
				endDateTime.setHours(23, 59, 59, 999);

				filteredPayments = filteredPayments.filter((payment) => {
					const paymentDate = new Date(payment.rawDate);
					return paymentDate <= endDateTime;
				});
			}

			setPayments(filteredPayments);
		}
	}, [startDate, endDate, originalPayments]);

	const fetchPayments = async () => {
		try {
			setLoading(true);
			const response = await fetch('http://127.0.0.1:5001/get_payments');

			if (!response.ok) {
				throw new Error('Failed to fetch payments');
			}

			const data = await response.json();
			console.log(data);

			// Transform the data to match our UI format
			const transformedData = data.map((payment, index) => ({
				id: payment.payment_id,
				date: formatDate(payment.payment_date),
				rawDate: payment.payment_date, // Store original date for filtering
				member: payment.full_name,
				chitScheme: payment.chit_name,
				amount: formatCurrency(payment.payment_amount),
				paymentMethod: capitalizeFirst(payment.payment_method),
				referenceNo: payment.reference_number,
				status: capitalizeFirst(payment.payment_status),
			}));

			setPayments(transformedData);
			setOriginalPayments(transformedData);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching payments:', err);
		} finally {
			setLoading(false);
		}
	};

	// Helper functions for data formatting
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		});
	};

	const formatCurrency = (amount) => {
		return `₹${amount.toLocaleString('en-IN')}`;
	};

	const capitalizeFirst = (text) => {
		return text.charAt(0).toUpperCase() + text.slice(1);
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleStatusChange = (e) => {
		setStatusFilter(e.target.value);
	};

	const handleChitSchemeChange = (e) => {
		setChitSchemeFilter(e.target.value);
	};

	const handleRecordPaymentClick = () => {
		setShowRecordPaymentModal(true);
	};

	const handleCloseRecordPaymentModal = () => {
		setShowRecordPaymentModal(false);
	};

	const handleStartDateChange = (e) => {
		const newStartDate = e.target.value;
		setStartDate(newStartDate);

		// If end date is set and is before start date, clear end date
		if (endDate && new Date(newStartDate) > new Date(endDate)) {
			setEndDate('');
		}
	};

	const handleEndDateChange = (e) => {
		setEndDate(e.target.value);
	};

	const clearDateFilters = () => {
		setStartDate('');
		setEndDate('');
	};

	const handleFocusStartDateInput = () => {
		if (startDateInputRef.current) {
			startDateInputRef.current.focus();
			startDateInputRef.current.showPicker();
		}
	};

	const handleFocusEndDateInput = () => {
		if (endDateInputRef.current) {
			endDateInputRef.current.focus();
			endDateInputRef.current.showPicker();
		}
	};

	const getDateRangeDisplayText = () => {
		if (startDate && endDate) {
			return `${formatDate(startDate)} to ${formatDate(endDate)}`;
		} else if (startDate) {
			return `From ${formatDate(startDate)}`;
		} else if (endDate) {
			return `Until ${formatDate(endDate)}`;
		}
		return '';
	};

	const filteredPayments = payments.filter((payment) => {
		// Search across all fields
		const matchesSearch = Object.values(payment).some((value) =>
			value.toString().toLowerCase().includes(searchQuery.toLowerCase())
		);

		// Filter by status if not 'All Status'
		const matchesStatus =
			statusFilter === 'All Status' || payment.status === statusFilter;

		// Filter by chit scheme if not 'All Schemes'
		const matchesChitScheme =
			chitSchemeFilter === 'All Schemes' ||
			payment.chitScheme === chitSchemeFilter;
		console.log(chitSchemeFilter);

		return matchesSearch && matchesStatus && matchesChitScheme;
	});

	return (
		<div className="payments-page">
			<Navbar />

			<div className="page-container">
				<div className="page-header">
					<div className="header-left">
						<h1>Payments</h1>
						<p>Manage and track all chit fund payments</p>
					</div>
					<div className="header-right">
						<div className="action-buttons">
							<div className="date-range-container">
								<div className="date-input-wrapper">
									<i className="fas fa-calendar date-input-icon"></i>
									<div className="date-inputs">
										<div
											className="date-input-field"
											onClick={handleFocusStartDateInput}
										>
											<input
												type="date"
												value={startDate}
												onChange={handleStartDateChange}
												className="date-input"
												placeholder="From date"
												ref={startDateInputRef}
												max={endDate || undefined}
											/>
											<span className="date-label">From</span>
										</div>

										<div className="date-input-divider">-</div>

										<div
											className="date-input-field"
											onClick={handleFocusEndDateInput}
										>
											<input
												type="date"
												value={endDate}
												onChange={handleEndDateChange}
												className="date-input"
												placeholder="To date"
												ref={endDateInputRef}
												min={startDate || undefined}
											/>
											<span className="date-label">To</span>
										</div>
									</div>

									{(startDate || endDate) && (
										<button
											className="clear-date-btn"
											onClick={clearDateFilters}
											title="Clear date filters"
										>
											<i className="fas fa-times"></i>
										</button>
									)}
								</div>

								{(startDate || endDate) && (
									<div className="selected-date-display">
										Showing payments for: {getDateRangeDisplayText()}
									</div>
								)}
							</div>

							<ActionButton
								label="Export"
								icon="file-export"
								variant="outline"
							/>
							<ActionButton
								label="Record Payment"
								icon="plus"
								variant="primary"
								onClick={handleRecordPaymentClick}
							/>
						</div>
					</div>
				</div>

				<div className="filters-bar">
					<div className="search-box">
						<i className="fas fa-search search-icon"></i>
						<input
							type="text"
							placeholder="Search payments..."
							value={searchQuery}
							onChange={handleSearchChange}
						/>
					</div>
					<div className="filter-group">
						<div className="status-filter">
							<select value={statusFilter} onChange={handleStatusChange}>
								<option>All Status</option>
								<option>Success</option>
								<option>Pending</option>
								<option>Failed</option>
							</select>
						</div>
						<div className="scheme-filter">
							<select
								value={chitSchemeFilter}
								onChange={handleChitSchemeChange}
							>
								<option>All Schemes</option>
								{console.log(uniqueChitSchemes)}
								{uniqueChitSchemes.map((scheme) => (
									<option key={scheme}>{scheme}</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="table-container">
					{loading ? (
						<LoadingStatus message="Payments Loading..." />
					) : error ? (
						<div className="error-message">Error: {error}</div>
					) : (
						<table className="payments-table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Member</th>
									<th>Chit Scheme</th>
									<th>Amount</th>
									<th>Payment Method</th>
									<th>Reference No.</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredPayments.length > 0 ? (
									filteredPayments.map((payment) => (
										<tr key={payment.id}>
											<td>{payment.date}</td>
											<td>{payment.member}</td>
											<td>{payment.chitScheme}</td>
											<td>{payment.amount}</td>
											<td>{payment.paymentMethod}</td>
											<td>{payment.referenceNo}</td>
											<td>
												<span
													className={`status-badge ${payment.status.toLowerCase()}`}
												>
													{payment.status}
												</span>
											</td>
											<td>
												<ActionButton
													label="View"
													icon="eye"
													variant="outline"
													className="small"
												/>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan="8" className="no-data-message">
											No payments found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					)}
				</div>
			</div>

			<RecordPaymentModal
				isOpen={showRecordPaymentModal}
				onClose={handleCloseRecordPaymentModal}
				onPaymentAdded={fetchPayments}
			/>
		</div>
	);
};

export default Payments;
