import { apiCall } from '@/apis/request';
import { TextAuthoritiesResponse } from '@/components/text/types';

export * from './contact';
export * from './send';
export * from './sendResult';
export * from './permission';
export * from './weblink';

export const getTextAuthorities = async () => {
  const { _embedded: { lists } }: TextAuthoritiesResponse = await apiCall(`GET /schools/text/authorities`);
  return lists;
}