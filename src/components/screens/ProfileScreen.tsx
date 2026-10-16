import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { ALTERNATE_VEHICLES } from '../../data/mockData';
import { requestPushPermission, sendBrowserPushNotification } from '../../utils/notifications';

interface ProfileScreenProps {
  currentVehicle: Vehicle;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenNotifications: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentVehicle,
  onSelectVehicle,
  onOpenNotifications,
}) => {
  const [smartRouting, setSmartRouting] = useState(true);
  const [preconditioning, setPreconditioning] = useState(true);

  const handleTestPush = async () => {
    const res = await requestPushPermission();
    if (res === 'granted') {
      sendBrowserPushNotification(
        '⚡ Notificación de Prueba ExceCharge',
        'Tu energía, más cerca. Telemetría y geofencing conectado en Medellín.'
      );
    }
  };

  return (
    <div className="w-full flex-1 px-4 py-4 space-y-4 bg-[#faf8ff] overflow-y-auto pb-24">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-emerald-500">
          DU
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-slate-900 text-base">Diego Ulloa</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">diego.ulloae77@gmail.com</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Medellín, Antioquia</span>
        </div>
      </div>

      {/* Green Mobility Impact Bento */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-emerald-500 text-white rounded-xl p-3.5 shadow-xs">
          <span className="material-symbols-outlined text-[20px]">eco</span>
          <div className="text-xl font-extrabold font-mono mt-1">142 kg</div>
          <p className="text-[10px] text-emerald-100 font-medium">CO₂ evitado este mes</p>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-emerald-400">savings</span>
          <div className="text-xl font-extrabold font-mono mt-1">$240K</div>
          <p className="text-[10px] text-slate-300 font-medium">Ahorrado vs Gasolina</p>
        </div>
      </div>

      {/* Mi Garaje (Vehicle Management) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">directions_car</span>
            Mi Garaje Eléctrico
          </h2>
          <span className="text-[10px] font-semibold text-slate-400">3 vehículos</span>
        </div>

        <div className="space-y-2">
          {ALTERNATE_VEHICLES.map((v) => {
            const isSelected = v.id === currentVehicle.id;
            return (
              <div
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{v.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {v.plate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {v.compatiblePort} • Batería {v.batteryCapacityKwh} kWh
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {v.currentBatteryPercent}%
                  </span>
                  {isSelected && (
                    <span className="block text-[9px] font-bold text-emerald-700 uppercase">
                      Activo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">account_balance_wallet</span>
            Métodos de Pago
          </h2>
          <button className="text-xs font-bold text-emerald-700 hover:underline">Gestionar</button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                PSE
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Bancolombia Débito</span>
                <span className="text-[10px] text-slate-500">Cuenta de ahorros ···· 4091</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Predeterminado
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Apple Pay / Google Wallet</span>
                <span className="text-[10px] text-slate-500">Pases de recarga automáticos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferencias & Notificaciones Push */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">settings</span>
          Preferencias de Conducción
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 block">Rutas con carga inteligente</span>
              <span className="text-[11px] text-slate-500">
                Prioriza estaciones con disponibilidad garantizada y conector CCS2
              </span>
            </div>
            <input
              type="checkbox"
              checked={smartRouting}
              onChange={(e) => setSmartRouting(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <span className="font-semibold text-slate-900 block">Pre-acondicionamiento térmico</span>
              <span className="text-[11px] text-slate-500">
                Precalienta la batería 15 min antes de llegar para pico de 120 kW
              </span>
            </div>
            <input
              type="checkbox"
              checked={preconditioning}
              onChange={(e) => setPreconditioning(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <span className="font-semibold text-slate-900 block">Notificaciones Push del Vehículo</span>
              <span className="text-[11px] text-slate-500">
                Alertas de 80% SoC, fin de sesión y ventana de reserva
              </span>
            </div>
            <button
              onClick={handleTestPush}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px] hover:bg-emerald-100"
            >
              Probar Push
            </button>
          </div>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center text-[11px] text-slate-400 pt-2">
        <p>ExceCharge v2.4.0 (Build 892) · La app de Excelec</p>
        <p className="mt-0.5">Tu energía, más cerca · Red Medellín / Colombia</p>
      </div>
    </div>
  );
};
