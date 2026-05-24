import React, { useMemo } from "react";
import { Class, ConcurrentConf, Course, DailyLesson, SpecialtyRoom, Teacher, TimetableDailyLessonChangeType } from "../../core/types";
import { StringUtils, TimetableDisplayUtils } from "../../common/utils";

export interface DailyLessonButtonOption {
  isDisabled?: boolean;
  isSelected?: boolean;
  isDirectExchangeable?: boolean;
  isChainExchangeable?: boolean;
  isFirstOfConsecutive?: boolean; // 연속 수업 중 첫번째 수업인지 여부
  isHoveredConsecutive?: boolean; // 연속 수업 중 마우스 오버된 수업인지 여부
  isSourceLesson?: boolean; // 교환할 수업인지 여부
  isTargetLesson?: boolean; // 교환 대상 수업인지 여부
  isReadOnly?: boolean; // 읽기 전용 모드인지 여부
  isEmptyCellSelectable?: boolean; // 수업이 없는 셀도 선택 가능한지 여부
  isEvent?: boolean; // 행사 처리 여부
  isRemoved?: boolean; // 삭제 여부
  isDuplicated?: boolean; // 복사 여부
  isChangedLesson?: boolean; // 변경된 수업인지 여부
  isTimetableByClass?: boolean; // 학급 시간표 모드인지 여부
}

interface Props {
  dailyLesson?: DailyLesson;
  lessonDate?: number;
  period: number;
  classMap?: Record<string, Class>;
  courseMap?: Record<string, Course>;
  teacherMap?: Record<string, Teacher>;
  concurrentConfMap?: Record<string, ConcurrentConf>;
  specialtyRoomMap?: Record<string, SpecialtyRoom>;
  // selectedDailyLessonId?: string;
  option?: DailyLessonButtonOption;
  onClick?: (lesson: DailyLesson, lessonDate?: number, period?: number, option?: DailyLessonButtonOption, event?: React.MouseEvent) => void;
  onClickCancel?: (lesson: DailyLesson) => void;
  onMouseOver?: (lesson: DailyLesson) => void;
  onMouseEnter?: (lesson: DailyLesson) => void;
  onMouseLeave?: (lesson: DailyLesson) => void;
}

const UntitledLessonChangeTypes: TimetableDailyLessonChangeType[] = [
  TimetableDailyLessonChangeType.Event,
  TimetableDailyLessonChangeType.Reassignment,
  TimetableDailyLessonChangeType.Duplication,
  TimetableDailyLessonChangeType.Removal,
  TimetableDailyLessonChangeType.InternalSwap,
  TimetableDailyLessonChangeType.ExternalSwap,
  TimetableDailyLessonChangeType.None,
];

const LessonChangeTypeTitles: Record<TimetableDailyLessonChangeType, string> = {
  [TimetableDailyLessonChangeType.Exchange]: '교체',
  [TimetableDailyLessonChangeType.Adjustment]: '보강',
  [TimetableDailyLessonChangeType.Replacement]: '변경',
  [TimetableDailyLessonChangeType.Addition]: '추가',
  [TimetableDailyLessonChangeType.Combination]: '합반',
  [TimetableDailyLessonChangeType.Multiple]: '복수',
  [TimetableDailyLessonChangeType.Event]: '행사처리',
  [TimetableDailyLessonChangeType.Reassignment]: '이동',
  [TimetableDailyLessonChangeType.Duplication]: '복사',
  [TimetableDailyLessonChangeType.Removal]: '삭제',
  [TimetableDailyLessonChangeType.InternalSwap]: '교환(동일학급)',
  [TimetableDailyLessonChangeType.ExternalSwap]: '교환(다른학급)',
  [TimetableDailyLessonChangeType.None]: '',
};

