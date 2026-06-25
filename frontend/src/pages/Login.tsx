import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { fetchAPI } from '../utils/api';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const googleProvider = new GoogleAuthProvider();

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
}

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  React.useEffect(() => {
    const lockoutUntil = localStorage.getItem('lockoutUntil');
    if (lockoutUntil) {
      const remaining = parseInt(lockoutUntil) - Date.now();
      if (remaining > 0) {
        setLockoutTimer(Math.ceil(remaining / 1000));
      } else {
        localStorage.removeItem('lockoutUntil');
        localStorage.removeItem('failedAttempts');
      }
    }
  }, []);

  React.useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setInterval(() => setLockoutTimer(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (lockoutTimer > 0) {
      setErrorMsg(`Account temporarily locked. Try again in ${Math.ceil(lockoutTimer / 60)} minutes.`);
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('failedAttempts');
      localStorage.removeItem('lockoutUntil');
      fetchAPI('/logs/auth', { method: 'POST', body: { email, status: 'SUCCESS' } }).catch(() => {});
      
      const res = await fetchAPI('/auth/sync', { method: 'POST' });
      onLoginSuccess(res.user);
      navigate(res.user.role === 'customer' ? redirect : '/admin');
    } catch (err: any) {
      fetchAPI('/logs/auth', { method: 'POST', body: { email, status: 'FAILED' } }).catch(() => {});
      
      const attempts = parseInt(localStorage.getItem('failedAttempts') || '0') + 1;
      localStorage.setItem('failedAttempts', attempts.toString());
      
      if (attempts >= 5 || err.code === 'auth/too-many-requests') {
        const until = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('lockoutUntil', until.toString());
        setLockoutTimer(15 * 60);
        setErrorMsg('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    
    // Call synchronously to absolutely guarantee no microtask delay interrupts the click handler
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
          setErrorMsg(err.message || 'Google Sign-In failed.');
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
              {t("Portal Access Log-In")}
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
              {t("Access your ATV bookings and operations panel")}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
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
              <label className="form-label">{t("Password")}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '40px' }}
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

            {errorMsg && <div className="alert alert-error" style={{ fontSize: '14px', padding: '10px' }}>{errorMsg}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              disabled={loading || lockoutTimer > 0}
            >
              {loading ? (
                <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <><LogIn size={18} /> {t("Sign In")}</>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}
              disabled={loading}
              onClick={handleGoogleSignIn}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
              {t("Sign in with Google")}
            </button>
            
            <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
              {t("Don't have an account?")}{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                {t("Register here")}
              </Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary-dark)', fontWeight: 600, textDecoration: 'none' }}>
                {t("Forgot Password?")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
