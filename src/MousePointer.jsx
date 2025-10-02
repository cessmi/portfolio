import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";

/**
 * MousePointer — neon DIAMOND reticle that follows the mouse with easing.
 * NOTE: Renders into document.body (portal) so position:fixed is correct even if ancestors are transformed.
 */
export default function MousePointer() {
  const ref = useRef(null);
  const xQuick = useRef(null);
  const yQuick = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Center by transform; GSAP controls translateX/translateY (x/y)
    gsap.set(el, { xPercent: -50, yPercent: -50, x: window.innerWidth/2, y: window.innerHeight/2 });
    xQuick.current = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3.out" });
    yQuick.current = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3.out" });

    const onMove = (e) => {
      if (e.pointerType === 'touch') return; // ignore touches
      xQuick.current && xQuick.current(e.clientX);
      yQuick.current && yQuick.current(e.clientY);
    };

    const onDown = () => {
      el.classList.add("cursor-active");
      gsap.fromTo(el, { scale: 1 }, { scale: 0.9, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
    };
    const onUp = () => { el.classList.remove("cursor-active"); };

    const isInteractive = (t) => t?.closest?.('a, button, [role="button"], .btn-neon');
    const onOver = (e) => { if (isInteractive(e.target)) el.classList.add('cursor-hover'); };
    const onOut  = (e) => { if (isInteractive(e.target)) el.classList.remove('cursor-hover'); };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown,  { passive: true });
    window.addEventListener('pointerup',   onUp,    { passive: true });
    window.addEventListener('mouseover', onOver, true);
    window.addEventListener('mouseout',  onOut,  true);

    const onResize = () => {
      // keep last position roughly centered on resize
      gsap.set(el, { x: Math.min(window.innerWidth-4, Math.max(4, gsap.getProperty(el, 'x'))), y: Math.min(window.innerHeight-4, Math.max(4, gsap.getProperty(el, 'y'))) });
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('mouseover', onOver, true);
      window.removeEventListener('mouseout', onOut, true);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const node = (
    <div ref={ref} className="cursor-square" aria-hidden>
      <span className="cursor-box">
        <span className="cursor-core" />
        <span className="cursor-scan" />
      </span>
    </div>
  );

  return createPortal(node, document.body);
}