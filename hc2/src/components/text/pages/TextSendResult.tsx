// 실시간 발송결과 페이지
import SendResultBody from '@/components/text/components/sendResult/SendResultBody';
import { TitleArea } from '@/components/uiux/titlearea';

export const TextSendResult = () => {
  return (
    <>
      <TitleArea variant="col" level={1} summaryLevel={2} title="실시간 발송결과" summary="발송 내역 및 상세 전송 결과를 확인하실 수 있습니다. " />
      <SendResultBody />
    </>
  );
};
