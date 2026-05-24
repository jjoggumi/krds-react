import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Icon } from '../icon'

export const MorePopup = forwardRef(({ children, className, icon='more', entry=null, state=[], underbounds='', whenOverflow, disabled=false, position }, ref) => {
  const [show, setShow] = state.length > 1 ? state : useState(false)
  const entryRef = useRef(null)
  const menuRef = useRef(null)

  useImperativeHandle(ref, () => ({
    open: () => setShow(true),
    close: () => setShow(false)
  }))

  useEffect(() => {
    if (!show) return
    
    const menu = menuRef.current
    if (menu) {
      let rect = calculatePositionRect(entryRef.current, menu, position || { bottom: 0, leftInside: 0 })
      if (underbounds && typeof underbounds === 'string' && underbounds.endsWith('vh')) {
        const vh = parseFloat(underbounds)
        const maxBottom = window.innerHeight * (vh / 100)
        if (rect.bottom > maxBottom) {
          rect.top = Math.max(0, maxBottom - rect.height)
          if(whenOverflow) { rect = whenOverflow(rect) }
        }
      }

      menu.style.position = 'fixed'
      menu.style.zIndex = '9999';

      ['top', 'left', 'right', 'bottom'].filter(key => rect[key] !== undefined).forEach(key => {
        menu.style[key] = `${rect[key]}px`
      })
    }
    const handleScroll = (event) => {
      if (menuRef.current && menuRef.current.contains(event.target)) return
      setShow(false)
    }
    window.addEventListener('scroll', handleScroll, true)
    const handleClickOutside = (event) => {
      if (entryRef.current && entryRef.current.contains(event.target)) return
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShow(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [show])

  const openMenu = e => {
    if (disabled) return
    e.preventDefault()
    setShow(prev => !prev)
  }

  return (
    <>
      {entry ? (<div className={`more-popup-entry ${className}`} ref={entryRef} onClick={openMenu}>{entry}</div>) : (<div ref={entryRef}><Icon icon={icon} onClick={openMenu}/></div>)}
      {show && (
        <div ref={menuRef} className={`more-popup ${className}`}>
          {children}
        </div>
      )}    
    </>
  )
})

const getRectOf = element => {
  const rect = element.getBoundingClientRect()
  return ['left', 'top', 'right', 'bottom', 'width', 'height'].reduce((acc, key) => {
    acc[key] = rect[key]
    return acc
  }, {})
}

const calculatePositionRect = (entry, popup, position) => {
  const entryRect = getRectOf(entry)
  const popupRect = getRectOf(popup)
  const result = [ ['left', 'left', () => entryRect.left - popupRect.width - position.left],
    ['leftInside', 'left', () => entryRect.left + position.leftInside],
    ['top', 'top', () => entryRect.top - popupRect.height - position.top],
    ['right', 'left', () => entryRect.right + position.right],
    ['bottom', 'top', () => entryRect.bottom + position.bottom]
  ].filter(([key]) => position[key] !== undefined).reduce((acc, [_, dist, calc]) => {
    acc[dist] = calc();
    return acc;
  }, {});
  return {...result,
    bottom: result.top + popupRect.height,
    right: result.left + popupRect.width,
    height: popupRect.height
  }
}