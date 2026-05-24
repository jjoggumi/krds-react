import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import moment from 'moment';
import 'moment/dist/locale/ko';
import { SendMessageForm } from '@/components/text/components/send/SendMessageForm';
import { SendReceiver } from '@/components/text/components/send/SendReceiver';
import { SendOption } from '@/components/text/components/send/SendOption';
import { SendPreview } from '@/components/text/components/send/SendPreview';
import { WeblinkViewPopup } from '@/components/text/components/send/modal/WeblinkPreviewModal';
import { CONFIRM_OPTIONS, ShowConfirm } from '@/components/uiux/modal';
import HiModal from '@/components/uiux/hiModal';
import { Button, HiButton, Textarea } from '@/components/uiux';

import {
  SendRequest,
  SendTargetWithValidation,
  SendType,
  SendValidationCode,
  SendValidationError,
  WeblinkCreateResponse,
  WeblinkFile,
} from '@/components/text/types';
import { MsgType } from '@/components/text/types/send';
import {
  CONTENT_FIELDS,
  SEND_MAX_BYTE,
  SEND_MAX_TARGETS,
  SEND_VALIDATION_MESSAGE,
  SESSION_STORAGE_KEY_LAST_MESSAGE_ID,
  SESSION_STORAGE_KEY_LAST_SEND_TYPE,
} from '@/components/text/constants';

import { isEmpty } from '@/utils/validate';
import { showToast } from '@/unimplementeds/toast';

import { SendReceiverContextProvider } from '@/components/text/context/SendContext';
import { useTextContext } from '@/components/text/context/TextContext';
import { useLoadingContext } from '@/components/text/context/LoadingContext';
import { useSendInfo, useSendMutation } from '@/components/text/queries/useSend';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { sendKeys } from '@/components/text/queries/keys';
import { useQueryClient } from '@tanstack/react-query';

import {
  applyHighlightMessage,
  dispatchRouteChange,
  extractEmojisFromString, getWeblinkUrl, handleHc2TextEvent,
  hasVariable,
  renderSenderNumber,
  replaceMessage,
} from '@/components/text/utils';
import { getSendTimestamp } from '@/components/text/api';
import { ApiError } from '../../api/error';
import { getByteLength } from '../../utils/send';

// Lottie 애니메이션 컴포넌트 (React용)
import Lottie from 'lottie-react';
import checkLottie from '@/components/uiux/lotties/check.json';
import { WeblinkSetting } from '@/components/text/components/send/WeblinkSetting';
import { deleteUploadedFile } from '@/apis/multipart';
import {
  STAGGER_CONTAINER_VARIANTS,
  FADE_IN_UP_ORDERED_VARIANTS,
} from '@/components/text/constants/animations';

moment.locale('ko');

enum SendStatus {
  CANCEL = 'CANCEL',
  SEND = 'SEND'
}

interface PopupResult {
  isConfirmed: boolean;
  reason: string;
}

const DEFAULT_POINT = { point: 0 };

const restrictionMessages = {
  invalidNightTimeAndExceedReason: '현재 심야 시간대(21:00~08:00)이며,\n1회 발송 한도(500건)를 초과하였습니다.\n긴급 발송 시 사유 입력 후 발송 가능합니다.\n진행하시겠습니까?',
  invalidNightTimeReason: '심야 시간(21:00~08:00)에는\n메시지 발송이 제한됩니다.\n긴급 발송 시 사유 입력 후 발송 가능합니다.\n진행하시겠습니까?',
  invalidExceedReason: '500건을 초과하여 발송할 경우,\n대량 문자로 분류되어 사유 입력이 필요합니다.\n진행하시겠습니까?'
};

const errorAlerts = {
  pointLack: '보유한 포인트가 부족합니다.\n충전 후 이용해주세요.',
};

