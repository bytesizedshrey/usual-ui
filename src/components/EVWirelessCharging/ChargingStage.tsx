"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { buildCar, disposeCar } from "./evChargingModel";

/** Procedural studio environment: a dark gradient with two soft overhead
 * strip lights baked in — this is what gives the paint its long, believable
 * highlights instead of a flat, un-lit look. */
function studioEnvTexture() {
  const w = 512;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#20303c");
  g.addColorStop(0.34, "#4c6472");
  g.addColorStop(0.5, "#0e1519");
  g.addColorStop(1, "#04070a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  ([[0.16, 0.1, 190, 34], [0.62, 0.12, 150, 26], [0.88, 0.2, 90, 18]] as const).forEach(([x, y, bw, bh]) => {
    const rg = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, bw);
    rg.addColorStop(0, "rgba(255,255,255,0.95)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.save();
    ctx.translate(x * w, y * h);
    ctx.scale(1, bh / bw);
    ctx.translate(-x * w, -y * h);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  });
  const fg = ctx.createRadialGradient(w * 0.5, h * 0.94, 0, w * 0.5, h * 0.94, 200);
  fg.addColorStop(0, "rgba(39,245,154,0.4)");
  fg.addColorStop(1, "rgba(39,245,154,0)");
  ctx.fillStyle = fg;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

function floorTexture() {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#05080b";
  ctx.fillRect(0, 0, s, s);
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.38);
  g.addColorStop(0, "rgba(46,255,168,0.5)");
  g.addColorStop(0.3, "rgba(30,214,166,0.18)");
  g.addColorStop(0.6, "rgba(20,120,120,0.05)");
  g.addColorStop(1, "rgba(5,8,11,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "rgba(150,220,225,0.16)";
  [0.3, 0.38, 0.455].forEach((r, i) => {
    ctx.lineWidth = i === 2 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s * r, 0, Math.PI * 2);
    ctx.stroke();
  });
  return new THREE.CanvasTexture(c);
}

const FOCUS = new THREE.Vector3(0, 0.98, 0);

interface ChargingSceneProps {
  paintColor: number;
  charging: boolean;
}

// Fraction of the frame the vehicle should fill — it is the hero, not a
// detail sitting inside a UI widget. Width is the binding constraint for a
// low, long car in a landscape frame; height gets extra headroom for the
// title/range text above and the status/button below.
const TARGET_WIDTH_FILL = 0.78;
const TARGET_HEIGHT_FILL = 0.7;

