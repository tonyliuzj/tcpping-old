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
  mode: "default" | "country" | "lookup";
  countryData?: { name: string; code: string; lat: number; lon: number };
  cities?: { name: string; lat: number; lon: number }[];
  ipLocations?: { ip: string; label?: string; lat: number; lon: number }[];
}

const WorldMap: React.FC<WorldMapProps> = ({
  mode,
  countryData,
  cities = [],
  ipLocations = [],
}) => {
  // ...rest of your code...
  let center: [number, number] = [20, 0];
  let zoom = 2;
  let markers: React.ReactNode[] = [];
  let bounds: [[number, number], [number, number]] | undefined;

  if (mode === "country" && countryData) {
    center = [countryData.lat, countryData.lon];
    zoom = 4;
    if (cities.length === 1) {
      center = [cities[0].lat, cities[0].lon];
      zoom = 7;
    } else if (cities.length > 1) {
      const lats = cities.map(c => c.lat);
      const lons = cities.map(c => c.lon);
      bounds = [
        [Math.min(...lats), Math.min(...lons)],
        [Math.max(...lats), Math.max(...lons)]
      ];
    }
    markers = cities.map((c, i) => (
      <Marker key={i} position={[c.lat, c.lon]} icon={markerIcon}>
        <Tooltip>{c.name}</Tooltip>
      </Marker>
    ));
  } else if (mode === "lookup" && ipLocations.length) {
    if (ipLocations.length === 1) {
      center = [ipLocations[0].lat, ipLocations[0].lon];
      zoom = 7;
    } else if (ipLocations.length > 1) {
      const lats = ipLocations.map(c => c.lat);
      const lons = ipLocations.map(c => c.lon);
      bounds = [
        [Math.min(...lats), Math.min(...lons)],
        [Math.max(...lats), Math.max(...lons)]
      ];
    }
    markers = ipLocations.map((ip, i) => (
      <Marker key={ip.ip || i} position={[ip.lat, ip.lon]} icon={markerIcon}>
        <Tooltip>{ip.label || ip.ip}</Tooltip>
      </Marker>
    ));
  } else {
    markers = [];
    zoom = 2;
    center = [20, 0];
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: "100%", height: "500px", borderRadius: 16, minWidth: 320 }}
      scrollWheelZoom={true}
      attributionControl={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} bounds={bounds} />
      {markers}
    </MapContainer>
  );
};

export default WorldMap;
