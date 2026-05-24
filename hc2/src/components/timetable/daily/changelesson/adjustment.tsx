// @File: adjustment.tsx
// @Description: 수업변경 > 결, 보강 
// @Modified: 2025-09-29
import {
  useGradeContext, TimetableGradeContext,
  useClassContext, TimetableClassContext,
  useTeacherContext, TimetableTeacherContext,
  useCourseContext, TimetableCourseContext,
  useTeacherCourseContext, TeacherCourseContext,
  useLessonConfContext, TimetableLessonConfContext,
  useConcurrentConfContext, TimetableConcurrentConfContext,
  useTeacherCourseBaseContext, TeacherCourseBaseContext,
  useCourseBaseContext, TimetableCourseBaseContext,
  useSpecialtyRoomContext,
  TimetableSpecialtyRoomContext
} from '../../contexts';
import { 
  Course, Class, TeacherCourse, Teacher, ConcurrentConf,
  DailyLesson, LessonConf, TimetableDailyLessonType, TimetableDailyLessonChangeType, TimetableLessonChangeStatus, 
  CourseBase,
  TeacherCourseBase,
  TimetableIndex,
  SpecialtyRoom
} from "../../core/types";
import { LessonDay, ActivateWeekday, EmbeddedListResponse } from "../../common/types";
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import { TimetableDataUtils } from "../../core/mod/utils"
import { TimeUtils, TimetableDisplayUtils, TypeUtils } from "../../common/utils";

import { Hc2Timetables } from "../../apis"

import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import AutocompleteInput from "../../../uiux/autocompleteInput";
import { HiInput } from '@/components/uiux';
import styles from "./adjustment.module.scss"; // SCSS 모듈
import DailyLessonButton, { DailyLessonButtonOption } from "../components/dailyLessonButton";
import { DatetimePicker } from "../../components/datetimePicker";
import HiSelectBox from "../../../uiux/hiSelectBox";

import { showToast } from '@/unimplementeds/toast.js'
import { set } from 'lodash';
import { HiButton } from '@/components/uiux/hiButton';
import { dispatchLessonChangeRequestCountRefresh } from '../../common/events';

interface TimetableDailyLessonModalOptions {
  dailyLesson: DailyLesson | null;
  teacherId: string | null;
  lessonDate: number | null;
}

interface Props {
  selectedTimetable: TimetableIndex | null;
  options?: TimetableDailyLessonModalOptions;
  onClose?: () => void;
  isManagerView?: boolean;
}

// 타입 정의
interface TeacherOption {
  teacherId: string;
  teacherName: string;
  absentCount: number;
  makeupCount: number;
}

interface TeacherInfo {
  grades: (number | null)[];
  courseNames: string;
  teacherName: string;
}

