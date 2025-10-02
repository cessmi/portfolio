// src/SupermanComet.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SupermanComet({ color = 0x00fff7 }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.domElement.className = "superman-canvas";
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    // Glow head (sprite)
    const glowTex = new THREE.TextureLoader().load(
      // simple radial texture; you can replace with your own glow png in /public/assets
      "data:image/svg+xml;utf8," + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
          <radialGradient id='g' cx='50%' cy='50%'>
            <stop offset='0%' stop-color='white' stop-opacity='1'/>
            <stop offset='100%' stop-color='white' stop-opacity='0'/>
          </radialGradient>
          <rect width='100%' height='100%' fill='url(#g)'/>
        </svg>`
      )
    );
    const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false }));
    head.scale.set(0.6, 0.6, 0.6);
    scene.add(head);

    // Trail line
    const trailGeom = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const trail = new THREE.Line(trailGeom, trailMat);
    scene.add(trail);

    // Helpers to build paths & animate
    const tmp = new THREE.Vector3();
    let pts = [];
    let t = 0;
    let speed = 0.35; // higher = faster
    let path, trailPositions, lastTime = performance.now();
    let rafId;

    function newPath() {
      const W = 10, H = 6;
      const left = -W * 0.7, right = W * 0.7;
      const y1 = THREE.MathUtils.randFloat(-H * 0.2, H * 0.25);
      const y2 = THREE.MathUtils.randFloat(-H * 0.3, H * 0.3);
      const y3 = THREE.MathUtils.randFloat(-H * 0.25, H * 0.2);
      const startLeft = Math.random() > 0.5;

      const p0 = new THREE.Vector3(startLeft ? left : right, y1, 0);
      const p1 = new THREE.Vector3(THREE.MathUtils.randFloat(-W * 0.2, W * 0.2), y2, 0);
      const p2 = new THREE.Vector3(startLeft ? right : left, y3, 0);

      path = new THREE.CatmullRomCurve3([p0, p1, p2], false, "catmullrom", 0.6);
      t = 0;
      // reset trail buffer
      pts = new Array(60).fill(0).map(() => p0.clone());
      trailPositions = new Float32Array(pts.length * 3);
      trailGeom.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    }

    newPath();

    function animate() {
      const now = performance.now();
      const dt = Math.min(50, now - lastTime) / 1000;
      lastTime = now;

      // move along curve
      t += dt * speed;
      if (t >= 1) {
        // small random pause then new run
        const pause = THREE.MathUtils.randFloat(0.4, 1.2) * 1000;
        return setTimeout(() => { newPath(); lastTime = performance.now(); rafId = requestAnimationFrame(animate); }, pause);
      }

      path.getPoint(t, tmp);
      head.position.copy(tmp);
      const s = THREE.MathUtils.lerp(0.9, 0.4, t);
      head.scale.setScalar(s);

      // trail: push current, pop oldest
      pts.pop();
      pts.unshift(tmp.clone());
      for (let i = 0; i < pts.length; i++) {
        trailPositions[i * 3] = pts[i].x;
        trailPositions[i * 3 + 1] = pts[i].y;
        trailPositions[i * 3 + 2] = 0;
      }
      trailGeom.attributes.position.needsUpdate = true;
      // fade tail
      trail.material.opacity = THREE.MathUtils.lerp(0.95, 0.1, t);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    function onResize() {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(onResize); ro.observe(wrap);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      wrap.removeChild(renderer.domElement);
      trailGeom.dispose();
      trailMat.dispose();
      glowTex.dispose();
    };
  }, []);

  return <div ref={wrapRef} className="superman-wrap" aria-hidden="true" />;
}