export const SendBody = () => {
  const { currentSchool } = useTextContext();
  const { handleError } = useApiErrorHandler();
  const { data, isError, error } = useSendInfo(currentSchool.schoolId);
  const { point } = data || DEFAULT_POINT;

  const queryClient = useQueryClient();
  const { sendPending, sendMutateAsync } = useSendMutation();
  const { showLoading, hideLoading } = useLoadingContext();

  const requestMessageItem = useRef<SendRequest>({
    msgType: MsgType.SMS,
    title: '',
    content: '',
    senderNumberId: '',
    sendType: SendType.IMMEDIATE,
    reservedTimestamp: null,
    isDeduplication: false,
    targets: [],
    isWeblink: false,
    weblinkId: null,
    weblinkFiles: [],
  });
  const isSending = useRef<boolean>(false);
  const popupResolveRef = useRef<((result: PopupResult) => void) | null>(null);
  const successPopupResolveRef = useRef<((result: boolean) => void) | null>(null);
  const requestWeblinkFilesRef = useRef([]);

  const confirmRestrictedTime = () => {
    setIsOpenReasonPopup(true);
    return new Promise<PopupResult>((resolve) => {
      popupResolveRef.current = resolve;
    });
  };

  // 다른 컴포넌트에서 사용하여 값이 렌더링되어야하는 값들은 useState 정의
  const [requestContent, setRequestContent] = useState<string>('');
  const [requestMsgType, setRequestMsgType] = useState<MsgType>(MsgType.SMS);
  const [requestTitle, setRequestTitle] = useState<string>('');
  const [requestIsWeblink, setRequestIsWeblink] = useState<boolean>(false);
  const [senderNumber, setSenderNumber] = useState<Record<string, string>>({ number: '', name: '' });
  const [isEmptySenderNumbers, setIsEmptySenderNumbers] = useState<boolean>(false);
  const [isDeduplication, setIsDeduplication] = useState<boolean>(false);
  const [requestWeblinkFiles, setRequestWeblinkFiles] = useState<WeblinkFile[]>([]);

  const [targetCount, setTargetCount] = useState<number>(0);
  const [generatedWebLink, setGeneratedWebLink] = useState<WeblinkCreateResponse | null>(null);
  const [isOpenReasonPopup, setIsOpenReasonPopup] = useState<boolean>(false);
  // 발송 성공 안내 모달 열림 상태
  const [isOpenSuccessPopup, setIsOpenSuccessPopup] = useState<boolean>(false);
  // 발송 성공 안내 문구
  const [successMessageText, setSuccessMessageText] = useState<string>('');
  // 문자 2차 범위: 웹 링크 보기 모달
  const [isOpenWeblinkPopup, setIsOpenWeblinkPopup] = useState<boolean>(false);
  const [isDeleteUnusedFiles, setIsDeleteUnusedFiles] = useState<boolean>(true);

  useEffect(() => {
    if (isError) {
      handleError(error);
    }
  }, [isError]);

  useEffect(() => {
    handleChangeRequestMessage('content', requestContent);
  }, [requestContent]);

  useEffect(() => {
    handleChangeRequestMessage('msgType', requestMsgType);
  }, [requestMsgType]);

  useEffect(() => {
    handleChangeRequestMessage('title', requestTitle);
  }, [requestTitle]);

  useEffect(() => {
    handleChangeRequestMessage('isDeduplication', isDeduplication);
  }, [isDeduplication]);

  useEffect(() => {
    handleReset();
  }, [currentSchool]);

  useEffect(() => {
    requestWeblinkFilesRef.current = requestWeblinkFiles;
  }, [requestWeblinkFiles]);

  useEffect(() => {
    return () => {
      if (isDeleteUnusedFiles && requestWeblinkFilesRef.current.length > 0) {
        deleteUnusedFiles(requestWeblinkFilesRef.current);
      }
    }
  }, []);

  const handleChangeRequestMessage = <K extends keyof SendRequest>(field: K, value: SendRequest[K]) => {
    requestMessageItem.current[field] = value;
  };

  const handleClickSend = async () => {
    if (isSending.current) return;
    isSending.current = true;

    const {
      msgType, title, content, senderNumberId,
      sendType, reservedTimestamp, isDeduplication, targets
    } = requestMessageItem.current;

    const filteredTargets = isDeduplication ?
      targets :
      targets.filter((t) => !t.isDuplication);

    try {
      checkRequired({ msgType, title, content, senderNumberId, sendType, filteredTargets, requestIsWeblink, requestWeblinkFiles });
      checkValid({ msgType, title, content, filteredTargets });

      let sendReason = null;
      const sendStatus = await checkSendType({ schoolId: currentSchool.schoolId, sendType, reservedTimestamp });

      checkPoint({ point, msgType, filteredTargets });

      const sendRequest = generateRequestData(filteredTargets, sendReason, generatedWebLink?.weblinkId, requestIsWeblink, requestWeblinkFiles);
      const checkTarget = checkTargets({ filteredTargets });

      const showRestrictionMessage = async (message: string) => {
        await handleRestrictionMessage(message, sendRequest, {
          shouldConfirmSend: true,
          sendType: sendType,
          reservedTimestamp: reservedTimestamp,
        });
      }

      if (sendStatus === SendValidationCode.IN_RESTRICTED_TIME && checkTarget === SendValidationCode.OVER_SEND_LIMIT) {
        await showRestrictionMessage(restrictionMessages['invalidNightTimeAndExceedReason']);
      } else if (sendStatus === SendValidationCode.IN_RESTRICTED_TIME) {
        await showRestrictionMessage(restrictionMessages['invalidNightTimeReason']);
      } else if (checkTarget === SendValidationCode.OVER_SEND_LIMIT) {
        await showRestrictionMessage(restrictionMessages['invalidExceedReason']);
      } else { //SendStatus.SEND
        if (sendPending) return;
        await confirmPostSend(sendType, reservedTimestamp, sendRequest);
      }

    } catch (e) {
      if (e instanceof SendValidationError) {
        const { errorCode, errorData } = e;
        const { message, showType } = SEND_VALIDATION_MESSAGE[e.errorCode];
        handleValidationError({ message, showType, errorCode, errorData })
      }
    } finally {
      isSending.current = false;
      hideLoading();
    }
  };

  const handleChangeWeblinkFiles = (files: WeblinkFile[]) => {
    setRequestWeblinkFiles(files);
  }

  const confirmPostSend = async (sendType: SendType, reservedTimestamp: number, sendRequest: SendRequest) => {
    const sendConfirmContent = getConfirmContent(sendType, sendRequest.targets.length, reservedTimestamp);
    const isSend = await ShowConfirm(sendConfirmContent, {
      ...CONFIRM_OPTIONS.TEXT,
    })

    if (!isSend) {
      await ShowConfirm('문자 발송이 취소되었습니다.', {
        ...CONFIRM_OPTIONS.TEXT,
        hideCancel: true,
      })
      return;
    }

    setIsDeleteUnusedFiles(false);
    await postSend(sendRequest);
  };

  const postSend = async (sendRequest: SendRequest) => {
    try {
      showLoading();
      const messageId = await sendMutateAsync({ schoolId: currentSchool.schoolId, sendRequest });
      hideLoading();

      if (sendRequest.isWeblink) {
        const hasValue = hasVariable(sendRequest.content);
        handleHc2TextEvent({
          command: 'triggerAnalytics',
          eventData: {
            params : {
              school_name: currentSchool.schoolName,
              lmsweb_send_date: moment(
                sendRequest.reservedTimestamp 
                ? sendRequest.reservedTimestamp 
                : new Date().getTime()
              ).format('YYYYMMDD'),
              recipient_count: sendRequest.targets.length,
              has_variable: hasValue === true ? 1 : 0,
              lms_address: generatedWebLink.code,
            },
            GACode: 'analytics.text.send.weblink'
          }
        });
      }

      sessionStorage.setItem(SESSION_STORAGE_KEY_LAST_MESSAGE_ID, messageId);
      sessionStorage.setItem(SESSION_STORAGE_KEY_LAST_SEND_TYPE, sendRequest.sendType);

      const successText = sendRequest.sendType === SendType.IMMEDIATE ?
        '문자 발송 요청이 완료되었습니다.\n상세 결과는 발송 내역에서 확인 해주세요.' :
        '예약 발송 요청이 완료되었습니다.\n상세 결과는 발송 내역에서 확인 해주세요.\n(발송 5분전까지 발송내역에서 취소 가능합니다.)';
      // Lottie 애니메이션이 포함된 커스텀 성공 모달 표시
      const isOk = await confirmSuccess(successText);
      handleReset();
      if (isOk) {
        // 발송내역으로 이동
        dispatchRouteChange({ menu: 'result', query: { from: 'send' } });
      }
    } catch (e) {
      hideLoading();

      if (e instanceof ApiError) {
        // overBytes 바이트 초과
        // invalidPhoneNumbers : 수신번호 없음
        // pointLack : 잔액 부족
        // untitled : LMS 제목 없음
        // invalidNightTimeAndExceedReason : 심야 제한, 500건 초과 시
        // invalidNightTimeReason: 21:00 ~ 08:00 심야 발송 제한 보내려면 reason 필요.
        // invalidExceedReason : 500건 초과 시 reason 필요
        const { errorCode, status, errorMessage } = e;

        if (status === 406) {
          await ShowConfirm('문자 서비스 사용 권한이 없습니다.\n학교 소유자에게 문의해주세요.', {
            ...CONFIRM_OPTIONS.TEXT,
            hideCancel: true
          })
          return;
        }

        handlerApiError(errorCode, sendRequest, errorMessage);
      }
    }
  };

  const handleRestrictionMessage = async (message: string | ReactNode, sendRequest: SendRequest, data: {
    shouldConfirmSend: boolean,
    sendType?: SendType,
    reservedTimestamp?: number,
  }) => {
    let content: ReactNode = message;
    if (typeof message === 'string') {
      const lines = message.split('\n').filter(Boolean);
      const headingLines = lines.slice(0, 2);
      const restLines = lines.slice(2);
      const headingText = headingLines.join('\n');
      const restText = restLines.join('\n');
      content = (
        <div className="flex flex-col gap-2">
          {headingText ? <div className="text-leading-b1 font-bold text-text-inverse whitespace-pre-line">{headingText}</div> : null}
          {restText ? <div className="text-leading-b2 text-text-inverse whitespace-pre-line">{restText}</div> : null}
        </div>
      );
    }

    const isConfirmed = await ShowConfirm(content, {
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '확인',
      cancelLabel: '취소',
    });

    if (isConfirmed) {
      const { isConfirmed: isReasonConfirmed, reason } = await confirmRestrictedTime();
      if (isReasonConfirmed) {
        if (data.shouldConfirmSend === true) {
          await confirmPostSend(data.sendType, data.reservedTimestamp, { ...sendRequest, reason: reason })
        } else {
          await postSend({ ...sendRequest, reason: reason });
        }
      }
    }
  }

  const handlerApiError = async (errorCode: string, sendRequest: SendRequest, errorMessage?: string) => {
    // overBytes 바이트 초과
    // invalidPhoneNumbers : 수신번호 없음
    // pointLack : 잔액 부족
    // untitled : LMS 제목 없음
    // invalidNightTimeAndExceedReason : 심야 제한, 500건 초과 시
    // invalidNightTimeReason: 21:00 ~ 08:00 심야 발송 제한 보내려면 reason 필요.
    // invalidExceedReason : 500건 초과 시 reason 필요

    if (restrictionMessages[errorCode]) {
      await handleRestrictionMessage(restrictionMessages[errorCode], sendRequest, { shouldConfirmSend: false });
      return;
    }

    if(errorCode === 'overBytes' && errorMessage) {
      const validationErrorCode = SendValidationCode.OVER_BYTE;
      const validationError = SEND_VALIDATION_MESSAGE[validationErrorCode];
      handleValidationError(
        {
          message: validationError.message,
          showType: validationError.showType,
          errorCode: validationErrorCode,
          errorData: {
            msgType: sendRequest.msgType,
            phoneNumber: errorMessage
          }
        }
      )
    } else {
      let message = errorAlerts[errorCode]
        ? errorAlerts[errorCode]
        : '일시적인 오류로 문자 발송에 실패하였습니다.\n잠시 후 다시 시도해주세요.';
      await ShowConfirm(message, {
        ...CONFIRM_OPTIONS.TEXT,
        hideCancel: true,
        confirmLabel: '확인',
      });
    }
  }

  // 발송 성공 안내 모달 표시 함수
  const confirmSuccess = (message: string) => {
    setSuccessMessageText(message);
    setIsOpenSuccessPopup(true);
    return new Promise<boolean>((resolve) => {
      successPopupResolveRef.current = resolve;
    });
  };

  const handleOpenWeblinkPopup = () => {
    setIsOpenWeblinkPopup(true);
  };

  const handleValidationError = ({ message, showType, errorCode, errorData }: {
    message: string;
    showType: 'ALERT' | 'TOAST',
    errorCode: SendValidationCode,
    errorData?: Record<string, any>
  }) => {
    const showError = {
      'ALERT': async () => {
        if (errorCode === SendValidationCode.INCLUDES_EMOJI) {
          const msg = `${message}[${errorData?.emojis.join(', ')}]`;
          await ShowConfirm(msg, {
            ...CONFIRM_OPTIONS.TEXT,
            hideCancel: true,
          });
        }
        if (errorCode === SendValidationCode.OVER_BYTE) {
          const { msgType, phoneNumber } = errorData;
          const masked = maskPhoneNumber(phoneNumber);
          const content = (
            <div className='flex flex-col gap-4'>
              <div className='text-leading-b2'>{message}</div>
              <div className='flex items-center p-3 text-text-primary-base radius-md justify-center text-leading-b2 font-bold' style={{ backgroundColor: '#EBEEF4' }}>
                {masked}
              </div>
            </div>
          );
          await ShowConfirm(content, {
            ...CONFIRM_OPTIONS.TEXT,
            className: 'text-alert max-w-90',
            hideCancel: true,
          });
        }
        if (errorCode === SendValidationCode.POINT_LACK) {
          await ShowConfirm(message, {
            ...CONFIRM_OPTIONS.TEXT,
            hideCancel: true,
          });
        }
      },
      'TOAST': () => showToast(message, 1500)
    }
    showError[showType]()
  }

  const generateRequestData = (filteredTargets: SendTargetWithValidation[], sendReason: string | null, weblinkId: string, requestIsWeblink: boolean, requestWeblinkFiles: WeblinkFile[]) => {
    const {
      msgType, title, content, senderNumberId,
      sendType, reservedTimestamp, isDeduplication
    } = requestMessageItem.current;

    const targets = filteredTargets.map(t => ({
      contactId: t.contactId,
      phoneNumber: t.phoneNumber,
      contactName: t.contactName,
      depth1: t.depth1,
      depth2: t.depth2,
      field1: t.field1,
      field2: t.field2,
      field3: t.field3,
      field4: t.field4,
      field5: t.field5,
      field6: t.field6,
      field7: t.field7,
      field8: t.field8,
    }));

    const sendRequest: SendRequest = {
      msgType,
      content,
      senderNumberId,
      sendType,
      isDeduplication: !isDeduplication,
      targets,
      isWeblink: requestIsWeblink
    }

    if (msgType !== MsgType.SMS) {
      sendRequest.title = title;
      if (sendRequest.isWeblink) {
        sendRequest.weblinkId = weblinkId;
        sendRequest.weblinkFiles = requestWeblinkFiles;

        let link = getWeblinkUrl({ code: generatedWebLink.code });
        const hasField = hasFieldInContent(sendRequest.content);
        if (hasField) {
          link = `${link}/#{targetCode}`
        }

        sendRequest.content = sendRequest.content + "\n\n상세보기\n" + link;
      }
    } else {
      sendRequest.isWeblink = false;
    }

    if (sendType === SendType.RESERVED) {
      sendRequest.reservedTimestamp = reservedTimestamp;
    }

    if (sendReason !== null) {
      sendRequest.reason = sendReason;
    }

    return sendRequest;
  };

  const resetForm = () => {
    requestMessageItem.current = {
      msgType: MsgType.SMS,
      title: '',
      content: '',
      senderNumberId: '',
      sendType: SendType.IMMEDIATE,
      reservedTimestamp: null,
      isDeduplication: false,
      targets: [],
      isWeblink: false,
      weblinkId: null,
      weblinkFiles: [],
    };

    setRequestContent('');
    setRequestMsgType(MsgType.SMS);
    setRequestTitle('');
    setRequestIsWeblink(false);
    setRequestWeblinkFiles([]);
    setSenderNumber({ number: '', name: '' });
    setIsDeduplication(false);
    setTargetCount(0);
    setGeneratedWebLink(null);
  };

  const [formKey, setFormKey] = useState(0);
  const handleReset = () => {
    queryClient.invalidateQueries({ queryKey: sendKeys.info(currentSchool.schoolId) }).then();
    resetForm();
    setFormKey(prev => prev + 1)
  };

  return (
    <>
      <div id={'contact-selector-modal'}></div>
      <motion.div
        className="flex gap-10 justify-between"
        key={formKey}
        initial="hidden"
        animate="visible"
        variants={STAGGER_CONTAINER_VARIANTS}
      >
        <SendReceiverContextProvider>
          {/* 왼쪽: 탭 네비게이션 및 테이블 */}
          <div className="flex-1 min-w-0 flex flex-col mt-5 z-0">
            <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
              <SendMessageForm
                requestContent={requestContent}
                setRequestContent={setRequestContent}
                requestMsgType={requestMsgType}
                setRequestMsgType={setRequestMsgType}
                requestTitle={requestTitle}
                setRequestTitle={setRequestTitle}
                requestIsWeblink={requestIsWeblink}
                generatedWebLink={generatedWebLink}
              />
            </motion.div>
            {requestMsgType === MsgType.LMS && (
              <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
                <WeblinkSetting
                  requestContent={requestContent}
                  isWeblink={requestIsWeblink}
                  setRequestIsWeblink={setRequestIsWeblink}
                  generatedWebLink={generatedWebLink}
                  setGeneratedWebLink={setGeneratedWebLink}
                  onOpenWeblinkPreview={handleOpenWeblinkPopup}
                  weblinkFiles={requestWeblinkFiles}
                  onChangeWeblinkFiles={handleChangeWeblinkFiles}
                />
              </motion.div>
            )}
            <motion.div custom={1} variants={FADE_IN_UP_ORDERED_VARIANTS}>
              <SendReceiver
                isDeduplication={isDeduplication}
                onChangeRequestMessage={handleChangeRequestMessage}
                onChangeTargetCount={setTargetCount}
              />
            </motion.div>
            <motion.div custom={2} variants={FADE_IN_UP_ORDERED_VARIANTS}>
              <SendOption
                setSenderNumber={setSenderNumber}
                setIsEmptySenderNumbers={setIsEmptySenderNumbers}
                onChangeRequestMessage={handleChangeRequestMessage}
              />
            </motion.div>
          </div>
          <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
            <SendPreview
              messageContent={requestContent}
              messageType={requestMsgType}
              messageTitle={requestTitle}
              senderNumber={renderSenderNumber(senderNumber.number)}
              senderNumberName={senderNumber.name}
              targetCount={targetCount}
              requestIsWeblink={requestIsWeblink}
              generatedWebLink={generatedWebLink}
              isEmptySenderNumbers={isEmptySenderNumbers}
              onClickSend={handleClickSend}
              onChangeIsDeduplication={setIsDeduplication}
              onOpenWeblinkPreview={handleOpenWeblinkPopup}
            />
          </motion.div>
        </SendReceiverContextProvider>
        <ReasonInputPopup isOpen={isOpenReasonPopup} popupResolveRef={popupResolveRef} onClose={() => setIsOpenReasonPopup(false)} />
        {/* 웹링크 미리보기 팝업 */}
        <WeblinkViewPopup
          isOpen={isOpenWeblinkPopup}
          senderName={currentSchool.schoolName}
          onClose={() => setIsOpenWeblinkPopup(false)}
          messageTitle={requestTitle}
          messageContent={applyHighlightMessage(requestContent)}
          msgType={requestMsgType}
          isSetInnerHTML={true}
          files={requestWeblinkFiles}
          mode='preview'
        />
        {/* 발송 성공 안내 모달 (Lottie 애니메이션 포함) */}
        <SuccessPopup
          isOpen={isOpenSuccessPopup}
          message={successMessageText}
          popupResolveRef={successPopupResolveRef}
          onClose={() => setIsOpenSuccessPopup(false)}
          onChangeIsDeleteUnusedFiles={setIsDeleteUnusedFiles}
        />
      </motion.div>
    </>
  );
};

