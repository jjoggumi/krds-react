import clsx from 'clsx';
import { use, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ActivateWeekday, Core, LessonDay, WeekRange, withWeekRange } from '../../types';
import { TimetableClassContext, TimetableCourseContext, useClassContext, useCourseContext, useGradeContext } from '../../context';
import { ClassDayStatus, DAYS_OF_WEEK } from '../../constants';
import { off } from 'process';
import { TimetableDisplayUtils, TimeUtils } from '../../utils';

export type CellType = 'default' | 'selected' | 'before' | 'after' | 'disabled' | 'lessonChange';


export const CELL_TYPE_BG: Record<CellType, string> = {
  default:  'bg-bg-base',
  selected: 'bg-bg-primary-subtlest',  // 선택
  before:   'bg-bg-red-subtlest',  // 변경 전
  after:    'bg-bg-yellow-subtler',   // 변경 후 
  disabled: 'bg-bg-neutral-subtlest',  // 선택 불가
  lessonChange: 'bg-bg-yellow-subtler',  // 변경 수업
};

const CELL_CLASS_NO_TEXT: Record<CellType, string> = {
  default:  '',
  selected: '',
  before:   '!text-text-neutral-base',
  after:    '',
  disabled: '!text-text-neutral-base',
  lessonChange: '',
};

const CELL_SUBJECT_TEXT: Record<CellType, string> = {
  default:  '',
  selected: '',
  before:   '!text-text-neutral-base',
  after:    '',
  disabled: '!text-text-neutral-base',
  lessonChange: '',
};

/* ────────────────────────────────────────────────────────────
  내부 셀 컴포넌트  →  <td>
──────────────────────────────────────────────────────────── */
interface LessonCellProps {    
  dailyLesson?: Core.DailyLesson;  
  onClick?: () => void;
  selectedDailyLesson?: Core.DailyLesson | null;
  sourceDailyLesson?: Core.DailyLesson | null;
  targetDailyLesson?: Core.DailyLesson | null;
  lessonDate?: number;
  period?: number;
  shouldDisabled?: boolean;
  /* 퍼블 코드: 삭제 예정 */
  // cell?: LessonCellData | null;  
  // dayIndex?: number;  
  // selectedCell?: { period: number; dayIndex: number } | null;
  // onCellClick?: (cell: LessonCellData, period: number, dayIndex: number) => void;
}

