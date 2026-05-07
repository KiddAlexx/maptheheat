import { Direction, SupabaseQueryMethod } from './commonTypes';
import { Profile } from './userTypes';
import {
  DetailedImage,
  Image,
  ModerationImage,
  ModerationStatus,
  Venue,
} from './venueTypes';

export interface Review {
  createdAt: string;
  heatRating: number;
  qualityRating: number;
  hottestDish?: string;
  hottestSauce?: string;
  images?: Image[];
  reviewContent: string;
  reviewId: string;
  reviewTitle: string;
  reviewType: 'shop' | 'restaurant';
  userId: string;
  venueId: string;
}

// Reviews with relational table data from profiles and venue_details
export interface ReviewWithRelations extends Review {
  profiles: Profile;
  venueDetails: Venue;
  venueImages: DetailedImage[];
}

export interface ModerationReview extends Review {
  status: ModerationStatus;
  submitterUsername?: string | null;
  venueDetails?: Venue | null;
  venueImages?: ModerationImage[];
}

// id not present at creation time, generate by Supabase
export type NewReview = Omit<Review, 'reviewId' | 'createdAt' | 'userId'>;

// Review context types - used in UserReviewsContext & ReviewSortContext
export type ReviewSortField = 'heatRating' | 'qualityRating' | 'createdAt';

export interface ReviewSort {
  field: ReviewSortField;
  direction: Direction;
}

export interface ReviewPagination {
  pageNumber: number;
  maxResults: number;
}

export type ReviewModerationFilterField =
  | 'reviewTitle'
  | 'reviewContent'
  | 'venueId'
  | 'userId'
  | 'venueDetails.country'
  | 'venueDetails.city'
  | 'venueDetails.venueName'
  | 'profiles.username';

export interface ReviewModerationFilter {
  field: ReviewModerationFilterField;
  value: string;
  method: SupabaseQueryMethod;
}

// Define individual function types
export type UpdateSort = (sortBy: ReviewSort) => void;
export type ResetSort = () => void;
export type UpdatePageNumber = (pageNumber: number) => void;
