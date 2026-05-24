import { useEffect, useState } from 'react';

import wifiSvg from '@/components/uiux/icons/ico-mobile-wifi.svg';
import signalSvg from '@/components/uiux/icons/ico-mobile-signal.svg';
import batterySvg from '@/components/uiux/icons/ico-mobile-battery.svg';
import styles from './SendBody.module.scss';

import { Badge, HiButton, Icon, Switch } from '@/components/uiux';
import { CheckCircle as CheckCircleIcon } from 'phosphor-react';
import Tooltip from '@/components/uiux/tooltip';
import { showToast } from '@/unimplementeds/toast';

import { useSendInfo } from '@/components/text/queries/useSend';
import { useTextContext } from '@/components/text/context/TextContext';
import { useSendReceiverContext } from '@/components/text/context/SendContext';

import { MsgType, WeblinkCode } from '@/components/text/types';

import { applyHighlightMessage, getWeblinkUrl, replaceMessage } from '@/components/text/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { isEmpty } from '@/utils/validate';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';

interface SendPreviewProps {
  messageContent: string;
  messageType: MsgType;
  messageTitle: string;
  senderNumber: string;
  senderNumberName?: string;
  targetCount: number;
  requestIsWeblink: boolean;
  generatedWebLink: WeblinkCode | null;
  isEmptySenderNumbers: boolean;
  onClickSend: () => void;
  onChangeIsDeduplication: (isDeduplication: boolean) => void;
  onOpenWeblinkPreview?: () => void;
}

const DEFAULT_SENDER_NUMBERS = { senderNumbers: [] };

