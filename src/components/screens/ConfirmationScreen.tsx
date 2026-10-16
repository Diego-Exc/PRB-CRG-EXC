import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Reservation } from '../../types';
import { playNotificationChime, sendBrowserPushNotification } from '../../utils/notifications';
import { ExceChargeLogo } from '../common/ExceChargeLogo';

interface ConfirmationScreenProps {
  reservation: Reservation;
  onBack: () => void;
  onGoToMap: () => void;
  onCancelReservation: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  reservation,
  onBack,
  onGoToMap,
  onCancelReservation,
}) => {
  const [walletSaved, setWalletSaved] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    // Play celebratory sound and confetti
    playNotificationChime('success');
    sendBrowserPushNotification(
      '¡Reserva Confirmada en ExceCharge!',
      `Tu conector CCS2 #01 en ${reservation.stationName} está bloqueado. Llega antes de las ${reservation.arrivalDeadline}.`
    );

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#3b82f6', '#10b981'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const handleSaveWallet = () => {
    setWalletSaved(true);
    playNotificationChime('success');
    sendBrowserPushNotification(
      'Ticket Guardado en Wallet',
      `El pase digital ${reservation.code} ha sido añadido a tu Apple Wallet / Google Wallet.`
    );
  };

  return (
    <div className="w-full flex-1 min-h-screen bg-[#faf8ff] flex flex-col relative pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex justify-between items-center h-14 px-4 bg-white shadow-2xs border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label="Volver"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-transform duration-150"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-base font-bold text-slate-900 tracking-tight">
            Reserva Confirmada
          </span>
        </div>

        {/* ExceCharge Brand Emblem & MED pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <ExceChargeLogo iconOnly size="sm" />
          <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase font-mono">
            MED
          </span>
        </div>
      </header>

      {/* Progress / Step Indicator Strip */}
      <div className="w-full bg-white px-4 pt-1 pb-3 flex items-center justify-between border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Paso 3 de 3
          </span>
          <span className="text-[11px] text-slate-600 font-medium">Bloqueo de Suministro Exitoso</span>
        </div>
        <div className="flex gap-1">
          <span className="w-6 h-1 rounded-full bg-emerald-500"></span>
          <span className="w-6 h-1 rounded-full bg-emerald-500"></span>
          <span className="w-6 h-1 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* Success Header Banner */}
        <section className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
            <span className="material-symbols-outlined text-emerald-600 text-[28px] material-symbols-fill">
              check_circle
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">¡Reserva Exitosa!</h1>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              Conector <strong className="text-slate-900 font-semibold">{reservation.connectorName || 'CCS2 #01'}</strong> bloqueado en exclusiva para tu vehículo.
            </p>
          </div>
        </section>

        {/* Digital Boarding Pass / Ticket de Carga */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Boarding Pass Header */}
          <div className="bg-slate-50 p-4 border-b border-slate-200/70 flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                TICKET DIGITAL EXCECHARGE
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-0.5 block font-mono">
                {reservation.code}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-2xs">
                <span className="material-symbols-outlined text-[13px] material-symbols-fill">lock</span>
                CONFIRMADO
              </span>
            </div>
          </div>

          {/* QR Code Section & Arrival Notice */}
          <div className="p-5 flex flex-col items-center border-b border-dashed border-slate-200 bg-white">
            {/* Crisp QR Vector */}
            <div className="p-3 bg-white rounded-lg border-2 border-emerald-500/30 shadow-xs flex flex-col items-center">
              <svg className="w-36 h-36" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect fill="white" height="100" width="100" />
                {/* Top Left Corner */}
                <rect fill="#0F172A" height="26" rx="3" width="26" x="6" y="6" />
                <rect fill="white" height="18" rx="2" width="18" x="10" y="10" />
                <rect fill="#006C49" height="10" rx="1" width="10" x="14" y="14" />
                {/* Top Right Corner */}
                <rect fill="#0F172A" height="26" rx="3" width="26" x="68" y="6" />
                <rect fill="white" height="18" rx="2" width="18" x="72" y="10" />
                <rect fill="#006C49" height="10" rx="1" width="10" x="76" y="14" />
                {/* Bottom Left Corner */}
                <rect fill="#0F172A" height="26" rx="3" width="26" x="6" y="68" />
                <rect fill="white" height="18" rx="2" width="18" x="10" y="72" />
                <rect fill="#006C49" height="10" rx="1" width="10" x="14" y="76" />
                {/* Data Pixels */}
                <rect fill="#0F172A" height="6" width="6" x="38" y="8" />
                <rect fill="#0F172A" height="6" width="8" x="50" y="8" />
                <rect fill="#0F172A" height="12" width="6" x="38" y="20" />
                <rect fill="#006C49" height="6" width="12" x="48" y="22" />
                <rect fill="#0F172A" height="6" width="12" x="8" y="38" />
                <rect fill="#0F172A" height="8" width="6" x="26" y="40" />
                <rect fill="#006C49" height="8" width="8" x="38" y="38" />
                <rect fill="#0F172A" height="16" width="6" x="52" y="36" />
                <rect fill="#0F172A" height="6" width="14" x="64" y="38" />
                <rect fill="#006C49" height="8" width="8" x="84" y="40" />
                <rect fill="#0F172A" height="6" width="18" x="10" y="52" />
                <rect fill="#0F172A" height="6" width="10" x="34" y="52" />
                <rect fill="#0F172A" height="10" width="10" x="66" y="52" />
                <rect fill="#0F172A" height="6" width="8" x="82" y="56" />
                <rect fill="#0F172A" height="12" width="6" x="38" y="66" />
                <rect fill="#006C49" height="6" width="10" x="50" y="68" />
                <rect fill="#0F172A" height="14" width="8" x="68" y="68" />
                <rect fill="#0F172A" height="10" width="10" x="82" y="70" />
                <rect fill="#0F172A" height="6" width="14" x="38" y="84" />
                <rect fill="#006C49" height="8" width="8" x="58" y="82" />
                <rect fill="#0F172A" height="6" width="16" x="74" y="86" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2.5">
              Escanea en tótem {reservation.stationName.replace('Electrolinera ', '')}
            </span>
            <span className="text-[11px] text-slate-500 text-center mt-0.5">
              Al llegar al puesto #01, acerca este código a la cámara óptica para habilitar el conector.
            </span>

            {/* Arrival Window Notice */}
            <div className="mt-3.5 w-full bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[20px]">timer</span>
              <div className="flex-1">
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider block">
                  Ventana de Llegada
                </span>
                <p className="text-xs text-slate-800 font-medium leading-tight">
                  Llega antes de las <span className="font-bold text-red-600 font-mono">{reservation.arrivalDeadline}</span>{' '}
                  <span className="text-slate-500 font-normal">(Tolerancia 10 min)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Jagged Cutout Divider Zone */}
          <div className="relative w-full h-0 border-t border-dashed border-slate-300">
            <div className="ticket-notch-left"></div>
            <div className="ticket-notch-right"></div>
          </div>

          {/* Flight / Aviation Telemetry Grid Details */}
          <div className="p-4 bg-white space-y-3.5">
            {/* Horario y Bahía */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  Fecha & Horario
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                  {reservation.dateLabel}
                </span>
                <span className="text-xs text-emerald-700 font-semibold font-mono">
                  {reservation.timeSlot} ({reservation.durationMinutes} min)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  Potencia y Bahía
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                  {reservation.connectorName}
                </span>
                <span className="text-xs text-slate-600">{reservation.connectorPower}</span>
              </div>
            </div>

            {/* Estación de Carga */}
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                    Estación de Carga
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">
                    {reservation.stationName}
                  </span>
                  <span className="text-xs text-slate-500 block">{reservation.stationAddress}</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700 font-semibold font-mono shrink-0">
                  A 1.8 km
                </span>
              </div>
            </div>

            {/* Vehículo y Pago */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                  Vehículo Registrado
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  {reservation.vehicle.name}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 uppercase font-mono">
                  PLACA: {reservation.vehicle.plate}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                  Monto Pre-autorizado
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 font-mono">
                  ${reservation.totalEstimatedCop.toLocaleString()} COP
                </span>
                <span className="text-[10px] text-slate-500">{reservation.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <section className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Cómo llegar */}
          <button
            onClick={onGoToMap}
            className="h-12 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all rounded-lg flex items-center justify-center gap-2 px-3 text-slate-800 shadow-2xs font-semibold text-xs sm:text-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-emerald-600 text-[20px] material-symbols-fill">
              navigation
            </span>
            <span>Cómo llegar</span>
          </button>

          {/* Guardar Wallet */}
          <button
            onClick={handleSaveWallet}
            className={`h-12 border active:scale-95 transition-all rounded-lg flex items-center justify-center gap-2 px-3 text-xs sm:text-sm font-semibold shadow-2xs ${
              walletSaved
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {walletSaved ? 'check_circle' : 'wallet'}
            </span>
            <span>{walletSaved ? '¡Guardado!' : 'Guardar Wallet'}</span>
          </button>
        </section>

        {/* Transparency & Cancellation Policy Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">info</span>
            <span className="text-xs font-bold">Política de Uso & Cancelación</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cancelación gratuita hasta <strong>30 minutos antes</strong> de la cita. Pasados 10 minutos de retraso tras la hora pactada ({reservation.arrivalDeadline}), el conector se liberará automáticamente para otros usuarios y se cobrará tarifa de no-asistencia ($5.000 COP).
          </p>
        </div>

        {/* Primary Confirmation Actions */}
        <div className="pt-2 pb-6 space-y-2">
          <button
            onClick={onGoToMap}
            className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            <span>Ver Mi Sesión / Ir al Mapa</span>
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-2 text-center text-xs font-semibold text-red-600 hover:underline transition-all"
            type="button"
          >
            Modificar o Cancelar Reserva
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">¿Deseas cancelar esta reserva?</h3>
            <p className="text-xs text-slate-600">
              Se liberará inmediatamente el puesto {reservation.connectorName} en Viva Envigado. No se generará ningún cobro por encontrarte en la ventana sin penalidad.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Mantener Reserva
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  onCancelReservation();
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
