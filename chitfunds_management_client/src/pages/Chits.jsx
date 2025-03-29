import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import ChitCard from '../components/ChitCard';
import '../styles/Chits.css';

const Chits = () => {
	const navigate = useNavigate();
	const [chits, setChits] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchChits();
	}, []);

	const fetchChits = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch('http://127.0.0.1:5001/chit-groups');

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();

			if (result.data) {
				setChits(result.data);
			} else {
				setChits([]);
			}
		} catch (err) {
			console.error('Error fetching chits:', err);
			setError('Failed to load chits. Please try again later.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleStatusChange = (e) => {
		setStatusFilter(e.target.value);
	};

	const handleManageChit = (chitId) => {
		navigate(`/chit-details/${chitId}`);
	};

	const filteredChits = chits.filter((chit) => {
		const matchesSearch = chit.chit_name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === 'All Status' ||
			chit.status.toLowerCase() === statusFilter.toLowerCase();

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
						<ActionButton
							label="Create New Scheme"
							icon="plus"
							variant="primary"
							onClick={() => console.log('Create new chit')}
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

				{isLoading ? (
					<div className="loading-indicator">
						<i className="fas fa-spinner fa-spin"></i> Loading chit schemes...
					</div>
				) : error ? (
					<div className="error-message">
						<i className="fas fa-exclamation-triangle"></i> {error}
					</div>
				) : filteredChits.length === 0 ? (
					<div className="no-results-message">
						<i className="fas fa-search"></i> No chit schemes found matching
						your criteria.
					</div>
				) : (
					<div className="chits-grid">
						{filteredChits.map((chit) => (
							<ChitCard
								key={chit.chit_group_id}
								chit={chit}
								onView={handleManageChit}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Chits;
