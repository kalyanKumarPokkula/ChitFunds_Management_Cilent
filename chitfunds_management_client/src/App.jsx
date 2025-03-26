import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; // ✅ Correct import
import Home from './pages/Home';
import Members from './pages/Members';
import Chits from './pages/Chits';
import ChitDetails from './pages/ChitDetails';
import Payments from './pages/Payments';
import './App.css';

function App() {
	return (
	  
		<div className="app">
		  <Routes>
			<Route path="/" element={<Home />} />
			<Route path="/members" element={<Members />} />
			<Route path="/chits" element={<Chits />} />
			<Route path="/chit-details/:chitId" element={<ChitDetails />} />
			<Route path="/chits/:chitId" element={<ChitDetails />} /> {/* Legacy route support */}
			<Route path="/payments" element={<Payments />} />
			<Route path="*" element={<Home />} /> {/* Catch-all route */}
		  </Routes>
		</div>
	
	);
  }
  
  export default App;
