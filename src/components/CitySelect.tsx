import React from "react";
import { dictionary } from "../data/dictionary";

interface CitySelectProps {
  country: string;
  province?: string;
  city?: string;
  onChange: (city: string) => void;
  isChinaOptional?: boolean;
}

const CitySelect: React.FC<CitySelectProps> = ({
  country,
  province,
  city,
  onChange,
  isChinaOptional = false,
}) => {
  if (country === "CN") {
    if (!province) return null;
    const cities = dictionary.CN.cities[province] || {};
    return (
      <select
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        value={city || ""}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">
          {isChinaOptional ? "No City (entire province)" : "Select City"}
        </option>
        {Object.entries(cities).map(([key, value]) => (
          <option key={key} value={key}>
            {typeof value === "string" ? value : value.name}
          </option>
        ))}
      </select>
    );
  }
  // For other countries, city is required
  const cities = dictionary[country]?.cities || {};
  return (
    <select
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={city || ""}
      onChange={e => onChange(e.target.value)}
      required
    >
      <option value="" disabled>
        Select City
      </option>
      {Object.entries(cities).map(([key, value]) => (
        <option key={key} value={key}>
          {typeof value === "string" ? value : value.name}
        </option>
      ))}
    </select>
  );
};

export default CitySelect;
