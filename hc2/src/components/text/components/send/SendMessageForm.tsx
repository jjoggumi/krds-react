import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type ReactNode } from 'react';

import styles from './SendBody.module.scss';

import { ShowConfirm, CONFIRM_OPTIONS, HiInput, HiButton, HiTab, TextareaWithVar } from '@/components/uiux';
import { showToast } from '@/unimplementeds/toast';
import Tooltip from '@/components/uiux/tooltip';
import Icon from '@/components/uiux/icon';

import { SpecialCharPicker } from '@/components/text/components/send/SpecialCharPicker';
import VariablePicker from '@/components/text/components/send/VariablePicker';
import { motion } from 'framer-motion';

import { MsgType } from '@/components/text/types/send';
import { extractEmojisFromString } from '@/components/text/utils';
import { SEND_MAX_BYTE, SEND_MAX_BYTE_LMS_TITLE } from '@/components/text/constants';
import { getByteCutString, getByteLength } from '../../utils/send';
import { WeblinkCode } from '@/components/text/types';
import { getWeblinkUrl } from '@/components/text/utils/weblink';

const makeTabs = (): { name: string; label: ReactNode }[] => [
  { name: MsgType.SMS, label: 'SMS(단문)' },
  { name: MsgType.LMS, label: 'LMS(장문)' },
];

interface SendMessageFormProps {
  requestContent: string;
  setRequestContent: (content: string) => void;
  requestMsgType: MsgType;
  setRequestMsgType: (msgType: MsgType) => void;
  requestTitle: string;
  setRequestTitle: (title: string) => void;
  requestIsWeblink: boolean;
  generatedWebLink: WeblinkCode | null;
}

