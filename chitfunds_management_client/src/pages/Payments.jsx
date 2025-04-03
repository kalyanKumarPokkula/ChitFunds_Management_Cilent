import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import RecordPaymentModal from '../components/RecordPaymentModal';
import '../styles/Payments.css';
import { useState } from 'react';

const Payments = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');
	const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);

	const payments = [
		{
			id: 1,
			date: '01 Apr 2023',
			member: 'Ramesh Kumar',
			chitScheme: 'Dhanalakshmi 50L',
			amount: '₹2,50,000',
			paymentMethod: 'NEFT',
			referenceNo: 'NEFT123456789',
			status: 'Successful',
		},
		{
			id: 2,
			date: '02 Apr 2023',
			member: 'Suresh Reddy',
			chitScheme: 'Lakshmi 20L',
			amount: '₹1,00,000',
			paymentMethod: 'IMPS',
			referenceNo: 'IMPS987654321',
			status: 'Successful',
		},
		{
			id: 3,
			date: '02 Apr 2023',
			member: 'Priya Sharma',
			chitScheme: 'Srinivas 10L',
			amount: '₹50,000',
			paymentMethod: 'Cash',
			referenceNo: 'CASH000123',
			status: 'Successful',
		},
		{
			id: 4,
			date: '03 Apr 2023',
			member: 'Kiran Patel',
			chitScheme: 'Venkateshwara 25L',
			amount: '₹1,25,000',
			paymentMethod: 'Cheque',
			referenceNo: 'CHQ123456',
			status: 'Pending',
		},
		{
			id: 5,
			date: '04 Apr 2023',
			member: 'Lakshmi Devi',
			chitScheme: 'Ganesha 15L',
			amount: '₹75,000',
			paymentMethod: 'UPI',
			referenceNo: 'UPI987654321',
			status: 'Successful',
		},
	];

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleStatusChange = (e) => {
		setStatusFilter(e.target.value);
	};

	const handleRecordPaymentClick = () => {
		setShowRecordPaymentModal(true);
	};

	const handleCloseRecordPaymentModal = () => {
		setShowRecordPaymentModal(false);
	};

	const filteredPayments = payments.filter((payment) => {
		// Search across all fields
		const matchesSearch = Object.values(payment).some((value) =>
			value.toString().toLowerCase().includes(searchQuery.toLowerCase())
		);

		// Filter by status if not 'All Status'
		const matchesStatus =
			statusFilter === 'All Status' || payment.status === statusFilter;

		return matchesSearch && matchesStatus;
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
							<ActionButton
								label="Change Date"
								icon="calendar"
								variant="outline"
							/>
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
					<div className="status-filter">
						<select value={statusFilter} onChange={handleStatusChange}>
							<option>All Status</option>
							<option>Successful</option>
							<option>Pending</option>
							<option>Failed</option>
						</select>
					</div>
				</div>

				<div className="table-container">
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
							{filteredPayments.map((payment) => (
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
							))}
						</tbody>
					</table>
				</div>
			</div>

			<RecordPaymentModal
				isOpen={showRecordPaymentModal}
				onClose={handleCloseRecordPaymentModal}
			/>
		</div>
	);
};

export default Payments;
