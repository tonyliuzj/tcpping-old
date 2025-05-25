import React, { useEffect, useState } from "react";
import { IPInfo } from "./IPInfo";

const dnsTypes = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

export interface DNSAPIResponse {
  [rtype: string]: any[];
}

export const DNSInfo: React.FC<{ input: string }> = ({ input }) => {
  const [dnsData, setDnsData] = useState<DNSAPIResponse>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [modal, setModal] = useState<{ content: string; open: boolean }>({ content: "", open: false });

  useEffect(() => {
    if (!input) return;
    setLoading(true);
    setErr(null);
    setDnsData({});
    fetch(`/api/dns?host=${encodeURIComponent(input)}`)
      .then((res) => res.json())
      .then((data) => setDnsData(data))
      .catch((e) => setErr("Failed to load DNS records"))
      .finally(() => setLoading(false));
  }, [input]);

  // Renders an IP address as a clickable link that jumps to its info section
  function RenderIPLink({ value }: { value: string }) {
    const isLong = value.length > 60;
    const short = isLong ? value.slice(0, 57) + "..." : value;
    return (
      <a
        href={`#ipinfo-${value}`}
        className="inline-block bg-gray-200 px-2 py-1 rounded text-xs font-mono mb-1 cursor-pointer hover:bg-blue-200 text-blue-800 underline"
        title={value}
        style={{ wordBreak: "break-all" }}
      >
        {short}
      </a>
    );
  }

  function RenderRecordValue({ value }: { value: string }) {
    // If this is an IP, use RenderIPLink, else fallback to modal logic for long strings
    if (
      /^\d{1,3}(\.\d{1,3}){3}$/.test(value) || // IPv4
      /^[a-fA-F0-9:]+$/.test(value) // IPv6 (not super strict, but works)
    ) {
      return <RenderIPLink value={value} />;
    }
    if (value.length > 60) {
      const short = value.slice(0, 57) + "...";
      return (
        <button
          className="inline-block bg-gray-200 px-2 py-1 rounded text-xs font-mono mb-1 cursor-pointer hover:bg-blue-200"
          title="Click to view full"
          onClick={() => setModal({ content: value, open: true })}
          type="button"
        >
          {short}
        </button>
      );
    }
    return (
      <span className="inline-block bg-gray-200 px-2 py-1 rounded text-xs font-mono mb-1">
        {value}
      </span>
    );
  }

  return (
    <div className="w-full">
      {loading && <div className="text-blue-500 p-2">Loading DNS info...</div>}
      {err && <div className="text-red-600 p-2">{err}</div>}
      {Object.keys(dnsData).length > 0 && (() => {
        const summaryRows = dnsTypes.map((type) => ({
          type,
          count: dnsData[type]?.length || 0,
        }));
        return (
          <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="font-bold text-lg mb-3 text-gray-800 flex items-center">
              <span className="mr-2">DNS Overview</span>
              <span className="ml-2 text-sm text-gray-400">(Click type to jump to details)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-semibold pb-2 px-2 text-left">Type</th>
                    <th className="font-semibold pb-2 px-2 text-left">Count</th>
                    <th className="font-semibold pb-2 px-2 text-left">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map(({ type, count }) =>
                    count ? (
                      <tr key={type} className="odd:bg-gray-50 even:bg-gray-100">
                        <td className="py-2 px-2">
                          <a
                            href={`#dns-section-${type}`}
                            className="font-semibold text-blue-700 underline hover:text-blue-900"
                          >
                            {type}
                          </a>
                        </td>
                        <td className="py-2 px-2">
                          <span className="inline-block bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded-full font-mono font-bold">
                            {count}
                          </span>
                        </td>
                        <td className="py-2 px-2 break-words">
                          <div className="flex flex-wrap gap-1">
                            {dnsData[type]
                              .map((r, idx) =>
                                r.data ? (
                                  <RenderRecordValue key={idx} value={r.data} />
                                ) : r.exchange ? (
                                  <span
                                    key={idx}
                                    className="inline-block bg-green-200 px-2 py-1 rounded text-xs font-mono mb-1"
                                  >
                                    {r.exchange}
                                    {r.priority !== undefined && (
                                      <span className="ml-1 text-gray-500">({r.priority})</span>
                                    )}
                                  </span>
                                ) : r.nameserver ? (
                                  <span
                                    key={idx}
                                    className="inline-block bg-yellow-100 px-2 py-1 rounded text-xs font-mono mb-1"
                                  >
                                    {r.nameserver}
                                  </span>
                                ) : r.txt ? (
                                  <RenderRecordValue key={idx} value={r.txt} />
                                ) : r.hostmaster ? (
                                  <span
                                    key={idx}
                                    className="inline-block bg-orange-100 px-2 py-1 rounded text-xs font-mono mb-1"
                                  >
                                    {r.hostmaster}
                                  </span>
                                ) : (
                                  <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-mono mb-1">
                                    {JSON.stringify(r)}
                                  </span>
                                )
                              )}
                          </div>
                        </td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* DNS Type Sections (for anchor links) */}
      {dnsTypes.map((type) =>
        dnsData[type]?.length ? (
          <div key={type} className="mb-8">
            <h3
              id={`dns-section-${type}`}
              className="font-semibold text-lg mb-3 scroll-mt-24"
            >
              {type} Records
            </h3>
            <div className="flex flex-col gap-4">
              {dnsData[type].map((record, idx) => {
                // For A and AAAA records, show IP Geolocation directly below each IP, with anchor
                if ((type === "A" || type === "AAAA") && record.data) {
                  return (
                    <div key={idx} className="mb-2">
                      <RenderIPLink value={record.data} />
                      <div id={`ipinfo-${record.data}`} className="mt-2 scroll-mt-24">
                        <IPInfo ip={record.data} />
                      </div>
                    </div>
                  );
                }
                // Other record types remain unchanged
                return record.data ? (
                  <RenderRecordValue key={idx} value={record.data} />
                ) : record.exchange ? (
                  <span
                    key={idx}
                    className="inline-block bg-green-200 px-2 py-1 rounded text-xs font-mono mb-1"
                  >
                    {record.exchange}
                    {record.priority !== undefined && (
                      <span className="ml-1 text-gray-500">
                        ({record.priority})
                      </span>
                    )}
                  </span>
                ) : record.nameserver ? (
                  <span
                    key={idx}
                    className="inline-block bg-yellow-100 px-2 py-1 rounded text-xs font-mono mb-1"
                  >
                    {record.nameserver}
                  </span>
                ) : record.txt ? (
                  <RenderRecordValue key={idx} value={record.txt} />
                ) : record.hostmaster ? (
                  <span
                    key={idx}
                    className="inline-block bg-orange-100 px-2 py-1 rounded text-xs font-mono mb-1"
                  >
                    {record.hostmaster}
                  </span>
                ) : (
                  <span
                    key={idx}
                    className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-mono mb-1"
                  >
                    {JSON.stringify(record)}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null
      )}

      {/* Modal for showing full record */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
          onClick={() => setModal({ content: "", open: false })}
        >
          <div
            className="bg-white rounded-2xl shadow-lg max-w-2xl w-full mx-4 p-8 relative border"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700"
              onClick={() => setModal({ content: "", open: false })}
              type="button"
              aria-label="Close"
            >
              &times;
            </button>
            <div className="font-mono text-base text-gray-900 break-words whitespace-pre-wrap">
              {modal.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
