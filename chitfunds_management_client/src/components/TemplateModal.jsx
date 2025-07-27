import Modal from './Modal';
import ActionButton from './ActionButton';
import '../styles/Modal.css';
import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useNotification } from '../context/NotificationContext';


const TemplateModal = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState([]); // Start with empty, not sampleTemplates
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    totalValue: '',
    monthly: '',
    duration: '',
    projections: [],
  });
  const [editProjections, setEditProjections] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null); // Holds the template being edited
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Automatically update projections when monthly, duration, or totalValue changes
  useEffect(() => {
    const months = Number(form.duration) || 0;
    const monthly = Number(form.monthly) || 0;
    const totalValue = Number(form.totalValue) || 0;
    if (months > 0 && monthly > 0 && totalValue > 0) {
      setForm((prev) => ({
        ...prev,
        projections: Array.from({ length: months }, (_, i) => ({
          month: i + 1,
          subscription: monthly,
          payout: totalValue,
        })),
      }));
    } else {
      setForm((prev) => ({ ...prev, projections: [] }));
    }
  }, [form.monthly, form.duration, form.totalValue]);

  useEffect(() => {
    // Fetch templates from backend on mount
    const fetchTemplates = async () => {
      try {
        const response = await apiRequest('/get-all-projections-template');
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();
        console.log(data);
        
        if (Array.isArray(data.templates)) {
          setTemplates(
            data.templates.map((tpl) => ({
              id: tpl.projectionTemplate_id,
              name: tpl.name,
              months: tpl.months,
              totalValue: tpl.total_value,
              monthly: tpl.monthly_subscription,
              projections: tpl.monthly_projections, // Not present in API response
            }))
          );
        } else {
          setTemplates([]);
        }
      } catch (err) {
        showError(err.message || 'Error loading templates');
        setTemplates([]);
      }
    };
    fetchTemplates();
  }, [showError]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount) => {
		return `₹${parseInt(amount).toLocaleString('en-IN')}`;
	};

  // Update projections manually if editing
  const handleProjectionChange = (idx, field, value) => {
    setForm((prev) => {
      const projections = [...prev.projections];
      projections[idx] = { ...projections[idx], [field]: Number(value) };
      return { ...prev, projections };
    });
  };

  const handleCreate = async () => {
    try {
      const payload = {
        name: form.name,
        total_value: Number(form.totalValue),
        monthly: Number(form.monthly),
        duration: Number(form.duration),
        projections: form.projections,
      };
      const response = await apiRequest('/create-projection-template', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create template');
      const data = await response.json();
      setTemplates((prev) => [
        ...prev,
        {
          id: data.id || prev.length + 1,
          name: form.name,
          months: Number(form.duration),
          totalValue: Number(form.totalValue),
          monthly: Number(form.monthly),
          projections: form.projections,
        },
      ]);
      setIsCreateOpen(false);
      setForm({
        name: '',
        totalValue: '',
        monthly: '',
        duration: '',
        projections: [],
      });
      showSuccess('Template created successfully!');
    } catch (err) {
      showError(err.message || 'Error creating template');
    }
  };

  const handleDelete = async (projectionTemplate_id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      const response = await apiRequest(`/delete-projections-template?projectionTemplate_id=${projectionTemplate_id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== projectionTemplate_id));
      showSuccess('Template deleted successfully!');
    } catch (err) {
      showError(err.message || 'Error deleting template');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monthly Projections Templates"
      size="large"
      footer={null}
    >
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, color: '#555' }}>
            Create and manage templates for different chit fund schemes
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#18181b' }}>Monthly Projections Templates</h2>
          <ActionButton
            label="New Template"
            icon="plus"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
          />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          maxHeight: 400,
          overflowY: 'auto',
        }}>
          {templates.map((tpl) => (
            <div key={tpl.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: 12,
              padding: 20,
              minWidth: 0,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <i className="fas fa-file-alt" style={{ color: '#1976d2', marginRight: 8 }}></i>
                <span style={{ fontWeight: 600, fontSize: 18, color: '#18181b' }}>{tpl.name}</span>
                <span style={{ flex: 1 }}></span>
                <i className="fas fa-pen" style={{ color: '#1976d2', marginRight: 12, cursor: 'pointer' }} onClick={() => {
                  setEditTemplate({
                    ...tpl,
                    // Ensure projections are sorted by month_number for editing
                    projections: (tpl.projections || tpl.monthly_projections || []).slice().sort((a, b) => a.month_number - b.month_number)
                  });
                  setIsEditOpen(true);
                }}></i>
                <i className="fas fa-trash" style={{ color: '#e53935', cursor: 'pointer' }} onClick={() => handleDelete(tpl.id)}></i>
              </div>
              <div style={{ color: '#555', fontSize: 15, marginBottom: 0 }}>{tpl.months} months • {formatCurrency(tpl.totalValue)} Value</div>
            </div>
          ))}
        </div>
      </div>
      {/* Create New Template Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Template"
          size="large"
          footer={null}
        >
          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 ,color: '#18181b'}}>
              <div>
                <label style={{ fontWeight: 500 }}>Template Name</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={form.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="e.g., 5 Lakh Premium"  required/>
              </div>
              <div>
                <label style={{ fontWeight: 500 }}>Total Value (₹)</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={form.totalValue} onChange={e => handleFormChange('totalValue', e.target.value)} placeholder='Enter Total Value' required/>
              </div>
              <div>
                <label style={{ fontWeight: 500 }}>Monthly Subscription (₹)</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={form.monthly} onChange={e => handleFormChange('monthly', e.target.value)} placeholder='Enter Monthly Subscription' required/>
              </div>
              <div>
                <label style={{ fontWeight: 500 }}>Duration (Months)</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={form.duration} onChange={e => handleFormChange('duration', e.target.value)} placeholder='Enter Duration' required/>
              </div>
            </div>
            {form.projections.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: '#18181b', flex: 1 }}>Monthly Projections</div>
                  <button
                    type="button"
                    style={{
                      background: editProjections ? '#e5e7eb' : '#1976d2',
                      color: editProjections ? '#18181b' : '#fff',
                      border: 'none',
                      borderRadius: 16,
                      padding: '6px 18px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      marginLeft: 12,
                      fontSize: 15,
                    }}
                    onClick={() => setEditProjections((v) => !v)}
                  >
                    {editProjections ? 'Lock Projections' : 'Edit Projections'}
                  </button>
                </div>
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: 300,
                  overflowY: 'auto',
                  background: '#fafbfc',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontWeight: 500, marginBottom: 8, color: '#18181b' }}>
                    <div>Month</div>
                    <div>Subscription (₹)</div>
                    <div>Payout (₹)</div>
                  </div>
                  {form.projections.map((proj, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8, color: '#18181b' }}>
                      <div>{proj.month}</div>
                      <input
                        style={{ width: '100%', color: '#18181b', background: '#fff', padding: '10px 12px' }}
                        value={proj.subscription}
                        disabled={!editProjections}
                        onChange={e => handleProjectionChange(idx, 'subscription', e.target.value)}
                      />
                      <input
                        style={{ width: '100%', color: '#18181b', background: '#fff', padding: '10px 12px' }}
                        value={proj.payout}
                        disabled={!editProjections}
                        onChange={e => handleProjectionChange(idx, 'payout', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                style={{
                  background: '#e5e7eb',
                  color: '#18181b',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  background: '#a3a3a3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onClick={handleCreate}
              >
                <i className="fas fa-save"></i> Create Template
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Edit Template Modal */}
      {isEditOpen && editTemplate && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Template"
          size="large"
          footer={null}
        >
          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 ,color: '#18181b'}}>
              <div>
                <label style={{ fontWeight: 500 }}>Template Name</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={editTemplate.name} onChange={e => setEditTemplate(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., 5 Lakh Premium"  required/>
              </div>
              <div>
                <label style={{ fontWeight: 500 }}>Total Value (₹)</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={editTemplate.totalValue} onChange={e => setEditTemplate(prev => ({ ...prev, totalValue: e.target.value }))} placeholder='Enter Total Value' required/>
              </div>
              <div>
                <label style={{ fontWeight: 500 }}>Monthly Subscription (₹)</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={editTemplate.monthly} onChange={e => setEditTemplate(prev => ({ ...prev, monthly: e.target.value }))} placeholder='Enter Monthly Subscription' required/>
              </div>
              <div>
                <label style={{ fontWeight: 500 }}>Duration (Months)</label>
                <input style={{ width: '100%', marginTop: 4, color: '#18181b', background: '#fff' , padding: '10px 12px' }} value={editTemplate.months} onChange={e => setEditTemplate(prev => ({ ...prev, months: e.target.value }))} placeholder='Enter Duration' required/>
              </div>
            </div>
            {editTemplate.projections && editTemplate.projections.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: '#18181b', flex: 1 }}>Monthly Projections</div>
                </div>
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: 300,
                  overflowY: 'auto',
                  background: '#fafbfc',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontWeight: 500, marginBottom: 8, color: '#18181b' }}>
                    <div>Month</div>
                    <div>Subscription (₹)</div>
                    <div>Payout (₹)</div>
                  </div>
                  {editTemplate.projections.map((proj, idx) => (
                    <div key={proj.monthlyprojection_id || idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8, color: '#18181b' }}>
                      <div>{proj.month_number}</div>
                      <input
                        style={{ width: '100%', color: '#18181b', background: '#fff', padding: '10px 12px' }}
                        value={proj.monthly_subscription}
                        onChange={e => {
                          const value = e.target.value;
                          setEditTemplate(prev => {
                            const projections = [...prev.projections];
                            projections[idx] = { ...projections[idx], monthly_subscription: value };
                            return { ...prev, projections };
                          });
                        }}
                      />
                      <input
                        style={{ width: '100%', color: '#18181b', background: '#fff', padding: '10px 12px' }}
                        value={proj.total_payout}
                        onChange={e => {
                          const value = e.target.value;
                          setEditTemplate(prev => {
                            const projections = [...prev.projections];
                            projections[idx] = { ...projections[idx], total_payout: value };
                            return { ...prev, projections };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                style={{
                  background: '#e5e7eb',
                  color: '#18181b',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onClick={async () => {
                  try {
                    const payload = {
                      projectionTemplate_id: editTemplate.id,
                      name: editTemplate.name,
                      total_value: Number(editTemplate.totalValue),
                      monthly: Number(editTemplate.monthly),
                      duration: Number(editTemplate.months),
                      projections: editTemplate.projections.map(p => ({
                        month_number: p.month_number,
                        monthly_subscription: Number(p.monthly_subscription),
                        total_payout: Number(p.total_payout),
                        monthlyprojection_id: p.monthlyprojection_id,
                      })),
                    };
                    console.log(payload);
                    const response = await apiRequest('/update-projection-template', {
                      method: 'PUT',
                      body: JSON.stringify(payload),
                    });
                    if (!response.ok) throw new Error('Failed to update template');
                    setTemplates(prev => prev.map(tpl => tpl.id === editTemplate.id ? { ...editTemplate } : tpl));
                    setIsEditOpen(false);
                    showSuccess('Template updated successfully!');
                  } catch (err) {
                    showError(err.message || 'Error updating template');
                  }
                }}
              >
                <i className="fas fa-save"></i> Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default TemplateModal; 