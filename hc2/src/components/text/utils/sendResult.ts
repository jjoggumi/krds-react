import moment from "moment";
import { SendResultType } from "../types";


export const renderSenderNumber = (value: string) => {
   if(value) {
      if(value.length === 8) {
         return value.replace(/(\d{4})(\d{4})/, '$1-$2');
      }
      else if (value.length === 9) {
         // 서울 지역번호(02) + 중간 3자리 + 끝 4자리 (예: 02-123-4567)
         return value.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
      } 
      else if (value.length === 10) {
         if (value.startsWith('02')) {
         // 서울 지역번호(02) + 중간 4자리 + 끝 4자리 (예: 02-1234-5678)
         return value.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
         } else {
         // 경기, 강원 등 3자리 지역번호 + 중간 3자리 + 끝 4자리 (예: 031-123-4567)
         return value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
         }
      } 
      else if (value.length === 11) {
         // 휴대폰 또는 3자리 지역번호 + 중간 4자리 + 끝 4자리 (예: 010-1234-5678)
         return value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      } else {
         return value.replace(/(\d{2,3})(\d{3,4})(\d{4}$)/, '$1-$2-$3');
      }
   } else {
      return '';
   }
 };

export const renderTimestamp = (value: number) => {
   if(value) {
      return moment(value).format('YYYY.MM.DD HH:mm:ss');
   } else {
      return '';
   }
};

export const renderCountValue = (value: number) => {
   return `${(value).toLocaleString()}건`;
 };

export const renderReceipientInfo = (value: SendResultType) => {
   const contact = value.contactType.toLowerCase();
   let contactString = ''
   if(contact === 'parent1') {
      contactString = ' (학부모1)'
   } else if(contact === 'parent2') {
      contactString = ' (학부모2)'
   }
   if(value.depth1 && value.depth2) {
      return `${value.depth1} ${value.depth2} ${value.name}${contactString}`
   } else {
      return `${value.name}${contactString}`
   }
};