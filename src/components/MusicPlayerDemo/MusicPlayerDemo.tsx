import { MusicPlayer, type MusicTrack } from "@/components/ui/music-player";

function artwork(label: string, from: string, to: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect width='160' height='160' rx='28' fill='url(#g)'/><text x='50%' y='58%' font-family='sans-serif' font-size='64' font-weight='700' fill='white' text-anchor='middle'>${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const tracks: MusicTrack[] = [
  {
    title: "Night Drive",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    artwork: artwork("N", "#34d399", "#059669"),
  },
  {
    title: "Low Orbit",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    artwork: artwork("L", "#818cf8", "#4338ca"),
  },
  {
    title: "Afterglow",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    artwork: artwork("A", "#f472b6", "#be185d"),
  },
];

function MusicPlayerDemo() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="[zoom:0.62]">
        <MusicPlayer accentColor="#34d399" tracks={tracks} />
      </div>
    </div>
  );
}

export default MusicPlayerDemo;
