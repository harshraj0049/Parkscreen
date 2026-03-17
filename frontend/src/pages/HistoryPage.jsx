import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HistoryTable from '../components/HistoryTable';
import TrendChart from '../components/TrendChart';
import { getSessionHistory } from '../Services/api';  // ← no token param
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Fetch all sessions on page load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getSessionHistory(); // ← token param removed
        setSessions(data.sessions || []);
      } catch (err) {
        setError('Failed to load history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const avg = sessions.length
    ? sessions.reduce((s, r) => s + r.probability, 0) / sessions.length
    : null;
  const min = sessions.length ? Math.min(...sessions.map((s) => s.probability)) : null;
  const max = sessions.length ? Math.max(...sessions.map((s) => s.probability)) : null;

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Session History</h1>
            <p className={styles.subtitle}>All your past screening tests</p>
          </div>
          <button className={styles.btn} onClick={() => navigate('/test')}>
            + New Test
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

        {/* Chart + Summary row */}
        <div className={styles.topRow}>
          <div className={styles.card} style={{ flex: 1.5 }}>
            <div className={styles.cardTitle}>Probability Over Time</div>
            <TrendChart sessions={sessions} />
          </div>

          <div className={styles.card} style={{ flex: 1 }}>
            <div className={styles.cardTitle}>Summary</div>
            <div className={styles.summaryGrid}>
              {[
                { label: 'Total tests',  val: loading ? '...' : sessions.length,                                color: 'var(--text)'    },
                { label: 'Avg score',    val: loading ? '...' : avg !== null ? Math.round(avg * 100) + '%' : '—', color: 'var(--teal)'    },
                { label: 'Lowest risk',  val: loading ? '...' : min !== null ? Math.round(min * 100) + '%' : '—', color: 'var(--success)' },
                { label: 'Highest risk', val: loading ? '...' : max !== null ? Math.round(max * 100) + '%' : '—', color: 'var(--danger)'  },
              ].map((item) => (
                <div key={item.label} className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>{item.label}</div>
                  <div className={styles.summaryVal} style={{ color: item.color }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full sessions table */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>All Sessions</div>
          {loading
            ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading sessions...
              </div>
            : <HistoryTable
                sessions={sessions}
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