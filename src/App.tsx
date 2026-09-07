import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ReceiptPrinterSource from "./pages/ReceiptPrinterSource";
import MusicPlayerSource from "./pages/MusicPlayerSource";

function App() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route
        element={<ReceiptPrinterSource />}
        path="/components/receipt-printer"
      />
      <Route
        element={<MusicPlayerSource />}
        path="/components/music-player"
      />
    </Routes>
  );
}

export default App;
