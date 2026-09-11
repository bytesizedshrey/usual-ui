"use client";

import { useState } from "react";
import VehicleControlSurface, {
  type VehicleModelOption,
} from "@/components/VehicleControlSurface/VehicleControlSurface";

const MODELS: VehicleModelOption[] = [
  { id: "vega-ex", name: "Vega EX", tag: "Home" },
  { id: "vega-lr", name: "Vega LR", tag: "Shared" },
  { id: "halden-4", name: "Halden 4", tag: "Work" },
];

export function VehicleControlSurfaceDemo() {
  const [vehicle, setVehicle] = useState(MODELS[0]);

  return (
    <div className="flex w-full items-center justify-center">
      <VehicleControlSurface
        className="aspect-[3/5] w-full max-w-[420px]"
        vehicleName={vehicle.name}
        models={MODELS}
        onVehicleChange={setVehicle}
        defaultBatteryLevel={82}
        chargeLimitPercent={90}
        packTempC={24}
      />
    </div>
  );
}

export default VehicleControlSurfaceDemo;
