import React from "react";
import { dictionary } from "../data/dictionary";

interface Props {
  value?: string;
  onChange: (v: string) => void;
}

export function ProvinceSelect({ value, onChange }: Props) {
  return (
    <div>
      <label className="block mb-1 font-medium">Province/County *</label>
      <select
        className="w-full border rounded p-2"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      >
        <option value="" disabled>
          Select Province/County
        </option>
        {Object.entries(dictionary.provinces).map(([code, name]) => (
          <option key={code} value={code}>
            {String(name)} ({String(code)})
          </option>
        ))}
      </select>
    </div>
  );
}
