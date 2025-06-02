import { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';
import '../styles/Modal.css';
import { apiRequest } from '../utils/api';

const AddLifterModal = ({
	isOpen,
	onClose,
	onSuccess,
	chitId,
	monthNumber,
}) => {
	const [members, setMembers] = useState([]);
	const [filteredMembers, setFilteredMembers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [note, setNote] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const { showSuccess, showError } = useNotification();

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setSelectedUserId(null);
			setNote('');
			setSearchQuery('');
			setError(null);

			if (chitId) {
				fetchMembers();
			}
		}
	}, [isOpen, chitId]);

	// Filter members when search query changes
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredMembers(members);
			return;
		}

		const filtered = members.filter((member) =>
			member.full_name.toLowerCase().includes(searchQuery.toLowerCase())
		);
		setFilteredMembers(filtered);
	}, [searchQuery, members]);

	const fetchMembers = async () => {
		try {
			setIsLoading(true);
			setError(null);

			console.log(`Fetching members for chit ${chitId}`);
			const response = await apiRequest(`/get_chit_members?chit_group_id=${chitId}`);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Members data:', result);

			// Filter to only include members who haven't lifted yet
			const availableMembers = result.data
				? result.data.filter((member) => member.is_lifted !== 'TRUE')
				: [];

			console.log('Available members:', availableMembers);
			setMembers(availableMembers);
			setFilteredMembers(availableMembers);
		} catch (error) {
			console.error('Error fetching members:', error);
			setError('Failed to load members. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleUserSelect = (userId) => {
		setSelectedUserId(userId);
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const clearSearch = () => {
		setSearchQuery('');
	};

	const handleSubmit = async () => {
		if (!selectedUserId) {
			showError('Please select a member');
			return;
		}

		setIsSubmitting(true);

		const payload = {
			user_id: selectedUserId,
			month_number: monthNumber,
			chit_group_id: chitId,
			note: note
		};

		try {
			const response = await apiRequest('/chit-lifted-member', {
				method: 'PATCH',
				body: JSON.stringify(payload),
			});

			const result = await response.json();

			if (response.ok) {
				showSuccess('Lifter added successfully!');
				setTimeout(() => {
					onSuccess && onSuccess();
					onClose();
				}, 1500);
			} else {
				showError(result.message || 'Failed to add lifter');
			}
		} catch (error) {
			console.error('Error adding lifter:', error);
			showError('Network error. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const modalFooter = (
		<div className="form-actions">
			<button
				type="button"
				className="cancel-button"
				onClick={onClose}
				disabled={isSubmitting}
			>
				<i className="fas fa-times"></i> Cancel
			</button>
			<ActionButton
				label={isSubmitting ? 'Saving...' : 'Add Lifter'}
				icon={isSubmitting ? 'spinner fa-spin' : 'user-check'}
				variant="primary"
				disabled={isSubmitting || !selectedUserId}
				onClick={handleSubmit}
			/>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				<div className="modal-title-with-icon">
					<i className="fas fa-trophy text-indigo-500"></i>
					<span>Select Lifter for Month {monthNumber}</span>
				</div>
			}
			footer={modalFooter}
			size="medium"
		>
			{isLoading ? (
				<div className="loading-container">
					<div className="loading-spinner">
						<i className="fas fa-spinner fa-spin"></i>
					</div>
					<p>Loading members...</p>
				</div>
			) : error ? (
				<div className="error-message">
					<i className="fas fa-exclamation-circle"></i> {error}
				</div>
			) : (
				<div className="lifter-selection">
					<div className="selection-header">
						<div className="selection-info">
							<i className="fas fa-info-circle"></i> 
							<span>Select a member who lifted the chit for this month.</span>
						</div>

						<div className="members-count">
							<span>{members.length}</span> eligible {members.length === 1 ? 'member' : 'members'}
						</div>
					</div>

						{members.length === 0 ? (
						<div className="empty-members">
							<div className="empty-icon">
								<i className="fas fa-users-slash"></i>
							</div>
							<p>No eligible members found</p>
							<span>All members have already lifted in this chit</span>
						</div>
					) : (
						<>
							<div className="search-container">
								<div className="search-input-wrapper">
									<i className="fas fa-search search-icon"></i>
									<input
										type="text"
										className="search-input"
										placeholder="Search members by name..."
										value={searchQuery}
										onChange={handleSearchChange}
									/>
									{searchQuery && (
										<button className="clear-search" onClick={clearSearch}>
											<i className="fas fa-times-circle"></i>
										</button>
									)}
								</div>
							</div>

							<div className="members-list">
								{filteredMembers.length === 0 ? (
									<div className="no-search-results">
										<i className="fas fa-search"></i>
										<p>No members found matching "{searchQuery}"</p>
										<button onClick={clearSearch} className="reset-search-btn">
											Clear search
										</button>
							</div>
						) : (
									filteredMembers.map((member) => (
								<div
									key={member.user_id}
									className={`member-item ${
										selectedUserId === member.user_id ? 'selected' : ''
									}`}
									onClick={() => handleUserSelect(member.user_id)}
								>
											<div className="member-avatar">
												{member.full_name.charAt(0).toUpperCase()}
											</div>
									<div className="radio-button">
										{selectedUserId === member.user_id && (
											<i className="fas fa-check"></i>
										)}
									</div>
									<div className="member-info">
										<div className="member-name">{member.full_name}</div>
										<div className="member-details">
											<span>
												<i className="fas fa-envelope"></i> {member.email}
											</span>
											<span>
												<i className="fas fa-phone"></i> {member.phone}
											</span>
										</div>
									</div>
								</div>
							))
								)}
							</div>
						</>
					)}

					<div className="note-input-container">
						<label htmlFor="lifter-note" className="note-label">
							<i className="fas fa-sticky-note"></i> Add Transaction Note
						</label>
						<textarea
							id="lifter-note"
							className="note-textarea"
							placeholder="Enter details about this transaction (e.g., payment method, special terms, etc.)"
							value={note}
							onChange={(e) => setNote(e.target.value)}
							rows={3}
						/>
						{note && (
							<div className="note-character-count">
								{note.length} character{note.length !== 1 ? 's' : ''}
							</div>
						)}
					</div>
				</div>
			)}
		</Modal>
	);
};

export default AddLifterModal;
