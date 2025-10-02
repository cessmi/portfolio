import { useEffect } from 'react'
import * as THREE from 'three'
import './App.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

function App() {
  useEffect(() => {
   const test = new SceneInit('myThreeJsCanvas');
   test.initialize();
   test.animate();

    const boxGeometry = new THREE.BoxGeometry(16, 16, 16);
    const boxMaterial = new THREE.MeshNormalMaterial();
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(boxMesh);

    test.scene.add(boxMesh);
  }, []);

  return (
    <div>
      <canvas id="myThreeJsCanvas" />
      <header className="App-header">
      </header>
    </div>
  )
}

export default App
