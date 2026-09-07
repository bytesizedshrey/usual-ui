"use client";


import { MusicPlayer3D } from "@/components/MusicPlayer3D";

export function MusicPlayer3DDemo() {
  return (
    <div className="flex w-full items-center justify-center p-8 aspect-[4/3] md:aspect-[5/3]">
      <MusicPlayer3D className="w-full h-full max-w-2xl" />
    </div>
  );
}

export default MusicPlayer3DDemo;