export const SendMessageForm = ({
  requestContent,
  setRequestContent,
  requestMsgType,
  setRequestMsgType,
  requestTitle,
  setRequestTitle,
  requestIsWeblink,
  generatedWebLink
}: SendMessageFormProps) => {
  const [message, setMessage] = useState<string>(requestContent);
  const [lmsTitle, setLmsTitle] = useState(requestTitle);
  const [lmsLabelEl, setLmsLabelEl] = useState<HTMLSpanElement | null>(null);
  const [bubblePos, setBubblePos] = useState({ left: 0, top: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const tabs = makeTabs();
  const selectedTabIndex = requestMsgType === MsgType.SMS ? 0 : 1;

  useEffect(() => {
    if (!lmsLabelEl || !wrapperRef.current) return;
    const update = () => {
      if (!wrapperRef.current) return;

      // 텍스트 span 대신 가장 가까운 button 요소(탭 버튼 전체)를 기준으로 삼음
      const buttonEl = (lmsLabelEl.closest && (lmsLabelEl.closest('button') as HTMLElement)) || lmsLabelEl;
      const labelRect = buttonEl.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();

      // 말풍선 실제 높이를 동적으로 읽어 정확히 중앙에 맞춤
      const bubbleHeight = 32;
      setBubblePos({
        left: Math.round(labelRect.right - wrapperRect.left + 8),
        top: Math.round(labelRect.top - wrapperRect.top + labelRect.height / 2 - bubbleHeight / 2),
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [lmsLabelEl]);

  useEffect(() => {
    setRequestContent(message);
  }, [message]);

  useEffect(() => {
    setRequestTitle(lmsTitle);
  }, [lmsTitle]);

  useEffect(() => {
    if (requestMsgType === MsgType.LMS && requestIsWeblink === true) {
      const cutMessage = getByteCutString(message, SEND_MAX_BYTE.LMS_WEB_LINK);
      if (cutMessage !== message) {
        setMessage(cutMessage);
      }
    }
  }, [requestIsWeblink]);

  const handleChangeTab = async (index: number) => {
    const selectTab = index === 0 ? MsgType.SMS : MsgType.LMS;

    // LMS/LMS_WEB_LINK -> SMS 전환 시 길이 체크
    if (selectTab === MsgType.SMS && requestMsgType !== MsgType.SMS) {
      const byteCount = getByteLength(message)

      if (byteCount <= SEND_MAX_BYTE.SMS) {
        setRequestMsgType(selectTab);
        return;
      }

      const confirmSwitch = await ShowConfirm(`${MsgType.SMS}로 전환 시 ${SEND_MAX_BYTE.SMS}byte를 초과한 내용은 삭제됩니다. 변경하시겠습니까?`, {
        ...CONFIRM_OPTIONS.TEXT,
      });
      if (!confirmSwitch) return;

      let truncatedMessage = message;

      while (getByteLength(truncatedMessage) > SEND_MAX_BYTE.SMS) {
        truncatedMessage = truncatedMessage.slice(0, -1);
      }
      setMessage(truncatedMessage);
      setRequestMsgType(selectTab);
      return;
    }

    // 기본 탭 전환 (SMS -> LMS/LMS_WEB_LINK 포함)
    if (selectTab === MsgType.LMS && requestMsgType === MsgType.SMS) {
      setRequestMsgType(MsgType.LMS);
      return;
    }
    setRequestMsgType(selectTab);
  };

  const handleChangeMessageContent = (text: string) => {
    setMessage(text);
  };

  const handleChangeLmsTitle = async (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = getByteCutString(e.target.value, SEND_MAX_BYTE_LMS_TITLE)
    setLmsTitle(e.target.value);
  };

  const handleBlurLmsTitle = async(e: FocusEvent<HTMLInputElement>) => {
    const emojis = extractEmojisFromString(e.target.value);
    if (emojis.length === 0) {
      setLmsTitle(e.target.value);
      return;
    }
    await ShowConfirm(`지원하지 않는 문자가 포함되어 있습니다.\n[${emojis.join(', ')}]`, {
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '확인',
      hideCancel: true,
    });
  }

  return (
    <div ref={wrapperRef} className="relative">
      {lmsLabelEl && (
        <motion.div
          className="flex items-center pointer-events-none absolute -ml-1"
          style={{ left: bubblePos.left, top: bubblePos.top, zIndex: 9999 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: 1,
            x: [-5, 5, -5, 5, -5, 0],
            transition: {
              x: { repeat: 0, duration: 1.8, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
              opacity: { duration: 0.2 },
            },
          }}
        >
          <div style={{
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '8px solid #936EEB',
            marginRight: '-3px',
          }} />
          <div
            className="rounded-full h-8 px-4 py-1.5 text-leading-d1 font-semibold text-text-base whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #936EEB 0%, #C07CE8 100%)' }}
          >
            이미지와 문서를 전송하실 수 있어요 !
          </div>
        </motion.div>
      )}
      <HiTab
        size="xl"
        contentAnimation="fade"
        contentAnimationDuration={0.2}
        className={styles.textTabs}
        labels={tabs.map((t, i) => i === 1
          ? <span key="lms" ref={el => { if (el && !lmsLabelEl) setLmsLabelEl(el); }}>{t.label}</span>
          : t.label
        )}
        variant="underline"
        isControlOuter={true}
        selectedTabIndex={selectedTabIndex}
        onChange={handleChangeTab}
      >
        <div>
          <ContentForm
            message={message}
            onChangeMessageContent={handleChangeMessageContent}
            maxBytes={SEND_MAX_BYTE.SMS}
            requestIsWeblink={requestIsWeblink}
            textHeight={190}
          />
        </div>
        <div className="flex flex-col gap-2">
          <HiInput
            value={lmsTitle}
            onChange={handleChangeLmsTitle}
            onBlur={handleBlurLmsTitle}
            placeholder="제목을 입력하세요."
            wrapClass="w-full"
            className="!rounded-[var(--ctl-xl-r)]"
            size="lg"
          />
          <ContentForm
            message={message}
            onChangeMessageContent={handleChangeMessageContent}
            maxBytes={SEND_MAX_BYTE[requestIsWeblink ? MsgType.LMS_WEB_LINK : MsgType.LMS]}
            generatedWebLink={generatedWebLink}
            requestIsWeblink={requestIsWeblink}
            textHeight={97.5}
          />
        </div>
      </HiTab>
    </div>
  );
};

interface ContentFormProps {
  onChangeMessageContent: (text: string) => void;
  message: string;
  maxBytes: number;
  textHeight: number;
  generatedWebLink?: WeblinkCode | null;
  requestIsWeblink: boolean;
}

const ContentForm = ({ onChangeMessageContent, message, maxBytes, textHeight, generatedWebLink, requestIsWeblink }: ContentFormProps) => {
  // 특수문자 팝업 상태 및 버튼
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [showVarPicker, setShowVarPicker] = useState(false);
  const charBtnRef = useRef(null);
  const varBtnRef = useRef(null);
  const textAreaWrapperRef = useRef(null);

  const handleChangeTextarea = (text: string) => {
    onChangeMessageContent(text);
  };

  const handleBlurTextarea = async () => {
    const emojis = extractEmojisFromString(message);
    if (emojis.length === 0) return;

    await ShowConfirm(`지원하지 않는 문자가 포함되어 있습니다.\n[${emojis.join(', ')}]`, {
      ...CONFIRM_OPTIONS.TEXT,
      confirmLabel: '확인',
      hideCancel: true,
    });
  };

  const handleClickReset = () => {
    onChangeMessageContent('');
  }

  // 선택한 특수문자를 현재 textarea의 caret 위치에 삽입하고 caret 복원
  const insertChar = (val: string) => {
    const wrapper = textAreaWrapperRef.current as HTMLElement | null;
    const selector = 'textarea, input[type="text"], [contenteditable="true"]';
    const ta = wrapper?.querySelector && (wrapper.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement | HTMLElement | null);
    if (ta) {
      const start = ('selectionStart' in ta ? (ta as any).selectionStart : (ta.textContent || '').length) as number;
      const end = ('selectionEnd' in ta ? (ta as any).selectionEnd : start) as number;
      const text = 'value' in ta ? (ta as any).value : ta.textContent || '';
      const newVal = text.substring(0, start) + val + text.substring(end);

      if(getByteLength(newVal) > maxBytes) {
        showToast(`메시지 길이를 초과하여 더 이상 작성하실 수 없습니다.`, 2000)
      } else {
        onChangeMessageContent(newVal);
        let tries = 0;
      const restore = () => {
        tries += 1;
        const cur = wrapper?.querySelector && (wrapper.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement | HTMLElement | null);
        if (cur) {
          const pos = start + val.length;
          try {
            if ('selectionStart' in cur) {
              (cur as any).selectionStart = (cur as any).selectionEnd = pos;
            } else if ((cur as HTMLElement).isContentEditable) {
              const range = document.createRange();
              const sel = window.getSelection();
              range.setStart(cur.childNodes.length ? cur.childNodes[0] : cur, pos);
              range.collapse(true);
              sel && sel.removeAllRanges();
              sel && sel.addRange(range);
            }
            try {
              (cur as HTMLElement).focus({ preventScroll: true } as any);
            } catch (e) {
              (cur as HTMLElement).focus();
            }
            return;
          } catch (err) {
            // 실패 시 다음 프레임에 재시도
          }
        }
        if (tries < 6) requestAnimationFrame(restore);
      };
      requestAnimationFrame(restore);
      }
    } else {
      const newMessageContent = message + val;
      onChangeMessageContent(newMessageContent);
    }
    setShowCharPicker(false);
  };

  return (
    <div className="flex items-stretch gap-4">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div ref={textAreaWrapperRef}>
          <TextareaWithVar
            {...({ inputStyle: { minHeight: `${textHeight}px`, maxHeight: `287px`, paddingBottom: 0 } } as any)}
            value={message}
            encoder={'euc-kr'}
            onChange={handleChangeTextarea}
            onBlur={handleBlurTextarea}
            showByte
            maxBytes={maxBytes}
            resizable={false}
            showEtc
            etc={
            <>
              {generatedWebLink !== undefined && (
                  <motion.div
                  key="weblink-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: (requestIsWeblink && generatedWebLink?.code) ? 1 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: 'opacity' }}
                  aria-hidden={!(requestIsWeblink && generatedWebLink?.code)}
                >
                  <div className='text-text-neutral-stronger mb-4 flex gap-2 items-center' style={{ visibility: (requestIsWeblink && generatedWebLink?.code) ? 'visible' : 'hidden' }}>
                    <span className="text-leading-b2 text-text-default">
                      {requestIsWeblink && generatedWebLink?.code ? getWeblinkUrl(generatedWebLink) : '\u00A0'}
                    </span>
                    <span className="text-d3 bg-bg-secondary-subtler rounded-sm p-1.5 font-medium flex items-center">웹 링크 자동생성</span>
                  </div>
                </motion.div>
              )}
            </>
            }
            showAction
            action={
              <>
                <div className={styles.actionStack}>
                  <span ref={charBtnRef}>
                    <HiButton variant="tertiary" size="xs" className="focus:bg-[#3D4655]! focus:border-[#3D4655]! focus:text-text-base hover:bg-[#3D4655]! hover:border-[#3D4655]! hover:text-text-base" onClick={() => setShowCharPicker((s) => !s)}>
                      특수 문자
                    </HiButton>
                  </span>
                  <span ref={varBtnRef}>
                    <HiButton
                      variant="tertiary"
                      className="!gap-0.5 focus:bg-[#3D4655]! focus:border-[#3D4655]! focus:text-text-base hover:bg-[#3D4655]! hover:border-[#3D4655]! hover:text-text-base"
                      size="xs"
                      onClick={() => setShowVarPicker((s) => !s)}
                    >
                      변수 추가
                      <Tooltip titleHtml="수신자마다  다른 내용(이름, 점수 등)을 넣어 메시지를 보낼 수 있습니다." position='top' tooltipClassName='z-1' size="sm">
                        <Icon icon="help-fill" iconSize={16} color="light-gray" className='bg-gray09 hover:bg-bg-primary-base' />
                      </Tooltip>
                    </HiButton>
                  </span>
                  {/*<HiButton variant="tertiary" size="xs">*/}
                  {/*  템플릿*/}
                  {/*</HiButton>*/}
                  {/*<HiButton variant="tertiary" size="xs">*/}
                  {/*  최근 발송*/}
                  {/*</HiButton>*/}
                  <HiButton variant="tertiaryBlue" size="xs" onClick={handleClickReset}>
                    초기화
                  </HiButton>
                </div>
              </>
            }
            placeholder={'학교 소식을 입력하세요.'}
            onMaxError={(max) => showToast(`메시지 길이를 초과하여 더 이상 작성하실 수 없습니다.`, 2000)}
          />
        </div>
        <SpecialCharPicker anchorRef={charBtnRef} show={showCharPicker} onClose={() => setShowCharPicker(false)} onInsert={insertChar} />
        <VariablePicker
          anchorRef={varBtnRef}
          show={showVarPicker}
          onClose={() => setShowVarPicker(false)}
          onInsert={(val) => {
            insertChar(val);
            setShowVarPicker(false);
          }}
        />
      </div>
    </div>
  );
};
