const IPINFO_TOKEN = process.env.IPINFO_TOKEN || "64ed841f1b80bd";

export async function fetchIPInfoIO(ip: string) {
  try {
    const r = await fetch(`https://api.ipinfo.io/lite/${ip}?token=${IPINFO_TOKEN}`);
    const data = await r.json();
    if (data.error) throw new Error(data.error);

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
  } catch (e: any) {
    return { provider: "ipinfo.io", ok: false, ip, error: e.message || "Error" };
  }
}
