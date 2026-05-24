import clsx from 'clsx';
import { useMemo } from 'react';
import { Core } from '../../types';
import { TimetableClassContext, TimetableCourseContext, TimetableTeacherContext, useClassContext, useCourseContext, useTeacherContext } from '../../context';
import { TimetableDisplayUtils } from '../../utils';

export type CellType = 'default' | 'selected' | 'before' | 'after' | 'disabled' | 'lessonChange';

/**
 * 선택 가능한 셀 범위 모드
 * - 'empty': 빈 셀만 선택 가능
 * - 'none': 셀 선택 불가
 * - 'enabled': 활성화된 모든 셀 선택 가능
 * - 'all' : 모든 셀 선택 가능 (비활성화된 셀도 포함)
 */
export type CellSelectableMode = 'empty' | 'none' | 'enabled' | 'all';

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
  selectableMode?: CellSelectableMode;
  /** 교사용 테이블 여부 (수업에서 teacherId 사용) */
  isTeacherTable?: boolean; 
  /** 반드시 비활성화할지 여부 */
  shouldDisabled?: boolean;
  /** 수업은 없지만, 선택된 상태로 표시할지 여부 */
  isEmptySelected?: boolean;
  /** 동시 수업 선택 가능 여부 (결,보강 시 활용) */
  isConcurrentSelectable?: boolean;
}

