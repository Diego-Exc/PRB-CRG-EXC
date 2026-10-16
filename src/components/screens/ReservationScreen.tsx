import React, { useState } from 'react';
import { ChargingStation, Connector, Vehicle, Reservation } from '../../types';
import { ALTERNATE_VEHICLES } from '../../data/mockData';
import { ExceChargeLogo } from '../common/ExceChargeLogo';

interface ReservationScreenProps {
  station: ChargingStation;
  selectedConnector: Connector;
  currentVehicle: Vehicle;
  onBack: () => void;
  onConfirmReservation: (reservation: Reservation) => void;
}

export const ReservationScreen: React.FC<ReservationScreenProps> = ({
  station,
  selectedConnector: initialConnector,
  currentVehicle: initialVehicle,
  onBack,
  onConfirmReservation,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(initialVehicle);
  const [showVehiclePicker, setShowVehiclePicker] = useState<boolean>(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>(
    initialConnector ? initialConnector.id : station.connectors[0].id
  );
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'saturday'>('today');
  const [selectedSlot, setSelectedSlot] = useState<string>('16:00 - 16:45');

  // Find active connector
  const activeConnector =
    station.connectors.find((c) => c.id === selectedConnectorId) || station.connectors[0];

  // Pricing calculations
  const estimatedKwh = 22.5;
  const ratePerKwh = station.ratePerKwh;
  const totalCostCop = Math.round(estimatedKwh * ratePerKwh); // $32.625 COP

  const handleProceed = () => {
    const newReservation: Reservation = {
      id: `res-${Date.now().toString().slice(-4)}`,
      code: 'VOLT-892-MED',
      stationId: station.id,
      stationName: station.name,
      stationAddress: station.address,
      connectorId: activeConnector.id,
      connectorName: activeConnector.bay || activeConnector.name,
      connectorPower: `${activeConnector.type} • ${activeConnector.power} Ultra`,
      vehicle: selectedVehicle,
      dateLabel: selectedDate === 'today' ? 'Hoy 24 Oct, 2024' : selectedDate === 'tomorrow' ? 'Viernes 25 Oct, 2024' : 'Sábado 26 Oct, 2024',
      timeSlot: selectedSlot,
      durationMinutes: 45,
      estimatedKwh: estimatedKwh,
      ratePerKwh: ratePerKwh,
      totalEstimatedCop: totalCostCop,
      paymentMethod: 'PSE Débito / Bancolombia',
      status: 'confirmed',
      arrivalDeadline: '16:10',
      createdAt: new Date().toISOString(),
    };

    onConfirmReservation(newReservation);
  };

  return (
    <div className="w-full flex-1 min-h-screen bg-white flex flex-col relative pb-32">
      {/* Top Header Step 2 of 3 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-slate-200/50 flex flex-col gap-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            aria-label="Volver"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-transform text-slate-800"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              Reservar Carga
            </span>
            <span className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">
              PASO 2 DE 3
            </span>
          </div>
          <div className="flex items-center justify-center">
            <ExceChargeLogo iconOnly size="sm" />
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full grid grid-cols-3 gap-1.5 px-2 mt-1">
          <div className="h-1 rounded-full bg-emerald-500"></div>
          <div className="h-1 rounded-full bg-emerald-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-700 opacity-40 animate-pulse"></div>
          </div>
          <div className="h-1 rounded-full bg-slate-200"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-4 flex flex-col gap-5">
        {/* 1. Resumen Estación Seleccionada */}
        <section className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">ev_station</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-bold text-slate-900 text-sm truncate">{station.name}</h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                VERIFICADO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{station.address}</p>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200/70 text-slate-800">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">bolt</span>
                <span className="text-xs font-bold font-mono">{activeConnector.power}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-400 text-[16px]">payments</span>
                <span className="text-xs text-slate-600 font-medium font-mono">
                  ${station.ratePerKwh.toLocaleString()} COP / kWh
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Selector de Vehículo Registrado */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">directions_car</span>
              Vehículo de Carga
            </span>
            <button
              onClick={() => setShowVehiclePicker((prev) => !prev)}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
              type="button"
            >
              Cambiar
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            </button>
          </div>

          {/* Vehicle Dropdown / Picker */}
          {showVehiclePicker && (
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5 animate-in fade-in">
              <span className="text-[10px] font-semibold text-slate-500 px-2">Selecciona un vehículo de tu garaje:</span>
              {ALTERNATE_VEHICLES.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicle(v);
                    setShowVehiclePicker(false);
                  }}
                  className={`p-2.5 rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                    v.id === selectedVehicle.id ? 'bg-emerald-100 text-emerald-950 font-bold' : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs">{v.name} ({v.plate})</span>
                  <span className="text-[10px] text-slate-500">{v.currentBatteryPercent}% batería</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{selectedVehicle.name}</h2>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold tracking-wider font-mono">
                    {selectedVehicle.plate}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Puerto compatible: {selectedVehicle.compatiblePort}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 font-medium">Batería actual</span>
                <div className="flex items-center justify-end gap-1 text-emerald-600">
                  <span className="material-symbols-outlined text-[18px] material-symbols-fill">
                    battery_charging_60
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {selectedVehicle.currentBatteryPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Battery Charge Gauge Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${selectedVehicle.currentBatteryPercent}%` }}></div>
                <div
                  className="bg-emerald-300 h-full border-l border-dashed border-emerald-600"
                  style={{ width: `${Math.max(0, 95 - selectedVehicle.currentBatteryPercent)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[11px]">
                <span className="text-slate-500">Estado actual: {selectedVehicle.currentBatteryPercent}%</span>
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">add_circle</span>
                  +22 kWh para 95% (Recomendado)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Selector de Conector Físico */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">electrical_services</span>
              Selecciona el Conector
            </span>
            <span className="text-[11px] text-slate-500 font-medium">2 de 3 disponibles</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Conector 01 */}
            <label
              onClick={() => setSelectedConnectorId('conn-01')}
              className={`cursor-pointer relative flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                selectedConnectorId === 'conn-01'
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-sm ${
                  selectedConnectorId === 'conn-01' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  01
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">CCS2 DC · Ultrarrápido</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Disponible
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Potencia continua hasta 120 kW · Manguera A</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedConnectorId === 'conn-01'
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300'
              }`}>
                {selectedConnectorId === 'conn-01' && (
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                )}
              </div>
            </label>

            {/* Conector 02 */}
            <label
              onClick={() => setSelectedConnectorId('conn-02')}
              className={`cursor-pointer relative flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                selectedConnectorId === 'conn-02'
                  ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-sm ${
                  selectedConnectorId === 'conn-02' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  02
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">CCS2 DC · Ultrarrápido</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Disponible
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Potencia continua hasta 120 kW · Manguera B</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedConnectorId === 'conn-02'
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300'
              }`}>
                {selectedConnectorId === 'conn-02' && (
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                )}
              </div>
            </label>

            {/* Conector 03 (Ocupado) */}
            <div className="relative flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 bg-slate-50 opacity-60 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center">
                  03
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 line-through">Tipo 2 AC · 22 kW</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                      Ocupado
                    </span>
                  </div>
                  <p className="text-[11px] text-red-600 mt-0.5">Liberación aprox. 16:30 (En sesión)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">lock_clock</span>
            </div>
          </div>
        </section>

        {/* 4. Selector de Día y Franjas Horarias */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">calendar_month</span>
              Fecha y Franja de Carga
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">Hora local Medellín</span>
          </div>

          {/* Selector de Días Horizontal */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedDate('today')}
              className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedDate === 'today'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
              type="button"
            >
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-extrabold">Seleccionado</span>
              <span className="text-xs font-bold mt-0.5">Hoy, 24 Oct</span>
            </button>

            <button
              onClick={() => setSelectedDate('tomorrow')}
              className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedDate === 'tomorrow'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
              type="button"
            >
              <span className="text-[10px] text-slate-400 font-medium">Viernes</span>
              <span className="text-xs font-bold mt-0.5">Mañana, 25</span>
            </button>

            <button
              onClick={() => setSelectedDate('saturday')}
              className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedDate === 'saturday'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
              type="button"
            >
              <span className="text-[10px] text-slate-400 font-medium">Sábado</span>
              <span className="text-xs font-bold mt-0.5">Sáb, 26 Oct</span>
            </button>
          </div>

          {/* Grid de Franjas Horarias */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            {/* Franja 1: Ocupada */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">block</span>
                <span className="text-xs font-medium text-slate-500 line-through">15:30 - 16:00</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Ocupado</span>
            </div>

            {/* Franja 2: Recomendada y Seleccionada */}
            <button
              onClick={() => setSelectedSlot('16:00 - 16:45')}
              className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                selectedSlot === '16:00 - 16:45'
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  selectedSlot === '16:00 - 16:45' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                }`}>
                  {selectedSlot === '16:00 - 16:45' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">16:00 - 16:45</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                      ★ RECOMENDADO
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">45 min óptimos (+22.5 kWh para 95%)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">Óptimo</span>
              </div>
            </button>

            {/* Franja 3 */}
            <button
              onClick={() => setSelectedSlot('17:00 - 17:45')}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                selectedSlot === '17:00 - 17:45'
                  ? 'border-2 border-emerald-500 bg-emerald-50/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedSlot === '17:00 - 17:45' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                }`}>
                  {selectedSlot === '17:00 - 17:45' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <span className="text-xs font-semibold text-slate-800 font-mono">17:00 - 17:45</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">Disponible (45 min)</span>
            </button>

            {/* Franja 4 */}
            <button
              onClick={() => setSelectedSlot('18:00 - 18:45')}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                selectedSlot === '18:00 - 18:45'
                  ? 'border-2 border-emerald-500 bg-emerald-50/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedSlot === '18:00 - 18:45' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                }`}>
                  {selectedSlot === '18:00 - 18:45' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <span className="text-xs font-semibold text-slate-800 font-mono">18:00 - 18:45</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">Disponible (45 min)</span>
            </button>

            {/* Franja 5 */}
            <button
              onClick={() => setSelectedSlot('19:00 - 19:45')}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                selectedSlot === '19:00 - 19:45'
                  ? 'border-2 border-emerald-500 bg-emerald-50/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedSlot === '19:00 - 19:45' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                }`}>
                  {selectedSlot === '19:00 - 19:45' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 font-mono">19:00 - 19:45</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Alta demanda</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">Disponible</span>
            </button>
          </div>
        </section>

        {/* 5. Desglose de Estimación y Políticas */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Resumen de Reserva</span>
            <span className="text-[10px] text-slate-500 font-normal">Tarifa regulada EPM / CREG</span>
          </h3>

          <div className="space-y-2 text-slate-600 text-xs">
            <div className="flex justify-between items-center">
              <span>Tiempo de conexión estimado</span>
              <span className="font-bold text-slate-900">45 minutos</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Entrega de energía estimada</span>
              <span className="font-bold text-slate-900 font-mono">~{estimatedKwh} kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Precio base por kWh</span>
              <span className="font-medium text-slate-900 font-mono">${ratePerKwh.toLocaleString()} COP</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-extrabold text-slate-900">Total Estimado</span>
                <p className="text-[10px] text-slate-500">Cobro exacto según telemetría del conector</p>
              </div>
              <span className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
                ${totalCostCop.toLocaleString()} COP
              </span>
            </div>
          </div>

          {/* Courtesy Grace Period Banner */}
          <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-800">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">info</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Tolerancia de 10 min:</strong> Tu conector estará bloqueado para ti hasta las 16:10. Si no inicias la conexión, el puerto se liberará automáticamente.
            </p>
          </div>
        </section>
      </main>

      {/* 6. Barra Flotante Fija Inferior (Sticky Bottom Action) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] z-50">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium">Total previsto a reservar</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                ${totalCostCop.toLocaleString()} COP
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">· {selectedSlot.slice(0, 5)} Hoy</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {activeConnector.type.split(' ')[0]} · {activeConnector.bay || activeConnector.name}
            </span>
          </div>
        </div>

        <button
          onClick={handleProceed}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 shadow-sm"
          type="button"
        >
          <span>Continuar a Resumen y Pago</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
