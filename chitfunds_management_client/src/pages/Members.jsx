import Navbar from '../components/Navbar';
import '../styles/Members.css';
import { useState } from 'react';

const Members = () => {
	const [searchQuery, setSearchQuery] = useState('');

	const members = [
		{
			id: 1,
			name: 'Ramesh Kumar',
			phone: '+91 98765 43210',
			email: 'ramesh@example.com',
			activeChits: 3,
			totalValue: '₹15,00,000',
			status: 'Active',
		},
		{
			id: 2,
			name: 'Suresh Reddy',
			phone: '+91 87654 32109',
			email: 'suresh@example.com',
			activeChits: 2,
			totalValue: '₹10,00,000',
			status: 'Active',
		},
		{
			id: 3,
			name: 'Priya Sharma',
			phone: '+91 76543 20987',
			email: 'priya@example.com',
			activeChits: 1,
			totalValue: '₹5,00,000',
			status: 'Active',
		},
		{
			id: 4,
			name: 'Kiran Patel',
			phone: '+91 65432 10987',
			email: 'kiran@example.com',
			activeChits: 4,
			totalValue: '₹20,00,000',
			status: 'Active',
		},
		{
			id: 5,
			name: 'Lakshmi Devi',
			phone: '+91 54321 09876',
			email: 'lakshmi@example.com',
			activeChits: 2,
			totalValue: '₹10,00,000',
			status: 'Inactive',
		},
	];

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const filteredMembers = members.filter((member) =>
		Object.values(member).some((value) =>
			value.toString().toLowerCase().includes(searchQuery.toLowerCase())
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
						<button className="add-member-button">
							<i className="fas fa-plus"></i> Add New Member
						</button>
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

				<div className="table-container">
					<table className="members-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Phone</th>
								<th>Email</th>
								<th>Active Chits</th>
								<th>Total Value</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredMembers.map((member) => (
								<tr key={member.id}>
									<td>{member.name}</td>
									<td>{member.phone}</td>
									<td>{member.email}</td>
									<td>{member.activeChits}</td>
									<td>{member.totalValue}</td>
									<td>
										<span
											className={`status-badge ${member.status.toLowerCase()}`}
										>
											{member.status}
										</span>
									</td>
									<td>
										<button className="action-button">View</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default Members;
