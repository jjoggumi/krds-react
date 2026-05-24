import CONSTANTS from './constants';
import moment from '@/plugins/moment.js'
import qs from "qs";
import store from "./vuex/store";
import { isHeic, heicTo } from "heic-to"
import {revokeObjectURL} from "blob-util";

export function getByteLen(text) {
  let val = (text || '').replace(/(<([^>]+)>)/ig,"").trim()
  let l = 0
  for (var i = 0; i < val.length; i++) {
    l += (val.charCodeAt(i) > 128) ? 2 : 1    
  }
  return l
}

export function getByteLength(s, b, i, c) {
  for (
    b = i = 0;
    (c = s.charCodeAt(i++));
    b += c >> 11 ? 3 : c >> 7 ? 2 : 1
  );
  return b
}

// EMOJI codePonts (ex: &#128512;) Replace
export function getEmojiCodePointsReplace(str) {
  const unified_emoji_ranges = [
    '[\uE000-\uF8FF]',
    '[\u2694-\u2697]',
    '[\u2700-\u27BF]',
    '\uD83C[\uDC00-\uDFFF]',
    '\uD83D[\uDC00-\uDFFF]',
    '\uD83E[\uDD10-\uDFFF]'
  ]

  /**
   * new RegExp(regex_string, flags)
   * flags: g (global match, return all matches)
   *
   * regexpEmojiPresentations => /\p{Emoji_Presentation}/gu
   *
   * @type {RegExp}
   */
  // TODO: ie 정규식 제한으로 u 옵션 삭제
  const unifiedEmojiRegex = new RegExp(unified_emoji_ranges.join('|'))
  let matchArray = null

  while ((matchArray = unifiedEmojiRegex.exec(str)) != null) {
    str = str.replace(matchArray[0], '&#' + matchArray[0].codePointAt(0)+';')
  }

  // strong tags to b tags: APP 에디터 호환 처리
  str = str.replace(new RegExp('<strong>', 'g'), '<b>')
          .replace(new RegExp('</strong>', 'g'), '</b>')

  // const regexpEmojiPresentation = new RegExp('\\p{Emoji_Presentation}', 'u')
  // let matchRegexpEmojiPresentationCount = 0

  // while ((matchArray = regexpEmojiPresentation.exec(str)) != null) {
  //   str = str.replace(matchArray[0], '&#' + matchArray[0].codePointAt(0)+';')
  //   matchRegexpEmojiPresentationCount++
  // }
  // console.log(`matchRegexpEmojiPresentationCount => `, matchRegexpEmojiPresentationCount)

  // TODO: 한글을 html code 로 변경하는 문제로 비활성화
  // const ua = navigator.userAgent
  // /* MSIE used to detect old browsers and Trident used to newer ones*/
  // const is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1
  //
  // if (!is_ie) {
  //   str = replace4ByteUnicodeCharacters(str)
  // }

  return str 
}

export function replaceStrongToBTag(str) {
  str = str.replace(new RegExp('<strong>', 'g'), '<b>')
    .replace(/<strong[ \t\n]+([^>]*)>/g, '<b $1>')
    .replace(new RegExp('</strong>', 'g'), '</b>')

  return str
}

export function getUrlParams() {
  let params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
  return params;
}

/**
 * how-to-match-all-4byte-utf-8-characters-in-javascript
 * https://stackoverflow.com/questions/40259460/how-to-match-all-4byte-utf-8-characters-in-javascript
 * @param str
 * @return {*}
 */
export function replace4ByteUnicodeCharacters(str) {
  const reg = new RegExp('[\u{10000}-\u{10FFFF}]', 'u')
  let matchArray = null

  while ((matchArray = reg.exec(str)) != null) {
    str = str.replace(matchArray[0], '&#' + matchArray[0].codePointAt(0)+';')
  }

  return str
}

/**
 * 학년 반환
 */

