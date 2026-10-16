import React, { useState } from 'react';
import { AppNotification } from '../../types';
import { requestPushPermission, sendBrowserPushNotification, playNotificationChime } from '../../utils/notifications';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
  onSendTestNotification: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  onSendTestNotification,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const res = await requestPushPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      sendBrowserPushNotification(
        '¡Notificaciones ExceCharge activadas!',
        'Recibirás alertas en tiempo real sobre tu estado de carga y reservas en Medellín.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-[380px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700">notifications_active</span>
            <h2 className="font-bold text-slate-800 text-base">Notificaciones</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Push status alert banner */}
        <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-900">
            <span className="material-symbols-outlined text-emerald-600 text-sm">
              {permissionStatus === 'granted' ? 'check_circle' : 'notifications_paused'}
            </span>
            <span>
              {permissionStatus === 'granted'
                ? 'Push activo para alertas en segundo plano'
                : 'Activa notificaciones push para recibir alertas'}
            </span>
          </div>
          {permissionStatus !== 'granted' ? (
            <button
              onClick={handleEnablePush}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold rounded-md shadow-xs transition-all shrink-0"
              type="button"
            >
              Habilitar
            </button>
          ) : (
            <button
              onClick={() => {
                playNotificationChime('charge');
                onSendTestNotification();
              }}
              className="px-2 py-0.5 bg-emerald-200/80 hover:bg-emerald-300 active:scale-95 text-emerald-900 text-[10px] font-semibold rounded transition-all shrink-0"
              type="button"
            >
              Probar
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">notifications_off</span>
              <p className="text-sm">No tienes notificaciones pendientes</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (onSelectNotification) onSelectNotification(n);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-slate-50/60 border-slate-200/70 opacity-80'
                    : 'bg-white border-emerald-200 shadow-xs hover:border-emerald-400 ring-1 ring-emerald-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>}
                    <span className="leading-tight">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed pl-3">{n.body}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            onClick={() => {
              playNotificationChime('charge');
              onSendTestNotification();
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            Enviar alerta de prueba
          </button>
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            type="button"
          >
            Marcar leídas
          </button>
        </div>
      </div>
    </div>
  );
};
