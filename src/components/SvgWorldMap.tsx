import React, { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

import geoUrl from "../data/world-topo.json";

export interface WorldMapProps {
  mode: "default" | "country" | "province" | "city" | "lookup";
  cities?: { name: string; lat: number; lon: number }[];
  ipLocations?: { ip: string; label?: string; lat: number; lon: number }[];
  center?: [number, number]; // [lat, lon]
  zoom?: number; // Leaflet scale usually
  activeCountry?: string;
}

// Convert Leaflet Zoom to react-simple-maps zoom
// Leaflet 2 (World) -> RSM 1
// Leaflet 5 (Country) -> RSM 4
// Leaflet 8 (Province) -> RSM 10
// Leaflet 10 (City) -> RSM 20
const mapZoomLevel = (lZoom: number) => {
  if (lZoom <= 2) return 1;
  if (lZoom <= 5) return 3;
  if (lZoom <= 8) return 8;
  return 15;
};

const SvgWorldMap: React.FC<WorldMapProps> = ({
  mode,
  cities = [],
  ipLocations = [],
  center = [20, 0],
  zoom = 2,
  activeCountry,
}) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Combine markers
  const markers = useMemo(() => {
    const list: Array<{ lat: number; lon: number; name: string; type: 'city' | 'ip' }> = [];
    
    cities.forEach(c => list.push({ ...c, type: 'city' }));
    ipLocations.forEach(ip => list.push({ lat: ip.lat, lon: ip.lon, name: ip.label || ip.ip, type: 'ip' }));
    
    return list;
  }, [cities, ipLocations]);

  // Map center: Props are [lat, lon], RSM needs [lon, lat]
  const rsmCenter: [number, number] = [center[1], center[0]];
  const rsmZoom = mapZoomLevel(zoom);

  const handleMouseEnter = (name: string, event: React.MouseEvent) => {
    setTooltipContent(name);
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  return (
    <div 
      className="w-full h-[500px] bg-[#1a1a1a] rounded-2xl overflow-hidden relative border border-gray-800 shadow-xl"
      onMouseMove={tooltipContent ? handleMouseMove : undefined}
    >
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }} className="w-full h-full">
        <ZoomableGroup 
          center={rsmCenter} 
          zoom={rsmZoom}
          minZoom={1}
          maxZoom={100}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const countryName = geo.properties.name;
                const isChina =
                  countryName === "China" || countryName === "Taiwan";
                const displayName = countryName === "Taiwan" ? "China" : countryName;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e: any) => handleMouseEnter(displayName, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: isChina ? "#32465a" : "#2b3543",
                        stroke: "#1f2a37",
                        strokeWidth: 0.6,
                        outline: "none",
                      },
                      hover: {
                        fill: "#3c5369",
                        stroke: "#4b5563",
                        strokeWidth: 0.8,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#32465a",
                        stroke: "#1f2a37",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {markers.map((marker, i) => (
            <Marker key={i} coordinates={[marker.lon, marker.lat]}>
              <circle
                r={marker.type === 'ip' ? 4 : 3}
                fill={marker.type === 'ip' ? "#F59E0B" : "#3B82F6"} // Amber for IP, Blue for Cities
                stroke="#fff"
                strokeWidth={1}
                className="animate-pulse"
                onMouseEnter={(e) => handleMouseEnter(marker.name, e)}
                onMouseLeave={handleMouseLeave}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 px-3 py-1 text-sm text-white bg-black bg-opacity-80 rounded pointer-events-none backdrop-blur-sm border border-gray-700"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y + 10,
          }}
        >
          {tooltipContent}
        </div>
      )}
      
      {/* Overlay Info (Cool Factor) */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono">
        LAT: {center[0].toFixed(2)} | LON: {center[1].toFixed(2)} | ZOOM: {rsmZoom}
      </div>
    </div>
  );
};

export default SvgWorldMap;
