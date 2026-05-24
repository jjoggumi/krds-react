import { useMutation, useQuery } from '@tanstack/react-query';
import { getSenderNumber, getSendInfo, sendText } from '@/components/text/api';
import { SendRequest } from '@/components/text/types';
import { sendKeys } from '@/components/text/queries/keys';

export const useSenderNumber = (schoolId: string) => {
  const { data: senderNumbers } = useQuery({
    queryKey: sendKeys.senderNumber(schoolId),
    queryFn: () => getSenderNumber(schoolId),
    retry: 0,
    staleTime: 1000 * 60 * 10,
  });

  return { senderNumbers };
};

export const useSendInfo = (schoolId: string) => {
  const { data, isError, error, isPending } = useQuery({
    queryKey: sendKeys.info(schoolId),
    queryFn: () => getSendInfo(schoolId),
    retry: 0,
    staleTime: 1000 * 60 * 10,
  });

  return { data, isError, error, isPending };
};

export const useSendMutation = () => {
  const { isPending: sendPending, mutateAsync: sendMutateAsync } = useMutation({
    mutationFn: ({ schoolId, sendRequest }: { schoolId: string; sendRequest: SendRequest }) =>
      sendText(schoolId, sendRequest)
  });

  return { sendPending, sendMutateAsync };
};