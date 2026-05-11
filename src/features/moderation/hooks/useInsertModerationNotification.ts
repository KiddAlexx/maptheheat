import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { insertModerationNotification } from '@/services/apiModeration';

export function useInsertModerationNotification() {
  const {
    isPending: isInserting,
    mutate: insertNotification,
    mutateAsync: insertNotificationAsync,
  } = useMutation({
    mutationFn: insertModerationNotification,
    onSuccess: () => {
      toast.success('Notification sent');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { insertNotification, insertNotificationAsync, isInserting };
}
