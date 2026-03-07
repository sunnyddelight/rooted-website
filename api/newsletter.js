import { appendRow, findInColumn } from './_sheets.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

  // Check for duplicate — email is column index 1 in Newsletter sheet
  const existing = await findInColumn('Newsletter', 1, email);
  if (existing) {
    return res.status(200).json({ success: true, message: 'Already subscribed' });
  }

  const id = `nl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await appendRow('Newsletter', [
    id,
    String(email).slice(0, 200),
    new Date().toISOString(),
  ]);

  return res.status(201).json({ success: true, id });
}
