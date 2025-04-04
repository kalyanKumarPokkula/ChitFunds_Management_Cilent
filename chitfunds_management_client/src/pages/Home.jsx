import Navbar from '../components/Navbar';
import '../styles/Home.css';
import PaymentStats from '../components/PaymentStats';
import AddMemberModal from '../components/AddMemberModal';
import CreateChitModal from '../components/CreateChitModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { useState } from 'react';

const Home = () => {
	const [currentDate] = useState(new Date());
	const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
	const [isChitModalOpen, setIsChitModalOpen] = useState(false);
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

	const quickCreateItems = [
		{ id: 'member', icon: '👤', label: 'New Member' },
		{ id: 'chit', icon: '📄', label: 'New Chit' },
		{ id: 'event', icon: '📅', label: 'New Event' },
		{ id: 'task', icon: '📝', label: 'New Task' },
		{ id: 'note', icon: '📌', label: 'New Note' },
		{ id: 'call', icon: '📞', label: 'New Call' },
		{ id: 'message', icon: '💬', label: 'Send Message' },
		{ id: 'payment', icon: '💳', label: 'New Payment' },
	];

	const recentActivities = [
		{
			type: 'member',
			icon: '👤',
			title: 'New member registered',
			description: 'Srikanth Reddy joined the Dhanalakshmi Chit Scheme',
			time: '2 hours ago',
		},
		{
			type: 'payment',
			icon: '💰',
			title: 'Payment received',
			description: '₹25,000 received for Srinivas Chit Scheme',
			time: '5 hours ago',
		},
		{
			type: 'chit',
			icon: '📄',
			title: 'New chit scheme created',
			description: '50 Lakh Value Chit Scheme created with 20 members',
			time: '1 day ago',
		},
	];

	const handleQuickCreate = (itemId) => {
		switch (itemId) {
			case 'member':
				setIsMemberModalOpen(true);
				break;
			case 'chit':
				setIsChitModalOpen(true);
				break;
			case 'payment':
				setIsPaymentModalOpen(true);
				break;
			// Add more cases for other quick create items as needed
			default:
				console.log(`Quick create action for ${itemId} not implemented yet`);
		}
	};

	const handleMemberSuccess = () => {
		// Handle member creation success - could refresh data if needed
		console.log('Member added successfully');
	};

	const handleChitSuccess = () => {
		// Handle chit creation success - could refresh data if needed
		console.log('Chit created successfully');
	};

	const handlePaymentSuccess = () => {
		// Handle payment creation success
		console.log('Payment recorded successfully');
	};

	return (
		<div className="dashboard">
			<Navbar />

			<div className="dashboard-content">
				<div className="dashboard-header">
					<div className="header-left">
						<h1>Dashboard</h1>
						<p>Welcome back, your chit fund overview for today</p>
					</div>
				</div>

				{/* Payment Statistics Component */}
				<PaymentStats />

				{/* <div className="stats-grid">
					<div className="stat-card trust">
						<h3>TRUST</h3>
						<h2>₹9,723.50</h2>
						<span className="currency">USD</span>
					</div>
					<div className="stat-card paid">
						<h3>PAID</h3>
						<h2>₹5,300.00</h2>
						<span className="currency">USD</span>
					</div>
					<div className="stat-card due">
						<h3>DUE</h3>
						<h2>₹349,489.42</h2>
						<span className="currency">USD</span>
					</div>
					<div className="stat-card billable">
						<h3>BILLABLE</h3>
						<h2>₹87.50</h2>
						<span className="currency">USD</span>
					</div>
				</div> */}

				<div className="dashboard-grid">
					<div className="quick-create section-card">
						<h2>Quick Create</h2>
						<div className="quick-create-grid">
							{quickCreateItems.map((item) => (
								<button
									key={item.id}
									className="quick-create-item"
									onClick={() => handleQuickCreate(item.id)}
								>
									<span className="icon">{item.icon}</span>
									<span className="label">{item.label}</span>
								</button>
							))}
						</div>
					</div>

					<div className="recent-activity section-card">
						<h2>Recent Activity</h2>
						<div className="activity-list">
							{recentActivities.map((activity, index) => (
								<div key={index} className="activity-item">
									<span className={`activity-icon ${activity.type}`}>
										{activity.icon}
									</span>
									<div className="activity-content">
										<h3>{activity.title}</h3>
										<p>{activity.description}</p>
										<span className="activity-time">{activity.time}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Modals */}
			<AddMemberModal
				isOpen={isMemberModalOpen}
				onClose={() => setIsMemberModalOpen(false)}
				onSuccess={handleMemberSuccess}
			/>

			<CreateChitModal
				isOpen={isChitModalOpen}
				onClose={() => setIsChitModalOpen(false)}
				onSuccess={handleChitSuccess}
			/>

			<RecordPaymentModal
				isOpen={isPaymentModalOpen}
				onClose={() => setIsPaymentModalOpen(false)}
				onPaymentAdded={handlePaymentSuccess}
			/>
		</div>
	);
};

export default Home;
