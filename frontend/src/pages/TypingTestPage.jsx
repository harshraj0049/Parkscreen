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
  "A swift auburn fox leaps gracefully across the sleepy hound resting quietly under the warm golden sunlight, moving with effortless agility and silent precision through the calm forest clearing while birds chirp softly in the background and leaves rustle gently in the cool breeze, creating a peaceful and vivid natural scene that reflects harmony between animals and their surroundings as the fox disappears into the dense woods leaving behind a moment of quiet wonder and beauty that lingers in the stillness of the tranquil environment for a brief yet memorable time.",
  
  "Bright stars shine brilliantly above the quiet village at night, illuminating the dark sky with countless sparkling points of light while a gentle breeze flows through narrow streets and small houses rest peacefully under the vast expanse of the universe, creating a soothing and magical atmosphere where silence is only broken by distant sounds and soft whispers of nature as people sleep soundly inside their homes unaware of the breathtaking beauty unfolding above them in the endless sky that stretches far beyond imagination and fills the night with calmness and quiet inspiration.",
  
  "The clever cat silently stalks the tiny mouse hiding beneath the old wooden table, moving slowly and carefully with sharp focus and precise steps while its eyes remain fixed on the slightest movement, demonstrating patience and instinct in a quiet room filled with tension and anticipation as the mouse tries to escape unnoticed, creating a small yet intense moment of survival and strategy between predator and prey in a simple everyday setting where even the smallest actions carry significance and the outcome remains uncertain until the final sudden movement breaks the silence.",
  
  "Gentle waves wash over the soft sandy shore again and again in a rhythmic motion that brings a sense of calm and relaxation to anyone watching the endless cycle of water meeting land, as the cool breeze carries the salty scent of the sea and the distant horizon stretches far beyond sight under a clear sky, creating a peaceful coastal scene where time seems to slow down and worries fade away, allowing the mind to rest and enjoy the soothing sounds and natural beauty that surrounds the quiet and serene environment.",
  
  "A bold eagle soars high in the endless blue sky with wings spread wide, gliding effortlessly above mountains and valleys while scanning the land below with keen vision and unmatched focus, representing strength and freedom in its purest form as it rides the currents of air with confidence and grace, creating a majestic and inspiring sight against the vast open sky that symbolizes independence and power, reminding observers of the beauty and wonder found in nature when creatures move in harmony with their environment and embrace their true capabilities.",
  
  "The young boy quickly solved the tricky puzzle placed before him on the small wooden table, using sharp thinking and creative problem solving skills while focusing deeply on each piece and how it connects, demonstrating patience and determination as he carefully analyzed every possibility, eventually reaching the correct solution with a sense of satisfaction and quiet pride that reflected his effort and persistence, showing how even a simple challenge can become a meaningful learning experience that builds confidence and encourages curiosity in growing minds.",
  
  "Fresh green leaves dance gently in the cool autumn breeze, creating a soft rustling sound that fills the air with a sense of calm and seasonal change as trees sway slightly under the shifting wind and sunlight filters through the branches, casting moving shadows on the ground below, forming a peaceful and ever-changing natural scene that captures the beauty of transition and reminds observers of the passage of time and the quiet elegance found in nature as it moves steadily through its cycles without pause or resistance.",
  
  "A happy dog runs freely in the open field under the bright sky, chasing after imaginary paths and enjoying every moment with boundless energy and excitement while its tail wags constantly and its movements reflect pure joy and freedom, creating a lively and heartwarming scene that captures the simple pleasures of life as the dog explores its surroundings without worry, reminding anyone watching of the importance of living in the present moment and finding happiness in small, ordinary experiences that bring genuine satisfaction and peace.",
  
  "The old clock ticks loudly in the silent room, marking the steady passage of time with each rhythmic sound that echoes softly against the walls, creating a quiet yet noticeable presence that fills the stillness as everything else remains motionless and calm, giving the sense that time continues forward regardless of human awareness or action, turning an ordinary object into a symbol of continuity and persistence that reminds observers of the importance of each passing moment and how even silence can carry meaning when attention is given to subtle details.",
  
  "Soft rain falls gently on the calm lake surface, creating small ripples that spread outward in delicate patterns while the surrounding landscape becomes slightly blurred under the steady drizzle, forming a peaceful and reflective atmosphere where sounds are softened and the world feels slower and more thoughtful, allowing the mind to relax and observe the quiet beauty of nature as it transforms the scene into something serene and meditative, reminding observers of the calming effect of rain and its ability to bring stillness and clarity to both the environment and the human mind."
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