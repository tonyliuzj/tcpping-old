import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export interface WorldMapProps {
  cities?: { name: string; lat: number; lon: number }[];
  ipLocations?: { ip: string; label?: string; lat: number; lon: number }[];
}

const WorldMap: React.FC<WorldMapProps> = ({
  cities = [],
  ipLocations = [],
}) => (
  <ComposableMap projection="geoMercator">
    <Geographies geography={geoUrl}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography key={geo.rsmKey} geography={geo} />
        ))
      }
    </Geographies>
    {cities.map((city) => (
      <Marker key={city.name} coordinates={[city.lon, city.lat]}>
        <circle r={5} />
        <text textAnchor="middle" y={-10} style={{ fontSize: 10 }}>
          {city.name}
        </text>
      </Marker>
    ))}
    {ipLocations.map((ip) => (
      <Marker key={ip.ip} coordinates={[ip.lon, ip.lat]}>
        <circle r={4} fill="red" />
        <text textAnchor="middle" y={-10} style={{ fontSize: 8 }}>
          {ip.label || ip.ip}
        </text>
      </Marker>
    ))}
  </ComposableMap>
);

export default WorldMap;
