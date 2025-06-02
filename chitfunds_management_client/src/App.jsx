import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Members from './pages/Members';
import MemberDetails from './pages/MemberDetails';
import Chits from './pages/Chits';
import ChitDetails from './pages/ChitDetails';
import Payments from './pages/Payments';
import Login from './pages/Login';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
	const token = localStorage.getItem('access_token');
	
	if (!token) {
		return <Navigate to="/login" replace />;
	}
	
	return children;
};

function App() {
	return (
		<div className="app">
			<Routes>
				<Route path="/login" element={<Login />} />
				
				<Route path="/" element={
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				} />
				
				<Route path="/members" element={
					<ProtectedRoute>
						<Members />
					</ProtectedRoute>
				} />
				
				<Route path="/members/:userId" element={
					<ProtectedRoute>
						<MemberDetails />
					</ProtectedRoute>
				} />
				
				<Route path="/chits" element={
					<ProtectedRoute>
						<Chits />
					</ProtectedRoute>
				} />
				
				<Route path="/chit-details/:chitId" element={
					<ProtectedRoute>
						<ChitDetails />
					</ProtectedRoute>
				} />
				
				<Route path="/chits/:chitId" element={
					<ProtectedRoute>
						<ChitDetails />
					</ProtectedRoute>
				} />
				
				<Route path="/payments" element={
					<ProtectedRoute>
						<Payments />
					</ProtectedRoute>
				} />
				
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}

export default App;
