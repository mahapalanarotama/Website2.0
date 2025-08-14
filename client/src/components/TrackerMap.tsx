import React from 'react';
import { MapContainer as LeafletMap, TileLayer as LeafletTileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackerPoint {
  lat: number;
  lon: number;
  nama: string;
  time?: string;
}

interface TrackerMapProps {
  points: TrackerPoint[];
  history?: TrackerPoint[];
}

// Helper: generate color for each user
export function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 70%, 50%)`;
}

const TrackerMap: React.FC<TrackerMapProps> = ({ points, history = [] }) => {
  // Center default ke Jawa Timur jika tidak ada data
  // Koordinat Surabaya, Jawa Timur: -7.250445, 112.768845
  const defaultCenter: [number, number] = [-7.250445, 112.768845];
  // Fokus ke penanda terbaru (data terakhir)
  let center: [number, number] = defaultCenter;
  let zoom = 13;
  if (points.length) {
    // Ambil data terbaru (terakhir di array)
    const last = points[points.length - 1];
    center = [last.lat, last.lon];
    zoom = 17;
  } else if (history.length) {
    const last = history[history.length - 1];
    center = [last.lat, last.lon];
    zoom = 17;
  }

  // Group history by user
  const grouped: Record<string, TrackerPoint[]> = {};
  history.forEach(p => {
    if (!grouped[p.nama]) grouped[p.nama] = [];
    grouped[p.nama].push(p);
  });

  // Ambil lokasi terakhir tiap user dari history
  const lastLocationPerUser: Record<string, TrackerPoint> = {};
  Object.entries(grouped).forEach(([nama, pts]) => {
    // Urutkan berdasarkan waktu jika ada, ambil yang terbaru
    const sorted = pts.slice().sort((a, b) => {
      if (a.time && b.time) return (''+a.time).localeCompare(b.time);
      return 0;
    });
    lastLocationPerUser[nama] = sorted[sorted.length - 1];
  });

  return (
    <div style={{ position: 'relative' }}>
      <LeafletMap {...({ center, zoom, style: { height: '400px', width: '100%' }, scrollWheelZoom: true } as MapContainerProps)}>
        <LeafletTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // @ts-ignore
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Draw polyline for each user */}
        {Object.entries(grouped).map(([nama, pts]) => (
          <Polyline
            key={nama}
            positions={pts.map(p => [p.lat, p.lon]) as [number, number][]}
            pathOptions={{ color: getColor(nama), weight: 4 }}
          />
        ))}
        {/* Draw only the last marker for each user */}
        {Object.values(lastLocationPerUser).map((p, i) => (
          <Marker key={p.nama || i} position={[p.lat, p.lon]}>
            <Popup>
              <b>{p.nama}</b><br/>
              {p.time}
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
      {(!points.length && !history.length) && (
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',background:'rgba(255,255,255,0.7)',fontWeight:'bold',fontSize:'1.1rem',color:'#888'}}>Tidak ada data tracker.</div>
      )}
    </div>
  );
};

export default TrackerMap;
