import { Contact } from '@/components/text/types/contact';

type ContactLabelKeys = keyof Omit<Contact, 'contactId' | 'contactParent1Id' | 'contactParent2Id' | 'depth2GroupId'>;

export const CONTACT_LABELS: Record<ContactLabelKeys, string> = {
  depth1GroupName: '대분류',
  depth2GroupName: '소분류',
  studentNumber: '번호',
  contactName: '이름',
  phoneNumber: '휴대폰번호',
  phoneNumberParent1: '학부모1 휴대폰번호',
  phoneNumberParent2: '학부모2 휴대폰번호',
};

export const CONTACT_LIMITS: Partial<Record<keyof Contact, number>> = {
  depth1GroupName: 10,
  depth2GroupName: 10,
  studentNumber: 3,
  contactName: 20,
  phoneNumber: 11,
  phoneNumberParent1: 11,
  phoneNumberParent2: 11,
};

export const parentPhoneNumberFields = ['phoneNumberParent1', 'phoneNumberParent2'];
export const phoneNumberFields = ['phoneNumber', 'phoneNumberParent1', 'phoneNumberParent2'];