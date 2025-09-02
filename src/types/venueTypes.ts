import { Direction, SupabaseQueryMethod } from './commonTypes';

export interface Venue {
  venueName: string;
  address: string;
  detailedAddress: string;
  description: string;
  city: string;
  country: string;
  postcode: string;
  phoneNumber: string;
  website: string;
  userId: string;
  venueNameSlug: string;
  coords: Coords;
  venueId: string;
  venueType: 'restaurant' | 'shop';
  thumbnailImage?: Image;
  hottestSauces?: string[];
  hottestDishes?: string[];
  averageHeatRating?: number | null;
  averageQualityRating?: number | null;
  totalReviews?: number;
}

// id not present at creation time, generate by Supbase
export type NewVenue = Omit<Venue, 'venueId'>;

export interface Coords {
  lat: number | string;
  lon: number | string;
}

export interface Image {
  url: string;
  alt: string;
}

export interface DetailedImage {
  imagePathLarge: string;
  altText: string;
}

export interface UniqueCity {
  coords: Coords;
  id: string;
  city: string;
  country: string;
}

export interface UniqueUserCity {
  city: string;
  country: string;
}

export type Key = string | number;

// Review context types - used in VenueFilterContext and UserFavVenuesContext

export type FilterField = 'city' | 'country' | 'venueType' | 'venueName';
export type VenueSortField =
  | 'averageHeatRating'
  | 'averageQualityRating'
  | 'totalReviews'
  | 'createdAt';

export interface VenueFilter {
  field: FilterField;
  value: string;
  method: SupabaseQueryMethod;
}

export interface VenueSort {
  field: VenueSortField;
  direction: Direction;
}

export interface VenuePagination {
  pageNumber: number;
  maxResults: number;
}

export interface ImageUploadParams {
  venueId: string;
  reviewId?: string;
  imageFiles: File[];
  city: string;
  venueNameSlug: string;
  imageType: 'venue' | 'review' | 'standalone';
}
