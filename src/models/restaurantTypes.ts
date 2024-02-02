export interface Restaurant {
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
  urlSlug: string;
  coords: Coords;
  id: string;
  images?: Image[];
  averageRating?: number | null;
}

// id not present at creation time, generate by Supbase
export type NewRestaurant = Omit<Restaurant, 'id'>;

export interface Coords {
  lat: number;
  lon: number;
}

export interface Image {
  url: string;
  alt: string;
}

export interface ImageUploadParams {
  id: string;
  imageFile: File;
  city: string;
  venue: string;
}

// Used for state in Restaurant Context
export interface State {
  errorMessage: string | null;
}

export interface RestaurantContextType extends State {
  clearError: () => void;
}

// Used for reducer in Restaurant Context
export type Action = { type: 'clear-error' };
