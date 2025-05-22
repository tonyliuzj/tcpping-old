import React from "react";
import { dictionary } from "../data/dictionary";

interface ProviderSelectProps {
  country: string;
  province?: string;
  city: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const ProviderSelect: React.FC<ProviderSelectProps> = ({
  country,
  province,
  city,
  value,
  onChange,
  disabled,
}) => {
  let providers: [string, string][] = [];

  if (country === "CN") {
    providers = Object.entries(dictionary.CN.providers);
  } else if (
    country &&
    city &&
    dictionary[country] &&
    "cities" in dictionary[country] &&
    dictionary[country].cities[city]
  ) {
    providers = Object.entries(
      (dictionary[country].cities as any)[city].providers
    );
  }

  return (
    <div>
      <label className="block mb-1 font-medium">Provider</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={disabled}
      >
        <option value="" disabled hidden>
          Select provider
        </option>
        {providers.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProviderSelect;