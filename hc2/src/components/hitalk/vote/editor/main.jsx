import { useReducer, useEffect, useRef, useState } from 'react'
import { Context } from '../context'
import { createQuestion, controller } from '../controller'
import { SimpleUpdateReducer } from '@/supporters'
import { Dialog, ShowAlert, ShowConfirm, RoundedButton } from '@/components/uiux/hitalk'
import { MetaEditor } from "./meta"
import { ContentEditor } from "./content"

import styles from "./editor.module.css"
const expose = [ 'roomIds', 'resultStatus', 'userId', 'questions', 'isClosed' ]

const alertMessageForExpiration = `이미 마감된 투표입니다.
마감된 투표는 투표 결과만 수정 가능합니다.`

const confirmMessageForAnswered = `이미 응답한 구성원이 있습니다.
투표 내용을 수정하시겠습니까?`

export const HitalkVoteEditorMain = ({ room, vote, $emit = () => {}, onChange=() => {}, meta, interceptFileUpload = false }) => {
  const [ model, dispatch ] = useReducer(SimpleUpdateReducer, {
    room,
    roomIds: room ? [ room ] : [],
    chatRooms: [],
    resultStatus: 'PUBLIC',
    closedType: 'auto',
    closedTimestamp: new Date().getTime() + 3 * 60 * 60 * 1000,
    userId: localStorage.uuid,
    questions: [createQuestion()],
    editMode: vote && vote !== '',
    editableQuestionMeta: true,
    isClosed: false,
    interceptFileUpload
  })
  
  const getConnectRoomItemWithClass = async () => {
    const connectRoomItem = controller.getConnectRoomItemFromLegacyHiclass()
    const chatUsers = await controller.loadChatUsers(connectRoomItem.classId)
    return { ...connectRoomItem, ...(chatUsers[0] || {}).clazz, room: connectRoomItem.roomId }
  }

  useEffect(() => {
    (async () => {
      let [rooms, users] = await Promise.all([
        controller.loadChatRooms(),
        controller.loadChatUsers()
      ])
      if (room && !rooms.find(r => r.room === room)) {
        rooms = [await getConnectRoomItemWithClass()].concat(rooms)
      }
      const me = users.filter(u => u.userId === localStorage.uuid)
      const findRoleInRoom = (room) => (me.find(u => u.clazz.classId == room.classId) || {}).memberRole
      const isOwnerOrManagerInRoom = room => ['OWNER', 'MANAGER'].includes(findRoleInRoom(room))
      dispatch({ chatRooms: rooms.filter(r => r.roomType === 'GROUP')
                .filter(isOwnerOrManagerInRoom).map(r => ({...r, master:localStorage.uuid})) })
    })()
  }, [])

  useEffect(() => {
    if (!model.editMode) return
    controller.loadVoteDetail(vote).then(voteDetail => {
      controller.hasAnswerers(vote).then(hasAnswerers => dispatch({ editableQuestionMeta: (hasAnswerers ? false : true) && !voteDetail.isClosed }))
      voteDetail.questions.sort((a, b) => a.sortNo - b.sortNo)
      voteDetail.questions.forEach(({ items }) => items.sort((a, b) => a.sortNo - b.sortNo))
      dispatch({ ...voteDetail, closedType: voteDetail.closedTimestamp ? 'auto' : 'none' })
    })
  }, [room, vote])

  useEffect(() => {
    const exportedModel = exportModel(model)
    onChange(exportedModel)
    $emit('change', exportedModel)
  }, [model])

  return (
    <Context.Provider value={{ model, dispatch }}>
      <div className={styles['editor-main']}>
        <div className={`${styles['left-area']} ${styles['gray-bordered']}`}>
          <MetaEditor ref={meta} />
        </div>
        <div className={styles['right-area']}>
          <ContentEditor />
        </div>
      </div>
    </Context.Provider>
  );
}

