import { getByteLen, getByteLength } from './utils'

export function cutByte(content, num) {
  let text = (content || '').replace(/(<([^>]+)>)/ig,"").trim()
  if (getByteLen(text) > num) {
    let l = 0
    for (var i = 0; i < text.length; i++) {
      l += (text.charCodeAt(i) > 128) ? 2 : 1
      if (l > num) return `${text.substring(0,i)}...`
    }
  }

  return text
}

export function getByte(content) {
  return getByteLength(content)
}