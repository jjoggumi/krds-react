import { Contact, ContactValidation, ContactWithValidation } from '@/components/text/types';

import { isEmpty, isErrorPhoneNumber } from '@/utils/validate';
import { v4 as uuidv4 } from 'uuid';
import { phoneNumberFields } from '@/components/text/constants';

export const generateContactWithValidation = ({
  depth1GroupName,
  depth2GroupName,
}: {
  depth1GroupName: string | null;
  depth2GroupName: string | null;
}): ContactWithValidation => {
  return {
    tempId: uuidv4(),
    contactId: null,
    depth1GroupName: depth1GroupName,
    depth2GroupName: depth2GroupName,
    contactName: '',
    studentNumber: null,
    phoneNumber: '',
    phoneNumberParent1: '',
    phoneNumberParent2: '',
    valid: {
      depth1GroupName: !!depth1GroupName,
      depth2GroupName: !!depth2GroupName,
      contactName: false,
      studentNumber: true,
      phoneNumber: false,
      phoneNumberParent1: false,
      phoneNumberParent2: false,
    },
  };
};

export const isEmptyRow = (row: Contact | ContactWithValidation, ignoreFields: string[] = []) => {
  const validFields = [
    'depth1GroupName',
    'depth2GroupName',
    'studentNumber',
    'contactName',
    'phoneNumber',
    'phoneNumberParent1',
    'phoneNumberParent2'
  ];

  const filteredFields = validFields.filter(field => !ignoreFields.includes(field));
  return filteredFields.every(field => isEmpty(row[field]));
}

export const getContactsIds = (contacts: Contact[]) => {
  const contactIds = contacts.filter(c => c.contactId && !isEmpty(c.phoneNumber)).map(c => c.contactId);
  const contactParent1Ids = contacts.filter(c => c.contactParent1Id && !isEmpty(c.phoneNumberParent1)).map(c => c.contactParent1Id);
  const contactParent2Ids = contacts.filter(c => c.contactParent2Id && !isEmpty(c.phoneNumberParent2)).map(c => c.contactParent2Id);
  const allContactIds = [...contactIds, ...contactParent1Ids, ...contactParent2Ids];

  return {
    contactIds,
    contactParent1Ids,
    contactParent2Ids,
    allContactIds
  }
}

export const getContactInputErrorMessages = (isError: boolean, fieldKey: string, inputValue: string | null ) => {
  if (!isError) return '';
  if (fieldKey === 'depth1GroupName') return '대분류 항목을 입력하세요.';
  if (fieldKey === 'depth2GroupName') return '소분류 항목을 입력하세요.';
  if (fieldKey === 'contactName') return '이름을 입력하세요.';
  if (phoneNumberFields.includes(fieldKey)) {
    const valStr = String(inputValue || '');
    if (valStr.length === 0) return '휴대폰 번호를 입력해주세요.';
    if (isErrorPhoneNumber(valStr)) return '하이픈(-) 없이 숫자 10-11자리를 입력해주세요.';
    return '';
  }
  return '';
}

export const getContactValidation = (contact: Contact | ContactWithValidation, requiredFields: string[], validation?: ContactValidation) => {
  if (!validation) {
    validation = {
      depth1GroupName: false,
      depth2GroupName: false,
      contactName: false,
      studentNumber: false,
      phoneNumber: false,
      phoneNumberParent1: false,
      phoneNumberParent2: false
    }
  }

  for (const fieldName of Object.keys(contact)) {
    if (fieldName === 'valid') continue;

    if (phoneNumberFields.includes(fieldName)) {
      const phoneNumbers = phoneNumberFields.map(field => contact[field]);

      if (phoneNumbers.every(phone => isEmpty(phone))) {
        validation.phoneNumber = false;
        validation.phoneNumberParent1 = false;
        validation.phoneNumberParent2 = false;
      } else {
        validation.phoneNumber = isEmpty(contact.phoneNumber) ? true : !isErrorPhoneNumber(contact.phoneNumber);
        validation.phoneNumberParent1 = isEmpty(contact.phoneNumberParent1) ? true : !isErrorPhoneNumber(contact.phoneNumberParent1);
        validation.phoneNumberParent2 = isEmpty(contact.phoneNumberParent2) ? true : !isErrorPhoneNumber(contact.phoneNumberParent2);
      }

      continue;
    }

    validation[fieldName] = requiredFields.includes(fieldName) ? !isEmpty(contact[fieldName]) : true;
  }

  return validation;
}

export const generatePasswordEncryptedExcelBlob = async (excelBuffer: ArrayBuffer, password: string) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/workers/excelDownloaderWorker.js');

    worker.onmessage = function (event) {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
    };

    worker.onerror = function (error) {
        reject(error);
    };

    worker.postMessage({excelBuffer, password});
  });
}
