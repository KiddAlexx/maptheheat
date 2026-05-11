import type { ImageDecision, ImageStatusUpdatePayload } from '../components/ImageModerationPanel';

export function getImageStatusUpdatePayload(
  selectedStatuses: Record<string, ImageDecision | undefined>
): ImageStatusUpdatePayload {
  const selectedEntries = Object.entries(selectedStatuses).filter(
    (entry): entry is [string, ImageDecision] => Boolean(entry[1])
  );

  return {
    approvedImageIds: selectedEntries
      .filter(([, status]) => status === 'approved')
      .map(([imageId]) => imageId),
    declinedImageIds: selectedEntries
      .filter(([, status]) => status === 'declined')
      .map(([imageId]) => imageId),
  };
}

export function hasImageStatusUpdates({
  approvedImageIds,
  declinedImageIds,
}: ImageStatusUpdatePayload): boolean {
  return approvedImageIds.length > 0 || declinedImageIds.length > 0;
}
