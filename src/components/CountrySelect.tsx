import React from "react";
import { dictionary } from "../data/dictionary";

interface CountrySelectProps {
  value: string;
  onChange: (val: string) => void;
}

const countryList = Object.keys(dictionary).map((code) => {
  let name: string;
  switch (code) {
    case "CN":
      name = "China";
      break;
    case "US":
      name = "United States";
      break;
    case "DE":
      name = "Germany";
      break;
    default:
      name = code;
  }
  return { code, name };
});

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium">Country</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="" disabled hidden>
        Select country
      </option>
      {countryList.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  </div>
);

export default CountrySelect;
