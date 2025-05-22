import React from "react";
import { dictionary } from "../data/dictionary";

interface ProviderSelectProps {
  country: string;
  province?: string;
  city?: string;
  provider?: string;
  onChange: (provider: string) => void;
}

const ProviderSelect: React.FC<ProviderSelectProps> = ({
  country,
  city,
  provider,
  onChange,
}) => {
  let providers: Record<string, any> = {};

  if (country === "CN") {
    providers = dictionary.CN.providers;
  } else {
    const cityObj = (dictionary[country] as any)?.cities?.[city || ""] || {};
    providers = cityObj.providers || {};
  }

  return (
    <select
      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={provider || ""}
      onChange={e => onChange(e.target.value)}
      required
    >
      <option value="" disabled>
        Select Provider
      </option>
      {Object.entries(providers).map(([key, value]) => (
        <option key={key} value={key}>
          {typeof value === "string" ? value : value.name}
        </option>
      ))}
    </select>
  );
};

export default ProviderSelect;
