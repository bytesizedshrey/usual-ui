import MusicPlayer3DDemo from "@/components/MusicPlayer3DDemo";
import musicPlayer3DSource from "@/components/MusicPlayer3D/MusicPlayer3D.tsx?raw";
import musicPlayer3DDemoSource from "@/components/MusicPlayer3DDemo/MusicPlayer3DDemo.tsx?raw";
import NavigationMapDemo from "@/components/NavigationMapDemo";
import navigationMapSource from "@/components/NavigationMap/NavigationMap.tsx?raw";
import navigationMapDemoSource from "@/components/NavigationMapDemo/NavigationMapDemo.tsx?raw";
import VintageKeyboardDemo from "@/components/VintageKeyboardDemo";
import vintageKeyboardSource from "@/components/VintageKeyboard/VintageKeyboard.tsx?raw";
import vintageKeyboardDemoSource from "@/components/VintageKeyboardDemo/VintageKeyboardDemo.tsx?raw";
import ClimateControlPanelDemo from "@/components/ClimateControlPanelDemo";
import climateControlPanelSource from "@/components/ClimateControlPanel/ClimateControlPanel.tsx?raw";
import climateControlPanelDemoSource from "@/components/ClimateControlPanelDemo/ClimateControlPanelDemo.tsx?raw";
import VehicleControlSurfaceDemo from "@/components/VehicleControlSurfaceDemo";
import vehicleControlSurfaceSource from "@/components/VehicleControlSurface/VehicleControlSurface.tsx?raw";
import vehicleStageSource from "@/components/VehicleControlSurface/VehicleStage.tsx?raw";
import vehicleModelSource from "@/components/VehicleControlSurface/vehicleModel.ts?raw";
import vehicleControlSurfaceDemoSource from "@/components/VehicleControlSurfaceDemo/VehicleControlSurfaceDemo.tsx?raw";
import EVWirelessChargingDemo from "@/components/EVWirelessChargingDemo";
import evWirelessChargingSource from "@/components/EVWirelessCharging/EVWirelessCharging.tsx?raw";
import chargingStageSource from "@/components/EVWirelessCharging/ChargingStage.tsx?raw";
import evChargingModelSource from "@/components/EVWirelessCharging/evChargingModel.ts?raw";
import evWirelessChargingDemoSource from "@/components/EVWirelessChargingDemo/EVWirelessChargingDemo.tsx?raw";
import SketchbookDemo from "@/components/SketchbookDemo";
import sketchbookSource from "@/components/Sketchbook/Sketchbook.tsx?raw";
import sketchbookDocSource from "@/components/Sketchbook/sketchbookDoc.ts?raw";
import sketchbookDemoSource from "@/components/SketchbookDemo/SketchbookDemo.tsx?raw";
import SavingsChallengeCardDemo from "@/components/SavingsChallengeCardDemo";
import savingsChallengeCardSource from "@/components/SavingsChallengeCard/SavingsChallengeCard.tsx?raw";
import savingsChallengeCardDotMatrixSource from "@/components/SavingsChallengeCard/dot-matrix.tsx?raw";
import savingsChallengeCardDemoSource from "@/components/SavingsChallengeCardDemo/SavingsChallengeCardDemo.tsx?raw";

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

