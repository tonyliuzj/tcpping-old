import React, { useState, useEffect } from "react";
import { ProtocolSelect, Protocol } from "../components/ProtocolSelect";
import CountrySelect from "../components/CountrySelect";
import ProvinceSelect from "../components/ProvinceSelect";
import CitySelect from "../components/CitySelect";
import ProviderSelect from "../components/ProviderSelect";
import { IPInfo } from "../components/IPInfo";
import { DNSInfo } from "../components/DNSInfo";

const defaultState = {
  protocol: "",
  country: "",
  province: "",
  city: "",
  provider: "",
};

// --- Utilities
function cleanHostname(input: string): string {
  let value = input.trim();
  value = value.replace(/^https?:\/\//i, "");
  value = value.replace(/\/.*$/, "");
  value = value.replace(/:.*$/, "");
  return value;
}
function isIPv4(ip: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim());
}
function isIPv6(ip: string) {
  return /^([a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/.test(ip.trim());
}
function isHostname(str: string) {
  return (
    /^(([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63})$/.test(str) ||
    /^([a-zA-Z0-9-]{1,63})$/.test(str)
  );
}

// --- Cloudflare DNS-over-HTTPS A/AAAA record check ---
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

export default function Home() {
  const [protocol, setProtocol] = useState<string>(defaultState.protocol);
  const [country, setCountry] = useState<string>(defaultState.country);
  const [province, setProvince] = useState<string>(defaultState.province);
  const [city, setCity] = useState<string>(defaultState.city);
  const [provider, setProvider] = useState<string>(defaultState.provider);
  const [copied, setCopied] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [lookupType, setLookupType] = useState<"empty" | "ipv4" | "ipv6" | "hostname" | "invalid">("empty");
  const [fetching, setFetching] = useState(false);
  const [ipInfoResults, setIpInfoResults] = useState<any[] | null>(null);
  const [dnsInfoResults, setDnsInfoResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [domainStatus, setDomainStatus] = useState<"unknown" | "valid" | "invalid">("unknown");
  const [domainChecking, setDomainChecking] = useState(false);

  // ---- FIND SELECTED PROVIDER OBJECT ----
  const [providerObj, setProviderObj] = useState<{ name: string, v4: boolean, v6: boolean } | null>(null);

  useEffect(() => {
    let fetchProvider = async () => {
      let data;
      try {
        const res = await fetch("/api/dictionary");
        data = await res.json();
      } catch {
        setProviderObj(null);
        return;
      }
      let found = null;
      if (country === "CN") {
        if (
          province &&
          city &&
          provider &&
          data?.CN?.provinces?.[province]?.cities?.[city]?.providers?.[provider]
        ) {
          found = data.CN.provinces[province].cities[city].providers[provider];
        } else if (
          province &&
          provider &&
          data?.CN?.provinces?.[province]?.providers?.[provider]
        ) {
          found = data.CN.provinces[province].providers[provider];
        }
      } else if (country && provider && data?.[country]?.cities) {
        if (
          city &&
          data[country].cities[city]?.providers?.[provider]
        ) {
          found = data[country].cities[city].providers[provider];
        }
      }
      setProviderObj(found);
    };
    fetchProvider();
  }, [country, province, city, provider]);

  // --- AUTO-REMOVE http/https AND PATH FROM INPUT ---
  useEffect(() => {
    const cleaned = inputValue
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/:.*$/, "");
    if (inputValue !== cleaned) {
      setInputValue(cleaned);
    }
    // eslint-disable-next-line
  }, [inputValue]);

  // Recognize the type of input on every input change, but DO NOT fetch
  useEffect(() => {
    setIpInfoResults(null);
    setDnsInfoResults(null);
    setError(null);
    setFetching(false);

    const val = cleanHostname(inputValue);
    if (!val) return setLookupType("empty");
    if (isIPv4(val)) return setLookupType("ipv4");
    if (isIPv6(val)) return setLookupType("ipv6");
    if (isHostname(val)) return setLookupType("hostname");
    return setLookupType("invalid");
  }, [inputValue]);

  // ---- AUTO-RESET OR AUTO-SELECT PROTOCOL WHEN PROVIDER CHANGES ----
  useEffect(() => {
    if (!providerObj) {
      setProtocol("");
      return;
    }
    const available: Protocol[] = [];
    if (providerObj.v4 && providerObj.v6) available.push("dual");
    if (providerObj.v4) available.push("v4");
    if (providerObj.v6) available.push("v6");
    // If current protocol is not valid, auto-select the only available option or reset
    if (!available.includes(protocol as Protocol)) {
      setProtocol(available.length === 1 ? available[0] : "");
    }
    // eslint-disable-next-line
  }, [providerObj]);
  // -------------------------------------------------

  // Generator logic (now async, and fixed for CN!)
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
    setCopied(false);
    setDomainStatus("unknown");
    setDomainChecking(false);
  };

  // Generator select handlers (don't clear inputValue)
  const handleCountryChange = (val: string) => {
    setCountry(val);
    setProvince("");
    setCity("");
    setProvider("");
    setProtocol(""); // Reset protocol too!
    setCopied(false);
  };
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setCity("");
    setProvider("");
    setProtocol(""); // Reset protocol too!
    setCopied(false);
  };
  const handleCityChange = (val: string) => {
    setCity(val);
    setProvider("");
    setProtocol(""); // Reset protocol too!
    setCopied(false);
  };
  const handleProviderChange = (val: string) => {
    setProvider(val);
    // setProtocol(""); // NOT NEEDED: Now handled by the auto-select useEffect above
    setCopied(false);
  };
  const handleProtocolChange = (val: Protocol) => {
    setProtocol(val);
    setCopied(false);
  };

  const handleCopy = () => {
    if (inputValue) {
      navigator.clipboard.writeText(inputValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // --- Lookup handler ---
  const handleFetchInfo = async () => {
    setFetching(true);
    setIpInfoResults(null);
    setDnsInfoResults(null);
    setError(null);
    const val = cleanHostname(inputValue);

    try {
      if (lookupType === "ipv4" || lookupType === "ipv6") {
        const res = await fetch(`/api/info?ip=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Failed to fetch IP info");
        setIpInfoResults(data.results || []);
      } else if (lookupType === "hostname") {
        setDnsInfoResults(val); // Let DNSInfo handle the fetch/render
      }
    } catch (e: any) {
      setError(e.message || "Error fetching info");
    } finally {
      setFetching(false);
    }
  };

  const showProvince = country === "CN";
  const countrySelected = !!country;
  const provinceSelected = !!province;
  const citySelected = !!city;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-full md:max-w-6xl bg-white shadow-lg rounded-2xl p-8 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">TCPing Host Generator & Lookup</h1>
        {/* Generator controls */}
        <div className="flex flex-col md:flex-row items-stretch gap-2 w-full">
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
          {/* ---- PROTOCOL IS LAST ---- */}
          <div className="flex-1 min-w-[140px]">
            <ProtocolSelect
              value={protocol}
              onChange={handleProtocolChange}
              disabled={!provider}
              v4={providerObj?.v4}
              v6={providerObj?.v6}
            />
          </div>
          {/* Buttons */}
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
        {/* Shared input box for both generator and lookup */}
        <div className="mt-4 flex justify-center w-full">
          <input
            type="text"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setDomainStatus("unknown");
            }}
            className="flex-1 max-w-3xl border rounded px-3 py-2 bg-gray-50 text-gray-700 truncate"
            placeholder="Generated URL or enter IP address / hostname"
            autoComplete="off"
            disabled={fetching}
          />
          <button
            onClick={handleCopy}
            className="ml-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={!inputValue}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleFetchInfo}
            className="ml-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={
              lookupType === "empty" ||
              lookupType === "invalid" ||
              fetching
            }
          >
            {fetching ? "Fetching..." : "Fetch Info"}
          </button>
        </div>
        {/* Domain validity under input */}
        <div className="mt-2 h-6 flex items-center">
          {domainChecking && (
            <span className="text-blue-500 font-semibold">Checking domain validity...</span>
          )}
          {domainStatus === "valid" && !domainChecking && (
            <span className="text-green-600 font-semibold">✔ Valid domain</span>
          )}
          {domainStatus === "invalid" && !domainChecking && (
            <span className="text-red-600 font-semibold">✖ Invalid domain (no A/AAAA records)</span>
          )}
        </div>
        {/* Lookup results */}
        <div className="mt-8 w-full">
          {error && <div className="text-red-600 text-center">{error}</div>}
          {lookupType === "invalid" &&
            <div className="text-red-600 text-center mt-4">
              Invalid input: please enter a valid hostname, IPv4, or IPv6 address.
            </div>
          }
          {(lookupType === "ipv4" || lookupType === "ipv6") && ipInfoResults && (
            <IPInfo ip={cleanHostname(inputValue)} />
          )}
          {lookupType === "hostname" && dnsInfoResults && (
            <DNSInfo input={cleanHostname(inputValue)} />
          )}
        </div>
      </div>
    </div>
  );
}
