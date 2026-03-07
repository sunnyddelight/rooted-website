import { appendRow, readRows } from './_sheets.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const rows = await readRows('Preorders');
    const preorders = rows.map(r => ({
      id: r[0], name: r[1], email: r[2], product: r[3],
      quantity: r[4], source: r[5], createdAt: r[6],
    }));
    return res.status(200).json({ preorders });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, product, quantity, source } = req.body || {};

  if (!name || !email || !product) {
    return res.status(400).json({ error: 'Missing required fields: name, email, product' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const id = `po_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await appendRow('Preorders', [
    id,
    String(name).slice(0, 200),
    String(email).slice(0, 200),
    String(product).slice(0, 100),
    String(quantity || '1').slice(0, 10),
    String(source || '').slice(0, 100),
    new Date().toISOString(),
  ]);

  return res.status(201).json({ success: true, id });
}
