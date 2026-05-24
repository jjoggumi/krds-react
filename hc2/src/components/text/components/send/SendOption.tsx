import { HiSelectBox, Card, Icon } from '@/components/uiux';
import Tooltip from '@/components/uiux/tooltip';
import { RadioBoxGroup } from '@/components/uiux/radiobox';
import { DatetimePicker } from '@/components/timetable/components/datetimePicker';
import { useEffect, useRef, useState } from 'react';
import { useTextContext } from '@/components/text/context/TextContext';
import { useSendInfo } from '@/components/text/queries/useSend';
import { SendRequest, SendType } from '@/components/text/types';
import { renderSenderNumber } from '../../utils';
import { showToast } from '@/unimplementeds/toast';
import moment from 'moment';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';

const radioOptions = [
  { label: '즉시', value: SendType.IMMEDIATE },
  { label: '예약', value: SendType.RESERVED },
];

interface SendOptionProps {
  setIsEmptySenderNumbers: (isEmpty: boolean) => void;
  setSenderNumber: (number: Record<string, string>) => void;
  onChangeRequestMessage: (field: keyof SendRequest, value: any) => void;
}

const DEFAULT_SENDER_NUMBERS = { senderNumbers: [] };

export const SendOption = ({ setIsEmptySenderNumbers, setSenderNumber, onChangeRequestMessage }: SendOptionProps) => {
  const { currentSchool } = useTextContext();
  const { handleError } = useApiErrorHandler();
  const { data, isError, error } = useSendInfo(currentSchool.schoolId);
  const { senderNumbers } = data || DEFAULT_SENDER_NUMBERS;

  const [sendType, setSendType] = useState<SendType>(SendType.IMMEDIATE);
  const [reservedTimestamp, setReservedTimestamp] = useState<number | null>(null);
  const [senderNumberId, setSenderNumberId] = useState<string | null>(null);
  const [transValue, setTransValue] = useState<any>(null);

  const calendarRef = useRef(null);

  const calendarStartDate = moment().startOf('day').valueOf();
  const calendarEndDate = moment().startOf('day').add(30, 'days').valueOf();

  useEffect(() => {
    if (isError) {
      handleError(error);
    }
  }, [isError]);

  useEffect(() => {
    setIsEmptySenderNumbers(senderNumbers.length === 0)
  }, [senderNumbers])

  useEffect(() => {
    onChangeRequestMessage('sendType', sendType);
    if (sendType === SendType.IMMEDIATE) {
      setReservedTimestamp(null);
    } else if (sendType === SendType.RESERVED && !reservedTimestamp) {
      setReservedTimestamp(moment().startOf('minute').add(5, 'minutes').valueOf());
    }
  }, [sendType]);

  useEffect(() => {
    onChangeRequestMessage('reservedTimestamp', reservedTimestamp);
  }, [reservedTimestamp]);

  useEffect(() => {
    const senderNumberItem = senderNumbers.find((num) => num.senderNumberId === senderNumberId);
    setSenderNumber({ name: senderNumberItem?.senderNumberName, number: senderNumberItem?.senderNumber });
    onChangeRequestMessage('senderNumberId', senderNumberId);
  }, [senderNumberId]);

  const handleChangeSendType = (sendType: SendType) => {
    setSendType(sendType);
  }

  const handleReservedTimestamp = async (timestamp: number) => {
    const nowMinute = moment().startOf('minute');
    const reservedMinute = moment(timestamp).startOf('minute');
    const diff = reservedMinute.diff(nowMinute, 'minutes');

    if (diff >= 5) {
      setReservedTimestamp(reservedMinute.valueOf());
    } else {
      showToast(`예약 시간은 현재 시간보다 5분 이후로 선택가능합니다.`);
      setReservedTimestamp(nowMinute.add(5, 'minutes').valueOf());
    }
  }

  const handleBeforeSelectDate = (selected) => {
    if (selected > calendarEndDate) {
      showToast(`예약 발송은 최대 30일까지만 선택 가능합니다.`);
      calendarRef.current?.setSelectedTimestamps([moment().valueOf()]);
      return false;
    }
    return true;
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="font-bold text-leading-h4">발송 옵션</span>
      <Card variant="border" className="flex flex-col gap-6" size="lg">
        <div className="flex items-center gap-4">
          <span className="text-leading-b2 font-medium min-w-[130px]">발신번호</span>
          <HiSelectBox
            className="w-full"
            style={{ width: 320 }}
            items={senderNumbers.map(numItem => ({ value: numItem.senderNumberId, title: `${renderSenderNumber(numItem.senderNumber)} (${numItem.senderNumberName})` }))}
            value={senderNumberId}
            emptyTitle={senderNumbers.length === 0 ? '사용 가능한 발신번호가 없습니다.' : '선택해주세요'}
            onChange={setSenderNumberId}
            error={senderNumbers.length === 0}
            disabled={senderNumbers.length === 0}
          />
        </div>

        {/* 문자 2차 범위 :  다국어 번역 옵션 */}
        {/* <div className="flex items-center gap-4">
          <span className="txt-body-b2 font-medium min-w-32.5">다국어 번역 옵션 
          <Tooltip titleHtml={`다국어 번역 옵션 툴팁 설명 내용`} position='center-bottom' className='ml-1' >
            <Icon icon="help-fill" iconSize={16} color="light-gray" className='hover:bg-bg-primary-base' />
          </Tooltip>
          </span>
          <HiSelectBox
            className="w-full"
            style={{ width: 320 }} 
            items={[
              { value: 'origin', title: '원문만' },
              { value: 'translated', title: '번역본만' },
              { value: 'trans', title: '원문+번역본' }
            ]}
            value={transValue} 
            emptyTitle={'선택해주세요'} 
            onChange={(v) => setTransValue(v)} 
          />
        </div> */}

        <div className="flex items-center gap-4">
          <span className="text-leading-b2 font-medium min-w-32.5">발송 방식</span>
          <div className="flex items-center flex-nowrap h-10">
            <RadioBoxGroup
              options={radioOptions}
              value={sendType}
              onChange={handleChangeSendType}
              className="gap-10"
            />

            {sendType === SendType.RESERVED && (
              <div className="ml-2 shrink-0">
                <DatetimePicker
                  timestamp={reservedTimestamp || moment().startOf('minute').add(5, 'minutes').valueOf()}
                  onChange={handleReservedTimestamp}
                  onBeforeSelect={handleBeforeSelectDate}
                  calendar={null}
                  position="top"
                  withTime={true}
                  allowPast={false}
                  disabled={false}
                  operationStartDate={parseInt(moment(calendarStartDate).format('YYYYMMDD'))}
                  operationEndDate={parseInt(moment(calendarEndDate).format('YYYYMMDD'))}
                  style={{ width: 240 }}
                  formatter={(timestamp, withTime) => {
                    if (!timestamp) return '';
                    const d = new Date(timestamp);
                    const pad = (n) => n.toString().padStart(2, '0');
                    const date = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
                    return withTime ? `${date} ${pad(d.getHours())}시 ${pad(d.getMinutes())}분` : date;
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}