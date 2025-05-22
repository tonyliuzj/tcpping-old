import React from "react";
import { dictionary } from "../data/dictionary";

interface ProvinceSelectProps {
  country: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const ProvinceSelect: React.FC<ProvinceSelectProps> = ({
  country,
  value,
  onChange,
  disabled,
}) => {
  if (country !== "CN") return null;
  const provinces = dictionary.CN.provinces;
  return (
    <div>
      <label className="block mb-1 font-medium">Province</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
        disabled={disabled}
      >
        <option value="" disabled hidden>
          Select province
        </option>
        {Object.entries(provinces).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProvinceSelect;
