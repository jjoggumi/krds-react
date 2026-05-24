import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { ActivateWeekday, Core, LessonDay, WeekRange, withWeekRange } from '../../types';
import { useGradeContext } from '../../context';
import { ClassDayStatus, DAYS_OF_WEEK } from '../../constants';
import { TimetableDisplayUtils, TimeUtils } from '../../utils';
import LessonCell from './LessonCell';

/* ────────────────────────────────────────────────────────────
  재사용 테이블 컴포넌트
──────────────────────────────────────────────────────────── */
export interface LessonTableProps {
  /** 셀 클릭 공통 핸들러 (cell.onClick이 있으면 우선 적용) */
  // onCellClick?: (cell: LessonCellData, period: number, dayIndex: number) => void;
  /** 현재 선택된 셀 (하이라이트를 위해) */
  // selectedCell?: { period: number; dayIndex: number } | null;
  className?: string;
  selectedTeacherId?: string;  // 필요 시 선택된 교사 ID도 전달 가능
  weekRange?: WeekRange | null;
  selectedDailyLesson?: Core.DailyLesson | null;
  sourceDailyLesson?: Core.DailyLesson | null;
  targetDailyLesson?: Core.DailyLesson | null;
  dailyLessons?: Core.DailyLesson[];  // 필요 시 일일 수업 데이터도 전달 가능
  onCellClick?: (period: number, dayIndex: number, dailyLesson?: Core.DailyLesson | null) => void;
  // sizeMode?: 'default' | 'compact';
  // isHorizontalScrollable?: boolean;
  // lessonColumnWidthMode?: 'fixed-62' | 'fit-five';
  // scrollContentInsetX?: number;
  // fitContentWidth?: boolean;
  isDisablePastDay?: boolean;
}

