import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import UserProfileModal from './UserProfileModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activePage, setActivePage] = useState('/');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const navigate = useNavigate();
    const fullName = localStorage.getItem('full_name') || 'Priya Verma';

    useEffect(() => {
        const path = window.location.pathname;
        setActivePage(path);
        const handleNavChange = (event) => {
            setActivePage(event.detail.path);
        };
        window.addEventListener('navchange', handleNavChange);
        return () => {
            window.removeEventListener('navchange', handleNavChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        localStorage.removeItem('full_name');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <span className="logo-gradient">ChitMate</span>
                </div>
                <div className="nav-menu">
                    <a href="/" className={`nav-item ${activePage === '/' ? 'active' : ''}`}>Home</a>
                    <a href="/chits" className={`nav-item ${activePage === '/chits' ? 'active' : ''}`}>Chits</a>
                    <a href="/members" className={`nav-item ${activePage === '/members' ? 'active' : ''}`}>Members</a>
                    <a href="/payments" className={`nav-item ${activePage === '/payments' ? 'active' : ''}`}>Payments</a>
                </div>
                <div className="navbar-right">
                    <button className="profile-btn" onClick={() =>{
                        console.log('Profile button clicked');
                         
                        setShowProfileModal(true)}}>
                        <span className="profile-avatar">{fullName.charAt(0).toUpperCase()}</span>
                        <span className="profile-name">{fullName}</span>
                    </button>
                </div>
            </div>
            <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} onLogout={handleLogout} />
        </nav>
    );
};

export default Navbar;