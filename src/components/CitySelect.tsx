import React from "react";
import { dictionary } from "../data/dictionary";

interface Props {
  province?: string;
  value?: string;
  onChange: (v: string) => void;
}

export function CitySelect({ province, value, onChange }: Props) {
  const cities = province ? dictionary.cities[province] || {} : {};
  return (
    <div>
      <label className="block mb-1 font-medium">City (optional)</label>
      <select
        className="w-full border rounded p-2"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={!province}
      >
        <option value="">
          Do Not Include City
        </option>
        {Object.entries(cities).map(([code, name]) => (
          <option key={code} value={code}>
            {String(name)} ({code})
          </option>
        ))}
      </select>
    </div>
  );
}
