// @File: addition.tsx
// @Description: 수업변경 : 수업추가
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
  Course, Class, TeacherCourse, Teacher, DailyLesson, 
  LessonConf, TimetableDailyLessonType, TimetableDailyLessonChangeType, TimetableLessonChangeStatus, ConcurrentConf, 
  TeacherCourseBase,
  CourseBase,
  TimetableIndex,
  SpecialtyRoom
} from "../../core/types";
import { LessonDay, ActivateWeekday, EmbeddedListResponse } from "../../common/types";
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import { TimetableDataUtils } from "../../core/mod/utils"

import { Hc2Timetables } from "../../apis"

import React, { useState, useRef, useMemo, useEffect } from "react";

import DailyLessonButton, { DailyLessonButtonOption } from "../components/dailyLessonButton";

import { showToast } from '@/unimplementeds/toast.js'
import AutocompleteInput from "../../../uiux/autocompleteInput";
import { HiInput, HiSelectBox } from '@/components/uiux';
import styles from "./addition.module.scss"; // 로컬 모듈 스타일
import { DatetimePicker } from "../../components/datetimePicker";
import { TimeUtils, TimetableDisplayUtils, TypeUtils } from "../../common/utils";

import { v4 as uuidv4 } from 'uuid';
import { set } from 'lodash';
import { HiButton } from '@/components/uiux/hiButton';
import { dispatchLessonChangeRequestCountRefresh } from '../../common/events';

interface Props {
  selectedTimetable: TimetableIndex | null;
  onClose?: () => void;
  isManagerView: boolean;
}

