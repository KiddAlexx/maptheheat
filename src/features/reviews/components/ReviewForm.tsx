// React Imports
import { useEffect, useState } from 'react';

// Hooks Imports
import { useCreateReview } from '../hooks/useCreateReview';
import { useGetReview } from '../hooks/useGetReview';
import { useUpdateReview } from '../hooks/useUpdateReview';
import { useVenue } from '../../venues/hooks/useVenue';

// Third Party Imports
import { useNavigate, useParams } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Component Imports
import VenueRating from '../../venues/components/VenueRating';
import ImageUploader from '@/components/ImageUploader';
import { Review } from '@/types/reviewTypes';
import { Button, Input, Textarea } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useModalContext } from '@/context/ModalContext';

// Types
interface ReviewFormProps {
  mode: 'creating' | 'editing';
}

interface FormData {
  hottestSauce: string;
  hottestDish: string;
  reviewTitle: string;
  reviewContent: string;
}

export interface EditformData extends FormData {
  heatRating: number;
  qualityRating: number;
}

function ReviewForm({ mode }: ReviewFormProps) {
  const [formIndex, setFormIndex] = useState(1);
  const [createdReview, setCreatedReview] = useState<Review | null>(null);
  const createdReviewId = createdReview ? createdReview.reviewId : null;
  const [heatRating, setHeatRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);

  const { isCreating, createReview } = useCreateReview();
  const { isUpdating, updateReview } = useUpdateReview();

  const { openDialog } = useModalContext();
  const navigate = useNavigate();

  // Form and data state
  const defaultFormValues: FormData = {
    hottestSauce: '',
    hottestDish: '',
    reviewTitle: '',
    reviewContent: '',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: defaultFormValues,
  });

  const queryClient = useQueryClient();

  // Fetch venue details in "creating" mode.
  // All destructured variables assigned default values,
  // For instances where venue does not exist.
  const { venueId: venueIdParam } = useParams();
  const { isLoading: isLoadingVenue, venue } = useVenue(
    venueIdParam,
    mode === 'creating'
  );
  const { venueName, venueType, venueId, venueNameSlug, city } = venue ?? {};

  // Fetch review details in "editing" mode.
  // All destructured variables assigned default values,
  // For instances where review does not exist.
  const { reviewId: reviewIdParam } = useParams();

  const { isLoading: isLoadingReview, review } = useGetReview(
    reviewIdParam,
    mode === 'editing'
  );

  const { reviewId, reviewType, venueDetails } = review ?? {};
  const venueNameReview = venueDetails?.venueName;
  const venueSlugReview = venueDetails?.venueNameSlug;
  const venueCityReview = venueDetails?.city;
  const venueIdReview = venueDetails?.venueId;

  // Effect to set default input values to current review values in editing mode.
  useEffect(() => {
    if (mode === 'editing' && review && !isLoadingReview) {
      console.log('review effect', review);
      reset({
        hottestSauce: review.hottestSauce || '',
        hottestDish: review.hottestDish || '',
        reviewTitle: review.reviewTitle || '',
        reviewContent: review.reviewContent || '',
      });
    }
    setHeatRating(review?.heatRating || 5);
    setQualityRating(review?.qualityRating || 5);
  }, [mode, review, reset, isLoadingReview]);

  // Toast for form errors
  function toastFormError() {
    toast.error('Please fix the errors in the form');
  }

  // Handles form submission for editing or creating review.
  // Checks mode and presence of venue or review object before proceeding.
  async function formSubmit(formData: FormData) {
    if (mode === 'creating' && venue) {
      const finalFormData = {
        ...formData,
        heatRating,
        qualityRating,
        venueId: venueId!,
        reviewType: venueType!,
      };
      const newReview = await createReview(finalFormData, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['review', createdReviewId],
          });

          setFormIndex(2);
        },
      });
      setCreatedReview(newReview);
    } else if (mode === 'editing' && review) {
      const finalFormData = {
        ...formData,
        heatRating,
        qualityRating,
      };
      // Non null assertion on reviewId as check for review prior
      updateReview(
        { finalFormData, reviewId: reviewId! },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ['review', reviewId],
            });

            setFormIndex(2);
          },
        }
      );
    }
  }

  const naviagateToVenue = function () {
    mode === 'creating'
      ? navigate(`/app/venue/${city}/${venueNameSlug}/${venueId}`)
      : navigate(
          `/app/venue/${venueCityReview}/${venueSlugReview}/${venueIdReview}`
        );
  };

  return (
    <>
      {isLoadingReview || isLoadingVenue ? (
        <LoaderSpinner />
      ) : (
        <div className="m-3">
          {formIndex === 1 && (
            <>
              <div className="mb-3 ml-1 flex items-center justify-between">
                <h2 className=" text-2xl font-semibold">
                  {mode === 'creating' ? 'Leave a ' : 'Edit your'} review for{' '}
                  {venueName || venueNameReview}
                </h2>

                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="lucide:map-pinned" />}
                  onPress={() =>
                    openDialog(
                      'Do you want to discard this review?',
                      naviagateToVenue
                    )
                  }
                >
                  Back to venue page
                </Button>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-md">
                <div>
                  <h3 className="text-lg font-medium">Heat Rating</h3>
                  <div>
                    <VenueRating
                      initialRating={heatRating}
                      handleRatingChange={setHeatRating}
                    />
                  </div>
                </div>
                <div className="mb-10">
                  <h3 className="text-lg font-medium">Quality Rating</h3>
                  <div>
                    <VenueRating
                      initialRating={qualityRating}
                      handleRatingChange={setQualityRating}
                      variant="star"
                    />
                  </div>
                </div>
                {/* Form dynamically renders fields based on venue type */}
                <form
                  key={mode === 'editing' ? reviewId : 'new'}
                  onSubmit={handleSubmit(formSubmit, toastFormError)}
                >
                  <div>
                    <Controller
                      name="reviewTitle"
                      control={control}
                      rules={{
                        required: 'This field is required',
                        maxLength: {
                          value: 100,
                          message:
                            'Review Title cannot be more than 100 characters',
                        },
                        minLength: {
                          value: 3,
                          message:
                            'Review title must be at least 3 characters long',
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          classNames={{
                            label: 'text-lg font-medium ',
                            base: 'mb-14',
                          }}
                          id="reviewTitle"
                          type="text"
                          label="Review Title"
                          labelPlacement="outside"
                          radius="sm"
                          placeholder="Give your review a descriptive name!"
                          isInvalid={!!errors.reviewTitle}
                          errorMessage={errors.reviewTitle?.message}
                        />
                      )}
                    />
                  </div>

                  {(venueType || reviewType) === 'shop' && (
                    <div>
                      <Controller
                        name="hottestSauce"
                        control={control}
                        rules={{
                          required: 'This field is required',
                          maxLength: {
                            value: 100,
                            message:
                              'Hottest Sauce cannot be more than 100 characters',
                          },
                          minLength: {
                            value: 3,
                            message:
                              'Hottest sauce must be at least 3 characters long',
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            classNames={{
                              label: 'text-lg font-medium',
                              base: 'mb-6',
                            }}
                            id="hottestSauce"
                            type="text"
                            label="Hottest Sauce"
                            labelPlacement="outside"
                            placeholder="Whats the hottest sauce available?"
                            radius="sm"
                            isInvalid={!!errors.hottestSauce}
                            errorMessage={errors.hottestSauce?.message}
                          />
                        )}
                      />
                    </div>
                  )}

                  {(venueType || reviewType) === 'restaurant' && (
                    <div>
                      <Controller
                        name="hottestDish"
                        control={control}
                        rules={{
                          required: 'This field is required',
                          maxLength: {
                            value: 100,
                            message:
                              'Hottest Dish cannot be more than 100 characters',
                          },
                          minLength: {
                            value: 3,
                            message:
                              'Hottest dish must be at least 3 characters long',
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            classNames={{
                              label: 'text-lg font-medium',
                              base: 'mb-6',
                            }}
                            id="hottestDish"
                            type="text"
                            label="Hottest Dish"
                            labelPlacement="outside"
                            placeholder="Whats the hottest dish they serve?"
                            radius="sm"
                            isInvalid={!!errors.hottestDish}
                            errorMessage={errors.hottestDish?.message}
                          />
                        )}
                      />
                    </div>
                  )}

                  <div>
                    <Controller
                      name="reviewContent"
                      control={control}
                      rules={{
                        required: 'This field is required',
                        minLength: {
                          value: 40,
                          message: 'Review must be at least 40 characters long',
                        },
                        maxLength: {
                          value: 750,
                          message: 'Review cannot be more than 750 characters',
                        },
                      }}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          classNames={{
                            label: 'text-lg font-medium ',
                            base: 'mb-2',
                          }}
                          id="reviewContent"
                          label="Review Content"
                          rows={3}
                          placeholder="What would you like to let others know about the venue..."
                          labelPlacement="outside"
                          radius="sm"
                          isInvalid={!!errors.reviewContent}
                          errorMessage={errors.reviewContent?.message}
                        />
                      )}
                    />
                  </div>

                  <Button
                    disabled={isUpdating || isCreating}
                    radius="sm"
                    size="md"
                    type="submit"
                  >
                    {mode === 'creating' ? 'Submit' : 'Edit'}
                  </Button>
                </form>
              </div>
            </>
          )}
          {formIndex === 2 && (
            <div>
              <h2 className=" mb-3 ml-1 text-2xl font-semibold">
                Add photos to your review
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-md">
                <ImageUploader
                  venue={venue || venueDetails}
                  reviewId={createdReviewId || reviewId}
                  mode="integrated"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ReviewForm;