export const HitalkVoteEditorModal = ({ $emit = () => {}, room, vote, onClose = () => {}, interceptfileupload, ...props }) => {
  const [ model, setModel ] = useState({})
  const [ disabled, setDisabled ] = useState(true)

  const metaRef = useRef(null)
  const editMode = vote && vote !== ''

  useEffect(() => {
    setDisabled((model.roomIds || []).length === 0 || !model.questions || model.questions?.some(q => q.questionTitle === ''))
  }, [model])

  const checkValidations = () => {
    const anyInvaliation = [
      ['항목을 입력해 주세요.', () => !model.questions?.every(q => 
      q.items.length > 0 && q.items?.some(i => i.itemContent !== ''))],
      ['중복된 항목이 있습니다.', () => !model.questions?.filter(q => q.questionType === 'TEXT').every(q => {
        const filtered = q.items.filter(i => i.itemContent.trim() !== '');
        const itemContents = filtered.map(i => i.itemContent.trim());
        return new Set(itemContents).size === filtered.length;
      })],
      ['투표 마감시간은 10분 후부터 설정이 가능합니다.', () => model.closedTimestamp &&
        timestampToYmdhm(model.closedTimestamp) < timestampToYmdhm(Date.now() + 10 * 60 * 1000),
        () => { metaRef.current?.openCalendar() }
      ]
    ].find(([_, condition]) => condition())

    if (anyInvaliation) {
      ShowAlert(anyInvaliation[0]).then(() => (anyInvaliation[2] || (() => {}))());
    }

    return !!anyInvaliation;
  }

  const adjustItemContents = () => {
    model.questions?.filter(q => q.questionType === 'IMAGE').forEach(q => q.items?.forEach((i, idx) => {
      if (i.itemContent !== '') return;
      i.itemContent = `${idx + 1}번`;
    }))
    model.questions?.forEach(q => {
      q.items = q.items.filter(i => i.itemContent.trim() !== '');
    });
  }

  const hasAnswered = async (voteId) => (await controller.loadReportFor(voteId, 'member')).length > 0;

  const close = () => {
    $emit('close');
    onClose();
  }

  const submit = async () => {
    const { isClosed } = vote ? await controller.loadVoteStatus(vote) : { isClosed: false };
    const hasInconsistClosedStatus = model.isClosed !== isClosed;
    !isClosed && adjustItemContents();
    if (!isClosed && checkValidations()) return;
    if (hasInconsistClosedStatus && isClosed) { await ShowAlert(alertMessageForExpiration); }
    else if (vote && !isClosed && (await hasAnswered(vote))) {
      if (!(await ShowConfirm(confirmMessageForAnswered, { reverse: true }))) return;
    }
    await controller.submitVote(model, vote).catch(err => {
      $emit('error', err);
    });
    window.dispatchEvent(new CustomEvent('voteChanged', { detail: vote }))
    close()
  }

  return (
    <Dialog className={styles['editor-modal']} shown={true} onClose={close}
      footer={
        <div className={styles['editor-modal-footer']}>
          <RoundedButton onClick={close} className={styles['cancel-button']}>취소</RoundedButton>
          <RoundedButton disabled={disabled} onClick={submit} className={styles['create-button']}>{editMode ? '수정' : '만들기'}</RoundedButton>
        </div>
      }
    >
      <div className={styles['editor-modal-title']}>투표 만들기</div>
      <div className={styles['editor-modal-content']}>
        <HitalkVoteEditorMain room={room} vote={vote} {...props} onChange={setModel} meta={metaRef} interceptFileUpload={interceptfileupload} />
      </div>
    </Dialog>
  );
}

const timestampToYmdhm = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(Number(timestamp));
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return parseInt(`${y}${m}${d}${h}${min}`);
}

const exportModel = model => {
  const exportData = {}
  expose.forEach(key => {
    exportData[key] = JSON.parse(JSON.stringify(model[key]))
  })
  exportData.closedTimestamp = model.closedType === 'auto' ? model.closedTimestamp : null
  return exportData
}
