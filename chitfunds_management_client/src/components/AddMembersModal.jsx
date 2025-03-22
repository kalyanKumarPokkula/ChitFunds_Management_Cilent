import { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';
import '../styles/Modal.css';

const AddMembersModal = ({ isOpen, onClose, chitId, onSuccess }) => {
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { showSuccess, showError } = useNotification();

	useEffect(() => {
		if (isOpen) {
			fetchUsers();
			// Reset states when modal opens
			setSelectedUsers([]);
			setSearchQuery('');
		}
	}, [isOpen]);

	const fetchUsers = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await fetch('http://127.0.0.1:5000/users');

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();
			setUsers(result.data);
			setFilteredUsers(result.data);
		} catch (error) {
			console.error('Error fetching users:', error);
			setError('Failed to load users. Please try again later.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearchChange = (e) => {
		const query = e.target.value.toLowerCase();
		setSearchQuery(query);

		const filtered = users.filter(
			(user) =>
				user.full_name.toLowerCase().includes(query) ||
				user.email.toLowerCase().includes(query) ||
				user.phone.includes(query)
		);

		setFilteredUsers(filtered);
	};

	const handleUserSelect = (userId) => {
		setSelectedUsers((prevSelected) => {
			if (prevSelected.includes(userId)) {
				return prevSelected.filter((id) => id !== userId);
			} else {
				return [...prevSelected, userId];
			}
		});
	};

	const handleSelectAll = () => {
		if (selectedUsers.length === filteredUsers.length) {
			// If all are selected, deselect all
			setSelectedUsers([]);
		} else {
			// Otherwise select all filtered users
			setSelectedUsers(filteredUsers.map((user) => user.user_id));
		}
	};

	const handleSubmit = async () => {
		if (selectedUsers.length === 0) {
			showError('Please select at least one user to add');
			return;
		}

		try {
			setIsSubmitting(true);

			const payload = {
				chit_group_id: chitId,
				user_ids: selectedUsers,
			};

			console.log(payload);

			const response = await fetch('http://127.0.0.1:5000/add_chit_members', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || `HTTP error! Status: ${response.status}`
				);
			}

			showSuccess('Members added successfully!');
			setTimeout(() => {
				onSuccess && onSuccess();
				onClose();
			}, 1000);
		} catch (error) {
			console.error('Error adding members:', error);
			showError(error.message || 'Failed to add members. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const modalFooter = (
		<>
			<ActionButton label="Cancel" variant="secondary" onClick={onClose} />
			<ActionButton
				label={isSubmitting ? 'Adding...' : 'Add Selected Members'}
				variant="primary"
				icon={isSubmitting ? 'spinner fa-spin' : 'user-plus'}
				onClick={handleSubmit}
				disabled={isSubmitting || selectedUsers.length === 0}
			/>
		</>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Add Members"
			footer={modalFooter}
			size="medium"
		>
			{isLoading ? (
				<div className="loading-message">
					<i className="fas fa-spinner fa-spin"></i> Loading users...
				</div>
			) : error ? (
				<div className="error-message">
					<i className="fas fa-exclamation-circle"></i> {error}
				</div>
			) : (
				<>
					<div className="search-and-select">
						<div className="search-box">
							<i className="fas fa-search search-icon"></i>
							<input
								type="text"
								placeholder="Search users..."
								value={searchQuery}
								onChange={handleSearchChange}
							/>
						</div>
						<button className="select-all-button" onClick={handleSelectAll}>
							{selectedUsers.length === filteredUsers.length
								? 'Deselect All'
								: 'Select All'}
						</button>
					</div>

					{filteredUsers.length === 0 ? (
						<div className="empty-message">
							<i className="fas fa-users-slash"></i> No users found
						</div>
					) : (
						<div className="users-list">
							{filteredUsers.map((user) => (
								<div
									key={user.user_id}
									className={`user-item ${
										selectedUsers.includes(user.user_id) ? 'selected' : ''
									}`}
									onClick={() => handleUserSelect(user.user_id)}
								>
									<div className="checkbox">
										{selectedUsers.includes(user.user_id) && (
											<i className="fas fa-check"></i>
										)}
									</div>
									<div className="user-info">
										<div className="user-name">{user.full_name}</div>
										<div className="user-details">
											<span>
												<i className="fas fa-envelope"></i> {user.email}
											</span>
											<span>
												<i className="fas fa-phone"></i> {user.phone}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</>
			)}
		</Modal>
	);
};

export default AddMembersModal;
