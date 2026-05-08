interface VenueShareUrlVenue {
  city: string;
  country: string;
  venueId: string;
  venueNameSlug: string;
}

export function buildVenueShareUrl(
  venue: VenueShareUrlVenue,
  origin = window.location.origin
): string {
  return `${origin}/app/venue/${venue.city}/${venue.country}/${venue.venueNameSlug}/${venue.venueId}`;
}
