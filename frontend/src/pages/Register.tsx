import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const googleProvider = new GoogleAuthProvider();

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
}

interface RegisterProps {
  onLoginSuccess: (user: User) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);


  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const res = await fetchAPI('/auth/sync', {
        method: 'POST',
        body: { firstName, lastName, phone }
      });
      onLoginSuccess(res.user);
      navigate(res.user.role === 'customer' ? redirect : '/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setErrorMsg('');
    
    signInWithPopup(auth, googleProvider)
      .then(() => {
        setLoading(true);
        return fetchAPI('/auth/sync', { method: 'POST' });
      })
      .then((res) => {
        onLoginSuccess(res.user);
        navigate(res.user.role === 'customer' ? redirect : '/admin');
      })
      .catch((err: any) => {
        if (err.code !== 'auth/popup-closed-by-user') {
          setErrorMsg(err.message || 'Google Sign-Up failed.');
        }
        setLoading(false);
      });
  };

  return (
    <div className="section-spacing" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card" style={{ padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="display-md" style={{ fontSize: '24px', marginBottom: '8px' }}>
              {t("Register ATV Account")}
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
              {t("Create an account to book quads")}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">{t("First Name")}</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("Last Name")}</label>
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
              <label className="form-label">{t("Email Address")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t("Phone Number")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t("Password")}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⚠</span> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <><UserPlus size={18} /> {t("Create Account")}</>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}
              disabled={loading}
              onClick={handleGoogleSignUp}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
              {t("Sign up with Google")}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
              {t("Already have an account?")}{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                {t("Log in")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
