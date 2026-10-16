import React from 'react';
import { Reservation } from '../../types';

interface ReservationsListScreenProps {
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
  onExploreStations: () => void;
}

export const ReservationsListScreen: React.FC<ReservationsListScreenProps> = ({
  reservations,
  onSelectReservation,
  onExploreStations,
}) => {
  return (
    <div className="w-full flex-1 px-4 py-4 space-y-4 bg-[#faf8ff] overflow-y-auto pb-24">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mis Reservas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tickets digitales y reservas activas en Medellín</p>
        </div>
        <button
          onClick={onExploreStations}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nueva
        </button>
      </div>

      {/* Active Reservations */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Reserva Activa</h2>
        {reservations.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-slate-300">calendar_today</span>
            <p className="text-sm font-semibold text-slate-700">No tienes reservas activas</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Reserva un conector ultrarrápido con anticipación para asegurar tu recarga sin filas.
            </p>
            <button
              onClick={onExploreStations}
              className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
            >
              Explorar Estaciones
            </button>
          </div>
        ) : (
          reservations.map((res) => (
            <div
              key={res.id}
              onClick={() => onSelectReservation(res)}
              className="bg-white rounded-2xl border-2 border-emerald-500/80 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {res.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                      ● ACTIVA
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1.5">{res.stationName}</h3>
                  <p className="text-xs text-slate-500">{res.stationAddress}</p>
                </div>
                <span className="material-symbols-outlined text-emerald-600 text-2xl">qr_code_2</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Horario</span>
                  <span className="font-bold text-slate-800 font-mono">{res.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Bahía / Puerto</span>
                  <span className="font-bold text-slate-800">{res.connectorName}</span>
                </div>
              </div>

              <div className="mt-3 bg-red-50 text-red-700 p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span>Ventana de llegada: Antes de las {res.arrivalDeadline} (10 min tolerancia)</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historial de Cargas Pasadas */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Historial Reciente</h2>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400">18 Oct, 2024 · 14:15</span>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Santafé Poblado · Puesto A</h4>
              <p className="text-[11px] text-slate-500">BYD Yuan Plus (EVK-892) · 28.4 kWh despachados</p>
            </div>
            <span className="text-xs font-bold text-slate-900 font-mono">$39.190 COP</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
            <span className="material-symbols-outlined text-[14px]">eco</span>
            <span>Ahorro estimado vs gasolina: $62.000 COP</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400">12 Oct, 2024 · 09:30</span>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Arkadia Guayabal · Puesto Ultra 1</h4>
              <p className="text-[11px] text-slate-500">BYD Yuan Plus (EVK-892) · 35.1 kWh despachados</p>
            </div>
            <span className="text-xs font-bold text-slate-900 font-mono">$52.290 COP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
