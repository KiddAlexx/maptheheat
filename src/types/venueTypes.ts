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
  userId: string | null;
  addedByUsername?: string | null;
  addedByUserId?: string | null;
  venueNameSlug: string;
  coords: Coords;
  venueId: string;
  venueType: 'restaurant' | 'shop';
  thumbnailImage?: Image;
  venueImages?: DetailedImage[];
  hottestSauces?: string[];
  hottestDishes?: string[];
  averageHeatRating?: number | null;
  averageQualityRating?: number | null;
  totalReviews?: number;
  cuisines?: string[];
  dietaryOptions?: string[];
}

export type ModerationStatus = 'pending' | 'approved' | 'declined';

export interface ModerationImage extends DetailedImage {
  createdAt: string;
  venueId: string;
  reviewId: string | null;
  userId: string | null;
  imageType: 'venue' | 'review' | 'standalone' | null;
  status: ModerationStatus;
}

export interface ModerationVenue extends Venue {
  createdAt: string;
  status: ModerationStatus;
  submitterUsername?: string | null;
  venueImages?: ModerationImage[];
}

export interface ModerationStandaloneImageGroup {
  groupId: string;
  venueId: string;
  venueName: string | null;
  city: string | null;
  country?: string | null;
  venueNameSlug: string | null;
  userId: string;
  username: string | null;
  imageCount: number;
  lastCreatedAt: string;
  images: ModerationImage[];
}

export type StandaloneImageModerationFilterField =
  | 'venueName'
  | 'username';

export interface StandaloneImageModerationFilter {
  field: StandaloneImageModerationFilterField;
  value: string;
  method: SupabaseQueryMethod;
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
  imageId: string;
  imagePath: { lg: string; md: string; sm: string };
  altText: string;
}

export interface UniqueCity {
  coords: Coords;
  cityId: string;
  city: string;
  country: string;
}

export interface UniqueUserCity {
  city: string;
  country: string;
}

export type Key = string | number;

// Review context types - used in VenueFilterContext and UserFavVenuesContext

export type FilterField = 'city' | 'country' | 'venueType' | 'venueName' | 'cuisines' | 'dietaryOptions';
export type VenueSortField =
  | 'averageHeatRating'
  | 'averageQualityRating'
  | 'totalReviews'
  | 'createdAt';

export interface VenueFilter {
  field: FilterField;
  value: string | string[];
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
