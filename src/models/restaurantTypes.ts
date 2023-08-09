export interface Restaurant {
  name: string;
  address: string;
  detailedAddress: string;
  description: string;
  hours: string;
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
}

export interface Coords {
  lat: string;
  lon: string;
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
  activeRestaurant: ActiveRestaurant;
}

export type Action =
  | {
      type: 'loading';
    }
  | { type: 'restaurants/loaded'; payload: Restaurant[] }
  | { type: 'rejected'; payload: string }
  | { type: 'set-active'; payload: ActiveRestaurant };

export interface RestaurantContext extends State {
  getRestaurants: () => void;
  addRestaurant: (restaurant: Restaurant) => void;
  setActiveRestaurant: (restaurant: Restaurant) => void;
}
