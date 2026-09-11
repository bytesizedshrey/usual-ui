import ThreeDCardDemo from "../../components/3d-card-demo";
import MusicPlayer3DCardDemo from "../../components/music-player-3d-card-demo";
import NavigationMapCardDemo from "../../components/navigation-map-card-demo";
import VintageKeyboardCardDemo from "../../components/vintage-keyboard-card-demo";
import SketchbookCardDemo from "../../components/sketchbook-card-demo";
import SavingsChallengeCardCardDemo from "../../components/savings-challenge-card-demo";
import ClimateControlPanelCardDemo from "../../components/climate-control-panel-card-demo";
import VehicleControlSurfaceCardDemo from "../../components/vehicle-control-surface-card-demo";
import EVWirelessChargingCardDemo from "../../components/ev-wireless-charging-card-demo";
import Hero from "../../components/Hero";
import MotionScrollWordRevealDemo from "../../components/MotionScrollWordRevealDemo";
import { Reveal } from "../../components/motion";
import { StructureFlowCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

const Home = () => {
  return (
    <main>
      <Hero />
      <MotionScrollWordRevealDemo />
      <section className="w-full bg-[#030304] px-6 py-12" id="showcase">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch justify-items-center gap-8 lg:grid-cols-3">
          <Reveal className="h-full">
            <ThreeDCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.16}>
            <MusicPlayer3DCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.24}>
            <NavigationMapCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.32}>
            <VintageKeyboardCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.4}>
            <SketchbookCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.48}>
            <SavingsChallengeCardCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.56}>
            <ClimateControlPanelCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.64}>
            <VehicleControlSurfaceCardDemo />
          </Reveal>
          <Reveal className="h-full" delay={0.72}>
            <EVWirelessChargingCardDemo />
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
