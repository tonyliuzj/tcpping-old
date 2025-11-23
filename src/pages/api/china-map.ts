import type { NextApiRequest, NextApiResponse } from "next";
import chinaGeoJson from "../../data/china-provinces-ali.json";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // Filter out empty-name artifacts (e.g., dash line overlays) and serve a fresh GeoJSON.
  const features = (chinaGeoJson as any)?.features?.filter(
    (f: any) => f?.properties?.name && f?.geometry
  );

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    type: "FeatureCollection",
    features,
  });
}