const CourseSupplement: React.FC<Props> = ({ selectedTimetable, options, onClose, isManagerView }) => {
  // Contexts
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const teacherCourses = useTeacherCourseContext();
  const lessonConfs = useLessonConfContext();
  const concurrentConfs = useConcurrentConfContext();
  const courseBases = useCourseBaseContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const specialtyRooms = useSpecialtyRoomContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const lessonConfContext = TimetableLessonConfContext.getInstance();
  const concurrentConfContext = TimetableConcurrentConfContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();

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

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  const lessonConfsMapByTeacher = useMemo(
    () => lessonConfContext.lessonConfsMapByTeacher || ({} as Record<string, LessonConf[]>),
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

  const initialDate = Math.max(selectedTimetable?.operationStartDate || TimeUtils.getTodayAsNumber(), TimeUtils.getTodayAsNumber());

  // === State ===
  const [ sourceMaxPeriod, setSourceMaxPeriod ] = useState<number | null>(null);
  const [ targetMaxPeriod, setTargetMaxPeriod ] = useState<number | null>(null);

  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);
  const [ teacherOptions, setTeacherOptions ] = useState<TeacherOption[]>([]);

  const [ sourceTeacherDailyLessons, setSourceTeacherDailyLessons ] = useState<DailyLesson[]>([]);
  const [ targetTeacherDailyLessons, setTargetTeacherDailyLessons ] = useState<DailyLesson[]>([]);
  const [ selectedSourceTeacherName, setSelectedSourceTeacherName ] = useState<string>("");

  const [ selectedSourceTeacherId, setSelectedSourceTeacherId ] = useState<string>("");
  const [ selectedDailyLesson, setSelectedDailyLesson ] = useState<DailyLesson | null>(null);
  const [ adjustedDailyLesson, setAdjustedDailyLesson ] = useState<DailyLesson | null>(null);
  const [ selectedDate, setSelectedDate ] = useState<number | null>(initialDate);
  const [ selectedTargetTeacherId, setSelectedTargetTeacherId ] = useState<string | null>(null);
  const [ reason, setReason ] = useState<string>("");

  const [ hoveredId, setHoveredId ] = useState<string | number | null>(null);
  
  // Utils for date handling
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

  const showSelectedTeacherTimetable = useMemo(() => {
    return !!selectedSourceTeacherId && !!selectedDate;
  }, [selectedSourceTeacherId, selectedDate]);

  const showSelectableOptions = useMemo(() => {
    return !!selectedDailyLesson;
  }, [selectedDailyLesson]);

  const showTargetTeacherTimetable = useMemo(() => {
    return !!selectedTargetTeacherId;
  }, [selectedTargetTeacherId]);

  const isReadOnly = useMemo(() => {
    return !selectedDailyLesson;
  }, [selectedDailyLesson]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return selectedLessonDays.length > 0
      ? `${(100 - headerWidth) / selectedLessonDays.length}%`
      : "auto";
  }, [selectedLessonDays]);

  const selectedTargetTeacherInfo = useMemo(() => {
    if (!selectedTargetTeacherId) return null;

    const teacherName = teacherMap[selectedTargetTeacherId]?.teacherName || "";
    const courseNames = (teacherCourseBaseMap[selectedTargetTeacherId] || [])
      .map(({ courseBaseId }) => courseBaseMap[courseBaseId]?.displayedTitle || "")
      .sort((a, b) => a.localeCompare(b))
      .join(" ");
    return { teacherName, courseNames };
  }, [selectedTargetTeacherId]);

  const lessonDaysForTargetTeacher = useMemo(() => {
    if (!selectedDailyLesson) return null;

    const weeks = 1;
    const [ startDate, _ ] = TimeUtils.getWeekRange(selectedDailyLesson.lessonDate);
    return TimeUtils.generateLessonDays(startDate, weeks)
      .filter((lessonDay: LessonDay) =>
        activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
      );
  }, [selectedDailyLesson]);

    const isClickableToSave = useMemo(() => {
      return !!selectedTargetTeacherId && !!selectedDailyLesson;
    }, [selectedTargetTeacherId, selectedDailyLesson]);

  // === Renderers ===
  const renderSelectedTeacherDailyLesson = (lessonDate: number, period: number) => {
    const lesson = sourceTeacherDailyLessons.find(l => l.lessonDate === lessonDate && l.period === period);

    if (!lesson) {
      return null;
    }

    const isReadOnly = 
      period > (timetableConfig?.maxPeriod || 7) ||
      lesson.changeType !== TimetableDailyLessonChangeType.None;

    const isDisabled = (lesson || selectedDailyLesson).changeType !== TimetableDailyLessonChangeType.None;

    const isSelected = (
      !!selectedDailyLesson && 
      selectedDailyLesson.dailyLessonId === lesson.dailyLessonId
    );

    const isEvent = lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = !!lesson && lesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const option = {
      isSelected,
      isDisabled,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isReadOnly,
      isEvent,
      isRemoved,
      isDuplicated
    } as DailyLessonButtonOption;

    if (lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = sourceTeacherDailyLessons
        .filter(l => lesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      lesson.className = buildClassNameFromLessons(combinedLessons);
    }

    if (lesson.concurrentCourseId) {
      const isCombined = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass;
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(sourceTeacherDailyLessons, lesson)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        lesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
      }
    }

    if(hoveredId && lesson?.consecutiveGroupId) {
      option.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
    }

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = sourceTeacherDailyLessons.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.lessonDate === lessonDate
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
    }

    if (lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedClasses = sourceTeacherDailyLessons
          .filter(l => lesson.combinedGroupId === l.combinedGroupId)
          .map(l => classMap[l.classId])
          .filter(c => c !== null)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);

      const representativeClass = combinedClasses.length > 0 ? combinedClasses[0] : null;
      const extraCount = combinedClasses.length > 1 ? combinedClasses.length - 1 : 0;

      lesson.className = `${representativeClass ? TimetableDisplayUtils.formatFullClassName(representativeClass) : ''}${extraCount > 0 ? ` 외 ${extraCount}개반` : ''}`;
    }

    // const isSelectedDailyLesson = (selectedDailyLesson &&
    //   selectedDailyLesson.lessonDate === lessonDate &&
    //   selectedDailyLesson.period === period
    // );

    // if(selectedDailyLesson && !isSelectedDailyLesson) {

    //   option.isDisabled = false;
    // }

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
        onClick={handleClickDailyLesson}
        onMouseOver={handleMouseOverDailyLesson}
        onMouseLeave={handleMouseLeaveDailyLesson}
        onClickCancel={handleClickCancelSelection}
      />
    );
  };

  const renderTargetTeacherDailyLesson = (lessonDate: number, period: number) => {
    const isTargetLesson = (
      selectedDailyLesson &&
      selectedDailyLesson.lessonDate === lessonDate &&
      selectedDailyLesson.period === period
    );

    const lesson = isTargetLesson 
      ? adjustedDailyLesson
      : targetTeacherDailyLessons.find(l => l.lessonDate === lessonDate && l.period === period);

    if (!lesson) {
      return null;
    }

    const isEvent = lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = !!lesson && lesson.changeType === TimetableDailyLessonChangeType.Duplication;

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
      isDuplicated
    } as DailyLessonButtonOption;

    if(hoveredId && lesson?.consecutiveGroupId) {
      option.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
    }

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = targetTeacherDailyLessons.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.lessonDate === lessonDate
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
    }

    if (lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = targetTeacherDailyLessons
        .filter(l => lesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      lesson.className = buildClassNameFromLessons(combinedLessons);
    }

    if (lesson.concurrentCourseId) {
      const isCombined = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass;
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(targetTeacherDailyLessons, lesson)
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
        // onClick={handleClickDailyLesson}
      />
    );
  };


  // === API ===
  const fetchTeacherDailyLessons = async () => {
    if (!timetableId || !selectedStartLessonDate || !selectedEndLessonDate || !selectedSourceTeacherId) {
      return;
    }

    const api = new Hc2Timetables();
    const { lessonDate: startDate } = selectedStartLessonDate;
    const { lessonDate: endDate } = selectedEndLessonDate;
    const query = {
      teacherId: selectedSourceTeacherId
    };
    
    try {
      const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
        timetableId,
        startDate,
        endDate,
        query
      );

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      setSourceTeacherDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
    }
  };

  const fetchAdjustmentOptions = async (lesson: DailyLesson) => {
    if (!timetableId || !lesson) return;

    const api = new Hc2Timetables();
    const params = {
      lessonDate: selectedDailyLesson.lessonDate,
      period: selectedDailyLesson.period
    };
    
    try {
      const res = await api.getTeacherOptionsForAdjustmentCountbyteachers(
        timetableId,
        params
      );

      const { teacherOptions } = (res.data as EmbeddedListResponse<TeacherOption>)._embedded;
      setSortedTeacherOptions(teacherOptions);
    } catch (error) {
      console.error("Error fetching adjustment options:", error);
    }
  };

  const setSortedTeacherOptions = (teacherOptions: TeacherOption[]) => {
    if (!selectedDailyLesson) return;

    const teacherInfoMap = teacherOptions.reduce((acc, option) => {
      const grades = (lessonConfsMapByTeacher[option.teacherId] || [])
        .map(lc => classMap[lc.classId]?.grade || null)
        .filter(grade => grade !== null);
      const courseNames = (teacherCourseBaseMap[option.teacherId] || [])
        .map(({ courseBaseId }) => courseBaseMap[courseBaseId]?.displayedTitle || "")
        .sort((a, b) => a.localeCompare(b))
        .join(", ");
      const teacherName = teacherMap[option.teacherId]?.teacherName || "";

      acc[option.teacherId] = {
        grades,
        courseNames,
        teacherName
      };
      return acc;
    }, {} as Record<string, TeacherInfo>);

    const selectedLessonGrade = classMap[selectedDailyLesson.classId]?.grade;
    const sortedOptions = teacherOptions
      .map(option => {        
        const info = teacherInfoMap[option.teacherId];
        if(!info) {
          return option;
        }

        option.teacherName = `${info.teacherName}${info.courseNames ? " (" + info.courseNames + ")" : ""}`;        
        return option;
      })
      .sort((a, b) => {
        const teacherA = teacherInfoMap[a.teacherId];
        const teacherB = teacherInfoMap[b.teacherId];

        // 동일 학년 우선 정렬
        const hasA = selectedLessonGrade !== null && teacherA.grades.includes(selectedLessonGrade);
        const hasB = selectedLessonGrade !== null && teacherB.grades.includes(selectedLessonGrade);
        if (hasA !== hasB) return hasA ? -1 : 1;

        // 과목명 오름차순 정렬
        const courseCompare = teacherA.courseNames.localeCompare(teacherB.courseNames);
        if (courseCompare !== 0) return courseCompare;

        // 교사명 정렬
        return (teacherA.teacherName || "").localeCompare(teacherB.teacherName || "");
      });

    setTeacherOptions(sortedOptions);
    setSelectedTargetTeacherId(!!sortedOptions ? sortedOptions[0].teacherId : null);
  };

  const handleClickSaveLessonChange = async () => {
    if (!timetableId || !selectedDailyLesson) return;

    const api = new Hc2Timetables();
    const payload = {
      // status: TimetableLessonChangeStatus.Completed,
      status: null,
      sourceLesson: selectedDailyLesson,
      targetTeacherId: selectedTargetTeacherId,
      reason
    };

    try {
      const { requestAdjustmentForTeacherAdjustmentrequests, requestToChangeForAdjustmentAdjustments } = api;

      let res = null;
      
      if(isManagerView) {
        payload.status = TimetableLessonChangeStatus.Completed;
        res = await requestToChangeForAdjustmentAdjustments(timetableId, payload);
      } else {
        res = await requestAdjustmentForTeacherAdjustmentrequests(timetableId, payload);
      }

      if (res.status === 204) {
        const message = isManagerView ? '수업이 변경되었습니다.' : '수업 변경이 요청되었습니다.';
        showToast(message, 3000);
        resetAllParameters();

        dispatchLessonChangeRequestCountRefresh();
      }

    } catch (error) {
      console.error("Error saving lesson change:", error);
      showToast('결/보강 저장 중 오류가 발생했습니다.', 3000);
    }
  };

  const fetchTargetTeacherDailyLessons = async () => {
    if (!timetableId || !selectedTargetTeacherId) return;

    const api = new Hc2Timetables();
    const queryParam = {
      teacherId: selectedTargetTeacherId
    };

    const [ startDate, endDate ] = TimeUtils.getWeekRange(selectedDailyLesson.lessonDate);
    
    try {
      const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
        timetableId,
        startDate,
        endDate,
        queryParam
      );
      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      setTargetTeacherDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching target teacher daily lessons:", error);
    }
  };

  //////////////////////////////////////////////////////////////
  //// 기초 동시 합반인 경우, 포함하여 처리하도록 로직 수정 필요
  //////////////////////////////////////////////////////////////
  const transformToAdjustedLesson = (lesson: DailyLesson) => {
    const adjustedLesson = JSON.parse(JSON.stringify(lesson));
    adjustedLesson.changeType = TimetableDailyLessonChangeType.Adjustment;
    adjustedLesson.lessonTeacherIds = [ selectedTargetTeacherId ];
    adjustedLesson.consecutiveGroupId = null;
    return adjustedLesson;
  };

  // === Methods ===
  const handleClose = () => {
    resetAllParameters();
    onClose && onClose();
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

  const handleSelectTeacher = async (teacherName: string) => {
    const teacher = teacherList.find(t => t.text === teacherName);
    const updated = teacher ? teacher.value : null;
    const isChanged = selectedSourceTeacherId !== updated;

    setSelectedSourceTeacherName(teacherName);
    setSelectedSourceTeacherId(updated);
    setSourceTeacherDailyLessons(prev => isChanged ? [] : prev);
    resetSelectedDailyLesson();
  };

  const handleChangeSelectedDate = (closedTimestamp: number) => {
    const updated = TimeUtils.getTimestampToNumber(closedTimestamp);
    const ischanged = selectedDate !== updated;
    setSelectedDate(updated);
    setSourceTeacherDailyLessons(prev => ischanged ? [] : prev);
    resetSelectedDailyLesson();
  };

  const resetAllParameters = () => {
    setSelectedDate(TimeUtils.getTodayAsNumber());
    setSourceMaxPeriod(null);
    setTargetMaxPeriod(null);
    setTeacherOptions([]);
    setSourceTeacherDailyLessons([]);
    setTargetTeacherDailyLessons([]);
    setSelectedSourceTeacherName("");
    setSelectedSourceTeacherId("");
    setSelectedTargetTeacherId(null);
    setSelectedDailyLesson(null);
    setAdjustedDailyLesson(null);
    setReason("");
  };

  const resetSelectedDailyLesson = () => {
    setTeacherOptions([]);
    setTargetTeacherDailyLessons([]);
    setSelectedTargetTeacherId(null);
    setSelectedDailyLesson(null);
    setAdjustedDailyLesson(null);
    setReason("");
  };

  const handleClickDailyLesson = (lesson: DailyLesson) => {
    resetSelectedDailyLesson();
    const isSelected = !!selectedDailyLesson && selectedDailyLesson.dailyLessonId === lesson.dailyLessonId;
    setSelectedDailyLesson(isSelected ? null : lesson);
    setAdjustedDailyLesson(isSelected ? null : transformToAdjustedLesson(lesson));
  }

  const handleClickCancelSelection = () => {
    resetSelectedDailyLesson();
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
    if (!selectedDate || !selectedSourceTeacherId) return;
    fetchTeacherDailyLessons();
  }, [timetableId, selectedDate, selectedSourceTeacherId, selectedStartLessonDate, selectedEndLessonDate ]);

  useEffect(() => {
    if (!selectedDailyLesson) return;

    fetchAdjustmentOptions(selectedDailyLesson);
  }, [selectedDailyLesson]);

  useEffect(() => {
    if (!selectedTargetTeacherId) return;

    fetchTargetTeacherDailyLessons();
  }, [selectedTargetTeacherId])

  useEffect(() => {
    if (sourceTeacherDailyLessons.length === 0) {
      setSourceMaxPeriod(timetableConfig?.maxPeriod || 7);
      return;
    }

    const configMax = timetableConfig?.maxPeriod || 7;
    const maxLessonPeriod = Math.max(...sourceTeacherDailyLessons.map(lesson => lesson.period));
    setSourceMaxPeriod(Math.max(configMax, maxLessonPeriod));
  }, [sourceTeacherDailyLessons]);

  useEffect(() => {
    if (targetTeacherDailyLessons.length === 0) {
      setTargetMaxPeriod(timetableConfig?.maxPeriod || 7);
      return;
    }

    const configMax = timetableConfig?.maxPeriod || 7;
    const maxLessonPeriod = Math.max(...targetTeacherDailyLessons.map(lesson => lesson.period), selectedDailyLesson?.period);
    setTargetMaxPeriod(Math.max(configMax, maxLessonPeriod));
  }, [targetTeacherDailyLessons]);

  useEffect(() => {
    if (
      !!options && 
      options.lessonDate &&
      options.teacherId &&
      options.dailyLesson
    ) {
      setSelectedDailyLesson(options.dailyLesson);
      setAdjustedDailyLesson(transformToAdjustedLesson(options.dailyLesson));
      setSelectedSourceTeacherId(options.teacherId);
      setSelectedSourceTeacherName(
        teacherList.find(t => t.value === options.teacherId)?.text || ""
      );
      setSelectedDate(options.lessonDate);
    }
  }, [options, teacherList]);

  return (
    <>
      {/* 교사 선택 */}
      <div className="form-group-inline">
        <label>교사 선택</label>
        <AutocompleteInput
            value={selectedSourceTeacherName}
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
      </div>

      {/* 교사 미선택 nodata */}
      {!showSelectedTeacherTimetable && (
        <div className="hi-nodata">
          <p>교사를 선택하세요.</p>
        </div>
      )}
      
      {/* 선택 교사 시간표 */}
      <div className={`${styles["course-supplement"]}`}>
      {showSelectedTeacherTimetable && (
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
              {sourceMaxPeriod && Array.from({ length: sourceMaxPeriod }).map((_, periodIdx) => (
                <tr key={`selected-period-index-${periodIdx}-${selectedSourceTeacherId}-${selectedDate}`}>
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
      )}

        {/* <div className="table-content time-table mt-5">
          <table>
            <caption>시간표</caption>
            <colgroup>
              <col style={{ width: "2.5%" }} />
              {Array.from({ length: 15 }).map((_, idx) => (
                <col key={idx} style={{ width: "6.5%" }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th>3/4(월)</th>
                <th>3/5(화)</th>
                <th>3/6(수)</th>
                <th>3/7(목)</th>
                <th>3/8(금)</th>
                <th>3/11(월)</th>
                <th>3/12(화)</th>
                <th>3/13(수)</th>
                <th>3/14(목)</th>
                <th>3/15(금)</th>
                <th>3/18(월)</th>
                <th>3/19(화)</th>
                <th>3/20(수)</th>
                <th>3/21(목)</th>
                <th>3/22(금)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="th">1</td>
                <td>
                  <button type="button" className="btn-table-cell">
                    <div className="class-name">2-3</div>
                    <div className="course-name">사문탐</div>
                  </button>
                </td>
                <td>
                  <button type="button" className="btn-table-cell edit-course">
                    <div className="class-name">
                      <span className="badge change">교체</span>2-3
                    </div>
                    <div className="course-name">사문탐</div>
                  </button>
                </td>
                <td>
                  <button type="button" className="btn-table-cell">
                    <div className="badges">
                      <span className="badge concurrent">동시</span>
                    </div>
                    <div className="class-name">2-1</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    data-consecutive-id="group1"
                    onMouseEnter={() => setHoveredId("group1")}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`btn-table-cell consecutive-course fst ${
                      hoveredId === "group1" ? "hovered" : ""
                    }`}
                  >
                    <div className="badges">
                      <span className="badge concurrent">동시</span>
                      <span className="badge fixed">고정</span>
                    </div>
                    <div className="class-name">2-4</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td></td>
                <td>
                  <button type="button" className="btn-table-cell selected">
                    <div className="class-name">2-3</div>
                    <div className="course-name">사문탐</div>
                  </button>
                </td>
                <td>
                  <button type="button" className="btn-table-cell selected">
                    <div className="class-name">
                      <span className="badge change">교체</span>2-3
                    </div>
                    <div className="course-name">사문탐</div>
                  </button>
                </td>
                <td>
                  <button type="button" className="btn-table-cell selected">
                    <div className="badges">
                      <span className="badge concurrent">동시</span>
                    </div>
                    <div className="class-name">2-1</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-table-cell consecutive-course fst selected"
                  >
                    <div className="badges">
                      <span className="badge concurrent">동시</span>
                      <span className="badge fixed">고정</span>
                    </div>
                    <div className="class-name">2-4</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td></td>
                <td>
                  <button type="button" className="btn-table-cell" disabled>
                    <div className="class-name">2-3</div>
                    <div className="course-name">사문탐</div>
                  </button>
                </td>
                <td>
                  <button type="button" className="btn-table-cell" disabled>
                    <div className="class-name">
                      <span className="badge change">교체</span>2-3
                    </div>
                    <div className="course-name">사문탐</div>
                  </button>
                </td>
                <td>
                  <button type="button" className="btn-table-cell" disabled>
                    <div className="badges">
                      <span className="badge concurrent">동시</span>
                    </div>
                    <div className="class-name">2-1</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-table-cell consecutive-course fst"
                    disabled
                  >
                    <div className="badges">
                      <span className="badge concurrent">동시</span>
                      <span className="badge fixed">고정</span>
                    </div>
                    <div className="class-name">2-4</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td></td>
              </tr>
              <tr>
                <td className="th">2</td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button
                    type="button"
                    data-consecutive-id="group1"
                    onMouseEnter={() => setHoveredId("group1")}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`btn-table-cell consecutive-course ${
                      hoveredId === "group1" ? "hovered" : ""
                    }`}
                  >
                    <div className="class-name">2-4</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button
                    type="button"
                    className="btn-table-cell consecutive-course selected"
                  >
                    <div className="class-name">2-4</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td></td>
                <td>
                  <button type="button" className="btn-table-cell" disabled />
                </td>
                <td>
                  <button type="button" className="btn-table-cell" disabled />
                </td>
                <td>
                  <button type="button" className="btn-table-cell" disabled />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-table-cell consecutive-course"
                    disabled
                  >
                    <div className="class-name">2-4</div>
                    <div className="course-name">공통사회</div>
                  </button>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div> */}

        {/* 보강 가능 교사 + 개별 교사 시간표 */}
        {(showSelectableOptions || showTargetTeacherTimetable) && (
        <div className="gray-box !mt-5">
          <div className="tb-row">
            {/* 보강 가능 교사 패널 */}
            {showSelectableOptions && (
              <div className="tb-col">
                <div className="panel">
                  <div className="panel-body md">
                    <div className={styles["panel-tit"]}>
                      <div className={styles["tit"]}>
                        보강 가능 선생님 총
                        <p className="text-text-primary-base !ml-1"> {teacherOptions.length}</p>명
                      </div>
                    </div>
                    <div className="table-content basic-table sticky-wrap" style={{ height: "366px" }}>
                      <table>
                        <caption>보강 가능 선생님</caption>
                        <colgroup>
                          <col style={{ width: "75%" }} />
                          <col style={{ width: "25%" }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th className="sticky-top">교사명</th>
                            <th className="sticky-top">결강수/보강수</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!!teacherOptions && teacherOptions.map(option => (
                              <tr
                                key={option.teacherId}
                                className={selectedTargetTeacherId === option.teacherId ? styles["selected-row"] : ""}
                              >
                                <td className="!text-left" onClick={() => setSelectedTargetTeacherId(option.teacherId)} style={{ cursor: "pointer" }}>{option.teacherName}</td>
                                <td>{option.absentCount}/{option.makeupCount}</td>
                              </tr>
                            ))
                          }
                          {/* <tr>
                            <td className="!text-left">김창운(음악)</td>
                            <td>1/3</td>
                          </tr>
                          <tr>
                            <td className="!text-left">
                              김서연 (음악, 음3, 진로, 과목명다섯, 국사)
                            </td>
                            <td>0/0</td>
                          </tr>
                          <tr>
                            <td className="!text-left">박민영 (수학1, 공통수학)</td>
                            <td>2/5</td>
                          </tr>
                          <tr>
                            <td className="!text-left">이민호 (영어1, 기초영어)</td>
                            <td>3/7</td>
                          </tr>
                          <tr>
                            <td className="!text-left">정지훈 (과학1, 일반과학)</td>
                            <td>4/6</td>
                          </tr>
                          <tr>
                            <td className="!text-left">김창운(음악)</td>
                            <td>1/3</td>
                          </tr>
                          <tr>
                            <td className="!text-left">
                              김서연 (음악, 음3, 진로, 과목명다섯, 국사)
                            </td>
                            <td>0/0</td>
                          </tr>
                          <tr>
                            <td className="!text-left">박민영 (수학1, 공통수학)</td>
                            <td>2/5</td>
                          </tr>
                          <tr>
                            <td className="!text-left">이민호 (영어1, 기초영어)</td>
                            <td>3/7</td>
                          </tr>
                          <tr>
                            <td className="!text-left">정지훈 (과학1, 일반과학)</td>
                            <td>4/6</td>
                          </tr> */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 개별 교사 시간표 */}
            {showTargetTeacherTimetable && (
              <div className="tb-col">
                <div className="table-content sm time-table">
                  <div className={styles["panel-tit"]}>
                    <div className={styles["tit"]}>
                      {!!selectedTargetTeacherInfo && <>{selectedTargetTeacherInfo.teacherName}</>} 선생님 <i className="divider"></i>
                      <p className="text-text-primary-base">{!!selectedTargetTeacherInfo && <>{selectedTargetTeacherInfo.courseNames}</>}</p>
                    </div>
                  </div>
                  <table className="teacher-view">
                    <caption>시간표</caption>
                    <colgroup>
                      <col style={{ width: "2.5%" }} />
                      {lessonDaysForTargetTeacher.map((d, idx) => (
                        <col key={`day-index-${idx}`} style={{ width: lessonDaysColWidth }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr>
                        <th></th>
                        {lessonDaysForTargetTeacher.map((d) => (
                          <th key={`day-header-${d.lessonDate}`}>
                            {readableLessonDay(d)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {targetMaxPeriod && Array.from({ length: targetMaxPeriod }).map((_, periodIdx) => (
                        <tr key={`selected-period-index-${periodIdx}-${selectedSourceTeacherId}-${selectedDate}`}>
                          <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                          {lessonDaysForTargetTeacher.map((d, dayIdx) => (
                            <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                              {renderTargetTeacherDailyLesson(d.lessonDate, periodIdx + 1)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    {/* <colgroup>
                      <col style={{ width: "5%" }} />
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
                    </thead>
                    <tbody>
                      <tr>
                        <td className="th">1</td>
                        <td>
                          <button type="button" className="btn-table-cell edit-course">
                            <div className="class-name">
                              <span className="badge change">교체</span>2-3
                            </div>
                            <div className="course-name">사문탐</div>
                          </button>
                        </td>
                        <td></td>
                        <td>
                          <button type="button" className="btn-table-cell">
                            <div className="badges">
                              <span className="badge concurrent">동시</span>
                            </div>
                            <div className="class-name">2-1</div>
                            <div className="course-name">A고전읽기</div>
                          </button>
                        </td>
                        <td>
                          <button type="button" className="btn-table-cell">
                            <div className="class-name">2-3</div>
                            <div className="course-name">통과</div>
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-cell consecutive-course fst"
                          >
                            <div className="badges">
                              <span className="badge concurrent">동시</span>
                              <span className="badge fixed">고정</span>
                            </div>
                            <div className="class-name">2-1</div>
                            <div className="course-name">공통사회</div>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="th">2</td>
                        <td></td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-cell assign-after"
                          >
                            <div className="class-name">
                              <span className="badge change">보강</span>사문탐
                            </div>
                            <div className="course-name">무영숙</div>
                          </button>
                        </td>
                        <td></td>
                        <td>
                          <button type="button" className="btn-table-cell">
                            <div className="class-name">2-3</div>
                            <div className="course-name">통화</div>
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-cell consecutive-course"
                          >
                            <div className="class-name">2-1</div>
                            <div className="course-name">공통사회</div>
                          </button>
                        </td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
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
      </div>

      {/* 하단 버튼 추가 */}
      <div className="btns">
        <HiButton variant='tertiary' onClick={handleClose}>취소</HiButton>
        <HiButton variant='primary' disabled={!isClickableToSave} onClick={handleClickSaveLessonChange}
        >변경하기</HiButton>
      </div>
    </>
  );
};

export default CourseSupplement;
