import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ReceiptPrinterSource from "./pages/ReceiptPrinterSource";
import MusicPlayer3DSource from "./pages/MusicPlayer3DSource";
import NavigationMapSource from "./pages/NavigationMapSource";
import VintageKeyboardSource from "./pages/VintageKeyboardSource";
import SketchbookSource from "./pages/SketchbookSource";
import SavingsChallengeCardSource from "./pages/SavingsChallengeCardSource";
import ClimateControlPanelSource from "./pages/ClimateControlPanelSource";
import VehicleControlSurfaceSource from "./pages/VehicleControlSurfaceSource";
import EVWirelessChargingSource from "./pages/EVWirelessChargingSource";


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
      <Route
        element={<VintageKeyboardSource />}
        path="/components/vintage-keyboard"
      />
      <Route
        element={<SketchbookSource />}
        path="/components/sketchbook"
      />
      <Route
        element={<SavingsChallengeCardSource />}
        path="/components/savings-challenge-card"
      />
      <Route
        element={<ClimateControlPanelSource />}
        path="/components/climate-control-panel"
      />
      <Route
        element={<VehicleControlSurfaceSource />}
        path="/components/vehicle-control-surface"
      />
      <Route
        element={<EVWirelessChargingSource />}
        path="/components/ev-wireless-charging"
      />
    </Routes>
  );
}

export default App;
