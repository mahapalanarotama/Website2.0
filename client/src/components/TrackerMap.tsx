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
function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 70%, 50%)`;
}

const TrackerMap: React.FC<TrackerMapProps> = ({ points, history = [] }) => {
  if (!points.length && !history.length) return <div>Tidak ada data tracker.</div>;
  const center = points.length ? [points[0].lat, points[0].lon] : [history[0].lat, history[0].lon];

  // Group history by user
  const grouped: Record<string, TrackerPoint[]> = {};
  history.forEach(p => {
    if (!grouped[p.nama]) grouped[p.nama] = [];
    grouped[p.nama].push(p);
  });

  return (
    <LeafletMap {...({ center, zoom: 13, style: { height: '400px', width: '100%' }, scrollWheelZoom: true } as MapContainerProps)}>
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
      {/* Draw markers for each point */}
      {history.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lon]}>
          <Popup>
            <b>{p.nama}</b><br/>
            {p.time}
          </Popup>
        </Marker>
      ))}
      {/* Draw latest points as well */}
      {points.map((p, i) => (
        <Marker key={`latest-${i}`} position={[p.lat, p.lon]}>
          <Popup>
            <b>{p.nama} (Terakhir)</b><br/>
            {p.time}
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
};

export default TrackerMap;