interface ReasonInputPopupProps {
  isOpen: boolean;
  popupResolveRef: RefObject<((result: PopupResult) => void) | null>;
  onClose: () => void;
}
const ReasonInputPopup = ({ isOpen, popupResolveRef, onClose }: ReasonInputPopupProps) => {
  const [inputValue, setValue] = useState<string>('');

  const handlePopupConfirm = () => {
    if (popupResolveRef.current) {
      popupResolveRef.current({ isConfirmed: true, reason: inputValue });
      setValue('');
      onClose();
    }
  };

  const handlePopupCancel = () => {
    if (popupResolveRef.current) {
      popupResolveRef.current({ isConfirmed: false, reason: '' });
      setValue('');
      onClose();
    }
  };

  return (
    <HiModal
      isOpen={isOpen}
      onClose={handlePopupCancel}
      dimClose
      size="md"
      content={(
        <>
          <div className="mb-4 -mt-4">
            <div className="text-leading-b1 font-bold">문자 발송 사유 입력</div>
            <div className="text-leading-b2">정보통신망법 준수 및 스팸 방지를 위해 발송 사유 확인이 필요합니다</div>
          </div>
          <Textarea
            className="max-h-15 py-3"
            value={inputValue}
            showClearButton={false}
            placeholder="긴급 공지, 행사 안내 등 구체적인 발송 목적을 입력해 주세요."
            resizable={false}
            rows={2}
            onChange={(e: any) => setValue(e?.target?.value ?? '')}
            maxLength={100}
          />
        </>
      )}
      footer={(
        <>
          <HiButton variant="tertiary" size="lg" onClick={handlePopupCancel}>취소</HiButton>
          <HiButton variant="primary" size="lg" onClick={handlePopupConfirm} disabled={isEmpty(inputValue)}>완료</HiButton>
        </>
      )}
    />
  )
}

