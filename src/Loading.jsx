import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './index.css';

function TypeLine({ text, delay = 0, speed = 0.03, className = "", leadHold = 0.15, onDone = () => {}, persistCursor = false, showCursor = true }) {
  const [typed, setTyped] = useState(false);
  const chars = Array.from(text);
  const hasLead = chars[0] === '>';

  // fire onDone after the last char would appear
  useEffect(() => {
    const total = delay + (hasLead ? leadHold : 0) + speed * (chars.length - 1) + 0.05;
    const t = setTimeout(() => { setTyped(true); onDone(); }, total * 1000);
    return () => clearTimeout(t);
  }, [delay, speed, leadHold, hasLead, chars.length, onDone]);

  return (
    <div className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: hasLead && i > 0 ? delay + leadHold + i * speed : delay + i * speed,
            duration: 0.001
          }}
          style={{ whiteSpace: 'pre' }}
        >
          {ch}
        </motion.span>
      ))}
      {showCursor && (!typed || persistCursor) && <span className="cursor" />}
    </div>
  );
}

/**
 * Cyberpunk / HUD Loading Screen
 * - Shows boot logs at top-left
 * - Big glowing PMB logotype
 * - Animated progress bar with 4 blocks
 * - Auto-completes and calls onFinish()
 */
export default function Loading({ onFinish = () => {} , duration = 2600 }) {
  const [progress, setProgress] = useState(0);
  const [labelGlitch, setLabelGlitch] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const pct = Math.min(1, (t - start) / duration);
      setProgress(pct);
      if (pct < 1) raf = requestAnimationFrame(tick);
      else onFinish();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onFinish]);

  useEffect(() => {
    // show the terminal prompt near the end of the sequence
    const revealAt = Math.max(0, duration - 700); // 700ms before finish
    const timer = setTimeout(() => setFinalPrompt(true), revealAt);
    return () => clearTimeout(timer);
  }, [duration]);

  // compute which blocks are lit
  const blocks = 4;
  const active = Math.round(progress * blocks);
  const isLoading = progress < 1;

  return (
    <div className="loading-root crt">
      {/* frame border */}
      <div className="hud-frame">
        {/* boot logs */}
        <div className="boot-logs">
          <TypeLine text="> ACCESSING PORTFOLIO MAINFRAME…" delay={0.1} speed={0.02} leadHold={0.18} persistCursor={false} showCursor={false} />
          <TypeLine text="> IDENTIFYING VISITOR…" delay={1.2} speed={0.02} leadHold={0.18} persistCursor={false} showCursor={false} />
          {finalPrompt && (
            <div className="term-prompt">&gt;<span className="cursor" /></div>
          )}
        </div>

        {/* big logo */}
        <motion.h1
          className="logo-pmb"
          aria-label="PMB"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{
            opacity: [0, 1, 0.85, 1],
            scale: [0.98, 1.0, 0.995, 1.0],
            filter: [
              'drop-shadow(0 0 0px rgba(0,255,247,0))',
              'drop-shadow(0 0 22px rgba(0,255,247,.8))',
              'drop-shadow(0 0 12px rgba(0,255,247,.5))',
              'drop-shadow(0 0 22px rgba(0,255,247,.8))'
            ],
          }}
          transition={{ delay: 1.85, duration: 0.7, times: [0, 0.4, 0.7, 1], ease: 'easeOut' }}
        >
          <span className="logo-layer logo-cyan">PMB</span>
          <span className="logo-layer logo-magenta" aria-hidden>PMB</span>
          <span className="logo-layer logo-green" aria-hidden>PMB</span>
        </motion.h1>

        {/* progress bar */}
        <div className="progress">
          {Array.from({ length: blocks }).map((_, i) => (
            <div key={i} className={`block ${i < active ? 'on' : ''}`} />
          ))}
        </div>
        <div className="progress-label glitch">
          {/* Type once; keep cursor while loading */}
          <TypeLine
            text="LOADING PORTFOLIO…"
            delay={1.2}
            speed={0.03}
            persistCursor={isLoading}
            onDone={() => setLabelGlitch(true)}
          />

          {/* While loading, overlay VHS chroma layers that jitter */}
          {labelGlitch && isLoading && (
            <>
              <motion.span
                className="glitch__r"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.4, 1, 0.2], x: [0, 1, -1, 1, 0], skewX: [0, 2, -2, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.6 }}
                aria-hidden
              >
                LOADING PORTFOLIO…
              </motion.span>
              <motion.span
                className="glitch__b"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.4, 1, 0.2], x: [0, -1, 1, -1, 0], skewX: [0, -2, 2, -1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.6 }}
                aria-hidden
              >
                LOADING PORTFOLIO…
              </motion.span>
            </>
          )}

          {/* When complete, swap to a short one-shot glitch that settles */}
          {!isLoading && (
            <>
              <motion.span
                className="glitch__main"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0.9, 1] }}
                transition={{ duration: 0.6 }}
              >
                PROCESS COMPLETED
              </motion.span>
              <motion.span className="glitch__r" initial={{opacity:0}} animate={{opacity:[0,1,0], x:[0,2,-2]}} transition={{duration:.25}} aria-hidden>PROCESS COMPLETED</motion.span>
              <motion.span className="glitch__b" initial={{opacity:0}} animate={{opacity:[0,1,0], x:[0,-2,2]}} transition={{duration:.25}} aria-hidden>PROCESS COMPLETED</motion.span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}