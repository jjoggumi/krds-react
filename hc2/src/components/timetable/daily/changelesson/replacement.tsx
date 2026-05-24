// @File: replacement.tsx
// @Description: 수업변경 > 수업 변경 
// @Modified: 2025-09-29
//
import {
  useGradeContext, TimetableGradeContext,
  useClassContext, TimetableClassContext,
  useTeacherContext, TimetableTeacherContext,
  useCourseContext, TimetableCourseContext,
  useTeacherCourseContext, TeacherCourseContext,
  useLessonConfContext, TimetableLessonConfContext,
  useConcurrentConfContext, TimetableConcurrentConfContext,
  useSpecialtyRoomContext, TimetableSpecialtyRoomContext,
  useTeacherCourseBaseContext, TeacherCourseBaseContext,
  useCourseBaseContext, TimetableCourseBaseContext
} from '../../contexts';
import { 
  Course, Class, TeacherCourse, Teacher, DailyLesson, LessonConf, 
  TimetableDailyLessonType, TimetableDailyLessonChangeType,
  ConcurrentConf, TimetableLessonChangeStatus,
  TimetablePeriod, SpecialtyRoom,
  CourseBase,
  TeacherCourseBase,
  TimetableIndex
} from "../../core/types";
import { LessonDay, ActivateWeekday, EmbeddedListResponse } from "../../common/types";
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import { TimetableDataUtils } from "../../core/mod/utils"
import { TimetableDisplayUtils, TimeUtils, TypeUtils } from "../../common/utils";

import { Hc2Timetables } from "../../apis"

import React, { useState, useEffect, useMemo, useRef, useContext, use } from "react";
import AutocompleteInput from "../../../uiux/autocompleteInput";
import { HiInput } from '@/components/uiux';
import styles from "./replacement.module.scss";

import DailyLessonButton, { DailyLessonButtonOption } from "../components/dailyLessonButton";
import { DatetimePicker } from "../../components/datetimePicker";

import { showToast } from '@/unimplementeds/toast.js'
import { HiButton } from '@/components/uiux/hiButton';
import { dispatchLessonChangeRequestCountRefresh } from '../../common/events';

interface Props {
  selectedTimetable: TimetableIndex | null;
  onClose?: () => void;
  isManagerView: boolean;
}

interface CourseOption {
  // lessonConfId: string;
  displayedTitle: string;
  classId: string;
  courseId: string;
  teacherId: string;
  isOpen?: boolean;
}

interface SelectedDailyLessonButton {
  lessonDate: number;
  period: number;
}


// LessonConf 대체
interface LessonInfo {
  teacherId: string;
  courseId: string;
  classId: string;
  specialtyRoomId?: string;
  concurrentCourseId?: string;
  lesssonTeacherIds: string[];
}

