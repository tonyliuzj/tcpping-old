// src/components/ipinfo/ipgeolocation.ts

const IPGEOLOCATION_KEY = process.env.IPGEOLOCATION_KEY || "YOUR_KEY";

interface IPGeolocationResponse {
  message?: string;
  ip?: string;
  city?: string;
  state_prov?: string;
  country_name?: string;
  country_code2?: string;
  continent_name?: string;
  continent_code?: string;
  latitude?: string;
  longitude?: string;
  isp?: string;
  organization?: string;
  time_zone?: {
    name?: string;
    current_time?: string;
  };
  country_flag?: string;
}

export async function fetchIPGeolocation(ip: string) {
  try {
    const r = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_KEY}&ip=${ip}`);
    const text = await r.text();
    let data: IPGeolocationResponse | null = null;

    try {
      data = JSON.parse(text);
    } catch {
      // Not valid JSON (likely an error page)
      return {
        provider: "ipgeolocation.io",
        ok: false,
        ip,
        error: "Non-JSON response from ipgeolocation.io",
        raw: text,
      };
    }

    if (!data) {
      return {
        provider: "ipgeolocation.io",
        ok: false,
        ip,
        error: "Unexpected null data after JSON parse",
        raw: text,
      };
    }

    if (data.message) {
      return {
        provider: "ipgeolocation.io",
        ok: false,
        ip,
        error: data.message,
        raw: text,
      };
    }

    return {
      provider: "ipgeolocation.io",
      ok: true,
      ip: data.ip,
      city: data.city,
      region: data.state_prov,
      country: data.country_name,
      country_code: data.country_code2,
      continent: data.continent_name,
      continent_code: data.continent_code,
      latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      asn: undefined,
      as_name: undefined,
      as_domain: undefined,
      isp: data.isp,
      organization: data.organization,
      timezone: data.time_zone?.name,
      local_time: data.time_zone?.current_time,
      flag: data.country_flag,
      error: null,
    };
  } catch (e: unknown) {
    return {
      provider: "ipgeolocation.io",
      ok: false,
      ip,
      error: e instanceof Error ? e.message : "Network or fetch error",
    };
  }
}
