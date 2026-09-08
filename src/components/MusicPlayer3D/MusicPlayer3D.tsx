"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  ContactShadows,
  PresentationControls,
} from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const MODEL_URL = "/models/music-player-3d-enhanced.glb";

useGLTF.preload(MODEL_URL);

// Named button *groups* from the GLB's actual node hierarchy (verified via
// inspection, not guessed) — e.g. "play_button" contains play_cap/play_dome/
// play_bezel/play_glyph. Matching on these group names (and walking up from
// whichever child mesh the ray hit) avoids also matching the static recessed
// "_well" cutout meshes that sit as siblings around each button.
const BUTTON_GROUPS = new Set([
  "play_button",
  "stop_button",
  "record_button",
  "next_button",
  "prev_button",
  "dpc_up",
  "ab_down",
  "back_button",
  "home_button",
  "tmark_button",
  "option_button",
  "search_button",
  "mode_button",
  "star_button",
  "levels_button",
  "info_button",
  "lock_button",
]);

function findButtonGroup(object: THREE.Object3D | null): THREE.Object3D | null {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (BUTTON_GROUPS.has(node.name)) return node;
    node = node.parent;
  }
  return null;
}

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return (object as THREE.Mesh).isMesh === true;
}

type PlayerState = "stopped" | "playing" | "paused";
type RecState = "idle" | "recording";

// Local-space press depth (pre outer-scale). The front panel's own "into the
// device" direction is local -Y (the model's native up axis is the device's
// thin thickness axis; the outer group rotates that to face the camera).
const PRESS_DEPTH = 0.0009;
const SPRING_SPEED = 18;

type PressEntry = { basePos: THREE.Vector3; target: number; progress: number };

function MusicPlayer3DScene() {
  const { scene, nodes } = useGLTF(MODEL_URL);
  const [playerState, setPlayerState] = useState<PlayerState>("stopped");
  const [recState, setRecState] = useState<RecState>("idle");
  const stateRef = useRef({ playerState, recState });
  stateRef.current = { playerState, recState };

  const pressState = useRef(new Map<THREE.Object3D, PressEntry>());
  const hoveredGroup = useRef<THREE.Object3D | null>(null);

  // A handful of generic materials ("key", "recess", "trim", ...) are shared
  // across many button caps. Clone them once per interactive mesh so hover /
  // press feedback on one button never lights up its siblings.
  useEffect(() => {
    scene.traverse((child) => {
      if (!isMesh(child) || !findButtonGroup(child)) return;
      child.material = Array.isArray(child.material)
        ? child.material.map((m) => m.clone())
        : child.material.clone();
    });
  }, [scene]);

  const setGroupEmissive = useCallback((group: THREE.Object3D, intensity: number) => {
    group.traverse((child) => {
      if (!isMesh(child)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (mat?.emissive) {
        mat.emissive.setRGB(1, 1, 1);
        mat.emissiveIntensity = intensity;
      }
    });
  }, []);

  const pressGroup = useCallback((group: THREE.Object3D) => {
    let entry = pressState.current.get(group);
    if (!entry) {
      entry = { basePos: group.position.clone(), target: 0, progress: 0 };
      pressState.current.set(group, entry);
    }
    entry.target = 1;
  }, []);

  const releaseGroup = useCallback((group: THREE.Object3D | null) => {
    if (!group) return;
    const entry = pressState.current.get(group);
    if (entry) entry.target = 0;
  }, []);

  // Ease every pressed/releasing button toward its target depth, pulse the
  // record LED while recording, and brighten the display while playing.
  useFrame((_, delta) => {
    pressState.current.forEach((entry, group) => {
      entry.progress += (entry.target - entry.progress) * Math.min(1, delta * SPRING_SPEED);
      if (entry.target === 0 && entry.progress < 0.001) {
        group.position.copy(entry.basePos);
        pressState.current.delete(group);
        return;
      }
      group.position.set(
        entry.basePos.x,
        entry.basePos.y - entry.progress * PRESS_DEPTH,
        entry.basePos.z,
      );
    });

    const recDot = nodes["record_dot"] as THREE.Mesh | undefined;
    const recMat = recDot?.material as THREE.MeshStandardMaterial | undefined;
    if (recMat?.emissive) {
      const t = performance.now() / 1000;
      recMat.emissive.setRGB(1, 0, 0);
      recMat.emissiveIntensity =
        stateRef.current.recState === "recording" ? 0.6 + Math.sin(t * 5) * 0.4 : 0.2;
    }

    // The model's display is two baked LCD panels (no separate waveform-bar
    // geometry to animate) — brighten them while playing as the lightweight
    // "playback is active" display cue.
    const isPlaying = stateRef.current.playerState === "playing";
    for (const name of ["display_lcd_main", "display_lcd_strip"]) {
      const panel = nodes[name] as THREE.Mesh | undefined;
      const panelMat = panel?.material as THREE.MeshStandardMaterial | undefined;
      if (panelMat && "emissiveIntensity" in panelMat) {
        panelMat.emissiveIntensity = isPlaying ? 1 : 0.55;
      }
    }
  });

  const runAction = useCallback((groupName: string) => {
    if (groupName === "play_button") {
      setPlayerState((s) => (s === "playing" ? "paused" : "playing"));
    } else if (groupName === "stop_button") {
      setPlayerState("stopped");
      setRecState("idle");
    } else if (groupName === "record_button") {
      const wasIdle = stateRef.current.recState === "idle";
      setRecState(wasIdle ? "recording" : "idle");
      if (wasIdle) setPlayerState("playing");
    } else if (groupName === "next_button" || groupName === "prev_button") {
      // No audio engine — briefly flash through "stopped" to signal the
      // track change, mirroring a real transport's track-skip behavior.
      setPlayerState("stopped");
      setTimeout(() => setPlayerState("playing"), 80);
    }
    // dpc_up / ab_down and the utility buttons (back/home/tmark/option/...)
    // have no player state to change — they still get full physical press +
    // hover feedback below.
  }, []);

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const group = findButtonGroup(event.object);
      if (!group) return;
      // Stop here so PresentationControls never starts a drag-rotate from a
      // press that's meant for a hardware control.
      event.stopPropagation();
      pressGroup(group);
      runAction(group.name);
    },
    [pressGroup, runAction],
  );

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const group = findButtonGroup(event.object);
      if (group) event.stopPropagation();
      releaseGroup(group ?? hoveredGroup.current);
    },
    [releaseGroup],
  );

  const handlePointerOver = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const group = findButtonGroup(event.object);
      if (!group) return;
      event.stopPropagation();
      if (hoveredGroup.current && hoveredGroup.current !== group) {
        setGroupEmissive(hoveredGroup.current, 0);
      }
      hoveredGroup.current = group;
      document.body.style.cursor = "pointer";
      setGroupEmissive(group, 0.45);
    },
    [setGroupEmissive],
  );

  const handlePointerOut = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const group = findButtonGroup(event.object);
      if (!group) return;
      if (hoveredGroup.current === group) {
        setGroupEmissive(group, 0);
        hoveredGroup.current = null;
        document.body.style.cursor = "auto";
      }
      releaseGroup(group);
    },
    [releaseGroup, setGroupEmissive],
  );

  // If the pointer is released off the model entirely, relax any button
  // that's still mid-press so nothing ever gets stuck down.
  useEffect(() => {
    const onWindowPointerUp = () => {
      pressState.current.forEach((entry) => { entry.target = 0; });
    };
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => window.removeEventListener("pointerup", onWindowPointerUp);
  }, []);

  return (
    <group rotation={[Math.PI / 2, 0, 0]} scale={23}>
      <primitive
        object={scene}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}

