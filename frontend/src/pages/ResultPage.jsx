import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './ResultPage.module.css';

// Result page reads data from React Router navigation state —
// no API call needed here at all, so no token changes required.
// Data comes from TypingTestPage via: navigate('/result', { state: { result, features } })
// OR from HistoryTable row click via the same pattern.

const FEATURE_CONFIG = [
  { key: 'mean_hold',    label: 'Mean Hold Time',       unit: 'ms', max: 300 },
  { key: 'std_hold',     label: 'Hold Variability',      unit: 'ms', max: 100 },
  { key: 'mean_latency', label: 'Mean Latency',          unit: 'ms', max: 200 },
  { key: 'std_latency',  label: 'Latency Irregularity',  unit: 'ms', max: 80  },
  { key: 'hold_asym',    label: 'Hand Asymmetry',        unit: 'ms', max: 60  },
  { key: 'mean_flight',  label: 'Mean Flight Time',      unit: 'ms', max: 300 },
];

function getLevel(val, max) {
  const pct = val / max;
  if (pct < 0.35) return 'low';
  if (pct < 0.65) return 'mid';
  return 'high';
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state    = location.state;

  // No result in navigation state — show empty state
  if (!state?.result) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>🔬</div>
            <div className={styles.emptyTitle}>No result yet</div>
            <p className={styles.emptyDesc}>
              Complete a typing test first to see your result here.
            </p>
            <button className={styles.btn} onClick={() => navigate('/test')}>
              Take Typing Test
            </button>
          </div>
        </div>
      </>
    );
  }

  const { result, features } = state;
  const pct         = Math.round(result.probability * 100);
  const isControl   = result.prediction === 0;
  const circumference = 2 * Math.PI * 60;
  const offset      = circumference - circumference * result.probability;

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* Hero result card with gauge */}
        <div className={`${styles.hero} ${isControl ? styles.heroControl : styles.heroParkinson}`}>

          {/* Circular gauge */}
          <div className={styles.gauge}>
            <svg className={styles.gaugeSvg} viewBox="0 0 150 150">
              <circle className={styles.gaugeBg} cx="75" cy="75" r="60" />
              <circle
                className={styles.gaugeFill}
                cx="75" cy="75" r="60"
                stroke={isControl ? '#5df5e8' : '#ff6b6b'}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className={styles.gaugeText}>
              <span className={styles.gaugePct}>{pct}%</span>
              <span className={styles.gaugeSub}>probability</span>
            </div>
          </div>

          {/* Result info */}
          <div className={styles.info}>
            <div className={styles.infoLabel}>ML Model Prediction</div>
            <div className={styles.prediction}>
              {isControl ? 'Control — Low Risk' : 'Elevated Risk Detected'}
            </div>
            <p className={styles.description}>
              {isControl
                ? 'Your typing patterns are within the normal range. Continue monitoring with regular screenings to track any changes over time.'
                : 'Your typing patterns show some irregularities. This is not a diagnosis. Please consult a neurologist for professional evaluation.'}
            </p>
            <div className={styles.meta}>
              <div>
                <div className={styles.metaVal}>{result.keystrokes ?? '—'}</div>
                <div className={styles.metaLabel}>Keystrokes analyzed</div>
              </div>
              <div>
                <div className={styles.metaVal}>{result.date ?? '—'}</div>
                <div className={styles.metaLabel}>Test date</div>
              </div>
            </div>
          </div>

        </div>

        {/* Medical disclaimer */}
        <div className={styles.disclaimer}>
          ⚠️ <strong>Medical disclaimer:</strong> This tool is for educational
          screening only and is NOT a medical diagnosis. Please consult a licensed
          neurologist for any health concerns.
        </div>

        {/* Feature analysis cards */}
        {features && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Typing Pattern Analysis</div>
            <div className={styles.featuresGrid}>
              {FEATURE_CONFIG.map((f) => {
                const val = features[f.key] ?? 0;
                const barPct = Math.min((val / f.max) * 100, 100);
                const lvl = getLevel(val, f.max);
                return (
                  <div key={f.key} className={styles.featureCard}>
                    <div className={styles.featureName}>{f.label}</div>
                    <div className={styles.featureVal}>{val} {f.unit}</div>
                    <div className={styles.featureBar}>
                      <div
                        className={`${styles.featureFill} ${styles[lvl]}`}
                        style={{ width: barPct.toFixed(0) + '%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => navigate('/test')}>
            Take New Test
          </button>
          <button className={styles.btnOutline} onClick={() => navigate('/history')}>
            View History
          </button>
        </div>

      </div>
    </>
  );
}