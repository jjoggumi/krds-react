import { useContext, useRef, useEffect } from 'react'
import { Context } from '../context'
import { IconButton, CalendarPopup, Icon, CheckBox, TextInput, Thumbnail, ShowConfirm } from '@/components/uiux/hitalk'
import { AnswerTypePicker } from './answerTypePicker'
import { controller } from '../controller'

import styles from "./editor.module.css"

const minimumDateItems = 3
const maximumItems = 50

export const Question = ({ idx }) => {
  const { model, dispatch } = useContext(Context)
  const { questions, editableQuestionMeta, isClosed, interceptFileUpload } = model
  const question = questions[idx]
  const onlyOne = questions.length === 1
  const fileInputRef = useRef(null)
  const descriptionRef = useRef(null)
  const titleRef = useRef(null)

  const removeMe = async () => {
    if (onlyOne) return
    const confirmed = await ShowConfirm('질문을 삭제하시겠습니까?', {confirmLabel: '삭제', reverse: true})
    if (!confirmed) return
    questions.splice(idx, 1)
    dispatch({ questions })
  }

  const toggleMultiSelect = () => {
    if (!editableQuestionMeta) return
    question.isMultipleChoice = !question.isMultipleChoice
    dispatch({ questions })
  }

  const toggleAnonymous = () => {
    if (!editableQuestionMeta) return
    question.isAnonymous = !question.isAnonymous
    dispatch({ questions })
  }

  const updateSelectedDates = (selectedTimestamps) => {
    const lastItems = question.items.filter(i => i.itemContent !== '')
    question.items = selectedTimestamps.map(ts => ({
      ...(lastItems.find(i => i.itemContent === formatYYYYMMDD(ts)) || {}),
      itemContent: formatYYYYMMDD(ts)
    }));
    dispatch({ questions })
  }

  const DatePicker = ({ disabled, children, timestamp = new Date().getTime(), position }) => (
    <CalendarPopup 
      onChange={updateSelectedDates}
      disabled={disabled}
      withTime={false}
      maximum={maximumItems}
      timestamp={timestamp}
      position={position}
      value={question.items.filter(i => i.itemContent !== '').map(i => yyyymmddToTimestamp(i.itemContent))}
    >
      { children }
    </CalendarPopup>
  )

  const LessDates = () => {
    const lessDateCount = question.questionType === 'DATE' ? minimumDateItems - question.items.length : 0;
    return <>
      { lessDateCount > 0 && new Array(lessDateCount).fill(null).map((_, idx) => (
        <div key={idx} className={`${styles['date-picker']} ${styles['item-content-box']}`}>
          <DatePicker timestamp={new Date().getTime()}>
            <span className={styles['placeholder']}>날짜 선택</span>
          </DatePicker>
        </div>
      ))}
    </>
  }

  const updateTextArea = (ref, key, value) => {
    if (ref.current) {
      ref.current.value = value
      setTimeout(() => {
        ref.current.style.height = 'auto'
        ref.current.style.height = `${ref.current.scrollHeight + 5}px`
      }, 1)
    }
    if(value === undefined) return
    question[key] = value
    dispatch({ questions })
  }

  useEffect(() => {
    updateTextArea(titleRef, 'questionTitle')
    updateTextArea(descriptionRef, 'questionDescription')
  }, [question])

  return (
    <div className={`${styles['gray-bordered']} ${styles['question']}`}>
      <div className={styles['question-header']}>
        <textarea maxLength='100'
          rows='1' ref={titleRef}
          value={question.questionTitle || ''} className={`${styles['title']} ${!onlyOne && editableQuestionMeta ? styles['padded-for-trashbin'] : ''}`}
          placeholder='질문 입력' disabled={isClosed} onChange={e => updateTextArea(titleRef, 'questionTitle', e.target.value.replace(/[\n\r]+/g, ''))} />
        <textarea maxLength='300'
          rows='1' ref={descriptionRef}
          value={question.questionDescription || ''} className={styles['description']}
          placeholder='설명 입력(선택)' disabled={isClosed} onChange={e => updateTextArea(descriptionRef, 'questionDescription', e.target.value)} />
      </div>
      <div className={styles['answers-wrap']}>
        { AnswerTypePicker({ question }) }
        { !isClosed && question.questionType === 'TEXT' && question.items.length < maximumItems && <IconButton
          className={styles['add-answer-btn']}
          icon='plus'
          iconSize={15}
          onClick={() => {
            question.items.push({ itemContent: '' })
            dispatch({ questions })
          }}
          label='항목 추가'
          />}
        { !isClosed && question.questionType === 'DATE' &&
          <DatePicker position={{ left: -180, bottom: 5 }}>
            <IconButton
              className={styles['add-answer-btn']}
              icon='plus'
              iconSize={15}
              label='항목 추가'
              />
          </DatePicker>
        }
        <div className={styles['answers']}>
          {question.items.map((item, answerIdx) => (
            {TEXT: (<TextInput key={answerIdx} disabled={isClosed} className={`${styles['text-input']} ${styles['item-content-box']}`} value={item.itemContent} placeholder='항목 입력'
              onChange={(e) => {
                item.itemContent = e.target.value
                dispatch({ questions })
              }} maxLength={20}/>),
            DATE: (<div key={answerIdx} className={`${styles['date-picker']} ${styles['item-content-box']}`}>
              <DatePicker disabled={isClosed} timestamp={new Date(item.itemContent || '').getTime()}>
                {
                  item.itemContent === ''
                  ? <span className={styles['placeholder']}>날짜 선택</span>
                  : formatDateTime(item.itemContent)
                }
              </DatePicker>
            </div>),
            IMAGE: (<div key={answerIdx} className={`${styles['image-item']}`}>
              {item.fileOriginalPath && (<>
                <Thumbnail src={item.fileOriginalPath} alt={item.fileName} className={styles['thumbnail']} />
                {!isClosed && <div className={styles['image-delete']} onClick={() => { question.items.splice(answerIdx, 1); dispatch({ questions }) }}>
                  <Icon icon='close-s'/>
                </div>}
                </>
              )}
              <TextInput disabled={isClosed} value={item.itemContent} placeholder={`${answerIdx + 1}번`}
                onChange={(e) => {
                  item.itemContent = e.target.value
                  dispatch({ questions })
                }} maxLength={10}
                className={`${styles['text-input']} ${styles['item-content-box']}`}
                />
            </div>)
          }[question.questionType] || <div key={answerIdx}></div>))}
          <LessDates/>
        </div>
        { !isClosed && question.questionType === 'IMAGE' && question.items.length < 4 && (
          <div className={styles['image-upload']} onClick={() => { question.items.length < 4 && fileInputRef.current.click() }}>
            <input ref={fileInputRef} type='file' accept='image/*' onChange={async (e) => {
              const file = interceptFileUpload ? await callFileUploadingInterceptor(e.target.files) : e.target.files[0]
              if (file) {
                controller.uploadImage(file).then((data) => {
                  question.items.push({
                    itemContent: '',
                    fileCategory: 'IMAGE',
                    fileName: file.name,
                    fileContentType: file.type,
                    fileSize: file.size,
                    fileOriginalPath: data._links?.original?.href,
                    fileConvertPath: data._links?.convert?.href,
                  });

                  dispatch({ questions })
                })
              }
              fileInputRef.current.value = ''
            }} />
            <Icon icon='plus'/>
            <span>이미지 추가&nbsp;</span>
            <span className={styles['file-instruction']}>(최대 4개까지 가능)</span>
          </div>
        )}
      </div>
      <div className={styles['options']} >
        <CheckBox checked={!!question.isMultipleChoice} onChange={toggleMultiSelect} disabled={!editableQuestionMeta || isClosed} label="복수 선택"/>
        <CheckBox checked={!!question.isAnonymous} onChange={toggleAnonymous} disabled={!editableQuestionMeta || isClosed} label="익명 투표" className="ml-20"/>
      </div>
      {!onlyOne && editableQuestionMeta && (
        <button className={styles['delete-btn']} onClick={removeMe}></button>
      )}
    </div>
  );
}

const formatDateTime = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return ''
  const y = parseInt(yyyymmdd.slice(0, 4), 10)
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1
  const d = parseInt(yyyymmdd.slice(6, 8), 10)
  const date = new Date(y, m, d)
  return `${y}년 ${m + 1}월 ${d}일 (${'일월화수목금토'[date.getDay()]})`
}

const formatYYYYMMDD = (timestamp) => {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

const yyyymmddToTimestamp = (yyyymmdd) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null
  const y = parseInt(yyyymmdd.slice(0, 4), 10)
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1
  const d = parseInt(yyyymmdd.slice(6, 8), 10)
  return new Date(y, m, d).getTime()
}

const callFileUploadingInterceptor = async (files) => new Promise((resolve) =>
  window.dispatchEvent(new CustomEvent('vote-file-uploading', { detail: { files, resolve } })))