import React from "react";
import { dictionary } from "../data/dictionary";

interface ProvinceSelectProps {
  country: string;
  province?: string;
  onChange: (province: string) => void;
}

const ProvinceSelect: React.FC<ProvinceSelectProps> = ({
  country,
  province,
  onChange,
}) => {
  if (country !== "CN") return null;

  const provinces = dictionary.CN.provinces;

  return (
    <select
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={province || ""}
      onChange={e => onChange(e.target.value)}
      required
    >
      <option value="" disabled>
        Select Province
      </option>
      {Object.entries(provinces).map(([key, name]) => (
        <option key={key} value={key}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default ProvinceSelect;
