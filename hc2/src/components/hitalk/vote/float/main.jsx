import Style from './main.module.css'
import { useEffect, useState } from 'react'
import { controller } from '../controller'
import { Icon } from '@/components/uiux/hitalk'

export const HitalkVoteFloatRoom = ({ room, $emit = () => {}}) => {
  const [extended, setExtended] = useState(false)
  const [votes, setVotes] = useState([])

  useEffect(() => {
    controller.loadRoomVotes({ room }, { size: 3, status: 'open' }).then(votes => setVotes(votes))
  }, [room])
  
  const open = (messageId) => {
    $emit('open', messageId)
    setExtended(false)
  }

  const onClickNoticeArea = () => {
    if (votes.length === 0) return
    if (votes.length === 1) return open(votes[0].messageId)
    setExtended(!extended)
  }

  return (
    <div className={`${Style['hitalk-vote-float-room']} ${votes.length > 0 ? Style['has-votes'] : ''}`}>
      <div className={`${Style['wrapper']} ${extended ? Style['extended'] : ''}`}>
        <div className={Style['notice-area']} onClick={onClickNoticeArea}>
          <Icon icon="vote-alarm"/>
          <span>진행중인 투표가 있습니다.</span>
          {votes.length > 1 &&
            <div className={Style['arrow-updown']}>
              <Icon icon={extended ? 'arrow-up' : 'arrow-down'}/>
            </div>}
        </div>
        { extended && <>
            <div className={Style['vote-list']}>
              {votes.map(vote => <VoteItem key={vote.messageId} vote={vote} onClick={() => open(vote.messageId)} />)}
            </div>
            <button onClick={open}>투표 목록 보기</button>
          </>}
      </div>
    </div>
  )
}

const VoteItem = ({ vote, onClick }) => {
  const AnseredMarker = () => <div className={`${Style['answered-marker']} ${vote.isAnswered ? Style['answered'] : ''}`}>
    {vote.isAnswered ? '참여' : '미참여'}</div>

  return (
    <div className={Style['vote-item']} onClick={onClick}>
      <div className={Style['vote-title']}>{vote.questions.map(q => q.questionTitle).join(' / ')}</div>
      {vote.closedTimestamp && <div className={Style['vote-description']}>{controller.formatClosedTimestamp(vote.closedTimestamp)}</div>}
      <AnseredMarker/>
    </div>)
}