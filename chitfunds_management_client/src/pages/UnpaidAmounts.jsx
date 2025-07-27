import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../utils/api';
import '../styles/UnpaidAmounts.css';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const UnpaidAmounts = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnpaidSummary();
  }, []);

  const fetchUnpaidSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('/get_chit_groups_unpaid_list');
      if (!response.ok) throw new Error('Failed to fetch unpaid summary');
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unpaid-amounts-page">
      <Navbar />
      <div className="unpaid-amounts-container">
        <div className="unpaid-header-bar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',gap:'1rem'}}>
          <button className="back-link" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
          <div style={{textAlign:'right'}}>
            <h2 style={{margin:0, fontWeight:800, fontSize:'1.5rem', color:'#222'}}> Unpaid Amounts</h2>
            <div style={{fontSize:'1rem', color:'#71717a', fontWeight:500}}>Manage all active chits and unpaid installments</div>
          </div>
        </div>

        <div className="unpaid-summary-cards">
          {summary && summary.dashboard_summary && (
            <div className="chit-metrics-row metrics-left-align">
              <div className="chit-metric-card unpaid">
                <div className="chit-metric-label">Total Unpaid</div>
                <div className="chit-metric-value unpaid">₹{summary.dashboard_summary.total_unpaid_amount.toLocaleString('en-IN')}</div>
                <div className="chit-metric-icon unpaid"><i className="fas fa-rupee-sign"></i></div>
              </div>
              <div className="chit-metric-card members">
                <div className="chit-metric-label">Active Chits</div>
                <div className="chit-metric-value date">{summary.dashboard_summary.total_active_chits}</div>
                <div className="chit-metric-icon date"><i className="fas fa-calendar-alt"></i></div>
              </div>
              <div className="chit-metric-card date">
                <div className="chit-metric-label">Unpaid Members</div>
                <div className="chit-metric-value members">{summary.dashboard_summary.total_unpaid_members}</div>
                <div className="chit-metric-icon members"><i className="fas fa-users"></i></div>
              </div>
            </div>
          )}
        </div>

        <div className="unpaid-chits-section exact-match">
          <div className="unpaid-chits-header">
            <span className="dot"></span>
            <h2>Active Chits</h2>
          </div>
          <div className="unpaid-chits-table-wrapper">
            <table className="unpaid-chits-table">
              <thead>
                <tr>
                  <th>Chit Name</th>
                  <th>Started At</th>
                  <th>Unpaid Amount</th>
                  <th>Unpaid Members</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan="7">{error}</td></tr>
                ) : summary && summary.chit_group_summary.length > 0 ? (
                  summary.chit_group_summary.map((chit, idx) => (
                    <tr key={idx}>
                      <td>
                        <span
                          className="chit-name-link"
                          onClick={() => navigate(`/chit-details/${chit.chit_group_id}`)}
                        >
                          {chit.chit_name}
                        </span><br />
                        <span className="chit-status active">Active</span>
                      </td>
                      <td>{chit.start_date}</td>
                      {/* <td  className="chit-name"><b>₹{chit.total_amount.toLocaleString('en-IN')}</b></td> */}
                      <td className="unpaid-amount" style={{color:'red'}}><b>₹{chit.unpaid_amount.toLocaleString('en-IN')}</b></td>
                      <td>
                        <span className="unpaid-members-badge">{chit.unpaid_members} of {chit.total_members} <span style={{"color" : "black"}}>Members</span></span>
                      </td>
                      <td className="actions-cell">
                        <button className="view-btn-black" onClick={() => navigate(`/unpaid-installments/${chit.chit_group_id}`)}>
                          <i className="fas fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7">No active chits found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnpaidAmounts; 