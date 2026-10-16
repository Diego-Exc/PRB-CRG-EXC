// Web Push Notification & Sound Synthesizer utility

export const playNotificationChime = (type: 'success' | 'alert' | 'charge' = 'charge') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    
    if (type === 'success') {
      // Pleasant two-tone chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.42);
    } else if (type === 'alert') {
      // Urgent soft alert
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(520, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Electric charging spark chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.48);
    }
  } catch {
    // Audio might fail if user hasn't interacted yet
  }
};

export const requestPushPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
};

export const sendBrowserPushNotification = (title: string, body: string, iconUrl?: string) => {
  playNotificationChime('charge');
  
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const options = {
        body,
        icon: iconUrl || 'https://lh3.googleusercontent.com/aida/AEtjO1UdROyGnkmQPXFusN4iX9mdNMSOX4Ljxr0n4oz_Ccc1-mqv0hOLckFVIXV4YYRZBJ-zZoGSWPAC1_-mWYvAvsiSoCgGUtrs_xv770b0RJrey4Pg46zMfiOyveFf485pDNFUaCkJfgVT9SlyRxOhEQKZFRAaAXFZevPv-NnK0tOUGeXbZ3Tp0UUl_q96nfWFQOlb2fAkvWqCJxSgyS-U_dw_fd6CH-cEcK-fi-8JMS_ozK9nilbZ2nkCsI2g',
        badge: 'https://lh3.googleusercontent.com/aida/AEtjO1UdROyGnkmQPXFusN4iX9mdNMSOX4Ljxr0n4oz_Ccc1-mqv0hOLckFVIXV4YYRZBJ-zZoGSWPAC1_-mWYvAvsiSoCgGUtrs_xv770b0RJrey4Pg46zMfiOyveFf485pDNFUaCkJfgVT9SlyRxOhEQKZFRAaAXFZevPv-NnK0tOUGeXbZ3Tp0UUl_q96nfWFQOlb2fAkvWqCJxSgyS-U_dw_fd6CH-cEcK-fi-8JMS_ozK9nilbZ2nkCsI2g',
      };
      new Notification(title, options);
    } catch {
      // In non-https or restricted iframe contexts, Notification constructor might throw
    }
  }
};
