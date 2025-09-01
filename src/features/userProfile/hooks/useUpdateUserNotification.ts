import { updateUserNotificationApi } from '@/services/apiUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface UpdateUserNotificationArgs {
  notificationId: string;
}

export function useUpdateUserNotification() {
  const queryClient = useQueryClient();

  const { mutate: updateUserNotification, isPending: isUpdating } = useMutation(
    {
      mutationFn: ({ notificationId }: UpdateUserNotificationArgs) =>
        updateUserNotificationApi({ notificationId }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );
  return { isUpdating, updateUserNotification };
}
