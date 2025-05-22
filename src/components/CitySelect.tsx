import React from "react";
import { dictionary } from "../data/dictionary";

interface CitySelectProps {
  country: string;
  province?: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const CitySelect: React.FC<CitySelectProps> = ({
  country,
  province,
  value,
  onChange,
  disabled,
}) => {
  let cities: [string, string][] = [];

  if (country === "CN") {
    if (province && dictionary.CN.cities[province]) {
      cities = Object.entries(dictionary.CN.cities[province]);
    }
  } else if (country && dictionary[country] && "cities" in dictionary[country]) {
    const cityDict = (dictionary[country] as any).cities;
    cities = Object.entries(cityDict).map(([code, obj]: [string, any]) => [
      code,
      obj.name,
    ]);
  }

  return (
    <div>
      <label className="block mb-1 font-medium">City</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={disabled}
      >
        {/* Always allow (No city) as an option for China */}
        {country === "CN" ? (
          <option value="">
            (No city)
          </option>
        ) : (
          <option value="" disabled hidden>
            Select city
          </option>
        )}
        {cities.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CitySelect;
