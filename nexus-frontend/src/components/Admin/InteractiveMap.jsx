// src/components/admin/InteractiveMap.jsx
"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default function InteractiveMap({
  disasterReports = [],
  logisticPoints = [],
  faskesPoints = [],
  mapCenter = [-2.5, 118],
  mapZoom = 5,
  mapRadius = 200000,
}) {

  const getReportColor = (report) => {
    if (report.status === 'ditolak') return '#ef4444';
    if (report.status === 'menunggu' || report.status === 'menunggu_admin') return '#f59e0b';
    if (report.emergencyScale === 'tinggi') return '#dc2626';
    if (report.emergencyScale === 'sedang') return '#f97316';
    return '#2563eb';
  };

  const getResourceColor = (status, type) => {
    if (status === 'penuh') return '#ef4444';
    if (status === 'menipis') return '#f59e0b';
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
        {/* Layer Peta Dasar dari OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Lingkaran Radius Pemantauan BPBD */}
        <Circle 
          center={mapCenter} 
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.05 }} 
          radius={mapRadius} 
        />

        {/* Marker Laporan Bencana */}
        {disasterReports.map((point) => (
          <CircleMarker key={point.id} center={point.coordinates} radius={9} pathOptions={{ color: getReportColor(point), fillColor: getReportColor(point), fillOpacity: 0.8 }}>
            <Popup className="font-sans">
              <div className="p-1">
                <h3 className="font-bold text-slate-900 mb-1 text-sm">Laporan {point.category}</h3>
                <p className="text-xs text-slate-600 mb-1">Status: <span className="font-bold text-slate-800">{point.status}</span></p>
                <p className="text-xs text-slate-600">Skala: <span className="font-bold">{point.emergencyScale}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Marker Logistik */}
        {logisticPoints.map((point) => (
          <CircleMarker key={point.id} center={point.coordinates} radius={7} pathOptions={{ color: getResourceColor(point.status, 'logistik'), fillColor: getResourceColor(point.status, 'logistik'), fillOpacity: 0.9 }}>
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
        {faskesPoints.map((point) => (
          <CircleMarker key={point.id} center={point.coordinates} radius={7} pathOptions={{ color: getResourceColor(point.status, 'faskes'), fillColor: getResourceColor(point.status, 'faskes'), fillOpacity: 0.9 }}>
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