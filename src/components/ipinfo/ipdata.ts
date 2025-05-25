// src/components/ipinfo/ipdata.ts

const IPDATA_KEY = process.env.IPDATA_KEY || "YOUR_KEY";

export async function fetchIPData(ip: string) {
  try {
    const r = await fetch(`https://api.ipdata.co/${ip}?api-key=${IPDATA_KEY}`);
    const text = await r.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch (e) {
      // Not valid JSON (likely an error page)
      return {
        provider: "ipdata.co",
        ok: false,
        ip,
        error: "Non-JSON response from ipdata.co",
        raw: text,
      };
    }

    if (data.error || data.message) {
      return {
        provider: "ipdata.co",
        ok: false,
        ip,
        error: data.reason || data.message || "Unknown ipdata.co error",
        raw: text,
      };
    }

    return {
      provider: "ipdata.co",
      ok: true,
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      country_code: data.country_code,
      continent: data.continent_name,
      continent_code: data.continent_code,
      latitude: data.latitude,
      longitude: data.longitude,
      asn: data.asn?.asn,
      as_name: data.asn?.name,
      as_domain: data.asn?.domain,
      isp: data.carrier?.name,
      organization: data.asn?.name,
      timezone: data.time_zone?.name,
      local_time: data.time_zone?.current_time,
      flag: data.flag,
      error: null,
    };
  } catch (e: any) {
    return {
      provider: "ipdata.co",
      ok: false,
      ip,
      error: e.message || "Network or fetch error",
    };
  }
}
