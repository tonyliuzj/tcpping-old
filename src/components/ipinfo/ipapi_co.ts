// src/components/ipinfo/ipapi_co.ts

interface IPApiCoResponse {
  error?: boolean;
  reason?: string;
  message?: string;
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export async function fetchIPApiCo(ip: string) {
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`);
    const text = await r.text();
    let data: IPApiCoResponse | null = null;

    try {
      data = JSON.parse(text);
    } catch {
      // Not valid JSON (likely an HTML error page)
      return {
        provider: "ipapi.co",
        ok: false,
        ip,
        error: "Non-JSON response from ipapi.co",
        raw: text, // Optional: keep for debugging or support
      };
    }

    if (!data) {
      return {
        provider: "ipapi.co",
        ok: false,
        ip,
        error: "Unexpected null data after JSON parse",
        raw: text,
      };
    }

    if (data.error) {
      return {
        provider: "ipapi.co",
        ok: false,
        ip,
        error: data.reason || data.message || "Unknown ipapi.co error",
        raw: text,
      };
    }

    return {
      provider: "ipapi.co",
      ok: true,
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      country_code: data.country_code,
      continent: undefined,
      continent_code: undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      asn: undefined,
      as_name: undefined,
      as_domain: undefined,
      isp: undefined,
      organization: undefined,
      timezone: data.timezone,
      local_time: undefined,
      flag: undefined,
      error: null,
    };
  } catch (e: unknown) {
    return {
      provider: "ipapi.co",
      ok: false,
      ip,
      error: e instanceof Error ? e.message : "Network or fetch error",
    };
  }
}