function LessonCell({ 
  dailyLesson,
  onClick,
  selectedDailyLesson,
  sourceDailyLesson,
  targetDailyLesson,
  selectableMode = 'none',
  isTeacherTable = true,
  shouldDisabled = false,
  isEmptySelected = false,
  isConcurrentSelectable = false,
}: LessonCellProps) {
  const classes = useClassContext();
  const classContext = TimetableClassContext.getInstance();
  const courses = useCourseContext();
  const courseContext = TimetableCourseContext.getInstance();
  const teachers = useTeacherContext();
  const teacherContext = TimetableTeacherContext.getInstance();
  
  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Core.Class>),
    [classes]
  );

  const courseMap = useMemo(
    () => courseContext.courseMap || ({} as Record<string, Core.Course>),
    [courses]
  );
  
  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Core.Teacher>),
    [teachers]
  );

  const isSelected = useMemo(() => {
    if (!dailyLesson || !selectedDailyLesson) {
      return false;
    }

    return dailyLesson.dailyLessonId === selectedDailyLesson.dailyLessonId;
    // return !!(selectedCell && selectedCell.period === dailyLesson?.period && selectedCell.dayIndex === dailyLesson?.dayOfWeek);
  }, [dailyLesson, selectedDailyLesson]);
  
  const isNotSelectableLesson = useMemo(() => {
    if (selectableMode === 'empty') {
      return !!dailyLesson;
    }

    if (!dailyLesson) {
      return false;
    }
    
    let changeType = dailyLesson.changeType;
    // 변경 수업이긴하나, targetDailyLesson과 요일,교시가 동일하면 비활성 상태가 아니여야 함.
    // 수업 교체의 경우, 수업 정보들이 EXCHANGE 타입으로 내려옴.
    if (dailyLesson.changeType != Core.TimetableDailyLessonChangeType.None
      && targetDailyLesson?.dayOfWeek === dailyLesson.dayOfWeek
      && targetDailyLesson?.period === dailyLesson.period
    ) {
      changeType = Core.TimetableDailyLessonChangeType.None;
    }
    // 선택 불가 수업(학급일정/이미 변경된 수업/동시 수업 등)은 disabled 스타일
    let notSelectable = dailyLesson.lessonType != Core.TimetableDailyLessonType.Lesson || changeType != Core.TimetableDailyLessonChangeType.None;
    if (!isConcurrentSelectable && dailyLesson.concurrentCourseId) {
      notSelectable = true;
    }

    return notSelectable;
  }, [dailyLesson, selectableMode, targetDailyLesson, isConcurrentSelectable]);

  /** 셀 스타일 결정 */
  const cellType = useMemo<CellType>(() => {
    if (shouldDisabled) {
      return 'disabled';
    }
    if (selectableMode === 'empty' && dailyLesson) {
      return 'disabled';
    }
    // sourceDailyLesson, targetDailyLesson이 모두 있는 경우, seelected 무시
    if (!sourceDailyLesson && !targetDailyLesson && isSelected) {
      return 'selected';
    }
    // sourceDailyLesson 의 날짜, 교시가 일치한 경우 → 변경 전 스타일
    if (sourceDailyLesson 
        && dailyLesson?.lessonDate === sourceDailyLesson.lessonDate
        && dailyLesson?.period === sourceDailyLesson.period) {
      return 'before';
    }
    // targetDailyLesson 의 날짜, 교시가 일치한 경우 → 변경 후 스타일
    if(targetDailyLesson 
      && dailyLesson?.lessonDate === targetDailyLesson.lessonDate 
      && dailyLesson?.period === targetDailyLesson.period
    ) {
      return 'after';
    }
    
    if (!dailyLesson) {
      // return 'default';
      return isEmptySelected ? 'selected' : 'default';
    }
    
    // 선택 불가 수업은 disabled 스타일
    if (isNotSelectableLesson) {
      return 'disabled';
    }

    return 'default';
  }, [isSelected, sourceDailyLesson, targetDailyLesson, dailyLesson, selectableMode, isEmptySelected, isNotSelectableLesson]);


  const isClickable = useMemo(() => {
    if (shouldDisabled || selectableMode === 'none') { return false; }
    if(isNotSelectableLesson) {
      return false;
    }

    return !!onClick;
  }, [shouldDisabled, isNotSelectableLesson, onClick]);
  
  const className = useMemo(() => {
    if (!dailyLesson) {
      return;
    }

    if (dailyLesson.lessonType === Core.TimetableDailyLessonType.Event) {
      return '';
    }

    if(dailyLesson.className) {
      return dailyLesson.className;
    }

    const cls = classMap[dailyLesson.classId];
    return cls ? TimetableDisplayUtils.formatFullClassName(cls) : '';
  }, [dailyLesson, classes]);

  const courseName = useMemo(() => {
    if (!dailyLesson) {
      return;
    }

    if(dailyLesson.courseName) {
      if (dailyLesson.lessonType === Core.TimetableDailyLessonType.Event) {
        return dailyLesson.eventName || dailyLesson.courseName;
      }
      return dailyLesson.courseName;
    }

    const course = courseMap[dailyLesson.courseId];
    return course ? course.displayedTitle : '';
  }, [dailyLesson, courses, courseMap]);

  const teacherName = useMemo(() => {
    if (!dailyLesson) {
      return;
    }
    if (dailyLesson.lessonType === Core.TimetableDailyLessonType.Event) {
      return '';
    }
    if (dailyLesson.teacherName) {
      return dailyLesson.teacherName.slice(0, 2); // 선생님 이름 앞 2글자만 표시
    }

    if (dailyLesson.lessonTeacherIds && dailyLesson.lessonTeacherIds.length > 0) {
      const teacherNames = dailyLesson.lessonTeacherIds
        .map(id => teacherMap[id]?.teacherName || '')
        .filter(Boolean)
        .map(name => name.slice(0, 2)); // 선생님 이름 앞 2글자만 표시
      return teacherNames.join(', ');
    }
    return '';

  }, [dailyLesson, courses, teacherMap]);

  const handleClick = () => {
    console.debug('LessonCell clicked', { dailyLesson, cellType, isClickable });
    if (!isClickable) {
      return;
    }
    onClick && onClick();
  };

  const tdCtx = useMemo(() => {
    return clsx(
      'border-b border-border-neutral-base',
      CELL_TYPE_BG[cellType],
      isClickable && 'cursor-pointer hover:bg-bg-primary-subtlest active:bg-bg-primary-subtlest',
    );
  }, [cellType, isClickable]);

  const classNameCtx = useMemo(() => {
    return clsx(
      'block w-full overflow-hidden text-ellipsis whitespace-nowrap text-leading-d2 text-text-neutral-strong',
      CELL_CLASS_NO_TEXT[cellType],
      isSelected && 'font-semibold'
    );
  }, [cellType, isSelected]);

  const courseNameCtx = useMemo(() => {
    return clsx(
      'block w-full overflow-hidden text-ellipsis whitespace-nowrap text-leading-d1',
      CELL_SUBJECT_TEXT[cellType],
      isSelected && 'font-semibold'
    );
  }, [cellType, isSelected]);

  return (
    <td className={tdCtx} onClick={handleClick}>
      {dailyLesson && (
        <div className='flex h-full w-full min-w-0 flex-col items-center justify-center px-1 text-center'>
            {isTeacherTable && className && (<span className={classNameCtx}>
              {className}
            </span>)}
            <span className={courseNameCtx}>
              {courseName}
            </span>
            {!isTeacherTable && courseName && teacherName && (
              <span className={classNameCtx}>
                {teacherName}
              </span>
            )}
        </div>
      )}
    </td>
  );
}

export default LessonCell;