function LessonCell({ 
  dailyLesson,
  onClick,
  selectedDailyLesson,
  sourceDailyLesson,
  targetDailyLesson,
  lessonDate,
  period,
  shouldDisabled = false,
}: LessonCellProps) {
  const classes = useClassContext();
  const classContext = TimetableClassContext.getInstance();

  const courses = useCourseContext();
  const courseContext = TimetableCourseContext.getInstance();
  
  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Core.Class>),
    [classes]
  );

  const courseMap = useMemo(
    () => courseContext.courseMap || ({} as Record<string, Core.Course>),
    [courses]
  );

  /*
  const baseType = cell?.type ?? 'default';
  const isSelected = !!(selectedCell && selectedCell.period === period && selectedCell.dayIndex === dayIndex);
  const type = isSelected ? 'selected' : baseType;
  
  const handler = cell ? ((e: MouseEvent<HTMLTableCellElement>) => {
    if (cell.onClick) return cell.onClick(cell, period, dayIndex);
    if (onCellClick) return onCellClick(cell, period, dayIndex);
    return undefined;
  }) : undefined;
  const isClickable = !!handler;
   */

  const isSelected = useMemo(() => {
    if (!dailyLesson || !selectedDailyLesson) {
      return false;
    }

    return dailyLesson.dailyLessonId === selectedDailyLesson.dailyLessonId;
    // return !!(selectedCell && selectedCell.period === dailyLesson?.period && selectedCell.dayIndex === dailyLesson?.dayOfWeek);
  }, [dailyLesson, selectedDailyLesson]);
  
  const cellType = useMemo<CellType>(() => {
    if (shouldDisabled) {
      return 'disabled';
    }
    // sourceDailyLesson, targetDailyLesson이 모두 있는 경우, seelected 무시
    if (!sourceDailyLesson && !targetDailyLesson && isSelected) {
      return 'selected';
    }

    if(sourceDailyLesson && dailyLesson?.dailyLessonId === sourceDailyLesson.dailyLessonId) {
      return 'before';
    }

    if(targetDailyLesson && 
      dailyLesson?.lessonDate === targetDailyLesson.lessonDate &&
      dailyLesson?.period === targetDailyLesson.period
    ) {
      return 'after';
    }
    
    if (!dailyLesson) {
      return 'default';
    }


    // 선택 불가 수업(오늘 이전 수업/학급일정/이미 변경된 수업/동시 수업 등)은 disabled 스타일
    const todayNum = TimeUtils.getTodayAsNumber();
    const notSelectable =
      dailyLesson.lessonDate < todayNum ||
      dailyLesson.lessonType != Core.TimetableDailyLessonType.Lesson ||
      dailyLesson.changeType != Core.TimetableDailyLessonChangeType.None ||
      !!dailyLesson.concurrentCourseId ||
      !!dailyLesson.consecutiveGroupId;

    // sourceDailyLesson, targetDailyLesson이 모두 있는 경우, notSelectable 무시
    if (!sourceDailyLesson && !targetDailyLesson && notSelectable) {
      return 'disabled';
    }

    return 'default';
  }, [isSelected, sourceDailyLesson, targetDailyLesson, dailyLesson]);

  const isNotSelectableLesson = useMemo(() => {
    if (!dailyLesson) {
      return false;
    }
    
    return dailyLesson?.lessonType != Core.TimetableDailyLessonType.Lesson || // 수업이 아닌 경우 (학급일정)
      dailyLesson?.changeType != Core.TimetableDailyLessonChangeType.None || // 이미 변경 수업
      dailyLesson?.concurrentCourseId || // 동시 수업인 경우 (수업 교체만 해당...)
      dailyLesson?.consecutiveGroupId; // 연속 수업인 경우 (수업 교체만 해당...)
  }, [dailyLesson]);


  const isClickable = useMemo(() => {
    if (shouldDisabled) { return false; }
    // 공강: 커서/hover 없음
    if (!dailyLesson) {
      return false;
    }
    if(isNotSelectableLesson) {
      return false;
    }

    return !!onClick;
  }, [shouldDisabled, dailyLesson, isNotSelectableLesson, onClick]);

  
  const className = useMemo(() => {
    if (!dailyLesson) {
      return;
    }

    if(dailyLesson.className) {
      return dailyLesson.className;
    }

    const cls = classMap[dailyLesson.classId];
    return cls ? TimetableDisplayUtils.formatFullClassName(cls) : '';
  }, [dailyLesson, classes]);

  const isEvent = useMemo(() => {
    return dailyLesson?.lessonType === Core.TimetableDailyLessonType.Event;
  }, [dailyLesson]);

  const isRemoval = useMemo(() => {
    return dailyLesson?.changeType === Core.TimetableDailyLessonChangeType.Removal;
  }, [dailyLesson]);

  const courseName = useMemo(() => {
    if (!dailyLesson) {
      return;
    }

    // 삭제
    if(isRemoval) {
      return '수업 없음';
    }

    if(isEvent) {
      return dailyLesson.eventName || '';
    }

    if(dailyLesson.courseName) {
      return dailyLesson.courseName;
    }

    const course = courseMap[dailyLesson.courseId];
    return course ? course.displayedTitle : '';
  }, [dailyLesson, courses, isEvent, isRemoval]);

  const handleClick = () => {
    if(isNotSelectableLesson) {
      return;
    }
    if (cellType === 'disabled') { return; }
    onClick && onClick();
  }

  const tdCtx = useMemo(() => {
    return clsx(
      'border-b border-border-neutral-base',
      CELL_TYPE_BG[cellType],
      isClickable && 'cursor-pointer hover:bg-bg-primary-subtlest active:bg-bg-primary-subtlest',
    );
  }, [cellType, isClickable]);

  const classNameCtx = useMemo(() => {
    return clsx(
      'text-leading-d2 text-text-neutral-strong',
      CELL_CLASS_NO_TEXT[cellType]
    );
  }, [cellType]);

  const courseNameCtx = useMemo(() => {
    return clsx(
      'text-leading-d1',
      CELL_SUBJECT_TEXT[cellType]
    );
  }, [cellType]);

  return (
    <td key={`cell-${lessonDate}-${period}-${cellType}`}
        className={tdCtx}
        onClick={handleClick}
    >
      {dailyLesson && (
        <div className="flex flex-col items-center justify-center h-full">
            {!isEvent && !isRemoval && (
              <span className={classNameCtx}>
                {className}
              </span>
            )}
            <span className={courseNameCtx}>
              {courseName}
            </span>            
        </div>
      )}
      {/* cell && (
        <div className="flex flex-col items-center justify-center h-full">
            <span className={clsx('text-leading-d2 text-caption', CELL_CLASS_NO_TEXT[type])}>
              {cell.classNo}
            </span>
            <span className={clsx('text-leading-d1', CELL_SUBJECT_TEXT[type])}>
              {cell.subject}
            </span>
        </div>
      )*/}
    </td>
  );
}

export default LessonCell;