// 발송 성공 안내 모달 컴포넌트의 Props 정의
interface SuccessPopupProps {
  isOpen: boolean;
  message: string;
  popupResolveRef: RefObject<((result: boolean) => void) | null>;
  onClose: () => void;
  onChangeIsDeleteUnusedFiles: (setIsDeleteUnusedFiles: boolean) => void;
}
// 발송 성공 안내 모달 컴포넌트
const SuccessPopup = ({ isOpen, message, popupResolveRef, onClose, onChangeIsDeleteUnusedFiles }: SuccessPopupProps) => {
  const handleConfirm = () => {
    if (popupResolveRef.current) {
      popupResolveRef.current(true);
      onClose();
    }
  };
  const handleCancel = () => {
    if (popupResolveRef.current) {
      popupResolveRef.current(false);
      onClose();
      onChangeIsDeleteUnusedFiles(true);
    }
  };

  return (
    <HiModal
      isOpen={isOpen}
      onClose={handleCancel}
      dimClose
      size="sm"
      closeSkip
      content={(
        <div className="flex items-center flex-col gap-2 -mt-7">
          {/* 발송 성공 체크 애니메이션 */}
          <Lottie animationData={checkLottie} loop autoplay style={{ width: 86, height: 86 }} />
          <div className="text-leading-h2 font-bold text-center mt-1">발송완료</div>
          <div className="whitespace-pre-line text-leading-b2 text-center">{message}</div>
        </div>
      )}
      footer={(
        <>
          <HiButton variant="tertiary" size="lg" onClick={handleCancel}>계속 보내기</HiButton>
          <HiButton variant="primary" size="lg" onClick={handleConfirm}>발송내역</HiButton>
        </>
      )}
    />
  )
}

