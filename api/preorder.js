import { readData, writeData } from './_store.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const data = await readData('preorders');
    return res.status(200).json({ preorders: data });
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

  const entry = {
    id: `po_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    product: String(product).slice(0, 100),
    quantity: String(quantity || '1').slice(0, 10),
    source: String(source || '').slice(0, 100),
    createdAt: new Date().toISOString(),
  };

  const data = await readData('preorders');
  data.push(entry);
  await writeData('preorders', data);

  return res.status(201).json({ success: true, id: entry.id });
}
