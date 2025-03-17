import Navbar from '../components/Navbar';
import '../styles/Home.css';
import { useState } from 'react';

const Home = () => {
	const [currentDate] = useState(new Date());

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
								<button key={item.id} className="quick-create-item">
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
		</div>
	);
};

export default Home;
