import React, { useState } from 'react';
import { Vehicle, LiveTelemetry } from '../../types';
import { playNotificationChime, sendBrowserPushNotification } from '../../utils/notifications';

interface ChargingScreenProps {
  vehicle: Vehicle;
  telemetry: LiveTelemetry;
  onUpdateTelemetry: (newTelemetry: Partial<LiveTelemetry>) => void;
  onFinishSession: () => void;
  onNavigateToExplore: () => void;
}

export const ChargingScreen: React.FC<ChargingScreenProps> = ({
  vehicle,
  telemetry,
  onUpdateTelemetry,
  onFinishSession,
  onNavigateToExplore,
}) => {
  const [showAdjustLimitModal, setShowAdjustLimitModal] = useState(false);
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(telemetry.targetPercent);

  // SVG Gauge Calculations
  const radius = 41;
  const circumference = 2 * Math.PI * radius; // ~257.61
  const strokeDashoffset = circumference - (telemetry.socPercent / 100) * circumference;
  const targetDashoffset = circumference - (telemetry.targetPercent / 100) * circumference;

  const handleSaveTarget = () => {
    // Recalculate estimated minutes based on difference
    const diffPercent = Math.max(0, tempTarget - telemetry.socPercent);
    const newRemainingMinutes = Math.round(diffPercent * 1.05);
    
    // Calculate new estimated end time
    const now = new Date();
    now.setMinutes(now.getMinutes() + newRemainingMinutes);
    const endHour = String(now.getHours()).padStart(2, '0');
    const endMin = String(now.getMinutes()).padStart(2, '0');

    onUpdateTelemetry({
      targetPercent: tempTarget,
      remainingMinutes: newRemainingMinutes,
      estimatedEndTime: `${endHour}:${endMin}`,
    });

    setShowAdjustLimitModal(false);
    playNotificationChime('charge');
    sendBrowserPushNotification(
      'Límite de Carga Actualizado',
      `Nuevo límite establecido en ${tempTarget}%. Hora estimada de finalización: ${endHour}:${endMin}.`
    );
  };

  const handleConfirmStop = () => {
    setShowStopConfirmModal(false);
    playNotificationChime('success');
    sendBrowserPushNotification(
      'Sesión de Carga Finalizada',
      `Se han despachado ${telemetry.energyKwh} kWh por un valor total de $${telemetry.costCop.toLocaleString()} COP en Viva Envigado.`
    );
    onFinishSession();
  };

  return (
    <div className="w-full flex-1 px-4 pt-3 pb-8 space-y-4 bg-[#faf8ff] overflow-y-auto">
      {/* Station & Vehicle Context Bar (Bento Header) */}
      <section className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined material-symbols-fill text-[24px]">ev_station</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">Viva Envigado</h2>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                Puesto 01
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <span className="font-medium text-slate-800">{vehicle.name}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[10px] tracking-wider bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                {vehicle.plate}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
            CCS2 DC
          </span>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">120 kW Máx</p>
        </div>
      </section>

      {/* Primary Battery SoC Gauge (Circular Radial HUD) */}
      <section className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
        {/* Radial Gauge Container */}
        <div className="relative w-56 h-56 flex items-center justify-center my-1">
          {/* Circular SVG Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="#eaedff"
              strokeWidth="7"
            />
            {/* Active Fill Progress */}
            <circle
              className="transition-all duration-1000 ease-out"
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="#10b981"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="7"
            />
            {/* Target Ring Marker */}
            <circle
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="#00422b"
              strokeDasharray={`1.5 ${circumference - 1.5}`}
              strokeDashoffset={targetDashoffset}
              strokeWidth="7"
            />
          </svg>

          {/* Metric Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-emerald-600 mb-0.5">
              <span className="material-symbols-outlined text-[18px] material-symbols-fill">bolt</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Nivel Actual</span>
            </div>
            <div className="flex items-baseline justify-center">
              <span className="text-[3.25rem] leading-none text-slate-900 font-extrabold tracking-tight font-mono">
                {telemetry.socPercent}
              </span>
              <span className="text-2xl text-emerald-600 font-bold -ml-0.5">%</span>
            </div>
            {/* ETA Pill */}
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">schedule</span>
              <span>{telemetry.remainingMinutes} min restantes</span>
            </div>
          </div>
        </div>

        {/* Target and Estimate Metadata */}
        <div className="w-full pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-center px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
            <span className="text-xs text-slate-500">
              Límite: <strong className="text-slate-900 font-semibold">{telemetry.targetPercent}%</strong>
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="text-xs text-slate-500">
            Meta estimada: <strong className="text-slate-900 font-semibold">{telemetry.estimatedEndTime}</strong>
          </div>
        </div>
      </section>

      {/* Operative Telemetry Bento Grid (4 Cards) */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* Potencia Actual */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">Potencia</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">electric_meter</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl text-slate-900 font-bold font-mono">{telemetry.powerKw}</span>
              <span className="text-xs font-medium text-slate-500">kW</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">95% de capacidad</p>
          </div>
        </div>

        {/* Energía Despachada */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">Energía</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">battery_charging_full</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl text-slate-900 font-bold font-mono">{telemetry.energyKwh}</span>
              <span className="text-xs font-medium text-slate-500">kWh</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">+8.2 kWh restantes</p>
          </div>
        </div>

        {/* Costo Devengado COP */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">Costo Total</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">payments</span>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-lg sm:text-xl text-slate-900 font-extrabold font-mono">
                ${telemetry.costCop.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 ml-1 font-semibold">COP</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">$1.450 / kWh</p>
          </div>
        </div>

        {/* Flujo Eléctrico */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">Corriente & Tensión</span>
            <span className="material-symbols-outlined text-[18px] text-slate-500">tune</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg text-slate-900 font-bold font-mono">
                {telemetry.currentAmps} <span className="text-[10px] font-normal text-slate-500">A</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-base sm:text-lg text-slate-900 font-bold font-mono">
                {telemetry.voltageVolts} <span className="text-[10px] font-normal text-slate-500">V</span>
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Suministro Estable</p>
          </div>
        </div>
      </section>

      {/* Real-Time Charge Power Curve (Chart Panel) */}
      <section className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Curva de Suministro</h3>
            <p className="text-[10px] text-slate-500">{telemetry.elapsedMinutes} min transcurridos en sesión</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {telemetry.powerKw} kW
          </span>
        </div>

        {/* SVG Line Chart Visualizing Charging Curve Profile */}
        <div className="w-full h-24 pt-1 relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 80">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line stroke="#eaedff" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="320" y1="15" y2="15" />
            <line stroke="#eaedff" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="320" y1="45" y2="45" />
            <line stroke="#e2e7ff" strokeWidth="1" x1="0" x2="320" y1="75" y2="75" />

            {/* Area Fill */}
            <path
              d="M 0,75 C 25,65 40,28 70,22 C 110,16 160,18 200,18 C 240,18 280,24 320,28 L 320,75 L 0,75 Z"
              fill="url(#chartGradient)"
            />
            {/* Dynamic Stroke */}
            <path
              d="M 0,75 C 25,65 40,28 70,22 C 110,16 160,18 200,18 C 240,18 280,24 320,28"
              fill="none"
              stroke="#10b981"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            {/* Current Position Indicator Dot */}
            <circle cx="320" cy="28" fill="#006c49" r="4.5" stroke="#ffffff" strokeWidth="2" />
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100">
          <span>0 min (Inicio)</span>
          <span>10 min (Pico 118 kW)</span>
          <span>{telemetry.elapsedMinutes} min (Actual)</span>
        </div>
      </section>

      {/* Charge Action Controls */}
      <section className="space-y-2.5 pt-1">
        {/* Secondary Adjust Limit Button */}
        <button
          onClick={() => {
            setTempTarget(telemetry.targetPercent);
            setShowAdjustLimitModal(true);
          }}
          className="w-full h-12 bg-white border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-slate-600">tune</span>
          Ajustar límite de carga
        </button>

        {/* Stop Charging Session Button */}
        <button
          onClick={() => setShowStopConfirmModal(true)}
          className="w-full h-12 bg-red-50 border border-red-200 text-red-700 font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 active:scale-95 transition-all shadow-xs"
          type="button"
        >
          <span className="material-symbols-outlined material-symbols-fill text-[20px]">stop_circle</span>
          Finalizar Sesión de Carga
        </button>
      </section>

      {/* Adjust Target Limit Modal */}
      {showAdjustLimitModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Ajustar Límite de Carga</h3>
              <button
                onClick={() => setShowAdjustLimitModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Ajustar el límite protege la degradación química de la batería LFP/NMC y optimiza tu tiempo.
            </p>

            <div className="py-2 text-center">
              <span className="text-4xl font-extrabold text-slate-900 font-mono">{tempTarget}%</span>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                {tempTarget <= 80 ? 'Recomendado para uso diario' : tempTarget <= 95 ? 'Óptimo para viajes largos' : 'Carga máxima completa'}
              </p>
            </div>

            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={tempTarget}
              onChange={(e) => setTempTarget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>50%</span>
              <span>80% (Diario)</span>
              <span>95%</span>
              <span>100%</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAdjustLimitModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTarget}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 shadow-xs"
              >
                Guardar Límite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Charging Confirmation Modal */}
      {showStopConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">power_off</span>
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">¿Deseas finalizar la recarga?</h3>
              <p className="text-xs text-slate-500 mt-1">
                La potencia se interrumpirá de forma segura y se generará tu factura electrónica en Bancolombia / PSE.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Energía suministrada:</span>
                <span className="font-bold text-slate-800">{telemetry.energyKwh} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total liquidado:</span>
                <span className="font-bold text-slate-800 font-mono">${telemetry.costCop.toLocaleString()} COP</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowStopConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Continuar cargando
              </button>
              <button
                onClick={handleConfirmStop}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-xs"
              >
                Detener Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
