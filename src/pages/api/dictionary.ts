import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Make sure the JSON is not publicly accessible, just backend
  const filePath = path.join(process.cwd(), 'src', 'data', 'dictionary.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  res.status(200).json(JSON.parse(jsonData));
}
