import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import Navbar from '../components/Navbar';
import ActionButton from '../components/ActionButton';
import AddMemberModal from '../components/AddMemberModal';
import LoadingStatus from '../components/ui/LoadingStatus';
import '../styles/Members.css';

const Members = () => {
	const navigate = useNavigate();
	const [members, setMembers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		fetchMembers();
	}, []);

	const fetchMembers = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await apiRequest('/get_users');

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

	const handleViewMember = (userId) => {
		navigate(`/members/${userId}`);
	};

	const handleAddMemberSuccess = () => {
		// Refresh the members list after adding a new member
		fetchMembers();
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
							onClick={() => setIsModalOpen(true)}
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
					<LoadingStatus message="Loading Members..." />
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
									<tr
										key={member.user_id}
										className="member-row"
										onClick={() => handleViewMember(member.user_id)}
									>
										<td>{member.full_name}</td>
										<td>{`+91 ${member.phone}`}</td>
										<td>{member.email ? member.email : 'Email not provided'}</td>
										<td>{member.chit_count}</td>
										<td onClick={(e) => e.stopPropagation()}>
											<ActionButton
												label="View"
												icon="eye"
												variant="outline"
												onClick={() => handleViewMember(member.user_id)}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<AddMemberModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={handleAddMemberSuccess}
			/>
		</div>
	);
};

export default Members;
