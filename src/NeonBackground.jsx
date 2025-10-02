import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * NeonBackground
 * Lightweight Three.js retro horizon grid + parallax camera.
 * Renders to a transparent canvas absolutely positioned behind HUD content.
 */
export default function NeonBackground({ akira = false, zoom = 0 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const target = useRef({ rotX: 0, rotY: 0, posX: 0 });
  const zoomRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene / Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x05060a, 20, 80);

    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(0, 3.2, 8);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0); // transparent to show CSS bg

    // Palette: blue/cyan by default, magenta/pink for AKIRA mode
    const palette = akira
      ? {
          grid: 0xff2bd6, // pink grid
          glow: 0xff2bd6, // magenta glow
          mountains: [0xff64e8, 0xff9bf0, 0xffc4ff], // pinkish layers
        }
      : {
          grid: 0x00d7ff, // cyan grid
          glow: 0x00d7ff, // cyan glow
          mountains: [0x7aa9ff, 0x9cc2ff, 0xc7daff], // blue layers
        };

    // Grid (XZ plane)
    const gridSize = 200;
    const divisions = 200;
    const grid = new THREE.GridHelper(gridSize, divisions, palette.grid, palette.grid);
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    grid.position.y = -2.4;
    scene.add(grid);

    // Horizon glow (a subtle plane with emissive-like color)
    const glowGeo = new THREE.PlaneGeometry(200, 80);
    const glowMat = new THREE.MeshBasicMaterial({ color: palette.glow, transparent: true, opacity: 0.18 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 1, -40);
    scene.add(glow);

    // --- Wireframe mountains -------------------------------------------
    const mountains = new THREE.Group();
    scene.add(mountains);

    function makeMount({ z = -22, amp = 2.8, color = 0x9d7cff, seed = 0 }) {
      const geo = new THREE.PlaneGeometry(80, 16, 160, 32);
      // displace vertices to make peaks
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const nx = (x + 40 + seed) * 0.15;
        const ny = (y + 8 + seed) * 0.22;
        const h = Math.sin(nx) * Math.cos(ny * 1.3) + Math.sin(nx * 0.35 + ny * 0.6) * 0.6;
        pos.setZ(i, (h * amp));
      }
      pos.needsUpdate = true;
      geo.rotateX(-Math.PI / 2); // stand it up
      geo.translate(0, 0.1, z);

      const wire = new THREE.WireframeGeometry(geo);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 });
      mat.depthWrite = false; // let the logo and HUD pop above
      mat.blending = THREE.AdditiveBlending; // neon additive style but lighter
      const mesh = new THREE.LineSegments(wire, mat);
      // keep a copy of base vertex positions for wavy animation
      mesh.userData.basePositions = wire.attributes.position.array.slice();
      mountains.add(mesh);
    }

    makeMount({ z: -24, amp: 3.2, color: palette.mountains[0], seed: 3 });
    makeMount({ z: -28, amp: 3.8, color: palette.mountains[1], seed: 11 });
    makeMount({ z: -34, amp: 4.2, color: palette.mountains[2], seed: 20 });

    // --- Black hole (event horizon + accretion ring) -------------------
    const bhGroup = new THREE.Group();
    scene.add(bhGroup);

    // dark event horizon disc
    const holeGeo = new THREE.CircleGeometry(5.2, 96);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.95 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(0, 1.2, -35);
    bhGroup.add(hole);

    // accretion ring (tilted torus)
    const ringGeo = new THREE.TorusGeometry(6.4, 0.35, 16, 160);
    const ringMat = new THREE.MeshBasicMaterial({ color: palette.glow, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.6; // tilt toward camera
    ring.position.set(0, 1.2, -35);
    bhGroup.add(ring);

    // soft halo sprite (additive)
    const glowTex = new THREE.TextureLoader().load(
      'data:image/svg+xml;utf8,' + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
           <defs>
             <radialGradient id='g' cx='50%' cy='50%'>
               <stop offset='0%' stop-color='white' stop-opacity='1'/>
               <stop offset='100%' stop-color='white' stop-opacity='0'/>
             </radialGradient>
           </defs>
           <circle cx='128' cy='128' r='128' fill='url(#g)'/>
         </svg>`
      )
    );
    const haloSpriteMat = new THREE.SpriteMaterial({ map: glowTex, color: palette.glow, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending });
    const haloSprite = new THREE.Sprite(haloSpriteMat);
    haloSprite.scale.set(20, 20, 1);
    haloSprite.position.set(0, 1.2, -35.5);
    bhGroup.add(haloSprite);

    // orbiting particle sparks around ring
    const pointsGroup = new THREE.Group();
    pointsGroup.position.set(0, 1.2, -35);
    pointsGroup.rotation.x = Math.PI / 2.6;
    const pCount = 320;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 6.3 + Math.random() * 0.9; // around torus radius
      pPos[i * 3 + 0] = Math.cos(a) * r;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 0.15; // tiny vertical jitter
      pPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pointsMat = new THREE.PointsMaterial({ color: palette.glow, size: 0.06, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(pointsGeo, pointsMat);
    pointsGroup.add(points);
    bhGroup.add(pointsGroup);

    // Parallax on pointer (no click required)
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width; // 0..1
      const ny = (e.clientY - rect.top) / rect.height; // 0..1
      const cx = Math.min(1, Math.max(0, nx));
      const cy = Math.min(1, Math.max(0, ny));
      // target rotations (in radians) + slight lateral position shift
      target.current.rotY = (cx - 0.5) * THREE.MathUtils.degToRad(8);   // yaw
      target.current.rotX = (0.5 - cy) * THREE.MathUtils.degToRad(6);   // pitch
      target.current.posX = (cx - 0.5) * 0.8;                           // slide
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Animate
    let t = 0;
    const animate = () => {
      t += 0.003;

      // --- Zoom-driven dolly toward the black hole (0..1) ---
      const zprog = zoomRef.current;
      const ease = zprog * zprog * (3 - 2 * zprog); // smoothstep

      const baseZ = 8 + Math.sin(t) * 0.3;          // original idle drift
      camera.position.z = THREE.MathUtils.lerp(baseZ, 4.2, ease);
      camera.position.y = THREE.MathUtils.lerp(3.2, 1.2, ease);
      // subtle FOV zoom for cinematic punch-in
      camera.fov = THREE.MathUtils.lerp(60, 52, ease);
      camera.updateProjectionMatrix();
      camera.lookAt(0, 1.2, -35);

      // fade the grid & mountains slightly as we approach; strengthen halo
      if (grid.material && 'opacity' in grid.material) {
        grid.material.opacity = THREE.MathUtils.lerp(0.35, 0.12, ease);
      }
      mountains.traverse((obj) => {
        if (obj.material && 'opacity' in obj.material) {
          obj.material.opacity = THREE.MathUtils.lerp(0.18, 0.08, ease);
        }
      });
      if (haloSprite && haloSprite.material) {
        haloSprite.material.opacity = THREE.MathUtils.lerp(0.18, 0.35, ease);
        const s = THREE.MathUtils.lerp(20, 24, ease);
        haloSprite.scale.set(s, s, 1);
      }

      // slow camera drift forward/back for life
      // camera.position.z = 8 + Math.sin(t) * 0.3;

      // ease toward mouse-driven targets (inertia/flow)
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, target.current.rotY, 0.08);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, target.current.rotX, 0.08);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.posX, 0.06);

      // subtle background motion for "flow"
      grid.position.z = - (t * 5.0) % 2; // slightly slower drift for chill vibe
      glow.position.y = Math.sin(t * 0.8) * 0.2;  // gentle breathing of horizon glow

      // black hole: ring spin, particle orbit shimmer, subtle halo flicker
      ring.rotation.z += 0.0025;
      pointsGroup.rotation.z -= 0.0032;
      const flicker = 0.9 + Math.sin(t * 2.1) * 0.08 + Math.sin(t * 3.3) * 0.05;
      ring.material.opacity = 0.7 * flicker;
      haloSprite.material.opacity = 0.18 * flicker;

      // parallax drift (slow forward motion) + gentle vertical sway
      mountains.position.z = (t * 1.2) % 6;  // scrolls toward the camera very slowly
      mountains.position.y = Math.sin(t * 0.6) * 0.08;
      mountains.rotation.z = Math.sin(t * 0.2) * 0.02; // tiny lateral undulation

      // wavy ripple across wireframe vertices (cheap CPU wave)
      mountains.traverse((obj) => {
        if (obj.isLineSegments && obj.geometry?.attributes?.position) {
          const pos = obj.geometry.attributes.position;
          const base = obj.userData.basePositions;
          if (!base) return;
          const arr = pos.array;
          for (let i = 0; i < arr.length; i += 3) {
            const x = base[i];
            const y = base[i + 1];
            const z = base[i + 2];
            const wave = Math.sin(t * 2.0 + x * 0.12 + z * 0.08) * 0.12; // adjust amplitude
            arr[i]     = x;            // keep original x
            arr[i + 1] = y + wave;     // displace along local Y for a ripple
            arr[i + 2] = z;            // keep original z
          }
          pos.needsUpdate = true;
        }
      });

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      // dispose black hole assets
      ringGeo.dispose();
      ringMat.dispose();
      holeGeo.dispose();
      holeMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      glowTex.dispose();
      haloSprite.material.dispose();
      // dispose mountains wires
      mountains.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      renderer.dispose();
      glowGeo.dispose();
      glowMat.dispose();
    };
  }, []);

  useEffect(() => {
    const v = Number(zoom) || 0;
    zoomRef.current = Math.max(0, Math.min(1, v));
  }, [zoom]);

  return <canvas ref={canvasRef} className="bg3d-canvas" />;
}