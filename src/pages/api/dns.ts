import type { NextApiRequest, NextApiResponse } from "next";

const dnsTypes = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { host } = req.query;
  if (!host || typeof host !== "string") {
    return res.status(400).json({ error: "Hostname required" });
  }
  let all: { [rtype: string]: any[] } = {};
  await Promise.all(
    dnsTypes.map(async (rtype) => {
      try {
        const r = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${rtype}`,
          { headers: { accept: "application/dns-json" } }
        );
        const data = await r.json();
        all[rtype] = data.Answer || [];
      } catch {
        all[rtype] = [];
      }
    })
  );
  res.json(all);
}
