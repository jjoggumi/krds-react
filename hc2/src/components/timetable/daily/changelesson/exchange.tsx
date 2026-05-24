import React, { useEffect, useMemo, useRef, useState } from "react";
import { showToast } from '@/unimplementeds/toast.js'

import styles from "./exchange.module.scss";
import { HiInput, HiSelectBox } from '@/components/uiux';
import AutocompleteInput from "../../../uiux/autocompleteInput";
import DailyLessonButton, { DailyLessonButtonOption } from "../components/dailyLessonButton";
import ReadOnlyTimetable from "../../components/readOnlyTimetable";
import { DatetimePicker } from "../../components/datetimePicker";

import { DailyTimetable } from "../../core/";
import { 
  useGradeContext, TimetableGradeContext,
  useClassContext, TimetableClassContext,
  useTeacherContext, TimetableTeacherContext,
  useCourseContext, TimetableCourseContext,
  useTeacherCourseContext, TeacherCourseContext,
  useTeacherCourseBaseContext, TeacherCourseBaseContext,
  useCourseBaseContext, TimetableCourseBaseContext,
  TimetableConcurrentConfContext,
  useConcurrentConfContext,
  useSpecialtyRoomContext,
  TimetableSpecialtyRoomContext,
} from '../../contexts';

import {
  Course,
  Class,
  TeacherCourse,
  Teacher,
  DailyLesson,
  DailyChainExchangeable,
  DailyLessonMoveInfo,
  TimetableLessonChangeStatus,
  TimetableDailyLessonChangeType,
  CourseBase,
  TeacherCourseBase,
  TimetableIndex,
  ConcurrentConf,
  DailyTimetablePeriod,
  SpecialtyRoom
 } from "../../core/types";
import { TimetableDataUtils } from "../../core/mod/utils"
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import { LessonDay, ActivateWeekday, EmbeddedListResponse } from "../../common/types";
import { TimetableDisplayUtils, TimeUtils, TypeUtils } from "../../common/utils";
import { Hc2Timetables } from "../../apis"
import { HiButton } from "@/components/uiux/hiButton";
import { dispatchLessonChangeRequestCountRefresh } from "../../common/events";

interface TimetableDailyLessonModalOptions {
  dailyLesson: DailyLesson | null;
  teacherId: string | null;
  lessonDate: number | null;
}

interface Props {
  selectedTimetable?: TimetableIndex | null;
  options?: TimetableDailyLessonModalOptions | null;
  onClose?: () => void;
  isManagerView: boolean;
}

interface HiSelectBoxItem {
  value: string | number;
  title: string;
  description?: string;
}

