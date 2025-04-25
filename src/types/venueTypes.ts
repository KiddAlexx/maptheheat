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
  images?: Image[];
  hottestSauces?: string[];
  hottestDishes?: string[];
  averageRating?: number | null;
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

// Review context types - used in VenueFilterContext and UserFavVenuesContext

export type FilterField = 'city' | 'venueType' | 'venueName';
export type VenueSortField = 'averageRating' | 'totalReviews' | 'createdAt';

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
}
