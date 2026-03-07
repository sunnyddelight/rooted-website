import { readData, writeData } from './_store.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const data = await readData('newsletter');
    return res.status(200).json({ subscribers: data });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const data = await readData('newsletter');

  const already = data.find(d => d.email === email);
  if (already) {
    return res.status(200).json({ success: true, message: 'Already subscribed' });
  }

  const entry = {
    id: `nl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: String(email).slice(0, 200),
    createdAt: new Date().toISOString(),
  };

  data.push(entry);
  await writeData('newsletter', data);

  return res.status(201).json({ success: true, id: entry.id });
}
