import {
  updatePrivacySettings,
  UpdatePrivacySettingsParams,
} from '@/services/apiUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useUpdatePrivacySettings(userId?: string | null) {
  const queryClient = useQueryClient();

  const { mutate: updatePrivacy, isPending: isUpdating } = useMutation({
    mutationFn: (params: UpdatePrivacySettingsParams) =>
      updatePrivacySettings(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      toast.success('Privacy settings updated');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { updatePrivacy, isUpdating };
}
