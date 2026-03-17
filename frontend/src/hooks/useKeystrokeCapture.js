import { useState, useEffect, useRef, useCallback } from 'react';

// Keys mapped to left or right hand
const LEFT_HAND_KEYS = new Set([
  'q','w','e','r','t',
  'a','s','d','f','g',
  'z','x','c','v','b'
]);

const getHand = (key) => {
  const k = key.toLowerCase();
  if (LEFT_HAND_KEYS.has(k)) return 'L';
  if (k.length === 1 && k >= 'a' && k <= 'z') return 'R';
  return null; // ignore non-letter keys
};

export function useKeystrokeCapture() {
  const [events, setEvents]     = useState([]);
  const [isReady, setIsReady]   = useState(false);
  const keydownTimes            = useRef({});  // tracks keydown timestamps
  const lastKeydown             = useRef(null); // tracks previous keydown time
  const lastKeyup               = useRef(null); // tracks previous keyup time

  const reset = useCallback(() => {
    setEvents([]);
    setIsReady(false);
    keydownTimes.current  = {};
    lastKeydown.current   = null;
    lastKeyup.current     = null;
  }, []);

  const handleKeydown = useCallback((e) => {
    const key  = e.key;
    const hand = getHand(key);
    if (!hand) return;                          // skip non-letter keys
    if (keydownTimes.current[key]) return;      // skip key repeat (held down)

    const now = performance.now();
    keydownTimes.current[key] = { time: now, hand };
  }, []);

  const handleKeyup = useCallback((e) => {
    const key   = e.key;
    const entry = keydownTimes.current[key];
    if (!entry) return;

    const now     = performance.now();
    const hold    = now - entry.time;
    const latency = lastKeydown.current !== null
      ? entry.time - lastKeydown.current
      : null;
    const flight  = lastKeyup.current !== null
      ? entry.time - lastKeyup.current
      : null;

    // Only record if we have complete data
    if (latency !== null && flight !== null) {
      const event = {
        hold:    parseFloat(hold.toFixed(2)),
        latency: parseFloat(latency.toFixed(2)),
        flight:  parseFloat(flight.toFixed(2)),
        hand:    entry.hand
      };

      setEvents(prev => {
        const updated = [...prev, event];
        // Mark ready when we have 100+ events
        if (updated.length >= 100) setIsReady(true);
        return updated;
      });
    }

    lastKeydown.current = entry.time;
    lastKeyup.current   = now;
    delete keydownTimes.current[key];
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup',   handleKeyup);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup',   handleKeyup);
    };
  }, [handleKeydown, handleKeyup]);

  return { events, isReady, reset, count: events.length };
}