// The Source Code popover's "Example Usage" section renders this same
// component a second time, over top of whichever card/page instance is
// already live (e.g. the homepage card behind the popover, or the docs
// page's own example preview). Two fully textured WebGL contexts loading and
// rendering at once is expensive enough to lose a context on constrained
// GPUs. Only the most-recently-mounted instance needs to actually render —
// older ones are fully unmounted (freeing their GPU memory) and resume the
// moment the newer one goes away.
type InstanceHandle = { setPaused: (paused: boolean) => void };
const liveInstances = new Set<InstanceHandle>();

function registerInstance(handle: InstanceHandle) {
  liveInstances.add(handle);
  handle.setPaused(false);
  // Pause the others on the next tick rather than synchronously — doing it
  // in the same commit as this instance mounting its own Canvas can hand
  // R3F's internal event wiring a DOM node mid-teardown.
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

export interface MusicPlayer3DProps {
  className?: string;
}

export function MusicPlayer3D({ className }: MusicPlayer3DProps) {
  // Some environments (headless/software rendering, GPU resets) fire
  // `webglcontextlost` without ever firing `webglcontextrestored`, leaving
  // the canvas permanently blank. Remounting the Canvas gets a fresh context
  // and recovers instead of leaving the preview dead for the rest of the
  // session.
  const [canvasKey, setCanvasKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // Mounting the Canvas on the very first paint of an animated container
  // (e.g. the Source Code popover's enter transition) can hand R3F's event
  // setup a not-yet-attached DOM node. Waiting one frame avoids that race.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handle: InstanceHandle = { setPaused };
    return registerInstance(handle);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (paused || !ready) {
    return <div className={cn("relative w-full h-full", className)} />;
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* NOTE: No `global` on PresentationControls — global hijacks all window pointer
          events which breaks the Source Code popover button in the parent card. */}
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          const onContextLost = (event: Event) => {
            event.preventDefault();
            // Only force a fresh context while this instance is still the
            // active one — if it was paused (another instance took over) in
            // the meantime, remounting here would race with that unmount.
            setTimeout(() => {
              if (!pausedRef.current) setCanvasKey((k) => k + 1);
            }, 50);
          };
          gl.domElement.addEventListener("webglcontextlost", onContextLost, false);
        }}
      >
        <ambientLight intensity={2.0} />
        <spotLight
          position={[5, 10, 5]}
          angle={0.3}
          penumbra={1}
          intensity={3.0}
          castShadow
        />
        <directionalLight position={[-5, 5, 10]} intensity={2.0} />
        <directionalLight position={[5, -5, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          <PresentationControls
            snap={true}
            rotation={[0.15, -0.15, 0]}
            polar={[-Math.PI / 6, Math.PI / 6]}
            azimuth={[-Math.PI / 6, Math.PI / 6]}
          >
            <MusicPlayer3DScene />
            <ContactShadows
              position={[0, -1.25, 0]}
              opacity={0.6}
              scale={15}
              blur={2.0}
              far={4}
            />
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
