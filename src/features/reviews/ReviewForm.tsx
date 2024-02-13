import { useParams } from 'react-router';
import { useVenue } from '../venues/hooks/useVenue';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import VenueRating from '../venues/components/VenueRating';
import { useState } from 'react';
import { useCreateReview } from './useCreateReview';

function ReviewForm() {
  const { venueId: venueIdParam } = useParams();
  const { isLoading: isLoadingVenue, venue } = useVenue(venueIdParam);
  const { venueName, venueType, venueId } = venue;

  const { isCreating, createReview } = useCreateReview();

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
    createReview(finalFormData);
  }

  return (
    <>
      <h2>Leave a review for {venueName}</h2>
      <span>
        <h3>Heat Rating</h3>
        <VenueRating
          initialRating={heatRating}
          handleRatingChange={setHeatRating}
        />
      </span>
      <form onSubmit={handleSubmit(formSubmit, toastFormError)}>
        {venueType === 'shop' && (
          <div>
            <label htmlFor="hottestSauce">Hottest Sauce</label>
            <input
              type="text"
              placeholder="Hottest Sauce"
              id="hottestSauce"
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
        {venueType === 'restaurant' && (
          <div>
            <label htmlFor="hottestDish">Hottest Dish</label>
            <input
              type="text"
              placeholder="Hottest Dish"
              id="hottestDish"
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
          <label htmlFor="reviewContent">Review</label>
          <textarea
            rows={3}
            placeholder="Please enter a detailed review of the venue..."
            id="reviewContent"
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
