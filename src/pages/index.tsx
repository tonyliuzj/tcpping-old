import React, { useState } from "react";
import { ProtocolSelect, Protocol } from "../components/ProtocolSelect";
import CountrySelect from "../components/CountrySelect";
import ProvinceSelect from "../components/ProvinceSelect";
import CitySelect from "../components/CitySelect";
import ProviderSelect from "../components/ProviderSelect";
import { dictionary } from "../data/dictionary";

// You may need to change this to match your ProtocolSelect's "dual stack" value:
const DEFAULT_PROTOCOL: Protocol = "dual"; // use actual value for dual stack

const defaultState = {
  protocol: "",
  country: "",
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
  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  // Reset function for all fields
  const handleReset = () => {
    setProtocol(defaultState.protocol);
    setCountry(defaultState.country);
    setProvince(defaultState.province);
    setCity(defaultState.city);
    setProvider(defaultState.provider);
    setCopied(false);
    setGeneratedUrl("");
  };

  // Handle cascading resets
  const handleCountryChange = (val: string) => {
    setCountry(val);
    setProvince("");
    setCity("");
    setProvider("");
    setCopied(false);
    setGeneratedUrl("");
  };
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setCity("");
    setProvider("");
    setCopied(false);
    setGeneratedUrl("");
  };
  const handleCityChange = (val: string) => {
    setCity(val);
    setProvider("");
    setCopied(false);
    setGeneratedUrl("");
  };
  const handleProviderChange = (val: string) => {
    setProvider(val);
    setCopied(false);
    setGeneratedUrl("");
  };
  const handleProtocolChange = (val: Protocol) => {
    setProtocol(val);
    setCopied(false);
    setGeneratedUrl("");
  };

  // Generate URL when button is clicked
  const handleGenerate = () => {
    let url = "";
    if (provider && country) {
      const protocolPrefix = protocol && protocol !== "dual" ? `${protocol}.` : "";
      // CN: province/city logic
      if (country === "CN") {
        if (city) {
          url = `${protocolPrefix}${provider}-${city}.${country.toLowerCase()}.tcpping.top`;
        } else {
          url = `${protocolPrefix}${provider}.${country.toLowerCase()}.tcpping.top`;
        }
      } else if (city) {
        url = `${protocolPrefix}${provider}-${city}.${country.toLowerCase()}.tcpping.top`;
      } else {
        url = `${protocolPrefix}${provider}.${country.toLowerCase()}.tcpping.top`;
      }
    }
    setGeneratedUrl(url);
  };

  // Copy URL
  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // For non-CN countries: no province, show city list directly
  const showProvince = country === "CN";
  const countrySelected = !!country;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">TCPing Host Generator</h1>
        <div className="space-y-4">
          <ProtocolSelect value={protocol} onChange={handleProtocolChange} />
          <CountrySelect value={country} onChange={handleCountryChange} />
          {showProvince && (
            <ProvinceSelect
              country={country}
              value={province}
              onChange={handleProvinceChange}
              disabled={!countrySelected}
            />
          )}
          <CitySelect
            country={country}
            province={showProvince ? province : undefined}
            value={city}
            onChange={handleCityChange}
            disabled={!countrySelected || (showProvince && !province)}
          />
          <ProviderSelect
            country={country}
            province={showProvince ? province : undefined}
            city={city}
            value={provider}
            onChange={handleProviderChange}
            disabled={
              !countrySelected ||
              (showProvince && !province) ||
              (country !== "CN" && !city)
            }
          />
        </div>
        <div className="flex justify-between space-x-2">
          <button
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleGenerate}
            disabled={!provider || !country}
          >
            Generate
          </button>
          <button
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
        <div className="mt-4 text-center">
          {generatedUrl && (
            <div className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2">
              <span className="truncate">{generatedUrl}</span>
              <button
                onClick={handleCopy}
                className="ml-3 text-blue-600 hover:underline"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
