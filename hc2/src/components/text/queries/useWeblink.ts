import { useMutation, useQuery } from '@tanstack/react-query';
import { createWeblink, getWeblinkDetail } from '@/components/text/api';
import { weblinkKeys } from '@/components/text/queries/keys';
import { replaceWeblinkContent } from '../utils';

export const useWeblinkMutation = () => {
  const { isPending: createPending, mutateAsync: createMutateAsync } = useMutation({
    mutationFn: ({ schoolId }: { schoolId: string; }) =>
      createWeblink(schoolId)
  });

  return { createPending, createMutateAsync };
};

export const useWeblinkDetail = (code: string, targetCode?: string, enabled: boolean = true) => {
  const { data, isError, error, isPending } = useQuery({
    queryKey: weblinkKeys.detail(code, targetCode),
    queryFn: () => getWeblinkDetail(code, targetCode),
    retry: 0,
    staleTime: 1000 * 60 * 10,
    enabled: enabled && !!code,
    select: (res) => {
      if (res?.content) {
        const cleanContent = replaceWeblinkContent(res.content);
        return { ...res, content: cleanContent };
      }
      return res;
    }
  });

  return { data, isError, error, isPending };
}