import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/Pages.css';

const Payments = () => {
	return (
		<div className="page">
			<Navbar />

			<div className="page-header">
				<h1>Payments Management</h1>
				<p>Record, track, and manage payments for your chit funds</p>
			</div>

			<div className="page-content">
				<div className="action-bar">
					<Button variant="primary" size="medium">
						Record New Payment
					</Button>
					<div className="filter-container">
						<select className="filter-select">
							<option value="">All Chits</option>
							<option value="chit1">Monthly Chit - ₹1,00,000</option>
							<option value="chit2">Quarterly Chit - ₹5,00,000</option>
							<option value="chit3">Annual Chit - ₹12,00,000</option>
						</select>
						<select className="filter-select">
							<option value="">All Payment Status</option>
							<option value="paid">Paid</option>
							<option value="pending">Pending</option>
							<option value="overdue">Overdue</option>
						</select>
						<Button variant="secondary" size="medium">
							Apply Filters
						</Button>
					</div>
				</div>

				<div className="summary-cards">
					<Card title="Total Payments" className="card-primary">
						<h2 className="summary-value">₹12,50,000</h2>
						<p className="summary-label">All time</p>
					</Card>

					<Card title="Pending Payments" className="card-warning">
						<h2 className="summary-value">₹75,000</h2>
						<p className="summary-label">Current cycle</p>
					</Card>

					<Card title="Overdue Payments" className="card-danger">
						<h2 className="summary-value">₹25,000</h2>
						<p className="summary-label">Needs attention</p>
					</Card>

					<Card title="Next Auction Date" className="card-info">
						<h2 className="summary-value">15 May 2024</h2>
						<p className="summary-label">Monthly Chit</p>
					</Card>
				</div>

				<div className="table-container">
					<h3 className="section-subtitle">Recent Payments</h3>
					<table className="data-table">
						<thead>
							<tr>
								<th>Payment ID</th>
								<th>Member</th>
								<th>Chit Fund</th>
								<th>Amount</th>
								<th>Date</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>P001</td>
								<td>Rahul Sharma</td>
								<td>Monthly Chit</td>
								<td>₹5,000</td>
								<td>01/05/2024</td>
								<td>
									<span className="status-paid">Paid</span>
								</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Receipt
									</Button>
								</td>
							</tr>
							<tr>
								<td>P002</td>
								<td>Priya Patel</td>
								<td>Monthly Chit</td>
								<td>₹5,000</td>
								<td>02/05/2024</td>
								<td>
									<span className="status-paid">Paid</span>
								</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Receipt
									</Button>
								</td>
							</tr>
							<tr>
								<td>P003</td>
								<td>Amit Kumar</td>
								<td>Quarterly Chit</td>
								<td>₹50,000</td>
								<td>30/04/2024</td>
								<td>
									<span className="status-paid">Paid</span>
								</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Receipt
									</Button>
								</td>
							</tr>
							<tr>
								<td>P004</td>
								<td>Sneha Reddy</td>
								<td>Monthly Chit</td>
								<td>₹5,000</td>
								<td>-</td>
								<td>
									<span className="status-pending">Pending</span>
								</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="success" size="small">
										Record
									</Button>
								</td>
							</tr>
							<tr>
								<td>P005</td>
								<td>Vikram Singh</td>
								<td>Monthly Chit</td>
								<td>₹5,000</td>
								<td>-</td>
								<td>
									<span className="status-overdue">Overdue</span>
								</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="success" size="small">
										Record
									</Button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div className="pagination">
					<Button variant="secondary" size="small">
						Previous
					</Button>
					<span className="page-info">Page 1 of 5</span>
					<Button variant="secondary" size="small">
						Next
					</Button>
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default Payments;
