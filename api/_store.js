/**
 * Simple JSON file store for pre-order and newsletter data.
 *
 * In local development (`vercel dev`) data persists to ./data/*.json.
 * On Vercel serverless, data persists to /tmp (ephemeral per container).
 *
 * For production, swap this module for a real database (e.g. Vercel Postgres,
 * PlanetScale, Supabase, or any database of your choice).
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const IS_VERCEL = !!process.env.VERCEL;
const BASE_DIR = IS_VERCEL ? '/tmp' : join(process.cwd(), 'data');

function filePath(collection) {
  return join(BASE_DIR, `${collection}.json`);
}

export async function readData(collection) {
  try {
    await fs.mkdir(BASE_DIR, { recursive: true });
    const raw = await fs.readFile(filePath(collection), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeData(collection, data) {
  await fs.mkdir(BASE_DIR, { recursive: true });
  await fs.writeFile(filePath(collection), JSON.stringify(data, null, 2));
}
