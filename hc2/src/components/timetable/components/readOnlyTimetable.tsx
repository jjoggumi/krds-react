import React, { useEffect, useMemo, useState } from "react";
import { LessonDay } from "../common/types"
import { DAYS_OF_WEEK } from "../common/constants";
import { Class, Course, DailyLesson, DailyLessonMoveInfo, Teacher, TeacherCourse, TeacherCourseBase, CourseBase, TimetableConfig, ConcurrentConf, TimetableDailyLessonChangeType, SpecialtyRoom } from "../core/types";
import DailyLessonButton, { DailyLessonButtonOption } from "../daily/components/dailyLessonButton";
import { TimetableDisplayUtils, TypeUtils } from "../common/utils";

interface ReadOnlyTimetableProps {
  selectedLessonDays: LessonDay[];
  classMap?: Record<string, Class>;
  courseMap?: Record<string, Course>;
  courseBaseMap?: Record<string, CourseBase>;
  teacherMap?: Record<string, Teacher>;
  teacherCourseBaseMap?: Record<string, TeacherCourseBase[]>;
  concurrentConfMap?: Record<string, ConcurrentConf>;
  specialtyRoomMap?: Record<string, SpecialtyRoom>;
  timetableConfig?: TimetableConfig;
  dailyLessons?: DailyLesson[];
  moveInfo?: DailyLessonMoveInfo;
  teacherId?: string;
}

