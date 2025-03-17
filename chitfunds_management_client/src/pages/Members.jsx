import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/Pages.css';

const Members = () => {
	return (
		<div className="page">
			<Navbar />

			<div className="page-header">
				<h1>Members Management</h1>
				<p>Add, view, and manage members of your chit funds</p>
			</div>

			<div className="page-content">
				<div className="action-bar">
					<Button variant="primary" size="medium">
						Add New Member
					</Button>
					<div className="search-container">
						<input
							type="text"
							placeholder="Search members..."
							className="search-input"
						/>
						<Button variant="secondary" size="medium">
							Search
						</Button>
					</div>
				</div>

				<div className="table-container">
					<table className="data-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Phone</th>
								<th>Email</th>
								<th>Joined Date</th>
								<th>Active Chits</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>M001</td>
								<td>Rahul Sharma</td>
								<td>+91 9876543210</td>
								<td>rahul.sharma@example.com</td>
								<td>01/01/2023</td>
								<td>2</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Edit
									</Button>
								</td>
							</tr>
							<tr>
								<td>M002</td>
								<td>Priya Patel</td>
								<td>+91 9876543211</td>
								<td>priya.patel@example.com</td>
								<td>15/02/2023</td>
								<td>1</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Edit
									</Button>
								</td>
							</tr>
							<tr>
								<td>M003</td>
								<td>Amit Kumar</td>
								<td>+91 9876543212</td>
								<td>amit.kumar@example.com</td>
								<td>10/03/2023</td>
								<td>3</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Edit
									</Button>
								</td>
							</tr>
							<tr>
								<td>M004</td>
								<td>Sneha Reddy</td>
								<td>+91 9876543213</td>
								<td>sneha.reddy@example.com</td>
								<td>05/04/2023</td>
								<td>2</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Edit
									</Button>
								</td>
							</tr>
							<tr>
								<td>M005</td>
								<td>Vikram Singh</td>
								<td>+91 9876543214</td>
								<td>vikram.singh@example.com</td>
								<td>20/05/2023</td>
								<td>1</td>
								<td className="action-cell">
									<Button variant="primary" size="small">
										View
									</Button>
									<Button variant="secondary" size="small">
										Edit
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
					<span className="page-info">Page 1 of 3</span>
					<Button variant="secondary" size="small">
						Next
					</Button>
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default Members;
