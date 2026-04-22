// src/components/admin/InteractiveMap.jsx
"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default function InteractiveMap() {
  // Titik tengah peta: Koordinat Kota Tasikmalaya
  const centerPosition = [-7.3274, 108.2232];

  // Data Dummy Laporan dari Masyrakat (Sesuai dengan TRC sebelumnya)
  const disasterPoints = [
    { 
      id: 1, 
      pos: [-7.332301, 108.214150], 
      kategori: "Banjir", 
      status: "Valid (Penanganan)", 
      skala: "Tinggi",
      color: "red"
    },
    { 
      id: 2, 
      pos: [-7.327890, 108.221560], 
      kategori: "Pohon Tumbang", 
      status: "Menunggu Validasi TRC", 
      skala: "Belum Ditentukan",
      color: "orange"
    },
    { 
      id: 3, 
      pos: [-7.350000, 108.200000], 
      kategori: "Longsor", 
      status: "Valid (Penanganan)", 
      skala: "Sedang",
      color: "red"
    }
  ];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0 relative">
      <MapContainer 
        center={centerPosition} 
        zoom={14} 
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
          center={centerPosition} 
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.05 }} 
          radius={3000} 
        />

        {/* Marker Laporan Bencana */}
        {disasterPoints.map((point) => (
          <Marker key={point.id} position={point.pos}>
            <Popup className="font-sans">
              <div className="p-1">
                <h3 className="font-bold text-slate-900 mb-1 text-sm">{point.kategori}</h3>
                <p className="text-xs text-slate-600 mb-1">Status: <span className="font-bold text-slate-800">{point.status}</span></p>
                <p className="text-xs text-slate-600">Skala: <span className={`font-bold ${point.skala === 'Tinggi' ? 'text-red-600' : 'text-orange-600'}`}>{point.skala}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}