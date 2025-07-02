import { Direction } from './commonTypes';
import { Profile } from './userTypes';
import { Image, Venue } from './venueTypes';

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
  venueDetails?: Venue;
  venueId: string;
}

// Reviews with relational table data from profiles and venue_details
export interface ReviewWithRelations extends Review {
  profiles: Profile;
  venueDetails: Venue;
}

// id not present at creation time, generate by Supabase
export type NewReview = Omit<Review, 'reviewId' | 'createdAt' | 'userId'>;

// Review context types - used in UserReviewsContext & ReviewSortContext
export type ReviewSortField =
  | 'averageHeatRating'
  | 'averageQualityRating'
  | 'createdAt';

export interface ReviewSort {
  field: ReviewSortField;
  direction: Direction;
}

export interface ReviewPaginationParams {
  pageNumber: number;
  maxResults: number;
}

// Define individual function types
export type UpdateSort = (sortBy: ReviewSort) => void;
export type ResetSort = () => void;
export type UpdatePageNumber = (pageNumber: number) => void;
