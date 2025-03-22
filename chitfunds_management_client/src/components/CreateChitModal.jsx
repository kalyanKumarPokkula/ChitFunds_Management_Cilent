import { useState } from 'react';
import { z } from 'zod';
import ActionButton from './ActionButton';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';
import '../styles/Modal.css';

const chitSchema = z.object({
	chit_name: z
		.string()
		.min(3, { message: 'Chit name must be at least 3 characters' }),
	chit_amount: z.number().positive({ message: 'Amount must be positive' }),
	duration_months: z
		.number()
		.int()
		.min(1, { message: 'Duration must be at least 1 month' }),
	total_members: z
		.number()
		.int()
		.min(1, { message: 'Total members must be at least 1' }),
	monthly_installment: z
		.number()
		.positive({ message: 'Monthly installment must be positive' }),
	status: z.string(),
	start_date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
		message: 'Invalid date format',
	}),
	end_date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
		message: 'Invalid date format',
	}),
});

const CreateChitModal = ({ isOpen, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		chit_name: '',
		chit_amount: '',
		duration_months: '',
		total_members: '',
		monthly_installment: '',
		status: 'upcoming',
		start_date: '',
		end_date: '',
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { showSuccess, showError } = useNotification();

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Handle numeric inputs
		if (
			[
				'chit_amount',
				'duration_months',
				'total_members',
				'monthly_installment',
			].includes(name)
		) {
			const numValue = value === '' ? '' : Number(value);
			setFormData((prev) => ({ ...prev, [name]: numValue }));

			// If duration is changed and start date exists, update end date
			if (name === 'duration_months' && value && formData.start_date) {
				updateEndDate(formData.start_date, Number(value));
			}
		}
		// Handle start date change to calculate end date
		else if (name === 'start_date' && value) {
			setFormData((prev) => ({ ...prev, [name]: value }));
			if (formData.duration_months) {
				updateEndDate(value, formData.duration_months);
			}
		}
		// Handle other inputs
		else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const updateEndDate = (startDateStr, durationMonths) => {
		const startDate = new Date(startDateStr);
		if (!isNaN(startDate.getTime())) {
			const endDate = new Date(startDate);
			endDate.setMonth(endDate.getMonth() + Number(durationMonths));

			// Format end date as YYYY-MM-DD
			const formattedEndDate = endDate.toISOString().split('T')[0];
			setFormData((prev) => ({ ...prev, end_date: formattedEndDate }));
		}
	};

	const validateForm = () => {
		try {
			// Create a new object with proper number types for validation
			const dataToValidate = {
				...formData,
				chit_amount:
					formData.chit_amount === '' ? 0 : Number(formData.chit_amount),
				duration_months:
					formData.duration_months === ''
						? 0
						: Number(formData.duration_months),
				total_members:
					formData.total_members === '' ? 0 : Number(formData.total_members),
				monthly_installment:
					formData.monthly_installment === ''
						? 0
						: Number(formData.monthly_installment),
			};

			chitSchema.parse(dataToValidate);
			setErrors({});
			return true;
		} catch (err) {
			if (err instanceof z.ZodError) {
				const newErrors = {};
				err.errors.forEach((error) => {
					const field = error.path[0];
					newErrors[field] = error.message;
				});
				setErrors(newErrors);
			}
			return false;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		// Ensure all numbers are properly formatted as numbers for the API
		const submissionData = {
			...formData,
			chit_amount: Number(formData.chit_amount),
			duration_months: Number(formData.duration_months),
			total_members: Number(formData.total_members),
			monthly_installment: Number(formData.monthly_installment),
		};

		try {
			const response = await fetch('http://127.0.0.1:5001/chit-groups', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(submissionData),
			});

			const result = await response.json();

			if (response.ok) {
				showSuccess('Chit scheme created successfully!');

				// Reset form data
				setFormData({
					chit_name: '',
					chit_amount: '',
					duration_months: '',
					total_members: '',
					monthly_installment: '',
					status: 'upcoming',
					start_date: '',
					end_date: '',
				});

				// Close modal after delay to show success message
				setTimeout(() => {
					onSuccess();
					onClose();
				}, 1500);
			} else {
				showError(result.message || 'Failed to create chit scheme');
			}
		} catch (error) {
			console.error('Error creating chit scheme:', error);
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
				type="submit"
				label={isSubmitting ? 'Creating...' : 'Create Scheme'}
				icon={isSubmitting ? 'spinner fa-spin' : 'plus'}
				variant="primary"
				disabled={isSubmitting}
				onClick={handleSubmit}
			/>
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Create New Chit Scheme"
			footer={modalFooter}
			size="large"
		>
			<form className="modal-form" onSubmit={(e) => e.preventDefault()}>
				<div className="form-grid">
					<div className="form-group">
						<label htmlFor="chit_name">Scheme Name</label>
						<input
							type="text"
							id="chit_name"
							name="chit_name"
							value={formData.chit_name}
							onChange={handleChange}
							placeholder="Enter scheme name"
							required
						/>
						{errors.chit_name && (
							<span className="error-message">{errors.chit_name}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="chit_amount">Total Value</label>
						<input
							type="number"
							id="chit_amount"
							name="chit_amount"
							value={formData.chit_amount}
							onChange={handleChange}
							placeholder="Enter total chit value"
							required
						/>
						{errors.chit_amount && (
							<span className="error-message">{errors.chit_amount}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="monthly_installment">Monthly Subscription</label>
						<input
							type="number"
							id="monthly_installment"
							name="monthly_installment"
							value={formData.monthly_installment}
							onChange={handleChange}
							placeholder="Enter monthly subscription amount"
							required
						/>
						{errors.monthly_installment && (
							<span className="error-message">
								{errors.monthly_installment}
							</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="duration_months">Duration (Months)</label>
						<input
							type="number"
							id="duration_months"
							name="duration_months"
							value={formData.duration_months}
							onChange={handleChange}
							placeholder="Enter duration in months"
							required
						/>
						{errors.duration_months && (
							<span className="error-message">{errors.duration_months}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="total_members">Total Members</label>
						<input
							type="number"
							id="total_members"
							name="total_members"
							value={formData.total_members}
							onChange={handleChange}
							placeholder="Enter number of members"
							required
						/>
						{errors.total_members && (
							<span className="error-message">{errors.total_members}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="status">Status</label>
						<select
							id="status"
							name="status"
							value={formData.status}
							onChange={handleChange}
							required
						>
							<option value="upcoming">Upcoming</option>
							<option value="active">Active</option>
							<option value="completed">Completed</option>
						</select>
						{errors.status && (
							<span className="error-message">{errors.status}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="start_date">Start Date</label>
						<input
							type="date"
							id="start_date"
							name="start_date"
							value={formData.start_date}
							onChange={handleChange}
							required
						/>
						{errors.start_date && (
							<span className="error-message">{errors.start_date}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="end_date">End Date</label>
						<input
							type="date"
							id="end_date"
							name="end_date"
							value={formData.end_date}
							onChange={handleChange}
							disabled
							required
						/>
						{errors.end_date && (
							<span className="error-message">{errors.end_date}</span>
						)}
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default CreateChitModal;
