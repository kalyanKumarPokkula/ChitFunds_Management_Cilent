import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import '../styles/Members.css';
import { useState, useEffect } from 'react';

const Members = () => {
	const [members, setMembers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchMembers();
	}, []);

	const fetchMembers = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch('http://127.0.0.1:5001/get_users');

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();

			if (result.data) {
				setMembers(result.data);
			} else {
				setMembers([]);
			}
		} catch (err) {
			console.error('Error fetching members:', err);
			setError('Failed to load members. Please try again later.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const filteredMembers = members.filter((member) =>
		Object.values(member).some((value) =>
			value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	return (
		<div className="members-page">
			<Navbar />

			<div className="page-container">
				<div className="page-header">
					<div className="header-left">
						<h1>Members</h1>
						<p>Manage and view all members in your chit funds</p>
					</div>
					<div className="header-right">
						<ActionButton
							label="Add New Member"
							icon="user-plus"
							variant="primary"
						/>
					</div>
				</div>

				<div className="filters-bar">
					<div className="search-box">
						<i className="fas fa-search search-icon"></i>
						<input
							type="text"
							placeholder="Search members..."
							value={searchQuery}
							onChange={handleSearchChange}
						/>
					</div>
					<div className="members-count">{filteredMembers.length} members</div>
				</div>

				{isLoading ? (
					<div className="loading-indicator">
						<i className="fas fa-spinner fa-spin"></i> Loading members...
					</div>
				) : error ? (
					<div className="error-message">
						<i className="fas fa-exclamation-triangle"></i> {error}
					</div>
				) : (
					<div className="table-container">
						<table className="members-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Phone</th>
									<th>Email</th>
									<th>Active Chits</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredMembers.map((member) => (
									<tr key={member.user_id}>
										<td>{member.full_name}</td>
										<td>{`+91 ${member.phone}`}</td>
										<td>{member.email}</td>
										<td>{member.chit_count}</td>
										<td>
											<ActionButton label="View" icon="eye" variant="outline" />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default Members;
