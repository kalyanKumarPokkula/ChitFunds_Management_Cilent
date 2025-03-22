import { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';
import '../styles/Modal.css';

const AddLifterModal = ({
	isOpen,
	onClose,
	onSuccess,
	chitId,
	monthNumber,
}) => {
	const [members, setMembers] = useState([]);
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const { showSuccess, showError } = useNotification();

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setSelectedUserId(null);
			setError(null);

			if (chitId) {
				fetchMembers();
			}
		}
	}, [isOpen, chitId]);

	const fetchMembers = async () => {
		try {
			setIsLoading(true);
			setError(null);

			console.log(`Fetching members for chit ${chitId}`);
			const response = await fetch(
				`http://127.0.0.1:5000/get_chit_members?chit_group_id=${chitId}`
			);

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
		};

		try {
			const response = await fetch('http://127.0.0.1:5000/chit-lifted-member', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
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
				Cancel
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
			title={`Select Lifter for Month ${monthNumber}`}
			footer={modalFooter}
			size="medium"
		>
			{isLoading ? (
				<div className="loading-message">
					<i className="fas fa-spinner fa-spin"></i> Loading members...
				</div>
			) : error ? (
				<div className="error-message">
					<i className="fas fa-exclamation-circle"></i> {error}
				</div>
			) : (
				<div className="lifter-selection">
					<p className="selection-info">
						<i className="fas fa-info-circle"></i> Select a member who lifted
						the chit for this month.
					</p>

					<div className="members-list">
						{members.length === 0 ? (
							<div className="empty-message">
								<i className="fas fa-users-slash"></i> No members found
							</div>
						) : (
							members.map((member) => (
								<div
									key={member.user_id}
									className={`member-item ${
										selectedUserId === member.user_id ? 'selected' : ''
									}`}
									onClick={() => handleUserSelect(member.user_id)}
								>
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
				</div>
			)}
		</Modal>
	);
};

export default AddLifterModal;
