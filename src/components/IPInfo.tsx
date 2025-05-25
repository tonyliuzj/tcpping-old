import React, { useEffect, useState } from "react";

const providers = [
  { id: "ipapi", label: "ip-api.com" },
  { id: "ipwhois", label: "ipwho.is" },
  { id: "ipgeolocation", label: "ipgeolocation.io" },
  { id: "ipdata", label: "ipdata.co" },
  { id: "ipapi_co", label: "ipapi.co" },
  { id: "ipinfoio", label: "ipinfo.io" },
];

export interface IPCardResult {
  provider: string;
  ok: boolean;
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  continent?: string;
  continent_code?: string;
  latitude?: number;
  longitude?: number;
  asn?: string;
  as_name?: string;
  as_domain?: string;
  isp?: string;
  organization?: string;
  timezone?: string;
  local_time?: string;
  flag?: string;
  error?: string;
}

export const IPInfo: React.FC<{ ip: string }> = ({ ip }) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    if (!ip) return;
    setLoading(true);
    setResults([]);
    fetch(`/api/info?ip=${encodeURIComponent(ip)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || []))
      .finally(() => setLoading(false));
  }, [ip]);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 200 && results.length > 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [results]);

  if (!ip) return null;
  if (loading) return <div className="text-blue-500">Loading IP info...</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      {results.map((result, i) => (
        <div
          key={result.provider + i}
          className="flex flex-col md:flex-row bg-[#fafafc] border border-gray-200 rounded-xl overflow-hidden shadow"
        >
          {/* Info Table */}
          <div className="flex-1 p-5 min-w-0">
            <h3 className="font-semibold mb-2">{result.provider}</h3>
            {result.ok ? (
              <table className="text-sm w-full">
                <tbody>
                  <tr><td>IP</td><td>{result.ip}</td></tr>
                  <tr><td>Country</td><td>{result.country} ({result.country_code})</td></tr>
                  <tr><td>City</td><td>{result.city}</td></tr>
                  <tr><td>Region</td><td>{result.region}</td></tr>
                  <tr><td>Continent</td><td>{result.continent} ({result.continent_code})</td></tr>
                  <tr><td>ASN</td><td>{result.asn}</td></tr>
                  <tr><td>AS Name</td><td>{result.as_name}</td></tr>
                  <tr><td>AS Domain</td><td>{result.as_domain}</td></tr>
                  <tr><td>ISP</td><td>{result.isp}</td></tr>
                  <tr><td>Org</td><td>{result.organization}</td></tr>
                  <tr><td>Timezone</td><td>{result.timezone}</td></tr>
                  <tr><td>Local Time</td><td>{result.local_time}</td></tr>
                  <tr><td>Flag</td><td>{result.flag && <img src={result.flag} alt="flag" className="h-5" />}</td></tr>
                  <tr><td>Latitude/Longitude</td><td>{result.latitude}, {result.longitude}</td></tr>
                </tbody>
              </table>
            ) : (
              <div className="text-red-600">{result.error}</div>
            )}
          </div>
          {/* Map section */}
          <div className="w-full md:w-[300px] h-[200px] md:h-auto flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 bg-white">
            {result.ok && typeof result.latitude === "number" && typeof result.longitude === "number" ? (
              <iframe
                width="100%"
                height="100%"
                className="rounded-r-xl"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.longitude - 0.08}%2C${result.latitude - 0.05}%2C${result.longitude + 0.08}%2C${result.latitude + 0.05}&layer=mapnik&marker=${result.latitude}%2C${result.longitude}`}
                style={{ border: 0, minHeight: 180 }}
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title={`map-${result.provider}-${ip}`}
              />
            ) : (
              <div className="text-gray-400 text-xs">No location</div>
            )}
          </div>
        </div>
      ))}
      {/* Floating Back to Top Button with smooth scroll */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-6 bottom-10 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-800 transition"
          style={{ textDecoration: "none" }}
          title="Back to Top"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
};
