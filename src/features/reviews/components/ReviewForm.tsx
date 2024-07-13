// React Imports
import { useEffect, useState } from 'react';

// Hooks Imports
import { useCreateReview } from '../hooks/useCreateReview';
import { useGetReview } from '../hooks/useGetReview';
import { useUpdateReview } from '../hooks/useUpdateReview';
import { useVenue } from '../../venues/hooks/useVenue';

// Third Party Imports
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Component Imports
import VenueRating from '../../venues/components/VenueRating';
import ImageUploader from '@/components/ImageUploader';
import { Review } from '@/types/reviewTypes';
import { Button, Input, Textarea } from '@nextui-org/react';

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
}

function ReviewForm({ mode }: ReviewFormProps) {
  const [formIndex, setFormIndex] = useState(1);
  const [createdReview, setCreatedReview] = useState<Review | null>(null);
  const createdReviewId = createdReview ? createdReview.reviewId : null;

  const { isCreating, createReview } = useCreateReview();
  const { isUpdating, updateReview } = useUpdateReview();

  // Form and data state
  const { register, handleSubmit, formState, reset } = useForm<FormData>();
  const { errors } = formState;
  const [heatRating, setHeatRating] = useState(5);

  // Fetch venue details in "creating" mode.
  // All destructured variables assigned default values,
  // For instances where venue does not exist.
  const { venueId: venueIdParam } = useParams();
  const { isLoading: isLoadingVenue, venue } = useVenue(
    venueIdParam,
    mode === 'creating'
  );
  const { venueName, venueType, venueId } = venue ?? {};

  // Fetch review details in "editing" mode.
  // All destructured variables assigned default values,
  // For instances where review does not exist.
  const { reviewId: reviewIdParam } = useParams();
  const { isLoading: isLoadingReview, review } = useGetReview(
    reviewIdParam,
    mode === 'editing'
  );
  const {
    reviewId,
    reviewType,
    venueDetails,
    venueDetails: { venueName: venueNameReview = '' } = {},
  } = review ?? {};

  // Effect to set default input values to current review values in editing mode.
  useEffect(() => {
    if (mode === 'editing' && review) {
      reset({
        hottestSauce: review.hottestSauce || '',
        hottestDish: review.hottestDish || '',
        reviewTitle: review.reviewTitle || '',
        reviewContent: review.reviewContent || '',
      });
    }
  }, [mode, review, reset]);

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
        venueId: venueId!,
        reviewType: venueType!,
      };
      const newReview = await createReview(finalFormData, {
        onSuccess: () => {
          setFormIndex(2);
        },
      });
      setCreatedReview(newReview);
    } else if (mode === 'editing' && review) {
      const finalFormData = {
        ...formData,
        heatRating,
      };
      // Non null assertion on reviewId as check for review prior
      updateReview(
        { finalFormData, reviewId: reviewId! },
        {
          onSuccess: () => {
            setFormIndex(2);
          },
        }
      );
    }
  }
  return (
    <>
      {formIndex === 1 && (
        <>
          <h2>
            {mode === 'creating' ? 'Leave a ' : 'Edit your'} review for{' '}
            {venueName || venueNameReview}
          </h2>

          <span>
            <h3>Heat Rating</h3>
            <VenueRating
              initialRating={heatRating}
              handleRatingChange={setHeatRating}
            />
          </span>
          {/* Form dynamically renders fields based on venue type */}
          <form onSubmit={handleSubmit(formSubmit, toastFormError)}>
            {(venueType || reviewType) === 'shop' && (
              <div>
                <Input
                  id="hottestSauce"
                  type="text"
                  label="Hottest Sauce"
                  labelPlacement="outside"
                  placeholder="Hottest Sauce"
                  radius="sm"
                  isInvalid={!!errors.hottestSauce}
                  errorMessage={
                    errors.hottestSauce &&
                    typeof errors?.hottestSauce?.message === 'string'
                      ? errors.hottestSauce.message
                      : ''
                  }
                  {...register('hottestSauce', {
                    required: 'This field is required',
                    maxLength: {
                      value: 100,
                      message:
                        'Hottest Sauce cannot be more than 100 characters',
                    },
                  })}
                />
              </div>
            )}

            {(venueType || reviewType) === 'restaurant' && (
              <div>
                <Input
                  id="hottestDish"
                  type="text"
                  label="Hottest Dish"
                  labelPlacement="outside"
                  placeholder="Hottest Dish"
                  radius="sm"
                  isInvalid={!!errors.hottestDish}
                  errorMessage={
                    errors.hottestDish &&
                    typeof errors?.hottestDish.message === 'string'
                      ? errors.hottestDish.message
                      : ''
                  }
                  {...register('hottestDish', {
                    required: 'This field is required',
                    maxLength: {
                      value: 100,
                      message:
                        'Hottest Dish cannot be more than 100 characters',
                    },
                  })}
                />
              </div>
            )}

            <div>
              <Input
                id="reviewTitle"
                type="text"
                label="Review Title"
                labelPlacement="outside"
                radius="sm"
                placeholder="Review Title"
                isInvalid={!!errors.reviewTitle}
                errorMessage={
                  errors.reviewTitle &&
                  typeof errors?.reviewTitle?.message === 'string'
                    ? errors.reviewTitle.message
                    : ''
                }
                {...register('reviewTitle', {
                  required: 'This field is required',
                  maxLength: {
                    value: 100,
                    message: 'Review Title cannot be more than 100 characters',
                  },
                })}
              />
            </div>

            <div>
              <Textarea
                id="reviewContent"
                label="Review Content"
                rows={3}
                placeholder="Please enter a detailed review of the venue..."
                labelPlacement="outside"
                radius="sm"
                isInvalid={!!errors.reviewContent}
                errorMessage={
                  errors.reviewContent &&
                  typeof errors?.reviewContent?.message === 'string'
                    ? errors.reviewContent.message
                    : ''
                }
                {...register('reviewContent', {
                  required: 'This field is required',
                  minLength: {
                    value: 40,
                    message: 'Review must be at least 40 characters long',
                  },
                })}
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
        </>
      )}
      {formIndex === 2 && (
        <div>
          <h2>Add photos to your review</h2>
          <ImageUploader
            venue={venue || venueDetails}
            reviewId={createdReviewId || reviewId}
            mode="integrated"
          />
        </div>
      )}
    </>
  );
}

export default ReviewForm;
