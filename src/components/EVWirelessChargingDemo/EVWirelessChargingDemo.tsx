"use client";

import EVWirelessCharging from "@/components/EVWirelessCharging/EVWirelessCharging";

export function EVWirelessChargingDemo() {
  return (
    <div className="flex w-full items-center justify-center">
      <EVWirelessCharging
        className="aspect-[4/3] w-full max-w-[640px]"
        title="Wireless Charging"
        hoursRemaining={12}
        rangeKm={127}
        defaultBatteryLevel={32}
        defaultCharging
      />
    </div>
  );
}

export default EVWirelessChargingDemo;
