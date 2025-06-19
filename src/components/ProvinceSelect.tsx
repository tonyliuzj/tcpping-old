import React, { useEffect, useState } from "react";

interface ProvinceSelectProps {
  country: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

interface ProvinceInfo {
  name: string;
}

const ProvinceSelect: React.FC<ProvinceSelectProps> = ({
  country,
  value,
  onChange,
  disabled,
}) => {
  const [provinces, setProvinces] = useState<{ [code: string]: ProvinceInfo }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (country !== "CN") return;
    const fetchDictionary = async () => {
      setLoading(true);
      const res = await fetch("/api/dictionary");
      const data = await res.json();
      setProvinces(data?.CN?.provinces || {});
      setLoading(false);
    };
    fetchDictionary();
  }, [country]);

  if (country !== "CN") return null;

  return (
    <div>
      <label className="block mb-1 font-medium">Province</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${disabled || loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={disabled || loading}
      >
        <option value="" disabled hidden>
          {loading ? "Loading..." : "Select province"}
        </option>
        {Object.entries(provinces).map(([code, obj]) => (
          <option key={code} value={code}>
            {obj.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProvinceSelect;
