import { useEffect, useRef } from "react";
import * as THREE from "three";

const BLUE = 0x245cff;
const INK = 0x26334a;
const SILVER = 0xd8e0ec;

function createSatellite(index) {
  const node = new THREE.Group();
  const size = index % 3 === 0 ? 0.28 : 0.21;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xf9fbff,
      metalness: 0.22,
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  );
  sphere.castShadow = true;
  sphere.receiveShadow = true;

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(size * 1.42, 0.035, 12, 48),
    new THREE.MeshStandardMaterial({
      color: BLUE,
      emissive: BLUE,
      emissiveIntensity: 1.2,
      metalness: 0.35,
      roughness: 0.2,
    }),
  );
  halo.rotation.x = Math.PI / 2.8;

  const glow = new THREE.PointLight(BLUE, 0.75, 2.2, 2);
  node.add(sphere, halo, glow);
  node.userData = {
    radius: 2.45 + (index % 3) * 0.86,
    phase: (index / 7) * Math.PI * 2 + (index % 2) * 0.35,
    speed: 0.08 + (index % 3) * 0.018,
    lift: (index % 2 === 0 ? 1 : -1) * 0.08,
  };
  return node;
}

export function OrbitScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0.3, 5.4, 9.2);
    camera.lookAt(0, -0.15, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const system = new THREE.Group();
    system.rotation.z = -0.08;
    system.position.y = -0.25;
    scene.add(system);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c6df, 2.7));

    const key = new THREE.DirectionalLight(0xffffff, 4.8);
    key.position.set(-4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const rim = new THREE.PointLight(BLUE, 5.5, 11, 2);
    rim.position.set(2.2, 2.5, 1.6);
    scene.add(rim);

    const core = new THREE.Group();
    const coreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 64, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0xf9fbff,
        metalness: 0.16,
        roughness: 0.12,
        transmission: 0.08,
        thickness: 0.8,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
    );
    coreSphere.castShadow = true;
    coreSphere.receiveShadow = true;

    const coreInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.58, 2),
      new THREE.MeshStandardMaterial({
        color: 0xeaf0ff,
        emissive: BLUE,
        emissiveIntensity: 0.28,
        metalness: 0.35,
        roughness: 0.18,
        wireframe: true,
        transparent: true,
        opacity: 0.48,
      }),
    );

    const equator = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.11, 24, 128),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.55,
        roughness: 0.15,
        clearcoat: 1,
      }),
    );
    equator.rotation.x = Math.PI / 2.55;

    const signalRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.34, 0.028, 12, 128),
      new THREE.MeshStandardMaterial({
        color: BLUE,
        emissive: BLUE,
        emissiveIntensity: 1.8,
        metalness: 0.4,
        roughness: 0.2,
      }),
    );
    signalRing.rotation.x = Math.PI / 2.55;
    signalRing.rotation.y = 0.12;
    core.add(coreSphere, coreInner, equator, signalRing);
    system.add(core);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.42, 1.78, 0.32, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0xf5f7fb,
        metalness: 0.28,
        roughness: 0.2,
        clearcoat: 0.8,
      }),
    );
    base.position.y = -1.28;
    base.receiveShadow = true;
    system.add(base);

    const orbitMaterial = new THREE.MeshStandardMaterial({
      color: SILVER,
      metalness: 0.45,
      roughness: 0.35,
      transparent: true,
      opacity: 0.8,
    });

    [2.45, 3.31, 4.18].forEach((radius, index) => {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(radius, index === 1 ? 0.017 : 0.012, 8, 192),
        orbitMaterial,
      );
      orbit.rotation.x = Math.PI / 2;
      orbit.scale.z = 0.83;
      system.add(orbit);
    });

    const satellites = Array.from({ length: 7 }, (_, index) => createSatellite(index));
    satellites.forEach((satellite) => system.add(satellite));

    const signalGeometry = new THREE.BufferGeometry();
    const signalPositions = [];
    const signalColors = [];
    for (let i = 0; i < 190; i += 1) {
      const radius = 2.35 + (i % 3) * 0.88 + Math.random() * 0.07;
      const angle = Math.random() * Math.PI * 2;
      signalPositions.push(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 0.08,
        Math.sin(angle) * radius * 0.83,
      );
      const color = new THREE.Color(i % 4 === 0 ? BLUE : INK);
      signalColors.push(color.r, color.g, color.b);
    }
    signalGeometry.setAttribute("position", new THREE.Float32BufferAttribute(signalPositions, 3));
    signalGeometry.setAttribute("color", new THREE.Float32BufferAttribute(signalColors, 3));
    const signals = new THREE.Points(
      signalGeometry,
      new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        sizeAttenuation: true,
      }),
    );
    system.add(signals);

    const pointer = { x: 0, y: 0 };
    const targetPointer = { x: 0, y: 0 };
    let scrollProgress = 0;

    const handlePointer = (event) => {
      targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      targetPointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.25);
    };

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      system.scale.setScalar(width < 640 ? 0.72 : width < 1000 ? 0.86 : 1);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    resize();
    handleScroll();

    let frame;
    let startTime;

    const render = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      pointer.x += (targetPointer.x - pointer.x) * 0.035;
      pointer.y += (targetPointer.y - pointer.y) * 0.035;

      if (!reducedMotion) {
        system.rotation.y = elapsed * 0.025 + pointer.x * 0.09;
        system.rotation.x = -0.04 + pointer.y * 0.055 + scrollProgress * 0.08;
        system.position.y = -0.25 - scrollProgress * 0.35;
        core.rotation.y = elapsed * 0.12;
        coreInner.rotation.x = elapsed * 0.18;
        coreInner.rotation.y = -elapsed * 0.22;
        signalRing.rotation.z = elapsed * 0.34;
        signals.rotation.y = -elapsed * 0.018;

        satellites.forEach((satellite) => {
          const { radius, phase, speed, lift } = satellite.userData;
          const angle = phase + elapsed * speed * Math.PI * 2;
          satellite.position.set(
            Math.cos(angle) * radius,
            lift + Math.sin(angle * 2) * 0.025,
            Math.sin(angle) * radius * 0.83,
          );
          satellite.rotation.y = -angle;
        });
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("scroll", handleScroll);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="orbit-scene" ref={mountRef} aria-hidden="true">
      <span className="orbit-core-mark">B/D</span>
      <span className="orbit-label orbit-label--one">PROMPT EVOLUTION</span>
      <span className="orbit-label orbit-label--two">RAG / VECTOR DB</span>
      <span className="orbit-label orbit-label--three">ORCHESTRATOR</span>
      <span className="orbit-label orbit-label--four">OBSERVABILITY</span>
    </div>
  );
}
