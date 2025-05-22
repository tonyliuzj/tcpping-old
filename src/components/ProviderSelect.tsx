import React from "react";
import { dictionary } from "../data/dictionary";

interface Props {
  value?: string;
  onChange: (v: string) => void;
}

export function ProviderSelect({ value, onChange }: Props) {
  return (
    <div>
      <label className="block mb-1 font-medium">Provider *</label>
      <select
        className="w-full border rounded p-2"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      >
        <option value="" disabled>
          Select Provider
        </option>
        {Object.entries(dictionary.providers).map(([code, name]) => (
          <option key={code} value={code}>
            {String(name)} ({code})
          </option>
        ))}
      </select>
    </div>
  );
}
