import React from 'react';

export type ScreenType = 'explorar' | 'reservas' | 'carga' | 'perfil';

interface BottomNavProps {
  currentScreen: ScreenType;
  onChangeScreen: (screen: ScreenType) => void;
  reservationCount: number;
  isCharging: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onChangeScreen,
  reservationCount,
  isCharging,
}) => {
  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 px-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]"
    >
      {/* Tab 1: Explorar */}
      <button
        onClick={() => onChangeScreen('explorar')}
        className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
          currentScreen === 'explorar'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-emerald-700'
        }`}
        type="button"
      >
        <span
          className={`material-symbols-outlined text-2xl ${
            currentScreen === 'explorar' ? 'material-symbols-fill' : ''
          }`}
        >
          map
        </span>
        <span className="text-[11px] tracking-tight mt-0.5">Explorar</span>
      </button>

      {/* Tab 2: Reservas */}
      <button
        onClick={() => onChangeScreen('reservas')}
        className={`relative flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
          currentScreen === 'reservas'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-emerald-700'
        }`}
        type="button"
      >
        <span
          className={`material-symbols-outlined text-2xl ${
            currentScreen === 'reservas' ? 'material-symbols-fill' : ''
          }`}
        >
          calendar_today
        </span>
        <span className="text-[11px] tracking-tight mt-0.5">Reservas</span>
        {reservationCount > 0 && (
          <span className="absolute top-0 right-2 min-w-[16px] h-4 px-1 bg-emerald-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
            {reservationCount}
          </span>
        )}
      </button>

      {/* Tab 3: Carga */}
      <button
        onClick={() => onChangeScreen('carga')}
        className={`relative flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
          currentScreen === 'carga'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-emerald-700'
        }`}
        type="button"
      >
        <div className="relative">
          <span
            className={`material-symbols-outlined text-2xl ${
              currentScreen === 'carga' ? 'material-symbols-fill' : ''
            }`}
          >
            bolt
          </span>
          {isCharging && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
          )}
        </div>
        <span className="text-[11px] tracking-tight mt-0.5">Carga</span>
      </button>

      {/* Tab 4: Perfil */}
      <button
        onClick={() => onChangeScreen('perfil')}
        className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
          currentScreen === 'perfil'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-emerald-700'
        }`}
        type="button"
      >
        <span
          className={`material-symbols-outlined text-2xl ${
            currentScreen === 'perfil' ? 'material-symbols-fill' : ''
          }`}
        >
          person
        </span>
        <span className="text-[11px] tracking-tight mt-0.5">Perfil</span>
      </button>
    </nav>
  );
};
