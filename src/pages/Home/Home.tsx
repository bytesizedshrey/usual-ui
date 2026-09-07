import ThreeDCardDemo from "../../components/3d-card-demo";
import MusicPlayerCardDemo from "../../components/music-player-card-demo";
import MusicPlayer3DCardDemo from "../../components/music-player-3d-card-demo";
import Hero from "../../components/Hero";
import { Reveal } from "../../components/motion";
import { StructureFlowCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

const Home = () => {
  return (
    <main>
      <Hero />
      <section className="w-full bg-[#030304] px-6 py-12" id="showcase">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start justify-items-center gap-8 lg:grid-cols-3">
          <Reveal>
            <ThreeDCardDemo />
          </Reveal>
          <Reveal delay={0.08}>
            <MusicPlayerCardDemo />
          </Reveal>
          <Reveal delay={0.16}>
            <MusicPlayer3DCardDemo />
          </Reveal>
        </div>
      </section>

      {/* Website Footer */}
      <footer className="relative w-full overflow-hidden bg-[#030304] pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 text-white">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <StructureFlowCollection
            variant="structure-flow"
            speed={1.00}
            pointSize={0.080}
            opacity={0.40}
            maskStart={0.20}
            maskSolid={0.50}
          />
        </div>

        <Reveal className="relative z-10 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            built with code, not black boxes.
          </h2>

          <div className="mt-8 flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white/80 transition-colors">Components</a>
            <a href="#" className="hover:text-white/80 transition-colors">Documentation</a>
            <a href="#" className="hover:text-white/80 transition-colors">GitHub</a>
          </div>
        </Reveal>
      </footer>
    </main>
  );
};

export default Home;
