import { useState, useEffect } from 'react';
import { z } from 'zod';
import ActionButton from './ActionButton';
import Modal from './Modal';
import { useNotification } from '../context/NotificationContext';
import '../styles/Modal.css';

const projectionValidator = z.object({
	month_number: z.number().int().positive(),
	monthly_subcription: z
		.number()
		.positive({ message: 'Monthly subscription must be positive' }),
	total_payout: z
		.number()
		.positive({ message: 'Total payout must be positive' }),
});

const AddProjectionsModal = ({ isOpen, onClose, onSuccess, chitDetails }) => {
	const [projections, setProjections] = useState([]);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { showSuccess, showError } = useNotification();

	// Initialize projections based on chit duration when the modal opens
	useEffect(() => {
		if (isOpen && chitDetails) {
			const initialProjections = [];
			for (let i = 1; i <= chitDetails.duration_months; i++) {
				initialProjections.push({
					month_number: i,
					monthly_subcription: chitDetails.monthly_installment || 0,
					total_payout: chitDetails.chit_amount || 0,
				});
			}
			setProjections(initialProjections);
		}
	}, [isOpen, chitDetails]);

	const handleInputChange = (index, field, value) => {
		const newProjections = [...projections];
		newProjections[index][field] =
			field === 'month_number'
				? parseInt(value, 10)
				: value === ''
				? ''
				: parseFloat(value);
		setProjections(newProjections);

		// Clear specific error when user makes a change
		if (errors[`${index}-${field}`]) {
			const newErrors = { ...errors };
			delete newErrors[`${index}-${field}`];
			setErrors(newErrors);
		}
	};

	const validateForm = () => {
		const newErrors = {};
		let isValid = true;

		projections.forEach((projection, index) => {
			try {
				projectionValidator.parse(projection);
			} catch (err) {
				if (err instanceof z.ZodError) {
					err.errors.forEach((error) => {
						const field = error.path[0];
						newErrors[`${index}-${field}`] = error.message;
						isValid = false;
					});
				}
			}
		});

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		const payload = {
			chit_group_id: chitDetails.chit_group_id,
			monthly_chit_projections: projections,
		};

		try {
			const response = await fetch(
				'http://127.0.0.1:5000/add_monthly_chit_projections',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				}
			);

			const result = await response.json();

			if (response.ok) {
				showSuccess('Projections added successfully!');
				setTimeout(() => {
					onSuccess && onSuccess();
					onClose();
				}, 1500);
			} else {
				showError(result.message || 'Failed to add projections');
			}
		} catch (error) {
			console.error('Error adding projections:', error);
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
				label={isSubmitting ? 'Saving...' : 'Add Projections'}
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
			title={`${chitDetails?.chit_name || 'Chit'} Projections`}
			footer={modalFooter}
			size="large"
		>
			<div className="projections-form">
				<div className="projections-header">
					<div className="month-header">Month</div>
					<div className="subscription-header">Monthly Subscription (₹)</div>
					<div className="payout-header">Total Payout (₹)</div>
				</div>

				<div className="projections-list">
					{projections.map((projection, index) => (
						<div key={index} className="projection-item">
							<div className="month-field">
								<input
									type="number"
									value={projection.month_number}
									onChange={(e) =>
										handleInputChange(index, 'month_number', e.target.value)
									}
									disabled
								/>
								{errors[`${index}-month_number`] && (
									<span className="error-message">
										{errors[`${index}-month_number`]}
									</span>
								)}
							</div>

							<div className="subscription-field">
								<input
									type="number"
									value={projection.monthly_subcription}
									onChange={(e) =>
										handleInputChange(
											index,
											'monthly_subcription',
											e.target.value
										)
									}
								/>
								{errors[`${index}-monthly_subcription`] && (
									<span className="error-message">
										{errors[`${index}-monthly_subcription`]}
									</span>
								)}
							</div>

							<div className="payout-field">
								<input
									type="number"
									value={projection.total_payout}
									onChange={(e) =>
										handleInputChange(index, 'total_payout', e.target.value)
									}
								/>
								{errors[`${index}-total_payout`] && (
									<span className="error-message">
										{errors[`${index}-total_payout`]}
									</span>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="help-text">
					<p>
						<i className="fas fa-info-circle"></i> Enter the monthly
						subscription amount and total payout for each month. The month
						numbers are fixed based on the chit duration.
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default AddProjectionsModal;
