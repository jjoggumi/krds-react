import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { ActivateWeekday, Core, LessonDay, WeekRange, withWeekRange } from '../../types';
import { useGradeContext } from '../../context';
import { ClassDayStatus, DAYS_OF_WEEK } from '../../constants';
import { TimeUtils } from '../../utils';
import LessonCell, { CellSelectableMode } from '../cell/LessonCell';

/* ────────────────────────────────────────────────────────────
  결보강 신청 테이블 컴포넌트
──────────────────────────────────────────────────────────── */
export interface LessonTableProps {
  className?: string;
  selectedTeacherId?: string;  // 필요 시 선택된 교사 ID도 전달 가능
  weekRange?: WeekRange | null;
  selectedDailyLesson?: Core.DailyLesson | null;
  sourceDailyLesson?: Core.DailyLesson | null;
  targetDailyLesson?: Core.DailyLesson | null;
  dailyLessons?: Core.DailyLesson[];  // 필요 시 일일 수업 데이터도 전달 가능
  onCellClick?: ( period: number, dayIndex: number, dailyLesson?: Core.DailyLesson | null) => void;
  selectableMode?: CellSelectableMode;
  lessonColumnWidthMode?: 'fixed-62' | 'fit-five';
  scrollContentInsetX?: number;
  fitContentWidth?: boolean;
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
  selectableMode = 'enabled',
  lessonColumnWidthMode = 'fit-five',
  scrollContentInsetX = 0,
  fitContentWidth = false,
  isDisablePastDay = true,
}: LessonTableProps) {

  const [maxPeriod, setMaxPeriod] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number | null>(1);
  const [activatedClassDays, setActivatedClassDays] = useState<ActivateWeekday[]>([]);

  const timetableConfig = useGradeContext();
  // 오늘 날짜 숫자 (YYYYMMDD 형태)
  const todayNumber = useMemo(() => TimeUtils.getTodayAsNumber(), []);
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

    if(targetDailyLesson) {
      // targetDailyLesson은, 아직 수업 목록에 존재하지 않는 수업이므로 별도로 추가해줘야 함
      const hasTargetLesson = lessons.some((lesson) =>
        lesson.lessonDate === targetDailyLesson.lessonDate &&
        lesson.period === targetDailyLesson.period &&
        lesson.dailyLessonId === targetDailyLesson.dailyLessonId
      );

      if (!hasTargetLesson) {
        lessons.push(targetDailyLesson);
      }
    }

    return lessons;
  }, [dailyLessonsOfWeek, selectedTeacherId, sourceDailyLesson, targetDailyLesson]);

  const lessonDays = useMemo(() => {
    if(!weekRange || activatedClassDays.length === 0) {
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

  const periodColumnClassName = useMemo(() => {
    return 'w-[18px] min-w-[18px]';
  }, []);

  const lessonColumnClassName = useMemo(() => {
    if (lessonColumnWidthMode === 'fit-five') {
      return 'w-[calc((100vw-50px)/5)] min-w-[calc((100vw-50px)/5)]';
    }

    return 'w-13 min-w-13';
  }, [lessonColumnWidthMode]);

  const stickyPeriodStyle = useMemo(() => {
    return {
      left: `${scrollContentInsetX}px`,
    };
  }, [scrollContentInsetX]);

  const tableStyle = useMemo(() => {
    if (!fitContentWidth || lessonColumnWidthMode !== 'fit-five') {
      return undefined;
    }

    return {
      width: `calc(18px + ((100vw - 50px) / 5 * ${lessonDays.length}))`,
    };
  }, [fitContentWidth, lessonColumnWidthMode, lessonDays.length]);

  const tableElement = (
    <table className={clsx(
      'border-separate border-spacing-0 table-fixed',
      fitContentWidth ? 'w-max min-w-full' : 'w-full'
    )} style={tableStyle}>
          <colgroup>
            <col className={periodColumnClassName} />
            {lessonDays.map(() => (
              <col key={Math.random()} className={lessonColumnClassName}/>
            ))}
          </colgroup>
          <thead>
              <tr>
                {/* 교시 열 헤더 */}
                <th className='h-[52px] w-[18px] border-b border-border-neutral-base sticky left-0 z-20 bg-bg-base'
                  style={stickyPeriodStyle} />

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
                    {/* 교시 셀 */}
                    <td className='h-[52px] w-[18px] border-b border-border-neutral-base text-center align-middle sticky left-0 z-10 bg-bg-base'
                       style={stickyPeriodStyle}>
                      <span className="block text-leading-d1 text-text-neutral-strong">{adjustDisplayedPeriod(periodIdx)}</span>
                      { /* 교사 시간표에서는 시간표시가 불가능: 학년별 시간 설정이 다름 
                      row.time ? (
                        <span className="block text-leading-d2 text-caption whitespace-nowrap">({row.time})</span>
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
                        selectableMode={selectableMode}
                        shouldDisabled={isDisablePastDay && d.lessonDate < todayNumber}
                        isConcurrentSelectable={true}
                        />
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
  );

  return (
    <div className={clsx(
      'overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      className
    )}>
      {scrollContentInsetX > 0 ? (
        <div
          className="inline-block min-w-full"
          style={{ paddingInline: `${scrollContentInsetX}px` }}
        >
          {tableElement}
        </div>
      ) : (
        tableElement
      )}
    </div>
  );
}
