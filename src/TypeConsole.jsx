import { useEffect, useState } from "react";

function TypeLine({ text = "", startDelay = 0, speed = 40, onDone }) {
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (i >= text.length) { onDone && onDone(); return; }
    const id = setTimeout(() => setI(i + 1), speed);
    return () => clearTimeout(id);
  }, [i, started, speed, text, onDone]);

  const shown = text.slice(0, i);
  const done = i >= text.length;

  return (
    <div className="console-line">
      <span className="console-arrow">&gt;</span>{" "}
      <span>{shown}</span>
      {!done && <span className="caret" />}
    </div>
  );
}

export default function TypeConsole() {
  const [l1Done, setL1Done] = useState(false);
  const [l2Start, setL2Start] = useState(false);
  const [l2Done, setL2Done] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // When line 1 finishes, start line 2 after a short pause
  useEffect(() => {
    if (!l1Done) return;
    const t = setTimeout(() => setL2Start(true), 350);
    return () => clearTimeout(t);
  }, [l1Done]);

  // When line 2 finishes, show final prompt after a short pause
  useEffect(() => {
    if (!l2Done) return;
    const t = setTimeout(() => setShowPrompt(true), 300);
    return () => clearTimeout(t);
  }, [l2Done]);

  return (
    <div className="type-console font-mono text-[12px] tracking-wider" style={{ color: "var(--ui)" }}>
      {/* Line 1 */}
      <TypeLine text="Hi," startDelay={300} speed={35} onDone={() => setL1Done(true)} />

      {/* Line 2 (mounts only after L1 fully completes + small pause) */}
      {l2Start && (
        <TypeLine text="Admin is currently offline." startDelay={0} speed={35} onDone={() => setL2Done(true)} />
      )}

      {/* Final prompt with blinking caret (only after L2 completes + small pause) */}
      {showPrompt && (
        <div className="console-line">
          <span className="console-arrow">&gt;</span>{" "}
          <span className="caret" />
        </div>
      )}
    </div>
  );
}