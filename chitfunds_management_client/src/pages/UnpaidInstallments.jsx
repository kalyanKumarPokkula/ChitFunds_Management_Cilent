import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Home.css';
import '../styles/UnpaidAmounts.css';
import { apiRequest } from '../utils/api';
import MemberPaymentHistoryModal from '../components/MemberPaymentHistoryModal';

const UnpaidInstallments = () => {
  const { chitGroupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [chitGroupId]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/get-single-chitgroup-unpaid-installments-details?chit_group_id=${chitGroupId}`);
      if (!response.ok) throw new Error('Failed to fetch details');
      const result = await response.json();
      console.log(result);
      
      
      setData(result);
      console.log("insie the data",data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary
  const totalUnpaid = data?.unpaid_member_details?.reduce((sum, m) => sum + m.due_amount, 0) || 0;
  const unpaidMembers = data?.unpaid_member_details?.length || 0;
  const nextDueDate = (() => {
    // Placeholder: In real API, get from data. Here, just show next month 25th
    const d = new Date();
    d.setMonth(d.getMonth());
    d.setDate(25);
    return d.toISOString().slice(0, 10);
  })();

  // Get chit name from data if available
  const chitName = data?.unpaid_member_details?.[0]?.chit_name || '';

  return (
    <div className="unpaid-amounts-page">
      <Navbar />
      <div className="unpaid-amounts-container">
        <div className="unpaid-header-bar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',gap:'1rem'}}>
          <button className="back-link" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back to Chits
          </button>
          <div style={{textAlign:'right'}}>
            <h2 style={{margin:0, fontWeight:800, fontSize:'1.5rem', color:'#222'}}>{chitName ? `${chitName} - Unpaid Installments` : 'Unpaid Installments'}</h2>
            <div style={{fontSize:'1rem', color:'#71717a', fontWeight:500}}>Track and manage unpaid member contributions</div>
          </div>
        </div>
        <div className="chit-metrics-row metrics-left-align" style={{marginBottom:'2.2rem'}}>
          <div className="chit-metric-card unpaid">
            <div className="chit-metric-label">Total Unpaid</div>
            <div className="chit-metric-value unpaid">₹{totalUnpaid.toLocaleString('en-IN')}</div>
            <div className="chit-metric-icon unpaid"><i className="fas fa-rupee-sign"></i></div>
          </div>
          <div className="chit-metric-card members">
            <div className="chit-metric-label">Unpaid Members</div>
            <div className="chit-metric-value members">{unpaidMembers}</div>
            <div className="chit-metric-icon members"><i className="fas fa-users"></i></div>
          </div>
          <div className="chit-metric-card date">
            <div className="chit-metric-label">Next Due Date</div>
            <div className="chit-metric-value date">{nextDueDate}</div>
            <div className="chit-metric-icon date"><i className="fas fa-calendar-alt"></i></div>
          </div>
        </div>
        <div className="unpaid-chits-section exact-match">
          <div className="unpaid-chits-header">
            <span className="dot"></span>
            <h2>Unpaid Installments</h2>
          </div>
          <div className="unpaid-chits-table-wrapper">
            <table className="unpaid-chits-table">
              <thead>
                <tr>
                  <th>Token-N</th>
                  <th>Member Name</th>
                  <th>Contact</th>
                  <th>Amount Due</th>
                  <th>Months Behind</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan="6">{error}</td></tr>
                ) : data?.unpaid_member_details?.length ? (
                  data.unpaid_member_details.map((m, idx) => {
                    let rowClass = '';
                    let statusClass = '';
                    let iconClass = '';
                    if (m.months_due >= 3) {
                      rowClass = 'unpaid-row-red';
                      statusClass = 'unpaid-status-red';
                      iconClass = 'fa-circle-exclamation';
                    } else if (m.months_due === 2) {
                      rowClass = 'unpaid-row-orange';
                      statusClass = 'unpaid-status-orange';
                      iconClass = 'fa-circle-exclamation';
                    } else {
                      rowClass = 'unpaid-row-yellow';
                      statusClass = 'unpaid-status-yellow';
                      iconClass = 'fa-clock';
                    }
                    return (
                      <tr key={idx} className={rowClass} style={{cursor:'pointer'}} onClick={() => { setSelectedMember(m); setModalOpen(true); }}>
                        <td>{m.token}</td>
                        <td>
                          <span
                            className="member-link"
                            onClick={() => navigate(`/members/${m.user_id}`)}
                          >
                            {m.full_name}
                          </span>
                        </td>
                        <td>+91 {m.phone}</td>
                        <td className="unpaid-due-amount" style={{color:'red'}}><b>₹{m.due_amount.toLocaleString('en-IN')}</b></td>
                        <td>{m.months_due} month{m.months_due > 1 ? 's' : ''}</td>
                        <td>
                          <span className={`unpaid-members-badge status-badge months-${m.months_due} ${statusClass}`}>
                            <i className={`fas ${iconClass}`}></i> {m.months_due} Month{m.months_due > 1 ? 's' : ''} Behind
                          </span>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="6">No unpaid installments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <MemberPaymentHistoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        memberData={selectedMember}
        chitName={chitName}
      />
    </div>
  );
};

export default UnpaidInstallments; 