function ChargingScene({ paintColor, charging }: ChargingSceneProps) {
  const { camera, scene, gl } = useThree();
  const chargeLightRef = useRef<THREE.PointLight>(null);
  const chargeWideRef = useRef<THREE.PointLight>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const energy = useRef(charging ? 1 : 0);
  const t0 = useRef(performance.now());
  const camDistance = useRef(0);

  const build = useMemo(() => buildCar(paintColor), [paintColor]);
  useEffect(() => () => disposeCar(build), [build]);
  useEffect(() => {
    build.group.rotation.y = -0.17;
  }, [build]);

  // Half-extents of the actual built geometry, measured relative to FOCUS —
  // driving the camera off the real bounds (not a guessed constant) so the
  // framing stays correct if the body proportions change.
  const halfExtent = useMemo(() => {
    const box = new THREE.Box3().setFromObject(build.group);
    return {
      x: Math.max(box.max.x - FOCUS.x, FOCUS.x - box.min.x),
      y: Math.max(box.max.y - FOCUS.y, FOCUS.y - box.min.y),
    };
  }, [build]);

  const envTex = useMemo(() => studioEnvTexture(), []);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const rt = pmrem.fromEquirectangular(envTex);
    scene.environment = rt.texture;
    return () => {
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, envTex]);
  useEffect(() => () => envTex.dispose(), [envTex]);

  const floorTex = useMemo(() => floorTexture(), []);
  useEffect(() => () => floorTex.dispose(), [floorTex]);

  const viewDir = useMemo(() => new THREE.Vector3(0.12, 0.15, 1).normalize(), []);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const vfov = (cam.fov * Math.PI) / 180;
    const verticalFit = halfExtent.y / TARGET_HEIGHT_FILL / Math.tan(vfov / 2);
    const horizontalFit = halfExtent.x / TARGET_WIDTH_FILL / (Math.tan(vfov / 2) * cam.aspect);
    camDistance.current = Math.max(verticalFit, horizontalFit);

    const t = (performance.now() - t0.current) / 1000;
    const sway = new THREE.Vector3(Math.sin(t * 0.18) * 0.05, Math.sin(t * 0.23) * 0.035, 0);
    cam.position.copy(FOCUS).addScaledVector(viewDir, camDistance.current).add(sway);
    cam.lookAt(FOCUS);
    energy.current += ((charging ? 1 : 0) - energy.current) * 0.06;

    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      const p = (t * 0.28 + i * 0.25) % 1;
      const scale = 0.5 + p * 0.95;
      ring.scale.set(scale, scale, scale * 0.4);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.16 * (1 - p) * (1 - p) * energy.current;
      ring.position.y = 0.02 + p * 0.1;
    });

    if (chargeLightRef.current) chargeLightRef.current.intensity = (5.5 + Math.sin(t * 1.7) * 1.1) * (0.12 + energy.current * 0.88);
    if (chargeWideRef.current) chargeWideRef.current.intensity = 2.2 * (0.15 + energy.current * 0.85);
    build.materials.emerald.emissiveIntensity = 0.6 * energy.current;
    if (floorRef.current) {
      const mat = floorRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (0.3 + Math.sin(t * 1.7) * 0.045) * (0.2 + energy.current * 0.8);
    }

    build.group.position.y = Math.sin(t * 0.5) * 0.004;
  });

  return (
    <>
      <primitive object={build.group} />

      <pointLight ref={chargeLightRef} color={0x2bf59c} intensity={5.5} distance={5.5} decay={2.1} position={[0, 0.12, 0]} />
      <pointLight ref={chargeWideRef} color={0x1fd7c8} intensity={2.2} distance={7.5} decay={2.3} position={[-0.4, 0.05, 1.2]} />

      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.6, 96]} />
        <meshStandardMaterial
          color={0x0a0e12}
          roughness={0.62}
          metalness={0.12}
          map={floorTex}
          emissive={0xffffff}
          emissiveMap={floorTex}
          emissiveIntensity={0.5}
          envMapIntensity={0.5}
          transparent
        />
      </mesh>

      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) ringsRef.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <torusGeometry args={[1.55 + i * 0.5, 0.011, 8, 140]} />
          <meshBasicMaterial color={0x4dffb8} transparent opacity={0.34} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

type InstanceHandle = { setPaused: (paused: boolean) => void };
const liveInstances = new Set<InstanceHandle>();

function registerInstance(handle: InstanceHandle) {
  liveInstances.add(handle);
  handle.setPaused(false);
  const othersToPause = Array.from(liveInstances).filter((h) => h !== handle);
  const timeout = setTimeout(() => {
    othersToPause.forEach((other) => other.setPaused(true));
  }, 0);
  return () => {
    clearTimeout(timeout);
    liveInstances.delete(handle);
    const remaining = Array.from(liveInstances);
    remaining[remaining.length - 1]?.setPaused(false);
  };
}

export interface ChargingStageProps {
  className?: string;
  paintColor?: number;
  charging: boolean;
}

export function ChargingStage({ className, paintColor = 0x3b444c, charging }: ChargingStageProps) {
  const [canvasKey, setCanvasKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handle: InstanceHandle = { setPaused };
    return registerInstance(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (paused || !ready) {
    return <div className={cn("relative h-full w-full", className)} />;
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Canvas
        key={canvasKey}
        shadows
        camera={{ position: [1.5, 1.85, 12.8], fov: 24, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.32;
          const onContextLost = (event: Event) => {
            event.preventDefault();
            setTimeout(() => {
              if (!pausedRef.current) setCanvasKey((k) => k + 1);
            }, 50);
          };
          gl.domElement.addEventListener("webglcontextlost", onContextLost, false);
        }}
      >
        <hemisphereLight args={[0x7d9cae, 0x1a2b26, 1.15]} />
        <directionalLight color={0xdff0ff} intensity={2.7} position={[5.5, 8.5, 5.2]} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0009} />
        <directionalLight color={0x8fd6ff} intensity={0.5} position={[-7, 3.5, 4]} />
        <spotLight color={0xa9f5ff} intensity={8} distance={14} angle={0.9} penumbra={0.8} decay={1.4} position={[-4.5, 3.2, -5]} />
        <ChargingScene paintColor={paintColor} charging={charging} />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.75} scale={7} blur={2} far={2.2} resolution={512} />
      </Canvas>
    </div>
  );
}
