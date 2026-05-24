import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { ActivateWeekday, Core, LessonDay, WeekRange, withWeekRange } from '../../types';
import { ClassDayStatus, DAYS_OF_WEEK } from '../../constants';
import { TimeUtils } from '../../utils';
import LessonCell from './LessonCell';

/* ────────────────────────────────────────────────────────────
  변경 이력 상세 테이블 컴포넌트
──────────────────────────────────────────────────────────── */
export interface LessonTableProps {
  isTeacherTable: boolean;  // 교사용 테이블 여부
  /** 필수 시간표 설정 주입 */
  timetableConfig:  Core.TimetableConfig;
  /** css class name */
  className?: string;
  dailyLessons?: Core.DailyLesson[];  // 필요 시 일일 수업 데이터도 전달 가능
  weekRange?: WeekRange | null;
  sourceDailyLesson?: Core.DailyLesson | null;
  targetDailyLesson?: Core.DailyLesson | null;
  // selectedDailyLesson?: Core.DailyLesson | null;
  selectedTeacherId?: string;  // 필요 시 선택된 교사 ID도 전달 가능
  isHorizontalScrollable?: boolean;
  includeWeekendDays?: boolean;
  lessonColumnWidthMode?: 'fixed-62' | 'fit-five';
  scrollContentInsetX?: number;
  isStickyPeriod?: boolean;
  hidePeriodColumn?: boolean;
  fitContentWidth?: boolean;
  onCellClick?: ( period: number, dayIndex: number, dailyLesson?: Core.DailyLesson | null) => void;
}

