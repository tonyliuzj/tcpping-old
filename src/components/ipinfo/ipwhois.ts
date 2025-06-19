// src/components/ipinfo/ipwhois.ts

interface IPWhoisResponse {
  success: boolean;
  message?: string;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  continent?: string;
  continent_code?: string;
  latitude?: number;
  longitude?: number;
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    current_time?: string;
  };
  flag?: {
    img?: string;
  };
}

export async function fetchIPWhois(ip: string) {
  try {
    const r = await fetch(`https://ipwho.is/${ip}`);
    const text = await r.text();
    let data: IPWhoisResponse | null = null;

    try {
      data = JSON.parse(text);
    } catch {
      // Not valid JSON (likely an HTML error page or Cloudflare protection)
      return {
        provider: "ipwho.is",
        ok: false,
        ip,
        error: "Non-JSON response from ipwho.is",
        raw: text,
      };
    }

    if (!data) {
      return {
        provider: "ipwho.is",
        ok: false,
        ip,
        error: "Unexpected null data after JSON parse",
        raw: text,
      };
    }

    if (!data.success) {
      return {
        provider: "ipwho.is",
        ok: false,
        ip,
        error: data.message || "Lookup failed",
        raw: text,
      };
    }

    return {
      provider: "ipwho.is",
      ok: true,
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      country_code: data.country_code,
      continent: data.continent,
      continent_code: data.continent_code,
      latitude: data.latitude,
      longitude: data.longitude,
      asn: data.connection?.asn ? `AS${data.connection.asn}` : "",
      as_name: data.connection?.org || "",
      as_domain: data.connection?.domain || "",
      isp: data.connection?.isp || "",
      organization: data.connection?.org || "",
      timezone: data.timezone?.id || "",
      local_time: data.timezone?.current_time || "",
      flag: data.flag?.img,
      error: null,
    };
  } catch (e: unknown) {
    return {
      provider: "ipwho.is",
      ok: false,
      ip,
      error: e instanceof Error ? e.message : "Network or fetch error",
    };
  }
}
