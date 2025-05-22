const IPDATA_KEY = process.env.IPDATA_KEY || "YOUR_KEY";

export async function fetchIPData(ip: string) {
  try {
    const r = await fetch(`https://api.ipdata.co/${ip}?api-key=${IPDATA_KEY}`);
    const data = await r.json();
    if (data.error || data.message) throw new Error(data.reason || data.message);

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
    return { provider: "ipdata.co", ok: false, ip, error: e.message || "Error" };
  }
}
