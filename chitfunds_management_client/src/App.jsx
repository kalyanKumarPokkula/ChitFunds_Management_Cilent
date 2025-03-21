import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Members from './pages/Members';
import Chits from './pages/Chits';
import ChitDetails from './pages/ChitDetails';
import Payments from './pages/Payments';
import './App.css';

function App() {
	const [currentPath, setCurrentPath] = useState(window.location.pathname);

	useEffect(() => {
		const handleNavigation = (event) => {
			if (event.detail?.path) {
				setCurrentPath(event.detail.path);
			}
		};

		window.addEventListener('navchange', handleNavigation);
		window.addEventListener('popstate', () => {
			setCurrentPath(window.location.pathname);
		});

		return () => {
			window.removeEventListener('navchange', handleNavigation);
			window.removeEventListener('popstate', () => {
				setCurrentPath(window.location.pathname);
			});
		};
	}, []);

	const renderPage = () => {
		// Match for chit details route in new format: /chit-details/1
		const chitDetailsMatch = currentPath.match(/^\/chit-details\/(\d+)$/);

		// Legacy format support: /chits/1
		const legacyChitDetailsMatch = currentPath.match(/^\/chits\/(\d+)$/);

		if (chitDetailsMatch) {
			return <ChitDetails chitId={chitDetailsMatch[1]} />;
		}

		if (legacyChitDetailsMatch) {
			return <ChitDetails chitId={legacyChitDetailsMatch[1]} />;
		}

		switch (currentPath) {
			case '/':
				return <Home />;
			case '/members':
				return <Members />;
			case '/chits':
				return <Chits />;
			case '/payments':
				return <Payments />;
			default:
				return <Home />;
		}
	};

	return <div className="app">{renderPage()}</div>;
}

export default App;
