// src/components/ipinfo/ipwhois.ts

export async function fetchIPWhois(ip: string) {
  try {
    const r = await fetch(`https://ipwho.is/${ip}`);
    const text = await r.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch (e) {
      // Not valid JSON (likely an HTML error page or Cloudflare protection)
      return {
        provider: "ipwho.is",
        ok: false,
        ip,
        error: "Non-JSON response from ipwho.is",
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
  } catch (e: any) {
    return {
      provider: "ipwho.is",
      ok: false,
      ip,
      error: e.message || "Network or fetch error",
    };
  }
}
