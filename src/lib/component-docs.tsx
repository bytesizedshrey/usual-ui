import MusicPlayer3DDemo from "@/components/MusicPlayer3DDemo";
import musicPlayer3DSource from "@/components/MusicPlayer3D/MusicPlayer3D.tsx?raw";
import musicPlayer3DDemoSource from "@/components/MusicPlayer3DDemo/MusicPlayer3DDemo.tsx?raw";
import NavigationMapDemo from "@/components/NavigationMapDemo";
import navigationMapSource from "@/components/NavigationMap/NavigationMap.tsx?raw";
import navigationMapDemoSource from "@/components/NavigationMapDemo/NavigationMapDemo.tsx?raw";
import VintageKeyboardDemo from "@/components/VintageKeyboardDemo";
import vintageKeyboardSource from "@/components/VintageKeyboard/VintageKeyboard.tsx?raw";
import vintageKeyboardDemoSource from "@/components/VintageKeyboardDemo/VintageKeyboardDemo.tsx?raw";
import SketchbookDemo from "@/components/SketchbookDemo";
import sketchbookSource from "@/components/Sketchbook/Sketchbook.tsx?raw";
import sketchbookDocSource from "@/components/Sketchbook/sketchbookDoc.ts?raw";
import sketchbookDemoSource from "@/components/SketchbookDemo/SketchbookDemo.tsx?raw";

import type { ReactNode } from "react";
import receiptPrinterSource from "@/components/ReceiptPrinter/ReceiptPrinter.tsx?raw";
import receiptPrinterDemoSource from "@/components/ReceiptPrinterDemo/ReceiptPrinterDemo.tsx?raw";
import ReceiptPrinterDemo from "@/components/ReceiptPrinterDemo/ReceiptPrinterDemo";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

export interface ComponentPropRow {
  name: string;
  type: string;
  defaultVal?: string;
  description: string;
}

export interface ComponentPropGroup {
  heading: string;
  rows: ComponentPropRow[];
}

export interface ComponentDoc {
  slug: string;
  name: string;
  filePath: string;
  description: ReactNode;
  secondaryNote?: ReactNode;
  install: {
    cliIntro?: string;
    cliCommands?: Record<PackageManager, string>;
    manualIntro: string;
    manualText: string;
  };
  demoUsage: {
    description: string;
    code: string;
    language?: string;
  };
  exampleUsage: {
    code: string;
    preview: ReactNode;
    previewMinHeight: string;
  };
  propGroups: ComponentPropGroup[];
  propsFootnote?: ReactNode;
  source: {
    title: string;
    intro: string;
    code: string;
    language?: string;
  };
}

function npmAdd(pkgs: string): Record<PackageManager, string> {
  return {
    npm: `npm install ${pkgs}`,
    pnpm: `pnpm add ${pkgs}`,
    yarn: `yarn add ${pkgs}`,
    bun: `bun add ${pkgs}`,
  };
}



