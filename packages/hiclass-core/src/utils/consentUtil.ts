import { AxiosRequestConfig } from "axios";
import { getUserConsentsAgreement } from "../api/usersService";

/**
 * 사용자의 약관 동의 상태를 조회하되, 동의 완료(true) 상태인 경우 하루에 한 번만 API를 호출하도록 캐싱
 * isAgreed=false인 경우에는 항상 최신 상태를 확인하기 위해 매번 API를 호출
 * 이 캐시는 로그아웃 시 초기화
 */
export const getDailyUserConsentsAgreement = async (config?: AxiosRequestConfig): Promise<boolean> => {
   const userId = typeof localStorage !== 'undefined' ? (localStorage.getItem('uuid') || 'unknown') : 'unknown';
   const now = new Date();
   const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
   const cacheKey = 'CONSENT_AGREEMENT_CACHE';

   if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
         try {
            const parsed = JSON.parse(cached);
            // 날짜, 사용자 ID, 동의 상태가 모두 일치하는 경우에만 캐시 사용
            if (parsed.date === today && parsed.userId === userId && parsed.isAgreed === true) {
               return true;
            }
         } catch (e) {         }
      }
   }

   const isAgreed = await getUserConsentsAgreement(config);

   if (typeof localStorage !== 'undefined') {
      if (isAgreed) {
         const cacheData = {
            date: today,
            userId: userId,
            isAgreed: true
         };
         localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } else {
         localStorage.removeItem(cacheKey);
      }
   }

   return isAgreed;
};
