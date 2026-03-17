import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TypingBox from '../components/TypingBox';
import LoadingSpinner from '../components/LoadingSpinner';
import { useKeystroke } from '../hooks/useKeystroke';
import { computeFeatures } from '../utils/computeFeatures';
import { submitTypingSession } from '../Services/api';
import { useAuth } from '../Context/AuthContext';
import styles from './TypingTestPage.module.css';

const TARGET_SENTENCE = '"The quick brown fox jumps over the lazy dog"';
const MIN_KEYSTROKES  = 100;

export default function TypingTestPage() {
  const { user } = useAuth();         // ← was: const { token } = useAuth()
                                      //   token is gone, we only need user for display
  const navigate  = useNavigate();
  const { events, handleKeyDown, handleKeyUp, reset, count, isReady } = useKeystroke();

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const timerRef = useRef(null);

  const progressPct = Math.min((count / MIN_KEYSTROKES) * 100, 100);

  const onInput = () => {
    if (!isRecording) {
      setIsRecording(true);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
  };

  const handleReset = () => {
    reset();
    setIsRecording(false);
    setElapsed(0);
    clearInterval(timerRef.current);
  };

  const handleSubmit = async () => {
    if (!isReady) return;
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const features = computeFeatures(events);

      // ── BEFORE (localStorage approach) ──
      // const result = await submitTypingSession(events, token);

      // ── AFTER (cookie approach) ──
      // token param is gone — cookie is sent automatically by the browser
      const result = await submitTypingSession(events);

      navigate('/result', { state: { result, features } });
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {loading && (
        <LoadingSpinner
          message="Analyzing keystroke patterns..."
          sub="Running ML prediction model"
        />
      )}
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>Start Your Neurological Screening</h2>
            <p className={styles.heroDesc}>
              Type naturally and comfortably. Don't rush or slow down.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroVal}>{count}</span>
                <span className={styles.heroLabel}>Keystrokes</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroVal}>{MIN_KEYSTROKES}</span>
                <span className={styles.heroLabel}>Required Min</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroVal}>{elapsed}s</span>
                <span className={styles.heroLabel}>Elapsed</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.sentenceLabel}>Type this sentence exactly:</div>
          <div className={styles.sentence}>{TARGET_SENTENCE}</div>

          <div className={styles.progress}>
            <div className={styles.progressTop}>
              <span className={styles.progressLabel}>Keystrokes recorded</span>
              <span className={styles.progressCount}>{count} / {MIN_KEYSTROKES} minimum</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: progressPct + '%' }} />
            </div>
          </div>

          <TypingBox
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onInput={onInput}
            isRecording={isRecording}
          />

          <div className={styles.actions}>
            <div className={styles.counter}>
              <span className={styles.counterNum}>{count}</span>
              <span className={styles.counterLabel}>keystrokes</span>
            </div>
            <div className={styles.btns}>
              <button className={styles.resetBtn} onClick={handleReset}>Reset</button>
              <button
                className={styles.submitBtn}
                disabled={!isReady}
                onClick={handleSubmit}
              >
                Analyze Keystrokes
              </button>
            </div>
          </div>
        </div>

        <div className={styles.instructions}>
          {[
            { icon: '⌨️', bg: '#e0f5f3', title: 'Type naturally',        desc: "Use your normal speed and rhythm. Don't rush or slow down." },
            { icon: '📊', bg: '#fef3c7', title: '100 keystrokes needed',  desc: 'We need at least 100 key events for a valid analysis.' },
            { icon: '🔬', bg: '#fee2e2', title: 'Not a diagnosis',        desc: 'Screening tool only. Consult a medical professional.' },
          ].map((item) => (
            <div key={item.title} className={styles.instrItem}>
              <div className={styles.instrIcon} style={{ background: item.bg }}>{item.icon}</div>
              <div>
                <div className={styles.instrTitle}>{item.title}</div>
                <div className={styles.instrDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}