import { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  ChargingStation,
  Connector,
  Vehicle,
  Reservation,
  LiveTelemetry,
  AppNotification,
} from './types';
import {
  INITIAL_STATIONS,
  USER_VEHICLE,
  INITIAL_RESERVATION,
  INITIAL_TELEMETRY,
  INITIAL_NOTIFICATIONS,
  ALTERNATE_VEHICLES,
} from './data/mockData';
import { DeviceFrame } from './components/common/DeviceFrame';
import { Header } from './components/common/Header';
import { BottomNav, ScreenType } from './components/common/BottomNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { MapScreen } from './components/screens/MapScreen';
import { ChargingScreen } from './components/screens/ChargingScreen';
import { ReservationScreen } from './components/screens/ReservationScreen';
import { ConfirmationScreen } from './components/screens/ConfirmationScreen';
import { ReservationsListScreen } from './components/screens/ReservationsListScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { sendBrowserPushNotification, playNotificationChime } from './utils/notifications';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyA09NX7qs9FuaLZ7MgMrIJgSAk4yq_-S3o';

export default function App() {
  // Navigation & Screen States
  const [currentTab, setCurrentTab] = useState<ScreenType>('explorar');
  const [activeSubScreen, setActiveSubScreen] = useState<'none' | 'reservation_step2' | 'confirmation_step3'>('none');

  // Application Data States
  const [stations] = useState<ChargingStation[]>(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState<ChargingStation>(INITIAL_STATIONS[0]); // Electrolinera Viva Envigado
  const [selectedConnector, setSelectedConnector] = useState<Connector>(INITIAL_STATIONS[0].connectors[0]);
  const [vehicle, setVehicle] = useState<Vehicle>(USER_VEHICLE);
  const [telemetry, setTelemetry] = useState<LiveTelemetry>(INITIAL_TELEMETRY);
  const [reservations, setReservations] = useState<Reservation[]>([INITIAL_RESERVATION]);
  const [currentReservation, setCurrentReservation] = useState<Reservation>(INITIAL_RESERVATION);

  // Quota & Error Handling (Mandatory Demo Key Quota Defense)
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isTelemetryInfoOpen, setIsTelemetryInfoOpen] = useState(false);

  // Real-time subtle charging simulation when isCharging is true
  useEffect(() => {
    if (!telemetry.isCharging) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (!prev.isCharging || prev.socPercent >= prev.targetPercent) return prev;

        const newSoc = prev.socPercent < prev.targetPercent ? prev.socPercent + 0.2 : prev.socPercent;
        const newEnergy = Number((prev.energyKwh + 0.05).toFixed(1));
        const newCost = Math.round(newEnergy * 1450);
        const newRemaining = Math.max(1, Math.round((prev.targetPercent - newSoc) * 0.95));

        return {
          ...prev,
          socPercent: Math.round(newSoc * 10) / 10,
          energyKwh: newEnergy,
          costCop: newCost,
          remainingMinutes: newRemaining,
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [telemetry.isCharging]);

  // Dispatch a simulated Push Notification and show in-app banner
  const triggerNotification = (title: string, body: string, type: 'booking' | 'charge' | 'alert' | 'promo' = 'charge') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      time: 'Justo ahora',
      read: false,
      type,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
    playNotificationChime(type === 'booking' ? 'success' : 'charge');
    sendBrowserPushNotification(title, body);

    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 6000);
  };

  // Handlers for booking flow
  const handleStartReservation = (station: ChargingStation, connector: Connector) => {
    setSelectedStation(station);
    setSelectedConnector(connector);
    setActiveSubScreen('reservation_step2');
  };

  const handleConfirmReservation = (res: Reservation) => {
    setReservations((prev) => [res, ...prev.filter((r) => r.id !== res.id)]);
    setCurrentReservation(res);
    setActiveSubScreen('confirmation_step3');
    triggerNotification(
      '🔒 ¡Reserva Confirmada en ExceCharge!',
      `Puesto ${res.connectorName} en ${res.stationName} bloqueado hasta las ${res.arrivalDeadline}.`,
      'booking'
    );
  };

  const handleCancelReservation = () => {
    setReservations((prev) => prev.filter((r) => r.id !== currentReservation.id));
    setActiveSubScreen('none');
    setCurrentTab('explorar');
    triggerNotification(
      'Reserva Cancelada',
      `La reserva ${currentReservation.code} en Viva Envigado ha sido cancelada sin penalidad.`,
      'alert'
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      solutionChannel="gmp_mcp_codeassist_v1_aistudio"
      language="es"
      region="CO"
    >
      <DeviceFrame
        telemetry={telemetry}
        onNavigateToCharging={() => {
          setActiveSubScreen('none');
          setCurrentTab('carga');
        }}
      >
        {/* Mandatory In-App Quota Exceeded Banner */}
        {isQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* In-App Floating Push Notification Toast Banner */}
        {activeToast && (
          <div
            onClick={() => {
              setIsNotificationDrawerOpen(true);
              setActiveToast(null);
            }}
            className="absolute top-2 left-3 right-3 z-50 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-start gap-3 cursor-pointer animate-in slide-in-from-top duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">
                {activeToast.type === 'booking' ? 'event_available' : 'bolt'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">ExceCharge Push</span>
                <span className="text-[9px] text-slate-400">{activeToast.time}</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 leading-tight">{activeToast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{activeToast.body}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveToast(null);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Main View Router */}
        {activeSubScreen === 'reservation_step2' ? (
          <ReservationScreen
            station={selectedStation}
            selectedConnector={selectedConnector}
            currentVehicle={vehicle}
            onBack={() => setActiveSubScreen('none')}
            onConfirmReservation={handleConfirmReservation}
          />
        ) : activeSubScreen === 'confirmation_step3' ? (
          <ConfirmationScreen
            reservation={currentReservation}
            onBack={() => setActiveSubScreen('none')}
            onGoToMap={() => {
              setActiveSubScreen('none');
              setCurrentTab('explorar');
            }}
            onCancelReservation={handleCancelReservation}
          />
        ) : (
          <div className="w-full h-full flex flex-col flex-1">
            {/* Top Header */}
            <Header
              currentScreen={currentTab}
              vehicle={vehicle}
              telemetry={telemetry}
              unreadCount={unreadCount}
              onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
              onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
              onOpenTelemetryInfo={() => setIsTelemetryInfoOpen(true)}
            />

            {/* Active Tab Screen */}
            <div className="flex-1 w-full flex flex-col relative overflow-hidden">
              {currentTab === 'explorar' && (
                <MapScreen
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(station) => setSelectedStation(station)}
                  onStartReservation={handleStartReservation}
                  onStartChargingFromStation={() => {
                    setCurrentTab('carga');
                  }}
                />
              )}

              {currentTab === 'carga' && (
                <ChargingScreen
                  vehicle={vehicle}
                  telemetry={telemetry}
                  onUpdateTelemetry={(newVals) => setTelemetry((prev) => ({ ...prev, ...newVals }))}
                  onFinishSession={() => {
                    setTelemetry((prev) => ({ ...prev, isCharging: false }));
                    triggerNotification(
                      '⚡ Sesión Finalizada',
                      `Has cargado ${telemetry.energyKwh} kWh por un valor total de $${telemetry.costCop.toLocaleString()} COP.`,
                      'charge'
                    );
                  }}
                  onNavigateToExplore={() => setCurrentTab('explorar')}
                />
              )}

              {currentTab === 'reservas' && (
                <ReservationsListScreen
                  reservations={reservations}
                  onSelectReservation={(res) => {
                    setCurrentReservation(res);
                    setActiveSubScreen('confirmation_step3');
                  }}
                  onExploreStations={() => setCurrentTab('explorar')}
                />
              )}

              {currentTab === 'perfil' && (
                <ProfileScreen
                  currentVehicle={vehicle}
                  onSelectVehicle={(v) => {
                    setVehicle(v);
                    triggerNotification('Vehículo Activo Cambiado', `Ahora gestionando ${v.name} (${v.plate}).`, 'alert');
                  }}
                  onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
                />
              )}
            </div>

            {/* Bottom Navigation Bar */}
            <BottomNav
              currentScreen={currentTab}
              onChangeScreen={(tab) => {
                setActiveSubScreen('none');
                setCurrentTab(tab);
              }}
              reservationCount={reservations.length}
              isCharging={telemetry.isCharging}
            />
          </div>
        )}

        {/* Notifications Drawer */}
        <NotificationDrawer
          isOpen={isNotificationDrawerOpen}
          onClose={() => setIsNotificationDrawerOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          }}
          onSendTestNotification={() => {
            triggerNotification(
              '⚡ Alerta de Carga (80% SoC)',
              'Tu BYD Yuan Plus ha alcanzado el 80% de batería en Viva Envigado. Velocidad regulando a 75 kW.',
              'charge'
            );
          }}
        />

        {/* Vehicle Garage Switcher Modal */}
        {isVehicleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">directions_car</span>
                  Garaje de Vehículos
                </h3>
                <button
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Selecciona el vehículo activo para telemetría de conector y curvas de recarga.
              </p>

              <div className="space-y-2">
                {ALTERNATE_VEHICLES.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setVehicle(v);
                      setIsVehicleModalOpen(false);
                    }}
                    className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                      v.id === vehicle.id
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{v.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {v.plate} • {v.compatiblePort}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 font-mono">{v.currentBatteryPercent}%</span>
                      <span className="block text-[9px] text-slate-400 font-medium">Batería</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Telemetry Information Modal */}
        {isTelemetryInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">info</span>
                  Parámetros de Suministro
                </h3>
                <button
                  onClick={() => setIsTelemetryInfoOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Protocolo de Carga:</span>
                    <span className="font-bold text-slate-800">ISO 15118 / DIN 70121</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Manguera & Refrigeración:</span>
                    <span className="font-bold text-slate-800">Líquida Activa (CCS2)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subestación Proveedora:</span>
                    <span className="font-bold text-slate-800">EPM Aburrá Sur 13.2 kV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Eficiencia Energética:</span>
                    <span className="font-bold text-emerald-700">96.8%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsTelemetryInfoOpen(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </DeviceFrame>
    </APIProvider>
  );
}