export function LessonTable({ 
  isTeacherTable,
  timetableConfig,
  className,
  dailyLessons,
  weekRange,
  sourceDailyLesson,
  targetDailyLesson,
  // selectedDailyLesson,
  selectedTeacherId,
  isHorizontalScrollable = false,
  includeWeekendDays = false,
  lessonColumnWidthMode = 'fit-five',
  scrollContentInsetX = 0,
  isStickyPeriod = false,
  hidePeriodColumn = false,
  fitContentWidth = false,
  onCellClick,
}: LessonTableProps) {

  // const [maxPeriod, setMaxPeriod] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number | null>(null);
  /** 설정에서 수업있는 요일 */
  const [activatedClassDays, setActivatedClassDays] = useState<ActivateWeekday[]>([]);

  // const timetableConfig = useGradeContext();

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
      if (isTeacherTable) {
        return lesson.lessonTeacherIds && lesson.lessonTeacherIds.includes(selectedTeacherId);
      }
      return lesson.classId && lesson.classId === selectedTeacherId;
    });

    if (sourceDailyLesson && !lessons.some((lesson) => lesson.dailyLessonId === sourceDailyLesson.dailyLessonId)) {
      lessons.push(sourceDailyLesson);
    }

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
  }, [dailyLessonsOfWeek, selectedTeacherId, sourceDailyLesson, targetDailyLesson, isTeacherTable]);

  const lessonDays = useMemo(() => {
    if(!weekRange || activatedClassDays.length === 0) {
      return [];
    }

    const { startDate, endDate } = weekRange;
    
    const lessonDays = TimeUtils.generateLessonDaysWithRange(startDate, endDate);

    // if (includeWeekendDays) {
    //   return lessonDays;
    // }

    return lessonDays.filter((lessonDay: LessonDay) =>
      activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
    );
  }, [weekRange, activatedClassDays, includeWeekendDays]);

  const maxPeriod = useMemo(() => {
    const configMax = timetableConfig?.maxPeriod || 7;
    const sourceMax = sourceDailyLesson ? sourceDailyLesson.period : 0;
    const targetMax = targetDailyLesson ? targetDailyLesson.period : 0;

    return Math.max(configMax, sourceMax, targetMax);
  }, [timetableConfig, sourceDailyLesson, targetDailyLesson]);
    
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
      console.warn('시간표 설정 정보를 불러오지 못했습니다. 시간표가 올바르게 표시되지 않을 수 있습니다.');
      return;
    }
    
    // setMaxPeriod(timetableConfig?.maxPeriod || 7);
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

  // const lessonColumnClassName = useMemo(() => {
  //   if (lessonColumnWidthMode === 'fit-five') {
  //     return 'w-[calc((100vw-50px)/5)] min-w-[calc((100vw-50px)/5)]';
  //   }

  //   return sizeMode === 'compact' ? 'w-[62px] min-w-[62px]' : 'w-13 min-w-13';
  // }, [lessonColumnWidthMode, sizeMode]);

  const periodHeaderClassName = useMemo(() => {
    return clsx(
      'h-[52px] w-[18px] border-b border-border-neutral-base',
      !hidePeriodColumn && (isHorizontalScrollable || isStickyPeriod) && 'sticky left-0 z-20 bg-bg-base'
    );
  }, [hidePeriodColumn, isHorizontalScrollable, isStickyPeriod]);

  const periodCellClassName = useMemo(() => {
    return clsx(
      'h-[52px] w-[18px] border-b border-border-neutral-base text-center align-middle',
      !hidePeriodColumn && (isHorizontalScrollable || isStickyPeriod) && 'sticky left-0 z-10 bg-bg-base'
    );
  }, [hidePeriodColumn, isHorizontalScrollable, isStickyPeriod]);

  const stickyPeriodStyle = useMemo(() => {
    if (hidePeriodColumn || (!isHorizontalScrollable && !isStickyPeriod)) {
      return undefined;
    }

    return {
      left: `${scrollContentInsetX}px`,
    };
  }, [hidePeriodColumn, isHorizontalScrollable, isStickyPeriod, scrollContentInsetX]);

  const tableStyle = useMemo(() => {
    if (!fitContentWidth || lessonColumnWidthMode !== 'fit-five') {
      return undefined;
    }

    const periodWidth = hidePeriodColumn ? 0 : 18;

    return {
      width: `calc(${periodWidth}px + ((100vw - 50px) / 5 * ${lessonDays.length}))`,
    };
  }, [fitContentWidth, hidePeriodColumn, lessonColumnWidthMode, lessonDays.length]);

  const tableElement = (
    <table className={clsx(
      'border-separate border-spacing-0 table-fixed',
      isHorizontalScrollable || fitContentWidth ? 'w-max min-w-full' : 'w-full'
    )} style={tableStyle}>
          <colgroup>
            {!hidePeriodColumn && <col className={periodColumnClassName} />}
            {lessonDays.map(() => (
              <col key={Math.random()} className="w-[calc((100vw-50px)/5)] min-w-[calc((100vw-50px)/5)]"/>
            ))}
          </colgroup>
          <thead>
              <tr>
                {/* 교시 열 헤더 */}
                {!hidePeriodColumn && <th className={periodHeaderClassName} style={stickyPeriodStyle} />}

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
                    {!hidePeriodColumn && (
                      <td className={periodCellClassName} style={stickyPeriodStyle}>
                        <span className="block text-leading-d1 text-text-neutral-strong">{adjustDisplayedPeriod(periodIdx)}</span>
                        { /* 교사 시간표에서는 시간표시가 불가능: 학년별 시간 설정이 다름 
                        row.time ? (
                          <span className="block text-leading-d2 text-caption whitespace-nowrap">({row.time})</span>
                        ) : null */}
                      </td>
                    )}

                    {/* 과목 셀 */}
                    {lessonDays.map((d, dayIdx) => (                      
                      <LessonCell
                        key={`lesson-cell-${d.lessonDate}-${periodIdx}`} 
                        isTeacherTable={isTeacherTable}
                        onClick={() => handleCellClick(d.lessonDate, periodIdx + 1)}
                        dailyLesson={dailyLessonOfCell(d.lessonDate, periodIdx + 1)}
                        // selectedDailyLesson={selectedDailyLesson}
                        sourceDailyLesson={sourceDailyLesson}
                        targetDailyLesson={targetDailyLesson}
                        />
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
  );

  return (
    <div className={clsx(
      isHorizontalScrollable
        ? 'overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
        : isStickyPeriod ? 'overflow-visible' 
        : 'overflow-hidden',
      className
    )}>
      {isHorizontalScrollable && scrollContentInsetX > 0 ? (
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
