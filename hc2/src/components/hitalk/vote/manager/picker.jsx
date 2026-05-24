import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { controller } from '../controller';
import { IconButton, Icon, TextInput, InfiniteScroll, formatDateFromYmd } from '@/components/uiux/hitalk';
import { HitalkVoteEditorModal } from '../editor/main';
import { PageContext } from '@/apis/pageContext'

import Styles from './picker.module.css';
import MainStyles from './main.module.css'

const searchContext = {}

const pageContext = new PageContext({
  size: 20,
  onLoadPage: (page) => controller.searchVotes({ ...searchContext, page })
});

export const VotePicker = forwardRef(({ onSelect }, ref) => {
  const [allVotes, setAllVotes] = useState([])
  const [activeVotes, setActiveVotes] = useState([])
  const [expiredVotes, setExpiredVotes] = useState([])
  const [selectedVote, setSelectedVote] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [allLoaded, setAllLoaded] = useState(false)
  const [showMadeByMe, setShowMadeByMe] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [user, setUser] = useState(null)

  useImperativeHandle(ref, () => ({ reload: reset }))
  
  const searchFilter = vote => ((!showMadeByMe || vote.isMyPublish) && 
    (searchKeyword.trim() === '' || (vote.questions?.some(q => 
        q.question?.includes(searchKeyword)
      ) ||
      vote.keywords?.some(k => k.includes(searchKeyword)) ||
      vote.roomName?.includes(searchKeyword)
    )))

  const orgnizeVotes = () => {
    setActiveVotes(allVotes.filter(vote => vote.status === 'open').filter(searchFilter));
    setExpiredVotes(allVotes.filter(vote => vote.status !== 'open').filter(searchFilter));
  }

  const reset = async () => {
    pageContext.reset()
    setAllLoaded(false)
  }

  useEffect(() => { next() }, [allLoaded, allVotes])

  const next = async () => {
    if (allLoaded) return;
    if ((await pageContext.next(true)).length === 0) {
      setAllLoaded(true);
    } else {
      setAllReducedVotes(pageContext.data);
    }
  }

  const reduceForUniqueVotes = (acc, vote) => {
    if (!acc.some(v => v.messageId === vote.messageId)) {
      acc.push(vote);
    }
    return acc;
  }
  
  const isYyyymmdd = (keyword) => /^[12][09]\d{2}[01][0-9][0123][0-9]$/.test(keyword);
  const toFormattedDate = (yyyymmdd) => formatDateFromYmd(yyyymmdd, {spaceBeforeWeekday: false});

  const addFormattedKeywords = (keywords) => keywords.concat(keywords.filter(isYyyymmdd).map(toFormattedDate))

  const setAllReducedVotes = (votes) =>
    setAllVotes(votes.reduce(reduceForUniqueVotes, []).map(vote => ({...vote, keywords: addFormattedKeywords(vote.keywords)})));

  useEffect(() => {
    (async () => {
      if ((searchKeyword !== '' || showMadeByMe) && !allLoaded) {
        setAllReducedVotes(await pageContext.loadAllRemains())
        setAllLoaded(true)
      }
      orgnizeVotes()
    })()
  }, [allVotes, searchKeyword, showMadeByMe]);

  useEffect(() => {
    reset()
    next()
    controller.loadUser(localStorage.uuid).then(user => setUser(user))
  }, []);

  const isTeacher = () => user?.userType === 'TEACHER'

  return (
    <div className={Styles.votePicker}>
      {showEditor && <HitalkVoteEditorModal onClose={() => {
        setShowEditor(false)
        reset()
      }} interceptfileupload={true} />}
      <div className={Styles.votePickerHeader}>
        <span className={Styles.title}>투표 관리</span>
        {isTeacher() && <IconButton
          className={Styles.createBtn}
          onClick={() => setShowEditor(true)}
          icon="plus"
          iconSize={15}
          label="만들기"
        />}
      </div>
      <div className={Styles.searchBox}>
        <TextInput
          placeholder="질문, 항목 검색"
          value={searchKeyword}
          onChange={e => {e.preventDefault?.(); e.stopPropagation?.(); setSearchKeyword(e.target.value)}}
          className={Styles.searchInput}
          showSearch={true}
        />
      </div>
      <InfiniteScroll className={Styles.contents} onLoadMore={next}>
        {user?.userType === 'TEACHER' && <div className={Styles.checkboxRow}>
          <input
            type="checkbox"
            id="madeByMe"
            checked={showMadeByMe}
            onChange={e => {e.preventDefault(); e.stopPropagation(); setShowMadeByMe(e.target.checked)}}
            className={Styles.checkbox}
          />
          <label htmlFor="madeByMe" className={Styles.checkboxLabel}>내가 발행한 투표</label>
        </div>}
        { activeVotes.length + expiredVotes.length > 0 ? (
          [['진행중인 투표', activeVotes], ['마감된 투표', expiredVotes]].filter(([_, votes]) => votes.length > 0).map(([title, votes]) => (
            <div key={title} className={Styles.voteSection}>
              {votes.length > 0 && <div className={Styles.sectionTitle}>{title}</div>}
              {votes.map(vote => (
                <VoteItem
                  key={vote.messageId}
                  vote={vote}
                  selected={selectedVote === vote.messageId}
                  onClick={() => {
                    setSelectedVote(vote.messageId);
                    onSelect && onSelect(vote.messageId);
                  }}
                />
                ))}
            </div>
          )))
          : (
            <div className={MainStyles['no-vote-selected']}>
              <div className={MainStyles['no-vote-content']}>
                <Icon icon="nodata" />
                { showMadeByMe || (searchKeyword === '' && allVotes.length === 0)
                  ? <span>발행된 투표가 없습니다.</span>
                  : <span>검색결과가 없습니다.</span>
                }
              </div>
            </div>
          )
        }
      </InfiniteScroll>
    </div>
  );
})

const VoteItem = ({ vote, selected, onClick }) => {
  const isClosed = vote.status !== 'open' || false;
  const showCount = vote.answerCount !== undefined && vote.answerCount !== null &&
    (vote.resultStatus === 'PUBLIC' || vote.hasManagerRole)

  return <div
    className={`${Styles.voteItem} ${selected ? Styles.selected : ''}`}
    onClick={onClick}
  >
    <div className={Styles.roomName}>{vote.roomName}</div>
    <div className={Styles.voteQuestions}>
      {vote.questions && vote.questions?.map((q, idx) => (
        <div key={idx} className={Styles.voteQuestionTitle}>{q.question}</div>
      ))}
    </div>
    <div className={Styles.voteMeta}>
      {showCount && <>{vote.answerCount}명 참여{!isClosed ? ' · ' : ''}</>}
      {!isClosed && <> {vote.isAnswered
        ? <span className={Styles.myParticipated}>참여 완료</span>
        : <span className={Styles.myNotParticipated}>미참여</span>}</>}
      {!isClosed && vote.closedTimestamp && (
        <div className={Styles.closedTimestamp}><span>{formatClosedTimestamp(vote.closedTimestamp)} 마감{!isClosed && ' 예정'}</span></div>
      )}
    </div>
  </div>
};

const formatClosedTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const pad = n => n.toString().padStart(2, '0');
  const yy = pad(date.getFullYear() % 100);
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const day = '일월화수목금토'[date.getDay()];
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yy}.${mm}.${dd} (${day}) ${hh}:${min}`;
}
