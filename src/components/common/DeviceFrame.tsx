import React from 'react';
import { LiveTelemetry } from '../../types';

interface DeviceFrameProps {
  children: React.ReactNode;
  telemetry: LiveTelemetry;
  onNavigateToCharging?: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-[100dvh] bg-slate-100 flex justify-center overflow-hidden">
      {/* 
        Clean Edge-to-Edge Responsive Mobile Shell:
        - Mobile devices: 100% full viewport edge-to-edge, zero double bezels or fake status bars.
        - Desktop / wide monitors: Sleek centered smartphone layout (max-w-[430px]) with subtle border.
      */}
      <main className="w-full sm:max-w-[430px] h-full bg-white flex flex-col relative overflow-hidden shadow-none sm:shadow-2xl sm:border-x sm:border-slate-200">
        <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col bg-white">
          {children}
        </div>
      </main>
    </div>
  );
};
