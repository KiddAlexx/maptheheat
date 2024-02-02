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

export interface ActiveRestaurant {
  id: string;
  coords: Coords;
  city: string;
  urlSlug: string;
}

// Used for state in Restaurant Context
export interface State {
  restaurants: Restaurant[];
  isLoading: boolean;
  errorMessage: string | null;
  activeRestaurant: Restaurant | null;
}

export interface RestaurantContextType extends State {
  addRestaurant: (restaurant: NewRestaurant) => void;
  setActiveRestaurant: (restaurant: Restaurant) => void;
  updateRestaurantImages: (id: string, imageURL: string) => void;
  clearError: () => void;
}

// Used for reducer in Restaurant Context
export type Action =
  | {
      type: 'loading';
    }
  | { type: 'restaurants/loaded'; payload: Restaurant[] }
  | { type: 'rejected'; payload: string }
  | { type: 'set-active'; payload: Restaurant }
  | { type: 'clear-error' };