const checkRequired = ({
  msgType,
  title,
  content,
  senderNumberId,
  sendType,
  filteredTargets,
  requestIsWeblink,
  requestWeblinkFiles
}: {
  msgType: MsgType;
  title: string;
  content: string;
  senderNumberId: string;
  sendType: SendType;
  filteredTargets: SendTargetWithValidation[];
  requestIsWeblink: boolean;
  requestWeblinkFiles: WeblinkFile[];
}) => {
  if (msgType !== MsgType.SMS && isEmpty(title)) {
    throw new SendValidationError(SendValidationCode.EMPTY_TITLE);
  }

  if (isEmpty(content)) {
    throw new SendValidationError(SendValidationCode.EMPTY_CONTENT);
  }

  if (msgType === MsgType.LMS && requestIsWeblink && requestWeblinkFiles.length === 0) {
    throw new SendValidationError(SendValidationCode.EMPTY_WEBLINK_FILES);
  }

  if (isEmpty(senderNumberId)) {
    throw new SendValidationError(SendValidationCode.EMPTY_SENDER_NUMBER);
  }

  if (isEmpty(sendType)) {
    throw new SendValidationError(SendValidationCode.EMPTY_SEND_TYPE);
  }

  if (filteredTargets.length === 0) {
    throw new SendValidationError(SendValidationCode.EMPTY_TARGETS);
  }
};

