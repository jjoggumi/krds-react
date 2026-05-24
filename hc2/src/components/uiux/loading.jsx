import React from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './icon'
import styles from './loading.module.scss';

/**
 * @typedef {Object} LoadingProps
 * @property {('horizontal'|'spinner'|'dots'|'timetable')} [variant]
 * @property {string} [className]
 * @property {string} [icon]
 * @property {boolean} [overlay]
 * @property {boolean} [attachToBody]
 * @property {string} [text]
 */

/**
 * @param {LoadingProps} props
 */
export const Loading = ({
  className = '',
  variant = 'horizontal',
  icon = undefined,
  overlay = false,
  attachToBody = true,
  text = '',
}) => {
  const iconByVariant = {
    horizontal: 'loading-horizontal',
    spinner: 'loading-spinner',
    dots: 'loading-dots',
  }[variant] || 'loading-horizontal'

  const resolvedIcon = icon || iconByVariant
  const overlayClass = overlay ? styles['loading-overlay'] : styles['loading']
  const attachNoneBodyClass = !attachToBody ? styles['loading-nonebody'] : ''
  const containerClass = `${overlayClass} ${attachNoneBodyClass} ${styles[`loading--${variant}`] || ''} ${className} flex flex-col`
  const iconClass = `${styles['loading-icon']} ${styles[`loading-icon--${variant}`] || ''} ${styles[`loading-${variant}`] || ''}`

  const loadingContent = (
    <div className={containerClass} onClick={(e) => e.stopPropagation()} aria-busy="true" role="status">
      {variant === 'timetable' ? (
        <div className={styles['dot-loader']}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <Icon icon={resolvedIcon} className={iconClass} />
      )}
      {text !== '' &&(
        <p className='text-leading-h3 mt-10'>{text}</p>
      )}
    </div>
  )
  if (overlay && attachToBody) {
    return createPortal(loadingContent, document.body)
  }
  return loadingContent
}

export default Loading
