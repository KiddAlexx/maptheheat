import { Input, Textarea } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import ActionButton from '@/ui/ActionButton';
import { ModerationReview } from '@/types/reviewTypes';

interface ReviewModerationEditFormProps {
  isUpdating: boolean;
  onUpdateReview: (payload: {
    reviewId: string;
    reviewUpdate: Partial<ModerationReview>;
  }) => void;
  review: ModerationReview;
}

interface ReviewModerationFormData {
  heatRating: string;
  hottestDish: string;
  hottestSauce: string;
  qualityRating: string;
  reviewContent: string;
  reviewTitle: string;
}

function ReviewModerationEditForm({
  isUpdating,
  onUpdateReview,
  review,
}: ReviewModerationEditFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ReviewModerationFormData>({
    defaultValues: getDefaultValues(review),
  });

  function handleUpdateReview(formData: ReviewModerationFormData) {
    onUpdateReview({
      reviewId: review.reviewId,
      reviewUpdate: {
        heatRating: Number(formData.heatRating),
        hottestDish: formData.hottestDish.trim(),
        hottestSauce: formData.hottestSauce.trim(),
        qualityRating: Number(formData.qualityRating),
        reviewContent: formData.reviewContent.trim(),
        reviewTitle: formData.reviewTitle.trim(),
      },
    });
  }

  function handleInvalidSubmit() {
    toast.error('Please fix the errors in the form');
  }

  return (
    <article className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">Edit review</h3>

      <form
        className="mt-4 space-y-5"
        onSubmit={handleSubmit(handleUpdateReview, handleInvalidSubmit)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="reviewTitle"
            rules={{
              required: 'Review title is required',
              minLength: {
                value: 3,
                message: 'Review title must be at least 3 characters long',
              },
              maxLength: {
                value: 100,
                message: 'Review title cannot be more than 100 characters',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.reviewTitle?.message}
                id="moderation-review-title"
                isInvalid={!!errors.reviewTitle}
                label="Review title"
                labelPlacement="outside"
                radius="full"
                type="text"
              />
            )}
          />

          <Controller
            control={control}
            name="heatRating"
            rules={{
              required: 'Heat rating is required',
              validate: validateRating,
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.heatRating?.message}
                id="moderation-heat-rating"
                isInvalid={!!errors.heatRating}
                label="Heat rating"
                labelPlacement="outside"
                max={5}
                min={1}
                radius="full"
                step={1}
                type="number"
              />
            )}
          />

          <Controller
            control={control}
            name="qualityRating"
            rules={{
              required: 'Quality rating is required',
              validate: validateRating,
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.qualityRating?.message}
                id="moderation-quality-rating"
                isInvalid={!!errors.qualityRating}
                label="Quality rating"
                labelPlacement="outside"
                max={5}
                min={1}
                radius="full"
                step={1}
                type="number"
              />
            )}
          />

          {review.reviewType === 'restaurant' ? (
            <Controller
              control={control}
              name="hottestDish"
              rules={{
                required: 'Hottest dish is required',
                minLength: {
                  value: 3,
                  message: 'Hottest dish must be at least 3 characters long',
                },
                maxLength: {
                  value: 100,
                  message: 'Hottest dish cannot be more than 100 characters',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  errorMessage={errors.hottestDish?.message}
                  id="moderation-hottest-dish"
                  isInvalid={!!errors.hottestDish}
                  label="Hottest dish"
                  labelPlacement="outside"
                  radius="full"
                  type="text"
                />
              )}
            />
          ) : (
            <Controller
              control={control}
              name="hottestSauce"
              rules={{
                required: 'Hottest sauce is required',
                minLength: {
                  value: 3,
                  message: 'Hottest sauce must be at least 3 characters long',
                },
                maxLength: {
                  value: 100,
                  message: 'Hottest sauce cannot be more than 100 characters',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  errorMessage={errors.hottestSauce?.message}
                  id="moderation-hottest-sauce"
                  isInvalid={!!errors.hottestSauce}
                  label="Hottest sauce"
                  labelPlacement="outside"
                  radius="full"
                  type="text"
                />
              )}
            />
          )}
        </div>

        <Controller
          control={control}
          name="reviewContent"
          rules={{
            required: 'Review content is required',
            minLength: {
              value: 40,
              message: 'Review must be at least 40 characters long',
            },
            maxLength: {
              value: 1500,
              message: 'Review cannot be more than 1500 characters',
            },
          }}
          render={({ field }) => (
            <Textarea
              {...field}
              errorMessage={errors.reviewContent?.message}
              id="moderation-review-content"
              isInvalid={!!errors.reviewContent}
              label="Review content"
              labelPlacement="outside"
              radius="full"
            />
          )}
        />

        <div className="flex justify-end">
          <ActionButton
            intent="confirm"
            isDisabled={isUpdating}
            isLoading={isUpdating}
            type="submit"
          >
            Save review changes
          </ActionButton>
        </div>
      </form>
    </article>
  );
}

function getDefaultValues(
  review: ModerationReview
): ReviewModerationFormData {
  return {
    heatRating: String(review.heatRating),
    hottestDish: review.hottestDish ?? '',
    hottestSauce: review.hottestSauce ?? '',
    qualityRating: String(review.qualityRating),
    reviewContent: review.reviewContent,
    reviewTitle: review.reviewTitle,
  };
}

function validateRating(value: string): true | string {
  const rating = Number(value);

  if (!Number.isInteger(rating)) {
    return 'Rating must be a whole number';
  }

  return rating >= 1 && rating <= 5
    ? true
    : 'Rating must be between 1 and 5';
}

export default ReviewModerationEditForm;
