import React, { useEffect, useState } from "react";
import { ProtocolSelect, Protocol } from "./ProtocolSelect";
import CountrySelect from "./CountrySelect";
import ProvinceSelect from "./ProvinceSelect";
import CitySelect from "./CitySelect";
import ProviderSelect from "./ProviderSelect";
import { DictionaryType } from "../types";

interface ProviderInfo {
  v4: boolean;
  v6: boolean;
}

async function checkDomainValid(domain: string) {
  try {
    const checkType = async (type: "A" | "AAAA") => {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
        { headers: { accept: "application/dns-json" } }
      );
      const data = await res.json();
      return Array.isArray(data.Answer) && data.Answer.length > 0;
    };
    const hasA = await checkType("A");
    const hasAAAA = await checkType("AAAA");
    return hasA || hasAAAA;
  } catch {
    return false;
  }
}

const defaultState = {
  protocol: "",
  country: "",
  province: "",
  city: "",
  provider: "",
};

interface GeneratorPanelProps {
  setInputValue: (v: string) => void;
  setDomainStatus: (v: "unknown" | "valid" | "invalid") => void;
  setDomainChecking: (v: boolean) => void;
  setSelectedCountry?: (code: string) => void;
  setSelectedProvince?: (code: string) => void;
  setSelectedCity?: (code: string) => void;
  dictionary?: DictionaryType;
}

