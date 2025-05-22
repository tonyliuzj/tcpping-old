import React, { useState } from "react";
import { ProtocolSelect, Protocol } from "../components/ProtocolSelect";
import CitySelect from "../components/CitySelect";
import ProvinceSelect from "../components/ProvinceSelect";
import ProviderSelect from "../components/ProviderSelect";

const countries = [
  { code: "CN", name: "China" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  // ...add more as needed
];

const defaultState = {
  protocol: "" as Protocol,
  country: "CN",
  province: "",
  city: "",
  provider: "",
};

export default function Home() {
  const [protocol, setProtocol] = useState<Protocol>(defaultState.protocol);
  const [country, setCountry] = useState<string>(defaultState.country);
  const [province, setProvince] = useState<string>(defaultState.province);
  const [city, setCity] = useState<string>(defaultState.city);
  const [provider, setProvider] = useState<string>(defaultState.provider);
  const [copied, setCopied] = useState<boolean>(false);

  // Reset function for all fields
  const handleReset = () => {
    setProtocol(defaultState.protocol);
    setCountry(defaultState.country);
    setProvince(defaultState.province);
    setCity(defaultState.city);
    setProvider(defaultState.provider);
    setCopied(false);
  };

  // Handle cascading resets
  const handleCountryChange = (val: string) => {
    setCountry(val);
    setProvince("");
    setCity("");
    setProvider("");
    setCopied(false);
  };
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setCity("");
    setProvider("");
    setCopied(false);
  };
  const handleCityChange = (val: string) => {
    setCity(val);
    setProvider("");
    setCopied(false);
  };
  const handleProviderChange = (val: string) => {
    setProvider(val);
    setCopied(false);
  };
  const handleProtocolChange = (val: Protocol) => {
    setProtocol(val);
    setCopied(false);
  };

  // URL generation logic (China: city is optional)
  let generatedUrl = "";
  if (provider && country) {
    const protocolPrefix = protocol ? `${protocol}.` : ""; // only add dot if protocol exists
    if (country === "CN") {
      if (city) {
        generatedUrl = `${protocolPrefix}${provider}-${city}.${country.toLowerCase()}.tcpping.top`;
      } else {
        generatedUrl = `${protocolPrefix}${provider}.${country.toLowerCase()}.tcpping.top`;
      }
    } else if (city) {
      generatedUrl = `${protocolPrefix}${provider}-${city}.${country.toLowerCase()}.tcpping.top`;
    } else {
      generatedUrl = `${protocolPrefix}${provider}.${country.toLowerCase()}.tcpping.top`;
    }
  }


  // Copy to clipboard function
  const copyToClipboard = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white/80 shadow-xl rounded-2xl p-8 border border-gray-100 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-gray-900">
          TCP Ping Generator
        </h1>
        <form className="space-y-6">
          {/* Protocol selector */}
          <div>
            <label className="block mb-1 text-gray-700 font-semibold">Protocol</label>
            <ProtocolSelect protocol={protocol} onChange={handleProtocolChange} />
          </div>
          {/* Country Selector */}
          <div>
            <label className="block mb-1 text-gray-700 font-semibold">Country</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              value={country}
              onChange={e => handleCountryChange(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Country
              </option>
              {countries.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          {/* Province Selector (China only) */}
          {country === "CN" && (
            <div>
              <label className="block mb-1 text-gray-700 font-semibold">Province</label>
              <ProvinceSelect
                country={country}
                province={province}
                onChange={handleProvinceChange}
              />
            </div>
          )}
          {/* City Selector (China: optional) */}
          <div>
            <label className="block mb-1 text-gray-700 font-semibold">
              City {country !== "CN" && <span className="text-red-500">*</span>}
            </label>
            <CitySelect
              country={country}
              province={country === "CN" ? province : undefined}
              city={city}
              onChange={handleCityChange}
              isChinaOptional={country === "CN"} // pass prop for new logic
            />
          </div>
          {/* Provider Selector */}
          <div>
            <label className="block mb-1 text-gray-700 font-semibold">Provider</label>
            <ProviderSelect
              country={country}
              province={country === "CN" ? province : undefined}
              city={city}
              provider={provider}
              onChange={handleProviderChange}
            />
          </div>
          {/* Buttons */}
          <div className="flex gap-3 pt-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
        {/* Generated URL and Copy Button */}
        {generatedUrl && (
          <div className="mt-8 flex flex-col items-center">
            <div className="p-4 rounded-lg bg-blue-50/80 text-blue-800 font-mono text-center text-sm break-all shadow">
              {generatedUrl}
            </div>
            <button
              type="button"
              className={`mt-4 px-5 py-2 rounded-lg font-semibold transition shadow bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none ${copied ? "bg-green-600" : ""
                }`}
              onClick={copyToClipboard}
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
