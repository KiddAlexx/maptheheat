interface VenueShareUrlVenue {
  city?: string | null;
  country?: string | null;
  venueId?: string | null;
  venueNameSlug?: string | null;
}

export const MAPTHEHEAT_ORIGIN = 'https://maptheheat.com';

export function buildVenueShareUrl(
  venue: VenueShareUrlVenue,
  origin = MAPTHEHEAT_ORIGIN
): string | null {
  const { city, country, venueId, venueNameSlug } = venue;

  if (!city || !country || !venueId || !venueNameSlug) {
    return null;
  }

  return `${origin}/app/venue/${city}/${country}/${venueNameSlug}/${venueId}`;
}
