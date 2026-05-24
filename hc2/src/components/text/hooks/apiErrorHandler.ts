import { ShowConfirm, CONFIRM_OPTIONS } from '@/components/uiux/modal'

import { ApiError } from '@/components/text/api/error';
import { dispatchRouteChange } from '@/components/text/utils';

export const useApiErrorHandler = () => {
  const handleError = async (
    error: unknown, 
    onOtherApiError?: (errorCode: string) => void | Promise<void>,
    onOtherError?: (e: unknown) => void | Promise<void>
  ) => {
    if (error instanceof ApiError) {
      if (error.status === 406) {
        const goMain = await ShowConfirm('문자 서비스 사용 권한이 없습니다.\n학교 소유자에게 문의해주세요.', {
          ...CONFIRM_OPTIONS.TEXT,
          hideCancel: true
        });

        if (goMain) {
          dispatchRouteChange({ menu: null, routePath: '/main' });
        }
        return;
      }

      if (onOtherApiError) {
        await onOtherApiError(error.errorCode);
        return;
      }

      await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '확인',
        hideCancel: true,
      });
    }

    if (onOtherError) {
      await onOtherError(error);
      return;
    }
  };

  return { handleError };
};