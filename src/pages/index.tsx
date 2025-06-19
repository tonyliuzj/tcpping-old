import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import GeneratorPanel from "../components/GeneratorPanel";
import MapPanel from "../components/MapPanel";
import { IPInfo } from "../components/IPInfo";
import { DNSInfo } from "../components/DNSInfo";
import { useIsMobile } from "../hooks/useIsMobile";
import { cleanHostname, isIPv4, isIPv6, isHostname } from "../utils/validation";
import { IPCardResult } from "../components/IPInfo";
import { DictionaryType } from "../types";

export default function Home() {
  const isMobile = useIsMobile();

  const [inputValue, setInputValue] = useState<string>("");
  const [lookupType, setLookupType] = useState<"empty" | "ipv4" | "ipv6" | "hostname" | "invalid">("empty");
  const [fetching, setFetching] = useState(false);
  const [ipInfoResults, setIpInfoResults] = useState<IPCardResult[] | null>(null);
  const [dnsInfoResults, setDnsInfoResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [domainStatus, setDomainStatus] = useState<"unknown" | "valid" | "invalid">("unknown");
  const [domainChecking, setDomainChecking] = useState(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Map selection states
  const [dictionary, setDictionary] = useState<DictionaryType | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Fetch the dictionary.json from API on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dictionary");
        const dict = await res.json();
      setDictionary(dict);
    } catch {
      setDictionary(undefined);
      }
    })();
  }, []);

  // Recognize input type (hostname, IPv4, IPv6, etc)
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error fetching info");
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-16 w-full" />

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
            maxWidth: "none"
          }}
        >
          {/* MAP LEFT */}
          <MapPanel
            dictionary={dictionary}
            lookupType={lookupType}
            ipInfoResults={ipInfoResults}
            selectedCountry={selectedCountry}
            selectedProvince={selectedProvince}
            selectedCity={selectedCity}
            isMobile={isMobile}
          />

          {/* RIGHT PANEL */}
          <div className="flex-1 flex flex-col space-y-4" style={{ minWidth: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-center mt-4 mb-2 sm:mb-4">TCPing Host Generator & Lookup</h1>
            {/* Generator controls */}
            <div className="w-full flex flex-wrap gap-2" style={{ minWidth: 0 }}>
              <GeneratorPanel
                setInputValue={setInputValue}
                setDomainStatus={setDomainStatus}
                setDomainChecking={setDomainChecking}
                setSelectedCountry={setSelectedCountry}
                setSelectedProvince={setSelectedProvince}
                setSelectedCity={setSelectedCity}
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
    </>
  );
}