const DailyLessonButton: React.FC<Props> = ({
  dailyLesson,
  lessonDate,
  period,
  classMap,
  courseMap,
  teacherMap,
  specialtyRoomMap,
  concurrentConfMap,
  option,
  onClick = () => {},
  onClickCancel = () => {},
  onMouseEnter = () => {},
  onMouseOver = () => {},
  onMouseLeave = () => {}
}) => {
  const isDisabledOption = option?.isDisabled || false;
  const isSelectedOption = option?.isSelected || false;
  const isDirectExchangeableOption = option?.isDirectExchangeable || false;
  const isChainExchangeableOption = option?.isChainExchangeable || false;
  const isFirstOfConsecutiveOption = option?.isFirstOfConsecutive || false;
  const isHoveredConsecutiveOption = option?.isHoveredConsecutive || false;
  const isSourceLessonOption = option?.isSourceLesson || false;
  const isTargetLessonOption = option?.isTargetLesson || false;
  const isReadOnlyOption = option?.isReadOnly || false;
  const isEmptyCellSelectableOption = option?.isEmptyCellSelectable || false;
  const isEventOption = option?.isEvent || false;
  const isRemovedOption = option?.isRemoved || false;
  const isDuplicatedOption = option?.isDuplicated || false;
  const isChangedLessonOption = option?.isChangedLesson || false;
  const isTimetableByClassOption = option?.isTimetableByClass || false;

  const handleClick = (e?: React.MouseEvent) => {
    if(isShowCancelButton) {
      onClickCancel && dailyLesson && onClickCancel(dailyLesson);
      return;
    }

    !isClickDisabled && 
    onClick && 
    onClick(dailyLesson, lessonDate, period, option, e);
  };

  const handleClickCancel = () => {
    onClickCancel && dailyLesson && onClickCancel(dailyLesson);
  }

  const isClickDisabled = useMemo(() => {
    return isDisabledOption || isReadOnlyOption;
  }, [isDisabledOption, isReadOnlyOption]);

  const clazz = useMemo (() => {
    if (!classMap || !dailyLesson?.classId) return null;
    return classMap[dailyLesson?.classId] || null;
  }, [classMap, dailyLesson?.classId]);

  const className = useMemo (() => {
    if (!clazz) return "";

    const hasClassName = !!dailyLesson.className;
    return hasClassName ? dailyLesson.className : TimetableDisplayUtils.formatFullClassName(clazz);
  }, [classMap, dailyLesson?.classId, dailyLesson?.className]);

  const course = useMemo (() => {
    if (!courseMap || !dailyLesson?.courseId) return null;
    return courseMap[dailyLesson?.courseId] || null;
  }, [courseMap, dailyLesson?.courseId]);

  const concurrentCourseTitle = useMemo(() => {
    if(dailyLesson?.concurrentCourseTitle) {
      // 2026.02.13, 분리 작업. dailyLesson 자체의 값을 사용하는 것으로 점차 변경
      return dailyLesson?.concurrentCourseTitle;
    }

    if (!courseMap || !dailyLesson?.concurrentCourseId) return null;
    return courseMap[dailyLesson?.concurrentCourseId]?.displayedTitle || null;
  }, [dailyLesson?.concurrentCourseTitle, courseMap, dailyLesson?.concurrentCourseId]);

  const specialtyRoomName = useMemo(() => {
    if(dailyLesson?.roomName) {
      // 2026.02.13, 분리 작업. dailyLesson 자체의 값을 사용하는 것으로 점차 변경
      return dailyLesson?.roomName;
    }

    if (!specialtyRoomMap || !dailyLesson?.specialtyRoomId) return null;
    return specialtyRoomMap[dailyLesson?.specialtyRoomId]?.roomName || null;
  }, [dailyLesson?.roomName, specialtyRoomMap, dailyLesson?.specialtyRoomId]);

  const courseName = useMemo (() => {
    if(dailyLesson?.courseName) {
      // 2026.02.13, 분리 작업. dailyLesson 자체의 값을 사용하는 것으로 점차 변경
      return TimetableDisplayUtils.formatCourseTitleWithTexts(dailyLesson?.courseName, concurrentCourseTitle, specialtyRoomName);
    }

    if (!course) return "";

    // const concurrentCourseTitle = courseMap?.[dailyLesson?.concurrentCourseId]?.displayedTitle || null;
    // const roomName = specialtyRoomMap?.[dailyLesson?.specialtyRoomId]?.roomName || null;

    return TimetableDisplayUtils.formatCourseTitleWithTexts(course.displayedTitle, concurrentCourseTitle, specialtyRoomName);
  }, [course, dailyLesson?.courseName, dailyLesson?.courseId, dailyLesson?.specialtyRoomId, specialtyRoomMap, concurrentConfMap]);

  const teacherName = useMemo (() => {
    if(dailyLesson?.teacherName) {
      // 2026.02.13, 분리 작업. dailyLesson 자체의 값을 사용하는 것으로 점차 변경
      return dailyLesson?.teacherName.split("|").join(", ");
    }

    if (!teacherMap || !dailyLesson?.lessonTeacherIds) return "";
    const teacherNames = dailyLesson?.lessonTeacherIds.map(teacherId => {
      const teacher = teacherMap[teacherId];
      return teacher ? teacher.teacherName : '';
    });
    return teacherNames.length > 2 ? `${teacherNames[0]} 외 ${teacherNames.length - 1}명` : teacherNames.join(", ");
  }, [teacherMap, dailyLesson?.lessonTeacherIds]);

  const eventName = useMemo(() => {
    return dailyLesson?.eventName || "";
  }, [dailyLesson?.eventName]);

  const isConcurrent = useMemo(() => {
    return StringUtils.isNotEmpty(dailyLesson?.concurrentCourseId);
  }, [courseMap, dailyLesson?.courseId]);

  /*
  const isCombined = useMemo(() => {
    return StringUtils.isNotEmpty(dailyLesson?.combineConfId);
  }, [dailyLesson?.combineConfId]);
  */

  // const isCombined = useMemo(() => {
  //   if (!concurrentConfMap || !dailyLesson?.concurrentCourseId) return false;
  //   const concurrentConf = concurrentConfMap[dailyLesson?.concurrentCourseId];
  //   return !!concurrentConf && (concurrentConf?.isCombinedClass || false);
  // }, [concurrentConfMap, dailyLesson?.concurrentCourseId]);

  const isShowLessonChangeType = useMemo(() => {
    return !UntitledLessonChangeTypes.includes(dailyLesson?.changeType);
  }, [dailyLesson?.changeType]);

  const isExchangeable = useMemo(() => {
    return isDirectExchangeableOption || isChainExchangeableOption;
  }, [isDirectExchangeableOption, isChainExchangeableOption]);

  const isEmptyCell = useMemo(() => {
    return !dailyLesson;
  }, [dailyLesson]);

  const isClassScheduleChanged = useMemo(() => {
    return [
      TimetableDailyLessonChangeType.Event, 
      TimetableDailyLessonChangeType.Reassignment, 
      TimetableDailyLessonChangeType.Duplication, 
      TimetableDailyLessonChangeType.Removal, 
      TimetableDailyLessonChangeType.InternalSwap, 
      TimetableDailyLessonChangeType.ExternalSwap
    ].includes(dailyLesson?.changeType);
  }, [dailyLesson]);

  const isEventCell = useMemo(() => {
    // return !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Event;
    // }, [dailyLesson]);
    return isEventOption;
  }, [isEventOption]);

  const isRemovedCell = useMemo(() => {
  //   return !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Removal;
  // }, [dailyLesson]);
    return isRemovedOption;
  }, [isRemovedOption]);

  const isDuplicatedCell = useMemo(() => {
  //   return !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Duplication;
  // }, [dailyLesson]);
    return isDuplicatedOption;
  }, [isDuplicatedOption]);

  const isSelectableEmptyCell = useMemo(() => {
    return isEmptyCell && isEmptyCellSelectableOption;
  }, [isEmptyCell, isEmptyCellSelectableOption]);

  const isConsecutive = useMemo(() => {
    return StringUtils.isNotEmpty(dailyLesson?.consecutiveGroupId);
  }, [dailyLesson?.consecutiveGroupId]);

  const isFirstOfConsecutive = useMemo(() => {
    return StringUtils.isNotEmpty(dailyLesson?.consecutiveGroupId) && isFirstOfConsecutiveOption;
  }, [isFirstOfConsecutiveOption, dailyLesson?.consecutiveGroupId]);

  const isHoveredConsecutive = useMemo(() => {
    return isConsecutive && isHoveredConsecutiveOption;
  }, [isHoveredConsecutiveOption, isConsecutive]);

  const classNames = useMemo(() => {
    const classNames = ["btn-table-cell"];

    // 연속 수업 스타일 적용
    if(isConsecutive) classNames.push("consecutive-course");
    if(isFirstOfConsecutive) classNames.push("fst");

    if(!isSourceLessonOption && isSelectedOption) classNames.push("selected");  // 이동의 sourceLesson인 경우는 selected 스타일 제외
    if(isSourceLessonOption) classNames.push("assign-target");

    if(isTargetLessonOption) {
      // event 처리 가능/불가능 여부에 따라 스타일 구분
      classNames.push(isReadOnlyOption ? "assign-after" : "assign-complete");
    }

    if(isEventOption) classNames.push("event-cell");
    if(isRemovedOption) classNames.push("assign-target-empty");
    if(isChangedLessonOption) classNames.push("edit-course");

    if(isReadOnlyOption) {
      classNames.push("read-only");
    }

    else {
      isHoveredConsecutive && classNames.push("hovered");
    }

    return classNames.join(" ")
  }, [
    isChangedLessonOption,
    isConsecutive,
    isEventOption,
    isFirstOfConsecutive,
    isHoveredConsecutive,
    isReadOnlyOption,
    isRemovedOption,
    isSelectedOption,
    isSourceLessonOption,
    isTargetLessonOption,
  ]);

  const isShowCancelButton = useMemo(() => {
    return !!dailyLesson && isTargetLessonOption && !isReadOnlyOption;
  }, [dailyLesson, isTargetLessonOption, isReadOnlyOption]);
  
  const renderExchangeable = () => {
    return (
      option?.isChainExchangeable && (
      <button type="button" className="exchange-chain" onClick={handleClick}>
        <span>연쇄 교환</span>
      </button>
    )
    || option?.isDirectExchangeable && (
      <button type="button" className="exchange-direct" onClick={handleClick}>
        <span>1:1 교환</span>
      </button>
    ));
  }

  const handleMouseOver = () => {
    dailyLesson && onMouseOver && onMouseOver(dailyLesson);
  }

  const handleMouseEnter = () => {
    dailyLesson && onMouseEnter && onMouseEnter(dailyLesson);
  }

  const handleMouseLeave = () => {
    dailyLesson && onMouseLeave && onMouseLeave(dailyLesson);
  }

  return (
    <>
    { isExchangeable && renderExchangeable()}
    { !isExchangeable && !isEmptyCell && !isClassScheduleChanged &&(
      // 전체시간표 메인 시간표 리스트에서 수업 교체, 수업보강에 대한 툴팁이 누락되어 추가됨 : 버튼 안쪽을 감싸는 형태로 툴팁이 들어감
      // 어디에 두어야 할지 몰라서 일단 주석으로 남겨둠
      // <button type="button" className="btn-table-cell">
      //   <HiTooltip position='center-bottom' titleHtml="수업교체 <br> 3/4 (수 1) 2-3 국어 무영숙 → 통과 최도현" >
      //     <div className="class-name">2-3</div>
      //     <div className="course-name">통과</div>
      //   </HiTooltip>
      // </button>

      <button type="button"
        className={classNames} 
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={isDisabledOption}>                    
        <div className="badges">
          {isConcurrent && <span className="badge concurrent">동시</span>}
          {/* isCombined && <span className="badge joint">합반</span> */}
        </div>
        <div className="class-name">
          {isShowLessonChangeType && <span className="badge change">{LessonChangeTypeTitles[dailyLesson?.changeType]}</span>}
          {isTimetableByClassOption ? courseName : className}
        </div>
        <div className="course-name">{isTimetableByClassOption ? teacherName : courseName}</div>
        {isShowCancelButton && <i className="ico ico-close ico-size-14"></i>}
      </button>
    )}
    { !isExchangeable && !isEmptyCell && isClassScheduleChanged && (
        <>
        {isEventCell && (
          <button type="button" className={classNames} disabled={isDisabledOption}>
          <div className="course-name">{eventName}</div>
          </button>
        )}
        {isRemovedCell && (
          <button type="button" className={classNames} disabled={isDisabledOption}>
          <div className="course-name">수업없음</div>
          </button>
        )}
        {isDuplicatedCell && (
          <button type="button" className={classNames} disabled={isDisabledOption}>
            <div className="badges">
              {isConcurrent && <span className="badge concurrent">동시</span>}
              {/* isCombined && <span className="badge joint">합반</span> */}
            </div>
            <div className="class-name">
              {isShowLessonChangeType && <span className="badge change">{LessonChangeTypeTitles[dailyLesson?.changeType]}</span>}
              {isTimetableByClassOption ? courseName : className}
            </div>
            <div className="course-name">{isTimetableByClassOption ? teacherName : courseName}</div>
          </button>
        )}
        </>
    )}
    { !isExchangeable && isEmptyCell && isSelectableEmptyCell &&  (
      <button type="button" className={`btn-table-cell ${isReadOnlyOption && "event-none"}`} style={{'backgroundColor': '#eee'}} disabled={isDisabledOption} onClick={handleClick}>
        <div className="course-name">수업없음</div>
      </button>
    )}
    { !isExchangeable && isEmptyCell && !isSelectableEmptyCell &&  (
      <button type="button" className={`btn-table-cell ${isReadOnlyOption && "event-none"}`} disabled={isDisabledOption} />
    )}
    </>
  );
}

export default DailyLessonButton;
