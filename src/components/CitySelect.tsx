import React, { useEffect, useState } from "react";

interface CitySelectProps {
  country: string;
  province?: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

interface CityInfo {
  name: string;
}

interface ProvinceInfo {
  name: string;
  cities?: Record<string, CityInfo>;
}

interface CountryInfo {
  name: string;
  provinces?: Record<string, ProvinceInfo>;
  cities?: Record<string, CityInfo>;
}

interface DictionaryType {
  [country: string]: CountryInfo;
}

const CitySelect: React.FC<CitySelectProps> = ({
  country,
  province,
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

  let cities: [string, string][] = [];

  if (!loading && dictionary) {
    if (country === "CN") {
      if (
        province &&
        dictionary.CN?.provinces?.[province]?.cities
      ) {
        cities = Object.entries(dictionary.CN.provinces[province].cities!).map(
          ([code, obj]) => [code, obj.name]
        );
      }
    } else if (country && dictionary[country] && dictionary[country].cities) {
      const cityDict = dictionary[country].cities!;
      cities = Object.entries(cityDict).map(([code, obj]) => [
        code,
        obj.name,
      ]);
    }
  }

  return (
    <div>
      <label className="block mb-1 font-medium">City</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${
          disabled || loading ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        disabled={disabled || loading}
      >
        {loading ? (
          <option>Loading...</option>
        ) : (
          <>
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
          </>
        )}
      </select>
    </div>
  );
};

export default CitySelect;