const ReadOnlyTimetable: React.FC<ReadOnlyTimetableProps> = ({ 
    selectedLessonDays,
    classMap,
    courseMap,
    courseBaseMap,
    teacherMap,
    teacherCourseBaseMap,
    concurrentConfMap,
    specialtyRoomMap,
    timetableConfig,
    dailyLessons,
    moveInfo,
    teacherId
}: ReadOnlyTimetableProps) => {

  const [maxPeriod, setMaxPeriod] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number | null>(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const adjustDisplayedPeriod = (period: number) => {
    return period + startPeriod;
  };

  const teacherName = useMemo(() => {
    if(teacherId && teacherMap) {
      return teacherMap[teacherId]?.teacherName || "";
    }

    return "";
  }, [teacherId, teacherMap]);

  const teacherNameTitle = useMemo(() => {
    return teacherName ? `${teacherName} 선생님` : "";
  }, [teacherName]);

  const courseNames = useMemo(() => {
    if(!teacherId || !teacherCourseBaseMap || !courseBaseMap) {
      return "";
    }
    
    const names = (teacherCourseBaseMap[teacherId] || []).map(c => {
      return courseBaseMap[c.courseBaseId]?.displayedTitle || "";
    });

    return Array.from(new Set(names)).filter((c) => c != "").sort().join(" ");
  }, [teacherId, teacherCourseBaseMap, courseBaseMap]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return selectedLessonDays.length > 0
      ? `${(100 - headerWidth) / selectedLessonDays.length}%`
      : "auto";
  }, [selectedLessonDays]);

  const readableLessonDay = (lessonDay: LessonDay) => {
    const monthAndDay = lessonDay.lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    const dayOfWeekTitle = DAYS_OF_WEEK.find((d) => d.index === lessonDay.dayOfWeek)?.title || "";
    return `${month}/${day}(${dayOfWeekTitle})`;
  };

  const handleMouseOverDailyLesson = (lesson: DailyLesson) => {
    if(lesson?.consecutiveGroupId) {
      const hoveredInfo = `${lesson.consecutiveGroupId}${lesson.lessonDate}`;
      setHoveredId(hoveredInfo);
      return;
    }

    setHoveredId(null);
  }

  const handleMouseLeaveDailyLesson = (lesson: DailyLesson) => {
    if(lesson?.consecutiveGroupId) {
      setHoveredId(null);
      return;
    }
  }

  const getConcurrentCombinedClasses = (targets: DailyLesson[], selected: DailyLesson) => {
    return targets
      .filter(l => l.lessonDate === selected.lessonDate && l.period === selected.period && l.concurrentCourseId === selected.concurrentCourseId && TypeUtils.arraysEqual(l.lessonTeacherIds, selected.lessonTeacherIds))
      .map(l => classMap[l.classId])
      .filter((c): c is Class => !!c);
  };

  const buildClassNameFromLessons = (lessons: Class[]) => {
    const classes = lessons
      .map(l => classMap[l.classId])
      .filter((c): c is Class => !!c)
      .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);

    const classNames = classes
      .map(c => TimetableDisplayUtils.formatFullClassName(c))
      .filter(Boolean);

    if (classNames.length === 0) return "";
    if (classNames.length === 1) return classNames[0];
    if (classNames.length === 2) return classNames.join(", ");
    return `${classNames[0]} 외 ${classNames.length - 1}개반`;
  };

  const renderDailyLessonButton = (lessonDate: number, period: number) => {
    let lesson = dailyLessons.find(lesson => lesson.lessonDate === lessonDate && lesson.period === period);

    const option = {
      isDisabled: false,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isSourceLesson: false,
      isTargetLesson: false,
      isReadOnly: true,
    } as DailyLessonButtonOption;

    if(hoveredId && lesson?.consecutiveGroupId) {
      option.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
    }

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = dailyLessons.filter(l => 
        l.consecutiveGroupId === lesson.consecutiveGroupId && 
        l.classId == lesson.classId && 
        l.lessonDate === lessonDate
      ).sort((a, b) => a.period - b.period);
      
      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
    }

    if(moveInfo && moveInfo?.sourceLesson.lessonDate === lessonDate && moveInfo?.sourceLesson.period === period) {
      option.isSourceLesson = true;
    }

    if(moveInfo && moveInfo?.targetPeriod.lessonDate === lessonDate && moveInfo?.targetPeriod.period === period) {
      option.isTargetLesson = true;
      lesson = moveInfo?.sourceLesson; // 이동 대상인 경우, 원래 수업 정보를 표시
    }


    // 합반 수업인 경우, 반 이름을 합반된 모든 반 이름으로 설정
    if (!!lesson && lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = dailyLessons
        .filter(l => lesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      lesson.className = buildClassNameFromLessons(combinedLessons);
    }

    // 기초 동시 합반 수업인 경우, 반 이름을 합반된 모든 반 이름으로 설정
    if (!!lesson && lesson.concurrentCourseId) {
      const isCombined = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass;
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(dailyLessons, lesson)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        lesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
      }
    }

    return (
      <DailyLessonButton 
        dailyLesson={lesson}
        lessonDate={lessonDate}
        period={period}
        classMap={classMap}
        courseMap={courseMap}
        teacherMap={teacherMap}
        specialtyRoomMap={specialtyRoomMap}
        option={option}
        onMouseOver={handleMouseOverDailyLesson}
        onMouseLeave={handleMouseLeaveDailyLesson}
      />
    );
  }

  useEffect(() => {
    if (!timetableConfig) {
      return;
    }

    setMaxPeriod(timetableConfig?.maxPeriod || 7);
    setStartPeriod(timetableConfig?.startPeriod ?? 1);
    
  }, [timetableConfig]);

  return (
    <div className="table-content sm time-table mt-7">
      <div className="h5-tit mb-2">
        <h5>
          { teacherNameTitle} <i className="divider"></i>{" "}
          <p className="text-text-primary-base">{ courseNames }</p>
        </h5>
      </div>
      <table className="teacher-view">
        <caption>시간표</caption>
        <colgroup>
          <col style={{ width: "2.5%" }} />
          {selectedLessonDays.map((d, idx) => (
            <col key={`day-index-${idx}`} style={{ width: lessonDaysColWidth }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th></th>
              {selectedLessonDays.map((d) => (
                <th key={`day-header-${d.lessonDate}`}>
                  {readableLessonDay(d)}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {maxPeriod && Array.from({ length: maxPeriod }).map((_, periodIdx) => (
            <tr key={`selected-period-index-${periodIdx}`}>
              <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
              {selectedLessonDays.map((d, dayIdx) => (
                <td key={`selected-period-${periodIdx}-day-${dayIdx}-${hoveredId}`}>
                  {renderDailyLessonButton(d.lessonDate, periodIdx + 1)}
                </td>
              ))}
            </tr>
          ))}         
        </tbody>
      </table>
    </div>
  )
};

export default ReadOnlyTimetable;