export const receiptPrinterDoc: ComponentDoc = {
  slug: "receipt-printer",
  name: "Receipt Printer",
  filePath: "src/components/ReceiptPrinter/ReceiptPrinter.tsx",
  description: (
    <>
      A skeuomorphic receipt printer component with realistic printing animations,
      smooth or stepped paper feed, and dynamic state transitions.
    </>
  ),
  install: {
    cliIntro: "Install the required dependencies:",
    cliCommands: npmAdd("@phosphor-icons/react motion tailwind-merge clsx"),
    manualIntro: "Add the required dependencies and copy the source file into your project:",
    manualText: `Copy the following files into your project:
- src/components/ReceiptPrinter/ReceiptPrinter.tsx
- src/lib/utils.ts (for the cn utility)

You will also need the paper texture and logo images in your public directory.`,
  },
  demoUsage: {
    description:
      "The component is built with a composition pattern. You can assemble the printer parts as needed.",
    code: `import { ReceiptPrinter } from "@/components/ReceiptPrinter/ReceiptPrinter";

export default function Demo() {
  return (
    <ReceiptPrinter.Root stage="printing">
      <ReceiptPrinter.Machine>
        <ReceiptPrinter.Header>
          <ReceiptPrinter.Status />
        </ReceiptPrinter.Header>

        <ReceiptPrinter.Screen>
           {/* Screen UI Content */}
        </ReceiptPrinter.Screen>

        <ReceiptPrinter.Output>
          <ReceiptPrinter.Paper>
            {/* Printed Receipt Content */}
          </ReceiptPrinter.Paper>
        </ReceiptPrinter.Output>
      </ReceiptPrinter.Machine>
    </ReceiptPrinter.Root>
  );
}`,
  },
  exampleUsage: {
    code: receiptPrinterDemoSource,
    preview: <ReceiptPrinterDemo />,
    previewMinHeight: "min-h-[600px]",
  },
  propGroups: [
    {
      heading: "ReceiptPrinter.Root",
      rows: [
        {
          name: "stage",
          type: '"processing" | "printing" | "complete"',
          description: "Current state of the printer. Controls the visibility and animation of the receipt.",
        },
        {
          name: "animate",
          type: "boolean",
          defaultVal: "true",
          description: "Disables all stage transitions when false. Useful for static renders or reduced motion preferences.",
        },
        {
          name: "feedMotion",
          type: '"smooth" | "stepped"',
          defaultVal: '"stepped"',
          description: "Controls whether the paper feeds continuously or one line at a time to mimic real receipt printers.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes to apply to the root element.",
        },
      ],
    },
    {
      heading: "ReceiptPrinter.Status",
      rows: [
        {
          name: "children",
          type: "ReactNode",
          defaultVal: "Derived from stage",
          description: "Custom status content. Defaults to a label derived from the current printer stage.",
        },
      ],
    },
  ],
  propsFootnote: (
    <>
      Note: Other sub-components (Machine, Header, Screen, Output, Paper) accept
      standard HTML element props (e.g. className, style, children).
    </>
  ),
  source: {
    title: "ReceiptPrinter.tsx",
    intro: "The full implementation of the Receipt Printer components.",
    code: receiptPrinterSource,
  },
};



export const musicPlayer3DDoc: ComponentDoc = {
  slug: "music-player-3d",
  name: "Music Player 3D",
  filePath: "src/components/MusicPlayer3D/MusicPlayer3D.tsx",
  description: (
    <>
      A 3D rendering of the approved Music Player model using React Three Fiber.
    </>
  ),
  install: {
    cliIntro: "Install the required dependencies:",
    cliCommands: npmAdd("three @react-three/fiber @react-three/drei"),
    manualIntro: "Add the required dependencies and copy the source file into your project:",
    manualText: `Copy the following files into your project:
- src/components/MusicPlayer3D/MusicPlayer3D.tsx
- src/lib/utils.ts (for the cn utility)

You will also need the 3D model in your public directory at /models/music-player-3d-enhanced.glb`,
  },
  demoUsage: {
    description: "The component renders the 3D model inside a Canvas.",
    code: `import { MusicPlayer3D } from "@/components/MusicPlayer3D";

export default function Demo() {
  return <MusicPlayer3D />;
}`,
  },
  exampleUsage: {
    code: musicPlayer3DDemoSource,
    preview: <MusicPlayer3DDemo />,
    previewMinHeight: "min-h-[400px]",
  },
  propGroups: [
    {
      heading: "MusicPlayer3D",
      rows: [
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes to apply to the root element.",
        },
      ],
    },
  ],
  source: {
    title: "MusicPlayer3D.tsx",
    intro: "The full implementation of the 3D Music Player component.",
    code: musicPlayer3DSource,
  },
};

