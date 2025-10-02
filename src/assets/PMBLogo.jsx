import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function PMBLogo() {
  const wrapRef = useRef(null);
  const heroRef = useRef(null);
  const turbRef = useRef(null);
  const dispRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    const turb = turbRef.current; // <feTurbulence>
    const disp = dispRef.current; // <feDisplacementMap>
    if (!el || !turb || !disp) return;

    // Baseline values
    gsap.set(disp, { attr: { scale: 0 } });
    gsap.set(turb, { attr: { baseFrequency: "0.002 0.004" } });

    // Hover in: pulse up scale + agitate turbulence a bit
    const enter = () => {
      gsap.killTweensOf([disp, turb]);
      gsap.to(disp, { duration: 0.35, attr: { scale: 28 }, ease: "sine.out" });
      gsap.to(turb, { duration: 0.35, attr: { baseFrequency: "0.01 0.02" }, ease: "sine.out" });
      // settle to a gentle ripple while hovering
      gsap.to(disp, { duration: 0.6, delay: 0.35, attr: { scale: 10 }, ease: "sine.inOut" });
      gsap.to(turb, { duration: 0.6, delay: 0.35, attr: { baseFrequency: "0.006 0.012" }, ease: "sine.inOut" });
    };

    // Hover out: glide back to clean
    const leave = () => {
      gsap.killTweensOf([disp, turb]);
      gsap.to([disp, turb], {
        duration: 0.45,
        ease: "sine.inOut",
        attr: { scale: 0, baseFrequency: "0.002 0.004" },
      });
    };

    // Mouse move: micro spikes based on velocity
    let lastX = 0, lastY = 0, lastT = performance.now();
    const move = (e) => {
      const now = performance.now();
      const dt = Math.max(16, now - lastT);
      const vx = (e.clientX - lastX) / dt; // px per ms
      const vy = (e.clientY - lastY) / dt;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      const v = Math.min(1.5, Math.hypot(vx, vy));
      // brief spike that quickly eases back, looks like liquid wobble
      gsap.to(disp, { duration: 0.12, attr: { scale: 10 + v * 18 }, overwrite: true, ease: "power2.out" });
      gsap.to(turb, { duration: 0.12, attr: { baseFrequency: `${0.006 + v*0.01} ${0.012 + v*0.02}` }, overwrite: true, ease: "power2.out" });
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mousemove", move);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <>
      {/* SVG water filter (objectBoundingBox so it conforms to the element) */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <filter id="pmbWater" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.002 0.004"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <motion.div
        ref={wrapRef}
        whileHover={{
          x: [0, -1, 1, 0],
          y: [0, 1, -1, 0],
          filter: [
            "drop-shadow(0 0 22px rgba(0,255,247,.65))",
            "drop-shadow(0 0 10px rgba(0,255,247,.35))",
            "drop-shadow(0 0 22px rgba(0,255,247,.65))",
          ],
        }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
      >
        {/* Apply the water filter directly to the text element for crispness */}
        <h1 className="logo-pmb" ref={heroRef} style={{ filter: "url(#pmbWater)" }}>
          <span className="logo-layer logo-cyan">PMB</span>
          <span className="logo-layer logo-magenta" aria-hidden>
            PMB
          </span>
          <span className="logo-layer logo-green" aria-hidden>
            PMB
          </span>
        </h1>
      </motion.div>
    </>
  );
}