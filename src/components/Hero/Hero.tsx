import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrbitalSphereBackground } from "../../shaders/orbital-sphere/OrbitalSphereBackground";
import "../../shaders/threeui.css";
import MaskedHeading from "../MaskedHeading";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sphereWrapRef = useRef<HTMLDivElement | null>(null);
  const wordmarkWrapRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const sphere = sphereWrapRef.current;
    const wordmark = wordmarkWrapRef.current;
    const subtitle = subtitleRef.current;
    if (!section || !sphere || !wordmark || !subtitle) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        isMobile: "(max-width: 767px)",
        // GSAP's matchMedia only invokes the callback when at least one
        // named query matches; "all" always matches so this setup runs on
        // every viewport, with `reduce`/`isMobile` available as flags.
        all: "all",
      },
      (context) => {
        const { reduce, isMobile } = context.conditions as {
          reduce: boolean;
          isMobile: boolean;
        };

        // Respect reduced-motion: leave the static composition exactly as it
        // already renders, no scroll-linked transform at all.
        if (reduce) return;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: isMobile ? "+=70%" : "+=130%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Beat 1 (0 -> 1.6): the composition breathes — the sphere drifts,
        // rotates and grows behind the wordmark while the wordmark itself
        // scales down and lifts slightly, the two moving at different
        // rates so the sphere reads as sitting further back (parallax/depth).
        tl.to(
          sphere,
          {
            scale: isMobile ? 1.15 : 1.32,
            rotate: isMobile ? 6 : 12,
            y: isMobile ? -14 : -28,
            duration: 1.6,
          },
          0,
        ).to(
          wordmark,
          {
            scale: isMobile ? 0.9 : 0.82,
            y: isMobile ? -14 : -26,
            duration: 1.6,
          },
          0,
        );

        // Beat 2 (1.6 -> 2.2): clean exit — subtitle and wordmark dissolve
        // upward together while the sphere keeps drifting outward and fades
        // low, so the pinned hero visually clears before releasing into the
        // next section.
        tl.to(subtitle, { autoAlpha: 0, y: -16, duration: 0.5 }, 1.6)
          .to(
            wordmark,
            {
              autoAlpha: 0,
              y: isMobile ? -60 : -100,
              duration: 0.6,
            },
            1.6,
          )
          .to(
            sphere,
            {
              autoAlpha: 0.16,
              scale: isMobile ? 1.28 : 1.55,
              duration: 0.6,
            },
            1.6,
          );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#030304] text-white"
    >
      <div ref={sphereWrapRef} className="absolute inset-0 will-change-transform">
        <OrbitalSphereBackground />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 text-center">
        <div ref={wordmarkWrapRef} className="w-full will-change-transform">
          <MaskedHeading
            text="usual-ui"
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
        </div>
        <p
          ref={subtitleRef}
          className="max-w-xl text-description text-white/60"
        >
          usual-ui is a reusable component library. Copy the source. Ship it.
          Make it yours.
        </p>
      </div>
    </section>
  );
};

export default Hero;
