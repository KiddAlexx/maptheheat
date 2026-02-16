import { factory, primaryKey, oneOf } from '@mswjs/data';
import { faker } from '@faker-js/faker';

export const db = factory({
  profile: {
    userId: primaryKey(() => faker.string.uuid()),
    updatedAt: () => faker.date.recent().toISOString(),
    username: faker.internet.username,
    avatarUrl: faker.image.avatar,
    totalReviews: () => faker.number.int({ min: 0, max: 30 }),
    totalVenuesAdded: () => faker.number.int({ min: 0, max: 15 }),
    favouriteVenues: () => [],
  },
  venue: {
    venueId: primaryKey(() => faker.string.uuid()),
    venueName: faker.company.name,
    address: () => faker.location.streetAddress(),
    detailedAddress: () => faker.location.streetAddress(),
    description: () => faker.lorem.sentences(2),
    city: faker.location.city,
    country: faker.location.country,
    postcode: faker.location.zipCode,
    phoneNumber: faker.phone.number,
    website: faker.internet.url,
    userId: faker.string.uuid,
    venueNameSlug: () =>
      faker.helpers.slugify(faker.company.name()).toLowerCase(),
    coords: {
      lat: faker.location.latitude,
      lon: faker.location.longitude,
    },
    venueType: () => faker.helpers.arrayElement(['restaurant', 'shop']),
    thumbnailImage: {
      url: faker.image.url,
      alt: () => faker.lorem.words(6),
    },
    venueImages: () => [],
    hottestSauces: () => [],
    hottestDishes: () => [],
    averageHeatRating: () => faker.number.float({ min: 0, max: 5 }),
    averageQualityRating: () => faker.number.float({ min: 0, max: 5 }),
    totalReviews: () => faker.number.int({ min: 0, max: 300 }),
  },
  review: {
    reviewId: primaryKey(() => faker.string.uuid()),
    createdAt: () => new Date().toISOString(),
    heatRating: () =>
      Math.round(faker.number.float({ min: 0.5, max: 5 }) * 2) / 2,
    qualityRating: () =>
      Math.round(faker.number.float({ min: 0.5, max: 5 }) * 2) / 2,
    hottestDish: () => faker.lorem.words(3),
    hottestSauce: () => faker.lorem.words(2),
    images: () => [],
    reviewContent: () => faker.lorem.sentences(2),
    reviewTitle: () => faker.lorem.words(4),
    reviewType: () => faker.helpers.arrayElement(['shop', 'restaurant']),
    userId: faker.string.uuid,
    venueId: faker.string.uuid,

    // relations: these will be nested objects
    profiles: oneOf('profile'),
    venueDetails: oneOf('venue'),
    venueImages: () => [],
  },
});
