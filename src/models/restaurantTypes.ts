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
  restaurantId: string;
  images?: Image[];
  averageRating?: number | null;
}

// id not present at creation time, generate by Supbase
export type NewRestaurant = Omit<Restaurant, 'restaurantId'>;

export interface Coords {
  lat: number | string;
  lon: number | string;
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
