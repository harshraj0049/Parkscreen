import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { loginUser, getCurrentUser } from '../Services/api';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || !password) { setError('Please enter email and password.'); return; }
  setLoading(true);
  setError('');
  try {
    // Step 1 — login sets the cookie
    await loginUser(email, password);

    // Step 2 — now fetch the actual user using the cookie that was just set
    const user = await getCurrentUser();

    // Step 3 — pass user into auth context (no token needed)
    login(user);

    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.page}>
      {/* ── Left panel ── */}
      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.rings}>
          {[1,2,3,4,5].map((i) => <div key={i} className={styles.ring} />)}
        </div>
        <div className={styles.leftLogo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83
                     M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
          ParkScreen
        </div>
        <div className={styles.leftContent}>
          <div className={styles.badge}>
            <div className={styles.badgeDot} />
            AI-Powered Neurological Screening
          </div>
          <h2 className={styles.leftHeading}>
            Early detection<br />through <em>typing</em><br />patterns
          </h2>
          <p className={styles.leftDesc}>
            Our machine learning model analyzes keystroke dynamics —
            hold times, latency, and rhythm — to detect early signs
            of Parkinson's disease.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span>Park<span style={{ color: 'var(--teal)' }}>Screen</span></span>
          </div>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to continue your health monitoring</p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.group}>
              <label className={styles.label}>Email address</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className={styles.row}>
              <label className={styles.checkLabel}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--teal)' }}/>
                Remember me
              </label>
              <a href="#" className={styles.forgotLink}>Forgot password?</a>
            </div>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to ParkScreen'}
            </button>
          </form>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.switchLink}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}