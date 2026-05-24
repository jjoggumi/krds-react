'use strict'
import Vue from 'vue'
import axios from 'axios'
import moment from '@/plugins/moment.js'
import downloadjs from "downloadjs";
import { resolve } from 'core-js/fn/promise';

const commonJs = {
  
  /**
   * winFullPopup
   * @param url
   * @param winName
   * @param w
   * @param h
   * @returns {*}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  winFullPopup(url, winName, w, h) {
    let LeftPosition = 0;
    let TopPosition = 0;
    let settings =
      'height=' + h + ',width=' + w + ',top=' + TopPosition + ',left=' + LeftPosition + ',resizable'
    return window.open(url, winName, settings)
  },
  
  /**
   * convertTimestamp2Date
   * @param {*} timestamp
   * @deprecated 날짜, 시간 표현 라이브러리 교체 에정. moment.js 도 deprecated 됨.
   */
  convertTimestamp2Date(timestamp) {
    if (timestamp !== undefined) {
      // const day = moment(timestamp);
      // return day.format('M[월] D[일] dddd');
      // return day.format("dddd, MMMM Do YYYY, h:mm:ss a");
      
      const d = new Date(timestamp);
      const yyyy = d.getFullYear();
      let mm = d.getMonth() + 1;
      let dd = d.getDate();
      const month = mm;
      const day = dd;
      let fullDate = `${yyyy}-${(mm < 10 ? '0' + mm : mm)}-${(dd < 10 ? '0' + dd : dd)}`;
      const dayLabel = this.getInputDayLabel(fullDate);
      
      return [`${month}월`, `${day}일`, dayLabel].join(" ");
      
    } else {
      return "";
    }
  },

  nowDateType01() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = today.getMonth() + 1
    const dd = today.getDate()

    return `${yyyy}${(mm < 10 ? '0' + mm : mm)}${(dd < 10 ? '0' + dd : dd)}`
  }, 
  
  /**
   * convertTimestamp2DateByNoWeeks
   * @param timestamp
   * @return {string}
   * @deprecated 날짜, 시간 표현 라이브러리 교체 에정. moment.js 도 deprecated 됨.
   */
  convertTimestamp2DateByNoWeeks(timestamp) {
    if (timestamp !== undefined) {
      const d = new Date(timestamp);

      let mm = d.getMonth() + 1;
      let dd = d.getDate();
      const month = mm;
      return [`${month}월`, `${dd}일`].join(" ");

    } else {
      return "";
    }
  },

  /**
   * convertTimestamp2DateByFormat
   * @param timestamp
   * @param separator
   * @param format
   * @return {string}
   * @deprecated 날짜, 시간 표현 라이브러리 교체 에정. moment.js 도 deprecated 됨.
   */
  convertTimestamp2DateByFormat(timestamp, separator, format) {
    let fullDate = ""
    if (timestamp !== undefined) {
      const d = new Date(timestamp);

      const yyyy = d.getFullYear();
      let mm = d.getMonth() + 1;
      let dd = d.getDate();
      if (format === "ko") {
        let tmpfullDateFormat = `${yyyy}-${(mm < 10 ? '0' + mm : mm)}-${(dd < 10 ? '0' + dd : dd)}`;
        fullDate = `${yyyy}년 ${(mm < 10 ? '0' + mm : mm)}월 ${(dd < 10 ? '0' + dd : dd)}일 (${this.getInputDayLabel(tmpfullDateFormat).substr(0, 1)})`;
      } else if (format === "ko2") {
        fullDate = `${yyyy}년 ${(mm < 10 ? '0' + mm : mm)}월 ${(dd < 10 ? '0' + dd : dd)}일`;
      } else if (format === "datetime") {
        fullDate = `${yyyy}${separator}${(mm < 10 ? '0' + mm : mm)}${separator}${(dd < 10 ? '0' + dd : dd)} ${d.getHours()}:${d.getMinutes()}`;
      } else if (format === "mmddhhmm") {
        fullDate = `${(mm < 10 ? '0' + mm : mm)}${separator}${(dd < 10 ? '0' + dd : dd)} ${d.getHours() < 10 ? '0' + d.getHours() : d.getHours()}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()}`;
      } else {
        fullDate = `${yyyy}${separator}${(mm < 10 ? '0' + mm : mm)}${separator}${(dd < 10 ? '0' + dd : dd)}`;
      }

    } else {
      fullDate = "";
    }
    return fullDate;
  },
  
  /**
   * convertTimestamp2HourTime
   * @param timestamp
   * @return {`${number}:${string|number}`|string}
   * @deprecated 날짜, 시간 표현 라이브러리 교체 에정. moment.js 도 deprecated 됨.
   */
  convertTimestamp2HourTime(timestamp) {
    let fullDate = ""
    if (timestamp !== undefined) {
      const d = new Date(timestamp);
      let m = d.getMinutes();

      fullDate = `${d.getHours()}:${(m < 10 ? '0' + m : m)}`;
      return fullDate;

    } else {
      fullDate = "";
    }
    return fullDate;
  },
  
  /**
   * date_ko
   * @param timestamp
   * @return {string}
   * @deprecated 날짜, 시간 표현 라이브러리 교체 에정. moment.js 도 deprecated 됨.
   */
  date_ko(timestamp) {
    const nowYear = moment().year()
    const paramYear = moment(timestamp).year()
    const paramMonth = moment(timestamp).month()
    const paramDate = moment(timestamp).date()
    const diffYears = nowYear - paramYear

    let templateYear = ''
    let templateMonth = 'M'
    let templateDate = 'D'
    if (paramMonth > 9)
      templateMonth = 'MM'
    if (paramDate > 9)
      templateDate = 'DD'
    if (diffYears > 0)
      templateYear = 'YYYY년 '

    return moment(timestamp).format(`${templateYear}${templateMonth}월 ${templateDate}일 dddd`)
  },
  
  /**
   * getInputDayLabel
   * @param date
   * @return {string}
   * @deprecated 날짜, 시간 표현 라이브러리 교체 에정. moment.js 도 deprecated 됨.
   */
  getInputDayLabel(date) {
    if (date !== undefined) {
      const week = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const day = new Date(date).getDay();
      return week[day];

    } else {
      return "";
    }
  },
  
  /**
   * split
   * n1,n2가 없으면 마지막 배열만 가져옴
   * n1만 있으면 해당 index 문자만 가져옴
   * n1,n2 전부 있으면 n1,n2 사이의 인덱스를 가져옴
   * @param from
   * @param separator
   * @param n1
   * @param n2
   * @returns {*}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  split(from, separator, n1, n2) {
    let tmpStr = ""

    if (!this.isEmpty(from)) {
      if (typeof n1 === "undefined" && typeof n2 === "undefined") {
        tmpStr = from.split(separator)[from.split(separator).length - 1];
      } else if (typeof n1 !== "undefined" && typeof n2 === "undefined") {
        tmpStr = from.split(separator)[n1];
      } else if (typeof n1 !== "undefined" && typeof n2 !== "undefined") {
        tmpStr = "/"
        for (let i = 0; i < from.split(separator).length; i++)
          if (i >= n1 && i <= n2) {
            tmpStr += from.split(separator)[i];
            if (i !== n2) tmpStr += separator
          }
      } else {
        tmpStr = false;
      }
    } else {
      tmpStr = false;
    }
    return tmpStr;
  },
  
  /**
   * log
   * @param args
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  log(...args) {
    let str = "name : ";

    if (typeof args[0].$options === "undefined") str += args[0] + ", ";
    else str += args[0].$options.name + ", ";

    let arr = [];
    let obj = {};
    arr[0] = str;
    let objCnt = 0;

    for (let i in args) {
      if (i > 0) {
        if (typeof args[i] !== "undefined" && args[i].constructor === Object) { obj[objCnt] = args[i]; objCnt++; }
        else {
          if (i % 2 === 1) {
            arr[i] = args[i] + " : ";
          }
          else {
            arr[i] = args[i];
          }
        }
      }
    }
    if (Object.keys(obj).length === 0 && obj.constructor === Object) {
      obj = "";
    }
    Vue.$log.debug(arr.join(""), obj);
  },
  
  /**
   * jsonToQueryString
   * @param json
   * @returns {string}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  jsonToQueryString(json) {
    return (
      "?" +
      Object.keys(json)
        .map(function (key) {
          return (
            encodeURIComponent(key) + "=" + encodeURIComponent(json[key])
          );
        })
        .join("&")
    );
  },
  
  /**
   * setContent
   * @param content
   * @param cutLineFrom
   * @param cutLineTo
   * @param separator
   * @returns {string}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  setContent(content, cutLineFrom, cutLineTo, separator) {
    let retStr = "";
    if (content === null)
      return retStr

    let tmpArr = content.split("<div>")
    if (!content) content = "";
    if (separator === undefined) separator = "\n"
    let firstLine = (tmpArr.shift() + separator).trim();
    content = tmpArr.join("")
    content = firstLine + content.replace(/<\/div>/g, separator).trim()
    for (let i in content.split(separator)) {
      if (cutLineFrom !== undefined && cutLineTo === undefined) {
        if (i < (cutLineFrom)) {
          retStr += "<p>" + content.split(separator)[i] + "</p>"
        }
      }
      else if (cutLineFrom !== undefined && cutLineTo !== undefined) {
        if (i >= (cutLineFrom - 1) && i < cutLineTo) {
          retStr += "<p>" + content.split(separator)[i] + "</p>"
        }
      }
      else {
        retStr += "<p>" + content.split(separator)[i] + "</p>"
      }
    }
    return retStr;
  },
  
  /**
   * setContent2
   * @param content
   * @param cutLineFrom
   * @param cutLineTo
   * @param separator
   * @returns {string}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  setContent2(content, cutLineFrom, cutLineTo, separator) {
    let retStr = "";
    if (content === null || !content === true || content === '')
      return retStr

    content = content.replace(/<(\/)?span([^>]*)>/g, "")
    content = content.replace(/ style="[^"]*"/g, "");
    let tmpArr = content.split("<p>")
    if (!content) content = "";
    if (separator === undefined) separator = "\n"
    let firstLine = (tmpArr.shift() + separator).trim().replace(/<br>/gi, "").trim();
    content = tmpArr.join("")

    content = firstLine + content.replace(/<\/p>/g, separator).trim();
    for (let i in content.split(separator)) {
      if (cutLineFrom !== undefined && cutLineTo === undefined) {
        if (i < cutLineFrom) {
          retStr += "<p>" + content.split(separator)[i] + "</p>"
        }
      }
      else if (cutLineFrom !== undefined && cutLineTo !== undefined) {
        // console.log(content.split(separator)[i])
        if (i >= (cutLineFrom - 1) && i < cutLineTo) {
          retStr += "<p>" + content.split(separator)[i] + "</p>"
        }
      }
      else {
        retStr += "<p>" + content.split(separator)[i] + "</p>"
      }
    }
    if (retStr.replace(/<(\/)?p([^>]*)>/g, "") === "") retStr += "<p>" + content.split(separator)[1] + "</p>"

    return retStr;
  },
  
  /**
   * downloadForDoc
   * @param href
   * @param download
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  downloadForDoc(href, download) {
    const a = document.createElement("a");
    a.href = href;
    a.download = download;
    a.target = "_blank";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(href);
  },
  
  /**
   * download
   * @param href
   * @param download
   * @returns {Promise<AxiosResponse<any>>}
   * @deprecated common.js 삭제 예정. vuex store download 사용 !
   */
  download(href, download) {
    return axios({
      method: 'get',
      url: href,
      responseType: "blob",
      headers: "",
      onDownloadProgress: (progressEvent) => {
        //console.log("progressEvent", progressEvent)
      }
    })
      .then((res) => {
        const blob = new Blob([res.data], { type: 'application/octet-stream' });
        downloadjs(blob, download.normalize('NFC'), "text/plain");
      })
      .catch(() => {
        alert('파일 다운로드를 실패했습니다.\r잠시 후 다시 시도해주세요.')
      })
  },

  /**
   * downloadFile 파일 객체 파라미터로 다운로드
   * @param file
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  downloadFile(file) {
    if (file.fileTranscodePath)
      file.fileOriginalPath = file.fileTranscodePath

    this.download(file.fileOriginalPath, file.fileName)
  },
  
  /**
   * downloadFiles
   * @param urls
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  downloadFiles(urls) {
    this.download(urls[0].href, urls[0].filename);
    let that = this;
    if (urls.length > 1)
      window.setTimeout(function () {
        that.downloadFiles(urls.slice(1));
      }, 1000);
  },
  
  /**
   * isImage
   * files : array , flag : true => 이미지인것만 가져오기, false : 이미지 미디어 제외인 파일 , v : 동영상 , (true, false, v) 외의 키워드는 이미지와 미디어파일 함께 로드
   * @param files
   * @param flag
   * @returns {*[]}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  isImage(files, flag) {
    let array = [];
    if (flag === true) {
      for (let i in files) {
        if (files[i].fileContentType !== null && files[i].fileContentType.indexOf("image") > -1) {
          array.push(files[i]);
        }
      }
    } else if (flag === "v") {
      for (let i in files) {
        if (files[i].fileContentType !== null && files[i].fileContentType.indexOf("video") > -1) {
          array.push(files[i]);
        }
      }
    } else if (flag === false) {
      for (let i in files) {
        if (files[i].fileContentType !== null && files[i].fileContentType.indexOf("image") === -1 && files[i].fileContentType.indexOf("video") === -1) {
          array.push(files[i]);
        }
      }
    } else {
      for (let i in files) {
        if (files[i].fileContentType !== null && files[i].fileContentType.indexOf("image") > -1 || files[i].fileContentType.indexOf("video") > -1) {
          array.push(files[i]);
        }
      }
    }
    return array;
  },
  
  /**
   * getConvertedSchoolUri
   * @param uri
   * @returns {*}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  getConvertedSchoolUri(uri) {
    return process.env.VUE_APP_BASE_API_URI + this.split(uri, "/", 3, 4);
  },

  /**
   * getModalPosition
   * Modal position
   * @param modal
   * @returns {{m_height: number, m_width: number}}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  getModalPosition(modal) {
    // modal.show();
    // $('body').addClass('hidden');

    return {
      m_height: modal.clientHeight / 2,
      m_width: modal.clientWidth / 2
    };
  },
  
  /**
   * isCompareTime
   * @param startTime
   * @param endTime
   * @returns {boolean}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  isCompareTime(startTime, endTime) {
    const s = parseInt(startTime);
    const e = parseInt(endTime);
    return s < e;
  },
  
  /**
   * arrCompare
   * @param fromArr
   * @param toArr
   * @returns {boolean}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  arrCompare(fromArr, toArr) {
    if (!toArr || !fromArr) return false;

    if (fromArr.length !== toArr.length) return false;

    for (let i = 0, l = fromArr.length; i < l; i++) {
      if (fromArr[i] instanceof Array && toArr[i] instanceof Array) {
        if (!fromArr[i].compare(toArr[i])) {
          return false;
        }
      } else if (fromArr[i] !== toArr[i]) {
        return false;
      }
    }

    return true;
  },
  
  /**
   * toJSONLocal
   * @param timestamp
   * @returns {string}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  toJSONLocal(timestamp) {
    let getTimeStamp = 0;

    if (!timestamp) {
      getTimeStamp = new Date();
    } else {
      if (typeof timestamp === 'number') {
        getTimeStamp = timestamp
      } else {
        getTimeStamp = moment(timestamp, 'YYYY-MM-DD').toDate()
      }
      //getTimeStamp = timestamp;
    }

    let local = new Date(getTimeStamp);
    local.setHours(new Date().getHours() + new Date().getTimezoneOffset() / -60);
    return local.toJSON().slice(0, 10);
  },
  
  /**
   * replaceFileExtensionName
   * @param filename
   * @param toExtensionName
   * @returns {*}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  replaceFileExtensionName(filename, toExtensionName) {

    var _fileLen = filename.length;

    /** 
     * lastIndexOf('.') 
     * 뒤에서부터 '.'의 위치를 찾기위한 함수
     * 검색 문자의 위치를 반환한다.
     * 파일 이름에 '.'이 포함되는 경우가 있기 때문에 lastIndexOf() 사용
     */
    var _lastDot = filename.lastIndexOf('.');

    // 확장자 명만 추출한 후 소문자로 변경
    filename = filename.replace(filename.substring(_lastDot, _fileLen), "." + toExtensionName);

    return filename;
  },
  
  /**
   * getFileExtensionName
   * @param filename
   * @returns {string}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  getFileExtensionName(filename) {
    var _fileLen = filename.length;

    /** 
     * lastIndexOf('.') 
     * 뒤에서부터 '.'의 위치를 찾기위한 함수
     * 검색 문자의 위치를 반환한다.
     * 파일 이름에 '.'이 포함되는 경우가 있기 때문에 lastIndexOf() 사용
     */
    var _lastDot = filename.lastIndexOf('.');
    return filename.substring(_lastDot, _fileLen).replace(".", "");
  },
  
  /**
   * getLocationPort
   * @returns {string}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  getLocationPort() {
    var port = window.location.port;
    if (
      port !== undefined &&
      port !== null &&
      port !== "" &&
      port !== '80' &&
      port !== '443'
    ) {
      return ":" + port;
    } else {
      return "";
    }
  },
  
  /**
   * isEmpty
   * @param str
   * @returns {boolean}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  isEmpty(str) {
    return !(str !== undefined && str !== null && str !== 'null'
        && str !== "");
  },
  
  /**
   * Shuffles array in place. ES6 version
   * @param {Array} a items An array containing the items.
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  
  /**
   * isIE
   * @returns {boolean}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  isIE() {
    const ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    return ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  },
  
  /**
   * FindLeftWindowBoundry
   * Find Left Boundry of current Window
   * @returns {number}
   * @constructor
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  FindLeftWindowBoundry() {
    // In Internet Explorer window.screenLeft is the window's left boundry
    if (window.screenLeft)
    {
      return window.screenLeft;
    }

    // In Firefox window.screenX is the window's left boundry
    if (window.screenX)
      return window.screenX;

    return 0;
  },

  /**
   * FindLeftScreenBoundry
   * Find Left Boundry of the Screen/Monitor
   * @returns {number}
   * @constructor
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  FindLeftScreenBoundry() {
    // Check if the window is off the primary monitor in a positive axis
    // X,Y                  X,Y                    S = Screen, W = Window
    // 0,0  ----------   1280,0  ----------
    //     |          |         |  ---     |
    //     |          |         | | W |    |
    //     |        S |         |  ---   S |
    //      ----------           ----------
    if (window.leftWindowBoundry() > window.screen.width)
    {
      return window.leftWindowBoundry() - (window.leftWindowBoundry() - window.screen.width);
    }

    // Check if the window is off the primary monitor in a negative axis
    // X,Y                  X,Y                    S = Screen, W = Window
    // 0,0  ----------  -1280,0  ----------
    //     |          |         |  ---     |
    //     |          |         | | W |    |
    //     |        S |         |  ---   S |
    //      ----------           ----------
    // This only works in Firefox at the moment due to a bug in Internet Explorer opening new windows into a negative axis
    // However, you can move opened windows into a negative axis as a workaround
    if (window.leftWindowBoundry() < 0 && window.leftWindowBoundry() > (window.screen.width * -1))
    {
      return (window.screen.width * -1);
    }

    // If neither of the above, the monitor is on the primary monitor whose's screen X should be 0
    return 0;
  },

  /**
   * floatingHeader
   * SCROLL EVENT : HEADER
   * @param lastScrollTop
   * @returns {number}
   * @deprecated common.js 삭제 예정. vuex store 처리 필요.
   */
  floatingHeader(lastScrollTop) {
    try {
      const st = window.pageYOffset;
      const renewalHeaderWrap = document.querySelector('.renew-header-cont-wrap');
      const delta = 1; // 동작의 구현이 시작되는 위치

      if(Math.abs(lastScrollTop - st) <= delta)
        return st

      if (lastScrollTop) {
        const methodType = (lastScrollTop > delta && st > lastScrollTop) ? 'add' : 'remove'
        renewalHeaderWrap.classList[methodType]('scroll-down')

        // control filter-fixed__area
        const filterFixedArea = document.querySelector('.column-content .filter-fixed__area')
        const methodType2 = (lastScrollTop > delta && st > lastScrollTop) ? 'remove' : 'add'
        if (filterFixedArea)
          filterFixedArea.classList[methodType2]('is-scrollup')
      }
      // eslint-disable-next-line
    } catch (e) { }

    return window.pageYOffset
  },

  /**
   * 영어대소문자숫자로 구성된 랜덤한 8자리 값 생성
   * @return {string}
   */
  generateHash() {
    let hash = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 8; i++) {
      hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return hash;
  },

  async asyncWaitFor(condition) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const result = condition();
        if (result) {
          clearInterval(interval);
          resolve(result);
        }
      }, 10);
    });
  },

  promiseWithTimeout(promise, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('timeout'));
      }, timeout);

      promise.then((value) => {
        clearTimeout(timer);
        resolve(value);
      }).catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
    })
  },

  createDebouncer({term, onFlush, context}) {
    class Debouncer {
      constructor(term=1000, onFlush, context) {
        this.onFlush = onFlush
        this.context = context
        this.bucket = []
        this.interval = setInterval(() => this.flush(), term)
      }
    
      basicFlush() {
        if (this.bucket.length === 0) return
        try {
          this.bucket[this.bucket.length - 1]()
        } catch (e) {
          console.error("Debouncer flush error:", e);
        }
        this.bucket = []
      }

      flush() {
        if (this.onFlush) {
          this.onFlush(this.context)
        } else {
          this.basicFlush()
        }
      }
    
      add(callback) {
        this.bucket.push(callback)
      }
    }
    return new Debouncer(term, onFlush, context)
  },

  createThrottle(term = 1000) {
    class Throttle {
      constructor(term) {
        this.term = term
        this.lastExecution = 0
        this.lastResult = null
      }
    
      async execute(func) {
        const now = Date.now();
        if (now - this.lastExecution < this.term) return this.lastResult;
        this.lastExecution = now
        this.lastResult = await func()
        return this.lastResult
      }
    }

    return new Throttle(term)
  },
  findComponentByPath(root, path) {
    const names = path.split('/');
    let current = root;
    for (const name of names) {
      if (!current || !current.$children) return null;
      current = current.$children.find(
        v => (v.$options.name && v.$options.name.toLowerCase().includes(name.toLowerCase()))
      );
    }
    return current;
  }
};

window.leftWindowBoundry = commonJs.FindLeftWindowBoundry
window.leftScreenBoundry = commonJs.FindLeftScreenBoundry

export default commonJs;