const checkValid = ({ msgType, title, content, filteredTargets }: {
  msgType: MsgType;
  title?: string;
  content: string;
  filteredTargets: SendTargetWithValidation[];
}) => {
  const hasInvalidPhoneNumber = filteredTargets.some((t) => !t.valid.phoneNumber);
  if (hasInvalidPhoneNumber) {
    throw new SendValidationError(SendValidationCode.INVALID_PHONE_NUMBERS);
  }

  const emojis = extractEmojisFromString(content);
  if (emojis.length > 0) {
    throw new SendValidationError(SendValidationCode.INCLUDES_EMOJI, { emojis });
  }

  if (msgType !== MsgType.SMS && title) {
    const emojis = extractEmojisFromString(title);
    if (emojis.length > 0) {
      throw new SendValidationError(SendValidationCode.INCLUDES_EMOJI, { emojis });
    }
  }

  filteredTargets.forEach((target) => {
    const fieldsToCheck = [
      target.depth1, target.depth2, target.field1, target.field2,
      target.field3, target.field4, target.field5, target.field6,
      target.field7, target.field8, target.contactName
    ];

    const combinedString = fieldsToCheck
      .filter(val => typeof val === 'string')
      .join('');

    const emojis = extractEmojisFromString(combinedString);
    if (emojis.length > 0) {
      throw new SendValidationError(SendValidationCode.INCLUDES_EMOJI, { emojis });
    }
  });

  for (const target of filteredTargets) {
    const replacedMessage = replaceMessage(content, target);
    const byte = getByteLength(replacedMessage);
    if (byte > SEND_MAX_BYTE[msgType]) {
      throw new SendValidationError(SendValidationCode.OVER_BYTE, { msgType, phoneNumber: target.phoneNumber });
    }
  }
};

