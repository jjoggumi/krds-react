"use strict";

/**
 * 정규식
 */
export const regex = {
  // (허용) 숫자, 영문소문자
  includeNumberOrAlphaLowerCase: /[\da-z]*/g,
  // (제외) 숫자, 영문소문자
  excludeNotNumberAndAlphaLowerCase: /[^\da-z]*/g,

  // (허용) 숫자, 영문, 한글
  includeNumberOrAlphaOrKorean: /[\dA-Za-zㄱ-ㅎㅏ-ㅣ가-힣]*/g,
  // (제외) 숫자, 영문, 한글
  excludeNotNumberAndAlphaAndKorean: /[^\dA-Za-zㄱ-ㅎㅏ-ㅣ가-힣]*/g,

  // (허용) 숫자, 영문, 공백(blank), 한글
  includeNumberOrAlphaOrBlankOrKorean: /[\dA-Za-z\sㄱ-ㅎㅏ-ㅣ가-힣]*/g,
  // (제외) 숫자, 영문, 공백(blank), 한글
  excludeNotNumberAndAlphaAndBlankAndKorean: /[^\dA-Za-z\sㄱ-ㅎㅏ-ㅣ가-힣]*/g,
}

export const validation = {
  isRegNumber(value) {
    return /^[0-9]*$/.test(value)
  },
  isRegAlphaByLowerCase(value) {
    return /^[a-z]*$/.test(value)
  },
  isRegAlphaByUpperCase(value) {
    return /^[A-Z]*$/.test(value)
  },
  isRegSpecialCharacters(value) {
    // [~`!@#$%\^&*()-+=]
    return /"~","!","@","#","$","%","^","&","*","(",")","-","_","=","+","<",">","?"/.test(value);
  },
  isRegPassword(value) {
    // [~`!@#$%\^&*()-+=]
    return /^(?=.*[a-zA-Z])((?=.*\d)|(?=.*\W)).{5,12}$/.test(value)
  },
  isRegNumberWithoutZero(value) {
    return /^[1-9]*$/.test(value)
  },
  isRegNumberAlpha(value) {
    return /^[A-Za-z0-9]*$/.test(value)
  },
  isRegNumberAlphaByLowerCase(value) {
    return /^[a-z0-9]*$/.test(value)
  },
  // 숫자 0~99까지
  isRegNumberPattern1(value) {
    return /\b([0-9]|[1-9][0-9])\b/.test(value)
  },
  isRegMobilePhoneNumberWithoutHyphen(value) {
    return /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})?[0-9]{3,4}?[0-9]{4}$/.test(value)
  },
  isRegMobilePhoneNumberWithHyphen(value) {
    return /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/.test(value)
  },
  isRegNamePattern1(value) {
    return /^[A-Za-zㄱ-ㅎㅏ-ㅣ가-힣]*$/.test(value)
  },
  isRegNamePattern2(value) {
    return /^[A-Za-zㄱ-ㅎㅏ-ㅣ가-힣]{2,20}$/.test(value)
  },
  // 한글, 영대, 영소, 숫자, 공백 \s
  isRegNamePattern3(value) {
    return /^[A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]*$/.test(value)
  },
  // 한글, 영대, 영소, 숫자
  isRegNamePattern4(value) {
    return /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]*$/.test(value)
  },
  isRegNamePattern5(value) {
    return /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{2,20}$/.test(value)
  },
  // 한글, 영대, 영소, 숫자, 콤마
  isRegNamePattern6(value) {
    return /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣,]*$/.test(value)
  },
};
