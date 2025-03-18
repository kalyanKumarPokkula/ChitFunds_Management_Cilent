import { useState } from 'react';
import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import '../styles/ChitDetails.css';

const ChitDetails = ({ chitId }) => {
	const [activeTab, setActiveTab] = useState('members');
	const [searchQuery, setSearchQuery] = useState('');

	// Sample data - replace with actual data from your backend
	const chitDetails = {
		id: chitId,
		name: 'Dhanalakshmi 50L',
		status: 'Active',
		description: 'Premium chit scheme with high returns and reliable members.',
		totalValue: '₹50,00,000',
		monthlySubscription: '₹2,50,000',
		foreman: 'Ramesh Kumar',
		foremanCommission: '5%',
		startDate: '01 Jan 2023',
		nextAuction: '15 Apr 2023',
		totalMembers: 20,
		duration: '20 months',
		completedAuctions: 4,
		yourTurn: 'Not Yet',
		lowestBid: '₹40,000',
		highestBid: '₹52,000',
	};

	const members = [
		{
			id: 1,
			name: 'Ramesh Kumar',
			phone: '9876543210',
			email: 'ramesh@example.com',
			joinDate: '01 Jan 2023',
			bidMonth: 3,
			bidAmount: '₹42,500',
			status: 'Active',
		},
		{
			id: 2,
			name: 'Suresh Reddy',
			phone: '9876543211',
			email: 'suresh@example.com',
			joinDate: '01 Jan 2023',
			bidMonth: 5,
			bidAmount: '₹40,000',
			status: 'Active',
		},
		// Add more members as needed
	];

	const projections = [
		{
			month: 1,
			discountPercent: '24.0%',
			discountAmount: '₹12,00,000',
			commission: '₹2,50,000',
			netAmount: '₹35,50,000',
			dividend: '₹47,500',
			subscriberShare: '₹2,02,500',
		},
		{
			month: 2,
			discountPercent: '23.0%',
			discountAmount: '₹11,50,000',
			commission: '₹2,50,000',
			netAmount: '₹36,00,000',
			dividend: '₹45,000',
			subscriberShare: '₹2,05,000',
		},
		// Add more projections as needed
	];

	const payments = [
		{
			month: 'January 2023',
			amount: '₹2,50,000',
			date: '15 Jan 2023',
			paymentMethod: 'Net Banking',
			reference: 'NB78954212',
			status: 'Paid',
		},
		{
			month: 'February 2023',
			amount: '₹2,50,000',
			date: '12 Feb 2023',
			paymentMethod: 'UPI',
			reference: 'UPI456321789',
			status: 'Paid',
		},
		// Add more payments as needed
	];

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

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
							<h1>{chitDetails.name}</h1>
							<span
								className={`status-badge ${chitDetails.status.toLowerCase()}`}
							>
								{chitDetails.status}
							</span>
						</div>
					</div>
					<div className="header-right">
						<ActionButton label="Delete Chit" icon="trash" variant="danger" />
					</div>
				</div>

				<div className="detail-cards-container">
					<div className="chit-details-card">
						<div className="card-header-with-action">
							<h2>Chit Details</h2>
							<button className="edit-button">
								<i className="fas fa-edit"></i> Edit
							</button>
						</div>

						<div className="details-sections">
							<div className="details-section">
								<h3>General Information</h3>
								<p className="description">{chitDetails.description}</p>

								<div className="details-grid">
									<div className="detail-item with-icon">
										<i className="fas fa-users"></i>
										<div>
											<label>Total Members</label>
											<span>{chitDetails.totalMembers}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-calendar-alt"></i>
										<div>
											<label>Duration</label>
											<span>{chitDetails.duration}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-calendar-check"></i>
										<div>
											<label>Start Date</label>
											<span>{chitDetails.startDate}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-calendar-day"></i>
										<div>
											<label>Next Auction</label>
											<span>{chitDetails.nextAuction}</span>
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
											<span>{chitDetails.totalValue}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-receipt"></i>
										<div>
											<label>Monthly Subscription</label>
											<span>{chitDetails.monthlySubscription}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-user-tie"></i>
										<div>
											<label>Foreman</label>
											<span>{chitDetails.foreman}</span>
										</div>
									</div>

									<div className="detail-item with-icon">
										<i className="fas fa-percentage"></i>
										<div>
											<label>Foreman's Commission</label>
											<span>{chitDetails.foremanCommission}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="chit-summary-card">
						<h2>Chit Summary</h2>

						<div className="investment-summary">
							<h3>Your Investment</h3>
							<div className="investment-details">
								<div className="investment-item">
									<label>Monthly Payment</label>
									<span className="amount">₹2,50,000</span>
								</div>
								<div className="investment-item">
									<label>Total Investment</label>
									<span className="amount">₹50,00,000</span>
								</div>
							</div>
						</div>

						<div className="quick-stats">
							<h3>Quick Stats</h3>
							<div className="stats-list">
								<div className="stat-item">
									<span className="stat-label">Completed Auctions</span>
									<span className="stat-value">4/20</span>
								</div>
								<div className="stat-item">
									<span className="stat-label">Your Turn</span>
									<span className="stat-value">Not Yet</span>
								</div>
								<div className="stat-item">
									<span className="stat-label">Lowest Bid</span>
									<span className="stat-value">₹40,000</span>
								</div>
								<div className="stat-item">
									<span className="stat-label">Highest Bid</span>
									<span className="stat-value">₹52,000</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="tabs-container">
					<div className="tabs-header">
						<button
							className={`tab-button ${
								activeTab === 'members' ? 'active' : ''
							}`}
							onClick={() => setActiveTab('members')}
						>
							Members
						</button>
						<button
							className={`tab-button ${
								activeTab === 'projections' ? 'active' : ''
							}`}
							onClick={() => setActiveTab('projections')}
						>
							Projections
						</button>
						<button
							className={`tab-button ${
								activeTab === 'payments' ? 'active' : ''
							}`}
							onClick={() => setActiveTab('payments')}
						>
							Payments
						</button>
					</div>

					<div className="tab-content">
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
									/>
								</div>
								<div className="table-container">
									<table className="data-table">
										<thead>
											<tr>
												<th>Name</th>
												<th>Contact</th>
												<th>Join Date</th>
												<th>Bid Month</th>
												<th>Bid Amount</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{members.map((member) => (
												<tr key={member.id}>
													<td>{member.name}</td>
													<td>
														{member.phone}
														<div className="email">{member.email}</div>
													</td>
													<td>{member.joinDate}</td>
													<td>{member.bidMonth || '-'}</td>
													<td>{member.bidAmount || '-'}</td>
													<td>
														<span
															className={`status-badge ${member.status.toLowerCase()}`}
														>
															{member.status}
														</span>
													</td>
													<td>
														<button className="action-dots">...</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{activeTab === 'projections' && (
							<div className="projections-tab">
								<div className="tab-header">
									<div className="spacer"></div>
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
									</div>
								</div>
								<div className="table-container">
									<table className="data-table">
										<thead>
											<tr>
												<th>Month</th>
												<th>Discount %</th>
												<th>Discount Amount</th>
												<th>Commission</th>
												<th>Net Amount</th>
												<th>Dividend</th>
												<th>Subscriber Share</th>
											</tr>
										</thead>
										<tbody>
											{projections.map((projection) => (
												<tr key={projection.month}>
													<td>{projection.month}</td>
													<td>{projection.discountPercent}</td>
													<td>{projection.discountAmount}</td>
													<td>{projection.commission}</td>
													<td>{projection.netAmount}</td>
													<td>{projection.dividend}</td>
													<td>{projection.subscriberShare}</td>
												</tr>
											))}
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
											onChange={handleSearchChange}
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
										<tbody>
											{payments.map((payment, index) => (
												<tr key={index}>
													<td>{payment.month}</td>
													<td>{payment.amount}</td>
													<td>{payment.date}</td>
													<td>{payment.paymentMethod}</td>
													<td>{payment.reference}</td>
													<td>
														<span
															className={`status-badge ${payment.status.toLowerCase()}`}
														>
															{payment.status}
														</span>
													</td>
													<td>
														<button className="action-dots">...</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChitDetails;
