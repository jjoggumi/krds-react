import { SendBody } from '@/components/text/components/send/SendBody';
import { TitleArea } from '@/components/uiux/titlearea';

export const TextSend = () => {
  return (
    <>
      <TitleArea level={1} variant="col" summaryLevel={2} title="문자 발송" summary="전체 공지부터 개별 알림까지 한 번에 빠르고 정확하게 전달하세요." />
      <SendBody />
    </>
  );
};
