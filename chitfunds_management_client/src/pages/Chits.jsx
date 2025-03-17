import Navbar from '../components/Navbar';
import '../styles/Chits.css';
import { useState } from 'react';

const Chits = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');

	const chitSchemes = [
		{
			id: 1,
			name: 'Dhanalakshmi 50L',
			totalValue: '₹50,00,000',
			contribution: '₹2,50,000',
			members: 20,
			duration: '20 months',
			startDate: '01 Jan 2023',
			nextAuction: '15 Apr 2023',
			status: 'Active',
		},
		{
			id: 2,
			name: 'Lakshmi 20L',
			totalValue: '₹20,00,000',
			contribution: '₹1,00,000',
			members: 20,
			duration: '20 months',
			startDate: '15 Feb 2023',
			nextAuction: '20 Apr 2023',
			status: 'Active',
		},
		{
			id: 3,
			name: 'Srinivas 10L',
			totalValue: '₹10,00,000',
			contribution: '₹50,000',
			members: 20,
			duration: '20 months',
			startDate: '01 Mar 2023',
			nextAuction: '01 May 2023',
			status: 'Active',
		},
		{
			id: 4,
			name: 'Venkateshwara 25L',
			totalValue: '₹25,00,000',
			contribution: '₹1,25,000',
			members: 20,
			duration: '20 months',
			startDate: '15 Mar 2023',
			nextAuction: '15 May 2023',
			status: 'Active',
		},
		{
			id: 5,
			name: 'Saraswati 5L',
			totalValue: '₹5,00,000',
			contribution: '₹25,000',
			members: 20,
			duration: '20 months',
			startDate: '01 Jan 2022',
			nextAuction: 'N/A',
			status: 'Completed',
		},
		{
			id: 6,
			name: 'Ganesha 15L',
			totalValue: '₹15,00,000',
			contribution: '₹75,000',
			members: 20,
			duration: '20 months',
			startDate: '01 Apr 2023',
			nextAuction: '01 Jun 2023',
			status: 'Active',
		},
	];

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleStatusChange = (e) => {
		setStatusFilter(e.target.value);
	};

	const filteredChits = chitSchemes.filter((chit) => {
		const matchesSearch = chit.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === 'All Status' || chit.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="chits-page">
			<Navbar />

			<div className="page-container">
				<div className="page-header">
					<div className="header-left">
						<h1>Chit Schemes</h1>
						<p>Manage and view all your chit fund schemes</p>
					</div>
					<div className="header-right">
						<button className="create-button">
							<i className="fas fa-plus"></i> Create New Scheme
						</button>
					</div>
				</div>

				<div className="filters-bar">
					<div className="search-box">
						<i className="fas fa-search search-icon"></i>
						<input
							type="text"
							placeholder="Search chit schemes..."
							value={searchQuery}
							onChange={handleSearchChange}
						/>
					</div>
					<div className="status-filter">
						<select value={statusFilter} onChange={handleStatusChange}>
							<option>All Status</option>
							<option>Active</option>
							<option>Completed</option>
							<option>Upcoming</option>
						</select>
					</div>
				</div>

				<div className="chits-grid">
					{filteredChits.map((chit) => (
						<div key={chit.id} className="chit-card">
							<div className="card-header">
								<h2>{chit.name}</h2>
								<span className={`status-badge ${chit.status.toLowerCase()}`}>
									{chit.status}
								</span>
							</div>
							<div className="card-body">
								<div className="value-info">
									<p>Total Value: {chit.totalValue}</p>
								</div>

								<div className="chit-details">
									<div className="detail-item">
										<i className="fas fa-money-bill-wave"></i>
										<span>{chit.contribution}</span>
									</div>
									<div className="detail-item">
										<i className="fas fa-users"></i>
										<span>{chit.members} members</span>
									</div>
									<div className="detail-item">
										<i className="fas fa-calendar-alt"></i>
										<span>{chit.duration}</span>
									</div>
									<div className="detail-item">
										<i className="fas fa-calendar-check"></i>
										<span>Started: {chit.startDate}</span>
									</div>
								</div>

								<div className="auction-info">
									<p>Next Auction: {chit.nextAuction}</p>
								</div>

								<div className="card-actions">
									<button className="action-button view">View Members</button>
									<button className="action-button manage">Manage</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Chits;
