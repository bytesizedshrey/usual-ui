"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { cn } from "@/lib/utils";
import { buildVehicle, disposeVehicle } from "./vehicleModel";

const FOCUS = new THREE.Vector3(0.1, 0.58, 0);
const VIEW_DIR = new THREE.Vector3(0.64, 0.3, 0.71).normalize();

interface VehicleSceneProps {
  paintColor: number;
  charging: boolean;
  sentry: boolean;
  flashToken: number;
}

function VehicleScene({ paintColor, charging, sentry, flashToken }: VehicleSceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastAspect = useRef(0);
  const flash = useRef(0);
  const mountedFlash = useRef(false);
  const t0 = useRef(performance.now());

  const build = useMemo(() => buildVehicle(paintColor), [paintColor]);

  useEffect(() => () => disposeVehicle(build), [build]);

  useEffect(() => {
    if (!mountedFlash.current) {
      mountedFlash.current = true;
      return;
    }
    flash.current = 0.9;
  }, [flashToken]);

  useEffect(() => {
    build.materials.glow.emissiveIntensity = charging ? 0.9 : 0.06;
  }, [charging, build]);

  const reframe = (cam: THREE.PerspectiveCamera) => {
    const vfov = (cam.fov * Math.PI) / 180;
    const r = 2.45;
    const d = Math.max(r / Math.tan(vfov / 2), r / (Math.tan(vfov / 2) * cam.aspect)) * 1.12;
    cam.position.copy(FOCUS).addScaledVector(VIEW_DIR, d);
    if (controlsRef.current) {
      controlsRef.current.target.copy(FOCUS);
      controlsRef.current.update();
    } else {
      cam.lookAt(FOCUS);
    }
  };

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.aspect - lastAspect.current) > 0.001) {
      lastAspect.current = cam.aspect;
      reframe(cam);
    }

    const t = (performance.now() - t0.current) / 1000;
    if (charging) {
      const p = (t * 0.34) % 1;
      const pos = build.cablePath.getPointAt(1 - p);
      build.chargePulse.position.copy(pos);
      build.chargePulse.position.y += 0.03;
      build.materials.glow.emissiveIntensity = 0.75 + Math.sin(t * 3) * 0.25;
    }
    build.chargePulse.visible = charging;

    build.materials.tail.emissiveIntensity = 0.4 + (sentry ? 0.12 + Math.sin(t * 2.2) * 0.12 : 0) + flash.current;
    build.materials.head.emissiveIntensity = 0.4 + flash.current * 1.6;
    if (flash.current > 0) flash.current = Math.max(0, flash.current - 0.045);
  });

  return (
    <>
      <primitive object={build.group} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={3.4}
        maxDistance={16}
        maxPolarAngle={1.5}
        enableDamping
        dampingFactor={0.09}
      />
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

export interface VehicleStageProps {
  className?: string;
  paintColor?: number;
  charging: boolean;
  sentry: boolean;
  flashToken: number;
}

export function VehicleStage({ className, paintColor = 0x121519, charging, sentry, flashToken }: VehicleStageProps) {
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
        camera={{ position: [3, 2.2, 4], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
          const onContextLost = (event: Event) => {
            event.preventDefault();
            setTimeout(() => {
              if (!pausedRef.current) setCanvasKey((k) => k + 1);
            }, 50);
          };
          gl.domElement.addEventListener("webglcontextlost", onContextLost, false);
        }}
      >
        <hemisphereLight args={[0x323a44, 0x060708, 0.75]} />
        <directionalLight color={0xfff2e2} intensity={2.3} position={[3.2, 6.5, 4.2]} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
        <directionalLight color={0xbcd4ff} intensity={1.6} position={[-5.5, 3.2, -4.5]} />
        <directionalLight color={0xffffff} intensity={0.3} position={[1.5, -2.5, 2.5]} />
        <directionalLight color={0xd8e4ff} intensity={1.2} position={[6, 1.8, 6]} />
        <VehicleScene paintColor={paintColor} charging={charging} sentry={sentry} flashToken={flashToken} />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.7} scale={9} blur={2.1} far={2.5} resolution={512} />
        <Environment preset="city" environmentIntensity={0.9} />
      </Canvas>
    </div>
  );
}