export function getAfterSchoolTargets(item) {
  const SCHOOL_TYPE = CONSTANTS.SCHOOL_TYPE
  const SCHOOL_TYPE_NAME = CONSTANTS.SCHOOL_TYPE_NAME

  let prefix = item[0]
    ? SCHOOL_TYPE_NAME[item[0].schoolType] + ' '
    : ''
  let rtnText = ''
  const gradeTextArr = []

  item.forEach(t => {
    switch (t.schoolType) {
      case SCHOOL_TYPE.ELEMENTARY:
      case SCHOOL_TYPE.MIDDLE:
      case SCHOOL_TYPE.HIGH:
      case SCHOOL_TYPE.UNIVERSITY:
      case SCHOOL_TYPE.SPECIAL: {
        const gradeNumber = t.classGrade.substring(1, t.classGrade.length)
        gradeTextArr.push(`${gradeNumber}학년`)
        break
      }
      /**
       * case this.CONSTANTS.SCHOOL_TYPE.KINDERGARTEN:
       * case this.CONSTANTS.SCHOOL_TYPE.NONE:
       */
      default:
    }
  })

  if (gradeTextArr.length > 0) {
    rtnText = gradeTextArr.join(', ')
  }

  return prefix + rtnText
}

/**
 * 방과후 학습신청(학습 스케쥴 html 로 반환)
 */


export function getAfterSchoolTimetables(items) {
  const dayOfWeekTitle = {
    1: '월',
    2: '화',
    3: '수',
    4: '목',
    5: '금',
    6: '토',
    7: '일'
  }
  let rtnHtml = ''
  const timeTableObj = {}
  items.forEach(t => {
    const timeStr = `${t['timeStart']} ~ ${t['timeEnd']}`
    const timeTitle = dayOfWeekTitle[t.dayOfWeek]

    if (Array.isArray(timeTableObj[timeStr])) {
      timeTableObj[timeStr].push(timeTitle)
    } else {
      timeTableObj[timeStr] = [timeTitle]
    }
  })
  Object.entries(timeTableObj).forEach(([key, value]) => {
    rtnHtml += `<span>${value.join(', ')} ${key}</span>`
  })
  return rtnHtml || `<span></span>`
}


/**
 * 설문 통계 공통
 */
export function getRespondentNameWithUserType(respondentName, userType) {
  switch (userType) {
    case CONSTANTS.USER_TYPE.TEACHER:
      return `${respondentName} 선생님`
    case CONSTANTS.USER_TYPE.PARENTS:
      return `${respondentName} 학부모`
    case CONSTANTS.USER_TYPE.STUDENT:
      return `${respondentName} 학생`
    case 'NONMEMBER':
      return respondentName
    case 'WITHDRAWAL':
      return '탈퇴회원'
    default:
      return respondentName
  }
}

