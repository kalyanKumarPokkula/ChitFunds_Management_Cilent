import '../styles/Footer.css';

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="footer">
			<div className="footer-container">
				<div className="footer-section">
					<h3>ChitFunds Manager</h3>
					<p>Simplifying chit fund management for organizers and members.</p>
				</div>

				<div className="footer-section">
					<h3>Quick Links</h3>
					<ul className="footer-links">
						<li>
							<a href="/">Home</a>
						</li>
						<li>
							<a href="/chits">Chits</a>
						</li>
						<li>
							<a href="/members">Members</a>
						</li>
						<li>
							<a href="/payments">Payments</a>
						</li>
					</ul>
				</div>

				<div className="footer-section">
					<h3>Contact</h3>
					<p>Email: support@chitfundsmanager.com</p>
					<p>Phone: +91 9876543210</p>
				</div>
			</div>

			<div className="footer-bottom">
				<p>&copy; {currentYear} ChitFunds Manager. All rights reserved.</p>
			</div>
		</footer>
	);
};

export default Footer;
