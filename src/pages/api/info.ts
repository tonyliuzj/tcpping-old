import type { NextApiRequest, NextApiResponse } from "next";
import { fetchIPApi } from "../../components/ipinfo/ipapi";
import { fetchIPWhois } from "../../components/ipinfo/ipwhois";
import { fetchIPGeolocation } from "../../components/ipinfo/ipgeolocation";
import { fetchIPData } from "../../components/ipinfo/ipdata";
import { fetchIPApiCo } from "../../components/ipinfo/ipapi_co";
import { fetchIPInfoIO } from "../../components/ipinfo/ipinfoio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = (req.query.ip as string) || "";
  if (!ip) return res.status(400).json({ error: "IP required" });

  try {
    // Run all fetchers in parallel for best performance
    const results = await Promise.all([
      fetchIPApi(ip),
      fetchIPWhois(ip),
      fetchIPGeolocation(ip),
      fetchIPData(ip),
      fetchIPApiCo(ip),
      fetchIPInfoIO(ip),
    ]);
    res.json({ ok: true, ip, results });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ ok: false, error: errorMessage });
  }
}
