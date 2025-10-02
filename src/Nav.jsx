import { useState, useRef } from "react";
import { playSfx } from "./Howler.jsx";

// Scramble label that jumbles characters on hover/click then resolves
function ScrambleButton({ label, onClick, className }){
  const [text, setText] = useState(label);
  const original = useRef(label);
  const frame = useRef(0);
  const raf = useRef(null);
  const chars = "░▒▓▲∆▮/\\|_-=+*#@$%&1234567890";

  const animate = (duration=800)=>{
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const len = original.current.length;
    const run = (t)=>{
      const p = Math.min(1, (t - start)/duration);
      const out = original.current.split("").map((ch, i)=>{
        const thresh = (i+1)/len; // settle left->right
        if(p < thresh) return chars[Math.floor(Math.random()*chars.length)];
        return ch;
      }).join("");
      setText(out);
      if(p < 1){ raf.current = requestAnimationFrame(run); } else { setText(original.current); }
    };
    raf.current = requestAnimationFrame(run);
  };

  return (
    <button
      className={className}
      onMouseEnter={() => {
        playSfx("hover");
        animate(700);
      }}
      onClick={(e) => {
        playSfx("click");
        animate(900);
        onClick && onClick(e);
      }}
    >{text}</button>
  );
}

export default function Nav({ onTogglePalette, paletteLabel = "AKIRA Mode" }) {
  const navLinks = [
    { label: "Launch Projects", href: "#projects" },
    { label: "Read Dossier", href: "#about" },
    { label: "Initiate Contact", href: "#contact" },
  ];

  return (
    <nav className="absolute top-4 right-6 z-20 flex gap-3 font-mono text-sm tracking-wide">
      {navLinks.map((link) => (
        <ScrambleButton
          key={link.label}
          className="btn-neon"
          label={link.label}
          href={link.href}
        />
      ))}
      {onTogglePalette && (
        <button className="btn-neon" onClick={onTogglePalette}>{paletteLabel}</button>
      )}
    </nav>
  );
}