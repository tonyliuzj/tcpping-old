import React from "react";
import dynamic from "next/dynamic";
const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false });
import { 
  DictionaryType, 
  IpInfoResult 
} from "../types";

interface MapPanelProps {
  dictionary: DictionaryType | null | undefined;
  lookupType: "empty" | "ipv4" | "ipv6" | "hostname" | "invalid";
  ipInfoResults: IpInfoResult[] | null;
  selectedCountry: string;
  selectedProvince: string;
  selectedCity: string;
  isMobile: boolean;
}

const MapPanel: React.FC<MapPanelProps> = ({
  dictionary,
  lookupType,
  ipInfoResults,
  selectedCountry,
  selectedProvince,
  selectedCity,
  isMobile,
}) => {
  // Logic moved here!
  type MapMode = "default" | "country" | "province" | "city" | "lookup";
  let mapMode: MapMode = "default";
  let focusObj: { name: string; code: string; lat: number; lon: number } | undefined = undefined;
  let markerPoints: { name: string; code: string; lat: number; lon: number }[] = [];
  let ipLocations: { ip: string; label: string; lat: number; lon: number }[] = [];
  let mapCenter: [number, number] | undefined = undefined;
  let mapZoom: number | undefined = undefined;

  // 1. IP lookup
  if (lookupType === "ipv4" || lookupType === "ipv6") {
    if (ipInfoResults && ipInfoResults.length > 0) {
      mapMode = "lookup";
      ipLocations = ipInfoResults
        .flatMap(r => (r.ok && r.latitude && r.longitude) ? [{
          ip: r.ip,
          label: `${r.provider}: ${r.ip}`,
          lat: r.latitude,
          lon: r.longitude
        }] : []);
      mapCenter = [ipLocations[0].lat, ipLocations[0].lon];
      mapZoom = 8;
    }
  }
  // 2. Province in China selected: show all cities in that province
  else if (
    selectedCountry === "CN" &&
    selectedProvince &&
    dictionary?.CN?.provinces?.[selectedProvince]
  ) {
    const provData = dictionary.CN.provinces[selectedProvince];
    focusObj = {
      name: provData.name,
      code: selectedProvince,
      lat: provData.loc.lat,
      lon: provData.loc.lon,
    };
    mapMode = "province";
    mapCenter = [focusObj.lat, focusObj.lon];
    mapZoom = 8;
    if (provData.cities) {
      markerPoints = Object.entries(provData.cities).map(([cityCode, c]) => ({
        name: c.name,
        code: cityCode,
        lat: c.loc.lat,
        lon: c.loc.lon,
      }));
    }
  }
  // 3. City selected (any country): show only that city
  else if (
    selectedCountry &&
    selectedCity &&
    (
      (selectedCountry === "CN" && selectedProvince && dictionary?.CN?.provinces?.[selectedProvince]?.cities?.[selectedCity]) ||
      (selectedCountry !== "CN" && dictionary?.[selectedCountry]?.cities?.[selectedCity])
    )
  ) {
    let cityData: { name: string; loc: { lat: number; lon: number } } | undefined;
    const cityCode: string = selectedCity;
    if (selectedCountry === "CN" && selectedProvince && dictionary?.CN?.provinces?.[selectedProvince]?.cities?.[selectedCity]) {
      cityData = dictionary.CN.provinces[selectedProvince].cities[selectedCity];
    } else if (selectedCountry !== "CN" && dictionary?.[selectedCountry]?.cities?.[selectedCity]) {
      cityData = dictionary[selectedCountry].cities[selectedCity];
    }
    if (cityData) {
      focusObj = {
        name: cityData.name,
        code: cityCode,
        lat: cityData.loc.lat,
        lon: cityData.loc.lon,
      };
      mapMode = "city";
      mapCenter = [focusObj.lat, focusObj.lon];
      mapZoom = 10;
      markerPoints = [focusObj];
    }
  }
  // 4. China selected: show pointers for all its provinces
  else if (
    selectedCountry === "CN" &&
    dictionary?.CN?.provinces
  ) {
    const countryData = dictionary.CN;
    focusObj = {
      name: countryData.name,
      code: "CN",
      lat: countryData.loc.lat,
      lon: countryData.loc.lon
    };
    mapMode = "country";
    mapCenter = [focusObj.lat, focusObj.lon];
    mapZoom = 5;
    markerPoints = Object.entries(countryData.provinces!).map(([provCode, p]) => ({
      name: p.name,
      code: provCode,
      lat: p.loc.lat,
      lon: p.loc.lon,
    }));
  }
  // 5. Any other country selected: show pointers for its cities
  else if (
    selectedCountry &&
    selectedCountry !== "CN" &&
    dictionary?.[selectedCountry]?.cities
  ) {
    const countryData = dictionary[selectedCountry];
    focusObj = {
      name: countryData.name,
      code: selectedCountry,
      lat: countryData.loc.lat,
      lon: countryData.loc.lon
    };
    mapMode = "country";
    mapCenter = [focusObj.lat, focusObj.lon];
    mapZoom = 5;
    markerPoints = Object.entries(countryData.cities!).map(([cityCode, c]) => ({
      name: c.name,
      code: cityCode,
      lat: c.loc.lat,
      lon: c.loc.lon,
    }));
  }

  if (isMobile) return null;

  return (
    <div
      className="flex-1 min-w-[360px] max-w-[100vw] mr-0 md:mr-8 sticky top-26 self-start"
      style={{
        height: "calc(100vh - 64px)",
        maxHeight: "calc(100vh - 64px)",
      }}
    >
      <WorldMap
        mode={mapMode}
        cities={markerPoints}
        ipLocations={ipLocations}
        center={mapCenter}
        zoom={mapZoom}
      />
    </div>
  );
};

export default MapPanel;
