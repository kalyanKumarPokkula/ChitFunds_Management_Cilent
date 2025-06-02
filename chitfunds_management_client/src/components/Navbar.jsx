import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [activePage, setActivePage] = useState('/');
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const navigate = useNavigate();
	const fullName = localStorage.getItem('full_name') || 'User';

	useEffect(() => {
		// Set the active page based on the current URL path
		const path = window.location.pathname;
		setActivePage(path);

		// Listen for navigation changes
		const handleNavChange = (event) => {
			setActivePage(event.detail.path);
		};

		// Close profile menu when clicking outside
		const handleClickOutside = (event) => {
			if (!event.target.closest('.profile-menu-container')) {
				setShowProfileMenu(false);
			}
		};

		window.addEventListener('navchange', handleNavChange);
		document.addEventListener('click', handleClickOutside);

		return () => {
			window.removeEventListener('navchange', handleNavChange);
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	const handleLogout = () => {
		// Clear all items from localStorage
		localStorage.removeItem('access_token');
		localStorage.removeItem('user_role');
		localStorage.removeItem('user_id');
		localStorage.removeItem('full_name');
		
		// Redirect to login page
		navigate('/login');
	};

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<div className="navbar-logo">
					<h1>ChitMate</h1>
				</div>

				<div className="nav-menu">
					<a
						href="/"
						className={`nav-item ${activePage === '/' ? 'active' : ''}`}
					>
						<i className="fas fa-home"></i>
						<span>Home</span>
					</a>
					<a
						href="/chits"
						className={`nav-item ${activePage === '/chits' ? 'active' : ''}`}
					>
						<i className="fas fa-file-alt"></i>
						<span>Chits</span>
					</a>
					<a
						href="/members"
						className={`nav-item ${activePage === '/members' ? 'active' : ''}`}
					>
						<i className="fas fa-users"></i>
						<span>Members</span>
					</a>
					<a
						href="/payments"
						className={`nav-item ${activePage === '/payments' ? 'active' : ''}`}
					>
						<i className="fas fa-money-bill"></i>
						<span>Payments</span>
					</a>
				</div>

				<div className="navbar-right">
					{/* <button className="icon-button">
						<i className="fas fa-search"></i>
					</button>
					<button className="icon-button">
						<i className="fas fa-bell"></i>
					</button> */}
					<div className="profile-menu-container">
						<button 
							className="profile-button"
							onClick={(e) => {
								e.stopPropagation();
								setShowProfileMenu(!showProfileMenu);
							}}
						>
							<div className="profile-circle">
								{fullName.charAt(0).toUpperCase()}
							</div>
						</button>
						{showProfileMenu && (
							<div className="profile-menu">
								<div className="profile-info">
									<span className="profile-name">{fullName}</span>
								</div>
								<div className="profile-menu-divider" />
								<button className="logout-button" onClick={handleLogout}>
									<i className="fas fa-sign-out-alt"></i>
									<span>Logout</span>
								</button>
							</div>
						)}
					</div>
				</div>

				<div className="menu-icon" onClick={toggleMenu}>
					<i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
