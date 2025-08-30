import { deleteUserNotificationApi } from '@/services/apiUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface DeleteUserNotificationArgs {
  notificationId: string;
}

export function useDeleteUserNotification() {
  const queryClient = useQueryClient();

  const { mutate: deleteUserNotification, isPending: isDeleting } = useMutation(
    {
      mutationFn: ({ notificationId }: DeleteUserNotificationArgs) =>
        deleteUserNotificationApi({ notificationId }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );
  return { isDeleting, deleteUserNotification };
}
