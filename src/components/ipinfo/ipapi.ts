export async function fetchIPApi(ip: string) {
  try {
    const r = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await r.json();
    if (data.status !== "success") throw new Error(data.message || "Lookup failed");
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
  } catch (e: any) {
    return { provider: "ip-api.com", ok: false, ip, error: e.message || "Error" };
  }
}
