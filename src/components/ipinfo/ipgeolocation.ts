const IPGEOLOCATION_KEY = process.env.IPGEOLOCATION_KEY || "YOUR_KEY";

export async function fetchIPGeolocation(ip: string) {
  try {
    const r = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_KEY}&ip=${ip}`);
    const data = await r.json();
    if (data.message) throw new Error(data.message);

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
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
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
  } catch (e: any) {
    return { provider: "ipgeolocation.io", ok: false, ip, error: e.message || "Error" };
  }
}
