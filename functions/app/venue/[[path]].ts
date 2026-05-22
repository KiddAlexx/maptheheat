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
  country: string | null;
  description: string | null;
  address: string | null;
  coords: { lat: number | string; lon: number | string } | null;
  average_heat_rating: number | null;
  total_reviews: number | null;
  venue_type: 'restaurant' | 'shop' | null;
}

interface ReviewRow {
  heat_rating: number;
  quality_rating: number;
  review_title: string | null;
  review_content: string | null;
  profiles: { username: string } | null;
}

const BOT_UA_RE =
  /googlebot|facebookexternalhit|twitterbot|whatsapp|slackbot|discordbot|linkedinbot|telegrambot|bingbot|duckduckbot|ia_archiver/i;

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const ua = ctx.request.headers.get('user-agent') ?? '';

  // Human visitors — continue to the normal SPA pipeline (_redirects → index.html)
  if (!BOT_UA_RE.test(ua)) return ctx.next();

  const url = new URL(ctx.request.url);

  // Review sub-routes don't need venue-specific tags
  if (url.pathname.includes('/reviews/')) return ctx.next();

  // venueId is always the last path segment on venue detail routes
  const segments = url.pathname.split('/').filter(Boolean);
  const venueId = segments[segments.length - 1];

  const supabaseHeaders = {
    apikey: ctx.env.VITE_SUPABASE_PUB_KEY,
    Authorization: `Bearer ${ctx.env.VITE_SUPABASE_PUB_KEY}`,
  };
  const base = ctx.env.VITE_SUPABASE_URL;

  // Fetch venue + recent reviews in parallel
  let venue: VenueRow | null = null;
  let reviews: ReviewRow[] = [];

  try {
    const [venueRes, reviewsRes] = await Promise.all([
      fetch(
        `${base}/rest/v1/venue_details` +
          `?venue_id=eq.${encodeURIComponent(venueId)}&status=eq.approved` +
          `&select=venue_name,city,country,description,address,coords,average_heat_rating,total_reviews,venue_type` +
          `&limit=1`,
        { headers: supabaseHeaders }
      ),
      fetch(
        `${base}/rest/v1/venue_reviews` +
          `?venue_id=eq.${encodeURIComponent(venueId)}&status=eq.approved` +
          `&select=heat_rating,quality_rating,review_title,review_content,profiles(username)` +
          `&order=created_at.desc&limit=5`,
        { headers: supabaseHeaders }
      ),
    ]);

    const venueRows = (await venueRes.json()) as VenueRow[];
    venue = venueRows?.[0] ?? null;
    reviews = (await reviewsRes.json()) as ReviewRow[];
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

    // Build and inject JSON-LD structured data
    const jsonLd = buildJsonLd(venue, reviews, url.href, ctx.env.VITE_SITE_URL);
    html = html.replace('</head>', `${jsonLd}\n</head>`);
  }

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
};

function buildJsonLd(
  venue: VenueRow,
  reviews: ReviewRow[],
  pageUrl: string,
  siteUrl: string
): string {
  const type = venue.venue_type === 'shop' ? 'Store' : 'Restaurant';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    name: venue.venue_name,
    url: pageUrl,
    image: `${siteUrl}/og-image.png`,
  };

  if (venue.description) {
    schema.description = venue.description.slice(0, 500);
  }

  if (venue.address || venue.city) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(venue.address ? { streetAddress: venue.address } : {}),
      addressLocality: venue.city,
      ...(venue.country ? { addressCountry: venue.country } : {}),
    };
  }

  if (venue.coords?.lat != null && venue.coords?.lon != null) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: Number(venue.coords.lat),
      longitude: Number(venue.coords.lon),
    };
  }

  if (venue.average_heat_rating != null && venue.total_reviews) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: venue.average_heat_rating.toFixed(1),
      reviewCount: venue.total_reviews,
      bestRating: '5',
      worstRating: '1',
    };
  }

  if (reviews.length > 0) {
    schema.review = reviews.map((r) => {
      const rating = ((r.heat_rating + r.quality_rating) / 2).toFixed(1);
      const entry: Record<string, unknown> = {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rating,
          bestRating: '5',
          worstRating: '1',
        },
      };
      if (r.profiles?.username) {
        entry.author = { '@type': 'Person', name: r.profiles.username };
      }
      if (r.review_title) entry.name = r.review_title;
      if (r.review_content) entry.reviewBody = r.review_content.slice(0, 500);
      return entry;
    });
  }

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
