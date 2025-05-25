import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import GeneratorPanel from "../components/GeneratorPanel";
import { IPInfo } from "../components/IPInfo";
import { DNSInfo } from "../components/DNSInfo";

// Dynamically import WorldMap, client-only
const WorldMap = dynamic(() => import("../components/WorldMap"), { ssr: false });

// Simple hook for screen size
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// Utilities
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

export default function Home() {
  const isMobile = useIsMobile();

  const [inputValue, setInputValue] = useState<string>("");
  const [lookupType, setLookupType] = useState<"empty" | "ipv4" | "ipv6" | "hostname" | "invalid">("empty");
  const [fetching, setFetching] = useState(false);
  const [ipInfoResults, setIpInfoResults] = useState<any[] | null>(null);
  const [dnsInfoResults, setDnsInfoResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [domainStatus, setDomainStatus] = useState<"unknown" | "valid" | "invalid">("unknown");
  const [domainChecking, setDomainChecking] = useState(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Map data states
  const [dictionary, setDictionary] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCities, setSelectedCities] = useState<{ name: string, lat: number, lon: number }[]>([]);

  // Fetch the dictionary.json from API on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dictionary");
        const dict = await res.json();
        setDictionary(dict);
      } catch {
        setDictionary(null);
      }
    })();
  }, []);

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

  // --- Map logic ---
  let mapMode: "default" | "country" | "lookup" = "default";
  let countryObj: any = null;
  let ipLocations: any[] = [];

  if (lookupType === "ipv4" || lookupType === "ipv6") {
    if (ipInfoResults) {
      mapMode = "lookup";
      ipLocations = ipInfoResults
        .flatMap(r => (r.ok && r.latitude && r.longitude) ? [{
          ip: r.ip,
          label: `${r.provider}: ${r.ip}`,
          lat: r.latitude,
          lon: r.longitude
        }] : []);
    }
  } else if (selectedCountry && dictionary) {
    mapMode = "country";
    if (dictionary[selectedCountry]?.loc) {
      countryObj = {
        name: dictionary[selectedCountry].name,
        code: selectedCountry,
        lat: dictionary[selectedCountry].loc.lat,
        lon: dictionary[selectedCountry].loc.lon
      };
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 px-1 sm:px-4">
      <div
        className={`
          w-full max-w-full
          bg-white shadow-lg rounded-2xl
          flex flex-col md:flex-row
          ${isMobile ? "p-2" : "p-8"}
        `}
        style={{
          minHeight: "100vh",
          maxWidth: "none",
          overflow: "hidden"
        }}
      >
        {/* MAP LEFT */}
        {!isMobile && (
          <div
            className="flex-1 min-w-[360px] max-w-[100vw] mr-0 md:mr-8 sticky top-4 self-start"
            style={{
              // Responsive: always fit the window, minus a small gap
              height: `calc(100vh - 32px)`,
              maxHeight: "90vh", // safety if you want a cap
            }}
          >
            <WorldMap
              mode={mapMode}
              countryData={countryObj}
              cities={selectedCities}
              ipLocations={ipLocations}
            />
          </div>
        )}


        {/* EXISTING PANEL RIGHT */}
        <div className="flex-1 flex flex-col space-y-4" style={{ minWidth: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-center mt-4 mb-2 sm:mb-4">TCPing Host Generator & Lookup</h1>
          {/* Generator controls */}
          <div
            className={`
              w-full flex flex-wrap gap-2
            `}
            style={{ minWidth: 0 }}
          >
            <GeneratorPanel
              setInputValue={setInputValue}
              setDomainStatus={setDomainStatus}
              setDomainChecking={setDomainChecking}
              setSelectedCountry={setSelectedCountry}
              setSelectedCities={setSelectedCities}
              dictionary={dictionary}
            />
          </div>
          {/* Shared input box for both generator and lookup */}
          <div className="w-full flex flex-wrap gap-2 mt-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                setDomainStatus("unknown");
              }}
              className="flex-[1_1_220px] min-w-[140px] border rounded px-3 py-2 bg-gray-50 text-gray-700 truncate"
              placeholder="Generated URL or enter IP address / hostname"
              autoComplete="off"
              disabled={fetching}
            />
            <button
              onClick={() => {
                if (inputValue) {
                  navigator.clipboard.writeText(inputValue);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={!inputValue}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleFetchInfo}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
          <div className="h-6 flex items-center">
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
          <div className="flex-1 w-full min-h-[200px]">
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
    </div>
  );
}
