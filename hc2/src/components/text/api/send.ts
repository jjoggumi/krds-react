import { apiCall } from '@/apis/request';
import { SendInfo, SendNumbersResponse } from '@/components/text/types/send';
import { SendRequest } from '@/components/text/types';

export const getSenderNumber = async (schoolId: string) => {
  const { _embedded }: SendNumbersResponse = await apiCall(`GET /schools/${schoolId}/text/send/sender-number`);
  return _embedded?.numbers || [];
};

export const getSendInfo = async (schoolId: string) => {
  const data: SendInfo = await apiCall(`GET /schools/${schoolId}/text/send/info`);
  return data;
};

export const getSendTimestamp = async (schoolId: string) => {
  const { timestamp }: { timestamp: number } = await apiCall(`GET /schools/${schoolId}/text/send/timestamp`);
  return timestamp;
}

export const sendText = async (schoolId: string, sendRequest: SendRequest) => {
  const { messageId } : { messageId: string} = await apiCall(`POST /schools/${schoolId}/text/send`, { body: sendRequest });
  return messageId;
}