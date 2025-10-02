import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './index.css';
import NeonBackground from './NeonBackground.jsx';
import PMBLogo from './assets/PMBLogo.jsx';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';
import FloatingSprites from './FloatingSprites.jsx';
import TypeConsole from './TypeConsole.jsx';
import { SoundToggleButton } from './Howler.jsx';
import SupermanComet from './SupermanComet.jsx';
import MousePointer from './MousePointer.jsx';

export default function Home() {
  const [akira, setAkira] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('akira-mode', akira);
    return () => document.body.classList.remove('akira-mode');
  }, [akira]);

  const frameRef = useRef(null);
  const heroRef = useRef(null);

  const handleMove = (e)=>{
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left)/rect.width;  // 0..1
    const y = (e.clientY - rect.top)/rect.height;  // 0..1
    const rx = (0.5 - y) * 6;   // tilt up/down
    const ry = (x - 0.5) * 8;   // tilt left/right
    if(heroRef.current){
      heroRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  };
  const handleLeave = ()=>{
    if(heroRef.current){ heroRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'; }
  };
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      className="home-root min-h-screen grid place-items-center"
      style={{ background: 'var(--bg)' }}
      initial={{ opacity: 0, filter: "contrast(400%) hue-rotate(45deg)" }}
      animate={{ opacity: 1, filter: "contrast(100%) hue-rotate(0deg)" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <main className="w-full max-w-[1100px] mx-auto p-6 min-h-[90vh] flex flex-col">
        <div
          className="hud-frame"
          ref={frameRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ perspective: '1000px' }}
        >
          <div className="bg-texture" aria-hidden />

          {/* 80s synth neon grid background (Three.js) */}
          <NeonBackground />

          <MousePointer />

          <SupermanComet />

          <FloatingSprites count ={10} />
          <div className="vhs-overlay" aria-hidden />

          {/*Nav bar*/}
          <Nav onTogglePalette={() => setAkira(a => !a)} paletteLabel={akira ? 'Cyan Mode' : 'AKIRA Mode'} />

          {/* Optional AKIRA corner brackets */}
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />

          
          <section className="relative z-10 flex items-center justify-center flex-grow">
          <PMBLogo />
          </section>

          {/* Console text (near bottom) */}
          <section className="relative z-10 grid place-items-center mt-auto mb-2">
            <TypeConsole />
          </section>

          {/* Footer */}
         <Footer />
         

          {/* Sound icon (bottom-right) */}
         <div className="absolute bottom-2 right-2 z-20">
           <SoundToggleButton className="btn-neon" />
         </div>
         

          {/* Decorative HUD sprites (same as your design) */}
          <div aria-hidden className="relative z-0" style={{ position: 'absolute', left: '22px', top: '40px', opacity: .85 }}>
            <div style={{ width: 20, height: 20, border: '3px solid var(--cyan)', rotate: '15deg' }} />
            <div style={{ width: 8, height: 8, border: '2px solid var(--cyan)', marginTop: 10, marginLeft: 18 }} />
          </div>
          <div aria-hidden className="relative z-0" style={{ position: 'absolute', right: '36px', bottom: '96px', opacity: .85 }}>
            <div style={{ width: 26, height: 26, border: '3px solid var(--cyan)', rotate: '-12deg' }} />
          </div>
        </div>
      </main>
    </motion.div>
  );
}