import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import ChitCard from '../components/ChitCard';
import CreateChitModal from '../components/CreateChitModal';
import LoadingStatus from '../components/ui/LoadingStatus';
import '../styles/Chits.css';

const Chits = () => {
	const navigate = useNavigate();
	const [chits, setChits] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('All Status');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		fetchChits();
	}, []);

	const fetchChits = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await apiRequest('/chit-groups');

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

	const handleCreateSuccess = () => {
		// Refresh the chit schemes list after creating a new one
		fetchChits();
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
							onClick={() => setIsModalOpen(true)}
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
					<LoadingStatus message="Loading chits..." />
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

			<CreateChitModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={handleCreateSuccess}
			/>
		</div>
	);
};

export default Chits;