export const climateControlPanelDoc: ComponentDoc = {
  slug: "climate-control-panel",
  name: "Climate Control Panel",
  filePath: "src/components/ClimateControlPanel/ClimateControlPanel.tsx",
  description: (
    <>
      A skeuomorphic car climate control panel — a milled housing with three
      recessed switches: a front-defrost toggle, an A/C toggle with an
      indicator LED, and a two-position air intake selector (fresh air /
      recirculate), each with real button travel, procedural click sound, and
      haptic feedback on press.
    </>
  ),
  secondaryNote: (
    <>
      Sound uses the Web Audio API and haptics use the Vibration API; both
      degrade gracefully (silently no-op) on browsers or devices that
      don&apos;t support them. The air intake selector follows the WAI-ARIA{" "}
      <code>radiogroup</code> pattern with roving <code>tabIndex</code> and
      arrow-key navigation. Labels are set in <code>"Geist"</code> with a{" "}
      <code>ui-sans-serif, sans-serif</code> fallback — self-hosting Geist is
      optional, the panel renders fine on your system sans-serif if you
      don&apos;t have it.
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
    manualText: `components/ClimateControlPanel/ClimateControlPanel.tsx
components/ClimateControlPanel/styles.css (required — drives the hover/focus states and press animation)

Place them in whatever folder your project uses for components (e.g.
"components/" or "src/components/") — the two files just need to sit
next to each other, since ClimateControlPanel.tsx imports the stylesheet
with a relative path ("./styles.css").

Runtime dependency: react / react-dom — already part of any React
project, no separate install step. No other npm packages required.`,
  },
  demoUsage: {
    description:
      'The component is self-contained and uncontrolled by default. Once copied into your project, import it from wherever you placed the two files above — adjust the "@/..." alias below to match your own project setup (or use a relative import) if you don\'t already have a "@" path alias configured.',
    code: `import ClimateControlPanel from "@/components/ClimateControlPanel/ClimateControlPanel";

export default function Demo() {
  return (
    <ClimateControlPanel
      defaultAcOn
      defaultIntake="fresh"
      onChange={(state) => console.log(state)}
    />
  );
}`,
  },
  exampleUsage: {
    code: climateControlPanelDemoSource,
    preview: <ClimateControlPanelDemo />,
    previewMinHeight: "min-h-[560px]",
  },
  propGroups: [
    {
      heading: "ClimateControlPanel",
      rows: [
        {
          name: "defaultDefrostOn",
          type: "boolean",
          defaultVal: "false",
          description: "Initial state of the front defrost toggle.",
        },
        {
          name: "defaultAcOn",
          type: "boolean",
          defaultVal: "true",
          description: "Initial state of the A/C toggle.",
        },
        {
          name: "defaultIntake",
          type: '"fresh" | "recirc"',
          defaultVal: '"fresh"',
          description: "Initial air intake mode.",
        },
        {
          name: "ledColor",
          type: "string",
          defaultVal: '"#2edc46"',
          description: "Color of the A/C indicator LED (any valid CSS color).",
        },
        {
          name: "sound",
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
          name: "showStatus",
          type: "boolean",
          defaultVal: "true",
          description: "Show the monospace status line beneath the panel.",
        },
        {
          name: "onChange",
          type: "(state: { defrost: boolean; ac: boolean; intake: \"fresh\" | \"recirc\" }) => void",
          description: "Called whenever the defrost toggle, A/C toggle, or air intake mode changes.",
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
      <code>ResizeObserver</code>) — the panel itself never overflows or
      scrolls horizontally.
    </>
  ),
  source: {
    title: "ClimateControlPanel.tsx",
    intro: "The full implementation of the Climate Control Panel component.",
    code: climateControlPanelSource,
  },
};

export const vehicleControlSurfaceDoc: ComponentDoc = {
  slug: "vehicle-control-surface",
  name: "Vehicle Control Surface",
  filePath: "src/components/VehicleControlSurface/VehicleControlSurface.tsx",
  description: (
    <>
      A premium EV dashboard — a live, procedurally built 3D vehicle
      (React Three Fiber, no model file) rendered in a deep-black studio
      environment, with a header battery gauge and status line above it and
      a tactile skeuomorphic control dock — lock, climate, charging, sentry,
      and battery detail — below.
    </>
  ),
  secondaryNote: (
    <>
      The dock controls are physical, not flat web buttons: unpressed they
      sit raised with a bevel highlight and a contact shadow; pressed/active
      they sink into the housing with darker inner edges, ambient occlusion,
      and a lit LED — depth communicates state even with the icon and color
      unchanged. Sound uses the Web Audio API and haptics use the Vibration
      API; both degrade gracefully on browsers or devices that don&apos;t
      support them. The 3D stage renders with <code>@react-three/fiber</code>{" "}
      and <code>@react-three/drei</code> (already used by{" "}
      <code>MusicPlayer3D</code> in this library) — no GLB/GLTF asset to
      ship, the car body is built from primitive geometry at runtime.
    </>
  ),
  install: {
    cliIntro: "Install the required dependencies:",
    cliCommands: npmAdd("three @react-three/fiber @react-three/drei"),
    manualIntro: "Add the required dependencies and copy these files into your project:",
    manualText: `Copy the following files into your project:
- src/components/VehicleControlSurface/VehicleControlSurface.tsx
- src/components/VehicleControlSurface/VehicleStage.tsx
- src/components/VehicleControlSurface/vehicleModel.ts
- src/components/VehicleControlSurface/styles.css (required — drives the dock's raised/sunk states and press animation)
- src/lib/utils.ts (for the cn utility)

Place them in whatever folder your project uses for components — the
files just need to sit next to each other, since
VehicleControlSurface.tsx imports "./VehicleStage" and "./styles.css",
and VehicleStage.tsx imports "./vehicleModel" with relative paths.

Runtime dependencies: react / react-dom, three, @react-three/fiber, and
@react-three/drei.`,
  },
  demoUsage: {
    description:
      'The component is self-contained and uncontrolled by default — drop it in and it manages its own lock/climate/charging/sentry/battery-detail state. Pass "batteryLevel" instead of "defaultBatteryLevel" to drive the gauge from live telemetry, and "onChange" to react to control changes. Adjust the "@/..." alias below to match your own project setup if you don\'t already have a "@" path alias configured.',
    code: `import VehicleControlSurface from "@/components/VehicleControlSurface/VehicleControlSurface";

export default function Demo() {
  return (
    <VehicleControlSurface
      vehicleName="Vega EX"
      defaultBatteryLevel={82}
      defaultLocked
      onChange={(state) => console.log(state)}
    />
  );
}`,
  },
  exampleUsage: {
    code: vehicleControlSurfaceDemoSource,
    preview: <VehicleControlSurfaceDemo />,
    previewMinHeight: "min-h-[760px]",
  },
  propGroups: [
    {
      heading: "VehicleControlSurface",
      rows: [
        {
          name: "vehicleName",
          type: "string",
          defaultVal: '"Vega EX"',
          description: "Name shown in the header.",
        },
        {
          name: "models",
          type: "{ id: string; name: string; tag?: string }[]",
          description: "Other vehicles the header dropdown can switch between. Omit (or pass fewer than 2) to hide the dropdown affordance.",
        },
        {
          name: "onVehicleChange",
          type: "(model: VehicleModelOption) => void",
          description: "Called when the user picks a different vehicle from the header dropdown.",
        },
        {
          name: "batteryLevel",
          type: "number",
          description: "Current battery level, 0-100. Controlled — pass this to drive the gauge from live telemetry.",
        },
        {
          name: "defaultBatteryLevel",
          type: "number",
          defaultVal: "82",
          description: "Starting battery level when uncontrolled. Ticks upward while charging, up to chargeLimitPercent.",
        },
        {
          name: "status",
          type: "string",
          defaultVal: '"Parked"',
          description: "Baseline status label shown when idle (no charging/climate/sentry override).",
        },
        {
          name: "rangeKm",
          type: "number",
          description: "Estimated range shown in the battery detail readout. Defaults to a projection from the battery level.",
        },
        {
          name: "chargeLimitPercent",
          type: "number",
          defaultVal: "90",
          description: "Charge limit shown in the battery detail readout, as a percent.",
        },
        {
          name: "packTempC",
          type: "number",
          defaultVal: "24",
          description: "Pack temperature shown in the battery detail readout, in °C.",
        },
        {
          name: "cabinTargetC",
          type: "number",
          defaultVal: "21",
          description: "Cabin target temperature shown in the status line while climate is on, in °C.",
        },
        {
          name: "chargingPowerKw",
          type: "number",
          defaultVal: "11.2",
          description: "Charge rate shown in the status line while charging, in kW.",
        },
        {
          name: "paintColor",
          type: "string",
          defaultVal: '"#121519"',
          description: "Body paint color for the 3D vehicle, any CSS hex color.",
        },
        {
          name: "defaultLocked",
          type: "boolean",
          defaultVal: "true",
          description: "Initial lock state.",
        },
        {
          name: "defaultClimateOn",
          type: "boolean",
          defaultVal: "false",
          description: "Initial climate state.",
        },
        {
          name: "defaultCharging",
          type: "boolean",
          defaultVal: "false",
          description: "Initial charging state.",
        },
        {
          name: "defaultSentry",
          type: "boolean",
          defaultVal: "false",
          description: "Initial sentry/security state.",
        },
        {
          name: "defaultBatteryDetailOpen",
          type: "boolean",
          defaultVal: "false",
          description: "Initial state of the battery detail readout drawer.",
        },
        {
          name: "sound",
          type: "boolean",
          defaultVal: "true",
          description: "Enable the procedural control-press click sound.",
        },
        {
          name: "haptics",
          type: "boolean",
          defaultVal: "true",
          description: "Enable haptic feedback (vibration) on press, where supported.",
        },
        {
          name: "onChange",
          type: "(state: { locked: boolean; climateOn: boolean; charging: boolean; sentry: boolean; batteryDetailOpen: boolean }) => void",
          description: "Called whenever lock, climate, charging, sentry, or the battery detail drawer changes.",
        },
        {
          name: "onMessagesClick",
          type: "() => void",
          description: "Called when the header messages icon is clicked.",
        },
        {
          name: "onMenuClick",
          type: "() => void",
          description: "Called when the header menu icon is clicked.",
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
      Fluid, not viewport-hardcoded: the dock, header, and readout use{" "}
      <code>cqw</code>-based container queries against the component&apos;s
      own box (not the viewport), so it holds its proportions whether it
      sits at phone width in a card or full width on a dashboard page. The
      root fills its parent (<code>width: 100%; height: 100%</code>) and
      has no baked-in height of its own — size it with a parent that has an
      explicit height, or an <code>aspect-ratio</code> wrapper (the demo
      above uses <code>aspect-[3/5]</code>), the same way{" "}
      <code>MusicPlayer3D</code> is sized in this library.
    </>
  ),
  source: {
    title: "VehicleControlSurface.tsx",
    intro: "The full implementation of the Vehicle Control Surface component, its 3D stage, and the procedural vehicle geometry builder.",
    code: `${vehicleControlSurfaceSource}

// ---------------------------------------------------------------------------
// src/components/VehicleControlSurface/VehicleStage.tsx
// ---------------------------------------------------------------------------

${vehicleStageSource}

// ---------------------------------------------------------------------------
// src/components/VehicleControlSurface/vehicleModel.ts
// ---------------------------------------------------------------------------

${vehicleModelSource}`,
  },
};

export const evWirelessChargingDoc: ComponentDoc = {
  slug: "ev-wireless-charging",
  name: "EV Wireless Charging",
  filePath: "src/components/EVWirelessCharging/EVWirelessCharging.tsx",
  description: (
    <>
      A premium wireless-charging status screen — a realistic procedurally
      built 3D EV (React Three Fiber, no model file) sitting over an
      animated green/cyan induction field, with a large range readout, a
      machined battery-pack gauge, and a tactile pill-shaped Start/Stop
      Charging control.
    </>
  ),
  secondaryNote: (
    <>
      The vehicle body is lofted from extruded panel shapes bent through a
      plan-view taper and a cross-section camber pass (not a boxy primitive
      car), with lathe-revolved tires for a real sidewall bulge — the same
      recipe as <code>VehicleControlSurface</code> in this library, tuned
      for a rounded SUV silhouette. Sound uses the Web Audio API and haptics
      use the Vibration API; both degrade gracefully on browsers or devices
      that don&apos;t support them. The Start/Stop button&apos;s pressed
      look is driven purely by physical depth (a translated shadow swap),
      not just a color change.
    </>
  ),
  install: {
    cliIntro: "Install the required dependencies:",
    cliCommands: npmAdd("three @react-three/fiber @react-three/drei"),
    manualIntro: "Add the required dependencies and copy these files into your project:",
    manualText: `Copy the following files into your project:
- src/components/EVWirelessCharging/EVWirelessCharging.tsx
- src/components/EVWirelessCharging/ChargingStage.tsx
- src/components/EVWirelessCharging/evChargingModel.ts
- src/components/EVWirelessCharging/styles.css (required — drives the battery cells and button press states)
- src/lib/utils.ts (for the cn utility)

Place them in whatever folder your project uses for components — the
files just need to sit next to each other, since
EVWirelessCharging.tsx imports "./ChargingStage" and "./styles.css",
and ChargingStage.tsx imports "./evChargingModel" with relative paths.

Runtime dependencies: react / react-dom, three, @react-three/fiber, and
@react-three/drei.`,
  },
  demoUsage: {
    description:
      'The component is self-contained and uncontrolled by default. Once copied into your project, import it from wherever you placed the files above — adjust the "@/..." alias below to match your own project setup if you don\'t already have a "@" path alias configured. It has no baked-in height, so size it with an "aspect-ratio" wrapper (as the demo below does) or a parent that has an explicit height.',
    code: `import EVWirelessCharging from "@/components/EVWirelessCharging/EVWirelessCharging";

export default function Demo() {
  return (
    <EVWirelessCharging
      rangeKm={127}
      hoursRemaining={12}
      defaultBatteryLevel={32}
      defaultCharging
      onChargingChange={(charging) => console.log(charging)}
    />
  );
}`,
  },
  exampleUsage: {
    code: evWirelessChargingDemoSource,
    preview: <EVWirelessChargingDemo />,
    previewMinHeight: "min-h-[480px]",
  },
  propGroups: [
    {
      heading: "EVWirelessCharging",
      rows: [
        {
          name: "title",
          type: "string",
          defaultVal: '"Wireless Charging"',
          description: "Header title.",
        },
        {
          name: "hoursRemaining",
          type: "number",
          defaultVal: "12",
          description: "Hours until the pack reaches full charge, used for the default subtitle text.",
        },
        {
          name: "remainingLabel",
          type: "string",
          description: 'Override for the subtitle under the title (defaults to "{hoursRemaining} hrs remaining").',
        },
        {
          name: "rangeKm",
          type: "number",
          defaultVal: "127",
          description: "Estimated driving range, shown as the large central number.",
        },
        {
          name: "rangeUnit",
          type: "string",
          defaultVal: '"km"',
          description: "Unit label next to the range value.",
        },
        {
          name: "batteryLevel",
          type: "number",
          description: "Current battery level, 0-100. Controlled — pass this to drive the gauge from live telemetry.",
        },
        {
          name: "defaultBatteryLevel",
          type: "number",
          defaultVal: "32",
          description: "Starting battery level when uncontrolled. Ticks upward while charging.",
        },
        {
          name: "cellCount",
          type: "number",
          defaultVal: "16",
          description: "Number of segmented cells in the battery pack readout.",
        },
        {
          name: "charging",
          type: "boolean",
          description: "Whether charging is active. Controlled — pass this with onChargingChange to own the state.",
        },
        {
          name: "defaultCharging",
          type: "boolean",
          defaultVal: "true",
          description: "Initial charging state when uncontrolled.",
        },
        {
          name: "onChargingChange",
          type: "(charging: boolean) => void",
          description: "Called whenever the Start/Stop Charging button is pressed.",
        },
        {
          name: "stopLabel",
          type: "string",
          defaultVal: '"Stop Charging"',
          description: "Button label while charging is active.",
        },
        {
          name: "startLabel",
          type: "string",
          defaultVal: '"Start Charging"',
          description: "Button label while charging is inactive.",
        },
        {
          name: "paintColor",
          type: "string",
          defaultVal: '"#3b444c"',
          description: "Body paint color for the 3D vehicle, any CSS hex color.",
        },
        {
          name: "sound",
          type: "boolean",
          defaultVal: "true",
          description: "Enable the procedural button-press click sound.",
        },
        {
          name: "haptics",
          type: "boolean",
          defaultVal: "true",
          description: "Enable haptic feedback (vibration) on press, where supported.",
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
      Fluid, not viewport-hardcoded: text and layout use <code>cqw</code>
      -based container queries against the component&apos;s own box, and the
      root fills its parent with no baked-in height — size it with an{" "}
      <code>aspect-ratio</code> wrapper (the demo above uses{" "}
      <code>aspect-[4/3]</code>, matching the reference composition) or a
      parent with an explicit height, the same way <code>MusicPlayer3D</code>{" "}
      and <code>VehicleControlSurface</code> are sized in this library.
    </>
  ),
  source: {
    title: "EVWirelessCharging.tsx",
    intro: "The full implementation of the EV Wireless Charging component, its 3D stage, and the procedural vehicle geometry builder.",
    code: `${evWirelessChargingSource}

// ---------------------------------------------------------------------------
// src/components/EVWirelessCharging/ChargingStage.tsx
// ---------------------------------------------------------------------------

${chargingStageSource}

// ---------------------------------------------------------------------------
// src/components/EVWirelessCharging/evChargingModel.ts
// ---------------------------------------------------------------------------

${evChargingModelSource}`,
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

export const savingsChallengeCardDoc: ComponentDoc = {
  slug: "savings-challenge-card",
  name: "Savings Challenge Card",
  filePath: "src/components/SavingsChallengeCard/SavingsChallengeCard.tsx",
  description: (
    <>
      A group savings goal rendered as a moulded object — a top-lit shell, a
      recessed dot-matrix amount readout, and a milestone curve that fills as
      the pot grows, with an avatar roster and a single accent-filled deposit
      button.
    </>
  ),
  secondaryNote: (
    <>
      Built on the same material recipe as{" "}
      <code>ReceiptPrinter</code>: a top-lit gradient shell over a tiled
      plastic-noise texture, flat recessed cavities for the readout and
      roster drawer, and circular &quot;well&quot; controls. The amount and
      remaining figures render through <code>DotMatrix</code>, a small
      bundled SVG dot-matrix renderer (in <code>dot-matrix.tsx</code>) rather
      than a font. The card is controlled and fires{" "}
      <code>onDeposit</code> / <code>onToggleRoster</code> — it renders no
      deposit UI of its own, so the demo below wires its own bottom sheet.
    </>
  ),
  install: {
    cliIntro: "Install the required dependencies:",
    cliCommands: npmAdd("@phosphor-icons/react motion tailwind-merge clsx"),
    manualIntro: "Add the required dependencies and copy the source files into your project:",
    manualText: `Copy the following files into your project:
- src/components/SavingsChallengeCard/SavingsChallengeCard.tsx
- src/components/SavingsChallengeCard/dot-matrix.tsx
- src/lib/utils.ts (for the cn utility)

You will also need the plastic-noise texture in your public directory at
/textures/plastic-noise.svg (already present if you have ReceiptPrinter).`,
  },
  demoUsage: {
    description:
      "The component is controlled: changing amount animates the readout and the progress curve. It fires onDeposit and onToggleRoster and renders no deposit UI of its own — open your own sheet/modal in onDeposit, as the demo below does.",
    code: `import { SavingsChallengeCard } from "@/components/SavingsChallengeCard";

export default function Demo() {
  return (
    <SavingsChallengeCard
      title="Bitcoin BTC"
      duration="2 months challenge"
      amount={55320}
      goal={68120}
      participants={[
        { name: "Mara Vos", amount: 21400, tint: "#d8ec4a" },
        { name: "Idris Kane", amount: 18960, tint: "#8fb8e8" },
        { name: "Lena Ohm", amount: 14960, tint: "#e0a96d" },
      ]}
      onDeposit={() => {
        /* open your own deposit sheet/modal */
      }}
    />
  );
}`,
  },
  exampleUsage: {
    code: savingsChallengeCardDemoSource,
    preview: <SavingsChallengeCardDemo />,
    previewMinHeight: "min-h-[600px]",
  },
  propGroups: [
    {
      heading: "SavingsChallengeCard",
      rows: [
        {
          name: "title",
          type: "string",
          defaultVal: '"Bitcoin BTC"',
          description: "Asset / challenge name, centred in the header.",
        },
        {
          name: "duration",
          type: "string",
          defaultVal: '"2 months challenge"',
          description: "Sub-line under the title.",
        },
        {
          name: "amount",
          type: "number",
          defaultVal: "55320",
          description: "Saved so far. Controlled: changing it counts the readout up and redraws the curve.",
        },
        {
          name: "goal",
          type: "number",
          defaultVal: "68120",
          description: "Target amount. Drives the remaining figure and, unless progress is set, the curve.",
        },
        {
          name: "progress",
          type: "number",
          description: "0-1 override for progress, for when it is not a simple amount/goal ratio.",
        },
        {
          name: "currency",
          type: "string",
          defaultVal: '"USD"',
          description: "ISO 4217 currency code, formatted via Intl.NumberFormat.",
        },
        {
          name: "locale",
          type: "string",
          defaultVal: '"en-US"',
          description: "BCP 47 locale tag. Governs grouping, symbol position and the compact suffix.",
        },
        {
          name: "accent",
          type: "string",
          defaultVal: '"#d8ec4a"',
          description: "Single accent used for the curve, milestone nodes, the primary button and focus rings.",
        },
        {
          name: "loading",
          type: "boolean",
          defaultVal: "false",
          description: "Skeleton state: dots stay unlit and breathe, accent and labels are suppressed.",
        },
        {
          name: "participants",
          type: "SavingsChallengeParticipant[]",
          defaultVal: "[]",
          description: '{ name, src?, initials?, amount?, tint? }. First two render as avatars in the pill; the rest roll into a "+n" count. Empty shows the invite state.',
        },
        {
          name: "totalLabel",
          type: "string",
          defaultVal: '"Total Amount"',
          description: "Caption under the amount readout.",
        },
        {
          name: "remainingLabel",
          type: "string",
          defaultVal: '"Left to reach the goal"',
          description: "Caption above the remaining figure.",
        },
        {
          name: "emptyLabel",
          type: "string",
          defaultVal: '"No one yet"',
          description: "Shown in the pill when participants is empty.",
        },
        {
          name: "depositLabel",
          type: "string",
          defaultVal: '"Add to this challenge"',
          description: "Accessible label for the primary button.",
        },
        {
          name: "onDeposit",
          type: "() => void",
          description: "Fired by the primary button. The card renders no deposit UI of its own — open your own sheet/modal here.",
        },
        {
          name: "onToggleRoster",
          type: "(open: boolean) => void",
          description: "Fired when the contributor drawer opens or closes.",
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
      Sized by <code>max-w-sm</code> and scales down cleanly via CSS{" "}
      <code>clamp()</code>/<code>cqw</code> units on the readouts and the
      deposit button — the card never overflows or scrolls horizontally.
      Motion (count-up, progress arc, roster drawer) respects{" "}
      <code>prefers-reduced-motion</code>.
    </>
  ),
  source: {
    title: "SavingsChallengeCard.tsx",
    intro: "The card component, plus the DotMatrix readout renderer it uses for the amount and remaining figures.",
    code: `${savingsChallengeCardSource}
// ---------------------------------------------------------------------------
// src/components/SavingsChallengeCard/dot-matrix.tsx
// ---------------------------------------------------------------------------

${savingsChallengeCardDotMatrixSource}`,
  },
};
