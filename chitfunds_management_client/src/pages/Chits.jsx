import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import '../styles/Chits.css';
import { useState, useEffect } from 'react';

const Chits = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');
	const [chitSchemes, setChitSchemes] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchChitGroups();
	}, []);

	const fetchChitGroups = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch('http://127.0.0.1:5000/chit-groups');

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();

			// The API returns data as a JSON string inside the data field
			// We need to parse it to get the actual array
			const parsedData = JSON.parse(result.data);

			setChitSchemes(parsedData);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching chit groups:', error);
			setError('Failed to load chit schemes. Please try again later.');
			setIsLoading(false);
		}
	};

	const handleManageClick = (chitId) => {
		window.history.pushState({}, '', `/chits/${chitId}`);
		// Dispatch navigation event
		const navEvent = new CustomEvent('navchange', {
			detail: { path: `/chits/${chitId}` },
		});
		window.dispatchEvent(navEvent);
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleStatusChange = (e) => {
		setStatusFilter(e.target.value);
	};

	const filteredChits = chitSchemes.filter((chit) => {
		const matchesSearch = chit.chit_name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());

		// Status filter - making it case insensitive
		const matchesStatus =
			statusFilter === 'All Status' ||
			chit.status.toLowerCase() === statusFilter.toLowerCase();

		return matchesSearch && matchesStatus;
	});

	// Format currency with proper symbol and separators
	const formatCurrency = (amount) => {
		// Convert to number if it's a string
		const numAmount = parseFloat(amount);

		// Format with Indian Rupee symbol and thousand separators
		return `₹${numAmount.toLocaleString('en-IN')}`;
	};

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
						<ActionButton
							label="Create New Scheme"
							icon="plus"
							variant="primary"
						/>
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

				{/* Loading indicator */}
				{isLoading && (
					<div className="loading-message">
						<i className="fas fa-spinner fa-spin"></i> Loading chit schemes...
					</div>
				)}

				{/* Error message */}
				{error && (
					<div className="error-message">
						<i className="fas fa-exclamation-circle"></i> {error}
					</div>
				)}

				{/* No results message */}
				{!isLoading && !error && filteredChits.length === 0 && (
					<div className="no-results-message">
						<i className="fas fa-search"></i> No chit schemes found matching
						your criteria.
					</div>
				)}

				<div className="chits-grid">
					{filteredChits.map((chit) => (
						<div key={chit.chit_groups_id} className="chit-card">
							<div className="card-header">
								<h2>{chit.chit_name}</h2>
								<span className={`status-badge ${chit.status.toLowerCase()}`}>
									{chit.status.charAt(0).toUpperCase() + chit.status.slice(1)}
								</span>
							</div>
							<div className="card-body">
								<div className="value-info">
									<p>Total Value: {formatCurrency(chit.chit_amount)}</p>
								</div>

								<div className="chit-card-details">
									<div className="card-detail-item">
										<i className="fas fa-money-bill-wave"></i>
										<span>
											{formatCurrency(chit.monthly_installment)} monthly
										</span>
									</div>
									<div className="card-detail-item">
										<i className="fas fa-users"></i>
										<span>{chit.total_members} members</span>
									</div>
									<div className="card-detail-item">
										<i className="fas fa-calendar-alt"></i>
										<span>{chit.duration_months} months</span>
									</div>
									<div className="card-detail-item">
										<i className="fas fa-calendar-check"></i>
										<span>
											Started:{' '}
											{new Date(chit.start_date).toLocaleDateString('en-IN', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
											})}
										</span>
									</div>
								</div>

								<div className="auction-info">
									<p>
										End Date:{' '}
										{new Date(chit.end_date).toLocaleDateString('en-IN', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</p>
								</div>

								<div className="card-actions">
									<ActionButton
										label="View Members"
										icon="users"
										variant="outline"
										className="view"
									/>
									<ActionButton
										label="Manage"
										icon="cog"
										variant="outline"
										className="manage"
										onClick={() => handleManageClick(chit.chit_groups_id)}
									/>
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
