import { useReducer, useEffect, useState, useRef } from 'react'
import Style from './main.module.css';
import { Context } from '../context';
import { controller, attachFormattedItemContent } from '../controller'
import { IconButton, HitalkTabs, Icon, ShowAlert } from '@/components/uiux/hitalk';
import { Vote } from './vote';
import { ItemReport } from './itemReport';
import { MemberReport } from './memberReport';
import { Absentees } from './absentees';
import { SimpleUpdateReducer } from '@/supporters';
import { nameOf } from '@/components/hiclass/components/profile';

const tabs = [
  { label: '투표', component: Vote },
  { label: '질문별', component: ItemReport, availableResultStatus: ['PUBLIC'] },
  { label: '멤버별', component: MemberReport, availableResultStatus: ['PUBLIC'] },
  { label: '미참여', component: Absentees, availableResultStatus: ['PUBLIC'] }
]

const sortBySortNo = (a, b) => a.sortNo - b.sortNo

export const HitalkVotePortal = ({vote, $emit = () => {}, showCloseButton = true}) => {
  const [ filteredTabs, setFilteredTabs ] = useState(tabs);
  const [ model, dispatch ] = useReducer(SimpleUpdateReducer, {
    vote: null,
    answer: null,
    itemReport: null,
    memberReport: null,
    absentees: null,
    totalMemberCount: 0,
    userId: localStorage.uuid,
    isOwnerOrManager: false,
    ready: false
  });
  const tabsRef = useRef(null);

  const reloadReference = async () => {
    const detail = await controller.loadVoteDetail(vote);
    const rooms = await controller.loadChatRooms(detail.roomId);

    if (rooms.length === 0) {
      await ShowAlert("유효하지 않은 방입니다.")
      return $emit('close')
    }

    if (rooms[0].isEnding && detail.status === 'open' && detail.writer.userId === localStorage.uuid) {
      controller.deleteAllVotesInRoom(detail.roomId)
      await ShowAlert(`채팅방이 종료되어
투표를 모두 마감합니다.`)
      return $emit('close');
    }

    const classId = rooms[0].classId;

    const [ answer, chatUsers,
      [ itemReport, memberReport, absentees, totalMemberCount ], user ] = await Promise.all([
      controller.loadVoteAnswer(vote),
      controller.loadChatUsers(classId),
      controller.reloadReports(vote),
      controller.loadUser(localStorage.uuid)
    ])
    detail.questions.sort(sortBySortNo)
    detail.questions.forEach(question => {
      question.items.sort(sortBySortNo)
      attachFormattedItemContent(question)
    })
    dispatch({ vote: detail, answer,
      itemReport, memberReport, chatUsers,
      absentees, totalMemberCount, user,
      isOwnerOrManager:
        (await controller.determineIsOwnerOrManagerOf(chatUsers, localStorage.uuid))});
    dispatch({ ready: true });
  }

  useEffect(() => {
    dispatch({ ready: false });
    reloadReference()
    const handler = ({detail}) => detail === vote && reloadReference();
    window.addEventListener('voteChanged', handler);
    tabsRef.current?.setSelectedIndex(0);
    return () => window.removeEventListener('voteChanged', handler);
  }, [vote]);

  useEffect(() => {
    setFilteredTabs(model.isOwnerOrManager
      ? tabs
      : tabs.filter(tab => !tab.availableResultStatus || tab.availableResultStatus.includes(model.vote?.resultStatus)))
  }, [model.vote, model.isOwnerOrManager]);

  const formatInsertDate = (insertedTimestamp) => {
    if (!insertedTimestamp) return '';
    const date = new Date(insertedTimestamp);
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(date.getFullYear() % 100)}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  const exportExcel = async () => {
    const getMember = userId => model.chatUsers.find(user => user.userId === userId) || {};
    const data = [
      ['제출일시', '번호', '응답자명', ...model.vote.questions.map(q => q.questionTitle)],
      ...model.memberReport?.map(member => [
        formatInsertDate(member.insertedTimestamp), getMember(member.userId).memberClassNumber || '-',
        nameOf({...member, ...getMember(member.userId)}), ...member.questions.map(q => q.items.map(i => i.formattedContent).join(', '))
      ])
    ]
    $emit('change', {type: 'exportExcel', data})
  }

  const tabSetterContext = { setTabIndex: null };

  const onEmit = (e) => {
    if (e === 'updated') {
      reloadReference()
    }
    $emit(e)
  }

  return (
    <Context.Provider value={{ model, dispatch }}>
      <div className={Style['hitalk-vote-portal']}>
        {showCloseButton && <IconButton icon="close" className={Style['close-button']} onClick={() => $emit('close')} iconSize={15} />}
        <HitalkTabs ref={tabsRef} labels={filteredTabs.map(tab => tab.label)}
          className={Style['hitalk-tabs']} extractTabSetter={setter => tabSetterContext.setTabIndex = setter}>
          {filteredTabs.map((tab, index) => (
            <div key={index} className={Style['tab-content']}>
              {model.ready && <tab.component $emit={onEmit} tabSetterContext={tabSetterContext} />}
              {!model.ready && <div className={Style['loading']}>
                <Icon icon="loading-horizontal" className={Style['loading-icon']} />
                </div>}
            </div>
          ))}
        </HitalkTabs>
        {model.isOwnerOrManager && <IconButton icon="file-excel" iconSize={15} className={Style['excel-button']} onClick={exportExcel}>결과 엑셀 다운로드</IconButton>}
      </div>
    </Context.Provider>
  );
}