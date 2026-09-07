"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, PresentationControls } from "@react-three/drei";
import { cn } from "@/lib/utils";

// Preload the model for faster loading
useGLTF.preload("/models/music-player-3d.glb");

export function MusicPlayer3DModel(props: any) {
  const { scene } = useGLTF("/models/music-player-3d.glb");
  
  return <primitive object={scene} {...props} />;
}

export interface MusicPlayer3DProps {
  className?: string;
}

export function MusicPlayer3D({ className }: MusicPlayer3DProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]}>
        {/* Stronger lighting so the dark model is clearly visible */}
        <ambientLight intensity={2.0} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={3.0} castShadow />
        <directionalLight position={[-5, 5, 10]} intensity={2.0} />
        <directionalLight position={[5, -5, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <PresentationControls
            global
            snap={true}
            rotation={[0.15, -0.15, 0]}
            polar={[-Math.PI / 6, Math.PI / 6]}
            azimuth={[-Math.PI / 6, Math.PI / 6]}
          >
            {/* The model's native width is ~0.193. Scale by 23 makes it ~4.4 units wide.
                Rotate X by 90deg to make the front panel (+Y) face the camera (+Z)
                while keeping the landscape orientation (X axis). */}
            <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={23}>
              <MusicPlayer3DModel />
            </group>
            {/* The bottom edge of the device is at ~1.15 units down after scaling and rotation. */}
            <ContactShadows position={[0, -1.25, 0]} opacity={0.6} scale={15} blur={2.0} far={4} />
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
