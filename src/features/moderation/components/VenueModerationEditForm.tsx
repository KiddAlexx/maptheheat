import { Input, Select, SelectItem, Textarea } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import ActionButton from '@/ui/ActionButton';
import { ModerationVenue } from '@/types/venueTypes';

const WEBSITE_PATTERN =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const PHONE_PATTERN = /^\+?[0-9\s-]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface VenueModerationEditFormProps {
  isUpdating: boolean;
  onUpdateVenue: (payload: {
    venueId: string;
    venueUpdate: Partial<ModerationVenue>;
  }) => void;
  venue: ModerationVenue;
}

interface VenueModerationFormData {
  address: string;
  city: string;
  country: string;
  cuisines: string;
  description: string;
  detailedAddress: string;
  dietaryOptions: string;
  hottestDishes: string;
  hottestSauces: string;
  latitude: string;
  longitude: string;
  phoneNumber: string;
  postcode: string;
  venueName: string;
  venueNameSlug: string;
  venueType: 'restaurant' | 'shop';
  website: string;
}

function VenueModerationEditForm({
  isUpdating,
  onUpdateVenue,
  venue,
}: VenueModerationEditFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<VenueModerationFormData>({
    defaultValues: getDefaultValues(venue),
  });

  function handleUpdateVenue(formData: VenueModerationFormData) {
    onUpdateVenue({
      venueId: venue.venueId,
      venueUpdate: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        coords: {
          lat: Number(formData.latitude),
          lon: Number(formData.longitude),
        },
        cuisines: splitList(formData.cuisines),
        description: formData.description.trim(),
        detailedAddress: formData.detailedAddress.trim(),
        dietaryOptions: splitList(formData.dietaryOptions),
        hottestDishes: splitList(formData.hottestDishes),
        hottestSauces: splitList(formData.hottestSauces),
        phoneNumber: formData.phoneNumber
          .replaceAll(' ', '')
          .replaceAll('-', ''),
        postcode: formData.postcode.trim(),
        venueName: formData.venueName.trim(),
        venueNameSlug: formData.venueNameSlug.trim(),
        venueType: formData.venueType,
        website: formData.website.trim(),
      },
    });
  }

  function handleInvalidSubmit() {
    toast.error('Please fix the errors in the form');
  }

  return (
    <article className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">Edit venue</h3>

      <form
        className="mt-4 space-y-5"
        onSubmit={handleSubmit(handleUpdateVenue, handleInvalidSubmit)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="venueName"
            rules={{
              required: 'Venue name is required',
              maxLength: {
                value: 100,
                message: 'Venue name cannot be more than 100 characters',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.venueName?.message}
                id="moderation-venue-name"
                isInvalid={!!errors.venueName}
                label="Venue name"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="venueNameSlug"
            rules={{
              required: 'Venue slug is required',
              pattern: {
                value: SLUG_PATTERN,
                message: 'Use lowercase words separated by hyphens',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.venueNameSlug?.message}
                id="moderation-venue-slug"
                isInvalid={!!errors.venueNameSlug}
                label="Venue slug"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="venueType"
            rules={{ required: 'Venue type is required' }}
            render={({ field }) => (
              <Select
                {...field}
                errorMessage={errors.venueType?.message}
                id="moderation-venue-type"
                isInvalid={!!errors.venueType}
                label="Venue type"
                labelPlacement="outside"
                radius="full"
                selectedKeys={[field.value]}
              >
                <SelectItem key="restaurant">Restaurant</SelectItem>
                <SelectItem key="shop">Shop</SelectItem>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: 'Phone number is required',
              pattern: {
                value: PHONE_PATTERN,
                message: 'Invalid phone number',
              },
              minLength: {
                value: 9,
                message: 'Phone number must be at least 9 digits long',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.phoneNumber?.message}
                id="moderation-phone-number"
                isInvalid={!!errors.phoneNumber}
                label="Phone number"
                labelPlacement="outside"
                radius="full"
                type="tel"
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.address?.message}
                id="moderation-address"
                isInvalid={!!errors.address}
                label="Address"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="postcode"
            rules={{ required: 'Postcode is required' }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.postcode?.message}
                id="moderation-postcode"
                isInvalid={!!errors.postcode}
                label="Postcode"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            rules={{ required: 'City is required' }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.city?.message}
                id="moderation-city"
                isInvalid={!!errors.city}
                label="City"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="country"
            rules={{ required: 'Country is required' }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.country?.message}
                id="moderation-country"
                isInvalid={!!errors.country}
                label="Country"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="latitude"
            rules={{
              required: 'Latitude is required',
              validate: validateCoordinate,
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.latitude?.message}
                id="moderation-latitude"
                isInvalid={!!errors.latitude}
                label="Latitude"
                labelPlacement="outside"
                radius="full"
                type="number"
              />
            )}
          />

          <Controller
            control={control}
            name="longitude"
            rules={{
              required: 'Longitude is required',
              validate: validateCoordinate,
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.longitude?.message}
                id="moderation-longitude"
                isInvalid={!!errors.longitude}
                label="Longitude"
                labelPlacement="outside"
                radius="full"
                type="number"
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="detailedAddress"
          rules={{ required: 'Detailed address is required' }}
          render={({ field }) => (
            <Input
              {...field}
              errorMessage={errors.detailedAddress?.message}
              id="moderation-detailed-address"
              isInvalid={!!errors.detailedAddress}
              label="Detailed address"
              labelPlacement="outside"
              radius="full"
              type="text"
            />
          )}
        />

        <Controller
          control={control}
          name="website"
          rules={{
            pattern: {
              value: WEBSITE_PATTERN,
              message: 'Invalid web address',
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              errorMessage={errors.website?.message}
              id="moderation-website"
              inputMode="url"
              isInvalid={!!errors.website}
              label="Website"
              labelPlacement="outside"
              radius="full"
              type="text"
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          rules={{
            required: 'Description is required',
            minLength: {
              value: 40,
              message: 'Description must be at least 40 characters long',
            },
            maxLength: {
              value: 500,
              message: 'Description cannot be more than 500 characters long',
            },
          }}
          render={({ field }) => (
            <Textarea
              {...field}
              errorMessage={errors.description?.message}
              id="moderation-description"
              isInvalid={!!errors.description}
              label="Description"
              labelPlacement="outside"
              radius="full"
            />
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="cuisines"
            render={({ field }) => (
              <Input
                {...field}
                id="moderation-cuisines"
                label="Cuisines"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="dietaryOptions"
            render={({ field }) => (
              <Input
                {...field}
                id="moderation-dietary-options"
                label="Dietary options"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="hottestDishes"
            render={({ field }) => (
              <Input
                {...field}
                id="moderation-hottest-dishes"
                label="Hottest dishes"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="hottestSauces"
            render={({ field }) => (
              <Input
                {...field}
                id="moderation-hottest-sauces"
                label="Hottest sauces"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />
        </div>

        <div className="flex justify-end">
          <ActionButton
            intent="confirm"
            isDisabled={isUpdating}
            isLoading={isUpdating}
            type="submit"
          >
            Save venue changes
          </ActionButton>
        </div>
      </form>
    </article>
  );
}

function getDefaultValues(venue: ModerationVenue): VenueModerationFormData {
  return {
    address: venue.address,
    city: venue.city,
    country: venue.country,
    cuisines: joinList(venue.cuisines),
    description: venue.description,
    detailedAddress: venue.detailedAddress,
    dietaryOptions: joinList(venue.dietaryOptions),
    hottestDishes: joinList(venue.hottestDishes),
    hottestSauces: joinList(venue.hottestSauces),
    latitude: String(venue.coords.lat),
    longitude: String(venue.coords.lon),
    phoneNumber: venue.phoneNumber,
    postcode: venue.postcode,
    venueName: venue.venueName,
    venueNameSlug: venue.venueNameSlug,
    venueType: venue.venueType,
    website: venue.website,
  };
}

function joinList(items?: string[]): string {
  return items?.join(', ') ?? '';
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateCoordinate(value: string): true | string {
  return Number.isFinite(Number(value)) || 'Coordinate must be a valid number';
}

export default VenueModerationEditForm;
