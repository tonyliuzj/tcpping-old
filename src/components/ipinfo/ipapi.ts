// src/components/ipinfo/ipapi.ts

interface IPApiResponse {
  status: string;
  query: string;
  city: string;
  regionName: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  as?: string;
  isp: string;
  org?: string;
  timezone: string;
  message?: string;
}

export async function fetchIPApi(ip: string) {
  try {
    const r = await fetch(`http://ip-api.com/json/${ip}`);
    const text = await r.text();
    let data: IPApiResponse | null = null;

    try {
      data = JSON.parse(text);
    } catch {
      // Not valid JSON (likely an HTML error page or Cloudflare error)
      return {
        provider: "ip-api.com",
        ok: false,
        ip,
        error: "Non-JSON response from ip-api.com",
        raw: text,
      };
    }

    if (!data) {
      // This should never happen, but added for type safety
      return {
        provider: "ip-api.com",
        ok: false,
        ip,
        error: "Unexpected null data after JSON parse",
        raw: text,
      };
    }

    if (data.status !== "success") {
      return {
        provider: "ip-api.com",
        ok: false,
        ip,
        error: data.message || "Lookup failed",
        raw: text,
      };
    }

    return {
      provider: "ip-api.com",
      ok: true,
      ip: data.query,
      city: data.city,
      region: data.regionName,
      country: data.country,
      country_code: data.countryCode,
      continent: undefined,
      continent_code: undefined,
      latitude: data.lat,
      longitude: data.lon,
      asn: data.as?.split(" ")[0] || "",
      as_name: data.as?.split(" ").slice(1).join(" ") || "",
      as_domain: undefined,
      isp: data.isp,
      organization: data.org || data.isp,
      timezone: data.timezone,
      local_time: undefined,
      flag: undefined,
      error: null,
    };
  } catch (e: unknown) {
    return {
      provider: "ip-api.com",
      ok: false,
      ip,
      error: e instanceof Error ? e.message : "Network or fetch error",
    };
  }
}