const CourseAddition: React.FC<Props> = ({ selectedTimetable, onClose, isManagerView }) => {

  // 시간표 분리. lessonconf 대체
  interface TeacherCourseClassOptions {
    title: string;
    value: string;
    grade: number;
    classId: string;
    courseId: string;
    classNumber: number;
  }

  // === Contexts ===
  const [maxPeriod, setMaxPeriod] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number | null>(1);

  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const teacherCourses = useTeacherCourseContext();
  // const lessonConfs = useLessonConfContext();
  // const concurrentConfs = useConcurrentConfContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const courseBases = useCourseBaseContext();
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

  const specialtyRoomMap = useMemo(
      () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
      [specialtyRooms]
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
  const lessonConfsMapByTeacher = useMemo(
    () => lessonConfContext.lessonConfsMapByTeacher || ({} as Record<string, LessonConf[]>),
    [lessonConfs]
  );

  const lessonConfMap = useMemo(
    () => lessonConfContext.lessonConfMap || ({} as Record<string, LessonConf>),
    [lessonConfs]
  )

  const lessonConfMapByMultipleTeacher = useMemo(
    () => lessonConfContext.lessonConfMapByMultipleTeacher || ({} as Record<string, LessonConf[]>),
    [lessonConfs]
  );

  const concurrentConfMap = useMemo(
    () => concurrentConfContext.concurrentConfMap || ({} as Record<string, ConcurrentConf>),
    [concurrentConfs]
  );
  */

  const initialDate = Math.max(selectedTimetable?.operationStartDate || TimeUtils.getTodayAsNumber(), TimeUtils.getTodayAsNumber());

  // === States ===
  const [ classDailyLessons, setClassDailyLessons ] = useState<DailyLesson[]>([]);
  const [ teacherDailyLessons, setTeacherDailyLessons ] = useState<DailyLesson[]>([]);
  const [ selectedDate, setSelectedDate ] = useState<number | null>(initialDate);
  // const [ selectedLessonConfId, setSelectedLessonConfId ] = useState<string | null>(null);
  const [ selectedCourseClassOptionKey, setSelectedCourseClassOptionKey ] = useState<string | null>(null);
  const [ selectedTeacherName, setSelectedTeacherName ] = useState<string>("");
  const [ selectedTeacherId, setSelectedTeacherId ] = useState<string>("");
  const [ selectedDailyLesson, setSelectedDailyLesson ] = useState<DailyLesson | null>(null);
  const [ reason, setReason ] = useState("");
  // const [ reasonInputResetKey, setReasonInputResetKey ] = useState(0);

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
    return period + (startPeriod || 1);
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
  };

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
        /*
        const lessonConfs = (lessonConfsMapByTeacher[teacher.teacherId] || [])
          .filter(lc => !lc.concurrentCourseId);
        if (lessonConfs.length === 0) return;
        */

        const courseBases = (teacherCourseBaseMap[teacher.teacherId] || []).map(
          ({ courseBaseId }) => courseBaseMap[courseBaseId]
        ) as CourseBase[];
        if (courseBases.length === 0) return
        const courseNames = TimetableDataUtils.courseBaseNames(courseBases).sort().join(", ");

        return {
          text: `${teacher.teacherName} ${courseNames ? "(" + courseNames + ")" : ""}`,
          value: teacher.teacherId,
        };
      })
      .filter(item => !!item)
      .sort((a, b) => a.text.localeCompare(b.text));

  }, [teacherCourseBases, courseBases, teachers]);

  const selectedTeacherCourses = useMemo(() => {
    if (!selectedTeacherId) return [];
    const courseBases = (teacherCourseBaseMap[selectedTeacherId] || []).map(
      ({ courseBaseId }) => courseBaseMap[courseBaseId]
    ) as CourseBase[];
    return TimetableDataUtils.courseBaseNames(courseBases).sort().join(" ");
  }, [selectedTeacherId]);

  const courseClassOptionsByTeacherId = useMemo(() => {
    if (!selectedTeacherId || !teacherDailyLessons) return [];

    // teacherDailyLessons 에서 고유한 classId, courseId 조합 추출
    const uniqueOptions = new Map<string, TeacherCourseClassOptions>();
    teacherDailyLessons
      .filter(lesson => lesson.changeType === TimetableDailyLessonChangeType.None && !lesson.concurrentCourseId)
      .forEach(lesson => {
        const clsCrsKey = `${lesson.classId}_${lesson.courseId}`;
        if (!uniqueOptions.has(clsCrsKey)) {
          uniqueOptions.set(clsCrsKey, {
            title: `${TimetableDisplayUtils.formatFullClassName(classMap[lesson.classId])} ${courseMap[lesson.courseId].displayedTitle}`,
            value: clsCrsKey,
            grade: classMap[lesson.classId].grade,
            classId: lesson.classId,
            courseId: lesson.courseId,
            classNumber: classMap[lesson.classId].classNumber
          });
        }
      });

    if(uniqueOptions.size === 0) {
      return [
        {
            title: `선택 가능한 과목이 없습니다.`,
            value: null,
            grade: null,
            classId: null,
            courseId: null,
            classNumber: null
          }
      ];
    }

    return Array.from(uniqueOptions.values()).sort((a, b) => a.grade === b.grade ? a.classNumber - b.classNumber : a.grade - b.grade);

    /*
    return (lessonConfsMapByTeacher[selectedTeacherId] || [])
      .filter(lessonConf => !lessonConf.concurrentCourseId)
      .map((lessonConf) => {
        const course = courseMap[lessonConf.courseId];
        const clazz = classMap[lessonConf.classId];

        return {
          title: `${TimetableDisplayUtils.formatFullClassName(clazz)} ${course.displayedTitle}`,
          value: lessonConf.lessonConfId,
          grade: clazz.grade,
          classNumber: clazz.classNumber
        }
      })
      .sort((a, b) => a.grade === b.grade ? a.classNumber - b.classNumber : a.grade - b.grade);
    */
  }, [selectedTeacherId, teacherDailyLessons]);

  const isReadOnly = useMemo(() => {
    return !selectedDailyLesson;
  }, [selectedDailyLesson]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return selectedLessonDays.length > 0
      ? `${(100 - headerWidth) / selectedLessonDays.length}%`
      : "auto";
  }, [selectedLessonDays]);

  const showClassTimetable = useMemo(() => {
    return !!selectedDate && !!selectedTeacherId && !!selectedCourseClassOptionKey;
  }, [selectedDate, selectedTeacherId, selectedCourseClassOptionKey]);

  const showTeacherTimetable = useMemo(() => {
    return !!selectedDailyLesson;
  }, [selectedDailyLesson]);

  const isClickableToSave = useMemo(() => {
    return !!selectedDailyLesson;
  }, [selectedDailyLesson]);

  // === Renderers ===
  const renderSelectedClassDailyLesson = (lessonDate: number, period: number) => {    
    const isAddedDailyLesson = (
      !!selectedDailyLesson &&
      selectedDailyLesson.lessonDate === lessonDate &&
      selectedDailyLesson.period === period
    );

    const lesson = isAddedDailyLesson 
      ? selectedDailyLesson
      : classDailyLessons.find(lesson => lesson.lessonDate === lessonDate && lesson.period === period);

    // const lessonConf = lessonConfMap[selectedLessonConfId];

    const isEvent = !!lesson && lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = !!lesson && lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = !!lesson && lesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const option = {
      isDisabled: false,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isSourceLesson: false,
      // isTargetLesson: !!lesson && lessonConf.courseId === lesson.courseId,
      isTargetLesson: false,
      isReadOnly: !!lesson && !isAddedDailyLesson,
      isEmptyCellSelectable: classDailyLessons.length > 0 && !lesson,
      isEvent,
      isRemoved,
      isDuplicated,
      isTimetableByClass: true
    } as DailyLessonButtonOption;

    // 동시 수업이면서 합반인 경우, 모든 학반 명 표시
    if (!!lesson && !!lesson.concurrentCourseId) {
      // const isCombined = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass;
      const isCombined = !!lesson.combineConfId; // @TODO: <- 처리 필요
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(teacherDailyLessons, lesson)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        lesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
      }
      option.isReadOnly = true;
    } 

    if (!!lesson && lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = teacherDailyLessons
        .filter(l => lesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      lesson.className = buildClassNameFromLessons(combinedLessons);
    }

    if(lesson && lesson.consecutiveGroupId) {
      // 연속 수업인 경우, 첫번째 수업인지 여부 확인: 단순히 css 처리 위함
      const consecutiveLessons = classDailyLessons.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.lessonDate === lessonDate
      )
      .sort((a, b) => a.period - b.period);

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
        onClick={handleClickDailyLesson}
        onClickCancel={handleClickCancelSelection}
      />
    );
  }

  const renderSelectedTeacherDailyLesson = (lessonDate: number, period: number) => {
    const isAddedDailyLesson = (
      !!selectedDailyLesson &&
      selectedDailyLesson.lessonDate === lessonDate &&
      selectedDailyLesson.period === period
    );

    const lesson = isAddedDailyLesson 
      ? selectedDailyLesson
      : teacherDailyLessons.find(lesson => lesson.lessonDate === lessonDate && lesson.period === period);

    if (!lesson) {
      return null;
    }

    const isEvent = lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = !!lesson && lesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const option = {
      isTargetLesson: isAddedDailyLesson,
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

    // 동시 수업이면서 합반인 경우, 모든 학반 명 표시
    if (!!lesson && !!lesson.concurrentCourseId) {
      // const isCombined = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass;
      const isCombined = !!lesson.combineConfId; // @TODO: <- 처리 필요
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(teacherDailyLessons, lesson)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        lesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
      }
      option.isReadOnly = true;
    } 

    if (!!lesson && lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = teacherDailyLessons
        .filter(l => lesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      lesson.className = buildClassNameFromLessons(combinedLessons);
    }

    if(lesson && lesson.consecutiveGroupId) {
      const consecutiveLessons = teacherDailyLessons.filter(l =>
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
  }

  // === API ===
  const fetchClassDailyLessons = async () => {
    if (!timetableId || !selectedStartLessonDate || !selectedEndLessonDate || !selectedTeacherId || !selectedCourseClassOptionKey) {
      console.warn("fetchTeacherDailyLessons: timetableId or lesson days are not set");
      return;
    }

    const api = new Hc2Timetables();
    const { lessonDate: startDate } = selectedStartLessonDate;
    const { lessonDate: endDate } = selectedEndLessonDate;
    const courseClassOption = courseClassOptionsByTeacherId.find(option => option.value === selectedCourseClassOptionKey);
    const classId = courseClassOption?.classId;
    
    //const classId = lessonConfMap[selectedCourseClassOptionKey]?.classId;

    if (!classId) {
      return;
    }

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
  }

  const fetchTeacherDailyLessons = async () => {
    if (!timetableId || !selectedStartLessonDate || !selectedEndLessonDate || !selectedTeacherId) return;

    const api = new Hc2Timetables();
    const { lessonDate: startDate } = selectedStartLessonDate;
    const { lessonDate: endDate } = selectedEndLessonDate;
    const query = {
      teacherId: selectedTeacherId
    };

    try {
      const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
        timetableId,
        startDate,
        endDate,
        query
      );

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      setTeacherDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
    }
  };

  const handleClickSaveLessonChange = async () => {
    if (!timetableId || !selectedDailyLesson) return;

    const api = new Hc2Timetables();
    const payload = {
      status: null,
      targetLesson: selectedDailyLesson,
      reason,
    };

    try {
      const { requestAdditionForTeacherAdditionrequests, requestToCreateForAdditionAdditions } = api;

      let res = null;
      if(isManagerView) {
        payload.status = TimetableLessonChangeStatus.Completed;
        res = await requestToCreateForAdditionAdditions(timetableId, payload);                
      }
      else {        
        res = await requestAdditionForTeacherAdditionrequests(timetableId, payload);
      }

      if (res.status === 204) {
        showToast('수업이 추가되었습니다.', 3000);
        resetAllParameters();

        dispatchLessonChangeRequestCountRefresh();
      }
    } catch (error) {
      console.error("Error patching daily lesson:", error);
    }
  }

  // === Methods ===
  const handleClose = () => {
    resetAllParameters();
    onClose && onClose();
  }

  const getCombinedClassNames = (lesson: DailyLesson) => {
    return teacherDailyLessons
      .filter(l =>
        l.lessonDate === lesson.lessonDate && l.period === lesson.period && l.concurrentCourseId === lesson.concurrentCourseId
      )
      .map(l => {
        const clazz = classMap[l.classId];
        return clazz ? TimetableDisplayUtils.formatClassName(clazz) : null;
      })
      .filter(name => name !== null)
      .join(", ");
  };

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

  const resetAllParameters = () => {
    setSelectedDate(TimeUtils.getTodayAsNumber());
    setSelectedTeacherName("");
    setSelectedTeacherId("");
    setSelectedCourseClassOptionKey(null);
    // setSelectedLessonConfId(null);
    setClassDailyLessons([]);
    setTeacherDailyLessons([]);
    setSelectedDailyLesson(null);
    setReason("");
    // setReasonInputResetKey(prev => prev + 1);
  };

  const resetSelectedDailyLesson = () => {
    setSelectedDailyLesson(null);
    setReason("");
  };
  
  const handleSelectTeacher = async (teacherName: string) => {
    const teacher = teacherList.find(t => t.text === teacherName);
    const updated = teacher ? teacher.value : null;
    const isChanged = selectedTeacherId !== updated;

    setClassDailyLessons(prev => isChanged ? [] : prev);
    setSelectedCourseClassOptionKey(prev => isChanged ? "" : prev);
    
    setTeacherDailyLessons([]);
    resetSelectedDailyLesson();

    setSelectedTeacherName(teacherName);
    setSelectedTeacherId(teacher ? teacher.value : null);
  };

  const handleChangeSelectedDate = (closedTimestamp: number) => {
    const updated = TimeUtils.getTimestampToNumber(closedTimestamp);
    const ischanged = selectedDate !== updated;
    
    setSelectedDate(updated);
    setClassDailyLessons(prev => ischanged ? [] : prev);
    resetSelectedDailyLesson();
  };

  const handleClickDailyLesson = async (lesson: DailyLesson, lessonDate: number, period: number) => {
    // const lesConf = lessonConfMap[selectedLessonConfId];
    // if (!lesConf) return;

    // @TODO: 수업 추가 로직

    const courseClassOption = courseClassOptionsByTeacherId.find(option => option.value === selectedCourseClassOptionKey);

    if (!courseClassOption) {
      return;
    }

    const sourceLesson = teacherDailyLessons.filter(l => l.lessonType === TimetableDailyLessonType.Lesson)
      .find(l => 
        l.classId === courseClassOption.classId &&
        l.courseId === courseClassOption.courseId
      );

    if(!sourceLesson) {
      return;
    }

    const lessonTeacherIds = [...sourceLesson.lessonTeacherIds || []];

    const dailyLessontoAdd = {
      dailyLessonId: uuidv4(),
      timetableId: timetableId,
      lessonType: TimetableDailyLessonType.Lesson,
      classId: courseClassOption.classId,
      lessonDate,
      dayOfWeek: TimeUtils.getDayOfWeek(lessonDate),
      period,
      courseId: courseClassOption.courseId,
      specialtyRoomId: sourceLesson.specialtyRoomId,
      isVirtualClass: sourceLesson.isVirtualClass,
      changeType: TimetableDailyLessonChangeType.Addition,
      isRemoved: false,
      isMoved: false,
      courseName: courseMap[courseClassOption.courseId]?.displayedTitle || "",
      lessonTeacherIds,
      concurrentCourseId: sourceLesson.concurrentCourseId || null,
      
    } as DailyLesson;

    setSelectedDailyLesson(dailyLessontoAdd);

    // await fetchTeacherDailyLessons();
  };

  const handleClickCancelSelection = () => {
    resetSelectedDailyLesson();
  };

  const handleChangeCourseClassOptionKey = (courseClassOptionKey: string) => {
    if(!courseClassOptionKey) {
      return;
    }

    const isChanged = selectedCourseClassOptionKey !== courseClassOptionKey;
    setSelectedCourseClassOptionKey(courseClassOptionKey);
    setClassDailyLessons(prev => isChanged ? [] : prev);
    resetSelectedDailyLesson();
  }


  /*
  const handleChangeLessonConfId = (lessonConfId: string) => {
    const isChanged = selectedLessonConfId !== lessonConfId;
    setSelectedLessonConfId(lessonConfId);
    setClassDailyLessons(prev => isChanged ? [] : prev);
    // setTeacherDailyLessons([]);
    resetSelectedDailyLesson();
  }
  */

  // === UseEffects ===
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(initialDate);
    }

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
    if (!selectedDate || !selectedCourseClassOptionKey || !selectedTeacherId) return;
    
    fetchClassDailyLessons();
  }, [selectedDate, selectedCourseClassOptionKey, selectedTeacherId]);

  useEffect(() => {
    if (!selectedDate || !selectedTeacherId) return;
    
    fetchTeacherDailyLessons();
  }, [selectedDate, selectedTeacherId]);

  useEffect(() => {
    if (!selectedDailyLesson) {
      setMaxPeriod(timetableConfig?.maxPeriod || 7);
      return;
    }

    const configMax = timetableConfig?.maxPeriod || 7;
    const highestPeriod = Math.max(
      selectedDailyLesson.period,
      ...teacherDailyLessons.map(l => l.period)
    );

    setMaxPeriod(Math.max(configMax, highestPeriod));
  }, [selectedDailyLesson])

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
        <label className="sm ml-10">학반/과목</label>
        <HiSelectBox
          style={{width: 200}}
          value={selectedCourseClassOptionKey}
          items={courseClassOptionsByTeacherId}
          onChange={handleChangeCourseClassOptionKey}
          emptyTitle={"선택"}
          disabled={!selectedTeacherName}
        />
      </div>

      {/* 교사 미선택 nodata */}
      {!showClassTimetable && (
        <div className="hi-nodata">
          <p>교사를 선택하세요.</p>
        </div>
      )}
      {/* 학반 시간표 */}
      <div className={styles.courseAddition}>
        {showClassTimetable && (
          <div className="table-content sm time-table table-form mt-5">
            <table>
              <caption>시간표</caption>
              <colgroup>
                <col style={{ width: "2.5%" }} />
                {selectedLessonDays.map((d, idx) => (
                    <col key={`day-index-${idx}-by-class`} style={{ width: lessonDaysColWidth }} />
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
                {maxPeriod && Array.from({ length: 15 }).map((_, periodIdx) => (
                  <tr key={`selected-period-index-${periodIdx}-${selectedCourseClassOptionKey}-${selectedDate}`}>
                    <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                    {selectedLessonDays.map((d, dayIdx) => (
                      <td key={`selected-period-${periodIdx}-day-${dayIdx}-by-class`}>
                        {renderSelectedClassDailyLesson(d.lessonDate, periodIdx + 1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 수업 추가 교사 시간표 */}
        {showTeacherTimetable && (
          <>
            <div className="h4-tit !pb-4 mt-10">
              <span className='text-leading-h3 font-bold'>수업 추가 교사 시간표</span>
            </div>
            <div className="table-content sm time-table mt-6">
              <div className="h5-tit mb-3">
                <h5>
                  {teacherMap[selectedTeacherId]?.teacherName} 선생님 <i className="divider"></i>{" "}
                  <p className="text-text-primary-base">{selectedTeacherCourses}</p>
                </h5>
              </div>
              <table className="teacher-view">
                <caption>시간표</caption>
                <colgroup>
                  <col style={{ width: "2.5%" }} />
                  {selectedLessonDays.map((d, idx) => (
                      <col key={`day-index-${idx}-by-teacher`} style={{ width: lessonDaysColWidth }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    {selectedLessonDays.map((d) => (
                        <th key={`day-header-${d.lessonDate}-by-teacher`}>
                          {readableLessonDay(d)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {maxPeriod && Array.from({ length: maxPeriod }).map((_, periodIdx) => (
                    <tr key={`selected-period-index-${periodIdx}-${selectedTeacherId}-${selectedDate}-by-teacher`}>
                      <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                      {selectedLessonDays.map((d, dayIdx) => (
                        <td key={`selected-period-${periodIdx}-day-${dayIdx}-by-teacher`}>
                          {renderSelectedTeacherDailyLesson(d.lessonDate, periodIdx + 1)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      
      </div>

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

export default CourseAddition;
