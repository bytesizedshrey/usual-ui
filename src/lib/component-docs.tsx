import type { ReactNode } from "react";
import musicPlayerSource from "@/components/ui/music-player.tsx?raw";
import musicPlayerDemoSource from "@/components/MusicPlayerDemo/MusicPlayerDemo.tsx?raw";
import MusicPlayerDemo from "@/components/MusicPlayerDemo/MusicPlayerDemo";
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
    cliIntro: string;
    cliCommands: Record<PackageManager, string>;
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

function shadcnAdd(registryUrl: string): Record<PackageManager, string> {
  return {
    npm: `npx shadcn@latest add ${registryUrl}`,
    pnpm: `pnpm dlx shadcn@latest add ${registryUrl}`,
    yarn: `yarn dlx shadcn@latest add ${registryUrl}`,
    bun: `bunx --bun shadcn@latest add ${registryUrl}`,
  };
}

export const musicPlayerDoc: ComponentDoc = {
  slug: "music-player",
  name: "Music Player",
  filePath: "src/components/ui/music-player.tsx",
  description: (
    <>
      A collapsible, glassmorphic music player. A floating avatar peeks out
      of the top-left, an animated equalizer pulses while audio plays, and
      a slim seekable progress bar tracks position. The whole bar collapses
      to a compact pill, hiding the track info and transport controls
      behind a soft width transition.
    </>
  ),
  secondaryNote: (
    <>
      Ported from the vanilla &ldquo;Azuki Style Music Player&rdquo; (CodeGrid) by{" "}
      <a
        className="underline decoration-white/30 underline-offset-2 hover:text-white/80 hover:decoration-white/60"
        href="https://www.vengenceui.com/components/music-player"
        rel="noreferrer"
        target="_blank"
      >
        VengeanceUI
      </a>
      . Installed via the shadcn CLI, unmodified.
    </>
  ),
  install: {
    cliIntro: "Install directly from the VengeanceUI registry:",
    cliCommands: shadcnAdd(
      "https://raw.githubusercontent.com/Ashutoshx7/VengeanceUI/main/public/r/music-player.json",
    ),
    manualIntro: "Add the dependency and copy the source file into your project:",
    manualText: `Copy the following file into your project:
- src/components/ui/music-player.tsx
- src/lib/utils.ts (for the cn utility)

Dependencies: lucide-react`,
  },
  demoUsage: {
    description:
      "The component is a single, self-contained, prop-driven player. Pass a playlist and it handles playback, sequencing, and seeking.",
    code: `import { MusicPlayer } from "@/components/ui/music-player";

export default function Demo() {
  return (
    <MusicPlayer
      tracks={[
        {
          title: "Night Drive",
          artist: "SoundHelix",
          src: "/audio/night-drive.mp3",
          artwork: "/images/night-drive.jpg",
        },
      ]}
      accentColor="#34d399"
    />
  );
}`,
  },
  exampleUsage: {
    code: musicPlayerDemoSource,
    preview: <MusicPlayerDemo />,
    previewMinHeight: "min-h-[280px]",
  },
  propGroups: [
    {
      heading: "MusicPlayer",
      rows: [
        {
          name: "tracks",
          type: "MusicTrack[]",
          description: "Playlist to play through. The player renders nothing when empty.",
        },
        {
          name: "avatar",
          type: "string",
          description: "Floating avatar image. Falls back to the current track's artwork.",
        },
        {
          name: "startIndex",
          type: "number",
          defaultVal: "0",
          description: "Index of the track to start on.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          defaultVal: "false",
          description: "Begin playing as soon as the player mounts.",
        },
        {
          name: "loop",
          type: "boolean",
          defaultVal: "true",
          description: "Wrap from the last track back to the first when a track ends.",
        },
        {
          name: "defaultCollapsed",
          type: "boolean",
          defaultVal: "false",
          description: "Render collapsed (compact pill) on first paint.",
        },
        {
          name: "showProgress",
          type: "boolean",
          defaultVal: "true",
          description: "Show the seekable progress bar along the bottom edge.",
        },
        {
          name: "accentColor",
          type: "string",
          defaultVal: '"currentColor"',
          description: "Accent color for the equalizer and progress fill.",
        },
        {
          name: "onTrackChange",
          type: "(track: MusicTrack, index: number) => void",
          description: "Called whenever the active track changes.",
        },
        {
          name: "className",
          type: "string",
          description: "Extra class names for the root element.",
        },
      ],
    },
    {
      heading: "MusicTrack",
      rows: [
        {
          name: "title",
          type: "string",
          description: "Track title shown in the player.",
        },
        {
          name: "artist",
          type: "string",
          description: "Artist / author name shown under the title.",
        },
        {
          name: "src",
          type: "string",
          description: "URL of the audio file. Must be same-origin or CORS-enabled to stream.",
        },
        {
          name: "artwork",
          type: "string",
          description: "Optional per-track artwork; falls back to the player avatar.",
        },
      ],
    },
  ],
  source: {
    title: "music-player.tsx",
    intro: "The full VengeanceUI implementation, installed unmodified via the shadcn CLI.",
    code: musicPlayerSource,
  },
};

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
