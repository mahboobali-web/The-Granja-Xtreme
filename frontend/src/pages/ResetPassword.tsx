import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';

export const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, token || '', password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-spacing" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Lock size={32} color="var(--primary-dark)" />
          </div>
          
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{t("Set New Password")}</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>
            {t("Your new password must be different to previously used passwords.")}
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                color: '#10b981',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={20} />
                <span style={{ fontWeight: 600 }}>{t("Password reset successful!")}</span>
              </div>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '24px' }}>
                {t("Redirecting you to login...")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">{t("New Password")}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder={t("Must be at least 6 characters")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '44px', paddingRight: '40px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm">{t("Confirm Password")}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
                  <input
                    id="confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    placeholder={t("Confirm new password")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '44px', paddingRight: '40px' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginBottom: '24px', position: 'relative' }}
                disabled={loading}
              >
                {loading ? t('Resetting...') : t('Reset Password')}
                {!loading && <ArrowRight size={18} style={{ position: 'absolute', right: '20px' }} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
