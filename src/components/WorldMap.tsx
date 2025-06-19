import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

// Helper for smooth flyTo/fitting bounds
const MapUpdater = React.memo(function MapUpdater({
  center,
  zoom,
  bounds
}: {
  center?: [number, number],
  zoom?: number,
  bounds?: [[number, number], [number, number]]
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds[0][0] !== bounds[1][0] && bounds[0][1] !== bounds[1][1]) {
      map.flyToBounds(bounds, { duration: 1.2, padding: [30, 30] });
    } else if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, bounds, map]);
  return null;
});

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export interface WorldMapProps {
  mode: "default" | "country" | "province" | "city" | "lookup";
  cities?: { name: string; lat: number; lon: number }[];
  ipLocations?: { ip: string; label?: string; lat: number; lon: number }[];
  center?: [number, number];
  zoom?: number;
}

const WorldMap: React.FC<WorldMapProps> = ({
  mode,
  cities = [],
  ipLocations = [],
  center,
  zoom,
}) => {
  let markers: React.ReactNode[] = [];
  let bounds: [[number, number], [number, number]] | undefined = undefined;

  // City/province/country markers (all use cities array)
  if (mode === "country" || mode === "province" || mode === "city") {
    markers = cities.map((c, i) => (
      <Marker key={i} position={[c.lat, c.lon]} icon={markerIcon}>
        <Tooltip>{c.name}</Tooltip>
      </Marker>
    ));
    if (cities.length > 1) {
      const lats = cities.map(c => c.lat);
      const lons = cities.map(c => c.lon);
      bounds = [
        [Math.min(...lats), Math.min(...lons)],
        [Math.max(...lats), Math.max(...lons)],
      ];
    }
  }

  // IP lookup markers
  if (mode === "lookup" && ipLocations.length) {
    markers = ipLocations.map((ip, i) => (
      <Marker key={ip.ip || i} position={[ip.lat, ip.lon]} icon={markerIcon}>
        <Tooltip>{ip.label || ip.ip}</Tooltip>
      </Marker>
    ));
    if (ipLocations.length > 1) {
      const lats = ipLocations.map(c => c.lat);
      const lons = ipLocations.map(c => c.lon);
      bounds = [
        [Math.min(...lats), Math.min(...lons)],
        [Math.max(...lats), Math.max(...lons)],
      ];
    }
  }

  // Use props or default for center/zoom
  const mapCenter = center ?? [20, 0];
  const mapZoom = zoom ?? 2;

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ width: "100%", height: "500px", borderRadius: 16, minWidth: 320 }}
      scrollWheelZoom={true}
      attributionControl={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={mapCenter} zoom={mapZoom} bounds={bounds} />
      {markers}
    </MapContainer>
  );
};

export default WorldMap;
