import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Navbar from '../components/Navbar';
import TrendChart from '../components/TrendChart';
import HistoryTable from '../components/HistoryTable';
import { getSessionHistory } from '../Services/api';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();              // ← was: const { token } = useAuth()
  const navigate  = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Fetch history on page load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getSessionHistory(); // ← token param removed
        setSessions(data.sessions || []);
      } catch (err) {
        setError('Failed to load sessions. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const total  = sessions.length;
  const latest = sessions[0] ?? null;
  const avg    = total
    ? sessions.reduce((s, r) => s + r.probability, 0) / total
    : null;

  const getTrend = () => {
    if (sessions.length < 2) return { label: '—', tag: 'Need more tests' };
    const delta = sessions[0].probability - sessions[sessions.length - 1].probability;
    if (Math.abs(delta) < 0.02) return { label: '→ Stable',    tag: 'No significant change' };
    if (delta < 0)              return { label: '↓ Improving', tag: 'Score decreasing (good)' };
    return                             { label: '↑ Monitor',   tag: 'Score increasing' };
  };
  const trend = getTrend();

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Health Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back, {user?.name?.split(' ')[0] || 'there'} —
              your Parkinson's screening overview
            </p>
          </div>
          <button className={styles.newTestBtn} onClick={() => navigate('/test')}>
            + New Screening Test
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)', border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-sm)', padding: '12px 16px',
            fontSize: '13px', color: 'var(--danger)', marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.accent1}`}>
            <div className={styles.statLabel}>Total Sessions</div>
            <div className={styles.statVal}>{loading ? '...' : total}</div>
            <div className={styles.statTag}>All time screenings</div>
          </div>

          <div className={`${styles.statCard} ${styles.accent2}`}>
            <div className={styles.statLabel}>Latest Score</div>
            <div className={styles.statVal}>
              {loading ? '...' : latest ? Math.round(latest.probability * 100) + '%' : '—'}
            </div>
            <div className={`${styles.statTag} ${
              latest?.prediction === 0 ? styles.tagGreen : latest ? styles.tagRed : ''
            }`}>
              {loading ? '...' : latest
                ? latest.prediction === 0 ? 'Control' : 'Elevated Risk'
                : 'No test yet'}
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.accent3}`}>
            <div className={styles.statLabel}>Avg Probability</div>
            <div className={styles.statVal}>
              {loading ? '...' : avg !== null ? Math.round(avg * 100) + '%' : '—'}
            </div>
            <div className={styles.statTag}>Across all sessions</div>
          </div>

          <div className={`${styles.statCard} ${styles.accent4}`}>
            <div className={styles.statLabel}>Trend</div>
            <div className={styles.statVal}>{loading ? '...' : trend.label}</div>
            <div className={styles.statTag}>{loading ? '...' : trend.tag}</div>
          </div>
        </div>

        {/* Trend chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Probability Trend Over Time</span>
          </div>
          <TrendChart sessions={sessions} />
        </div>

        {/* Recent sessions table */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Recent Sessions</span>
            <button className={styles.viewAll} onClick={() => navigate('/history')}>
              View all →
            </button>
          </div>
          {loading
            ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading sessions...
              </div>
            : <HistoryTable
                sessions={sessions.slice(0, 5)}
                onRowClick={(s) =>
                  navigate('/result', { state: { result: s, features: s.features } })
                }
              />
          }
        </div>

      </div>
    </>
  );
}