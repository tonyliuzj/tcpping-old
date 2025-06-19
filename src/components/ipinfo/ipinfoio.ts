// src/components/ipinfo/ipinfoio.ts

const IPINFO_TOKEN = process.env.IPINFO_TOKEN || "64ed841f1b80bd";

interface IPInfoIOResponse {
  error?: {
    title: string;
    message: string;
  };
  ip?: string;
  country?: string;
  country_code?: string;
  continent?: string;
  continent_code?: string;
  asn?: string;
  as_name?: string;
  as_domain?: string;
}

export async function fetchIPInfoIO(ip: string) {
  try {
    const r = await fetch(`https://api.ipinfo.io/lite/${ip}?token=${IPINFO_TOKEN}`);
    const text = await r.text();
    let data: IPInfoIOResponse | null = null;

    try {
      data = JSON.parse(text);
    } catch {
      // Not valid JSON (likely an error page)
      return {
        provider: "ipinfo.io",
        ok: false,
        ip,
        error: "Non-JSON response from ipinfo.io",
        raw: text,
      };
    }

    if (!data) {
      return {
        provider: "ipinfo.io",
        ok: false,
        ip,
        error: "Unexpected null data after JSON parse",
        raw: text,
      };
    }

    if (data.error) {
      return {
        provider: "ipinfo.io",
        ok: false,
        ip,
        error: data.error.message || "Unknown ipinfo.io error",
        raw: text,
      };
    }

    return {
      provider: "ipinfo.io",
      ok: true,
      ip: data.ip,
      city: undefined,
      region: undefined,
      country: data.country,
      country_code: data.country_code,
      continent: data.continent,
      continent_code: data.continent_code,
      latitude: undefined,
      longitude: undefined,
      asn: data.asn,
      as_name: data.as_name,
      as_domain: data.as_domain,
      isp: undefined,
      organization: undefined,
      timezone: undefined,
      local_time: undefined,
      flag: undefined,
      error: null,
    };
  } catch (e: unknown) {
    return {
      provider: "ipinfo.io",
      ok: false,
      ip,
      error: e instanceof Error ? e.message : "Network or fetch error",
    };
  }
}
