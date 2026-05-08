import { useQuery } from '@tanstack/react-query';
import { searchModerationNotificationRecipients } from '@/services/apiModeration';

export function useSearchModerationNotificationRecipients(query: string) {
  const trimmedQuery = query.trim();

  const { data, error, isPending } = useQuery({
    queryKey: ['moderation', 'notificationRecipients', trimmedQuery],
    queryFn: () => searchModerationNotificationRecipients(trimmedQuery),
    enabled: trimmedQuery.length >= 2,
    staleTime: 60_000,
  });

  return {
    error,
    isPending,
    recipients: data ?? [],
  };
}
