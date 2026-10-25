import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Layers,
  Palette,
  Maximize2,
  Minimize2,
  RotateCw,
  Eye,
  Heart,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ThreeSceneProps {
  activeVitalFocus?: 'heart' | 'sugar' | 'general';
}

export type MaterialFinish = 'titanium' | 'rosegold' | 'bioglass' | 'emerald';

export const ThreeScene: React.FC<ThreeSceneProps> = ({ activeVitalFocus = 'general' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Floating dock states
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [explodedVal, setExplodedVal] = useState(0); // 0 (assembled) to 1 (exploded)
  const [finish, setFinish] = useState<MaterialFinish>('titanium');
  const [organMode, setOrganMode] = useState<'heart' | 'sugar' | 'general'>(activeVitalFocus);
  const [isRotating, setIsRotating] = useState(true);

  // Mutable refs for Three.js render loop
  const stateRef = useRef({
    exploded: 0,
    finish: 'titanium' as MaterialFinish,
    organMode: 'general' as 'heart' | 'sugar' | 'general',
    rotating: true,
  });

  stateRef.current = {
    exploded: explodedVal,
    finish,
    organMode,
    rotating: isRotating,
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // 1. Software WebGL Guard (per skill)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer & Pipeline
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.5);

    // 4. RoomEnvironment reflection setup
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting: Warm Key + Cool Fill
    const warmKeyLight = new THREE.DirectionalLight(0xfff6ea, 2.4);
    warmKeyLight.position.set(4, 7, 5);
    warmKeyLight.castShadow = !isSoftwareGl;
    if (warmKeyLight.shadow) {
      warmKeyLight.shadow.mapSize.width = 1024;
      warmKeyLight.shadow.mapSize.height = 1024;
      warmKeyLight.shadow.camera.near = 0.5;
      warmKeyLight.shadow.camera.far = 20;
      warmKeyLight.shadow.camera.left = -3;
      warmKeyLight.shadow.camera.right = 3;
      warmKeyLight.shadow.camera.top = 3;
      warmKeyLight.shadow.camera.bottom = -3;
      warmKeyLight.shadow.bias = -0.0005;
    }
    scene.add(warmKeyLight);

    const coolFillLight = new THREE.HemisphereLight(0xe8eeff, 0x1f2438, 1.2);
    scene.add(coolFillLight);

    const rimLight = new THREE.DirectionalLight(0x9d90ff, 1.5);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // 6. Contact Shadow Disc beneath model
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    // Procedural radial alpha canvas texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.55)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.22)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.05;
    scene.add(shadowMesh);

    // 7. Composite 3-12 Part Procedural Model: Smart Medical Precision Capsule (`THREE.Group`)
    const heroGroup = new THREE.Group();
    heroGroup.position.set(0, 0, 0);
    scene.add(heroGroup);

    // Material library
    const getMaterials = (fin: MaterialFinish) => {
      let metalColor = 0xc7d0db;
      let accentColor = 0x6558d3;
      let roughness = 0.2;
      let metalness = 0.95;

      if (fin === 'rosegold') {
        metalColor = 0xe0a090;
        accentColor = 0xd97736;
        roughness = 0.18;
      } else if (fin === 'bioglass') {
        metalColor = 0xe2e8f0;
        accentColor = 0x35b98d;
        roughness = 0.1;
      } else if (fin === 'emerald') {
        metalColor = 0x228b6d;
        accentColor = 0x34d399;
        roughness = 0.25;
      }

      const bodyMetalMat = new THREE.MeshStandardMaterial({
        color: metalColor,
        metalness,
        roughness,
      });

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.08,
        transmission: isSoftwareGl ? 0 : 0.9,
        transparent: true,
        opacity: isSoftwareGl ? 0.45 : 1,
        ior: 1.5,
        thickness: 0.6,
      });

      const goldSealMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15,
      });

      const glowingCoreMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 1.2,
        roughness: 0.3,
        metalness: 0.2,
      });

      const beadsMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.4,
        roughness: 0.15,
      });

      return { bodyMetalMat, glassMat, goldSealMat, glowingCoreMat, beadsMat };
    };

    let currentMaterials = getMaterials('titanium');

    // Part 1: Lower Threaded Metal Base (Primary Silhouette)
    const baseGeo = new THREE.CylinderGeometry(0.55, 0.52, 0.8, 36);
    const baseMesh = new THREE.Mesh(baseGeo, currentMaterials.bodyMetalMat);
    baseMesh.position.y = -0.5;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    heroGroup.add(baseMesh);

    // Part 2: Calibration Dial Ring (Secondary Read)
    const dialRingGeo = new THREE.TorusGeometry(0.57, 0.045, 16, 48);
    const dialRingMesh = new THREE.Mesh(dialRingGeo, currentMaterials.goldSealMat);
    dialRingMesh.rotation.x = Math.PI / 2;
    dialRingMesh.position.y = -0.1;
    heroGroup.add(dialRingMesh);

    // Part 3: Middle Precision Dosage Ring with notches
    const notchGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.2, 32);
    const notchMesh = new THREE.Mesh(notchGeo, currentMaterials.bodyMetalMat);
    notchMesh.position.y = 0.05;
    heroGroup.add(notchMesh);

    // Part 4: Inner Active Sensor Core (Holographic / Bio-glow)
    const coreGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.9, 24);
    const coreMesh = new THREE.Mesh(coreGeo, currentMaterials.glowingCoreMat);
    coreMesh.position.y = 0.35;
    heroGroup.add(coreMesh);

    // Part 5: Active Micro-bead spheres inside the dosage chamber (Instanced Mesh)
    const beadGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const beadCount = 14;
    const beadsInstanced = new THREE.InstancedMesh(beadGeo, currentMaterials.beadsMat, beadCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < beadCount; i++) {
      const angle = (i / beadCount) * Math.PI * 2;
      const r = 0.18 + (i % 3) * 0.05;
      const y = 0.2 + (i % 4) * 0.15;
      dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      dummy.scale.setScalar(0.85 + (i % 2) * 0.3);
      dummy.updateMatrix();
      beadsInstanced.setMatrixAt(i, dummy.matrix);
    }
    beadsInstanced.instanceMatrix.needsUpdate = true;
    heroGroup.add(beadsInstanced);

    // Part 6: Translucent Bio-Glass Upper Capsule Dome (Secondary Read)
    const domeGeo = new THREE.CapsuleGeometry(0.55, 0.5, 24, 32);
    const domeMesh = new THREE.Mesh(domeGeo, currentMaterials.glassMat);
    domeMesh.position.y = 0.6;
    domeMesh.renderOrder = 2; // Glass rendered after internal core
    heroGroup.add(domeMesh);

    // Part 7: Crown Top Cap Accent (Accent Detail)
    const crownGeo = new THREE.TorusGeometry(0.25, 0.035, 16, 32);
    const crownMesh = new THREE.Mesh(crownGeo, currentMaterials.goldSealMat);
    crownMesh.rotation.x = Math.PI / 2;
    crownMesh.position.y = 1.15;
    heroGroup.add(crownMesh);

    // Part 8: Heart / Vitals Pulse Ring (Animated concentric ring)
    const pulseRingGeo = new THREE.RingGeometry(0.9, 0.96, 48);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x6558d3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const pulseRingMesh = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRingMesh.rotation.x = -Math.PI / 2;
    pulseRingMesh.position.y = -0.95;
    scene.add(pulseRingMesh);

    // 8. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Do not go under the ground plane

    // Pre-allocated scratch vectors for 60fps loop (Zero-GC discipline)
    const clock = new THREE.Clock();
    let frameId = 0;
    let currentExplodeY = 0;
    let prevFinish = 'titanium';

    // Loop
    function tick() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const { exploded, finish: activeFinish, organMode: activeOrgan, rotating } = stateRef.current;

      // Update materials if finish changed
      if (activeFinish !== prevFinish) {
        prevFinish = activeFinish;
        const newMats = getMaterials(activeFinish);
        baseMesh.material = newMats.bodyMetalMat;
        notchMesh.material = newMats.bodyMetalMat;
        domeMesh.material = newMats.glassMat;
        coreMesh.material = newMats.glowingCoreMat;
        beadsInstanced.material = newMats.beadsMat;
        dialRingMesh.material = newMats.goldSealMat;
        crownMesh.material = newMats.goldSealMat;

        if (activeFinish === 'rosegold') {
          pulseRingMat.color.setHex(0xe18a4d);
        } else if (activeFinish === 'emerald') {
          pulseRingMat.color.setHex(0x35b98d);
        } else {
          pulseRingMat.color.setHex(0x6558d3);
        }
      }

      // Smooth exponential damping for exploded view separation
      currentExplodeY = THREE.MathUtils.damp(currentExplodeY, exploded, 8, delta);

      // Part offsets based on exploded value
      baseMesh.position.y = -0.5 - currentExplodeY * 0.6;
      dialRingMesh.position.y = -0.1 - currentExplodeY * 0.25;
      notchMesh.position.y = 0.05;
      coreMesh.position.y = 0.35 + currentExplodeY * 0.2;
      beadsInstanced.position.y = currentExplodeY * 0.35;
      domeMesh.position.y = 0.6 + currentExplodeY * 0.9;
      crownMesh.position.y = 1.15 + currentExplodeY * 1.35;

      // Gentle rotation when enabled
      if (rotating) {
        heroGroup.rotation.y += delta * 0.55;
      }

      // Vitals Pulse Animation based on mode
      const pulseSpeed = activeOrgan === 'heart' ? 3.5 : activeOrgan === 'sugar' ? 2.0 : 1.4;
      const pulseScale = 1.0 + Math.sin(elapsed * pulseSpeed) * 0.12;
      pulseRingMesh.scale.set(pulseScale, pulseScale, pulseScale);
      pulseRingMat.opacity = 0.35 + (1 - (pulseScale - 0.88) / 0.24) * 0.35;

      // Subtle heartbeat bounce on inner core
      const corePulse = 1.0 + Math.sin(elapsed * pulseSpeed * 1.5) * 0.05;
      coreMesh.scale.set(corePulse, 1.0, corePulse);

      controls.update();
      renderer.render(scene, camera);

      frameId = requestAnimationFrame(tick);
    }

    tick();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 500;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      // Dispose geometries & materials
      baseGeo.dispose();
      domeGeo.dispose();
      dialRingGeo.dispose();
      notchGeo.dispose();
      coreGeo.dispose();
      beadGeo.dispose();
      crownGeo.dispose();
      pulseRingGeo.dispose();
      shadowGeo.dispose();
      shadowTex.dispose();
      shadowMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#18233a] via-[#10192b] to-[#0b101c] border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge Overlay */}
      <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-indigo-300">
              Interactive 3D Visualizer
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Smart Capsule & Vitals Telemetry Lab
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isRotating
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">{isRotating ? 'Rotating' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Viewport-First Bottom Control Dock (<= 15% footprint per skill) */}
      <div className="relative z-10 p-4 w-full flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl p-3 sm:p-4 text-white text-xs transition-all duration-300">
          {/* Dock Header & Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-300 text-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>3D Precision Controls</span>
            </div>

            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>{isDockCollapsed ? 'Expand Controls' : 'Hide Controls'}</span>
              {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!isDockCollapsed && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Row 1: Exploded View Separation Slider */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  Exploded Assembly: {Math.round(explodedVal * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedVal}
                  onChange={(e) => setExplodedVal(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Row 2: Finishes & Organ Highlight modes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Finishes */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Finish:</span>
                  {(['titanium', 'rosegold', 'bioglass', 'emerald'] as MaterialFinish[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFinish(f)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                        finish === f
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Vitals Telemetry Resonance */}
                <div className="flex items-center gap-1.5 justify-start sm:justify-end">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resonance:</span>
                  {[
                    { id: 'heart', label: 'Cardio' },
                    { id: 'sugar', label: 'Metabolic' },
                    { id: 'general', label: 'General' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setOrganMode(m.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        organMode === m.id
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