export const navigationMapDoc: ComponentDoc = {
  slug: "navigation-map",
  name: "Navigation Map",
  filePath: "src/components/NavigationMap/NavigationMap.tsx",
  description: (
    <>
      A compact, skeuomorphic in-car navigation widget — a dark procedural
      map, a live route with a pulsing vehicle marker, a speed-limit sign,
      and a bottom HUD bar with turn, distance, and trip readouts.
    </>
  ),
  secondaryNote: (
    <>
      The map surface is procedurally generated (a seeded layout of roads,
      buildings, parks, and water) rather than tile-based — it&apos;s a
      visual surface for the HUD, not a real map renderer.
    </>
  ),
  install: {
    cliIntro: "No extra dependencies — copy the component into your project:",
    cliCommands: npmAdd("clsx tailwind-merge"),
    manualIntro: "Add the required dependency and copy the source file into your project:",
    manualText: `Copy the following files into your project:
- src/components/NavigationMap/NavigationMap.tsx
- src/lib/utils.ts (for the cn utility)`,
  },
  demoUsage: {
    description: "The component is a single, self-contained, prop-driven widget.",
    code: `import { NavigationMap } from "@/components/NavigationMap";

export default function Demo() {
  return (
    <NavigationMap
      distance="900 m"
      streetName="Ness Ave"
      turnDirection="right"
      speedLimit={55}
      speedUnit="MPH"
      destination="1408 Ness Ave"
    />
  );
}`,
  },
  exampleUsage: {
    code: navigationMapDemoSource,
    preview: <NavigationMapDemo />,
    previewMinHeight: "min-h-[360px]",
  },
  propGroups: [
    {
      heading: "NavigationMap",
      rows: [
        {
          name: "distance",
          type: "string",
          defaultVal: '"900 m"',
          description: "Distance to the next turn. The leading number and trailing unit are split and styled separately.",
        },
        {
          name: "streetName",
          type: "string",
          defaultVal: '"Ness Ave"',
          description: "Street the next turn is on.",
        },
        {
          name: "speedLimit",
          type: "number",
          defaultVal: "55",
          description: "Posted speed limit shown on the sign.",
        },
        {
          name: "speedUnit",
          type: '"MPH" | "KM/H"',
          defaultVal: '"MPH"',
          description: "Speed unit. Not shown on the sign face in this compact widget (matches the finalized design); exposed via a data-speed-unit attribute.",
        },
        {
          name: "turnDirection",
          type: '"left" | "slight-left" | "straight" | "slight-right" | "right" | "sharp-right" | "u-turn" | "roundabout"',
          defaultVal: '"right"',
          description: "Which glyph the turn-instruction icon renders.",
        },
        {
          name: "routeColor",
          type: "string",
          defaultVal: '"#c8382c"',
          description: "Route line color (hex).",
        },
        {
          name: "mapTheme",
          type: '"graphite" | "midnight" | "ember" | "teal"',
          defaultVal: '"graphite"',
          description: "Subtle color wash applied over the map surface (soft-light blend, low opacity).",
        },
        {
          name: "destination",
          type: "string",
          defaultVal: '"1408 Ness Ave"',
          description: "Destination address shown in the top-left pill.",
        },
        {
          name: "destinationLabel",
          type: "string",
          defaultVal: '"Destination"',
          description: "Label above the destination value.",
        },
        {
          name: "arrivalTime",
          type: "string",
          defaultVal: '"4:38"',
          description: "Estimated arrival time, shown in the HUD bar.",
        },
        {
          name: "remaining",
          type: "string",
          defaultVal: '"8.2 km"',
          description: "Remaining distance/time, shown in the HUD bar. Hidden below 355px wide.",
        },
        {
          name: "range",
          type: "string",
          defaultVal: '"214 km"',
          description: "Remaining vehicle range, shown in the HUD bar. Hidden below 445px wide.",
        },
        {
          name: "currentLocation",
          type: "{ lat: number; lng: number }",
          defaultVal: "{ lat: 37.7793, lng: -122.4193 }",
          description: "Current vehicle coordinates. The map is procedurally generated, not tile-based, so this is a passthrough for callers wiring the widget to a real geo source.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes to apply to the root element.",
        },
      ],
    },
  ],
  propsFootnote: (
    <>
      Responsive by container width (via a <code>ResizeObserver</code> on the
      map surface, not viewport media queries): the Range readout hides
      below 445px, the full readout group and divider hide below 355px, and
      the speed sign shrinks and repositions — the widget never clips or
      scrolls horizontally.
    </>
  ),
  source: {
    title: "NavigationMap.tsx",
    intro: "The full implementation of the Navigation Map widget.",
    code: navigationMapSource,
  },
};

