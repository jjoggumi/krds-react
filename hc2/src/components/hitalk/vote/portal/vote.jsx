import { useState, useEffect, useContext, useRef } from 'react'
import { Context } from '../context'
import { controller } from '../controller'
import Style from './vote.module.css'
import { Profile } from '@/components/hiclass/components/profile'
import { ContentWrapper } from './contentWrapper'
import { Icon, MorePopup, IconButton, ShowAlert, ShowConfirm } from '@/components/uiux/hitalk'
import { Question } from './question/question'
import { HitalkVoteEditorModal } from '../editor/main'

export const Vote = ({ $emit, tabSetterContext }) => {
  const { model, dispatch } = useContext(Context);
  const [ isClosed, setIsClosed ] = useState(false)
  const [ disabledSubmit, setDisabledSubmit ] = useState(false)
  const [ disabledReSubmit, setDisabledReSubmit ] = useState(false)
  const { vote, answer, absentees, isOwnerOrManager } = model
  const [ resultMode, setResultMode ] = useState(false)
  const [ showEditor, setShowEditor ] = useState(false)
  const morePopupRef = useRef(null)

  const hasAnswered = () => !model.absentees?.some(m => m.userId === model.userId)

  useEffect(() => { setIsClosed(!!(vote?.status !== 'open')) }, [vote])
  useEffect(() => {
    setDisabledSubmit(isExpired() || hasNotAnswered())
    setDisabledReSubmit(isExpired())
  }, [vote, answer, model.absentees])
  useEffect(() => { setResultMode(hasAnswered() || isExpired()) }, [model.absentees])

  const isExpired = () => {
    if (!vote || !vote.closedTimestamp) return false
    return vote.isDel || isClosed || vote.status !== 'open'
  }

  const hasNotAnswered = () => {
    if (!vote || !answer) return true
    const answeredQuestionIds = answer.answers?.map(item => item.questionId)
    return vote.questions.some(question => !answeredQuestionIds.includes(question.questionId))
      && !hasReset()
  }

  const hasReset = () => hasAnswered() && answer.answers.length === 0

  const updateAnswer = (questionId, selectedItems) =>
    dispatch({answer: { ...answer, answers: [
        ...answer.answers.filter(item => item.questionId !== questionId),
        ...selectedItems.map(itemId => ({questionId, itemId}))
      ]}})

  const submit = async () => {
    if (!await crossCheckVoteStatus(vote.messageId, $emit, answer.answers, dispatch)) return
    await controller.updateVoteAnswer(vote.messageId, answer)
    await controller.reloadReports(vote.messageId, dispatch)
    $emit('updated')
    setResultMode(answer.answers?.length > 0)
  }

  const expire = async () => {
    if (!await crossCheckVoteStatus(vote.messageId, $emit)) return
    if (await ShowConfirm( '투표를 마감하시겠습니까?', { confirmLabel: '종료', reverse: true })) {
      await controller.updateVoteStatus(vote.roomId, vote.messageId, { isClosed: true })
      $emit('updated')
      dispatch({ vote: await controller.loadVoteDetail(vote.messageId) })
      setResultMode(true)
    }
  }

  const deleteVote = async () => {
    if (await ShowConfirm(`투표를 삭제하시겠습니까?
응답 내역을 포함한 모든 데이터가 삭제됩니다.`,
      { confirmLabel: '삭제', reverse: true })) {
      await controller.deleteVote(vote.messageId)
      $emit('close')
      $emit('updated')
    }
  }

  return (
    <div className={Style['vote']}>
      {showEditor && <HitalkVoteEditorModal interceptfileupload={true} room={vote.roomId} vote={vote.messageId} onClose={() => {setShowEditor(false); $emit('updated')}} />}
      <div className={Style['writer-wrapper']}>
        <Profile user={vote?.writer}
            description={<span className={Style['inserted-date']}>{formatInsertDate(vote?.insertTimestamp)}</span>}/>
        {isOwnerOrManager && <div className={Style['more-wrapper']}>
          <MorePopup ref={morePopupRef}  position={{ bottom: 8, left: -20}}>
            {[['modify', '수정하기', (() => setShowEditor(true))], ['trash', '삭제하기', (() => deleteVote())]].map(([icon, label, action]) => (
              <div className={Style['more-item']} key={icon} onClick={() => {
                morePopupRef.current?.close()
                action()
              }}>
                <IconButton icon={icon} iconSize={18}>{label}</IconButton>
              </div>
            ))}
          </MorePopup>
        </div>}
      </div>
      <div className={Style['questions-wrapper']}>
        <div className={Style['questions-info']}>
          <span className={`
              ${Style['status-marker']} 
              ${vote?.status === 'closed' ? Style['status-closed'] : 
                Style['status-unknown']
              }
            `}>
            {{ 'open': '진행중', 'closed': '마감'}[vote?.status] || '알 수 없음'}
          </span>
          {(isOwnerOrManager || vote?.resultStatus === 'PUBLIC') && <button className={Style['open-participants-btn']} onClick={() => tabSetterContext.setTabIndex(1)}>
            <span>{model.vote?.answerCount}</span>명 참여 <Icon icon="arrow-right" />
          </button>}
        </div>
        <ContentWrapper
          header={vote?.closedTimestamp &&
          <div className={Style['questions-header']}>{vote?.title}
            <Icon icon="time"/>투표 종료 : {formatClosedTimestamp(vote?.closedTimestamp)}
          </div>}>
          {(vote?.questions || []).map((question) => 
            <Question key={question.questionId} question={question} resultMode={resultMode}
              answers={answer?.answers.filter(item => item.questionId === question.questionId).map(item => item.itemId)}
              onChange={(selectedItems) => updateAnswer(question.questionId, selectedItems)}/>
          )}
        </ContentWrapper>
        {!isClosed && isOwnerOrManager &&
          <button className={Style['send-push-btn']} onClick={() => sendPush(vote.messageId, absentees, $emit)}>미응답자 푸시보내기</button>}
        <div className={Style['submit-wrapper']}>
          {isOwnerOrManager && !isClosed && <button className={Style['expire-btn']} onClick={expire}>투표 마감</button>}
          {!resultMode && !isClosed && <button className={Style['submit-btn']} disabled={disabledSubmit && !hasReset()} onClick={submit}>투표 하기</button>}
          {resultMode && !isClosed && <button className={Style['re-submit-btn']} disabled={disabledReSubmit} onClick={() => {setResultMode(false)}}>다시 투표 하기</button>}
        </div>
      </div>
    </div>
  );
}

