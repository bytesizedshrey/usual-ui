import { OrbitalSphereBackground } from "../../shaders/orbital-sphere/OrbitalSphereBackground";
import "../../shaders/threeui.css";
import MaskedHeading from "../MaskedHeading";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#030304] text-white">
      <div className="absolute inset-0">
        <OrbitalSphereBackground />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 text-center">
        <MaskedHeading
          text="usual ui"
          tag="h1"
          mediaType="image"
          src="/hero.svg"
          fillScale={1.25}
          parallax={26}
          drift={18}
          reveal="rise"
          trigger="view"
          align="center"
          weight={700}
          tracking={-0.03}
          wordGap={0.3}
          lineHeight={1.06}
          textScale={0.115}
        />
        <p className="max-w-xl text-description text-white/60">
          usual-ui is a reusable component library — copy the source, ship it
          as your own, no black boxes.
        </p>
      </div>
    </section>
  );
};

export default Hero;
