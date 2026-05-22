/**
 * Build-time sitemap generator.
 *
 * Credentials are resolved in order:
 *   1. VITE_SUPABASE_URL / VITE_SUPABASE_PUB_KEY / VITE_SITE_URL env vars
 *      (set in the Cloudflare Pages dashboard — used in CI)
 *   2. Local .env.<mode> file (used in local dev)
 *
 * Usage:
 *   node scripts/build-sitemap.mjs
 *   node scripts/build-sitemap.mjs --mode staging
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── env resolution ────────────────────────────────────────────────────────────

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith("'") && val.endsWith("'")) ||
      (val.startsWith('"') && val.endsWith('"'))
    ) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

const modeArg = process.argv.indexOf('--mode');
const mode = modeArg !== -1 ? process.argv[modeArg + 1] : 'production';
const envFile = resolve(ROOT, `.env.${mode}`);
const fileEnv = parseEnvFile(envFile);

function resolveVar(name) {
  return process.env[name] ?? fileEnv[name];
}

const SUPABASE_URL = resolveVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = resolveVar('VITE_SUPABASE_PUB_KEY');
const SITE_URL = (resolveVar('VITE_SITE_URL') ?? 'https://maptheheat.com').replace(/\/$/, '');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUB_KEY.' +
    ' Set them as env vars or in ' + envFile
  );
  process.exit(1);
}

// ── static routes ─────────────────────────────────────────────────────────────

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/terms', priority: '0.3', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
  { path: '/contact', priority: '0.3', changefreq: 'monthly' },
];

// ── Supabase fetch ─────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchApprovedVenues() {
  const PAGE_SIZE = 1000;
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('venue_details')
      .select('venue_id, city, country, venue_name_slug, created_at')
      .eq('status', 'approved')
      .not('city', 'is', null)
      .not('country', 'is', null)
      .not('venue_name_slug', 'is', null)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

// ── XML helpers ───────────────────────────────────────────────────────────────

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(dateStr) {
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Building sitemap for ${SITE_URL}`);

  let venues;
  try {
    venues = await fetchApprovedVenues();
  } catch (err) {
    console.error('Failed to fetch venues:', err.message);
    console.error('Writing sitemap with static routes only.');
    venues = [];
  }

  const today = new Date().toISOString().split('T')[0];

  const staticEntries = STATIC_ROUTES.map(({ path, priority, changefreq }) =>
    urlEntry({ loc: `${SITE_URL}${path}`, lastmod: today, changefreq, priority })
  );

  const venueEntries = venues.map(({ venue_id, city, country, venue_name_slug, created_at }) =>
    urlEntry({
      loc: `${SITE_URL}/app/venue/${encodeURIComponent(city)}/${encodeURIComponent(country)}/${encodeURIComponent(venue_name_slug)}/${venue_id}`,
      lastmod: isoDate(created_at),
      changefreq: 'weekly',
      priority: '0.8',
    })
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...venueEntries,
    '</urlset>',
    '',
  ].join('\n');

  const outPath = resolve(ROOT, 'public', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');

  console.log(
    `sitemap.xml written: ${STATIC_ROUTES.length} static + ${venues.length} venue URLs → ${outPath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
