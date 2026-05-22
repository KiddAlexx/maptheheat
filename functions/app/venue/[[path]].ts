import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  ASSETS: Fetcher;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUB_KEY: string;
  VITE_SITE_URL: string;
}

interface VenueRow {
  venue_name: string;
  city: string;
  description: string | null;
}

const BOT_UA_RE =
  /googlebot|facebookexternalhit|twitterbot|whatsapp|slackbot|discordbot|linkedinbot|telegrambot|bingbot|duckduckbot|ia_archiver/i;

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const ua = ctx.request.headers.get('user-agent') ?? '';

  // Human visitors — continue to the normal SPA pipeline (_redirects → index.html)
  if (!BOT_UA_RE.test(ua)) return ctx.next();

  const url = new URL(ctx.request.url);

  // Review sub-routes don't need venue-specific OG tags
  if (url.pathname.includes('/reviews/')) return ctx.next();

  // venueId is always the last path segment on venue detail routes
  const segments = url.pathname.split('/').filter(Boolean);
  const venueId = segments[segments.length - 1];

  // Fetch venue from Supabase REST API
  let venue: VenueRow | null = null;
  try {
    const res = await fetch(
      `${ctx.env.VITE_SUPABASE_URL}/rest/v1/venue_details` +
        `?venue_id=eq.${encodeURIComponent(venueId)}&status=eq.approved` +
        `&select=venue_name,city,description&limit=1`,
      {
        headers: {
          apikey: ctx.env.VITE_SUPABASE_PUB_KEY,
          Authorization: `Bearer ${ctx.env.VITE_SUPABASE_PUB_KEY}`,
        },
      }
    );
    const rows = (await res.json()) as VenueRow[];
    venue = rows?.[0] ?? null;
  } catch {
    // Fall through — serve generic index.html below
  }

  // Fetch base index.html from static assets
  const indexRes = await ctx.env.ASSETS.fetch(
    new Request(`${url.origin}/index.html`, { headers: ctx.request.headers })
  );
  let html = await indexRes.text();

  if (venue) {
    const title = esc(`${venue.venue_name} in ${venue.city} | MapTheHeat`);
    const desc = esc(
      (
        venue.description ||
        `${venue.venue_name} in ${venue.city} — check community heat ratings and reviews for this spicy venue on MapTheHeat.`
      ).slice(0, 160)
    );
    const image = esc(`${ctx.env.VITE_SITE_URL}/og-image.png`);
    const pageUrl = esc(url.href);

    html = html
      .replace(/(<title>)[^<]*(<\/title>)/, `$1${title}$2`)
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*"/, `$1${title}"`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*"/, `$1${desc}"`)
      .replace(/(<meta\s+property="og:image"\s+content=")[^"]*"/, `$1${image}"`)
      .replace(/(<meta\s+property="og:url"\s+content=")[^"]*"/, `$1${pageUrl}"`)
      .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*"/, `$1${title}"`)
      .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*"/, `$1${desc}"`)
      .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*"/, `$1${image}"`);
  }

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
};

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