export function LessonTable({
  onCellClick,
  // selectedCell,
  className,
  selectedTeacherId,
  dailyLessons,
  weekRange,
  selectedDailyLesson,
  sourceDailyLesson,
  targetDailyLesson,
  // sizeMode = 'default',
  // isHorizontalScrollable = false,
  // lessonColumnWidthMode = 'fixed-62',
  // scrollContentInsetX = 0,
  // fitContentWidth = false,
  isDisablePastDay = true,
}: LessonTableProps) {
  // 오늘 날짜 숫자 (YYYYMMDD 형태)
  const todayNumber = useMemo(() => TimeUtils.getTodayAsNumber(), []);
  const [maxPeriod, setMaxPeriod] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number | null>(1);
  const [activatedClassDays, setActivatedClassDays] = useState<ActivateWeekday[]>([]);

  // 컨테이너 실제 너비를 ResizeObserver로 측정 (100vw 대신 사용 → iOS 안전)
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const timetableConfig = useGradeContext();

  const dailyLessonsOfWeek = useMemo(() => {
    if (!dailyLessons || !weekRange) {
      return [];
    }

    const range = withWeekRange(weekRange);
    return dailyLessons.filter(lesson => range.contain(lesson.lessonDate));
  }, [dailyLessons, weekRange]);

  const filteredLessons = useMemo(() => {
    if (!selectedTeacherId) return [];

    const lessons = dailyLessonsOfWeek.filter((lesson) => {
      return lesson.lessonTeacherIds && lesson.lessonTeacherIds.includes(selectedTeacherId);
    });

    if (targetDailyLesson) {
      // targetDailyLesson은, 아직 수업 목록에 존재하지 않는 수업이므로 별도로 추가해줘야 함
      lessons.push(targetDailyLesson);
    }

    return lessons;
  }, [dailyLessonsOfWeek, selectedTeacherId, targetDailyLesson]);

  const lessonDays = useMemo(() => {
    if (!weekRange || activatedClassDays.length === 0) {
      return [];
    }

    const { startDate, endDate } = weekRange;

    const lessonDays = TimeUtils.generateLessonDaysWithRange(startDate, endDate);
    return lessonDays.filter((lessonDay: LessonDay) =>
      activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
    );
  }, [weekRange, activatedClassDays]);

  const readableDate = (date: number) => {
    const dateStr = date.toString();
    const month = dateStr.slice(4, 6).replace(/^0/, ''); // 0으로 시작하는 월 제거
    const day = dateStr.slice(6, 8).replace(/^0/, '');   // 0으로 시작하는 일 제거
    return `${month}월 ${day}일`;
  };

  const readableDayOfWeek = (dayOfWeek: number) => {
    const dayInfo = DAYS_OF_WEEK.find((day) => day.index === dayOfWeek);
    return dayInfo ? dayInfo.title : '';
  }

  const adjustDisplayedPeriod = (periodIndex: number) => {
    return periodIndex + (startPeriod !== null ? startPeriod : 1);
  };

  const dailyLessonOfCell = (lessonDate: number, period: number) => {
    return filteredLessons.find(lesson => lesson.lessonDate === lessonDate && lesson.period === period);
  };

  useEffect(() => {
    if (!timetableConfig) {
      return;
    }

    setMaxPeriod(timetableConfig?.maxPeriod || 7);
    setStartPeriod(timetableConfig?.startPeriod ?? 1);
    setActivatedClassDays(
      timetableConfig?.classDays
        .map((isActive: ClassDayStatus, index: number) => ({
          dayOfWeek: index,
          title: DAYS_OF_WEEK.find((day) => day.index === index)?.title || '',
          isActive: isActive === ClassDayStatus.ACTIVATED,
        }))
        .filter((day: ActivateWeekday) => day.isActive)
    );

  }, [timetableConfig]);

  const handleCellClick = (lessonDate: number, period: number) => {
    const clickedDailyLesson = dailyLessonOfCell(lessonDate, period);
    onCellClick && onCellClick(lessonDate, period, clickedDailyLesson);
  };

  // const periodColumnClassName = useMemo(() => {
  //   return 'w-[18px] min-w-[18px]';
  // }, []);

  // const lessonColumnClassName = useMemo(() => {
  //   // if (lessonColumnWidthMode === 'fit-five') {
  //   //   return 'w-[calc((100vw-50px)/5)] min-w-[calc((100vw-50px)/5)]';
  //   // }

  //   return sizeMode === 'compact' ? 'w-[62px] min-w-[62px]' : 'w-13 min-w-13';
  // }, [lessonColumnWidthMode, sizeMode]);

  // const periodHeaderClassName = useMemo(() => {
  //     return clsx(
  //       'h-[52px] w-[18px] border-b border-border-neutral-base',
  //       // isHorizontalScrollable && 'sticky left-0 z-20 bg-bg-base'
  //     );
  //   }, [isHorizontalScrollable]);
  
  // const periodCellClassName = useMemo(() => {
  //     return clsx(
  //       'h-[52px] w-[18px] border-b border-border-neutral-base text-center align-middle',
  //       // isHorizontalScrollable && 'sticky left-0 z-10 bg-bg-base'
  //     );
  //   }, [isHorizontalScrollable]);
  
    // const stickyPeriodStyle = useMemo(() => {
    //   if (!isHorizontalScrollable) {
    //     return undefined;
    //   }
  
    //   return {
    //     left: `${scrollContentInsetX}px`,
    //   };
    // }, [isHorizontalScrollable, scrollContentInsetX]);

  // const tableStyle = useMemo(() => {
  //   if (!fitContentWidth || lessonColumnWidthMode !== 'fit-five') {
  //     return undefined;
  //   }

  //   return {
  //     width: `calc(18px + ((100vw - 50px) / 5 * ${lessonDays.length}))`,
  //   };
  // }, [fitContentWidth, lessonColumnWidthMode, lessonDays.length]);

  // 교시열(48px)을 뺀 나머지를 5등분한 칼럼 너비 (픽셀)
  const lessonColWidth = containerWidth > 0 ? Math.floor((containerWidth - 20) / 5) : null;
  // 6개 이상이면 가로 스크롤, 5개 이하면 테이블이 화면 100%에 꽉 참
  const needsScroll = lessonDays.length > 5;

  return (
    <div ref={containerRef} className={clsx('overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      'overscroll-behavior-x-none overscroll-behavior-y-auto', // 수직 스크롤은 부모로 전달
      'touch-action-pan-x touch-action-pan-y', // 부모 수평/수직 스크롤 모두 가능하도록
      className)}>
      <table className={clsx('border-separate border-spacing-0 table-fixed', needsScroll ? 'w-max' : 'w-full')}>
        <colgroup>
          <col className="w-5 min-w-5" />
          {/* 교시 열(48px) 제외한 나머지를 5등분 → 5개까지 화면에 꽉 참, 6개 이상이면 자동 스크롤 */}
          {lessonDays.map((d) => (
            // lessonColWidth: ResizeObserver로 측정한 실제 container 너비 기반 (100vw 불필요, iOS 포함 안전)
            <col
              key={d.lessonDate}
              style={lessonColWidth ? { width: `${lessonColWidth}px`, minWidth: `${lessonColWidth}px` } : undefined}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {/* 교시 열 헤더 — 가로 스크롤 시 고정 */}
            <th className='sticky left-0 z-10 bg-bg-base h-[52px] border-b border-border-neutral-base' />

            {/* 요일 헤더 */}
            {lessonDays.map((d, idx) => ( //(headers.map(({ day, date }) => (
              <th
                key={`day-header-${d.lessonDate}`}
                className="border-b border-border-neutral-base text-center align-middle"
              >
                <span className="block text-leading-d2 text-text-neutral-base">{readableDate(d.lessonDate)}</span>
                <span className="block text-leading-b3 font-semibold text-text-primary-base">{readableDayOfWeek(d.dayOfWeek)}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {maxPeriod && Array.from({ length: maxPeriod }).map((_, periodIdx) => (
            // rows.map((row) => (
            <tr key={`period-row-${periodIdx}`}>
              {/* 교시 셀 — 가로 스크롤 시 고정 */}
              <td className="sticky left-0 z-10 bg-bg-base h-[52px] border-b border-border-neutral-base text-center align-middle">
                <span className="block text-leading-d1 text-text-neutral-strong">{adjustDisplayedPeriod(periodIdx)}</span>
                { /* 교사 시간표에서는 시간표시가 불가능: 학년별 시간 설정이 다름 
                      row.time ? (
                        <span className="block text-leading-d2 text-text-caption whitespace-nowrap">({row.time})</span>
                      ) : null */}
              </td>

              {/* 과목 셀 */}
              {lessonDays.map((d, dayIdx) => (
                <LessonCell
                  key={`lesson-cell-${d.lessonDate}-${periodIdx}`}
                  onClick={() => handleCellClick(d.lessonDate, periodIdx + 1)}
                  dailyLesson={dailyLessonOfCell(d.lessonDate, periodIdx + 1)}
                  selectedDailyLesson={selectedDailyLesson}
                  sourceDailyLesson={sourceDailyLesson}
                  targetDailyLesson={targetDailyLesson}
                  shouldDisabled={isDisablePastDay && d.lessonDate < todayNumber}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
