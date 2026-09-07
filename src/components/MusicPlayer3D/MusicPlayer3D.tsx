"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  ContactShadows,
  PresentationControls,
} from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

useGLTF.preload("/models/music-player-3d-enhanced.glb");

// Mesh names that are interactive hardware controls
const BUTTON_PREFIXES = [
  "play", "stop", "record", "next", "prev",
  "dpc", "ab_", "back", "home", "tmark", "option", "mode", "star",
  "levels", "info", "lock",
];

function isButtonMesh(name: string) {
  return BUTTON_PREFIXES.some((p) => name.startsWith(p));
}

type PlayerState = "stopped" | "playing" | "paused";
type RecState = "idle" | "recording";

function MusicPlayer3DScene() {
  const { scene, nodes } = useGLTF("/models/music-player-3d-enhanced.glb");
  const [playerState, setPlayerState] = useState<PlayerState>("stopped");
  const [recState, setRecState] = useState<RecState>("idle");
  const stateRef = useRef({ playerState, recState });
  stateRef.current = { playerState, recState };

  // Animate waveform bars when playing, pulse record dot when recording
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const isPlaying = stateRef.current.playerState === "playing";
    const isRecording = stateRef.current.recState === "recording";

    for (let i = 0; i < 68; i++) {
      const bar = nodes[`wave_bar_${i}`] as THREE.Mesh | undefined;
      if (bar?.material) {
        const mat = bar.material as THREE.MeshStandardMaterial;
        if (!mat.emissive) return;
        if (isPlaying) {
          const amp = 0.12 + Math.sin(t * 9 + i * 0.37) * 0.08;
          mat.emissive.setRGB(0, amp * 0.6, 0);
          mat.emissiveIntensity = 0.8;
        } else {
          mat.emissiveIntensity = 0;
        }
      }
    }

    const recDot = nodes["record_dot"] as THREE.Mesh | undefined;
    if (recDot?.material) {
      const mat = recDot.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        mat.emissive.setRGB(0.9, 0, 0);
        mat.emissiveIntensity = isRecording
          ? 0.6 + Math.sin(t * 5) * 0.4
          : 0.25;
      }
    }
  });

  const handleClick = useCallback(
    (e: THREE.Intersection & { stopPropagation: () => void; object: THREE.Object3D }) => {
      e.stopPropagation();
      const name = e.object.name;
      if (!name) return;

      if (name.startsWith("play")) {
        setPlayerState((s) => (s === "playing" ? "paused" : "playing"));
      } else if (name.startsWith("stop")) {
        setPlayerState("stopped");
        setRecState("idle");
      } else if (name.startsWith("record")) {
        setRecState((s) => (s === "recording" ? "idle" : "recording"));
        if (stateRef.current.recState === "idle") setPlayerState("playing");
      } else if (name.startsWith("next")) {
        // next track — no audio engine, just reset to stopped to signal state change
        setPlayerState("stopped");
        setTimeout(() => setPlayerState("playing"), 80);
      } else if (name.startsWith("prev")) {
        setPlayerState("stopped");
        setTimeout(() => setPlayerState("playing"), 80);
      }
    },
    [],
  );

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
      if (!isButtonMesh(e.object.name)) return;
      e.stopPropagation();
      document.body.style.cursor = "pointer";
      const mesh = e.object as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.emissive) {
          mat.emissive.setRGB(0.25, 0.25, 0.25);
          mat.emissiveIntensity = 0.6;
        }
      }
    },
    [],
  );

  const handlePointerOut = useCallback(
    (e: { object: THREE.Object3D }) => {
      if (!isButtonMesh(e.object.name)) return;
      document.body.style.cursor = "auto";
      const mesh = e.object as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.emissive && !e.object.name.startsWith("record_dot")) {
          mat.emissive.setRGB(0, 0, 0);
          mat.emissiveIntensity = 0;
        }
      }
    },
    [],
  );

  return (
    <group rotation={[Math.PI / 2, 0, 0]} scale={23}>
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}

export interface MusicPlayer3DProps {
  className?: string;
}

export function MusicPlayer3D({ className }: MusicPlayer3DProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* NOTE: No `global` on PresentationControls — global hijacks all window pointer
          events which breaks the Source Code popover button in the parent card. */}
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]}>
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
