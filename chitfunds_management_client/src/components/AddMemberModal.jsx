import { useState } from 'react';
import { z } from 'zod';
import ActionButton from './ActionButton';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';
import '../styles/Modal.css';

const memberSchema = z.object({
	full_name: z
		.string()
		.min(3, { message: 'Full name must be at least 3 characters' }),
	email: z.string().email({ message: 'Please enter a valid email address' }),
	phone: z
		.string()
		.min(10, { message: 'Phone number must be at least 10 digits' })
		.regex(/^\d+$/, { message: 'Phone number must contain only digits' }),
	aadhaar_number: z
		.string()
		.regex(/^(\d{12})?$/, {
			message: 'Aadhaar number must be 12 digits or empty',
		})
		.optional()
		.or(z.literal('')),
	pan_number: z
		.string()
		.regex(/^([A-Z]{5}[0-9]{4}[A-Z]{1})?$/, {
			message: 'PAN must be in valid format (e.g., ABCDE1234F) or empty',
		})
		.optional()
		.or(z.literal('')),
	address: z.string().min(5, { message: 'Address is required' }),
	city: z.string().min(2, { message: 'City is required' }),
	state: z.string().min(2, { message: 'State is required' }),
	pincode: z
		.string()
		.min(6, { message: 'Pincode must be at least 6 digits' })
		.regex(/^\d+$/, { message: 'Pincode must contain only digits' }),
});

const AddMemberModal = ({ isOpen, onClose, onSuccess }) => {
	const [formData, setFormData] = useState({
		full_name: '',
		email: '',
		phone: '',
		aadhaar_number: '',
		pan_number: '',
		address: '',
		city: '',
		state: '',
		pincode: '',
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { showSuccess, showError } = useNotification();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const validateForm = () => {
		try {
			memberSchema.parse(formData);
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

		try {
			console.log(formData);

			const response = await fetch('http://127.0.0.1:5001/create_new_user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();
			console.log(result);

			if (response.ok) {
				showSuccess('Member added successfully!');

				// Reset form data
				setFormData({
					full_name: '',
					email: '',
					phone: '',
					aadhaar_number: '',
					pan_number: '',
					address: '',
					city: '',
					state: '',
					pincode: '',
				});

				// Close modal after delay to show success message
				setTimeout(() => {
					onSuccess();
					onClose();
				}, 1500);
			} else {
				showError(result.message || 'Failed to add member');
			}
		} catch (error) {
			console.error('Error adding member:', error);
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
				label={isSubmitting ? 'Adding...' : 'Add Member'}
				icon={isSubmitting ? 'spinner fa-spin' : 'user-plus'}
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
			title="Add New Member"
			footer={modalFooter}
			size="large"
		>
			<form className="modal-form" onSubmit={(e) => e.preventDefault()}>
				<div className="form-grid">
					<div className="form-group">
						<label htmlFor="full_name">
							Full Name <span className="required">*</span>
						</label>
						<input
							type="text"
							id="full_name"
							name="full_name"
							value={formData.full_name}
							onChange={handleChange}
							placeholder="Enter full name"
							required
						/>
						{errors.full_name && (
							<span className="error-message">{errors.full_name}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="email">
							Email <span className="required">*</span>
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Enter email address"
							required
						/>
						{errors.email && (
							<span className="error-message">{errors.email}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="phone">
							Phone <span className="required">*</span>
						</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							placeholder="Enter phone number"
							required
						/>
						{errors.phone && (
							<span className="error-message">{errors.phone}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="aadhaar_number">Aadhaar Number</label>
						<input
							type="text"
							id="aadhaar_number"
							name="aadhaar_number"
							value={formData.aadhaar_number}
							onChange={handleChange}
							placeholder="Enter Aadhaar number (optional)"
						/>
						{errors.aadhaar_number && (
							<span className="error-message">{errors.aadhaar_number}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="pan_number">PAN Number</label>
						<input
							type="text"
							id="pan_number"
							name="pan_number"
							value={formData.pan_number}
							onChange={handleChange}
							placeholder="Enter PAN number (optional)"
						/>
						{errors.pan_number && (
							<span className="error-message">{errors.pan_number}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="address">
							Address <span className="required">*</span>
						</label>
						<input
							type="text"
							id="address"
							name="address"
							value={formData.address}
							onChange={handleChange}
							placeholder="Enter address"
							required
						/>
						{errors.address && (
							<span className="error-message">{errors.address}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="city">
							City <span className="required">*</span>
						</label>
						<input
							type="text"
							id="city"
							name="city"
							value={formData.city}
							onChange={handleChange}
							placeholder="Enter city"
							required
						/>
						{errors.city && (
							<span className="error-message">{errors.city}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="state">
							State <span className="required">*</span>
						</label>
						<input
							type="text"
							id="state"
							name="state"
							value={formData.state}
							onChange={handleChange}
							placeholder="Enter state"
							required
						/>
						{errors.state && (
							<span className="error-message">{errors.state}</span>
						)}
					</div>

					<div className="form-group">
						<label htmlFor="pincode">
							Pincode <span className="required">*</span>
						</label>
						<input
							type="text"
							id="pincode"
							name="pincode"
							value={formData.pincode}
							onChange={handleChange}
							placeholder="Enter pincode"
							required
						/>
						{errors.pincode && (
							<span className="error-message">{errors.pincode}</span>
						)}
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default AddMemberModal;
