import { useState } from 'react';
import Home from './pages/Home';
import Chits from './pages/Chits';
import Members from './pages/Members';
import Payments from './pages/Payments';
import './App.css';

function App() {
	const [currentPage, setCurrentPage] = useState('home');

	// Simple routing function
	const renderPage = () => {
		switch (currentPage) {
			case 'home':
				return <Home />;
			case 'chits':
				return <Chits />;
			case 'members':
				return <Members />;
			case 'payments':
				return <Payments />;
			default:
				return <Home />;
		}
	};

	// Since we don't have React Router installed yet, we'll use this effect to handle URL changes
	useState(() => {
		const handleNavigation = () => {
			const path = window.location.pathname;
			if (path === '/' || path === '') {
				setCurrentPage('home');
			} else if (path === '/chits') {
				setCurrentPage('chits');
			} else if (path === '/members') {
				setCurrentPage('members');
			} else if (path === '/payments') {
				setCurrentPage('payments');
			}
		};

		// Initial check
		handleNavigation();

		// Listen for popstate events (back/forward navigation)
		window.addEventListener('popstate', handleNavigation);

		return () => {
			window.removeEventListener('popstate', handleNavigation);
		};
	}, []);

	// Override anchor clicks for navigation
	window.addEventListener('click', (e) => {
		// Check if the clicked element is an anchor tag
		if (e.target.tagName === 'A') {
			const href = e.target.getAttribute('href');

			// Only handle internal links
			if (href && (href === '/' || href.startsWith('/'))) {
				e.preventDefault();

				// Update URL without page reload
				window.history.pushState({}, '', href);

				// Update the current page state
				if (href === '/') {
					setCurrentPage('home');
				} else if (href === '/chits') {
					setCurrentPage('chits');
				} else if (href === '/members') {
					setCurrentPage('members');
				} else if (href === '/payments') {
					setCurrentPage('payments');
				}
			}
		}
	});

	return renderPage();
}

export default App;
