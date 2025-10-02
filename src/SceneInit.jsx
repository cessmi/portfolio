import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default class SceneInit {
  constructor(canvasId, fov = 60) {
    this.canvasId = canvasId;
    this.fov = fov;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.stats = null;
    this.clock = null;

    // demo mesh
    this._cube = null;
  }

  initialize() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      console.error(`[SceneInit] Canvas with id "${this.canvasId}" not found.`);
      return false;
    }

    // Scene & camera
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    const aspect = canvas.clientWidth / canvas.clientHeight || window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspect, 0.1, 1000);
    this.camera.position.set(3, 2, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setClearColor('#05060a', 1);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Stats
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    const spot = new THREE.SpotLight(0xffffff, 1.0);
    spot.position.set(5, 8, 5);
    this.scene.add(spot);

    // Demo cube so something is visible
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshNormalMaterial();
    this._cube = new THREE.Mesh(geo, mat);
    this.scene.add(this._cube);

    // Resize handling
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Start loop
    this.animate();
    return true;
  }

  onWindowResize() {
    const canvas = this.renderer?.domElement;
    if (!canvas) return;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    const delta = this.clock.getDelta();

    // demo rotation
    if (this._cube) {
      this._cube.rotation.x += 0.8 * delta;
      this._cube.rotation.y += 0.6 * delta;
    }

    this.controls.update();
    this.stats.begin();
    this.render();
    this.stats.end();

    requestAnimationFrame(this.animate.bind(this));
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
