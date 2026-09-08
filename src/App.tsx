import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ReceiptPrinterSource from "./pages/ReceiptPrinterSource";
import MusicPlayer3DSource from "./pages/MusicPlayer3DSource";
import NavigationMapSource from "./pages/NavigationMapSource";


function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route
        element={<ReceiptPrinterSource />}
        path="/components/receipt-printer"
      />
      <Route
        element={<MusicPlayer3DSource />}
        path="/components/music-player-3d"
      />
      <Route
        element={<NavigationMapSource />}
        path="/components/navigation-map"
      />
    </Routes>
  );
}

export default App;
