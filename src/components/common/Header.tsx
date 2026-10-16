import React from 'react';
import { Vehicle, LiveTelemetry } from '../../types';
import { ExceChargeLogo } from './ExceChargeLogo';

interface HeaderProps {
  currentScreen: 'explorar' | 'reservas' | 'carga' | 'perfil';
  vehicle: Vehicle;
  telemetry: LiveTelemetry;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenVehicleModal: () => void;
  onOpenTelemetryInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  vehicle,
  telemetry,
  unreadCount,
  onOpenNotifications,
  onOpenVehicleModal,
  onOpenTelemetryInfo,
}) => {
  if (currentScreen === 'carga') {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-xs border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExceChargeLogo size="sm" withTagline={false} />
        </div>
        {/* Live Charge State Pill */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
              {telemetry.isCharging ? 'CARGANDO' : 'PAUSADO'}
            </span>
          </div>
          <button
            onClick={onOpenTelemetryInfo}
            aria-label="Información de la sesión"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">info</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 left-0 w-full z-40 flex justify-between items-center h-14 px-4 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100">
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenVehicleModal}
          aria-label="Abrir Menú"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-transform duration-150"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <div className="flex items-center">
          <ExceChargeLogo size="md" />
        </div>
      </div>

      {/* Vehicle Battery HUD Tag & Trailing Notification Icon */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenVehicleModal}
          className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full px-2.5 py-1 space-x-1.5 shadow-xs transition-colors"
          type="button"
          title="Ver especificaciones de batería"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-semibold text-slate-800">
            {vehicle.name} • {vehicle.currentBatteryPercent}%
          </span>
        </button>

        <button
          onClick={onOpenNotifications}
          aria-label="Notificaciones"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-transform duration-150"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
          )}
        </button>
      </div>
    </header>
  );
};
