import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTranslation } from 'react-i18next';

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
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
            <Mail size={32} color="var(--primary-dark)" />
          </div>
          
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{t("Forgot Password?")}</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>
            {t("No worries, we'll send you reset instructions.")}
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
                <span style={{ fontWeight: 600 }}>{t("Reset link sent!")}</span>
              </div>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '24px' }}>
                {t("Please check your email")} <strong>{email}</strong> {t("for instructions to reset your password. The link will expire in 10 minutes.")}
              </p>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                {t("Return to Login")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">{t("Email Address")}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder={t("Enter your email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginBottom: '24px', position: 'relative' }}
                disabled={loading}
              >
                {loading ? t('Sending...') : t('Reset Password')}
                {!loading && <ArrowRight size={18} style={{ position: 'absolute', right: '20px' }} />}
              </button>
            </form>
          )}

          {!success && (
            <div style={{ textAlign: 'center', fontSize: '14px' }}>
              <Link to="/login" style={{ color: 'var(--primary-dark)', fontWeight: 600, textDecoration: 'none' }}>
                {t("← Back to Login")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
