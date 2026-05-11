interface VenueShareUrlVenue {
  city: string;
  country: string;
  venueId: string;
  venueNameSlug: string;
}

export const MAPTHEHEAT_ORIGIN = 'https://maptheheat.com';

export function buildVenueShareUrl(
  venue: VenueShareUrlVenue,
  origin = MAPTHEHEAT_ORIGIN
): string {
  return `${origin}/app/venue/${venue.city}/${venue.country}/${venue.venueNameSlug}/${venue.venueId}`;
}
