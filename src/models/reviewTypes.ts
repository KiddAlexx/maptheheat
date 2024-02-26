import { Image } from './venueTypes';

export interface Review {
  reviewId: string;
  userId: string;
  venueId: string;
  createdAt: string;
  hottestDish?: string;
  hottestSauce?: string;
  images?: Image[];
  heatRating: number;
  reviewType: 'shop' | 'restaurant';
  reviewTitle: string;
  reviewContent: string;
}

// id not present at creation time, generate by Supbase
export type NewReview = Omit<Review, 'reviewId'>;
