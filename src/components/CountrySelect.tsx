import React, { useEffect, useState } from "react";

interface CountrySelectProps {
  value: string;
  onChange: (val: string) => void;
}

interface CountryItem {
  code: string;
  name: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange }) => {
  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      const res = await fetch("/api/dictionary");
      const data = await res.json();

      // Use the "name" property from each country object
      const list: CountryItem[] = Object.keys(data).map((code) => ({
        code,
        name: data[code].name || code
      }));

      setCountryList(list);
      setLoading(false);
    };

    fetchCountries();
  }, []);

  return (
    <div>
      <label className="block mb-1 font-medium">Country</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      >
        <option value="" disabled hidden>
          {loading ? "Loading..." : "Select country"}
        </option>
        {countryList.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelect;
