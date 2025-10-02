

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * FloatingSprites (Three.js)
 * - Renders drifting HUD "X" sprites behind your UI (above the grid), transparent canvas.
 * - Follows mouse subtly (parallax) and cleans up on unmount.
 *
 * Props:
 *   count?: number (default 12)
 *   colors?: number[] (THREE hex colors)
 */
export default function FloatingSprites({ count = 12, colors = [0x00fff7, 0xff008c, 0x66fff1] }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0); // transparent

    // --- Scene / Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 15);

    // --- Utility: generate a small texture that draws an "X" ---
    const makeXTexture = (hex = 0x00fff7) => {
      const c = document.createElement('canvas');
      const s = 64; c.width = s; c.height = s; const g = c.getContext('2d');
      g.clearRect(0,0,s,s);
      g.strokeStyle = `#${hex.toString(16).padStart(6,'0')}`;
      g.lineWidth = 6; g.lineCap = 'round';
      g.shadowColor = g.strokeStyle; g.shadowBlur = 10;
      g.translate(s/2, s/2); g.rotate(Math.PI/8);
      g.beginPath(); g.moveTo(-18,-18); g.lineTo(18,18); g.moveTo(-18,18); g.lineTo(18,-18); g.stroke();
      return new THREE.CanvasTexture(c);
    };

    // Create a few textures (one per color) and reuse
    const textures = colors.map(makeXTexture);

    // --- Sprites ---
    const group = new THREE.Group();
    scene.add(group);

    const sprites = [];
    for (let i = 0; i < count; i++) {
      const tex = textures[i % textures.length];
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 });
      const sp = new THREE.Sprite(mat);
      const size = 0.6 + Math.random() * 1.8; // world units
      sp.scale.set(size, size, 1);
      sp.position.set((Math.random()-0.5)*30, (Math.random()-0.5)*20, -5 - Math.random()*15);
      sp.userData = {
        amp: 0.4 + Math.random()*0.8,
        speed: 0.3 + Math.random()*0.8,
        phase: Math.random()*Math.PI*2,
        drift: (Math.random()-0.5)*0.02,
      };
      group.add(sp);
      sprites.push(sp);
    }

    // --- Mouse parallax ---
    const targetRot = { x: 0, y: 0 };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left)/rect.width; // 0..1
      const ny = (e.clientY - rect.top)/rect.height; // 0..1
      const cx = Math.min(1, Math.max(0, nx));
      const cy = Math.min(1, Math.max(0, ny));
      targetRot.y = (cx - 0.5) * THREE.MathUtils.degToRad(6);
      targetRot.x = (0.5 - cy) * THREE.MathUtils.degToRad(4);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // --- Animate ---
    let t = 0;
    const animate = () => {
      t += 0.016; // ~60fps step

      // Ease camera rotation for parallax
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRot.y, 0.06);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRot.x, 0.06);

      // Bobbing / drifting sprites
      for (const s of sprites) {
        const u = s.userData;
        s.position.y += Math.sin(t * u.speed + u.phase) * 0.004 * u.amp;
        s.position.x += u.drift;
        // wrap horizontally a bit so they don't leave the frame forever
        if (s.position.x > 10) s.position.x = -10;
        if (s.position.x < -10) s.position.x = 10;
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    // --- Resize ---
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w/h; camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      // dispose
      textures.forEach(tex => tex.dispose());
      renderer.dispose();
    };
  }, [count, colors]);

  return <canvas ref={canvasRef} className="sprites3d-canvas" />;
}