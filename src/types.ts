export interface Connector {
  id: string;
  name: string;
  type: 'CCS2 DC' | 'Tipo 2 AC' | 'CHAdeMO';
  power: string;
  kw: number;
  status: 'available' | 'occupied' | 'maintenance';
  statusLabel: string;
  bay: string;
  occupiedRemainingMinutes?: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  verified: boolean;
  isOpen24h: boolean;
  distanceKm: number;
  drivingMinutes: number;
  ratePerKwh: number;
  currency: string;
  connectors: Connector[];
  availableCount: number;
  totalCount: number;
  maxPowerKw: number;
  amenities: string[];
  imageUrl?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  plate: string;
  compatiblePort: string;
  currentBatteryPercent: number;
  batteryCapacityKwh: number;
  targetPercent: number;
  rangeKm: number;
}

export interface Reservation {
  id: string;
  code: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  connectorId: string;
  connectorName: string;
  connectorPower: string;
  vehicle: Vehicle;
  dateLabel: string;
  timeSlot: string;
  durationMinutes: number;
  estimatedKwh: number;
  ratePerKwh: number;
  totalEstimatedCop: number;
  paymentMethod: string;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  arrivalDeadline: string; // e.g. "16:10"
  createdAt: string;
}

export interface LiveTelemetry {
  socPercent: number;
  targetPercent: number;
  powerKw: number;
  energyKwh: number;
  costCop: number;
  currentAmps: number;
  voltageVolts: number;
  remainingMinutes: number;
  estimatedEndTime: string;
  elapsedMinutes: number;
  history: { minute: number; powerKw: number }[];
  isCharging: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'booking' | 'charge' | 'alert' | 'promo';
}
