import { useState } from "react";
import { ProtocolSelect, Protocol } from "../components/ProtocolSelect";
import { ProvinceSelect } from "../components/ProvinceSelect";
import { CitySelect } from "../components/CitySelect";
import { ProviderSelect } from "../components/ProviderSelect";

export default function Home() {
  const [protocol, setProtocol] = useState<Protocol>("");        // "" = dual-stack
  const [province, setProvince] = useState("");                  // required
  const [city, setCity] = useState("");                          // "" = no city
  const [provider, setProvider] = useState("");                  // required

  const countryCode = "cn";
  const domain = "tcpping.top";

  // we only build the URL if both province & provider are chosen
  const ready = Boolean(province && provider);

  // host segments logic:
  // - if city is non-empty: prov-city-provider
  // - else: prov-provider
  const core = city
    ? `${province}-${city}-${provider}`
    : `${province}-${provider}`;

  const segments = [protocol, core].filter(Boolean);
  const url = `${segments.join(".")}.${countryCode}.${domain}`;

  return (
    <main className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">TCP/ICMP Ping URL Generator</h1>

      <form className="grid grid-cols-1 gap-4">
        <ProtocolSelect value={protocol} onChange={setProtocol} />
        <ProvinceSelect
          value={province}
          onChange={prov => {
            setProvince(prov);
            setCity("");       // reset city when province changes
          }}
        />
        <CitySelect province={province} value={city} onChange={setCity} />
        <ProviderSelect value={provider} onChange={setProvider} />
      </form>

      <div className="mt-6 p-4 bg-gray-100 rounded font-mono text-lg">
        {ready ? (
          <code>{url}</code>
        ) : (
          <span className="text-red-600">
            Please select both a province and a provider to generate the URL.
          </span>
        )}
      </div>
    </main>
  );
}
