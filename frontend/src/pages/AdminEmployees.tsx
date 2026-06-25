import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Shield, UserCog, Edit, Trash2, Key, X, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../config/firebase';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  position?: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
}

export const AdminEmployees: React.FC = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    role: 'staff',
    status: 'active',
    password: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = async () => {
    try {
      const data = await fetchAPI('/employees'); // Use the new dedicated route
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', position: '', role: 'staff', status: 'active', password: ''
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingId(emp._id);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      position: emp.position || '',
      role: emp.role,
      status: emp.status,
      password: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      if (editingId) {
        // Edit Mode
        const payload: any = { ...formData };
        delete payload.password; // Don't send empty password
        await fetchAPI(`/employees/${editingId}`, {
          method: 'PUT',
          body: payload
        });
        setSuccess('Employee updated successfully');
      } else {
        // Add Mode
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,}$/;
        if (!passwordRegex.test(formData.password)) {
          setError('Password must be at least 10 characters long and include a number and special character.');
          setSubmitting(false);
          return;
        }
        await fetchAPI('/employees', {
          method: 'POST',
          body: formData
        });
        setSuccess('Employee added successfully');
      }
      setShowModal(false);
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setSubmitting(true);
    try {
      await fetchAPI(`/employees/${editingId}`, { method: 'DELETE' });
      setShowDeleteModal(false);
      setSuccess('Employee removed');
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 10 characters long and include a number and special character.');
      return;
    }
    
    setSubmitting(true);
    try {
      await fetchAPI(`/employees/${editingId}/reset-password`, {
        method: 'POST',
        body: { newPassword }
      });
      
      const targetEmp = employees.find(e => e._id === editingId);
      if (targetEmp && auth.currentUser && targetEmp.email === auth.currentUser.email) {
        await auth.signOut();
        window.location.href = '/login?session_expired=true';
        return;
      }

      setShowPasswordModal(false);
      setSuccess('Password reset successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.role} ${emp.position}`.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { bg: '#fee2e2', text: '#991b1b', label: t('adminEmployees.adminRole', 'Admin'), icon: <Shield size={14} /> };
      case 'staff':
      default: return { bg: '#e0e7ff', text: '#3730a3', label: t('adminEmployees.staffRole', 'Staff'), icon: <UserCog size={14} /> };
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'var(--success)';
      case 'suspended': return 'var(--error)';
      case 'inactive': default: return 'var(--on-surface-variant)';
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {success && (
        <div style={{ padding: '16px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={20} /> {success}
        </div>
      )}
      
      {/* Top Bar: Search Left, Add Button Right */}
      <div className="card" style={{ padding: '16px', display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder={t('adminEmployees.searchPlaceholder', 'Search employees by name, email, role, or position...')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '44px', width: '100%', margin: 0, border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          <UserPlus size={18} /> {t('adminEmployees.addEmployee', 'Add Employee')}
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>

        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--on-surface-variant)' }}>{t('adminEmployees.loading', 'Loading employees directory...')}</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--on-surface-variant)' }}>
              <UserCog size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('adminEmployees.noEmployees', 'No Employees Found')}</h3>
            <p style={{ color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '0 auto' }}>
              {search ? t('adminEmployees.tryDifferentSearch', 'Try a different search term.') : t('adminEmployees.noAccountsYet', "You haven't added any staff or admin accounts yet.")}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div className="admin-table-container">
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-container)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{t('adminEmployees.employee', 'Employee')}</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{t('adminEmployees.roleAndStatus', 'Role & Status')}</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{t('adminEmployees.contact', 'Contact')}</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{t('adminEmployees.activity', 'Activity')}</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{t('adminEmployees.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const roleBadge = getRoleBadge(emp.role);
                  return (
                    <tr key={emp._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--on-background)', marginBottom: '4px' }}>
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                              {emp.position || t('adminEmployees.noTitle', 'No Title')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', borderRadius: 'var(--radius-full)', 
                            fontSize: '12px', fontWeight: 600, 
                            backgroundColor: roleBadge.bg, color: roleBadge.text 
                          }}>
                            {roleBadge.icon} {roleBadge.label}
                          </span>
                          <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--on-surface-variant)', textTransform: 'capitalize' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(emp.status) }} />
                            {emp.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', color: 'var(--on-background)', marginBottom: '4px' }}>{emp.email}</div>
                        <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{emp.phone || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                        <div>{t('adminEmployees.joined', 'Joined:')} {formatDate(emp.createdAt)}</div>
                        <div style={{ marginTop: '4px' }}>{t('adminEmployees.lastLogin', 'Last Login:')} {formatDate(emp.lastLogin)}</div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={() => openEditModal(emp)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title={t('adminEmployees.editEmployee', 'Edit Employee')}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => { setEditingId(emp._id); setNewPassword(''); setError(''); setShowPasswordModal(true); }}
                            className="btn btn-secondary" 
                            style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title={t('adminEmployees.resetPasswordTitle', 'Reset Password')}
                          >
                            <Key size={16} />
                          </button>
                          <button 
                            onClick={() => { setEditingId(emp._id); setError(''); setShowDeleteModal(true); }}
                            className="btn btn-secondary" 
                            style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}
                            title={t('adminEmployees.removeEmployeeTitle', 'Remove Employee')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '32px' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              <X size={24} />
            </button>
            <h2 className="title-lg" style={{ marginBottom: '24px' }}>{editingId ? t('adminEmployees.editEmployeeTitle', 'Edit Employee') : t('adminEmployees.addEmployeeTitle', 'Add Employee')}</h2>
            

            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">{t('adminEmployees.firstName', 'First Name *')}</label>
                  <input required type="text" className="form-input" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">{t('adminEmployees.lastName', 'Last Name *')}</label>
                  <input required type="text" className="form-input" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">{t('adminEmployees.emailLabel', 'Email *')}</label>
                  <input required type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">{t('adminEmployees.phoneLabel', 'Phone *')}</label>
                  <input required type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">{t('adminEmployees.positionLabel', 'Position / Job Title')}</label>
                  <input type="text" className="form-input" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">{t('adminEmployees.systemRole', 'System Role *')}</label>
                  <select required className="form-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="staff">{t('adminEmployees.staffOption', 'Staff (Limited Access)')}</option>
                    <option value="admin">{t('adminEmployees.adminOption', 'Administrator (Full Access)')}</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">{t('adminEmployees.accountStatus', 'Account Status *')}</label>
                <select required className="form-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="active">{t('adminEmployees.statusActive', 'Active')}</option>
                  <option value="inactive">{t('adminEmployees.statusInactive', 'Inactive')}</option>
                  <option value="suspended">{t('adminEmployees.statusSuspended', 'Suspended')}</option>
                </select>
              </div>

              {!editingId && (
                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label">{t('adminEmployees.initialPassword', 'Initial Password *')}</label>
                  <div style={{ position: 'relative' }}>
                    <input required type={showPassword ? "text" : "password"} minLength={6} className="form-input" style={{ paddingRight: '40px' }} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} tabIndex={-1}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                    {t('adminEmployees.passwordHelp', 'Password must be at least 10 characters long and include a number and special character.')}
                  </p>
                </div>
              )}

              {error && (
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '4px', marginBottom: '24px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('adminEmployees.cancel', 'Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? t('adminEmployees.saving', 'Saving...') : t('adminEmployees.saveEmployee', 'Save Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative', padding: '32px' }}>
            <button onClick={() => setShowPasswordModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              <X size={20} />
            </button>
            <h2 className="title-md" style={{ marginBottom: '16px' }}>{t('adminEmployees.resetPasswordTitle', 'Reset Password')}</h2>
            {error && <div style={{ padding: '8px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">{t('adminEmployees.newPassword', 'New Password')}</label>
                <div style={{ position: 'relative' }}>
                  <input required type={showResetPassword ? "text" : "password"} minLength={6} className="form-input" style={{ paddingRight: '40px' }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} tabIndex={-1}>
                    {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>{t('adminEmployees.cancel', 'Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? t('adminEmployees.resetting', 'Resetting...') : t('adminEmployees.resetPasswordTitle', 'Reset Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '32px', position: 'relative' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} />
            </div>
            <h2 className="title-md" style={{ marginBottom: '8px' }}>{t('adminEmployees.removeEmployeeTitle', 'Remove Employee?')}</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '24px' }}>
              {t('adminEmployees.removeWarning', 'Are you sure you want to permanently remove this employee account? They will lose all access immediately. This action cannot be undone.')}
            </p>
            {error && <div style={{ padding: '8px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>{t('adminEmployees.cancel', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={handleDelete} disabled={submitting} style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}>
                {submitting ? t('adminEmployees.removing', 'Removing...') : t('adminEmployees.yesRemove', 'Yes, Remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
