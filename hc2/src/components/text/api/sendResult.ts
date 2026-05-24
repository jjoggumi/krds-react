import { apiCall } from '@/apis/request';
import { 
   PostTextSendResultResponse, 
   PostTextSendResultMessageResponse, 
   PostTextSendResultMessageResultTypeResponse,
   ResultType,
   SendResultSort
} from '@/components/text/types/sendResult';

export const postTextSendResult = async (schoolId: string, page: number, sort?: SendResultSort) => {
   const { _embedded, page: pageResponse }: PostTextSendResultResponse = await apiCall(`POST /schools/${schoolId}/text/send/result`, { 
      body: sort ? {
         sort: sort.sort,
         direction: sort.direction
      } : {},
      query: { page: page, size: 100 },
   });
   return { lists: _embedded?.lists || [], page: pageResponse };
};

export const postTextSendResultMessage = async (schoolId: string, messageId: string) => {
   const data: PostTextSendResultMessageResponse = await apiCall(`POST /schools/${schoolId}/text/send/result/${messageId}`);
   return data;
};

export const patchDeleteTextSendMessage = async (schoolId: string, messageIds: string[]) => {
   return await apiCall(`PATCH /schools/${schoolId}/text/send/result/remove`, {
      body: { 
         messageIds: messageIds
      }
   });
};

export const patchUpdateStatusTextSendMessage = async (schoold: string, messageId: string) => {
   return await apiCall(`PATCH /schools/${schoold}/text/send/result/${messageId}/status`); 
};

export const postTextSendResultMessageResultType = async (page: number, schoolId: string, messageId: string, resultType: ResultType) => {
   const { _embedded, page: pageResponse }: PostTextSendResultMessageResultTypeResponse = await apiCall(`POST /schools/${schoolId}/text/send/result/${messageId}/${resultType}`, {
      body: { },
      query: { page: page, size: 30 }  
   });
   return { lists: _embedded?.lists || [], page: pageResponse };;
};