export const vintageKeyboardDoc: ComponentDoc = {
  slug: "vintage-keyboard",
  name: "Vintage Keyboard",
  filePath: "src/components/VintageKeyboard/VintageKeyboard.tsx",
  description: (
    <>
      A high-fidelity interactive mechanical keyboard — modern graphite,
      ivory, or olive shells with a skeuomorphic keycap treatment, real
      keyboard input passthrough, procedural mechanical click sound, and
      haptic feedback on press.
    </>
  ),
  secondaryNote: (
    <>
      Sound uses the Web Audio API and haptics use the Vibration API; both
      degrade gracefully (silently no-op) on browsers or devices that
      don&apos;t support them. Keycap labels are set in <code>"Geist"</code>{" "}
      with a <code>ui-sans-serif, sans-serif</code> fallback — self-hosting
      Geist is optional, the keyboard renders fine on your system sans-serif
      if you don&apos;t have it.
    </>
  ),
  install: {
    cliIntro:
      "usual-ui components are copy-paste source, not an installable package — grab the code from the Source Code panel below and paste these two files into your own project:",
    cliCommands: {
      npm: "# No package install needed beyond react/react-dom, which almost\n# every React project already has.\n# Open \"Source Code\" below, then copy the files listed under \"Manual\".",
      pnpm: "# No package install needed beyond react/react-dom, which almost\n# every React project already has.\n# Open \"Source Code\" below, then copy the files listed under \"Manual\".",
      yarn: "# No package install needed beyond react/react-dom, which almost\n# every React project already has.\n# Open \"Source Code\" below, then copy the files listed under \"Manual\".",
      bun: "# No package install needed beyond react/react-dom, which almost\n# every React project already has.\n# Open \"Source Code\" below, then copy the files listed under \"Manual\".",
    },
    manualIntro: "Copy these files into your own project — both are required:",
    manualText: `components/VintageKeyboard/VintageKeyboard.tsx
components/VintageKeyboard/styles.css (required — drives the key-press animation)

Place them in whatever folder your project uses for components (e.g.
"components/" or "src/components/") — the two files just need to sit
next to each other, since VintageKeyboard.tsx imports the stylesheet
with a relative path ("./styles.css").

Runtime dependency: react / react-dom — already part of any React
project, no separate install step. No other npm packages required.`,
  },
  demoUsage: {
    description:
      'The component is self-contained. Once copied into your project, import it from wherever you placed the two files above — adjust the "@/..." alias below to match your own project setup (or use a relative import) if you don\'t already have a "@" path alias configured. Real keydown/keyup events on the page are passed through automatically.',
    code: `import VintageKeyboard from "@/components/VintageKeyboard/VintageKeyboard";

export default function Demo() {
  return <VintageKeyboard theme="ivory" layout="full" />;
}`,
  },
  exampleUsage: {
    code: vintageKeyboardDemoSource,
    preview: <VintageKeyboardDemo />,
    previewMinHeight: "min-h-[380px]",
  },
  propGroups: [
    {
      heading: "VintageKeyboard",
      rows: [
        {
          name: "theme",
          type: '"graphite" | "ivory" | "olive"',
          defaultVal: '"ivory"',
          description: "Color theme applied to the shell and keycaps.",
        },
        {
          name: "layout",
          type: '"full" | "compact" | "numpad" | "iso"',
          defaultVal: '"full"',
          description: "Physical keyboard layout (104-key, 60%, numpad, or ISO).",
        },
        {
          name: "size",
          type: '"default" | "compact"',
          defaultVal: '"default"',
          description: "Overall key size scale.",
        },
        {
          name: "soundEnabled",
          type: "boolean",
          defaultVal: "true",
          description: "Enable the procedural mechanical click sound on press/release.",
        },
        {
          name: "haptics",
          type: "boolean",
          defaultVal: "true",
          description: "Enable haptic feedback (vibration) on press, where supported.",
        },
        {
          name: "activeKeys",
          type: "string[]",
          defaultVal: "[]",
          description: "Key codes to render as pressed from external state.",
        },
        {
          name: "disabledKeys",
          type: "string[]",
          defaultVal: "[]",
          description: "Key codes to disable — dimmed and non-interactive.",
        },
        {
          name: "accentKeys",
          type: "string[]",
          defaultVal: '["Escape", "Enter", "Backspace", "Delete", "Space"]',
          description: "Key codes rendered with the red accent keycap material.",
        },
        {
          name: "onKeyPress",
          type: "(e: { code: string; char: string | null; shift: boolean; caps: boolean }) => void",
          description: "Called on every key press, from both pointer and physical keyboard input.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes to apply to the root element.",
        },
      ],
    },
  ],
  propsFootnote: (
    <>
      Scales to its container width automatically (via a{" "}
      <code>ResizeObserver</code>) — the board itself never overflows or
      scrolls horizontally. Physical keyboard input is captured on{" "}
      <code>window</code> while the component is mounted.
    </>
  ),
  source: {
    title: "VintageKeyboard.tsx",
    intro: "The full implementation of the Vintage Keyboard component.",
    code: vintageKeyboardSource,
  },
};

