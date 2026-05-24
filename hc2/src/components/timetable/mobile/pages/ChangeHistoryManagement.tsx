import { HiTab, MobileHeader, Card, HiBadge, KebabMenu } from '@/components/uiux/';
import clsx from 'clsx';
import { Core, TimetableMobileProps } from '../types';
import { ShowConfirm } from '@/components/uiux/modal';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLessonCancelledChangeHistory, useLessonCompletedChangeHistory, useLessonPendingChangeHistory } from '../queries/useLessonChangeHistory';
import { dispatchLessonChangeHistoryClicked, goBackWithNative, TimetableDisplayUtils, TimeUtils, TypeUtils } from '../utils';
import NoData from '@/components/uiux/noData';
import { InView } from 'react-intersection-observer';
import { motion, Variants } from 'framer-motion';
import moment from 'moment';
import { TimetableClassContext, TimetableCourseContext, TimetableTeacherContext, useClassContext, useCourseContext, useGradeContext, useTeacherContext } from '../context';
import { requestCancelLessonChange } from '../api/changeHistory';
import { useSearchParams } from 'react-router-dom';

/* 타입 */

interface ChangeItem {
  changeId: string;
  changeType: Core.TimetableLessonChangeType;
  lessonChangeType: Core.TimetableDailyLessonChangeType;
  badge: string; // changeStatusMap의 값 중 하나
  status: Core.TimetableLessonChangeStatus;
  dateText: string;
  requestUserName: string;
  lessonTeacherName: string;
  changeContent: string;
  lessonContent: string;
  reason?: string;
  contents: ChangeItemContent[];
}

interface ChangeItemContent {
  lessonDate: Date;
  lessonPeriod: number;
  fromCourse?: string;
  fromTeacher?: string;
  toCourse?: string;
  toTeacher?: string;
}

type ChangeCardProps = {
  item: ChangeItem;
  clickItemListener: (item: ChangeItem) => void;
  clickCancelListener: (item: ChangeItem) => void;
}

const FADE_IN_VARIANTS: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.1,
            duration: 0.24,
        },
    },
};

const CHANGE_HISTORY_REFRESH_EVENT = 'hc2:lesson-change-history-refresh';

type ChangeHistoryRefreshDetail = {
  timetableId?: string;
}

/* 카드 컴포넌트 */
function ChangeCard({ item, clickItemListener, clickCancelListener }: ChangeCardProps) {
  const { badge, status, dateText, lessonTeacherName, changeContent, lessonContent, reason, requestUserName } = item;
  const [isPressed, setIsPressed] = useState(false);
  /* 뱃지 색상: 승인 대기는 primary, 그 외는 disabled(회색) */
  const getBadgeColor = (item: ChangeItem) => item.status === Core.TimetableLessonChangeStatus.Pending ? 'primary' : 'gray';
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  return (
    <motion.div initial="hidden" animate="visible" variants={FADE_IN_VARIANTS}>
      <Card size="md" variant="border"
        className={clsx(
          'w-full overflow-hidden',
          'border-border-neutral-base !p-4 cursor-pointer !pb-2',
          !isMenuOpened && isPressed && 'active:bg-bg-primary-subtlest'
        )}>
        <div 
          onPointerDown={() => !isMenuOpened && setIsPressed(true)}
          onPointerUp={() => setIsPressed(false)}
          onPointerCancel={() => setIsPressed(false)}
          onPointerLeave={() => setIsPressed(false)}
          onClick={() => {
            setIsPressed(false);
            clickItemListener(item);
          }}
        >
          {/* 상단: 뱃지 + 날짜 + 케밥 메뉴 */}
          <div className="flex justify-between mb-2 h-6">
            <div className="flex items-center gap-2">
              <HiBadge type="outline" color={getBadgeColor(item)} shape="rounded">
                {badge}
              </HiBadge>
              <span className="text-leading-d1 text-text-neutral-base">{dateText} {requestUserName}</span>
            </div>
            {/* 승인대기 상태일 때만 요청 취소 가능 */}
            {status === Core.TimetableLessonChangeStatus.Pending && (
              <KebabMenu
                onOpenChange={(isOpen: boolean) => setIsMenuOpened(isOpen)}
                items={[
                  {
                    label: '요청 취소', onClick: (event: any) => {
                      event?.stopPropagation(); // 카드 클릭 이벤트 방지
                      clickCancelListener(item);
                    }, className: 'text-action-red-base'
                  },
                ]}
              />
            )}
          </div>

          {/* 하단: 상세 정보 */}
          <ul className="flex flex-col">
            <li className="flex items-center gap-2 border-b border-border-neutral-subtle py-2.5 px-0.5 min-w-0">
              <span className="w-20 font-semibold text-leading-b3 text-text-default">변경 내용</span>
              <span className="flex-1 text-leading-b3 text-text-default min-w-0 break-all whitespace-pre-wrap">
                {changeContent}
              </span>
            </li>
            <li className="flex items-center gap-2 border-b border-border-neutral-subtle py-2.5 px-0.5 min-w-0">
              <span className="w-20 font-semibold text-leading-b3 text-text-default">변경 수업</span>
              <span className="flex-1 text-leading-b3 text-text-default min-w-0 break-all whitespace-pre-wrap">
                {lessonContent} {lessonTeacherName}
              </span>
            </li>
            <li className="flex items-start gap-2 py-2.5 px-0.5 min-w-0">
              <span className="w-20 font-semibold text-leading-b3 text-text-default">변경 사유</span>
              <span className="flex-1 text-leading-b3 text-text-default min-w-0 break-all whitespace-pre-wrap">
                {reason}
              </span>
            </li>
          </ul>
        </div>
      </Card>
    </motion.div>
  );
}