const ChangeLessonExchange: React.FC<Props> = ({ 
    selectedTimetable,
    options,
    onClose,
    isManagerView
   } : Props) => {
  
  const initialDate = Math.max(selectedTimetable?.operationStartDate || TimeUtils.getTodayAsNumber(), TimeUtils.getTodayAsNumber());

  const prevSelectedDateRef = useRef<number | null>(null);
  const popupRef = useRef(null);
  const calendarRef = useRef(null);

  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(initialDate);

  // 선택된 교사 이름과 id를 모두 상태로 관리
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const [teacherDailyLessons, setTeacherDailyLessons] = useState<DailyLesson[]>([]);
  const [selectedDailyLesson, setSelectedDailyLesson] = useState<DailyLesson | null>(null);
  
  const [directExchangeableLessons, setDirectExchangeableLessons] = useState<DailyLesson[]>([]);
  const [chainExchangeableLessons, setChainExchangeableLessons] = useState<DailyChainExchangeable[]>([]);

  const [selectedTargetChainExchangeable, setSelectedTargetChainExchangeable] = useState<DailyChainExchangeable | null>(null);
  const [selectedTargetLesson, setSelectedTargetLesson] = useState<DailyLesson | null>(null);
  const [exchangePath, setExchangePath] = useState<DailyLessonMoveInfo[]>([]);
  const [selectedExchangePathIndex, setSelectedExchangePathIndex] = useState<number | null>(null);
  const [chainExchangeablePathOptions, setChainExchangeablePathOptions] = useState<HiSelectBoxItem[]>([]);

  const [maxPeriod, setMaxPeriod] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number | null>(1);
  const [activatedClassDays, setActivatedClassDays] = useState<ActivateWeekday[]>([]);

  const [reason, setReason] = useState<string>("");

  // contexts
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const teacherCourses = useTeacherCourseContext();
  const courseBases = useCourseBaseContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const concurrentConfs = useConcurrentConfContext();
  const specialtyRooms = useSpecialtyRoomContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();
  const concurrentConfContext = TimetableConcurrentConfContext.getInstance();

  const adjustDisplayedPeriod = (period: number) => {
    return period + startPeriod;
  };

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

  const concurrentConfMap = useMemo(
    () => concurrentConfContext.concurrentConfMap || ({} as Record<string, ConcurrentConf>),
    [concurrentConfs]
  );

  const timetableId = useMemo(() => {
    return selectedTimetable ? selectedTimetable.timetableId : null;
  }, [selectedTimetable]);

  const readableLessonDay = (lessonDay: LessonDay) => {
    const monthAndDay = lessonDay.lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    const dayOfWeekTitle = DAYS_OF_WEEK.find((d) => d.index === lessonDay.dayOfWeek)?.title || "";
    return `${month}/${day}(${dayOfWeekTitle})`;
  };

  const readableShortLessonDate = (lessonDate: number) => {
    const monthAndDay = lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    return `${month}/${day}`;
  };
  
  const selectedLessonDays = useMemo(() => {
    if (!selectedDate) return [];
    const weeks = 3;
    const lessonDays = TimeUtils.generateLessonDays(selectedDate, weeks);
    return lessonDays.filter((lessonDay: LessonDay) =>
      activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
    );
  }, [selectedDate, activatedClassDays]);

  const selectedFirstLessonDay = useMemo(() => {
    return selectedLessonDays[0] || null;
  }, [selectedLessonDays]);

  const selectedLastLessonDay = useMemo(() => {
    return selectedLessonDays[selectedLessonDays.length - 1] || null;
  }, [selectedLessonDays]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return selectedLessonDays.length > 0
      ? `${(100 - headerWidth) / selectedLessonDays.length}%`
      : "auto";
  }, [selectedLessonDays]);

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

  const selectedDailyLessonId = useMemo(() => {
    return selectedDailyLesson ? selectedDailyLesson.dailyLessonId : null;
  }, [selectedDailyLesson]);

  const selectedExchangePathTitle = useMemo(() => {
      if(!chainExchangeablePathOptions || chainExchangeablePathOptions.length === 0) {
      return "";
    }
    return chainExchangeablePathOptions[selectedExchangePathIndex]?.title || "";
  }, [chainExchangeablePathOptions, selectedExchangePathIndex]);

  // 1:1 교환 가능한 수업 선택
  const selectTargetDirectExchangeable = (lesson: DailyLesson) => {
    // resetTargetSelection();
    
    const newExchangePath = [{ 
        sourceLesson: lesson!,
        targetPeriod: {
          lessonDate: selectedDailyLesson.lessonDate,
          period: selectedDailyLesson.period,
          dayOfWeek: selectedDailyLesson.dayOfWeek
       }
      },
      { 
        sourceLesson: selectedDailyLesson!, 
        targetPeriod: {
          lessonDate: lesson.lessonDate,
          period: lesson.period,
          dayOfWeek: lesson.dayOfWeek
        }
      },
    ] as DailyLessonMoveInfo[];

    setSelectedTargetLesson(lesson);
    setExchangePath(newExchangePath);
  }

  const isExchangeableStatus = useMemo(() => {
    // 변경 적용 가능 상태: 교환 경로가 선택된 상태
    return exchangePath && exchangePath.length > 0;
  }, [exchangePath]);


  // 연쇄 교환 가능한 수업 선택
  const selectTargetChainExchangeable = (exchangeable: DailyChainExchangeable) => {
    if(!exchangeable) {
      return;
    }

    resetTargetSelection();

    const { targetLesson, paths } = exchangeable;
    
    const pathOptions = paths.map((paths, idx) => {
      if(paths.length === 0) {
        return [];
      }

      // 경로를 사람이 읽을 수 있는 형태의 문자열로 변환
      // 첫번째 수업은 선택된 수업이므로 제외, 나머지 수업은 역순으로 표시
      const title = paths.slice(1).reverse().map(p => {
        const teacherName = p.lessonTeacherIds.map(tId => teacherMap[tId]?.teacherName || tId).join(" ");
        const dayOfWeekTitle = DAYS_OF_WEEK.find(d => d.index === p.dayOfWeek)?.title || "";
        const className = TimetableDisplayUtils.formatFullClassName(classMap[p.classId]);
        const courseName = courseMap[p.courseId]?.displayedTitle || p.courseId;
        const readableDate = readableShortLessonDate(p.lessonDate);
        
        return `${teacherName} (${readableDate}(${dayOfWeekTitle}${handleAdjustPeriod(p.period)}) ${className} ${courseName})`;
      }).join(", ");

      return {
        value: idx,
        title,
      } as HiSelectBoxItem;
    }) as HiSelectBoxItem[];

    setSelectedTargetLesson(targetLesson);
    setSelectedTargetChainExchangeable(exchangeable);

    setChainExchangeablePathOptions(pathOptions);
    setSelectedExchangePathIndex(0);
  }

  const handleAdjustPeriod = (period: number) => {
    return startPeriod ? period : period - 1;
  };

  const resetTargetSelection = () => {
    setExchangePath([]);
    setSelectedTargetLesson(null);
    setSelectedTargetChainExchangeable(null);
    setSelectedExchangePathIndex(null);
  }

  const searchExchangeableDailyLessons = () => {
    if(!selectedDailyLessonId ) {
      return;
    }

    const directExchangeableLessons = DailyTimetable.findOneToOneExchangeableLessons(selectedDailyLesson);
    const chainExchangeableLessons = DailyTimetable.findChainExchangeableLessons(selectedDailyLesson);

    setDirectExchangeableLessons(directExchangeableLessons);
    setChainExchangeableLessons(chainExchangeableLessons);
  }

  const resetSelectedDailyLesson = () => {
    resetTargetSelection();
    setDirectExchangeableLessons([]);
    setChainExchangeableLessons([]);
    setSelectedDailyLesson(null);
  }


  // AutocompleteInput에서 선택된 text를 받아 상태로 저장하고, id도 함께 저장
  const handleSelectTeacher = (teacherName: string) => {
    setSelectedTeacherName(teacherName);
    const teacher = teacherList.find(t => t.text === teacherName);
    setSelectedTeacherId(teacher ? teacher.value : null);
    if (!teacherName) {
      resetSelectedDailyLesson();
    }
  };

  const fetchDailyLessons = async () => {
    if (!timetableId || !selectedFirstLessonDay || !selectedLastLessonDay) {
      console.warn("fetchDailyLessons: timetableId or lesson days are not set");
      return;
    }

    const api = new Hc2Timetables();
    const { lessonDate: startDate } = selectedFirstLessonDay;
    const { lessonDate: endDate } = selectedLastLessonDay;

    const query = {};
    const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
      timetableId,
      startDate,
      endDate,
      query
    );

    const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
    DailyTimetable.initWithPresetedLessons(dailyLessons || [], selectedLessonDays);

    drawDailyLessonsWithSelectedTeacher();
  };

  const drawDailyLessonsWithSelectedTeacher = () => {
    if (!selectedTeacherId) {
      setTeacherDailyLessons([]);
      return;
    }

    const filteredLessons = getTeacherDailyLessons(selectedTeacherId);
    setTeacherDailyLessons(filteredLessons);
  }

  const getTeacherDailyLessons = (teacherId: string) => {
    return DailyTimetable.getTeacherOverview(teacherId)?.assignedLessons || [];
  }

  const initDailyTimetableContextData = async () => {
    DailyTimetable.context.timetableConfig = gradeContext.timetableConfig;
    DailyTimetable.context.classes = classContext.classes;
    DailyTimetable.context.courses = courseContext.courses;
    DailyTimetable.context.teachers = teacherContext.teachers;
    DailyTimetable.context.teacherCourses = teacherCourseContext.teacherCourses;
  }

  const doExchangeLessons = async () => {
    if(!exchangePath || exchangePath.length === 0 || !timetableId) {
      return;
    }
    
    // 1:1 교환인 경우, 선택된 경로 그대로 사용
    const exchangeDailyLessons = exchangePath.length > 2 ? 
      getSelectedChainExchangeablePath() : 
      exchangePath.map(p => p.sourceLesson);
    
    const params = {
      timetableId,
      reason,
      exchangeDailyLessons,
      status: null,
    };
    
    try {
      const api = new Hc2Timetables();

      const { requestExchangeForTeacherExchangerequests, exchangeLessonsExchanges } = api;
      const toastMessage = isManagerView ? "수업이 변경되었습니다." : "수업 변경을 요청하였습니다.";

      if(isManagerView) {
        params.status = TimetableLessonChangeStatus.Completed;
        await exchangeLessonsExchanges(timetableId, params);
      }
      else {
        await requestExchangeForTeacherExchangerequests(timetableId, params);
      }

      resetAll();

      showToast(toastMessage);
      
      dispatchLessonChangeRequestCountRefresh();

    } catch (error) {
      console.error("Failed to exchange lessons:", error);
      const toastMessage = isManagerView ? "수업 변경에 실패했습니다. 다시 시도해주세요." : "수업 변경 요청에 실패했습니다. 다시 시도해주세요.";
      showToast(toastMessage);
    }    
  }

  const handleClickCancelDailyLesson = () => {
    /*
    setSelectedTargetLesson(null);
    setSelectedTargetChainExchangeable(null);
    setExchangePath([]);
    */
    resetTargetSelection();
  }

  const handleClickDailyLesson = (lesson: DailyLesson, lessonDate: number, period: number, option?: DailyLessonButtonOption) => {
    if(!selectedDailyLessonId && lesson) { // 교체할 수업 선택
      // 동시 수업 선택 불가
      if(lesson?.concurrentCourseId) {
        return;
      }

      setSelectedDailyLesson(lesson);
      return;
    }

    if(selectedDailyLessonId === lesson?.dailyLessonId) { // 이미 선택된 수업을 다시 클릭한 경우, 선택 해제
      resetSelectedDailyLesson();
      return;
    }

    if(option?.isDirectExchangeable && lessonDate && period) { // 1:1 교체 가능한 수업 선택
      const targetLesson = directExchangeableLessons.find(d => d.lessonDate === lessonDate && d.period === period);
      selectTargetDirectExchangeable(targetLesson!);
      return;
    }

    if(option?.isChainExchangeable && lessonDate && period) { // 연쇄 교체 가능한 수업 선택
      const targetChainExchangeable = chainExchangeableLessons.find(c => c.targetLesson.lessonDate === lessonDate && c.targetLesson.period === period);
      selectTargetChainExchangeable(targetChainExchangeable!);
      return;
    }

    resetTargetSelection();
  }
  
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

  const handleChangeExchangeablePath = (title: string, selectedItem: any) => {
    setSelectedExchangePathIndex(selectedItem.value as number);
  }

  const handleClickSubmit = () => {
    if(!isExchangeableStatus) {
      return;
    }
    
    doExchangeLessons();
  }

  const resetAll = () => {
    resetSelectedDailyLesson();
    resetTargetSelection();
    setSelectedTeacherId(null);
    setSelectedTeacherName("");
    setTeacherDailyLessons([]);
    setReason("");
  }

  const handleClose = () => {
    resetAll();
    // setSelectedDate(null);

    onClose && onClose();
  }

  const handleChangeSelectedDate = (dateNum: number) => {
    setSelectedDate(dateNum);
    resetSelectedDailyLesson();
  }

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

  // Renderers
  const renderSelectedTeacherDailyLesson = (lessonDate: number, period: number) => {
    let lesson = teacherDailyLessons.find(lesson => lesson.lessonDate === lessonDate && lesson.period === period);

    if (!lesson && !selectedDailyLesson) {
      return null;
    }

    const lessonForCheck = lesson || selectedDailyLesson;

    const isDisabled = lessonForCheck?.changeType !== TimetableDailyLessonChangeType.None;

    const isReadOnly = (
      period > (timetableConfig?.maxPeriod || 7) ||
      isDisabled ||
      !!lessonForCheck?.concurrentCourseId ||
      !!lessonForCheck?.consecutiveGroupId
    );

    const isEvent = lesson?.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson?.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = lesson?.changeType === TimetableDailyLessonChangeType.Duplication;

    const lessonButtonOption = {
      isDisabled: isDisabled,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isSourceLesson: false,
      isTargetLesson: false,
      isReadOnly: isReadOnly,
      isSelected: selectedDailyLessonId === lesson?.dailyLessonId,
      isEvent,
      isRemoved,
      isDuplicated: isDuplicated
    } as DailyLessonButtonOption;
    
    if(hoveredId && lesson?.consecutiveGroupId) {
      // 연속 수업 컬럼 위에 마우스 오버된 경우 해당 수업 모두 하이라이트
      lessonButtonOption.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
    }

    if(lesson && lesson.consecutiveGroupId) {
      // 연속 수업인 경우, 첫번째 수업인지 여부 확인: 단순히 css 처리 위함
      const consecutiveLessons = teacherDailyLessons.filter(l => 
        l.consecutiveGroupId === lesson?.consecutiveGroupId && 
        l.classId == lesson?.classId && 
        l.lessonDate === lessonDate
      )
      .sort((a, b) => a.period - b.period);
      
      lessonButtonOption.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
    }
    
    // 교환대상 수업 선택 여부
    const isTargetSelected = selectedTargetLesson !== null;

    // 현재 렌더링되는 수업이 선택된 수업인지 여부
    const isSourceDailyLesson = (selectedDailyLesson && 
      selectedDailyLesson.lessonDate === lessonDate && 
      selectedDailyLesson.period === period
    );

    if(isTargetSelected) { // 교환 대상이 선택된 경우 처리
      
      const { lessonDate: targetLessonDate, period: targetPeriod } = selectedTargetLesson!;
      const { lessonDate: sourceLessonDate, period: sourcePeriod } = selectedDailyLesson!;

      // 교환 대상 수업이 선택된 경우
      lessonButtonOption.isTargetLesson = (targetLessonDate === lessonDate && targetPeriod === period);
      lessonButtonOption.isSourceLesson = (sourceLessonDate === lessonDate && sourcePeriod === period);
      lessonButtonOption.isReadOnly = !lessonButtonOption.isTargetLesson; // 교환대상 수업외에는 모두 읽기전용

      lesson = lessonButtonOption.isTargetLesson ? selectedDailyLesson : lesson;
    }
    
    if(selectedDailyLesson && !isTargetSelected && !isSourceDailyLesson) {
      // 교환할 수업이 선택된 경우. 교환 대상이 선택된 경우는 제외
      const isDirectExchangeable = directExchangeableLessons.some(d => d.lessonDate === lessonDate && d.period === period);
      const isChainExchangeable = chainExchangeableLessons.some(c => c.targetLesson.lessonDate === lessonDate && c.targetLesson.period === period);
      
      lessonButtonOption.isDirectExchangeable = isDirectExchangeable;
      lessonButtonOption.isChainExchangeable = isChainExchangeable;
      lessonButtonOption.isDisabled = !isDirectExchangeable && !isChainExchangeable;
    }

    // 합반 수업인 경우, 반 이름을 합반된 모든 반 이름으로 설정
    if (!!lesson && lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = teacherDailyLessons
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
        const concurrentCombinedLessons = getConcurrentCombinedClasses(teacherDailyLessons, lesson)
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
        option={lessonButtonOption}
        onClick={handleClickDailyLesson}
        onClickCancel={handleClickCancelDailyLesson}
        onMouseOver={handleMouseOverDailyLesson}
        onMouseLeave={handleMouseLeaveDailyLesson}
      />
    );
  }

  const getSelectedChainExchangeablePath = (): DailyLesson[] => {
    const { paths } = selectedTargetChainExchangeable;
    if(selectedExchangePathIndex < 0 || selectedExchangePathIndex >= paths.length) {
      return [];
    }
    
    return paths[selectedExchangePathIndex];
  }
  
  // Effects
  useEffect(() => {
    if(selectedExchangePathIndex === null || !selectedTargetChainExchangeable) {
      setExchangePath([]);
      return;
    }
    
    const pathForSort = [] as DailyLessonMoveInfo[];

    const path = getSelectedChainExchangeablePath();
    path.forEach((p, idx) => {
      const srcLesson = p;
      const tgtLesson = idx == 0 ? path[path.length - 1] : path[idx - 1]; 

      pathForSort.push({
        sourceLesson: srcLesson,
        targetPeriod: {
          lessonDate: tgtLesson.lessonDate,
          period: tgtLesson.period,
          dayOfWeek: tgtLesson.dayOfWeek
        }
      } );
    });

    // 연쇄 교환 경로 정렬
    const { lessonDate, period, dayOfWeek } = selectedTargetLesson;

    const sortedExchangePath = [] as DailyLessonMoveInfo[];
    let tailTargetPeriod = {
      lessonDate,
      period,
      dayOfWeek
    } as DailyTimetablePeriod;

    while (pathForSort.length > 0) {
      let idx = 0;
      for(const p of pathForSort) {
        const {lessonDate, period} = p.sourceLesson;
        if(tailTargetPeriod.lessonDate !== lessonDate || tailTargetPeriod.period !== period) {
          idx += 1;
          continue;
        }

        sortedExchangePath.push(p);

        tailTargetPeriod = {
          lessonDate: p.targetPeriod.lessonDate,
          period: p.targetPeriod.period,          
          dayOfWeek: p.targetPeriod.dayOfWeek
        };

        break;        
      }

      // 처리된 수업은 경로에서 제거
      pathForSort.splice(idx, 1);
    }

    setExchangePath(sortedExchangePath);
  }, [selectedExchangePathIndex, selectedTargetChainExchangeable]);

  useEffect(() => {
    initDailyTimetableContextData();
  }, [classes, courses, teachers, teacherCourses]);


  useEffect(() => {
    if(!selectedTeacherId || !selectedDate) {      
      return;
    }

    if(selectedDate !== prevSelectedDateRef.current) {
      prevSelectedDateRef.current = selectedDate;
    }

    drawDailyLessonsWithSelectedTeacher();

    const fetchData = async () => {
      await fetchDailyLessons();

      if(!selectedDailyLesson) {
        return;
      }

      searchExchangeableDailyLessons();
    }

    fetchData();
  }, [selectedTeacherId, selectedDate, selectedDailyLesson]);

  useEffect(() => {
    if(!options) {
      return;
    }

    if(options.teacherId) {
      setSelectedTeacherId(options.teacherId);
      setSelectedTeacherName(
        teacherList.find(t => t.value === options.teacherId)?.text || ""
      );
    }

    if(options.lessonDate) {
      setSelectedDate(options.lessonDate);
    }

    if(options.dailyLesson) {
      setSelectedDailyLesson(options.dailyLesson);
    }
  }, [options]);

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

  /*
  useEffect(() => {
    if (
      !!options && 
      options.lessonDate &&
      options.teacherId &&
      options.dailyLesson
    ) {
      setSelectedTeacherId(options.teacherId);
      setSelectedTeacherName(
        teacherList.find(t => t.value === options.teacherId)?.text || ""
      );
      setSelectedDate(options.lessonDate);
    }
  }, [options]);
  */

  
  useEffect(() => {
    // on mounted
    if (!selectedDate) {
      setSelectedDate(initialDate);
    }
    
    // on unmounted
    return () => {
      setSelectedDate(null);
      setSelectedTeacherId(null);
      // setSelectedTeacher(null);
      setTeacherDailyLessons([]);
      setSelectedDailyLesson(null);
      setDirectExchangeableLessons([]);
      setChainExchangeableLessons([]);
    };
  }, []);


  useEffect(() => {
    // console.log(">>> exchangePath changed:", exchangePath);
  }, [exchangePath]);

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
          onChange={closedTimestamp => handleChangeSelectedDate(TimeUtils.getTimestampToNumber(closedTimestamp))}
          formatter={formatExpirationDate}
          allowPast={false}
          calendar={calendarRef}
          onBeforeSelect={selected => handleBeforeSelectDate(selected, calendarRef.current)}
          isPlaned={!!selectedTimetable && TimeUtils.getTodayAsNumber() < selectedTimetable?.operationStartDate}
          operationStartDate={selectedTimetable?.operationStartDate}
          operationEndDate={selectedTimetable?.operationEndDate}
          withTime={false}
          autoApply={true}
        />    
      </div>
      {!selectedTeacherId && (
        <div className="hi-nodata">
          <p>교사를 선택하세요.</p>
        </div>
      )}

      <div className={`${styles["course-replacement"]}`}>
      {/* 선택 교사 시간표 */
      selectedTeacherId && (
        <div className="table-content sm time-table mt-5">
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
              {maxPeriod && Array.from({ length: maxPeriod }).map((_, periodIdx) => (
                <tr key={`selected-period-index-${periodIdx}-${selectedTeacherId}-${selectedDate}-${selectedDailyLessonId}`}>
                  <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                  {selectedLessonDays.map((d, dayIdx) => (
                    <td key={`selected-period-${periodIdx}-day-${dayIdx}-${selectedDailyLessonId}-${hoveredId}`}>
                      {renderSelectedTeacherDailyLesson(d.lessonDate, periodIdx + 1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      { selectedTargetChainExchangeable && (
        <div className="h4-tit mt-10">
          <h4>
            변경 가능 시간 (<p className="text-text-primary-base">{ chainExchangeablePathOptions.length }</p>)
          </h4>
          <HiSelectBox
            className="sm"
            value={selectedExchangePathIndex}
            items={chainExchangeablePathOptions}
            onChange={handleChangeExchangeablePath}
            emptyTitle={selectedExchangePathTitle || "이동할 수업들을 선택해주세요"}
          />
        </div>
      )}

      { exchangePath && exchangePath.map((path, index) => {
        // 연쇄이동의 경우, 마지막 경로는 선택된 수업이므로 스킵
        if(index == exchangePath.length - 1) return null;

        return path.sourceLesson.lessonTeacherIds.map((tId) => {
          const srcDailyLessons = getTeacherDailyLessons(tId);               
          return (
          <ReadOnlyTimetable 
            selectedLessonDays={selectedLessonDays}
            classMap={classMap}
            courseMap={courseMap}
            courseBaseMap={courseBaseMap}
            teacherMap={teacherMap}
            teacherCourseBaseMap={teacherCourseBaseMap}
            concurrentConfMap={concurrentConfMap}
            timetableConfig={timetableConfig}
            dailyLessons={srcDailyLessons}
            moveInfo={path}
            teacherId={tId}
            key={`exchange-path-${index}-teacher-${tId}`}
          />);
        });
      })}
      </div>

      {/* 변경 사유 */}
      <div className="form-group-inline !mt-5">
        <label>변경 사유</label>
        <HiInput
          type="text"
          wrapClass="w-full placeholder:text-md"
          //disabled={!isExchangeableStatus}  변경하기 버튼 활성화 조건과 동일하여 따로 비활성화하지 않음
          placeholder="선택사항 (최대 50자)"
          maxLength={50}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div className="btns">          
        <HiButton variant='tertiary' onClick={handleClose}>취소</HiButton>
        <HiButton variant='primary' disabled={!isExchangeableStatus} onClick={handleClickSubmit}>변경하기</HiButton>
      </div>
      
    </>
  );
};

export default ChangeLessonExchange;
