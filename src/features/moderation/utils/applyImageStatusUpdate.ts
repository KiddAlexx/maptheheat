import type { UpdateModerationImageStatusesArgs } from '@/services/apiModeration';
import type { ModerationImage } from '@/types/venueTypes';

export function applyImageStatusUpdate(
  image: ModerationImage,
  { approvedImageIds, declinedImageIds }: UpdateModerationImageStatusesArgs
): ModerationImage {
  if (approvedImageIds.includes(image.imageId)) {
    return { ...image, status: 'approved' };
  }

  if (declinedImageIds.includes(image.imageId)) {
    return { ...image, status: 'declined' };
  }

  return image;
}
