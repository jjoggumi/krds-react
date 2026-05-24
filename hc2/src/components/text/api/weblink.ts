import { apiCall, apiCallWithoutToken } from '@/apis/request';
import { WeblinkCreateResponse, WeblinkDetail } from '@/components/text/types';

export const createWeblink = async (schoolId: string) => {
  const res: WeblinkCreateResponse = await apiCall(`POST /schools/${schoolId}/text/weblink`);
  return res;
}

export const getWeblinkDetail = async (code: string, targetCode?: string) => {
  const callUrl = targetCode ?
    `/schools/text/weblink/${code}/${targetCode}` :
    `/schools/text/weblink/${code}`;
  const res: WeblinkDetail = await apiCallWithoutToken(`GET ${callUrl}`);
  return res;
}