const GeneratorPanel: React.FC<GeneratorPanelProps> = ({
  setInputValue,
  setDomainStatus,
  setDomainChecking,
  setSelectedCountry,
  setSelectedProvince,
  setSelectedCity,
  dictionary,
}) => {
  const [protocol, setProtocol] = useState<string>(defaultState.protocol);
  const [country, setCountry] = useState<string>(defaultState.country);
  const [province, setProvince] = useState<string>(defaultState.province);
  const [city, setCity] = useState<string>(defaultState.city);
  const [provider, setProvider] = useState<string>(defaultState.provider);
  const [providerObj, setProviderObj] = useState<ProviderInfo | null>(null);

  // Find provider object
  useEffect(() => {
    const data = dictionary;
    if (!data) return setProviderObj(null);
    let found = null;
  if (country === "CN") {
    const cnData = data?.CN;
    if (province && city && provider && cnData?.provinces?.[province]?.cities?.[city]?.providers?.[provider]) {
      found = cnData.provinces[province].cities[city].providers[provider];
    } else if (province && provider && cnData?.provinces?.[province]?.providers?.[provider]) {
      found = cnData.provinces[province].providers[provider];
    }
  } else if (country && provider) {
    const countryData = data?.[country];
    if (city && countryData?.cities?.[city]?.providers?.[provider]) {
      found = countryData.cities[city].providers[provider];
    } else if (countryData?.providers?.[provider]) {
      found = countryData.providers[provider];
    }
  }
    setProviderObj(found);
  }, [country, province, city, provider, dictionary]);

  // Reset or auto-select protocol when provider changes
  useEffect(() => {
    if (!providerObj) {
      setProtocol("");
      return;
    }
    const available: Protocol[] = [];
    if (providerObj.v4 && providerObj.v6) available.push("dual");
    if (providerObj.v4) available.push("v4");
    if (providerObj.v6) available.push("v6");
    if (!available.includes(protocol as Protocol)) {
      setProtocol(available.length === 1 ? available[0] : "");
    }
  }, [providerObj, protocol]);

  // Inform parent of selections
  useEffect(() => {
    if (setSelectedCountry) setSelectedCountry(country);
    if (setSelectedProvince) setSelectedProvince(province);
    if (setSelectedCity) setSelectedCity(city);
    // eslint-disable-next-line
  }, [country, province, city]);

  // Handlers
  const handleCountryChange = (val: string) => {
    setCountry(val);
    setProvince("");
    setCity("");
    setProvider("");
    setProtocol("");
    if (setSelectedCountry) setSelectedCountry(val);
    if (setSelectedProvince) setSelectedProvince(""); // Reset province in parent
    if (setSelectedCity) setSelectedCity(""); // Reset city in parent
  };
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setCity("");
    setProvider("");
    setProtocol("");
    if (setSelectedProvince) setSelectedProvince(val);
    if (setSelectedCity) setSelectedCity(""); // Reset city in parent
  };
  const handleCityChange = (val: string) => {
    setCity(val);
    setProvider("");
    setProtocol("");
    if (setSelectedCity) setSelectedCity(val);
  };
  const handleProviderChange = (val: string) => setProvider(val);
  const handleProtocolChange = (val: Protocol) => setProtocol(val);

  // Generate URL and validate domain
  const handleGenerate = async () => {
    let url = "";
    const protocolPrefix = protocol && protocol !== "dual" ? `${protocol}.` : "";

    if (country === "CN") {
      if (province && city && provider) {
        url = `${protocolPrefix}${province}-${city}-${provider}.cn.tcpping.top`;
      } else if (province && provider) {
        url = `${protocolPrefix}${province}-${provider}.cn.tcpping.top`;
      } else if (provider) {
        url = `${protocolPrefix}${provider}.cn.tcpping.top`;
      }
    } else if (provider && country) {
      if (city) {
        url = `${protocolPrefix}${provider}-${city}.${country.toLowerCase()}.tcpping.top`;
      } else {
        url = `${protocolPrefix}${provider}.${country.toLowerCase()}.tcpping.top`;
      }
    }
    setInputValue(url);
    setDomainStatus("unknown");
    if (url) {
      setDomainChecking(true);
      const valid = await checkDomainValid(url);
      setDomainStatus(valid ? "valid" : "invalid");
      setDomainChecking(false);
    }
  };

  const handleReset = () => {
    setProtocol(defaultState.protocol);
    setCountry(defaultState.country);
    setProvince(defaultState.province);
    setCity(defaultState.city);
    setProvider(defaultState.provider);
    setDomainStatus("unknown");
    setDomainChecking(false);
    setInputValue("");
    if (setSelectedCountry) setSelectedCountry("");
    if (setSelectedProvince) setSelectedProvince("");
    if (setSelectedCity) setSelectedCity("");
  };

  const showProvince = country === "CN";
  const countrySelected = !!country;
  const provinceSelected = !!province;
  const citySelected = !!city;

  return (
    <div className="flex flex-wrap gap-2 w-full">
      <div className="flex-1 min-w-[140px]">
        <CountrySelect value={country} onChange={handleCountryChange} />
      </div>
      {showProvince && (
        <div className="flex-1 min-w-[140px]">
          <ProvinceSelect
            country={country}
            value={province}
            onChange={handleProvinceChange}
            disabled={!countrySelected}
          />
        </div>
      )}
      <div className="flex-1 min-w-[140px]">
        <CitySelect
          country={country}
          province={showProvince ? province : undefined}
          value={city}
          onChange={handleCityChange}
          disabled={
            !countrySelected ||
            (showProvince && !provinceSelected)
          }
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <ProviderSelect
          country={country}
          province={showProvince ? province : undefined}
          city={city}
          value={provider}
          onChange={handleProviderChange}
          disabled={
            !countrySelected ||
            (showProvince && !provinceSelected) ||
            (country !== "CN" && !citySelected)
          }
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <ProtocolSelect
          value={protocol}
          onChange={handleProtocolChange}
          disabled={!provider}
          v4={providerObj?.v4}
          v6={providerObj?.v6}
        />
      </div>
      <button
        className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition h-fit mt-auto"
        style={{ minWidth: 90 }}
        onClick={handleGenerate}
        disabled={!provider || !country || !protocol}
      >
        Generate
      </button>
      <button
        className="py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition h-fit mt-auto"
        style={{ minWidth: 90 }}
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  );
};

export default GeneratorPanel;