/**
 * 변경 내역 관리
 * 
 * - query items:
 *    - timetableId: 시간표 아이디 (필수)
 *    - tab?: 탭 인덱스 
 */
const ChangeHistoryManagement = ({ timetableId, className }: TimetableMobileProps) => {
  const { handleError } = useApiErrorHandler();
  const [searchParams] = useSearchParams();
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const timetableConfig = useGradeContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const classes = useClassContext();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const classContext = TimetableClassContext.getInstance();

  const courseMap = useMemo(
    () => courseContext.courseMap || ({} as Record<string, Core.Course>),
    [courses]
  );
  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Core.Teacher>),
    [teachers]
  );
  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Core.Class>),
    [classes]
  );

  const [isTimetableContextLoaded, setIsTimetableContextLoaded] = useState<boolean>(false);
  // 모든 컨텍스트의 reload 함수를 호출
  const reloadContextAllWithTimetableId = async (id: string) => {
    await courseContext.reloadWithTimetableId(id);
    await teacherContext.reloadWithTimetableId(id);
    await classContext.reloadWithTimetableId(id);

    setIsTimetableContextLoaded(true);
  };

  const [startPeriod, setStartPeriod] = useState<number | null>(1);
  /// 승인완료 - 승인대기 - 반려/취소
  const statusTabs: string[] = ['승인완료', '승인대기', '반려/취소'];
  const initialTabIndex = Math.min(Math.max(Number(searchParams.get("tab") || 0), 0), statusTabs.length - 1);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(initialTabIndex);
  const [scrollTopOfTab, setScrollTopOfTab] = useState<{tabIndex: number; offset: number}[]>([]);
  const currentTabIndex = useMemo(() => selectedTabIndex, [selectedTabIndex]);

  // 수업 변경 상태 맵
  const changeStatusMap = {
    [Core.TimetableLessonChangeStatus.Pending]: '승인대기',
    [Core.TimetableLessonChangeStatus.Completed]: '승인완료',
    [Core.TimetableLessonChangeStatus.Rejected]: '반려',
    [Core.TimetableLessonChangeStatus.Canceled]: '취소',
    [Core.TimetableLessonChangeStatus.Ignored]: '처리 불가',
    [Core.TimetableLessonChangeStatus.Recovered]: '관리자 취소'
  };

  const convertLessonChangeTypeLabel = (type: Core.TimetableDailyLessonChangeType): string => {
    switch (type) {
      case Core.TimetableDailyLessonChangeType.Exchange:
        return '수업 교체';
      case Core.TimetableDailyLessonChangeType.Adjustment:
        return '결,보강';
      case Core.TimetableDailyLessonChangeType.Replacement:
        return '수업 변경';
      case Core.TimetableDailyLessonChangeType.Addition:
        return '수업 추가';
      default:
        return '';
    }
  };

  const convertStatusToBadge = (status: Core.TimetableLessonChangeStatus): string => {
    return changeStatusMap[status] || '';
  }

  // region 데이터 파싱
  /** API에서 받아온 데이터를 ChangeItem 형태로 변환 */
  const convertLessonChangeToChangeItem = (change: Core.TimetableLessonChange): ChangeItem => {
    moment.locale('ko'); // 한국어로 설정
    const day = change.status === Core.TimetableLessonChangeStatus.Completed ? moment(change.approvedTimestamp ?? change.requestedTimestamp) : moment(change.requestedTimestamp);
    const dateText = day.format('YY.M.D (ddd) HH:mm');
    const contents: ChangeItemContent[] = [];
    if (change.contents) {
      let rawContents = JSON.parse(change.contents);
      if (!Array.isArray(rawContents)) {
        rawContents = [rawContents];
      }
      rawContents.forEach((content: any) => {
        if (!content.lessonDate || !content.period) return;
        const lessonDate = TimeUtils.getNumberAsDate(content.lessonDate);
        const period = startPeriod ? content.period : Number(content.period) - 1;
        // TODO: 불필요한 정보이면 제거 
        const fromCourse = courseMap[content.sourceCourseId]?.displayedTitle.trim() || '';
        const fromTeacher: string = (content.sourceTeacherIds || []).map((tid: string) => teacherMap[tid]?.teacherName).filter(Boolean).join(', ') || '';
        const toCourse = courseMap[content.targetCourseId]?.displayedTitle.trim() || '';
        const toTeacher: string = (content.targetTeacherIds || []).map((tid: string) => teacherMap[tid]?.teacherName).filter(Boolean).join(', ') || '';

        contents.push({
          lessonDate: lessonDate,
          lessonPeriod: period,
          fromCourse: fromCourse.length > 0 ? fromCourse : undefined,
          fromTeacher: fromTeacher.length > 0 ? fromTeacher : undefined,
          toCourse: toCourse.length > 0 ? toCourse : undefined,
          toTeacher: toTeacher.length > 0 ? toTeacher : undefined,
        });
      });
    }

    const originSelectedName = change.selectedClassName;
    let classNames = originSelectedName;
    if (Array.isArray(originSelectedName) && originSelectedName.length > 0 && TypeUtils.isUUID(originSelectedName[0])) {
      const [classId, extraCount] = originSelectedName;
      const classLabel = classMap[classId] ? TimetableDisplayUtils.formatFullClassName(classMap[classId]) : classId;
      const suffix = originSelectedName.length === 2 && extraCount ? ` 외 ${extraCount}개반` : '';
      classNames = [`${classLabel}${suffix}`];
    }
    const lessonPeriod = contents[0]?.lessonPeriod ?? 1;
    const lessonDate = contents[0]?.lessonDate ?? new Date();
    const lessonDay = moment(lessonDate)
    const lessonWeekday = lessonDay.format('ddd');
    const lessonName = contents[0]?.fromCourse || contents[0]?.toCourse || '';
    const className = classNames?.join(', ') || '';

    const lessonTeacherName = contents[0]?.fromTeacher || contents[0]?.toTeacher || '';
    const changeContent = '[' + convertLessonChangeTypeLabel(change.lessonChangeType) + '] '
      + lessonDay.format('M/D') + '(' + lessonWeekday + ') ' + lessonPeriod + '교시';
    const lessonContent = className + ' ' + lessonName;

    return {
      changeId: change.lessonChangeId,
      changeType: change.changeType,
      lessonChangeType: change.lessonChangeType,
      badge: convertStatusToBadge(change.status),
      status: change.status,
      dateText: dateText,
      lessonTeacherName: lessonTeacherName,
      requestUserName: change.requestedUser.userName || '',
      changeContent: changeContent,
      lessonContent: lessonContent,
      reason: change.reason,
      contents: contents,
    }
  };
  // endregion

  const completedQuery = useLessonCompletedChangeHistory(timetableId || '');
  const pendingQuery = useLessonPendingChangeHistory(timetableId || '');
  const cancelledQuery = useLessonCancelledChangeHistory(timetableId || '');

  // 탭별로 데이터 분리
  const pendingItems: ChangeItem[] = useMemo(() => {
    if (!pendingQuery.pages) return [];
    return pendingQuery.pages.flatMap(page => page.histories.map(convertLessonChangeToChangeItem));
  }, [pendingQuery]);

  const completedItems: ChangeItem[] = useMemo(() => {
    if (!completedQuery.pages) return [];
    return completedQuery.pages.flatMap(page => page.histories.map(convertLessonChangeToChangeItem));
  }, [completedQuery]);

  const cancelledItems: ChangeItem[] = useMemo(() => {
    if (!cancelledQuery.pages) return [];
    return cancelledQuery.pages.flatMap(page => page.histories.map(convertLessonChangeToChangeItem));
  }, [cancelledQuery]);

  const refreshItems = async () => {
    await pendingQuery.refetch();
    await completedQuery.refetch();
    await cancelledQuery.refetch();
  };

  const handleClickCancel = async (item: ChangeItem) => {
    if (item.status !== Core.TimetableLessonChangeStatus.Pending) return; // 승인대기 상태에서만 취소 가능
    const confirmed = await ShowConfirm('선택하신 수업 교체 요청을 취소하시겠습니까?', {
      confirmLabel: '요청 취소',
      cancelLabel: '닫기',
      reverse: true,
      className: 'mobile-alert',
      confirmClassName: 'text-action-red-base!',
    });
    if (confirmed) {
      const isCancelled = await requestCancel(item);
      if (isCancelled) {
        refreshItems();
      }
    }
  }
  // MARK: requestCancel
  const requestCancel = async (item: ChangeItem): Promise<boolean> => {
    if (!timetableId) return false;
    if (item.status !== Core.TimetableLessonChangeStatus.Pending) return false; // 승인대기 상태에서만 취소 가능
    try {
      // console.log(`요청 취소: ${item.changeId}`);
      await requestCancelLessonChange(timetableId, item.changeId);
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }

  // MARK: handleClickItem
  const handleClickItem = (item: ChangeItem) => {
    if (!timetableId) return;
    // 상세 페이지로 이동
    setTimeout(() => {  
      if (!dispatchLessonChangeHistoryClicked(timetableId, item.changeId)) {
        let url = `/mobile/timetable/change-history/${item.changeId}?timetableId=${timetableId}`;
        url += `&lessonChangeType=${item.lessonChangeType}`;
        url += `&status=${item.status}`;
        window.location.href = url;
      }
    }, 100); 
  }

  const handleClickClose = () => {
    goBackWithNative();
  }

  const handleClickHeader = () => {
    console.log('Header clicked - scroll to top');
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setScrollTopOfTab(prev => {
      const newScrollTopOfTab = [...prev];
      newScrollTopOfTab[currentTabIndex] = { tabIndex: currentTabIndex, offset: 0 };
      return newScrollTopOfTab;
    });
  }

  const onChangedTab = async (index: number) => {
    console.log(`탭 변경: ${currentTabIndex} -> ${index}`);
    scrollTopOfTab[currentTabIndex] = { tabIndex: currentTabIndex, offset: scrollContainerRef.current?.scrollTop || 0 };
    console.log(scrollTopOfTab);

    setSelectedTabIndex(index);
    const savedOffset = scrollTopOfTab.find(tab => tab.tabIndex === index)?.offset || 0;
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: savedOffset, behavior: 'instant' });
    }, 100);

    try {
      if (index === 0) {
        if (pendingItems.length === 0) {
          console.debug('Fetch initial pending data');
          pendingQuery.fetchNextPage().then();
        }
      } else if (index === 1) {
        if (completedItems.length === 0) {
          console.debug('Fetch initial completed data');
          completedQuery.fetchNextPage().then();
        }
      } else if (index === 2) {
        if (cancelledItems.length === 0) {
          console.debug('Fetch initial cancelled data');
          cancelledQuery.fetchNextPage().then();
        }
      }
    } catch (e) {
      handleError(e);
    }
  }

  // === UseEffects ===

  useEffect(() => {
    if (!timetableConfig) {
      return;
    }
    console.log('timetableConfig', timetableConfig);
    setStartPeriod(timetableConfig?.startPeriod ?? 1);
  }, [timetableConfig]);

  useEffect(() => {
    const handleRefreshItems = (event: Event) => {
      const customEvent = event as CustomEvent<ChangeHistoryRefreshDetail>;
      const targetTimetableId = customEvent.detail?.timetableId;

      if (!timetableId) {
        return;
      }

      if (targetTimetableId && targetTimetableId !== timetableId) {
        return;
      }

      refreshItems().catch((e) => {
        handleError(e);
      });
    };

    window.addEventListener(CHANGE_HISTORY_REFRESH_EVENT, handleRefreshItems);

    return () => {
      window.removeEventListener(CHANGE_HISTORY_REFRESH_EVENT, handleRefreshItems);
    };
  }, [timetableId, handleError, pendingQuery, completedQuery]);

  useEffect(() => {
    console.log('mounted timetableId', timetableId);
    if (timetableId) {
      reloadContextAllWithTimetableId(timetableId).then(() => {
        console.log('All contexts reloaded with timetableId', timetableId);
        onChangedTab(initialTabIndex);
      }).catch(e => {
        console.error('Error reloading contexts with timetableId', timetableId, e);
      });
    }
  }, [timetableId]);

  return (
    <div className={clsx('flex flex-col h-screen bg-bg-base select-none', className)}>
      <MobileHeader title="변경 내역 관리" onClose={() => handleClickClose()}   
        className="border-b-0 text-center" 
        onHeaderClick={handleClickHeader} />

      {/* 탭 바 */}
      <div className="px-4 pt-6 pb-4 shrink-0">
        <HiTab
          labels={statusTabs}
          selectedTabIndex={currentTabIndex}
          variant="pills"
          size="sm"
          isControlOuter
          onChange={onChangedTab}
        />
      </div>

      <main ref={scrollContainerRef} className={
        clsx("flex-1 overflow-y-auto overscroll-contain px-4 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )
      }>
        {/* 완료 탭 */}
        {currentTabIndex === 0 && isTimetableContextLoaded && (
          completedItems.length === 0 ? (
            <div className="flex items-center justify-center h-full w-full">
              <NoData message="변경 이력이 없습니다" size="md" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {completedItems.map((item) => <ChangeCard key={item.changeId} item={item} clickItemListener={handleClickItem} clickCancelListener={handleClickCancel} />)}
              {completedQuery.hasNextPage && (
                <InView
                  threshold={0}
                  onChange={(inView) => {
                    if (inView && !completedQuery.isFetchingNextPage) {
                      console.log('Load more - Completed data');
                      completedQuery.fetchNextPage().then();
                    }
                  }}
                />
              )}
            </div>
          )
        )}

        {/* 승인대기 탭 */}
        {currentTabIndex === 1 && isTimetableContextLoaded && (
          pendingItems.length === 0 ? (
            <div className="flex items-center justify-center h-full w-full">
              <NoData message="변경 이력이 없습니다" size="md" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingItems.map((item) => <ChangeCard key={item.changeId} item={item} clickItemListener={handleClickItem} clickCancelListener={handleClickCancel} />)}
              {pendingQuery.hasNextPage && (
                <InView
                  threshold={0}
                  onChange={(inView) => {
                    console.trace('InView changed - Pending data', { inView, pendingQueryIsFetchingNextPage: pendingQuery.isFetchingNextPage });
                    if (inView && !pendingQuery.isFetchingNextPage) {
                      console.log('Load more - Pending data');
                      pendingQuery.fetchNextPage().then();
                    }
                  }}
                />
              )}
            </div>
          )
        )}
        

        {/* 취소 탭 */}
        {currentTabIndex === 2 && isTimetableContextLoaded && (
          cancelledItems.length === 0 ? (
            <div className="flex items-center justify-center h-full w-full">
              <NoData message="변경 이력이 없습니다" size="md" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cancelledItems.map((item) => <ChangeCard key={item.changeId} item={item} clickItemListener={handleClickItem} clickCancelListener={handleClickCancel} />)}
              {cancelledQuery.hasNextPage && (
                <InView
                  threshold={0}
                  onChange={(inView) => {
                    if (inView && !cancelledQuery.isFetchingNextPage) {
                      console.log('Load more - Cancelled data');
                      cancelledQuery.fetchNextPage().then();
                    }
                  }}
                />
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default ChangeHistoryManagement;