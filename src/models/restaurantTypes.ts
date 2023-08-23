export interface Restaurant {
  name: string;
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
  dateAdded: string;
  id: string;
  images?: string[];
  averageRating?: number | null;
}

// id not present at creation time, generate by Firestore
export type NewRestaurant = Omit<Restaurant, 'id'>;

export interface Coords {
  lat: number;
  lon: number;
}

export interface ActiveRestaurant {
  id: string;
  coords: Coords;
  city: string;
  urlSlug: string;
}

export interface State {
  restaurants: Restaurant[];
  isLoading: boolean;
  errorMessage: string;
  activeRestaurant: Restaurant | null;
}

export interface RestaurantContextType extends State {
  getRestaurants: () => void;
  addRestaurant: (restaurant: NewRestaurant) => void;
  setActiveRestaurant: (restaurant: Restaurant) => void;
  updateRestaurantImages: (id: string, imageURL: string) => void;
}

export type Action =
  | {
      type: 'loading';
    }
  | { type: 'restaurants/loaded'; payload: Restaurant[] }
  | { type: 'rejected'; payload: string }
  | { type: 'set-active'; payload: Restaurant };
