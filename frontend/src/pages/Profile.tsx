import React, { useState, useEffect } from 'react';
import { User, Shield, Save, Eye, EyeOff, Lock } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { auth } from '../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const Profile: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchAPI('/auth/me');
        setFirstName(res.user.firstName);
        setLastName(res.user.lastName);
        setEmail(res.user.email);
        setPhone(res.user.phone || '');
        setRole(res.user.role);
      } catch (err: any) {
        setErrorMsg('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await fetchAPI('/auth/profile', {
        method: 'PUT',
        body: { firstName, lastName, phone }
      });
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    setPassErrorMsg('');
    setPassSuccessMsg('');

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPassErrorMsg('Password must be at least 10 characters long and include a number and special character.');
      setChangingPass(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Not authenticated properly.');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setPassSuccessMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassErrorMsg(err.message || 'Failed to change password. Check your current password.');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="section-spacing container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="section-spacing">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>My Profile</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                <Shield size={14} />
                <span style={{ textTransform: 'capitalize' }}>{role} Account</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Cannot be changed)</label>
              <input
                type="email"
                value={email}
                className="form-input"
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ color: 'var(--success)', backgroundColor: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-start', marginTop: '8px' }}
            >
              {saving ? (
                <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: '32px', marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>Change Password</h2>
              <div style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                Ensure your account is using a long, random password to stay secure.
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} tabIndex={-1}>
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} tabIndex={-1}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                Password must be at least 10 characters long and include a number and special character.
              </div>
            </div>

            {passErrorMsg && (
              <div style={{ color: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                {passErrorMsg}
              </div>
            )}

            {passSuccessMsg && (
              <div style={{ color: 'var(--success)', backgroundColor: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                {passSuccessMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={changingPass}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-start', marginTop: '8px' }}
            >
              {changingPass ? (
                <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <><Lock size={18} /> Update Password</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
