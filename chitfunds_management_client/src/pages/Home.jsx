import Navbar from '../components/Navbar';
import '../styles/Home.css';
import AddMemberModal from '../components/AddMemberModal';
import CreateChitModal from '../components/CreateChitModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { useState } from 'react';
import PaymentStats from '../components/PaymentStats';

const Home = () => {
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isChitModalOpen, setIsChitModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const quickActions = [
        {
            id: 'new-member',
            label: 'New Member',
            icon: 'user-plus',
            color: '#3b82f6',
            onClick: () => setIsMemberModalOpen(true)
        },
        {
            id: 'new-chit',
            label: 'New Chit',
            icon: 'file-alt',
            color: '#10b981',
            onClick: () => setIsChitModalOpen(true)
        },
        {
            id: 'new-payment',
            label: 'New Payment',
            icon: 'money-bill-wave',
            color: '#f59e0b',
            onClick: () => setIsPaymentModalOpen(true)
        }
    ];

    const handleMemberSuccess = () => {
        console.log('Member added successfully');
    };

    const handleChitSuccess = () => {
        console.log('Chit created successfully');
    };

    const handlePaymentSuccess = () => {
        console.log('Payment recorded successfully');
    };

    return (
        <div className="new-home-dashboard">
            <Navbar />
            <div className="new-home-main-content">
                <div className="new-home-header">
                    <h1>Dashboard</h1>
                    <p>Your comprehensive chit fund overview.</p>
                </div>

				<PaymentStats/>

                <div className="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions-grid">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                className="quick-action-card"
                                onClick={action.onClick}
                                style={{ '--action-color': action.color }}
                            >
                                <div className="action-icon">
                                    <i className={`fas fa-${action.icon}`}></i>
                                </div>
                                <span className="action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <AddMemberModal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                onSuccess={handleMemberSuccess}
            />

            <CreateChitModal
                isOpen={isChitModalOpen}
                onClose={() => setIsChitModalOpen(false)}
                onSuccess={handleChitSuccess}
            />

            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentAdded={handlePaymentSuccess}
            />
        </div>
    );
};

export default Home;