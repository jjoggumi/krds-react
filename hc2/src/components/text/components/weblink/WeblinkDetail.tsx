import {
  WeblinkDetailContent,
  WeblinkDetailContentSkeleton,
} from '@/components/text/components/weblink/WeblinkDetailContent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWeblinkDetail } from '../../queries/useWeblink';
import { useApiErrorHandler } from '../../hooks/apiErrorHandler';
import { useEffect } from 'react';
import { weblinkAlert } from '../../utils';

interface WeblinkDetailProps {
    code: string;
    targetcode?: string;
    envtype?: string;
}

const queryClient = new QueryClient();

const WeblinkDetailWrapper = ({ code, targetcode, envtype }: WeblinkDetailProps) => {
    const { data, isError, error, isPending } = useWeblinkDetail(code, targetcode, true);
    const { handleError } = useApiErrorHandler();

    useEffect(() => {
        if (isError) {
            handleError(error, async (errorCode: string) => {
                switch(errorCode) {
                    case 'notExistWeblink':
                        await weblinkAlert('존재하지 않는 상세페이지입니다.');
                        break;
                    case 'expiredWeblink':
                        await weblinkAlert('만료된 페이지입니다.');
                        break;
                    default:
                        await weblinkAlert('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                        break;
                }
            });
        }
    }, [isError]);

    if (isPending) return (
        <WeblinkDetailContentSkeleton envType={envtype}/>
    );

    return (
        !isError && data && <WeblinkDetailContent
            senderName={data.schoolName}
            messageTitle={data.title}
            messageContent={data.content}
            apiFiles={data.files}
            envType={envtype}
        />
    );
};

export const WeblinkDetail = (props: WeblinkDetailProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <WeblinkDetailWrapper {...props} />
        </QueryClientProvider>
    );
};
