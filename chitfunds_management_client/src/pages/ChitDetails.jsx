import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import AddMembersModal from '../components/AddMembersModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EditChitModal from '../components/EditChitModal';
import AddProjectionsModal from '../components/AddProjectionsModal';
import AddLifterModal from '../components/AddLifterModal';
import { useNotification } from '../context/NotificationContext';
import LoadingStatus from '../components/ui/LoadingStatus';
import '../styles/ChitDetails.css';
import { differenceInMonths, isFuture } from 'date-fns';
import { useParams } from 'react-router-dom';

const ChitDetails = () => {
	const { chitId } = useParams();
	const [activeTab, setActiveTab] = useState('projections');
	const [searchQuery, setSearchQuery] = useState('');
	const [chitDetails, setChitDetails] = useState(null);
	const [members, setMembers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isMembersLoading, setIsMembersLoading] = useState(false);
	const [error, setError] = useState(null);
	const [membersError, setMembersError] = useState(null);
	const [filteredMembers, setFilteredMembers] = useState([]);
	const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isAddProjectionsModalOpen, setIsAddProjectionsModalOpen] =
		useState(false);
	const [isEditProjectionsModalOpen, setIsEditProjectionsModalOpen] =
		useState(false);
	const [isAddLifterModalOpen, setIsAddLifterModalOpen] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState(null);
	const { showSuccess, showError } = useNotification();

	useEffect(() => {
		fetchChitDetails();
	}, [chitId]);

	const fetchChitDetails = async () => {
		try {
			setIsLoading(true);
			setError(null);
			console.log(chitId, 'inside the chit details');

			const response = await fetch(
				`http://127.0.0.1:5001/get_chit?chit_group_id=${chitId}`
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();
			setChitDetails(result.data);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching chit details:', error);
			setError('Failed to load chit details. Please try again later.');
			setIsLoading(false);
		}
	};

	const fetchChitMembers = async () => {
		try {
			setIsMembersLoading(true);
			setMembersError(null);
			const response = await fetch(
				`http://127.0.0.1:5001/get_chit_members?chit_group_id=${chitId}`
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();
			setMembers(result.data);
			setFilteredMembers(result.data);
		} catch (error) {
			console.error('Error fetching chit members:', error);
			setMembersError('Failed to load members. Please try again later.');
		} finally {
			setIsMembersLoading(false);
		}
	};

	const handleSearchChange = (e) => {
		const query = e.target.value.toLowerCase();
		setSearchQuery(query);

		const filtered = members.filter(
			(member) =>
				member.full_name.toLowerCase().includes(query) ||
				member.email.toLowerCase().includes(query) ||
				member.phone.includes(query)
		);
		setFilteredMembers(filtered);
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		if (tab === 'members') {
			fetchChitMembers();
		}
	};

	const handleAddMembersSuccess = () => {
		// Refresh the members list after adding new members
		fetchChitMembers();
		showSuccess('Members added successfully!');
	};

	const formatCurrency = (amount) => {
		const numAmount = parseFloat(amount);
		return `₹${numAmount.toLocaleString('en-IN')}`;
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const calculateCompletedMonths = () => {
		if (!chitDetails || !chitDetails.start_date) return 0;

		const startDate = new Date(chitDetails.start_date);
		const currentDate = new Date();
		const durationMonths = parseInt(chitDetails.duration_months, 10);

		if (isFuture(startDate)) {
			return 0; // Start date is in the future
		}

		const completedMonths = differenceInMonths(currentDate, startDate);

		return Math.min(completedMonths, durationMonths); // Ensure it doesn't exceed duration
	};

	const handleDeleteClick = () => {
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			const response = await fetch(
				`http://127.0.0.1:5001/delete-chit?chit_group_id=${chitId}`,
				{
					method: 'DELETE',
				}
			);

			if (!response.ok) {
				throw new Error('Failed to delete chit');
			}

			showSuccess('Chit deleted successfully!');
			setIsDeleteModalOpen(false);

			setTimeout(() => {
				window.location.href = '/chits';
			}, 1000);
		} catch (error) {
			console.error('Error deleting chit:', error);
			showError('Failed to delete chit. Please try again.');
		}
	};

	const handleEditClick = () => {
		setIsEditModalOpen(true);
	};

	const handleEditSuccess = () => {
		// Refresh the chit details after editing
		fetchChitDetails();
		showSuccess('Chit scheme updated successfully!');
	};

	const handleAddProjectionsSuccess = () => {
		// Refresh the chit details after adding projections
		fetchChitDetails();
		showSuccess('Projections added successfully!');
	};

	const handleEditProjectionsSuccess = () => {
		// Refresh the chit details after editing projections
		fetchChitDetails();
		showSuccess('Projections updated successfully!');
	};

	// Helper function to check if projections are complete
	const areProjectionsComplete = () => {
		if (!chitDetails || !chitDetails.monthly_projections) return false;
		return (
			chitDetails.monthly_projections.length >= chitDetails.duration_months
		);
	};

	const handleAddLifterClick = (monthNumber) => {
		setSelectedMonth(monthNumber);
		setIsAddLifterModalOpen(true);
	};

	const handleAddLifterSuccess = () => {
		// Refresh the chit details to update lifter information
		fetchChitDetails();
		showSuccess('Lifter added successfully!');
	};

	// Add this debugging function
	const logProjectionData = (projection) => {
		console.log('Projection data:', {
			id: projection.monthly_projections_id,
			month: projection.month_number,
			fullName: projection.full_name,
			hasFullName: Boolean(projection.full_name),
		});
		return null;
	};

	if (isLoading) {
		return (
			<div className="chit-details-page">
				<Navbar />
				<div className="page-container">
					<LoadingStatus message="Loading Chit Details..." />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="chit-details-page">
				<Navbar />
				<div className="page-container">
					<div className="error-message">
						<i className="fas fa-exclamation-circle"></i> {error}
					</div>
				</div>
			</div>
		);
	}

	if (!chitDetails) {
		return (
			<div className="chit-details-page">
				<Navbar />
				<div className="page-container">
					<div className="error-message">
						<i className="fas fa-exclamation-circle"></i> Chit details not found
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="chit-details-page">
			<Navbar />
			<div className="page-container">
				<div className="page-header">
					<div className="header-left">
						<div className="back-button" onClick={() => window.history.back()}>
							<i className="fas fa-arrow-left"></i>
							<span>Back to Chits</span>
						</div>
						<div className="title-section">
							<h1>{chitDetails.chit_name}</h1>
							<span
								className={`status-badge ${chitDetails.status.toLowerCase()}`}
							>
								{chitDetails.status.charAt(0).toUpperCase() +
									chitDetails.status.slice(1)}
							</span>
						</div>
					</div>
					<div className="header-right">
						<ActionButton
							label="Delete"
							variant="danger"
							onClick={handleDeleteClick}
						/>
					</div>
				</div>

				<div className="detail-cards-container">
					<div className="chit-details-card">
						<div className="card-header-with-action">
							<h2>Chit Details</h2>
							<button className="edit-button" onClick={handleEditClick}>
								<i className="fas fa-edit"></i> Edit
							</button>
						</div>

						<div className="details-sections">
							<div className="details-section">
								<h3>General Information</h3>
								<div className="details-grid">
									<div className="detail-item with-icon">
										<i className="fas fa-users"></i>
										<div>
											<label>Total Members</label>
											<span>{chitDetails.total_members}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-calendar-alt"></i>
										<div>
											<label>Duration</label>
											<span>{chitDetails.duration_months} months</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-calendar-check"></i>
										<div>
											<label>Start Date</label>
											<span>{formatDate(chitDetails.start_date)}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-calendar-day"></i>
										<div>
											<label>End Date</label>
											<span>{formatDate(chitDetails.end_date)}</span>
										</div>
									</div>
								</div>
							</div>

							<div className="details-section">
								<h3>Financial Details</h3>
								<div className="details-grid">
									<div className="detail-item with-icon">
										<i className="fas fa-money-bill-wave"></i>
										<div>
											<label>Total Value</label>
											<span>{formatCurrency(chitDetails.chit_amount)}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-receipt"></i>
										<div>
											<label>Monthly Subscription</label>
											<span>
												{formatCurrency(chitDetails.monthly_installment)}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="chit-summary-card">
						<h2>Chit Summary</h2>
						<div className="investment-summary">
							<h3>Investment Details</h3>
							<div className="investment-details">
								<div className="investment-item">
									<label>Monthly Payment</label>
									<span className="amount">
										{formatCurrency(chitDetails.monthly_installment)}
									</span>
								</div>
								<div className="investment-item">
									<label>Total Investment</label>
									<span className="amount">
										{formatCurrency(chitDetails.chit_amount)}
									</span>
								</div>
							</div>
						</div>

						<div className="quick-stats">
							<h3>Quick Stats</h3>
							<div className="stats-list">
								<div className="stat-item">
									<span className="stat-label">Completed Months</span>
									<span className="stat-value">
										{calculateCompletedMonths()}/{chitDetails.duration_months}
									</span>
								</div>
								<div className="stat-item">
									<span className="stat-label">Current Month Paid Count</span>
									<span className="stat-value">8</span>
								</div>
								<div className="stat-item">
									<span className="stat-label">Current Month Unpaid Count</span>
									<span className="stat-value">2</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="tabs-container">
					<div className="tabs-header">
						<button
							className={`tab-button ${
								activeTab === 'projections' ? 'active' : ''
							}`}
							onClick={() => handleTabChange('projections')}
						>
							Projections
						</button>
						<button
							className={`tab-button ${
								activeTab === 'members' ? 'active' : ''
							}`}
							onClick={() => handleTabChange('members')}
						>
							Members
						</button>
						<button
							className={`tab-button ${
								activeTab === 'payments' ? 'active' : ''
							}`}
							onClick={() => handleTabChange('payments')}
						>
							Payments
						</button>
					</div>

					<div className="tab-content">
						{activeTab === 'projections' && (
							<div className="projections-tab">
								<div className="tab-header">
									<div className="spacer"></div>
									<div className="action-buttons">
										{areProjectionsComplete() ? (
											<ActionButton
												label="Edit Projections"
												icon="edit"
												variant="primary"
												onClick={() => setIsEditProjectionsModalOpen(true)}
											/>
										) : (
											<ActionButton
												label="Add Projections"
												icon="plus"
												variant="primary"
												onClick={() => setIsAddProjectionsModalOpen(true)}
												disabled={areProjectionsComplete()}
											/>
										)}
										<ActionButton
											label="Print"
											icon="print"
											variant="outline"
										/>
										<ActionButton
											label="Export"
											icon="file-export"
											variant="outline"
										/>
									</div>
								</div>
								<div className="table-container">
									<table className="data-table">
										<thead>
											<tr>
												<th>Month</th>
												<th>Monthly Subscription</th>
												<th>Total Payout</th>
												<th>Payout User</th>
											</tr>
										</thead>
										<tbody>
											{chitDetails.monthly_projections &&
											chitDetails.monthly_projections.length > 0 ? (
												chitDetails.monthly_projections.map((projection) => (
													<tr
														key={
															projection.monthly_projections_id ||
															`month-${projection.month_number}`
														}
													>
														<td>{projection.month_number}</td>
														<td>
															{formatCurrency(projection.monthly_subcription)}
														</td>
														<td>{formatCurrency(projection.total_payout)}</td>
														<td>
															{projection.full_name &&
															projection.full_name.trim() !== '' ? (
																projection.full_name
															) : (
																<button
																	className="add-lifter-btn"
																	onClick={() =>
																		handleAddLifterClick(
																			projection.month_number
																		)
																	}
																>
																	<i className="fas fa-user-plus"></i> Add
																	Lifter
																</button>
															)}
														</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan="4" className="empty-cell">
														<div className="empty-message">
															<i className="fas fa-calculator"></i> No
															projections found. Add projections to see them
															here.
														</div>
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{activeTab === 'members' && (
							<div className="members-tab">
								<div className="tab-header">
									<div className="search-box">
										<i className="fas fa-search search-icon"></i>
										<input
											type="text"
											placeholder="Search members..."
											value={searchQuery}
											onChange={handleSearchChange}
										/>
									</div>
									<ActionButton
										label="Add Members"
										icon="user-plus"
										variant="primary"
										onClick={() => setIsAddMembersModalOpen(true)}
									/>
								</div>
								<div className="table-container">
									<table className="data-table">
										<thead>
											<tr>
												<th>Name</th>
												<th>Contact</th>
												<th>Email</th>
												<th>Lifted</th>
												<th>Lifted Amount</th>
												<th>Pending Installments</th>
											</tr>
										</thead>
										<tbody>
											{isMembersLoading ? (
												<tr>
													<td colSpan="6" className="loading-cell">
														<LoadingStatus message="Loading Members..." />
													</td>
												</tr>
											) : membersError ? (
												<tr>
													<td colSpan="6" className="empty-cell">
														<div className="empty-message">
															<i className="fas fa-exclamation-circle"></i>{' '}
															{membersError}
														</div>
													</td>
												</tr>
											) : filteredMembers.length === 0 ? (
												<tr>
													<td colSpan="6" className="empty-cell">
														<div className="empty-message">
															<i className="fas fa-users-slash"></i> No members
															found
														</div>
													</td>
												</tr>
											) : (
												filteredMembers.map((member) => (
													<tr key={member.user_id}>
														<td>{member.full_name}</td>
														<td>{member.phone}</td>
														<td>{member.email}</td>
														<td>
															{member.is_lifted === 'TRUE' ? 'Yes' : 'No'}
														</td>
														<td>{formatCurrency(member.lifted_amount)}</td>
														<td>{member.pending_installments}</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{activeTab === 'payments' && (
							<div className="payments-tab">
								<div className="tab-header">
									<div className="search-box">
										<i className="fas fa-search search-icon"></i>
										<input
											type="text"
											placeholder="Search payments..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<div className="action-buttons">
										<ActionButton
											label="Print"
											icon="print"
											variant="outline"
										/>
										<ActionButton
											label="Export"
											icon="file-export"
											variant="outline"
										/>
										<ActionButton
											label="Make Payment"
											icon="plus"
											variant="primary"
										/>
									</div>
								</div>
								<div className="table-container">
									<table className="data-table">
										<thead>
											<tr>
												<th>Month</th>
												<th>Amount</th>
												<th>Date</th>
												<th>Payment Method</th>
												<th>Reference</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>{/* Keep existing payments data for now */}</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Add Members Modal */}
			<AddMembersModal
				isOpen={isAddMembersModalOpen}
				onClose={() => setIsAddMembersModalOpen(false)}
				chitId={chitId}
				onSuccess={handleAddMembersSuccess}
			/>

			{/* Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
			/>

			{/* Edit Chit Modal */}
			<EditChitModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				onSuccess={handleEditSuccess}
				chitDetails={chitDetails}
			/>

			{/* Add Projections Modal */}
			<AddProjectionsModal
				isOpen={isAddProjectionsModalOpen}
				onClose={() => setIsAddProjectionsModalOpen(false)}
				onSuccess={handleAddProjectionsSuccess}
				chitDetails={chitDetails}
			/>

			{/* Edit Projections Modal - This would use the same component but in edit mode */}
			<AddProjectionsModal
				isOpen={isEditProjectionsModalOpen}
				onClose={() => setIsEditProjectionsModalOpen(false)}
				onSuccess={handleEditProjectionsSuccess}
				chitDetails={chitDetails}
				isEditMode={true}
			/>

			{/* Add Lifter Modal */}
			<AddLifterModal
				isOpen={isAddLifterModalOpen}
				onClose={() => setIsAddLifterModalOpen(false)}
				onSuccess={handleAddLifterSuccess}
				chitId={chitId}
				monthNumber={selectedMonth}
			/>
		</div>
	);
};

export default ChitDetails;
