import React, { useState } from 'react';
import { LiveTelemetry } from '../../types';

export type DeviceMode = 'ios' | 'android' | 'fullscreen';

interface DeviceFrameProps {
  children: React.ReactNode;
  telemetry: LiveTelemetry;
  onNavigateToCharging?: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  telemetry,
  onNavigateToCharging,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('ios');

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      {/* Device Mode Switcher Floating Bar (Desktop / Tablet) */}
      <aside aria-label="Simulador de plataforma" className="hidden sm:flex items-center gap-2 mb-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-xl z-50">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">devices</span>
          Plataforma:
        </span>

        {/* iOS toggle */}
        <button
          onClick={() => setDeviceMode('ios')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            deviceMode === 'ios'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">phone_iphone</span>
          iOS (iPhone 16 Pro)
        </button>

        {/* Android toggle */}
        <button
          onClick={() => setDeviceMode('android')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            deviceMode === 'android'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">phone_android</span>
          Android (Pixel 9)
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={() => setDeviceMode('fullscreen')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            deviceMode === 'fullscreen'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">fullscreen</span>
          Pantalla Completa
        </button>
      </aside>

      {/* Main Container Shell */}
      <div
        className={`relative w-full transition-all duration-300 bg-white flex flex-col overflow-hidden ${
          deviceMode === 'fullscreen'
            ? 'h-screen max-w-full rounded-none'
            : deviceMode === 'ios'
            ? 'max-w-[400px] h-[852px] rounded-[48px] border-[10px] border-slate-900 ring-1 ring-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
            : 'max-w-[412px] h-[860px] rounded-[36px] border-[8px] border-slate-850 ring-1 ring-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
        }`}
      >
        {/* iOS Dynamic Island & Status Bar */}
        {deviceMode === 'ios' && (
          <div className="sticky top-0 left-0 right-0 z-50 bg-white pt-2 px-7 pb-1 flex justify-between items-center select-none">
            {/* Clock */}
            <span className="text-[14px] font-semibold tracking-tight text-slate-900 font-mono">
              9:41
            </span>

            {/* Dynamic Island HUD Pill */}
            <div
              onClick={onNavigateToCharging}
              className="absolute left-1/2 -translate-x-1/2 top-2 h-[28px] px-3.5 bg-black rounded-full flex items-center justify-between gap-2.5 cursor-pointer hover:scale-105 transition-transform shadow-md"
              title="Dynamic Island: Monitoreo ExceCharge"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-medium text-white/90">Viva Envigado</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="material-symbols-outlined text-[13px] material-symbols-fill">bolt</span>
                <span className="text-[11px] font-bold font-mono">{telemetry.socPercent}%</span>
              </div>
            </div>

            {/* Cellular, WiFi, Battery Status */}
            <div className="flex items-center gap-1.5 text-slate-900">
              <span className="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[15px]">wifi</span>
              <div className="w-5 h-2.5 border border-slate-900 rounded-xs p-0.5 flex items-center">
                <div className="h-full bg-slate-900 rounded-2xs w-4"></div>
              </div>
            </div>
          </div>
        )}

        {/* Android Status Bar & Punch Hole Camera */}
        {deviceMode === 'android' && (
          <div className="sticky top-0 left-0 right-0 z-50 bg-white pt-1.5 px-6 pb-1 flex justify-between items-center select-none border-b border-slate-100">
            <span className="text-[13px] font-medium text-slate-800 font-mono">16:24</span>

            {/* Camera Punch Hole */}
            <div className="w-3.5 h-3.5 bg-slate-950 rounded-full border border-slate-800 shadow-inner"></div>

            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1 rounded">5G</span>
              <span className="material-symbols-outlined text-[15px]">wifi</span>
              <span className="material-symbols-outlined text-[15px]">battery_charging_90</span>
            </div>
          </div>
        )}

        {/* Application Content Canvas */}
        <div className="flex-1 w-full h-full relative overflow-y-auto overflow-x-hidden flex flex-col bg-[#faf8ff]">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        {deviceMode === 'ios' && (
          <div className="sticky bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xs py-1.5 flex justify-center pointer-events-none select-none">
            <div className="w-32 h-1 bg-slate-400/80 rounded-full"></div>
          </div>
        )}

        {/* Android Gesture Bar */}
        {deviceMode === 'android' && (
          <div className="sticky bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xs py-1 flex justify-center pointer-events-none select-none">
            <div className="w-20 h-1 bg-slate-400/60 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
