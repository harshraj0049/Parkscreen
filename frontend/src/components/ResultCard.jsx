import styles from './HistoryTable.module.css';

export default function ResultCard({ session, onClick }) {
  if (!session) return null;

  const pct       = session.probability != null ? Math.round(session.probability * 100) : null;
  const isControl = session.prediction === 'Control' || session.prediction === 0;
  const date      = session.created_at
    ? new Date(session.created_at).toLocaleDateString()
    : '—';

  return (
    <div
      className={styles.row}
      onClick={() => onClick?.(session)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <span>{date}</span>
      <span style={{ color: isControl ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
        {pct != null ? `${pct}%` : '—'}
      </span>
      <span style={{ color: isControl ? 'var(--success)' : 'var(--danger)' }}>
        {isControl ? 'Control' : 'Elevated Risk'}
      </span>
    </div>
  );
}