export function replaceMobile(userMobile) {
  return userMobile ? userMobile.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`) : '-'
}

export function timestampToDateTime(timestamp) {
  return timestamp ? moment(timestamp).format('YY.MM.DD HH:mm:ss') : '-'
}

/**
 * 공백이 포함된 날짜를 특정 포맷으로 변환
 * @param datesWithBlankStrings
 * @param format
 * @returns {*}
 */
export function replaceDatesWithBlankStringsByFormat(datesWithBlankStrings, format) {
  if (datesWithBlankStrings && datesWithBlankStrings.includes(' ')) {
    const newDateStringArr = []
    datesWithBlankStrings.split(' ').forEach(value => {
      newDateStringArr.push(value.substring(0, value.length -1))
    })
    return moment(newDateStringArr.join('-')).format(format)
  } else {
    return datesWithBlankStrings
  }
}

export function getClassGrade(classGrade) {
  return !classGrade || classGrade.trim() === ''
  || classGrade === 'NONE' ? '' : `${classGrade.slice(-1)}학년`
}

export function getClassGradeBan(classGrade, classBan) {
  if (classGrade === 'NONE') {
    return classBan
  } else {
    return classBan ?
      `${getClassGrade(classGrade)} ${classBan}` :
      (classGrade ? getClassGrade(classGrade) : '')
  }
}

export function getConsultType(consultType) {
  switch (consultType) {
    case 'PHONE':
      return '전화'
    case 'VISIT':
      return '방문'
    case 'REMOTE':
      return '원격'
    default:
      return ''
  }
}

/**
 * 방과후 학습신청(버튼타입)
 */

export function getButtonType(item) {
  if (item.isCanceled) {
    //1.폐강여부 체크(폐강)
    return 'closed'
  } else if (item.waitStatus) {
    //2.현재신청상태 체크
    if (item.waitStatus === 'COMPLETE') {
      //2-1 COMPLETE(신청취소)
      return 'cancel'
    } else {
      //2-2 WAIT(대기자 신청취소)
      return 'waitCancel'
    }
  } else {
    if (item.selectionType === 'FCFS') {
      //3.선착순
      if (item.isLimitedWait) {
        //3-1.대기자 사용여부체크
        if (item.limit.totalMax <= item.limit.totalCount) {
          //3-2.정원과 신청자수 체크
          return item.limit.waitMax > item.limit.waitCount ? 'submitWait' : 'submitEnd'
          //3-3.대기정원과 대기신청자수 체크(대기자 신청, 신청마감)
        }
      } else {
        if (item.limit.totalMax <= item.limit.totalCount) {
          //4.대기자 사용 false 일때 정원과 신청자수 체크(신청마감)
          return 'submitEnd'
        }
      }
    }
  }

  //5.위의 조건에 없을시(신청)
  return 'submit'
}

/**
 * hh:mm(시:분) 포맷을 mm(분)으로 변환
 * @param time
 * @returns {number}
 */
export function getTimeToMinute(time) {
  return moment.duration(time).asMinutes()
}

export function openPopup({path, target, features}, params) {

  let url = path

  if (params) {
    url += `?${qs.stringify(params)}`
  }

  const { screenLeft, screenTop} = window
  const { clientWidth, clientHeight } = document.body

  // 기본값이 없다면 지정
  const popupSize= {
    width: features.width || (screen.availWidth - screen.availWidth / 5),
    height: features.height || (screen.availHeight - screen.availHeight / 5)
  }

  // 듀얼모니터 고려 팝업 정중앙 띄우기
  const left = screenLeft + clientWidth / 2 - popupSize.width / 2
  const top = screenTop + clientHeight / 2 - popupSize.height / 2

  const options = Object.entries({left, top, ...popupSize, ...features})
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');

  return window.open(url, target, options)

}
/**
 * 파일을 HEIC파일이 맞는지 체크하고 HEIC 파일이 맞다면 jpeg로 변환하는 함수
 */
export async function checkAndConvertHEIC(file) {
  if (file && (await isHeic(file) || file.name.toLowerCase().endsWith('.heic'))) {
    const blob = await heicTo({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.5
    })

    // 파일명에서 .HEIC나 .heic 확장자를 제거하고 .jpeg 추가
    const newFileName = file.name.replace(/\.(HEIC|heic)$/i, '.jpeg')

    if (Array.isArray(blob)) {
      return new File(blob, newFileName, {type: "image/jpeg"})
    } else {
      return new File([blob], newFileName, {type: "image/jpeg"})
    }
  }
  return file
}

/**
 *파일 업로드 API 응답에서 파일 객체를 만드는 함수
 * @param fileRes
 */
export function createFileObjectFromApiResponse(fileRes) {
  const fileConvertPath = fileRes._links.convert?.href || null
  const fileThumbnailPath = fileRes._links.thumbnail?.href || null
  const file = {
    fileName: fileRes.filename.replace(/^.*[\\/]/, ''),
    fileSize: fileRes.size,
    fileOriginalPath: fileRes._links.original.href,
    fileContentType: fileRes.contentType,
  }

  if (fileConvertPath !== null)
    file.fileConvertPath = fileConvertPath

  if (fileThumbnailPath !== null) {
    file.fileThumbnailPath = fileThumbnailPath
  } else {
    if (fileRes.contentType.indexOf('video') > -1) {
      file.fileThumbnailPath = store.state.videoThumbnailDefault
    } else if (fileRes.contentType.indexOf('image') > -1) {
      file.fileFlag = 'IMAGE_PACK'
      file.fileThumbnailPath = file.fileOriginalPath.replace('//download', '//image')
    }
  }
  return file
}

export async function validatePDF(file) {
  const objectURL = URL.createObjectURL(file)
  try {
    await window.pdfjsLib.getDocument({
      url: objectURL,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/`,
      cMapPacked: true,
    }).promise;
    revokeObjectURL(objectURL)
    return 'PASS'
  } catch (err) {
    revokeObjectURL(objectURL)
    if (err.message === "Cannot read property 'getDocument' of undefined" || !window.pdfjsLib) {
      return 'ERROR-1' // 브라우저 버전 문제로 pdf 라이브러리 못 불러올때
    } else if (err.message === "Invalid PDF structure.") {
      return 'ERROR-2' // 손상된 PDF
    } else { // 그외 에러
      return 'ERROR-3'
    }
  }
}

export function handleShare(shareData, copyMessage) {
  const navigator = window.navigator;

  if (navigator.share) {
    navigator.share(shareData);
    return;
  }

  navigator.clipboard.writeText(shareData.url).then(() => {
    this.$hiClass.alert(copyMessage);
  });
}