const checkSendType = async ({ schoolId, sendType, reservedTimestamp }: { schoolId: string; sendType: SendType; reservedTimestamp: number | null }) => {
  const now = await getSendTimestamp(schoolId);
  if (sendType === SendType.RESERVED) {
    if (!reservedTimestamp) {
      throw new SendValidationError(SendValidationCode.INVALID_RESERVED_TIME);
    }

    const nowMinute = moment(now).startOf('minute');
    const reservedMinute = moment(reservedTimestamp).startOf('minute');
    const diff = reservedMinute.diff(nowMinute, 'minutes');

    if (diff < 5) {
      throw new SendValidationError(SendValidationCode.INVALID_RESERVED_TIME);
    }
  }

  const targetTimestamp = sendType === SendType.RESERVED ? reservedTimestamp : now;
  const targetDate = new Date(targetTimestamp);
  const hour = targetDate.getHours();

  if (hour >= 21 || hour < 8) {
    return SendValidationCode.IN_RESTRICTED_TIME;
  }

  return SendStatus.SEND;
};

const checkPoint = ({ point, msgType, filteredTargets }: { point: number; msgType: MsgType; filteredTargets: SendTargetWithValidation[] }) => {
  const deductPoints = (msgType === MsgType.SMS ? 1 : 3) * filteredTargets.length;
  if (point < deductPoints) {
    throw new SendValidationError(SendValidationCode.POINT_LACK);
  }
};