export const SendPreview = ({
  messageContent,
  messageType,
  messageTitle,
  senderNumber,
  senderNumberName,
  targetCount,
  requestIsWeblink,
  generatedWebLink,
  isEmptySenderNumbers,
  onClickSend,
  onChangeIsDeduplication,
  onOpenWeblinkPreview
}: SendPreviewProps) => {
  const { currentSchool } = useTextContext();
  const { handleError } = useApiErrorHandler();
  const { data, isError, error } = useSendInfo(currentSchool.schoolId);
  const { senderNumbers } = data || DEFAULT_SENDER_NUMBERS;

  const { focusedRow } = useSendReceiverContext();
  const previewContent = focusedRow ? replaceMessage(messageContent, focusedRow) : applyHighlightMessage(messageContent);

  useEffect(() => {
    if (isError) {
      handleError(error);
    }
  }, [isError]);

  const handleChangeIsDeduplication = (isDeduplication: boolean) => {
    onChangeIsDeduplication(isDeduplication);
  };

  const handleClickSend = () => {
    onClickSend();
  };

  const isSendDisabled = !senderNumbers || senderNumbers.length === 0;

  return (
    <div className="min-w-0 sticky top-0 self-start -mt-8 z-2">
      {/* 오른쪽: 미리보기 및 발송 설정 영역 */}
      <div className={styles.previewWrap}>
        {/* 미리보기 화면 */}
        <ContentPreview
          messageContent={previewContent}
          msgType={messageType}
          messageTitle={messageTitle}
          senderNumber={senderNumber}
          senderNumberName={senderNumberName}
          senderNumbers={senderNumbers.map(s => s.senderNumber)}
          isWeblink={requestIsWeblink}
          isSetInnerHTML={!focusedRow}
          generatedWebLink={generatedWebLink}
          onOpenWeblinkPreview={onOpenWeblinkPreview}
        />
        {/* 발송 설정 섹션 */}
        <div className="flex flex-col gap-6.5 w-full">
          <SendSummary msgType={messageType} targetCount={targetCount} onChangeIsDeduplication={handleChangeIsDeduplication}/>
          <Tooltip isEnabled={!isEmptySenderNumbers} titleHtml={
          (
            <div className="flex items-start gap-1.5 p-2 w-75">
              <CheckCircleIcon size={20} weight="fill" color="var(--graphic-green)"/>
              <div className="text-leading-d1 text-text-base">
                <div className="font-bold mb-0.5">
                  잠깐! 학교 공식 메시지입니다
                </div>
                광고/홍보성 내용이 있는지 확인해주세요!
              </div>
            </div>
          )
          } position='top' size="sm" ani="fadeinOut" arrowOffset={34}>
            <HiButton
              size="lg"
              variant="primary"
              disabled={isSendDisabled}
              onClick={handleClickSend}
              style={{ fontSize: 'var(--ctl-xl-f)' }}
              className="w-full"
            >
              발송하기
              </HiButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

interface ContentPreviewProps {
  messageContent: string;
  messageTitle: string;
  msgType: MsgType;
  senderNumber: string;
  senderNumberName?: string;
  senderNumbers?: string[];
  isWeblink: boolean;
  isSetInnerHTML?: boolean;
  generatedWebLink?: WeblinkCode | null;
  onOpenWeblinkPreview?: () => void;
  className?: string;
}

export const ContentPreview = ({
  messageContent,
  messageTitle,
  msgType,
  senderNumber,
  senderNumberName,
  senderNumbers = [],
  isWeblink,
  isSetInnerHTML,
  generatedWebLink,
  onOpenWeblinkPreview,
  className
}: ContentPreviewProps) => {
  const hasSelectedNumbers = !!senderNumber;
  const hasSenderNumbers = senderNumbers.length > 0;

  const handleClickAddButton = () => {
    // 2차 범위
  }

  return (
    <div className={`${styles.previewBg} ${!messageContent || (!hasSelectedNumbers && !hasSenderNumbers) ? styles.warning : ''} ${className ? className : ''}`}>
      <Badge variant={msgType === MsgType.SMS ? 'secondary' : 'noti'} size="sm" className="absolute right-6.5 top-4">
        {msgType === MsgType.SMS ? 'SMS' : 'LMS'}
      </Badge>
      <div className={styles.previewInner}>
        {/* 핸드폰 내부 상단 바 */}
        <div className={`${styles.topBar} relative flex justify-between items-start`}>
          <div className="flex items-start gap-2">
            <Icon icon="arrow-left" iconSize={18} className="p-0.5 mt-1 text-bg-gray" />
            <div className="sticky top-0 min-w-0 flex flex-col">
              <span className="text-leading-d2 text-text-neutral-stronger">{senderNumberName ? senderNumberName : '발신번호'}</span>
              <span
                className={`text-leading-b2 font-regular ${!hasSenderNumbers && !hasSelectedNumbers ? 'text-graphic-red' : ''}`}
              >
                {hasSelectedNumbers
                  ? senderNumber
                  : (hasSenderNumbers ? '발신번호가 표시됩니다.' : '발신번호가 없습니다.')
                }
              </span>
            </div>
          </div>
          {/* 모바일 우측 상단 상태 아이콘: signal / wifi / battery */}
          <div className={styles.statusIcons}>
            <img src={signalSvg} alt="signal" className={styles.signal} />
            <img src={wifiSvg} alt="wifi" className={styles.wifiIcon} />
            <img src={batterySvg} alt="battery" className={styles.battery} />
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className={`${styles.preview} ${styles.withBubble}`}>
          <div className={`${styles.scrollInner} flex-1`}>
            {/* {!hasSenderNumbers && (
              <div className={styles.missingSender}>
                <div className="text-graphic-red text-leading-b2 mb-2">발신번호를 먼저 등록해주세요</div>
                <HiButton variant="warningLine" outline onClick={handleClickAddButton}>
                 발신번호 등록하기
                </HiButton>
              </div>
            )} */}
            <ContentBubble
              messageContent={messageContent}
              messageTitle={messageTitle}
              msgType={msgType}
              isWeblink={isWeblink}
              isSetInnerHTML={isSetInnerHTML}
              generatedWebLink={generatedWebLink}
              onOpenWeblinkPreview={onOpenWeblinkPreview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContentBubbleProps {
  messageContent: string;
  messageTitle: string;
  msgType: MsgType;
  isWeblink: boolean;
  isSetInnerHTML?: boolean;
  generatedWebLink?: WeblinkCode | null;
  onOpenWeblinkPreview?: () => void;
}
const ContentBubble = ({ messageContent, messageTitle, msgType, isWeblink, isSetInnerHTML, generatedWebLink, onOpenWeblinkPreview }: ContentBubbleProps) => {
  const lines = messageContent.split('\n');
  const isEmptyContent = isEmpty(messageContent);
  const isEmptyTitle = msgType === MsgType.SMS ? true : isEmpty(messageTitle);
  const showEmptyPlaceholder = isEmptyContent && isEmptyTitle;

  return (
    <div className={styles.bubble}>
      {msgType !== MsgType.SMS && !showEmptyPlaceholder && (
        !isEmptyTitle ? (
          <div className="font-bold mb-3 text-leading-b1">{messageTitle}</div>
        ) : (
          <div className="mb-3 text-text-neutral-base text-leading-b1 font-bold">제목을 입력해주세요.</div>
        )
      )}
      {showEmptyPlaceholder ? (
        <div className="text-text-neutral-base text-leading-b2">
          학교 소식을 입력하세요.
        </div>
      ) : (
        (isSetInnerHTML ?
            <span dangerouslySetInnerHTML={{ __html: messageContent }}></span> :
            (isEmptyContent ? null : lines.map((line: string, index: number) => (
              <span key={index}>
                {line}
                {index < lines.length - 1 && <br />}
              </span>
            )))
        )
      )}
      {/* 문자 2차 범위 : 링크 박스 :cursor-pointer class 들어간 영역이 링크영역입니다.  */}
      <AnimatePresence initial={false}>
        {msgType === MsgType.LMS && isWeblink && generatedWebLink?.code && (
          <motion.div
            key="weblink-bubble"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ willChange: 'opacity' }}
            className="text-leading-b2 mt-3"
            onClick={onOpenWeblinkPreview}
          >
            상세보기
            <div className="text-text-primary-base text-leading-b2 underline cursor-pointer">
              {getWeblinkUrl(generatedWebLink)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SendSummaryProps {
  msgType: MsgType;
  targetCount: number;
  onChangeIsDeduplication: (isDeduplication: boolean) => void;
}

const DEFAULT_POINT = { point: 0 };

const SendSummary = ({ msgType, targetCount, onChangeIsDeduplication }: SendSummaryProps) => {
  const { currentSchool } = useTextContext();
  const { handleError } = useApiErrorHandler();
  const { data, isError, error } = useSendInfo(currentSchool.schoolId);
  const { point } = data || DEFAULT_POINT;

  const [isDeduplication, setIsDeduplication] = useState<boolean>(true);

  useEffect(() => {
    if (isError) {
      handleError(error);
    }
  }, [isError]);

  useEffect(() => {
    onChangeIsDeduplication(isDeduplication);
  }, [isDeduplication]);

  const deductPoints = (msgType === MsgType.SMS ? 1 : 3) * targetCount;
  const hasEnoughPoints = point >= deductPoints;

  const handleUpdateIsDeduplication = (isDeduplication: boolean) => {
    setIsDeduplication(isDeduplication);
    const toastMsg = isDeduplication ?
    '모든 수신자에게 메시지를 발송합니다.':
    '중복된 연락처는 1건만 발송됩니다.' ;
    showToast(toastMsg, 2000);
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-7 justify-between">
        <span className="font-bold text-leading-b2">총 발송 건수</span>
        <span className="text-leading-b2 font-bold">
          <span className="text-text-primary-base">{targetCount.toLocaleString()}</span>
          <span className="text-text-default">건</span>
        </span>
      </div>
      <hr className={styles.sep} />
      {/* 포인트 내역 */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-7 text-leading-b2 justify-between font-bold">
          <span>차감 예정 포인트</span>
          <span className={`${!hasEnoughPoints ? 'text-graphic-red' : 'text-text-primary-base'} `}>
            {deductPoints.toLocaleString()} <span>P</span>
          </span>
        </div>
        <div className="flex gap-7 text-leading-b2 justify-between">
          <span>보유한 포인트</span>
          <span className={!hasEnoughPoints ? 'text-graphic-red' : ''}>
            {point.toLocaleString()} <span>P</span>
          </span>
        </div>        
        {!hasEnoughPoints && 
        <div className={styles.pointError}><Icon icon="info" color="warning" iconSize={16} /> 포인트가 부족합니다.</div>
        }
      </div>
      <hr className={styles.sep} />
      <div className="flex items-center mt-1 gap-2 justify-between">
        <div className="flex items-center gap-0.5">
          <span className="text-leading-b2">중복 수신번호 허용</span>          
          <Tooltip titleHtml={
          `<div class="text-leading-d1 "py-1 px-1"><strong>중복 번호 수신 설정</strong><br/>
          [허용] : 다자녀 학부모 등 동일 번호로 여러 건 수신이 필요한 경우 선택하세요.<br/>
          [차단] : 중복된 번호는 자동으로 제외하고 1건만 발송합니다.</div>`
          } position='center-bottom' size="sm" >
            <Icon icon="help-fill" iconSize={16} color="light-gray" className='hover:bg-bg-primary-base !align-baseline' />
          </Tooltip>
        </div>
        <Switch model={isDeduplication} onUpdateModel={handleUpdateIsDeduplication} />
      </div>
    </div>
  );
};
