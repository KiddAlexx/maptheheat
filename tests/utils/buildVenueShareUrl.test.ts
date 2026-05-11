import { describe, expect, it } from 'vitest';
import { buildVenueShareUrl } from '@/utils/buildVenueShareUrl';

const venue = {
  city: 'London',
  country: 'United Kingdom',
  venueId: 'venue-test-id',
  venueNameSlug: 'pepper-palace',
};

describe('buildVenueShareUrl', () => {
  it('uses the production origin by default', () => {
    expect(buildVenueShareUrl(venue)).toBe(
      'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id'
    );
  });

  it('allows an explicit origin override', () => {
    expect(buildVenueShareUrl(venue, 'https://preview.maptheheat.com')).toBe(
      'https://preview.maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id'
    );
  });

  it('returns null when any required field is missing or empty', () => {
    expect(buildVenueShareUrl({ ...venue, city: undefined })).toBeNull();
    expect(buildVenueShareUrl({ ...venue, country: null })).toBeNull();
    expect(buildVenueShareUrl({ ...venue, venueNameSlug: '' })).toBeNull();
    expect(buildVenueShareUrl({ ...venue, venueId: null })).toBeNull();
  });
});
