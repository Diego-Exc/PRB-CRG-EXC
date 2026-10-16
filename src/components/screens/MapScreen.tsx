import React, { useState, useEffect, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { ChargingStation, Connector } from '../../types';
import { USER_LOCATION } from '../../data/mockData';

interface MapScreenProps {
  stations: ChargingStation[];
  selectedStation: ChargingStation;
  onSelectStation: (station: ChargingStation) => void;
  onStartReservation: (station: ChargingStation, connector: Connector) => void;
  onStartChargingFromStation: (station: ChargingStation) => void;
}

// Subcomponent to draw visual distance radius circle around user
interface RadiusCircleProps {
  center: { lat: number; lng: number };
  radiusKm: number;
}

const RadiusCircle: React.FC<RadiusCircleProps> = ({ center, radiusKm }) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: '#10b981',
        strokeOpacity: 0.5,
        strokeWeight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.08,
        map,
        center,
        radius: radiusKm * 1000,
        clickable: false,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusKm * 1000);
      circleRef.current.setMap(map);
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center, radiusKm]);

  return null;
};

// Subcomponent for Route Polyline
interface RoutePolylineProps {
  path: { lat: number; lng: number }[];
  isNavigating: boolean;
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ path, isNavigating }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!isNavigating || path.length === 0) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#10b981',
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map,
      });
    } else {
      polylineRef.current.setPath(path);
      polylineRef.current.setMap(map);
    }

    const bounds = new google.maps.LatLngBounds();
    path.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, { top: 70, right: 30, bottom: 260, left: 30 });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, path, isNavigating]);

  return null;
};

// Subcomponent for Camera control
interface CameraControllerProps {
  targetLocation: { lat: number; lng: number } | null;
  zoom?: number;
}

const CameraController: React.FC<CameraControllerProps> = ({ targetLocation, zoom = 14 }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetLocation) return;
    map.panTo(targetLocation);
    map.setZoom(zoom);
  }, [map, targetLocation, zoom]);

  return null;
};

