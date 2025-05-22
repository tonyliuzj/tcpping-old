export async function fetchIPApiCo(ip: string) {
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await r.json();
    if (data.error) throw new Error(data.reason || data.message);

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
  } catch (e: any) {
    return { provider: "ipapi.co", ok: false, ip, error: e.message || "Error" };
  }
}
