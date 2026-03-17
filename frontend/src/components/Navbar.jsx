import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { logoutUser } from '../Services/api';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard'   },
  { path: '/test',      label: 'Typing Test' },
  { path: '/result',    label: 'Results'     },
  { path: '/history',   label: 'History'     },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const handleLogout = async () => {
    try {
      await logoutUser();   // Step 1 — tells backend to clear the HttpOnly cookie
    } catch (err) {
      console.error('Logout error:', err);
      // Even if backend call fails, we still clear frontend state
      // so user is not stuck in a broken logged-in state
    } finally {
      logout();             // Step 2 — clears user from AuthContext + localStorage
      navigate('/login');   // Step 3 — redirect to login page
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className={styles.nav}>

      {/* Brand */}
      <div className={styles.brand} onClick={() => navigate('/dashboard')}>
        <div className={styles.brandIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <span>Park<span className={styles.brandAccent}>Screen</span></span>
      </div>

      {/* Nav links */}
      <div className={styles.links}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.path}
            className={`${styles.link} ${location.pathname === link.path ? styles.active : ''}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side — user info + logout */}
      <div className={styles.right}>
        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.userName}>{user?.name || user?.email}</div>
            <div className={styles.userRole}>Patient</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

    </nav>
  );
}