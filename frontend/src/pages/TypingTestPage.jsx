import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TypingBox from '../components/TypingBox';
import LoadingSpinner from '../components/LoadingSpinner';
import { useKeystroke } from '../hooks/useKeystroke';
import { computeFeatures } from '../utils/computeFeatures';
import { submitTypingSession } from '../Services/api';
import { useAuth } from '../Context/AuthContext';
import styles from './TypingTestPage.module.css';

// ── 10 screening sentences ──────────────────────────────────────────
const SENTENCES = [
  'A swift auburn fox leaps across the sleepy hound.',
  'Bright stars shine above the quiet village at night.',
  'The clever cat silently stalks the tiny mouse.',
  'Gentle waves wash over the soft sandy shore.',
  'A bold eagle soars high in the endless blue sky.',
  'The young boy quickly solved the tricky puzzle.',
  'Fresh green leaves dance in the cool autumn breeze.',
  'A happy dog runs freely in the open field.',
  'The old clock ticks loudly in the silent room.',
  'Soft rain falls gently on the calm lake surface.',
];

// Pick one sentence randomly — called once when page loads
function getRandomSentence() {
  const index = Math.floor(Math.random() * SENTENCES.length);
  return { text: SENTENCES[index], index };
}

const MIN_KEYSTROKES = 100;

export default function TypingTestPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { events, handleKeyDown, handleKeyUp, reset, count, isReady } = useKeystroke();

  // Pick a random sentence when the component first mounts
  const [sentence, setSentence]     = useState(() => getRandomSentence());
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
    // Pick a NEW random sentence on every reset too
    setSentence(getRandomSentence());
  };

  const handleSubmit = async () => {
    if (!isReady) return;
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const features = computeFeatures(events);
      const result   = await submitTypingSession(events);  // cookie sent automatically
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

        {/* Hero banner */}
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

        {/* Test card */}
        <div className={styles.card}>

          {/* Sentence display */}
          <div className={styles.sentenceHeader}>
            <div className={styles.sentenceLabel}>Type this sentence exactly:</div>
            {/* Sentence number badge */}
            <div className={styles.sentenceBadge}>
              Sentence {sentence.index + 1} of {SENTENCES.length}
            </div>
          </div>
          <div className={styles.sentence}>
            "{sentence.text}"
          </div>

          {/* Progress bar */}
          <div className={styles.progress}>
            <div className={styles.progressTop}>
              <span className={styles.progressLabel}>Keystrokes recorded</span>
              <span className={styles.progressCount}>
                {count} / {MIN_KEYSTROKES} minimum
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: progressPct + '%' }}
              />
            </div>
          </div>

          {/* Typing area */}
          <TypingBox
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onInput={onInput}
            isRecording={isRecording}
          />

          {/* Actions row */}
          <div className={styles.actions}>
            <div className={styles.counter}>
              <span className={styles.counterNum}>{count}</span>
              <span className={styles.counterLabel}>keystrokes</span>
            </div>
            <div className={styles.btns}>
              {/* Reset also picks a new random sentence */}
              <button className={styles.resetBtn} onClick={handleReset}>
                Reset & New Sentence
              </button>
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

        {/* Instructions */}
        <div className={styles.instructions}>
          {[
            {
              icon: '⌨️', bg: '#e0f5f3',
              title: 'Type naturally',
              desc: "Use your normal speed and rhythm. Don't rush or slow down.",
            },
            {
              icon: '📊', bg: '#fef3c7',
              title: '100 keystrokes needed',
              desc: 'We need at least 100 key events for a valid analysis.',
            },
            {
              icon: '🔬', bg: '#fee2e2',
              title: 'Not a diagnosis',
              desc: 'Screening tool only. Consult a medical professional.',
            },
          ].map((item) => (
            <div key={item.title} className={styles.instrItem}>
              <div className={styles.instrIcon} style={{ background: item.bg }}>
                {item.icon}
              </div>
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