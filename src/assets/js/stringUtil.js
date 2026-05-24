'use strict'

const stringUtil = {
  /**
   * string replaceAll
   * @param {*} str
   * @param {*} searchStr
   * @param {*} replaceStr
   */
  replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr)
  },
  /**
   * phone number Formatter
   * @param {*} num
   * @param {*} type
   */
  phoneFormatter(num, type) {
    let formatNum = ''
    if (num === null || num === undefined || num === '') return formatNum

    switch (num.length) {
      case 11: {
        switch (type) {
          case 0:
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')
            break
          case 1:
            formatNum = num.replace(/(\d{3})(\d{3,4})(\d)(\d{3})/, '$1*****$4')
            break
          default:
            formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
            break
        }
        break
      }
      case 8: {
        formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2')
        break
      }
      default: {
        if (num.indexOf('02') === 0) {
          switch (type) {
            case 0:
              formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3')
              break
            default:
              formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
          }
        } else if (num.indexOf('0507') === 0) {
          switch (type) {
            case 0:
              formatNum = num.replace(/(\d{4})(\d{4})(\d{4})/, '$1-****-$3')
              break
            default:
              formatNum = num.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
          }
        } else {
          switch (type) {
            case 0:
              formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3')
              break
            default:
              formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
          }
        }

      }
    }
    return formatNum
  },
  shorteningByLength(str, length) {
    // default value
    if (length === undefined) length = 40

    if (str !== undefined && str.length > length) {
      str = str.substr(0, length - 2) + '...'
    }
    return str
  },
  replaceNewLine(str) {
    if (str !== undefined && str !== '' && str !== null)
      return str.replace(/(?:\r\n|\r|\n)/g, '<br />')
    else return ''
  },
  insertNewLine(refId, VueInstance) {
    const self = VueInstance
    let tArea = self.$refs[refId]

    // get cursor's position:
    let startPos = tArea.selectionStart,
      endPos = tArea.selectionEnd,
      cursorPos = startPos,
      tmpStr = tArea.value
    const insert = '\n'

    // insert:
    self.txtContent =
      tmpStr.substring(0, startPos) +
      insert +
      tmpStr.substring(endPos, tmpStr.length)
    // apply local data:
    self[refId] = self.txtContent

    // move cursor:
    self.$nextTick(() => {
      cursorPos += insert.length
      tArea.selectionStart = tArea.selectionEnd = cursorPos
    })
  },
  pasteHtmlAtCaret(html, selectPastedContent) {
    var sel, range
    if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection()
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0)
        range.deleteContents()

        // Range.createContextualFragment() would be useful here but is
        // only relatively recently standardized and is not supported in
        // some browsers (IE9, for one)
        var el = document.createElement('div')
        el.innerHTML = html
        var frag = document.createDocumentFragment(),
          node,
          lastNode
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node)
        }
        var firstNode = frag.firstChild
        range.insertNode(frag)

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange()
          range.setStartAfter(lastNode)
          if (selectPastedContent) {
            range.setStartBefore(firstNode)
          } else {
            range.collapse(true)
          }
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }
    } else if ((sel = document.selection) && sel.type != 'Control') {
      // IE < 9
      var originalRange = sel.createRange()
      originalRange.collapse(true)
      sel.createRange().pasteHTML(html)
      if (selectPastedContent) {
        range = sel.createRange()
        range.setEndPoint('StartToStart', originalRange)
        range.select()
      }
    }
  },
  /**
   * 모든 HTML 태그를 제거하고 반환한다.
   */
  removeTag(html) {
    return this.replaceAll(
      html,
      '<(/)?([a-zA-Z]*)(\\s[a-zA-Z]*=[^>]*)?(\\s)*(/)?>',
      ''
    )
  },
  unEntity(str) {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  },
  /**   
   * 숫자 천 단위 마다 콤마 추가하여 String 반환 
   * @param {*} number 
   */
  addCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  /**
   * string replaceAll color RGB to HEX
   * style color, background-color RGB to HEX replaceAll
   * @param str
   * @return {*}
   */
  replaceRgbToHex(str) {
    try {
      return str.replace(/rgb\((.+?)\)/ig, (_, rgb) => {
        return '#' + rgb.split(',')
          .map(str => parseInt(str, 10).toString(16).padStart(2, '0'))
          .join('')
      })
    } catch (e) {
      return str
    }
  },

  /**
   * 첫 글자만 대문자로 변환
   * @param string
   * @returns {string}
   */
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  
  getSafeIsRegNamePattern4(value) {
    let rtnValue = value.replace(/[^A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]*$/g, '')
    return rtnValue
  },

  /**
   * 정수인 숫자만 입력받도록 처리
   * @param value
   * @returns {number|string}
   */
  getSafeIntegerNumberByString(value) {
    let rtnValue = value.replace(/[^0-9]/g, '')
    return Number.isSafeInteger(parseInt(rtnValue, 10))
      ? parseInt(rtnValue, 10)
      : ''
  },
  getSafeIntegerNumberByStringType02(value) {
    let rtnValue = value.toString().replace(/[^0-9]/g, '')
    return Number.isSafeInteger(parseInt(rtnValue, 10))
      ? parseInt(rtnValue, 10)
      : ''
  },

}

export default stringUtil
