import { useMemo } from 'react';
import { InView } from 'react-intersection-observer';

import moment from 'moment';

import HiModal from '@/components/uiux/hiModal';
import NoData from '@/components/uiux/noData';

import { useContactChangeHistory } from '@/components/text/queries/useContact';
import { useTextContext } from '@/components/text/context/TextContext';
import { useContactGroupContext } from '@/components/text/context/ContactContext';

interface ContactHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  setLocalChangeTimestamp: (timestamp: number | null) => void;
}

export const ContactHistoryModal = ({ isOpen, onClose, setLocalChangeTimestamp }: ContactHistoryModalProps) => {
  const { currentSchool } = useTextContext();
  const { selectedGroupName, selectedGroupId } = useContactGroupContext();

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage } = useContactChangeHistory(currentSchool.schoolId, selectedGroupId);

  const changeHistories = useMemo(() => {
    if (!pages) return [];
    return pages.flatMap((page) => page.changeHistories);
  }, [pages])

  const handleClose = () => {
    const timestamp = changeHistories.length > 0 ? changeHistories[0].insertedTimestamp : null;
    setLocalChangeTimestamp(timestamp);
    onClose();
  }

  return (
    <HiModal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      dimClose
      heading={`${selectedGroupName.join(' ')} 주소록 변경 이력`}
      content={
        <div
          className="table-content table-box sticky-wrap h-110 overflow-y-auto"
        >
          <table className={changeHistories.length === 0 ? 'h-full' : ''}>
            <caption>주소록</caption>
            <colgroup>
              <col style={{ width: '180px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '180px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="sticky-top">일시</th>
                <th className="sticky-top">내역</th>
                <th className="sticky-top">작업자</th>
              </tr>
            </thead>
            <tbody>
              {changeHistories.length === 0 ? (
                <tr>
                  <td colSpan={3} className='p-0 h-full' style={{ borderBottom: 'none' }}>
                    <div className="flex items-center justify-center h-full w-full">
                      <NoData message="변경 이력이 없습니다" size="md" />
                    </div>
                  </td>
                </tr>
              ) : (
                changeHistories.map((changeHistory, index) => (
                  <tr key={`change-history-${index}`}>
                    <td>{moment(changeHistory.insertedTimestamp).format('YYYY.MM.DD HH:mm:ss')}</td>
                    <td className="!text-left">{changeHistory.content}</td>
                    <td>{changeHistory.userName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {hasNextPage && (
            <InView
              threshold={0}
              onChange={(inView) => {
                if (inView && !isFetchingNextPage) fetchNextPage().then();
              }}
            />
          )}
        </div>
      }
    />
  );
};