const ChangeLessonReplacement: React.FC<Props> = ({ selectedTimetable, onClose, isManagerView }) => {
  
  // === Contexts ===
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const teacherCourses = useTeacherCourseContext();
  // const lessonConfs = useLessonConfContext();
  // const concurrentConfs = useConcurrentConfContext();
  const specialtyRooms = useSpecialtyRoomContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const courseBases = useCourseBaseContext();
  
  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  // const lessonConfContext = TimetableLessonConfContext.getInstance();
  // const concurrentConfContext = TimetableConcurrentConfContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  
  const [lessonInfoMap, setLessonInfoMap] = useState<Record<string, LessonInfo>>({});
  const [lessonInfoMapByTeacher, setLessonInfoMapByTeacher] = useState<Record<string, LessonInfo[]>>({});

  

  const teacherCourseMap = useMemo(
    () => teacherCourseContext.teacherCourseMap || ({} as Record<string, TeacherCourse[]>),
    [teacherCourses]
  );

  const courseMap = useMemo(
    () => courseContext.courseMap || ({} as Record<string, Course>),
    [courses]
  );

  const teacherCourseBaseMap = useMemo(
    () => teacherCourseBaseContext.teacherCourseBaseMap || ({} as Record<string, TeacherCourseBase[]>),
    [teacherCourseBases]
  );

  const courseBaseMap = useMemo(
    () => courseBaseContext.courseBaseMap || ({} as Record<string, CourseBase>),
    [courseBases]
  );

  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Class>),
    [classes]
  );

  const gradeNameMap = useMemo(
    () => gradeContext.gradeNameMap || ({} as Record<number, string>),
    [timetableConfig]
  );

  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Teacher>),
    [teachers]
  );


  /*
  const lessonInfoMapByTeacher = useMemo(
    () => lessonConfContext.lessonInfoMapByTeacher || ({} as Record<string, LessonConf[]>),
    [lessonConfs]
  );

  const lessonConfMap = useMemo(
    () => lessonConfContext.lessonConfMap || ({} as Record<string, LessonConf>),
    [lessonConfs]
  );

  const concurrentConfMap = useMemo(
    () => concurrentConfContext.concurrentConfMap || ({} as Record<string, ConcurrentConf>),
    [concurrentConfs]
  );
  */

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  const initialDate = Math.max(selectedTimetable?.operationStartDate || TimeUtils.getTodayAsNumber(), TimeUtils.getTodayAsNumber());

  // === State ===
  const [ teacherMaxPeriod, setTeacherMaxPeriod ] = useState<number | null>(null);
  const [ classMaxPeriod, setClassMaxPeriod ] = useState<number | null>(null);
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);
  const [ classDailyLessons, setClassDailyLessons ] = useState<DailyLesson[]>([]);
  const [ teacherDailyLessons, setTeacherDailyLessons ] = useState<DailyLesson[]>([]);
  const [ allDailyLessons, setAllDailyLessons ] = useState<DailyLesson[]>([]);
  const [ prevSelectedDate, setPrevSelectedDate ] = useState<number | null>(null);
  const [ selectedDate, setSelectedDate ] = useState<number | null>(initialDate);
  const [ selectedTeacherName, setSelectedTeacherName ] = useState<string>("");
  const [ selectedTeacherId, setSelectedTeacherId ] = useState<string>("");
  const [ hoveredId, setHoveredId ] = useState<number | string | null>(null);
  const [ reason, setReason ] = useState("");
  const [ selectedDailyLessonButton, setSelectedDailyLessonButton ] = useState<SelectedDailyLessonButton | null>(null);

  const [ selectedOptionTitle, setSelectedOptionTitle ] = useState<string>("");
  const [ selectedDailyLesson, setSelectedDailyLesson ] = useState<DailyLesson | null>(null);
  const [ courseOptions, setCourseOptions ] = useState<CourseOption[]>([]);

  // === Utils for date handling ===
  const calendarRef = useRef(null);
  const [activatedClassDays, setActivatedClassDays] = useState<ActivateWeekday[]>([]);

  const readableLessonDay = (lessonDay: LessonDay) => {
    const monthAndDay = lessonDay.lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    const dayOfWeekTitle = DAYS_OF_WEEK.find((d) => d.index === lessonDay.dayOfWeek)?.title || "";
    return `${month}/${day}(${dayOfWeekTitle})`;
  };

  const selectedLessonDays = useMemo(() => {
    if (!selectedDate) return [];
    const weeks = 3;
    const lessonDays = TimeUtils.generateLessonDays(selectedDate, weeks);
    return lessonDays.filter((lessonDay: LessonDay) =>
      activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
    );
  }, [selectedDate, activatedClassDays]);

  const selectedStartLessonDate = selectedLessonDays[0] || null;
  const selectedEndLessonDate = selectedLessonDays[selectedLessonDays.length - 1] || null;

  const adjustDisplayedPeriod = (period: number) => {
    return period + startPeriod;
  };

  const handleBeforeSelectDate = (date, calendar) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);
    const todayNum = TimeUtils.getTodayAsNumber();
    const todayTimestamp = Date.now();

    let invalidMsg = "";
    if (selectedTimetable && (paramDateNum < selectedTimetable.operationStartDate || paramDateNum > selectedTimetable.operationEndDate)) {
      invalidMsg = "운영 기간이 아닌 날짜는 선택할 수 없습니다.";
    } else if (paramDateNum < todayNum) {
      invalidMsg = "과거 날짜는 선택할 수 없습니다.";
    }

    if (invalidMsg) {
      showToast(invalidMsg, 3000);
      calendar?.setSelectedTimestamps([todayTimestamp]);
      return false;
    }
    return true;
  }

  const formatExpirationDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${month}월 ${day}일(${weekDay})`;
  };

  // === UseMemo ===
  const timetableId = useMemo(() => {
    return selectedTimetable ? selectedTimetable.timetableId : null;
  }, [selectedTimetable]);

  const teacherList = useMemo(() => {
    const isEmpty = teacherCourseBases.length === 0 || courseBases.length === 0 || teachers.length === 0;
    if (isEmpty) return [];

    return teachers
      .map((teacher) => {
        // let className = "";
        // if (teacher.classId && classMap[teacher.classId]) {
        //   const cls = classMap[teacher.classId];
        //   className = `${gradeNameMap[cls.grade]} ${cls.className}`;
        // }

        const courseBases = (teacherCourseBaseMap[teacher.teacherId] || []).map(
          ({ courseBaseId }) => courseBaseMap[courseBaseId]
        ) as CourseBase[];
        if (courseBases.length === 0) return;
        const courseNames = TimetableDataUtils.courseBaseNames(courseBases).sort().join(", ");

        return {
          text: `${teacher.teacherName} ${courseNames ? "(" + courseNames + ")" : ""}`,
          value: teacher.teacherId,
        };
      })
      .filter(item => !!item)
      .sort((a, b) => a.text.localeCompare(b.text));

  }, [teacherCourseBases, courseBases, teachers]);

  const targetClassInfo = useMemo(() => {
    if (!selectedDailyLesson) return null;

    const teacher = teachers.find(t => t.classId === selectedDailyLesson.classId);
    const teacherName = teacher ? `(담임 ${teacher.teacherName})` : "";

    const clazz = classMap[selectedDailyLesson.classId];
    return {
      gradeClass: `${clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : ""}`,
      teacherName
    };
  }, [selectedDailyLesson])
  
  const showTimetableToPreview = useMemo(() => {
    return selectedTeacherId !== null && !!selectedDailyLesson;
  }, [selectedTeacherId, selectedDailyLesson]);

  const isReadOnly = useMemo(() => {
    return !selectedDailyLesson;
  }, [selectedDailyLesson]);

  const isClickableToSave = useMemo(() => {
    return !!selectedDailyLesson;
  }, [selectedDailyLesson]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return selectedLessonDays.length > 0
      ? `${(100 - headerWidth) / selectedLessonDays.length}%`
      : "auto";
  }, [selectedLessonDays]);

  const lessonDaysForClassLessons = useMemo(() => {
    if (!selectedDailyLesson) return null;

    const weeks = 1;
    const [ startDate, _ ] = TimeUtils.getWeekRange(selectedDailyLesson.lessonDate);
    return TimeUtils.generateLessonDays(startDate, weeks)
      .filter((lessonDay: LessonDay) =>
        activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
      );
  }, [selectedDailyLesson])

  const showSelectedTeacherTimetable = useMemo(() => {
    return !!selectedTeacherId && !!selectedDate;
  }, [selectedTeacherId, selectedDate]);

  const dailyLessonMapByDateAndPeriod = useMemo(() => {
    if (allDailyLessons.length === 0) return {};

    return allDailyLessons.reduce((map, lesson) => {
      const key = `${lesson.lessonDate}-${lesson.period}`;
      (map[key] ||= []).push(lesson);
      return map;
    }, {} as Record<string, DailyLesson[]>);
  }, [teacherDailyLessons]);

  const filteredCourseOptions = useMemo(() => {
    if (!selectedTeacherId || courseOptions.length === 0 || !selectedDailyLessonButton) return [];

    return courseOptions
      .filter(option => {
        const lessons = dailyLessonMapByDateAndPeriod[`${selectedDailyLessonButton.lessonDate}-${selectedDailyLessonButton.period}`];
        if (!lessons || lessons.length === 0) return false;

        const key = `${option.teacherId}-${option.classId}-${option.courseId}`;

        const lessonInfo = lessonInfoMap[key];
        if (!lessonInfo) return false;

        // 특별실을 이용하는 수업인 경우, 배정 가능한지 체크
        const specialtyRoomId = lessonInfo.specialtyRoomId;
        if (specialtyRoomId) {
          const occupiedCount = lessons.filter(lesson => !!lesson.specialtyRoomId && lesson.specialtyRoomId === specialtyRoomId && option.classId !== lesson.classId).length;
          const specialtyRoom = specialtyRoomMap[specialtyRoomId];
          if (specialtyRoom) {
            if (occupiedCount + 1 > specialtyRoom.maxClass) return false;
          }
        }

        const selectableLessons = lessons.filter(lesson => 
          lesson.changeType === TimetableDailyLessonChangeType.None &&
          !lesson.concurrentCourseId
        );

        return !!selectableLessons && selectableLessons.some(lesson => lesson.classId === option.classId);
      });
  }, [selectedDailyLessonButton, dailyLessonMapByDateAndPeriod]);

  
  useEffect(() => {
    const newLessonInfoMap = {} as Record<string, LessonInfo>;

    const keySet = new Set<string>();
    allDailyLessons
      .filter(lesson => lesson.changeType === TimetableDailyLessonChangeType.None)
      .forEach(lesson => {
        const teacherIds = lesson.lessonTeacherIds || [];

        teacherIds.forEach(teacherId => {
          const key = `${teacherId}-${lesson.classId}-${lesson.courseId}`;

          if(keySet.has(key)) {
            return;
          }

          keySet.add(key);
          
          newLessonInfoMap[key] = {
            teacherId: teacherId,
            courseId: lesson.courseId,
            classId: lesson.classId,
            specialtyRoomId: lesson.specialtyRoomId,
            concurrentCourseId: lesson.concurrentCourseId,
            lesssonTeacherIds: teacherIds
          } as LessonInfo;
        });

      setLessonInfoMap(newLessonInfoMap);
    });

    // lessonInfoMapByTeacher 생성
    const newLessonInfoMapByTeacher = {} as Record<string, LessonInfo[]>;
    
    Object.values(newLessonInfoMap).forEach(lessonInfo => {
      const teacherId = lessonInfo.teacherId;
      if (!newLessonInfoMapByTeacher[teacherId]) {
        newLessonInfoMapByTeacher[teacherId] = [];
      }
      newLessonInfoMapByTeacher[teacherId].push(lessonInfo);
    });
    
    setLessonInfoMapByTeacher(newLessonInfoMapByTeacher);

    console.log("lessonInfoMap", newLessonInfoMap);
    console.log("lessonInfoMapByTeacher", newLessonInfoMapByTeacher);

  }, [allDailyLessons]);

  /*
  const lessonInfoMap = useMemo(
    () => {
      // Key 형식: `${teacherId}-${classId}-${courseId}
      const map = {} as Record<string, LessonInfo>;
      allDailyLessons.forEach(lesson => {
        const teacherIds = lesson.lessonTeacherIds || [];
        teacherIds.forEach(teacherId => {
          const key = `${teacherId}-${lesson.classId}-${lesson.courseId}`;

          if (!map[key]) {
            map[key] = {} as LessonInfo;
          }
          map[key] = {
            teacherId: teacherId,
            courseId: lesson.courseId,
            classId: lesson.classId,
            specialtyRoomId: lesson.specialtyRoomId,
            concurrentCourseId: lesson.concurrentCourseId,
            lesssonTeacherIds: teacherIds
          };
        });
      });
      return map;
    },
    [allDailyLessons]
  );
        

  const lessonInfoMapByTeacher = useMemo(
    () => {
      // allDays의 수업들을 선생님별로 묶어서 lessonInfoMapByTeacher 생성
      const map = {} as Record<string, LessonInfo[]>;
      const teacherLessonInfoKeySet = new Set<string>();
      // Key 형식: `${teacherId}-${classId}-${courseId}
      // `
      allDailyLessons.forEach(lesson => {
        const teacherIds = lesson.lessonTeacherIds || [];
        teacherIds.forEach(teacherId => {
          if (!map[teacherId]) {
            map[teacherId] = [];
          }

          const key = `${teacherId}-${lesson.classId}-${lesson.courseId}`;
          if (teacherLessonInfoKeySet.has(key)) return;
          teacherLessonInfoKeySet.add(key);

          map[teacherId].push({
            teacherId: teacherId,
            courseId: lesson.courseId,
            classId: lesson.classId,
            specialtyRoomId: lesson.specialtyRoomId,
            concurrentCourseId: lesson.concurrentCourseId,
            lesssonTeacherIds: teacherIds
          });
        });
      });
      return map;
    },
    [allDailyLessons]
  );
  */

  // === Renderers ===
  // const renderSelectedTeacherDailiyLesson = (lessonDate: number, period: number) => {
  //   const selectedTeacher = teacherMap[selectedTeacherId];
  //   if (!selectedTeacher) return null;

  //   const freePeriods = selectedTeacher.freePeriods || [];
  //   const dayOfWeek = TimeUtils.getDayOfWeek(lessonDate);
  //   if (freePeriods.includes({ dayOfWeek, period })) return null;

  //   const isTargetLesson = (
  //     selectedDailyLesson &&
  //     selectedDailyLesson.lessonDate === lessonDate &&
  //     selectedDailyLesson.period === period
  //   );

  //   const lesson = isTargetLesson 
  //     ? selectedDailyLesson
  //     : teacherDailyLessons.find(l => l.lessonDate === lessonDate && l.period === period);

  //   const isFocused =(
  //     selectedDailyLessonButton &&
  //     selectedDailyLessonButton.lessonDate === lessonDate &&
  //     selectedDailyLessonButton.period === period
  //   );

  //   const configMaxPeriod = timetableConfig?.maxPeriod || 7;

  //   if (!lesson) {
  //     return period > configMaxPeriod
  //       ? null
  //       : (
  //           <AutocompleteInput
  //             value={isFocused ? selectedOptionTitle : ""}
  //             options={filteredCourseOptions.map(item => item.displayedTitle)}
  //             onChange={(val) => handleClickOption(val, lessonDate, period)}
  //             onFocus={() => handleClickDailyLessonButton(lessonDate, period)}
  //             onBlur={() => handleBlurDailyLessonButton()}
  //             placeholder=""
  //             renderCustomOption={(items, selectItem) => (
  //               <>
  //                 {displayList(items).map((item, idx) => (
  //                   <div
  //                     key={idx}
  //                     className="item"
  //                     onMouseDown={e => {
  //                       e.preventDefault();
  //                       selectItem(item.displayedTitle);
  //                     }}
  //                   >
  //                     {item.displayedTitle}
  //                   </div>
  //                 ))}
  //                 {items.length === 0 && (
  //                   <div className="hi-nodata sm p-00">
  //                     <p>수업 없음</p>
  //                   </div>
  //                 )}
  //               </>
  //             )}
  //           />
  //         );
  //   }

  //   const option = {
  //     isTargetLesson: isTargetLesson,
  //     isDisabled: !isTargetLesson,
  //     isDirectExchangeable: false,
  //     isChainExchangeable:  false,
  //     isFirstOfConsecutive: false,
  //     isHoveredConsecutive: false,
  //   } as DailyLessonButtonOption;

  //   if (lesson.changeType === TimetableDailyLessonChangeType.Combination) {
  //     const combinedClassNames = teacherDailyLessons
  //         .filter(l => lesson.combinedGroupId === l.combinedGroupId)
  //         .map(l => classMap[l.classId])
  //         .filter(c => c !== null)
  //         .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber)
  //         .map(c => `${c.grade}-${c.classNumber}`)
  //         .join(', ');

  //     lesson.className = combinedClassNames;
  //   }

  //   // 동시 수업이면서 합반인 경우(기초), 모든 학반 명 표시 (+) 합반 처리된 수업은 읽기전용 처리
  //   if (lesson.concurrentCourseId) {
  //     const combinedClassNames = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass
  //       ? getCombinedClassNames(lesson)
  //       : null;

  //     lesson.className = combinedClassNames;
  //     option.isReadOnly = !!combinedClassNames;
  //   }

  //   if(hoveredId && lesson?.consecutiveGroupId) {
  //     option.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
  //   }

  //   if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
  //     const consecutiveLessons = teacherDailyLessons.filter(l =>
  //       l.consecutiveGroupId === lesson.consecutiveGroupId &&
  //       l.classId == lesson.classId &&
  //       l.lessonDate === lessonDate
  //     ).sort((a, b) => a.period - b.period);

  //     option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
  //   }

  //   return (
  //     <DailyLessonButton
  //       dailyLesson={isTargetLesson ? selectedDailyLesson : lesson}
  //       lessonDate={lessonDate}
  //       period={period}
  //       classMap={classMap}
  //       courseMap={courseMap}
  //       teacherMap={teacherMap}
  //       option={option}
  //       onClickCancel={handleClickCancelSelection}
  //       // onMouseOver={handleMouseOverDailyLesson}
  //       // onMouseLeave={handleMouseLeaveDailyLesson}
  //     />
  //   );

  // };

  const renderSelectedTeacherDailyLesson = (lessonDate: number, period: number) => {

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////// 해당 선생님의 수업 빼기 고려 필요( 결/보강 처리한 자리도 제외 처리 필요(추후 예정) ) + 화면 상에 disabled 처리할 지 확인 필요
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const selectedTeacher = teacherMap[selectedTeacherId];
    if (!selectedTeacher) return null;

    const dayOfWeek = TimeUtils.getDayOfWeek(lessonDate);
    const freePeriods = selectedTeacher.freePeriods || [];
    if (freePeriods.some(fp => fp.dayOfWeek === dayOfWeek && fp.period === period)) return null;

    const isTargetLesson =
      !!selectedDailyLesson &&
      selectedDailyLesson.lessonDate === lessonDate &&
      selectedDailyLesson.period === period;

    const lesson = isTargetLesson
      ? selectedDailyLesson
      : teacherDailyLessons.find(l => l.lessonDate === lessonDate && l.period === period);

    const isFocused =
      !!selectedDailyLessonButton &&
      selectedDailyLessonButton.lessonDate === lessonDate &&
      selectedDailyLessonButton.period === period;

    const configMaxPeriod = timetableConfig?.maxPeriod || 7;

    if (!lesson) {
      if (period > configMaxPeriod) return null;

      return (
      <AutocompleteInput
        value={isFocused ? selectedOptionTitle : ""}
        options={filteredCourseOptions.map(item => item.displayedTitle)}
        onChange={val => handleClickOption(val, lessonDate, period)}
        onFocus={() => handleClickDailyLessonButton(lessonDate, period)}
        onBlur={handleBlurDailyLessonButton}
        inTable
        placeholder=""
        renderCustomOption={(items, selectItem) => (
        <>
          {displayList(items).map((item, idx) => (
          <div
            key={idx}
            className="item"
            onMouseDown={e => {
            e.preventDefault();
            selectItem(item.displayedTitle);
            }}
          >
            {item.displayedTitle}
          </div>
          ))}
          {items.length === 0 && (
          <div className="hi-nodata sm p-0">
            <p>수업 없음</p>
          </div>
          )}
        </>
        )}
      />
      );
    }

    const isEvent = lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = lesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const option: DailyLessonButtonOption = {
      isTargetLesson,
      isDisabled: !isTargetLesson || isEvent || isRemoved,
      isDirectExchangeable: false,
      isChainExchangeable: false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isEvent,
      isRemoved,
      isDuplicated
    };

    if (lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = teacherDailyLessons
        .filter(l => lesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      lesson.className = buildClassNameFromLessons(combinedLessons);
    }

    if (lesson.concurrentCourseId) {
      // const isCombined = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass;
      const isCombined = !!lesson.combineConfId; // @TODO: <- 처리 필요
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(teacherDailyLessons, lesson)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        lesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
        option.isReadOnly = true;
      }
    }

    if (hoveredId && lesson.consecutiveGroupId) {
      option.isHoveredConsecutive = hoveredId === `${lesson.consecutiveGroupId}${lessonDate}`;
    }

    if (lesson.consecutiveGroupId) {
      const consecutiveLessons = teacherDailyLessons
      .filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId === lesson.classId &&
        l.lessonDate === lessonDate
      )
      .sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive =
      consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
    }

    return (
      <DailyLessonButton
      dailyLesson={isTargetLesson ? selectedDailyLesson! : lesson}
      lessonDate={lessonDate}
      period={period}
      classMap={classMap}
      courseMap={courseMap}
      teacherMap={teacherMap}
      specialtyRoomMap={specialtyRoomMap}
      option={option}
      onClickCancel={handleClickCancelSelection}
      />
    );
  };

  const renderSourceClassDailyLesson = (lessonDate: number, period: number) => {
    const lesson = classDailyLessons.find(lesson => lesson.lessonDate === lessonDate && lesson.period === period);

    if (!lesson) {
      return null;
    }

    const isSourceLesson = (
      selectedDailyLesson &&
      lesson.lessonDate === selectedDailyLesson?.lessonDate && 
      lesson.period === selectedDailyLesson?.period
    );

    const isEvent = lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = lesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const option = {
      isSourceLesson,
      isDisabled: false,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isReadOnly: true,
      isEvent,
      isRemoved,
      isDuplicated,
      isTimetableByClass: true
    } as DailyLessonButtonOption;

    if(hoveredId && lesson?.consecutiveGroupId) {
      option.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
    }

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = classDailyLessons.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.lessonDate === lessonDate
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
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
      />
    );
  };

  const renderTargetClassDailyLesson = (lessonDate: number, period: number) => {
    const isTargetLesson = (
      selectedDailyLesson &&
      selectedDailyLesson.lessonDate === lessonDate &&
      selectedDailyLesson.period === period
    );

    const lesson = isTargetLesson 
      ? selectedDailyLesson
      : classDailyLessons.find(l => l.lessonDate === lessonDate && l.period === period);

    if (!lesson) {
      return null;
    }

    const isEvent = lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = lesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const option = {
      isTargetLesson,
      isDisabled: false,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isReadOnly: true,
      isEvent,
      isRemoved,
      isDuplicated,
      isTimetableByClass: true
    } as DailyLessonButtonOption;

    if(hoveredId && lesson?.consecutiveGroupId) {
      option.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
    }

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = classDailyLessons.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.lessonDate === lessonDate
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
    }

    return (
      <DailyLessonButton
        dailyLesson={isTargetLesson ? selectedDailyLesson : lesson}
        lessonDate={lessonDate}
        period={period}
        classMap={classMap}
        courseMap={courseMap}
        teacherMap={teacherMap}
        specialtyRoomMap={specialtyRoomMap}
        option={option}
      />
    );
  };


  // const renderSelectedTeacherDailyLesson = (lessonDate: number, period: number) => {
  //   const lesson = teacherDailyLessons.find(
  //     l => l.lessonDate === lessonDate && l.period === period
  //   );

  //   const isSelected =
  //     selectedDailyLessonButton &&
  //     selectedDailyLessonButton.lessonDate === lessonDate &&
  //     selectedDailyLessonButton.period === period;

  //   if (!lesson) {
  //     if (replacedDailyLesson) return null;
  //     return (
  //       <AutocompleteInput
  //         value={isSelected ? selectedOptionTitle : ""}
  //         options={courseOptions.map(item => item.displayedTitle)}
  //         onChange={(val) => handleClickOption(val, lessonDate, period)}
  //         onFocus={() => handleClickDailyLessonButton(lessonDate, period)}
  //         placeholder=""
  //         renderCustomOption={(items, selectItem) => (
  //           <>
  //             {displayList(items).map((item, idx) => (
  //               <div
  //                 key={idx}
  //                 className="item"
  //                 onMouseDown={e => {
  //                   e.preventDefault();
  //                   selectItem(item.displayedTitle);
  //                 }}
  //               >
  //                 {item.displayedTitle}
  //               </div>
  //             ))}
  //             {items.length === 0 && (
  //               <div className="hi-nodata sm p-00">
  //                 <p>검색 결과가 없습니다.</p>
  //               </div>
  //             )}
  //           </>
  //         )}
  //       />
  //     );
  //   }

  //   const isTarget = replacedDailyLesson?.dailyLessonId === lesson.dailyLessonId;
  //   const isDisabled = replacedDailyLesson
  //     ? !isTarget
  //     : false;

  //   const isFirstOfConsecutive =
  //     lesson.consecutiveGroupId &&
  //     teacherDailyLessons
  //       .filter(
  //         l =>
  //           l.consecutiveGroupId === lesson.consecutiveGroupId &&
  //           l.classId === lesson.classId &&
  //           l.lessonDate === lessonDate
  //       )
  //       .sort((a, b) => a.period - b.period)[0]?.dailyLessonId === lesson.dailyLessonId;

  //   const option: DailyLessonButtonOption = {
  //     isTargetLesson: isTarget,
  //     isDisabled,
  //     isDirectExchangeable: false,
  //     isChainExchangeable: false,
  //     isFirstOfConsecutive: !!isFirstOfConsecutive,
  //     isHoveredConsecutive:
  //       hoveredId && lesson.consecutiveGroupId
  //         ? hoveredId === `${lesson.consecutiveGroupId}${lessonDate}`
  //         : false,
  //   };

  //   return (
  //     <DailyLessonButton
  //       dailyLesson={lesson}
  //       lessonDate={lessonDate}
  //       period={period}
  //       classMap={classMap}
  //       courseMap={courseMap}
  //       teacherMap={teacherMap}
  //       option={option}
  //     />
  //   );
  // };

  // === API ===
  const fetchDailyLessons = async () => {
    if (!timetableId || !selectedStartLessonDate || !selectedEndLessonDate || !selectedTeacherId) {
      console.warn("fetchDailyLessons: timetableId or lesson days are not set");
      return;
    }

    const api = new Hc2Timetables();
    const { lessonDate: startDate } = selectedStartLessonDate;
    const { lessonDate: endDate } = selectedEndLessonDate;
    // const query = {
    //   teacherId: selectedTeacherId
    // };
    
    try {
      const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
        timetableId,
        startDate,
        endDate,
        // query
      );

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      setAllDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
    }
  };

  const fetchClassDailyLessons = async () => {
    if (!timetableId || !selectedDailyLesson) return;

    const api = new Hc2Timetables();
    const [ startDate, endDate ] = TimeUtils.getWeekRange(selectedDailyLesson.lessonDate);
    const classId = selectedDailyLesson.classId;
    if (!classId) return;

    try {
      const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
        timetableId,
        startDate,
        endDate,
        { classId }
      );

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      setClassDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
    }
  };

  const handleClickSaveLessonChange = async () => {
    if (!timetableId || !selectedDailyLesson) return;

    const api = new Hc2Timetables();
    const payload = getPayload();
    try {

      const { requestReplacementForTeacherReplacementrequests, requestToChangeForReplacementReplacements } = api;
      let res = null
      if (isManagerView) {
        payload.status = TimetableLessonChangeStatus.Completed;
        res = await requestToChangeForReplacementReplacements(timetableId, payload);
      }
      else {
        res = await requestReplacementForTeacherReplacementrequests(timetableId, payload);
      }

      if (res.status === 204) {
        const message = isManagerView ? '수업이 변경되었습니다.' : '수업 변경이 요청되었습니다.';
        showToast(message, 3000);
        resetAllParameters();

        dispatchLessonChangeRequestCountRefresh();
      }
    } catch (error) {
      console.error("Error saving lesson change:", error);
      showToast('수업 변경 저장 중 오류가 발생했습니다.', 3000);
    }
  };

  const getPayload = () => {
    const sourceLesson = classDailyLessons.find(l =>
      l.lessonDate === selectedDailyLesson.lessonDate &&
      l.period === selectedDailyLesson.period
    );
    
    return {
      status: null,
      sourceLesson,
      targetLesson: selectedDailyLesson,
      reason
    };
  };

  // === Methods ===
  const handleClose = () => {
    resetAllParameters();
    onClose && onClose();
  }

  const getConcurrentCombinedClasses = (targets: DailyLesson[], selected: DailyLesson) => {
    return targets
      .filter(l => l.lessonDate === selected.lessonDate && 
          l.period === selected.period && 
          l.concurrentCourseId === selected.concurrentCourseId && 
          TypeUtils.arraysEqual(l.lessonTeacherIds, selected.lessonTeacherIds))
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

  const injectTeacherDailyLessons = () => {
    if (!selectedTeacherId) {
      setTeacherDailyLessons([]);
      return;
    }

    const teacherLessons = allDailyLessons.filter(lesson => lesson.lessonTeacherIds.includes(selectedTeacherId));
    setTeacherDailyLessons(teacherLessons);
  };

  const injectCourseOptions = () => {
    console.log("Injecting course options for teacherId:", selectedTeacherId);

    if (!selectedTeacherId) {
      setCourseOptions([]);
      return;
    }

    const lessonInfosOnSelectedTeacher = lessonInfoMapByTeacher[selectedTeacherId];
    if (!lessonInfosOnSelectedTeacher || lessonInfosOnSelectedTeacher.length === 0) return;

    const courseOptions = lessonInfosOnSelectedTeacher
      .slice()
      .sort((a, b) => {
        const classA = classMap[a.classId] || { grade: 0, classNumber: 0 };
        const classB = classMap[b.classId] || { grade: 0, classNumber: 0 };
        return classA.grade - classB.grade || classA.classNumber - classB.classNumber;
      })
      .filter(conf => !conf.concurrentCourseId && conf.teacherId === selectedTeacherId)
      .map(conf => {
        const course = courseMap[conf.courseId] || { displayedTitle: "", isDoubleTeacher: false };
        const clazz = classMap[conf.classId] || null;
        const title = `${clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : ""}${course.isDoubleTeacher ? " (복)" : ""} ${course.displayedTitle}`;
        return { displayedTitle: title, classId: conf.classId, teacherId: conf.teacherId, courseId: conf.courseId };
      });

    console.log("Injected course options:", courseOptions);
    
    setCourseOptions(courseOptions);
  };

  const handleSelectTeacher = async (teacherName: string) => {
    const teacher = teacherList.find(t => t.text === teacherName);
    const updated = teacher ? teacher.value : null;
    const isChanged = selectedTeacherId !== updated;

    setSelectedTeacherName(teacherName);
    setSelectedTeacherId(updated);
    setTeacherDailyLessons(prev => isChanged ? [] : prev);
    setClassDailyLessons([]);
    resetSelectedDailyLesson();
  };

  const handleChangeSelectedDate = (closedTimestamp: number) => {
    const updated = TimeUtils.getTimestampToNumber(closedTimestamp);
    const isChanged = selectedDate !== updated;
    setSelectedDate(updated);
    setTeacherDailyLessons(prev => isChanged ? [] : prev);
    setClassDailyLessons([]);
    resetSelectedDailyLesson();
  };

  const resetAllParameters = () => {
    setPrevSelectedDate(null);
    setSelectedDate(TimeUtils.getTodayAsNumber());

    setSelectedTeacherName("");
    setSelectedTeacherId(null);
    
    setAllDailyLessons([]);
    setTeacherDailyLessons([]);
    setClassDailyLessons([]);
    
    setSelectedDailyLesson(null);
    setSelectedOptionTitle("");
    setCourseOptions([]);
    setSelectedDailyLessonButton(null);

    setReason("");
  };

  const resetSelectedDailyLesson = () => {
    setSelectedDailyLesson(null);
    setSelectedDailyLessonButton(null);
    setSelectedOptionTitle("");
    setReason("");
  };

  const handleClickOption = async (displayedTitle: string, lessonDate: number, period: number) => {
    if (selectedDailyLesson) {
      showToast('이미 선택된 수업이 있습니다. 변경하려면 선택된 수업을 먼저 해제하세요.', 3000);
      return;
    }

    setSelectedOptionTitle(displayedTitle);
    const courseOption = filteredCourseOptions.find(c => c.displayedTitle === displayedTitle);
    if (!courseOption) return;

    const key = `${courseOption.teacherId}-${courseOption.classId}-${courseOption.courseId}`;

    const lessonInfo = lessonInfoMap[key];
    if (!lessonInfo) return;

    const lessonTeacherIds = lessonInfo.lesssonTeacherIds;

    const dailyLesson: DailyLesson = {
      dailyLessonId: null,
      timetableId: timetableId,
      lessonType: TimetableDailyLessonType.Lesson,
      classId: lessonInfo.classId,
      lessonDate,
      dayOfWeek: new Date(lessonDate).getDay(),
      period,
      courseId: lessonInfo.courseId,
      specialtyRoomId: lessonInfo.specialtyRoomId,
      changeType: TimetableDailyLessonChangeType.Replacement,
      isRemoved: false,
      isMoved: false,
      className: null,
      courseName: courseMap[lessonInfo.courseId]?.displayedTitle || "",
      teacherName: null,
      roomName: null,
      lessonTeacherIds
    };

    setSelectedDailyLesson(dailyLesson);
  };

  const handleClickDailyLessonButton = (lessonDate: number, period: number) => {
    setSelectedOptionTitle("");
    setSelectedDailyLessonButton({ lessonDate, period });
  };

  const handleBlurDailyLessonButton = () => {
    setSelectedOptionTitle("");
    setSelectedDailyLessonButton(null);
  };

  const handleClickCancelSelection = () => {
    setClassDailyLessons([]);
    resetSelectedDailyLesson();
  };

  const displayList = (filteredStrings: string[]): CourseOption[] => {
    return filteredCourseOptions.filter(item => filteredStrings.includes(item.displayedTitle));
  };

  // === UseEffects ===
  useEffect(() => {
    if (!selectedDate) setSelectedDate(initialDate);
    
    return () => resetAllParameters();
  }, []);

  useEffect(() => {
    if (!timetableConfig) {
      return;
    }

    setStartPeriod(timetableConfig?.startPeriod ?? 1);
    setActivatedClassDays(
      timetableConfig?.classDays
        .map((isActive: ClassDayStatus, index: number) => ({
          dayOfWeek: index,
          title: DAYS_OF_WEEK.find((day) => day.index === index)?.title,
          isActive: isActive === ClassDayStatus.ACTIVATED,
        }))
        .filter((day: ActivateWeekday) => day.isActive)
    );

  }, [timetableConfig]);

  useEffect(() => {
    injectCourseOptions();
  }, [selectedTeacherId, lessonInfoMapByTeacher]);

  useEffect(() => {
    if (
      !selectedDate || 
      !selectedTeacherId ||
      selectedDate === prevSelectedDate
    ) {
      return;
    }

    fetchDailyLessons();
    setPrevSelectedDate(selectedDate);
  }, [selectedTeacherId, selectedDate]);

  useEffect(() => {
    if (!selectedTeacherId || allDailyLessons.length === 0) {
      setTeacherDailyLessons([]);
      return;
    }

    injectTeacherDailyLessons();
  }, [selectedTeacherId, allDailyLessons]);

  useEffect(() => {
    if (!selectedDailyLesson) return;

    fetchClassDailyLessons();
  }, [selectedDailyLesson]);

  useEffect(() => {
    if (teacherDailyLessons.length === 0) {
      setTeacherMaxPeriod(timetableConfig?.maxPeriod || 7);
      return;
    }

    const configMax = timetableConfig?.maxPeriod || 7;
    const maxLessonPeriod = Math.max(...teacherDailyLessons.map(lesson => lesson.period));
    setTeacherMaxPeriod(Math.max(configMax, maxLessonPeriod));
  }, [teacherDailyLessons]);

  useEffect(() => {
    if (classDailyLessons.length === 0) {
      setClassMaxPeriod(timetableConfig?.maxPeriod || 7);
      return;
    }

    const configMax = timetableConfig?.maxPeriod || 7;
    const maxLessonPeriod = Math.max(...classDailyLessons.map(lesson => lesson.period));
    setClassMaxPeriod(Math.max(configMax, maxLessonPeriod));
  }, [classDailyLessons]);

  return (
    <>
      {/* 교사 선택 */}
      <div className="form-group-inline">
        <label>교사 선택</label>
        <AutocompleteInput
            value={selectedTeacherName}
            onChange={handleSelectTeacher}
            options={teacherList.map(t => t.text)}
            placeholder="선택"
            nodata="일치하는 교사가 없습니다."
        />
        <label className="sm ml-10">조회 기준일</label>
        <DatetimePicker
          timestamp={TimeUtils.getNumberToTimestamp(selectedDate)}
          onChange={closedTimestamp => handleChangeSelectedDate(closedTimestamp)}
          formatter={formatExpirationDate}
          allowPast={false}
          calendar={calendarRef}
          onBeforeSelect={selected => handleBeforeSelectDate(selected, calendarRef.current)}
          isPlaned={!!selectedTimetable && TimeUtils.getTodayAsNumber() < selectedTimetable?.operationStartDate}
          operationStartDate={selectedTimetable?.operationStartDate}
          operationEndDate={selectedTimetable?.operationEndDate}
          withTime={false}
        />
        {/*<label>변경일 선택</label>*/}
        {/*<DatetimePicker*/}
        {/*  disabled={false}*/}
        {/*  timestamp={yyyymmddToTimestamp(selectedDate)}*/}
        {/*  onChange={closedTimestamp => handleChangeOnSelectedDate(closedTimestamp)}*/}
        {/*  formatter={formatExpirationDate}*/}
        {/*  showYear={true}*/}
        {/*  allowPast={false}*/}
        {/*  popup={popupRef}*/}
        {/*  calendar={calendarRef}*/}
        {/*  position={{ right: -800, bottom: -85 }}*/}
        {/*  onBeforeSelect={selected => onBeforeSelectDate(selected, calendarRef.current)}*/}
        {/*  style={undefined}*/}
        {/*  withTime={false}*/}
        {/*/>*/}
      </div>

      {/* 교사 미선택 nodata */}
      {!showSelectedTeacherTimetable && (
        <div className="hi-nodata">
          <p>교사를 선택하세요.</p>
        </div>
      )}

      {/* 시간표 */}
      {showSelectedTeacherTimetable && (
        <div className={styles.courseChange}>
          {/* 여기서부터는 Vue 템플릿의 HTML 구조 그대로 옮겨오기 */}
          {/* 긴 테이블 부분 */}
          <div className="table-content sm time-table table-form mt-5">
            <table>
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
                {teacherMaxPeriod && Array.from({ length: teacherMaxPeriod }).map((_, periodIdx) => (
                  <tr key={`selected-period-index-${periodIdx}-${selectedTeacherId}-${selectedDate}`}>
                    <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                    {selectedLessonDays.map((d, dayIdx) => (
                      <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                        {renderSelectedTeacherDailyLesson(d.lessonDate, periodIdx + 1)}
                      </td>
                    ))}
                  </tr>
                ))}
               
              </tbody>
            </table>
          </div>

          {showTimetableToPreview && (
            <>
              <div className="gray-box !mt-5">
                <div className="tb-row">
                  <div className="tb-col">
                    <div className="table-content sm time-table">
                      <div className="h5-tit !mb-2">
                        {targetClassInfo && (
                          <h5>{targetClassInfo.gradeClass} {(targetClassInfo || {}).teacherName && <><i className="divider"></i> <p className="text-text-primary-base">{targetClassInfo.teacherName}</p></>}</h5>
                        )}
                      </div>
                      <table className="teacher-view">
                        <caption>시간표</caption>
                        {/* <colgroup>
                        <col style={{ width: "5%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th></th>
                            <th>3/4(월)</th>
                            <th>3/5(화)</th>
                            <th>3/6(수)</th>
                            <th>3/7(목)</th>
                            <th>3/8(금)</th>
                          </tr>
                        </thead> */}
                        <colgroup>
                          <col style={{ width: "2.5%" }} />
                          {lessonDaysForClassLessons.map((d, idx) => (
                            <col key={`day-index-${idx}`} style={{ width: lessonDaysColWidth }} />
                          ))}
                        </colgroup>
                        <thead>
                          <tr>
                            <th></th>
                            {lessonDaysForClassLessons.map((d) => (
                              <th key={`day-header-${d.lessonDate}`}>
                                {readableLessonDay(d)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {classMaxPeriod && Array.from({ length: classMaxPeriod }).map((_, periodIdx) => (
                            <tr key={`selected-period-index-${periodIdx}-${selectedTeacherId}-${selectedDate}`}>
                              <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                              {lessonDaysForClassLessons.map((d, dayIdx) => (
                                <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                                  {renderSourceClassDailyLesson(d.lessonDate, periodIdx + 1)}
                                </td>
                              ))}
                            </tr>
                          ))}                      
                         
                        </tbody>
                      </table>
                    </div>   
                  </div>
                  <div className="tb-col">              
                    <div className="table-content sm time-table">
                      <div className="h5-tit !mb-2">
                        {/* <h5>김창운 선생님 (담임 2-2)</h5> */}
                        {targetClassInfo && (
                          <h5>{targetClassInfo.gradeClass} {(targetClassInfo || {}).teacherName && <><i className="divider"></i> <p className="text-text-primary-base">{targetClassInfo.teacherName}</p></>}</h5>
                        )}
                      </div>
                      <table className="teacher-view">
                        <caption>시간표</caption>
                        {/* <colgroup>
                        <col style={{ width: "5%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        <col style={{ width: "19%" }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th></th>
                            <th>3/4(월)</th>
                            <th>3/5(화)</th>
                            <th>3/6(수)</th>
                            <th>3/7(목)</th>
                            <th>3/8(금)</th>
                          </tr>
                        </thead> */}
                        <colgroup>
                          <col style={{ width: "2.5%" }} />
                          {lessonDaysForClassLessons.map((d, idx) => (
                            <col key={`day-index-${idx}`} style={{ width: lessonDaysColWidth }} />
                          ))}
                        </colgroup>
                        <thead>
                          <tr>
                            <th></th>
                            {lessonDaysForClassLessons.map((d) => (
                              <th key={`day-header-${d.lessonDate}`}>
                                {readableLessonDay(d)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {classMaxPeriod && Array.from({ length: classMaxPeriod }).map((_, periodIdx) => (
                            <tr key={`selected-period-index-${periodIdx}-${selectedTeacherId}-${selectedDate}`}>
                              <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                              {lessonDaysForClassLessons.map((d, dayIdx) => (
                                <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                                  {renderTargetClassDailyLesson(d.lessonDate, periodIdx + 1)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        
                        </tbody>
                      </table>
                    </div> 
                  </div>
                </div>
              </div>
            </>
          )}


        </div>
      )}

      {/* 변경 사유 */}
      <div className="form-group-inline !mt-5">
        <label>변경 사유</label>
        <HiInput
          type="text"
          wrapClass="w-full placeholder:text-md"
          //disabled={isReadOnly} 변경하기 버튼 활성화 조건과 동일하여 따로 비활성화하지 않음
          placeholder="선택사항 (최대 50자)"
          maxLength={50}
          value={reason}
          onChange={e => setReason(e.target.value)}
          spellCheck={false}
        />
      </div>
      
      {/* 하단 버튼 추가 */}
      <div className="btns">
        <HiButton variant='tertiary' onClick={handleClose}>취소</HiButton>
        <HiButton variant='primary' disabled={!isClickableToSave} onClick={handleClickSaveLessonChange}>변경하기</HiButton>
      </div>
    </>
  );
};

export default ChangeLessonReplacement;