const markLastPushSent = (messageId) => {
  const data = JSON.parse(localStorage.getItem('lastSendPostRemind')) || {}
  data[messageId] = new Date().getTime()
  localStorage.setItem('lastSendPostRemind', JSON.stringify(data))
}

const withinFiveMinutes = (messageId) => {
  const lastSent = JSON.parse(localStorage.getItem('lastSendPostRemind')) || {}
  return new Date().getTime() - (lastSent[messageId] || 0) < 5 * 60 * 1000
}

const sendPush = async (messageId, absentees, $emit) => {
  if (!absentees || absentees.length === 0) {
    return ShowAlert(`모든 구성원이 응답을 완료하였습니다.`)
  }

  if (withinFiveMinutes(messageId)) {
    return ShowAlert(
`마지막 알림 전송 시점으로부터 5분 후 전송하실 수 있습니다.
잠시 후 시도해 주세요.`)
  }
  if (!await crossCheckVoteStatus(messageId, $emit)) return
  if (await ShowConfirm(
`미응답자 ${absentees.length}명에게
푸시를 보내시겠습니까?`, { confirmLabel: '보내기', reverse: true }) ) {
    await controller.sendPushNotification(messageId)
    markLastPushSent(messageId)
  }
}

const crossCheckVoteStatus = async (messageId, $emit, answers, dispatch) => {
  const detail = await controller.loadVoteDetail(messageId)
  if (detail.isClosed || detail.isDel) {
    await ShowAlert(
`유효하지 않은 투표 입니다.
다시 확인해주세요.`)
    $emit('close')
    return false
  }
  if (answers) {
    const hasInvalidAnswer = detail.questions
      .filter(q => !q.isMultipleChoice).some(q => answers.filter(a => a.questionId === q.questionId).length > 1)
    if (hasInvalidAnswer) {
      await ShowAlert(
`투표가 수정되었습니다.
다시 확인해주세요.`)
      dispatch && dispatch({ vote: detail, answer: { answers: [], userId: localStorage.uuid } })
      return false
    }
  }
  return true
}

const weekDayOf = (date) => {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  return weekdays[date.getDay()]
}

const formatInsertDate = (insertTimestamp) => {
  if (!insertTimestamp) return ''
  const date = new Date(insertTimestamp)
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}. ${mm}.${dd}. ${weekDayOf(date)}요일`
}

const formatClosedTimestamp = (closedTimestamp) => {
  if (!closedTimestamp) return ''
  const date = new Date(closedTimestamp)
  const yy = date.getFullYear()
  const mm = date.getMonth() + 1
  const dd = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${yy}년 ${mm}월 ${dd}일 (${weekDayOf(date)}) ${hour}:${min}`
}
