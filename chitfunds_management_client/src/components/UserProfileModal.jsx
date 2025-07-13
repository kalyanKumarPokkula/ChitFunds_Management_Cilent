import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import '../styles/UserProfileModal.css';
import { apiRequest } from '../utils/api';
import { useNotification } from '../context/NotificationContext';

const UserProfileModal = ({ isOpen, onClose, onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useNotification(); // ✅ custom notification hook

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserData = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      setLoading(true);
      setError('');
      setUser(null);

      try {
        const response = await apiRequest(`/get-admin-details?user_id=${userId}`);
        console.log('response from get-admin-details:', response);
        

        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackup = async () => {
    try {
      const response = await apiRequest('/run-backup');
      if (!response.ok) throw new Error('Backup failed');

      const data = await response.json();

      // Extract the relevant line from output
      const match = data.output.match(/✅ Backup uploaded to S3: .*/);
      const message = match ? match[0] : 'Backup completed successfully';

      showSuccess(message);
    } catch (err) {
      console.error(err);
      showError('Failed to run backup');
    }
  };

  // ✅ Restore handler
  const handleRestore = async () => {
    try {
      const response = await apiRequest('/run-restore');
      if (!response.ok) throw new Error('Restore failed');
      showSuccess('Restore completed successfully');
    } catch (err) {
      console.error(err);
      showError('Failed to run restore');
    }
  };





  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} size="large">
      <div className="profile-modal-root">
        <button className="back-link" onClick={onClose}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>

        {loading && (
          <div className="profile-loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        )}

        {!loading && error && (
          <div className="profile-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && user && (
          <>
            <div className="profile-header">
              <div className="profile-avatar-lg">{user.full_name.charAt(0)}</div>
              <div className="profile-main-info">
                <h2>{user.full_name}</h2>
                <div className="profile-role">Administrator</div>
                <div className="profile-join-date">
                  <i className="far fa-calendar-alt"></i> Member since {user.created_at}
                </div>
              </div>
              <div className="profile-actions">
                <button className="profile-action-btn backup" onClick={handleBackup}>
                  <i className="fas fa-download"></i> Backup
                </button>
                <button className="profile-action-btn restore" onClick={handleRestore}>
                  <i className="fas fa-upload"></i> Restore
                </button>
                <button className="profile-action-btn logout" onClick={onLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>

            <div className="profile-content-grid">
              <div className="profile-card">
                <div className="profile-card-title"><i className="fas fa-user"></i> Personal Information</div>
                <div className="profile-info-list">
                  <div className="profile-info-item"><i className="fas fa-envelope"></i> <span>{user.email}</span></div>
                  <div className="profile-info-item"><i className="fas fa-phone"></i> <span>+91 {user.phone_number}</span></div>
                  <div className="profile-info-item"><i className="fas fa-map-marker-alt"></i> <span>{user.address}</span></div>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-card-title"><i className="fas fa-shield-alt"></i> Account Settings</div>
                <div className="profile-settings-list">
                  <div className="profile-setting-row">
                    <div>
                      <div className="setting-title">Two-Factor Authentication</div>
                      <div className="setting-desc">Add extra security to your account</div>
                    </div>
                    <button className="setting-btn">Enable</button>
                  </div>
                  <div className="profile-setting-row">
                    <div>
                      <div className="setting-title">Email Notifications</div>
                      <div className="setting-desc">Receive updates via email</div>
                    </div>
                    <button className="setting-btn">Configure</button>
                  </div>
                  <div className="profile-setting-row">
                    <div>
                      <div className="setting-title">Change Password</div>
                      <div className="setting-desc">Update your password</div>
                    </div>
                    <button className="setting-btn">Update</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default UserProfileModal;
