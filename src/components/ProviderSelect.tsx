import React, { useEffect, useState } from "react";

interface ProviderSelectProps {
  country: string;
  province?: string;
  city: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

interface DictionaryType {
  [country: string]: any;
}

const ProviderSelect: React.FC<ProviderSelectProps> = ({
  country,
  province,
  city,
  value,
  onChange,
  disabled,
}) => {
  const [dictionary, setDictionary] = useState<DictionaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDictionary = async () => {
      setLoading(true);
      const res = await fetch("/api/dictionary");
      const data = await res.json();
      setDictionary(data);
      setLoading(false);
    };
    fetchDictionary();
  }, []);

  let providers: [string, string][] = [];

  if (!loading && dictionary) {
    if (country === "CN") {
      // City-level providers (highest priority)
      if (
        province &&
        city &&
        dictionary.CN.provinces[province] &&
        dictionary.CN.provinces[province].cities &&
        dictionary.CN.provinces[province].cities[city] &&
        dictionary.CN.provinces[province].cities[city].providers
      ) {
        providers = Object.entries(
          dictionary.CN.provinces[province].cities[city].providers
        ).map(([code, providerObj]: [string, any]) => [code, providerObj.name]);
      }
      // Province-level providers if no city
      else if (
        province &&
        dictionary.CN.provinces[province] &&
        dictionary.CN.provinces[province].providers
      ) {
        providers = Object.entries(
          dictionary.CN.provinces[province].providers
        ).map(([code, providerObj]: [string, any]) => [code, providerObj.name]);
      }
    } else if (
      country &&
      city &&
      dictionary[country] &&
      "cities" in dictionary[country] &&
      dictionary[country].cities[city] &&
      dictionary[country].cities[city].providers
    ) {
      providers = Object.entries(
        dictionary[country].cities[city].providers
      ).map(([code, providerObj]: [string, any]) => [code, providerObj.name]);
    }
  }

  return (
    <div>
      <label className="block mb-1 font-medium">Provider</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${
          disabled || loading ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        disabled={disabled || loading}
      >
        <option value="" disabled hidden>
          {loading ? "Loading..." : "Select provider"}
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