export const MapScreen: React.FC<MapScreenProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onStartReservation,
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(2); // Default to 2km as requested
  const [filterUltraFast, setFilterUltraFast] = useState<boolean>(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState<boolean>(false);
  const [filterCcs2Only, setFilterCcs2Only] = useState<boolean>(false);
  const [showFilterTray, setShowFilterTray] = useState<boolean>(false);
  const [isListView, setIsListView] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Navigation simulation states
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navStepText, setNavStepText] = useState<string>('');
  const [carPosition, setCarPosition] = useState<{ lat: number; lng: number }>(USER_LOCATION);
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Selected Connector
  const [selectedConnector, setSelectedConnector] = useState<Connector>(
    selectedStation.connectors[0] || null
  );

  useEffect(() => {
    if (selectedStation.connectors && selectedStation.connectors.length > 0) {
      setSelectedConnector(selectedStation.connectors[0]);
    }
  }, [selectedStation]);

  // Adjust zoom automatically when radius changes
  useEffect(() => {
    const zoomLevel = selectedRadiusKm <= 2 ? 15 : selectedRadiusKm <= 5 ? 13.5 : 12;
    setCameraTarget({ lat: USER_LOCATION.lat, lng: USER_LOCATION.lng });
  }, [selectedRadiusKm]);

  // Route path points from user to selected station
  const routePoints: { lat: number; lng: number }[] = [
    { lat: USER_LOCATION.lat, lng: USER_LOCATION.lng },
    {
      lat: (USER_LOCATION.lat + selectedStation.lat) / 2 + 0.002,
      lng: (USER_LOCATION.lng + selectedStation.lng) / 2,
    },
    { lat: selectedStation.lat, lng: selectedStation.lng },
  ];

  // Recenter GPS
  const handleRecenter = () => {
    setCameraTarget({ lat: USER_LOCATION.lat, lng: USER_LOCATION.lng });
  };

  // Center on Selected Station
  const handleFocusStation = (station: ChargingStation) => {
    onSelectStation(station);
    setCameraTarget({ lat: station.lat, lng: station.lng });
  };

  // Toggle navigation simulation
  const handleToggleNavigation = () => {
    if (isNavigating) {
      setIsNavigating(false);
      setCarPosition(USER_LOCATION);
      return;
    }

    setIsNavigating(true);
    setNavStepText(`Ruta hacia ${selectedStation.name} (${selectedStation.distanceKm} km · ${selectedStation.drivingMinutes} min)`);
    setCarPosition(routePoints[0]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < routePoints.length) {
        setCarPosition(routePoints[step]);
        if (step === 1) setNavStepText('Avanzando por Av. El Poblado hacia el centro comercial...');
      } else {
        clearInterval(interval);
        setNavStepText(`¡Has llegado a ${selectedStation.name}! Bahía de carga lista.`);
      }
    }, 2400);
  };

  // STRICT Filter logic
  const filteredStations = stations.filter((station) => {
    // 1. Strict Distance Filter: station.distanceKm <= selectedRadiusKm
    if (selectedRadiusKm > 0 && station.distanceKm > selectedRadiusKm) {
      return false;
    }

    // 2. Search query filter (by mall name, city, sector)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matches =
        station.name.toLowerCase().includes(q) ||
        station.address.toLowerCase().includes(q) ||
        station.city.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // 3. Quick Toggles
    if (filterAvailableOnly && station.availableCount === 0) return false;
    if (filterUltraFast && station.maxPowerKw < 60) return false;
    if (filterCcs2Only && !station.connectors.some((c) => c.type.includes('CCS2'))) return false;

    return true;
  });

  // Ensure a selected station is always visible in the filtered list if possible
  useEffect(() => {
    if (filteredStations.length > 0 && !filteredStations.some((s) => s.id === selectedStation.id)) {
      onSelectStation(filteredStations[0]);
    }
  }, [filteredStations]);

  // Active filters count
  const activeFiltersCount =
    (filterUltraFast ? 1 : 0) + (filterAvailableOnly ? 1 : 0) + (filterCcs2Only ? 1 : 0);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-100">
      {/* 1. Sleek, Non-Invasive Floating Bar & Integrated Distance Filters */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex flex-col gap-1.5 pointer-events-none">
        {/* Main Compact Search Pill */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.08)] p-1.5 flex items-center justify-between gap-1.5 transition-all">
          {/* Location / Search Box */}
          <div className="flex-1 flex items-center gap-1.5 pl-2 min-w-0">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
              near_me
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar centro comercial en Medellín..."
              className="w-full bg-transparent border-none p-0 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden truncate font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Inline Distance Pill Selector */}
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl shrink-0">
            {[2, 5, 10].map((radius) => (
              <button
                key={radius}
                onClick={() => setSelectedRadiusKm(radius)}
                className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition-all ${
                  selectedRadiusKm === radius
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {radius} km
              </button>
            ))}
            <button
              onClick={() => setSelectedRadiusKm(0)} // 0 means all
              className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition-all ${
                selectedRadiusKm === 0
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              Todos
            </button>
          </div>

          {/* Toggle More Filters Button */}
          <button
            onClick={() => setShowFilterTray((prev) => !prev)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              showFilterTray || activeFiltersCount > 0
                ? 'bg-emerald-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            type="button"
            title="Filtros rápidos"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>

        {/* Collapsible Micro-Tray for Quick Filters (Ultra-rápido, Disponibles, CCS2) */}
        {showFilterTray && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-2 border border-slate-200 shadow-md flex items-center gap-2 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider pl-1">
              Filtros:
            </span>

            {/* Ultra >60kW */}
            <button
              onClick={() => setFilterUltraFast((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all shrink-0 ${
                filterUltraFast
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-xs text-emerald-600">bolt</span>
              Ultra &gt;60 kW
            </button>

            {/* Disponibles ahora */}
            <button
              onClick={() => setFilterAvailableOnly((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all shrink-0 ${
                filterAvailableOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              type="button"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Solo Libres
            </button>

            {/* CCS2 Combo */}
            <button
              onClick={() => setFilterCcs2Only((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all shrink-0 ${
                filterCcs2Only
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              type="button"
            >
              CCS2 Combo
            </button>

            {/* Reset */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilterUltraFast(false);
                  setFilterAvailableOnly(false);
                  setFilterCcs2Only(false);
                }}
                className="text-[10px] text-red-600 hover:underline px-1 font-semibold shrink-0"
                type="button"
              >
                Limpiar
              </button>
            )}
          </div>
        )}

        {/* Dynamic Distance Results Chip Notice */}
        <div className="flex items-center gap-2 px-1">
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {filteredStations.length}{' '}
            {filteredStations.length === 1 ? 'centro comercial' : 'centros comerciales'}{' '}
            {selectedRadiusKm > 0 ? `a ≤ ${selectedRadiusKm} km` : 'en total'}
          </span>
        </div>
      </div>

      {/* Navigation In-Progress Banner */}
      {isNavigating && (
        <div className="absolute top-[82px] left-3 right-3 z-30 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-emerald-500/40 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">turn_right</span>
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{navStepText}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Navegación GPS Google Maps en tiempo real</p>
            </div>
          </div>
          <button
            onClick={handleToggleNavigation}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded border border-slate-700"
            type="button"
          >
            Detener
          </button>
        </div>
      )}

      {/* Map Control Buttons (Right Side) */}
      <div className="absolute right-3 top-[130px] z-20 flex flex-col space-y-2">
        <button
          onClick={handleRecenter}
          aria-label="Recentrar GPS"
          className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.1)] flex items-center justify-center text-slate-700 hover:text-emerald-600 active:scale-95 transition-all"
          type="button"
          title="Recentrar en mi ubicación"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>

        <button
          onClick={() => setIsListView((prev) => !prev)}
          aria-label="Vista Lista"
          className={`w-10 h-10 rounded-lg border shadow-[0_4px_16px_rgba(15,23,42,0.1)] flex items-center justify-center active:scale-95 transition-all ${
            isListView
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-700 border-slate-200 hover:text-emerald-600'
          }`}
          type="button"
          title="Alternar vista lista / mapa"
        >
          <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
        </button>

        {/* Map Type Toggle: Roadmap / Satellite */}
        <button
          onClick={() => setMapType((prev) => (prev === 'roadmap' ? 'hybrid' : 'roadmap'))}
          aria-label="Capas de Tráfico / Satélite"
          className={`w-10 h-10 rounded-lg border shadow-[0_4px_16px_rgba(15,23,42,0.1)] flex items-center justify-center active:scale-95 transition-all ${
            mapType === 'hybrid'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-600 border-slate-200 hover:text-emerald-600'
          }`}
          type="button"
          title="Alternar vista satélite / calles"
        >
          <span className="material-symbols-outlined text-[20px]">
            {mapType === 'hybrid' ? 'satellite_alt' : 'layers'}
          </span>
        </button>
      </div>

      {/* 2. Real Google Maps Platform Interactive Map */}
      <div className="w-full flex-1 relative min-h-[460px]">
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={{ lat: USER_LOCATION.lat, lng: USER_LOCATION.lng }}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={true}
          mapTypeId={mapType}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Camera Controller */}
          <CameraController targetLocation={cameraTarget} zoom={selectedRadiusKm <= 2 ? 15 : 13.5} />

          {/* Visual Distance Radius Circle on Google Maps */}
          {selectedRadiusKm > 0 && (
            <RadiusCircle center={USER_LOCATION} radiusKm={selectedRadiusKm} />
          )}

          {/* Polyline Route */}
          <RoutePolyline path={routePoints} isNavigating={isNavigating} />

          {/* User Location Pulsing Dot Marker */}
          <AdvancedMarker
            position={{ lat: USER_LOCATION.lat, lng: USER_LOCATION.lng }}
            zIndex={500}
            title="Mi Ubicación (El Poblado, Medellín)"
          >
            <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="absolute w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 animate-radar"></div>
              <div className="absolute w-7 h-7 rounded-full bg-emerald-500/30"></div>
              <div className="relative w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
            </div>
          </AdvancedMarker>

          {/* Animated Car Marker during Route Navigation */}
          {isNavigating && (
            <AdvancedMarker position={carPosition} zIndex={1500} title="Tu Vehículo en Ruta">
              <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white shadow-2xl flex items-center justify-center text-emerald-400 animate-car-pulse -translate-x-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-[20px]">navigation</span>
              </div>
            </AdvancedMarker>
          )}

          {/* Only Stations Matching Current Distance & Filter */}
          {filteredStations.map((station) => {
            const isSelected = station.id === selectedStation.id;
            const isOccupied = station.availableCount === 0;

            return (
              <AdvancedMarker
                key={station.id}
                position={{ lat: station.lat, lng: station.lng }}
                zIndex={isSelected ? 1000 : 100}
                onClick={() => onSelectStation(station)}
                title={`${station.name} (${station.distanceKm} km)`}
              >
                {isSelected ? (
                  /* Pin Selected (e.g. C.C. Oviedo, Santafé, Viva Envigado) */
                  <div
                    onClick={() => onSelectStation(station)}
                    className="flex flex-col items-center cursor-pointer transition-transform duration-200 transform hover:scale-105 -translate-x-1/2 -translate-y-full"
                  >
                    <div className="bg-white border-2 border-emerald-500 rounded-lg p-1.5 shadow-[0_8px_20px_rgba(0,108,73,0.25)] flex items-center space-x-1.5 whitespace-nowrap ring-4 ring-emerald-500/15">
                      <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                      </div>
                      <div className="text-left pr-1">
                        <div className="text-[11px] font-bold text-slate-900 flex items-center">
                          {station.name}
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium leading-tight">
                          <span className="font-bold text-emerald-700">
                            {station.availableCount}/{station.totalCount} Libres
                          </span>{' '}
                          • {station.distanceKm} km • ${station.ratePerKwh.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-emerald-500 transform rotate-45 -mt-1.5"></div>
                  </div>
                ) : isOccupied ? (
                  /* Occupied Pin (e.g. Unicentro) */
                  <div
                    onClick={() => onSelectStation(station)}
                    className="flex flex-col items-center cursor-pointer opacity-90 transition-transform duration-200 hover:scale-105 -translate-x-1/2 -translate-y-full"
                  >
                    <div className="bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-sm flex items-center space-x-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-[10px] text-slate-700 font-semibold">
                        {station.name} • {station.distanceKm} km (Ocupado)
                      </span>
                    </div>
                    <div className="w-2 h-2 bg-white border-r border-b border-slate-300 transform rotate-45 -mt-1"></div>
                  </div>
                ) : (
                  /* Available Pin */
                  <div
                    onClick={() => onSelectStation(station)}
                    className="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105 -translate-x-1/2 -translate-y-full"
                  >
                    <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-md flex items-center space-x-1.5 whitespace-nowrap">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs">ev_station</span>
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-slate-800">{station.name}</div>
                        <div className="text-[9px] text-slate-500 font-medium">
                          {station.availableCount}/{station.totalCount} Libres •{' '}
                          <span className="text-emerald-700 font-bold">{station.distanceKm} km</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-white border-r border-b border-slate-200 transform rotate-45 -mt-1"></div>
                  </div>
                )}
              </AdvancedMarker>
            );
          })}
        </Map>

        {/* Empty State when no stations match distance filter */}
        {filteredStations.length === 0 && (
          <div className="absolute top-24 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-slate-400">location_off</span>
            <p className="text-xs font-bold text-slate-800">
              No se encontraron centros comerciales a menos de {selectedRadiusKm} km
            </p>
            <p className="text-[11px] text-slate-500">
              Aumenta el radio a 5 km o 10 km para ver las electrolineras cercanas.
            </p>
            <button
              onClick={() => setSelectedRadiusKm(5)}
              className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
            >
              Ver a 5 km
            </button>
          </div>
        )}

        {/* List View Overlay */}
        {isListView && (
          <div className="absolute inset-0 z-25 bg-white/95 backdrop-blur-md p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Centros Comerciales Filtrados ({filteredStations.length})
                </h3>
                <p className="text-[10px] text-slate-500">
                  {selectedRadiusKm > 0 ? `Radio: hasta ${selectedRadiusKm} km` : 'Todas las distancias'}
                </p>
              </div>
              <button
                onClick={() => setIsListView(false)}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Ver en mapa
              </button>
            </div>
            <div className="space-y-2 pb-32">
              {filteredStations.map((st) => (
                <div
                  key={st.id}
                  onClick={() => {
                    handleFocusStation(st);
                    setIsListView(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    st.id === selectedStation.id
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{st.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {st.distanceKm} km
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{st.address}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      ${st.ratePerKwh.toLocaleString()} COP
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px]">
                    <span className="text-emerald-700 font-bold">
                      {st.availableCount}/{st.totalCount} Libres
                    </span>
                    <span>•</span>
                    <span className="text-slate-600">{st.maxPowerKw} kW Máx</span>
                    <span>•</span>
                    <span className="text-slate-500">{st.drivingMinutes} min en auto</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Interactive Bottom Sheet (Station Preview Drawer - Level 3 Elevation) */}
      <div className="relative z-30 bg-white rounded-t-[24px] border-t border-slate-200/80 shadow-[0_-12px_32px_rgba(15,23,42,0.14)] px-4 pt-2.5 pb-3 transition-all duration-300">
        {/* Drag Handle Bar */}
        <div className="w-9 h-1 bg-slate-300 rounded-full mx-auto mb-2.5"></div>

        {/* Station Header & Verified Badge */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                {selectedStation.name}
              </h1>
              {selectedStation.verified && (
                <span
                  className="material-symbols-outlined material-symbols-fill text-emerald-600 text-base"
                  title="Verificado ExceCharge"
                >
                  verified
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              {selectedStation.isOpen24h && (
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                  Abierto 24h
                </span>
              )}
              <span className="text-xs text-slate-500 flex items-center font-medium">
                <span className="material-symbols-outlined text-xs mr-0.5 text-emerald-600">
                  near_me
                </span>
                <strong className="text-slate-800 font-mono mr-1">{selectedStation.distanceKm} km</strong> • {selectedStation.drivingMinutes} min en auto
              </span>
            </div>
          </div>

          {/* Real-time Rate Indicator */}
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              Tarifa kWh
            </div>
            <div className="text-base sm:text-lg text-slate-900 font-extrabold font-mono">
              ${selectedStation.ratePerKwh.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">COP</span>
            </div>
          </div>
        </div>

        {/* Connector Availability Matrix */}
        <div className="mt-2.5 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-600 flex justify-between items-center">
            <span>PUESTOS DE CARGA DISPONIBLES</span>
            <span className="text-emerald-700 font-bold">
              {selectedStation.availableCount} de {selectedStation.totalCount} libres
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {selectedStation.connectors.slice(0, 3).map((conn) => {
              const isSelected = selectedConnector?.id === conn.id;
              const isOccupied = conn.status === 'occupied';

              if (isOccupied) {
                return (
                  <div
                    key={conn.id}
                    className="bg-slate-50 border border-slate-200/60 rounded-lg p-2 flex flex-col justify-between opacity-75 select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{conn.name}</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    </div>
                    <div className="mt-1">
                      <div className="text-[11px] font-semibold text-slate-500 line-through">
                        {conn.power}
                      </div>
                      <div className="text-[9px] text-slate-500 leading-tight">
                        {conn.statusLabel}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={conn.id}
                  onClick={() => setSelectedConnector(conn)}
                  className={`rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-2xs'
                      : 'bg-white border border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold ${
                        isSelected ? 'text-emerald-900' : 'text-slate-800'
                      }`}
                    >
                      {conn.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="mt-1">
                    <div className="text-[11px] font-extrabold text-slate-900">{conn.power}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Disponible</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Amenities Badges Ribbon */}
        <div className="flex items-center space-x-2 mt-2.5 overflow-x-auto no-scrollbar">
          {selectedStation.amenities.map((amenity, idx) => (
            <div
              key={idx}
              className="flex items-center shrink-0 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600 font-medium"
            >
              <span className="material-symbols-outlined text-xs mr-1">
                {amenity.includes('Caf')
                  ? 'local_cafe'
                  : amenity.includes('Baño')
                  ? 'wc'
                  : amenity.includes('Segur')
                  ? 'security'
                  : 'wifi'}
              </span>
              {amenity}
            </div>
          ))}
        </div>

        {/* Dual Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <button
            onClick={handleToggleNavigation}
            className={`col-span-1 h-12 border rounded-lg flex flex-col items-center justify-center active:scale-95 transition-all ${
              isNavigating
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">
              {isNavigating ? 'close' : 'directions'}
            </span>
            <span className="text-[10px] font-semibold">{isNavigating ? 'Cancelar' : 'Ruta'}</span>
          </button>

          <button
            onClick={() => onStartReservation(selectedStation, selectedConnector)}
            className="col-span-3 h-12 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-lg font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined material-symbols-fill">electric_bolt</span>
            <span>
              Reservar Conector{' '}
              {selectedConnector?.type.includes('CCS2')
                ? 'CCS2'
                : selectedConnector?.name || 'CCS2'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
