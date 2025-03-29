import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserDetails from '../components/UserDetails';
import ChitFundSummary from '../components/ChitFundSummary';
import ActiveChits from '../components/ActiveChits';
import '../styles/MemberDetails.css';

const MemberDetails = () => {
	const { userId } = useParams();
	const [memberData, setMemberData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchMemberDetails();
	}, [userId]);

	const fetchMemberDetails = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(
				`http://127.0.0.1:5001/user_details?user_id=${userId}`
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			setMemberData(data);
		} catch (err) {
			console.error('Error fetching member details:', err);
			setError('Failed to load member details. Please try again later.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="member-details-page">
			<Navbar />

			<div className="page-container">
				<div className="back-link">
					<Link to="/members">
						<i className="fas fa-arrow-left"></i> Back to Members
					</Link>
				</div>

				<h1>Member Details</h1>

				{isLoading ? (
					<div className="loading-indicator">
						<i className="fas fa-spinner fa-spin"></i> Loading member details...
					</div>
				) : error ? (
					<div className="error-message">
						<i className="fas fa-exclamation-triangle"></i> {error}
					</div>
				) : memberData ? (
					<div className="member-details-content">
						<div className="member-profile-grid">
							<div className="profile-info">
								<UserDetails user={memberData.user} />
							</div>
							<div className="profile-summary">
								<ChitFundSummary
									chitCount={memberData.chit_count}
									paymentOverdues={memberData.payment_overdues}
								/>
							</div>
						</div>

						<ActiveChits
							currentMonthPayments={memberData.current_month_payment}
						/>
					</div>
				) : (
					<div className="no-data-message">
						<i className="fas fa-user-slash"></i>
						<p>No member found with the provided ID.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MemberDetails;