const checkTargets = ({ filteredTargets }: { filteredTargets: SendTargetWithValidation[] }) => {
  if (filteredTargets.length > SEND_MAX_TARGETS) {
    return SendValidationCode.OVER_SEND_LIMIT;
  } else {
    return SendStatus.SEND;
  }
};

const maskPhoneNumber = (phone: string) => {
  if (!phone) return '';
  // 숫자만 추출해서 형식 맞추기
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
  }
  // 포맷이 다른 경우에도 가능한 범위에서 마스킹 시도
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
};

const getConfirmContent = (sendType: SendType, targetLength: number, reservedTimestamp: number) => {
  return sendType === SendType.IMMEDIATE ? (
    <div>
      <span className="text-text-primary-base text-leading-b2 font-bold">총 {targetLength.toLocaleString()}명</span>에게 문자를 발송 하시겠습니까?
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <div><span className="text-text-primary-base text-leading-b1 font-bold">{moment(reservedTimestamp).format('YYYY년 M월 D일(ddd) HH시 mm분')}</span></div>
      <div><span className="text-text-primary-base text-leading-b2 font-bold">총 {targetLength.toLocaleString()}명</span>에게 예약 발송하시겠습니까?</div>
    </div>
  );
}

const hasFieldInContent = (content: string) => {
  const fields = CONTENT_FIELDS.map(CONTENT_FIELD => CONTENT_FIELD.value);
  return fields.some(field => content.includes(field));
};

const deleteUnusedFiles = (unusedFiles: WeblinkFile[]) => {
  unusedFiles.forEach(deleteFile => {
    const params = {
      fileOriginalPath: deleteFile.fileOriginalPath,
      fileThumbnailPath: deleteFile.fileThumbnailPath,
      fileConvertPath: deleteFile.fileConvertPath
    };

    deleteUploadedFile(params).then().catch((err) => console.error(err));
  })
};