import { MsgType, SendTarget, SendTargetType, SendValidationCode } from '@/components/text/types';

export const SEND_TARGET_TYPE_NAME: Record<SendTargetType, string> = {
  [SendTargetType.STUDENT]: '학생',
  [SendTargetType.PARENTS_1]: '학부모1',
  [SendTargetType.PARENTS_2]: '학부모2',
};

type SendTargetTableHeaderKey = keyof Omit<SendTarget, 'contactId'>;
export const SEND_TARGET_FIELD_NAME: Record<SendTargetTableHeaderKey, string> = {
  depth1: '[*대분류*]',
  depth2: '[*소분류*]',
  sendTargetType: '유형',
  phoneNumber: '휴대폰번호',
  contactName: '[*이름*]',
  field1: '[*1*]',
  field2: '[*2*]',
  field3: '[*3*]',
  field4: '[*4*]',
  field5: '[*5*]',
  field6: '[*6*]',
  field7: '[*7*]',
  field8: '[*8*]',
}

export const CONTENT_FIELDS = [
  { label: '이름', value: '[*이름*]', fieldKey: 'depth1' },
  { label: '대분류', value: '[*대분류*]', fieldKey: 'depth2'},
  { label: '소분류', value: '[*소분류*]', fieldKey: 'contactName'},
  { label: '1', value: '[*1*]', fieldKey: 'field1'},
  { label: '2', value: '[*2*]', fieldKey: 'field2'},
  { label: '3', value: '[*3*]', fieldKey: 'field3'},
  { label: '4', value: '[*4*]', fieldKey: 'field4'},
  { label: '5', value: '[*5*]', fieldKey: 'field5'},
  { label: '6', value: '[*6*]', fieldKey: 'field6'},
  { label: '7', value: '[*7*]', fieldKey: 'field7'},
  { label: '8', value: '[*8*]', fieldKey: 'field8'}
]

export const SEND_MAX_BYTE: Record<MsgType, number> = {
  [MsgType.SMS]: 90,
  [MsgType.LMS]: 2000,
  [MsgType.LMS_WEB_LINK]: 1900
}

export const SEND_MAX_BYTE_LMS_TITLE = 40;

export const SEND_VALIDATION_MESSAGE: Record<SendValidationCode, { message: string, showType: 'ALERT' | 'TOAST' }> = {
  [SendValidationCode.EMPTY_TITLE]: { message: '제목을 입력해주세요.', showType: 'TOAST' },
  [SendValidationCode.EMPTY_CONTENT]: { message: '내용을 입력해주세요.', showType: 'TOAST' },
  [SendValidationCode.EMPTY_SENDER_NUMBER]: { message: '발신번호를 선택해주세요.', showType: 'TOAST' },
  [SendValidationCode.EMPTY_SEND_TYPE]: { message: '발송 방식(즉시, 예약)을 선택해주세요.', showType: 'TOAST' },
  [SendValidationCode.EMPTY_TARGETS]: { message: '수신자는 최소 1명 이상 입력해주세요.', showType: 'TOAST' },
  [SendValidationCode.INVALID_PHONE_NUMBERS]: { message: '휴대폰번호를 입력해주세요.', showType: 'TOAST' },
  [SendValidationCode.INCLUDES_EMOJI]: { message: '지원하지 않는 이모지가 포함되어 있습니다.', showType: 'ALERT' },
  [SendValidationCode.OVER_BYTE]: { message: '변수 포함 메시지 길이를 초과했습니다\n메시지를 수정해주세요.', showType: 'ALERT' },
  [SendValidationCode.INVALID_RESERVED_TIME]: { message: '예약 시간은 현재 시간 5분 이후로 설정해주세요.', showType: 'TOAST' },
  [SendValidationCode.IN_RESTRICTED_TIME]: { message: '발송 제한 시간대(21시~08시)에는 문자 발송이 불가 합니다.', showType: 'ALERT' },
  [SendValidationCode.POINT_LACK]: { message: '잔여 포인트가 부족합니다.', showType: 'ALERT' },
  [SendValidationCode.OVER_SEND_LIMIT]: { message: '500건을 초과하여 발송할 경우,\n대량 문자로 분류되어 사유 입력이 필요합니다.\n진행하시겠습니까?', showType: 'ALERT' },
  [SendValidationCode.EMPTY_WEBLINK_FILES]: { message: '이미지 또는 문서를 등록해주세요.', showType: 'TOAST' },
}

export const SEND_GRAPHIC_CHARS = new Set([
  '♥', '♡', '★', '☆', '▶', '▷', '◀', '◁', '∩', '●', '■',
  '○', '□', '▲', '▼', '░', '♨', '◈', '™', '℡', '♬', '♪', '☞',
  '☜', '♂', '♀', '㈜', '⊙', '◆', '◇', '♣', '♧', '☎', 'Σ',
  '▣', '㉿', '『', '』', '◐', '◑', '▦',
])

export const SEND_TARGET_FIELD_LIMITS: Partial<Record<string, number>> = {
  depth1: 10,
  depth2: 10,
  contactName: 20,
  field: 50,
};

export const SEND_VERSION_2 = false;
export const SEND_MAX_TARGETS = 500

export const SESSION_STORAGE_KEY_LAST_MESSAGE_ID = "latest_message_id"
export const SESSION_STORAGE_KEY_LAST_SEND_TYPE = "latest_send_type"