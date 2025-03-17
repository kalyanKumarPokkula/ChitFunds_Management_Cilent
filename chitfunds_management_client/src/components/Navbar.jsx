import { useState } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<div className="navbar-logo">
					<h1>ChitMate</h1>
				</div>

				<div className="nav-menu">
					<a href="/" className="nav-item active">
						<i className="fas fa-home"></i>
						<span>Home</span>
					</a>
					<a href="/chits" className="nav-item">
						<i className="fas fa-file-alt"></i>
						<span>Chits</span>
					</a>
					<a href="/members" className="nav-item">
						<i className="fas fa-users"></i>
						<span>Members</span>
					</a>
					<a href="/payments" className="nav-item">
						<i className="fas fa-money-bill"></i>
						<span>Payments</span>
					</a>
				</div>

				<div className="navbar-right">
					<button className="icon-button">
						<i className="fas fa-search"></i>
					</button>
					<button className="icon-button">
						<i className="fas fa-bell"></i>
					</button>
					<button className="profile-button">
						<img
							src="https://via.placeholder.com/32"
							alt="Profile"
							className="profile-image"
						/>
					</button>
				</div>

				<div className="menu-icon" onClick={toggleMenu}>
					<i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
