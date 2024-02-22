import { useNavigate, useParams } from 'react-router';
import { useVenue } from '../../venues/hooks/useVenue';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import VenueRating from '../../venues/components/VenueRating';

import { useCreateReview } from '../hooks/useCreateReview';
import { useGetReview } from '../hooks/useGetReview';
import { useState } from 'react';
import { useUpdateReview } from '../hooks/useUpdateReview';

function ReviewForm({ mode }) {
  const navigate = useNavigate();

  const { venueId: venueIdParam } = useParams();
  const { isLoading: isLoadingVenue, venue } = useVenue(
    venueIdParam,
    mode === 'creating'
  );
  const { venueName, venueType, venueId, city, urlSlug } = venue ?? {};

  const { reviewId: reviewIdParam } = useParams();
  const { isLoading: isLoadingReview, review } = useGetReview(
    reviewIdParam,
    mode === 'editing'
  );
  const {
    reviewId,
    hottestDish,
    hottestSauce,
    images,
    reviewContent,
    reviewTitle,
    reviewType,
    venueDetails: {
      venueName: venueNameReview,
      venueId: venueIdReview,
      urlSlug: urlSlugReview,
      city: cityReview,
    } = {},
  } = review ?? {};

  const { isCreating, createReview } = useCreateReview();
  const { isUpdaating, updateReview } = useUpdateReview();

  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const [heatRating, setHeatRating] = useState(5);

  function toastFormError() {
    toast.error('Please fix the errors in the form');
  }

  async function formSubmit(formData) {
    const finalFormData = {
      ...formData,
      heatRating,
      venueId,
      reviewType: venueType,
    };
    if (mode === 'creating') {
      createReview(finalFormData, {
        onSuccess: () => {
          navigate(`/app/venue/${city}/${urlSlug}/${venueId}`, {
            replace: true,
          });
        },
      });
    } else if (mode === 'editing') {
      updateReview(
        { finalFormData, reviewId },
        {
          onSuccess: () => {
            navigate(
              `/app/venue/${cityReview}/${urlSlugReview}/${venueIdReview}`,
              {
                replace: true,
              }
            );
          },
        }
      );
    }
  }
  return (
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
      <form onSubmit={handleSubmit(formSubmit, toastFormError)}>
        {(venueType || reviewType) === 'shop' && (
          <div>
            <label htmlFor="hottestSauce">Hottest Sauce</label>
            <input
              type="text"
              placeholder="Hottest Sauce"
              id="hottestSauce"
              defaultValue={hottestSauce}
              {...register('hottestSauce', {
                required: 'This field is required',
                maxLength: {
                  value: 100,
                  message: 'Venue name cannot be more than 100 characters',
                },
              })}
            />
            {typeof errors?.hottestSauce?.message === 'string' && (
              <span> {errors.hottestSauce.message}</span>
            )}
          </div>
        )}
        {(venueType || reviewType) === 'restaurant' && (
          <div>
            <label htmlFor="hottestDish">Hottest Dish</label>
            <input
              type="text"
              placeholder="Hottest Dish"
              id="hottestDish"
              defaultValue={hottestDish}
              {...register('hottestDish', {
                required: 'This field is required',
                maxLength: {
                  value: 100,
                  message: 'Venue name cannot be more than 100 characters',
                },
              })}
            />
            {typeof errors?.hottestDish?.message === 'string' && (
              <span> {errors.hottestDish.message}</span>
            )}
          </div>
        )}
        <div>
          <label htmlFor="reviewTitle">Review Title</label>
          <input
            type="text"
            placeholder="Review Title"
            id="reviewTitle"
            defaultValue={reviewTitle}
            {...register('reviewTitle', {
              required: 'This field is required',
              maxLength: {
                value: 100,
                message: 'Review Title cannot be more than 100 characters',
              },
            })}
          />
          {typeof errors?.reviewTitle?.message === 'string' && (
            <span> {errors.reviewTitle.message}</span>
          )}
        </div>
        <div>
          <label htmlFor="reviewContent">Review</label>
          <textarea
            rows={3}
            placeholder="Please enter a detailed review of the venue..."
            id="reviewContent"
            defaultValue={reviewContent}
            {...register('reviewContent', {
              required: 'This field is required',
              minLength: {
                value: 40,
                message: 'Review must be at least 40 characters long',
              },
            })}
          />
          {typeof errors?.reviewContent?.message === 'string' && (
            <span>{errors.reviewContent.message}</span>
          )}
        </div>
        <button>Submit</button>
      </form>
    </>
  );
}

export default ReviewForm;