export const sketchbookDoc: ComponentDoc = {
  slug: "sketchbook",
  name: "Sketchbook",
  filePath: "src/components/Sketchbook/Sketchbook.tsx",
  description: (
    <>
      A compact, interactive paper sketchbook — nine drawn plates with
      nested-strip CSS 3D page curls, direct drag-to-turn interaction, mouse
      tilt, zoom controls, and a draggable magnifying glass.
    </>
  ),
  secondaryNote: (
    <>
      The interactive book runs as plain vanilla JS/CSS3D inside a local,
      self-contained sandboxed iframe (<code>srcdoc</code>) — no external
      network requests, no CORS. That logic lives in{" "}
      <code>sketchbookDoc.ts</code>, a required second file: it generates the
      nine Sadie Sink plates as inline SVG (no image assets to ship) and
      builds the full page-curl/drag/tilt/zoom/magnifier document that the
      iframe mounts. Typography inside the book uses system font stacks
      (Georgia/Times New Roman, and a cursive stack for the handwritten
      notes) — nothing to vendor or self-host.
    </>
  ),
  install: {
    manualIntro: "No extra dependencies required. Copy the component source into your project:",
    manualText: `Copy the combined source code from the Source Code section below.

By default, the source is provided as a single file for convenience. You can save it as:
- src/components/ui/Sketchbook.tsx

(If you prefer, you can split it into Sketchbook.tsx and sketchbookDoc.ts as indicated by the comments in the source).`,
  },
  demoUsage: {
    description:
      "The component is self-contained — it renders a fixed-aspect, transparent-background frame that scales down to its container width.",
    code: `import { Sketchbook } from "@/components/ui/Sketchbook";

export default function Demo() {
  return <Sketchbook />;
}`,
  },
  exampleUsage: {
    code: sketchbookDemoSource,
    preview: <SketchbookDemo />,
    previewMinHeight: "min-h-[380px]",
  },
  propGroups: [
    {
      heading: "Sketchbook",
      rows: [
        {
          name: "startPlate",
          type: "number",
          defaultVal: "0",
          description: "Which plate to show on load (0-8).",
        },
        {
          name: "magnifier",
          type: "boolean",
          defaultVal: "true",
          description: "Show the draggable magnifying glass.",
        },
        {
          name: "intro",
          type: "boolean",
          defaultVal: "true",
          description: "Play the riffle intro animation on mount.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes to apply to the root element.",
        },
      ],
    },
  ],
  propsFootnote: (
    <>
      Scales responsively to its container width (max <code>640px</code>) via
      CSS <code>aspect-ratio</code> — the book itself never overflows or
      scrolls horizontally. Keyboard-accessible: arrow keys turn pages,
      double-click resets zoom.
    </>
  ),
  source: {
    title: "Sketchbook.tsx",
    intro: "The React wrapper, plus the full interactive book implementation it mounts.",
    code: `${sketchbookSource}
// ---------------------------------------------------------------------------
// src/components/Sketchbook/sketchbookDoc.ts
// ---------------------------------------------------------------------------

${sketchbookDocSource}`,
  },
};
