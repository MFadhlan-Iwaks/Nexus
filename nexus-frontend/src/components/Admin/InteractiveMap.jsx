// src/components/admin/InteractiveMap.jsx
"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

function MapViewSync({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);

  return null;
}

function EditableCircleCenter({ enabled, onChange }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onChange?.([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

export default function InteractiveMap({
  disasterReports = [],
  logisticPoints = [],
  faskesPoints = [],
  mapCenter = [-7.3274, 108.2207],
  mapZoom = 12,
  mapRadius = 12000,
  circleLabel = 'Pusat Lingkaran Pemantauan',
  isCircleEditable = false,
  onCircleCenterChange,
}) {

  const getReportColor = (report) => {
    if (report.status === 'ditolak') return '#ef4444';
    if (report.status === 'menunggu' || report.status === 'menunggu_admin') return '#f59e0b';
    if (report.emergencyScale === 'tinggi') return '#dc2626';
    if (report.emergencyScale === 'sedang') return '#f97316';
    return '#2563eb';
  };

  const getResourceColor = (status, type) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'habis' || normalized === 'penuh') return '#ef4444';
    if (normalized === 'menipis' || normalized === 'hampir penuh') return '#f59e0b';
    return type === 'faskes' ? '#10b981' : '#3b82f6';
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0 relative">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
      >
        <MapViewSync center={mapCenter} zoom={mapZoom} />
        <EditableCircleCenter enabled={isCircleEditable} onChange={onCircleCenterChange} />

        {/* Layer Peta Dasar dari OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Lingkaran Radius Pemantauan BPBD */}
        {mapRadius > 0 && (
          <Circle
            center={mapCenter}
            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.08 }}
            radius={mapRadius}
          />
        )}
        <CircleMarker center={mapCenter} radius={5} pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 1 }}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm text-slate-800">{circleLabel}</h3>
              <p className="text-xs text-slate-600">{mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}</p>
              <p className="text-xs text-slate-600">Radius: {mapRadius > 0 ? `${(mapRadius / 1000).toFixed(1)} km` : 'Nonaktif'}</p>
            </div>
          </Popup>
        </CircleMarker>

        {/* Marker Laporan Bencana */}
        {disasterReports.filter((point) => Array.isArray(point.coordinates) && point.coordinates.length === 2 && point.coordinates.every(Number.isFinite)).map((point, index) => (
          <CircleMarker key={`${point.id ?? 'report'}-${index}`} center={point.coordinates} radius={9} pathOptions={{ color: getReportColor(point), fillColor: getReportColor(point), fillOpacity: 0.8 }}>
            <Popup className="font-sans">
              <div className="p-1">
                <h3 className="font-bold text-slate-900 mb-1 text-sm">Laporan {point.category}</h3>
                <p className="text-xs text-slate-600 mb-1">Status: <span className="font-bold text-slate-800">{point.status}</span></p>
                <p className="text-xs text-slate-600 mb-1">Skala: <span className="font-bold">{point.emergencyScale}</span></p>
                <p className="text-xs text-slate-600">Fase TRC: <span className="font-bold">{point.phase}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Marker Logistik */}
        {logisticPoints.filter((point) => Array.isArray(point.coordinates) && point.coordinates.length === 2 && point.coordinates.every(Number.isFinite)).map((point, index) => (
          <CircleMarker key={`${point.id ?? 'logistik'}-${index}`} center={point.coordinates} radius={7} pathOptions={{ color: getResourceColor(point.status, 'logistik'), fillColor: getResourceColor(point.status, 'logistik'), fillOpacity: 0.9 }}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm text-slate-800">{point.label}</h3>
                <p className="text-xs text-slate-600">Stok: {point.stock}</p>
                <p className="text-xs text-slate-600">Status: <span className="font-bold">{point.status}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Marker Faskes */}
        {faskesPoints.filter((point) => Array.isArray(point.coordinates) && point.coordinates.length === 2 && point.coordinates.every(Number.isFinite)).map((point, index) => (
          <CircleMarker key={`${point.id ?? 'faskes'}-${index}`} center={point.coordinates} radius={7} pathOptions={{ color: getResourceColor(point.status, 'faskes'), fillColor: getResourceColor(point.status, 'faskes'), fillOpacity: 0.9 }}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm text-slate-800">{point.label}</h3>
                <p className="text-xs text-slate-600">Kapasitas: {point.capacity}</p>
                <p className="text-xs text-slate-600">Status: <span className="font-bold">{point.status}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
