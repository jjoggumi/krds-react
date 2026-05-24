// CoTeacher.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import styles from "./multiple.module.scss";
// import "@/assets/css/timetable/common.scss"; // 공통 스타일
import { DatetimePicker } from "../../components/datetimePicker";
import AutocompleteInput from "../../../uiux/autocompleteInput";
import { HiInput } from '@/components/uiux';
import DailyLessonButton, { DailyLessonButtonOption } from "../components/dailyLessonButton";
import { TimetableDataUtils } from "../../core/mod/utils"
import {
  useGradeContext, TimetableGradeContext,
  useClassContext, TimetableClassContext,
  useTeacherContext, TimetableTeacherContext,
  useCourseContext, TimetableCourseContext,
  useTeacherCourseContext, TeacherCourseContext,
  useConcurrentConfContext, TimetableConcurrentConfContext,
  useTeacherCourseBaseContext, TeacherCourseBaseContext,
  useCourseBaseContext, TimetableCourseBaseContext,
  useSpecialtyRoomContext,
  TimetableSpecialtyRoomContext
} from '../../contexts';
import { Course, Class, TeacherCourse, Teacher, DailyLesson, TimetableDailyLessonChangeType, ConcurrentConf, TimetableLessonChangeStatus, CourseBase, TeacherCourseBase, TimetableIndex, SpecialtyRoom } from "../../core/types";
import { TimeUtils, TimetableDisplayUtils, TypeUtils } from "../../common/utils";
import { Hc2Timetables } from "../../apis"
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import { showToast } from '@/unimplementeds/toast.js';
import { LessonDay, ActivateWeekday, EmbeddedListResponse } from "../../common/types";
import { HiButton } from "@/components/uiux/hiButton";

interface TimetableDailyLessonModalOptions {
  dailyLesson: DailyLesson | null;
  teacherId: string | null;
  lessonDate: number | null;
}

interface TeacherOption {
  value: string;
  text: string;
}

interface TeacherOptionWithCount {
  teacherId: string;
  teacherName: string;
  absentCount?: number;
  makeupCount?: number;
}

interface Props {
  selectedTimetable: TimetableIndex | null;
  options?: TimetableDailyLessonModalOptions;
  onClose?: () => void;
}

const ChangeLessonMultiple: React.FC<Props> = ({ selectedTimetable, options, onClose }) => {

  // === Contexts ===
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const teacherCourses = useTeacherCourseContext();
  const concurrentConfs = useConcurrentConfContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const courseBases = useCourseBaseContext();
  const specialtyRooms = useSpecialtyRoomContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const concurrentConfContext = TimetableConcurrentConfContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();

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

  const concurrentConfMap = useMemo(
    () => concurrentConfContext.concurrentConfMap || ({} as Record<string, ConcurrentConf>),
    [concurrentConfs]
  );

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  const initialDate = Math.max(selectedTimetable?.operationStartDate || TimeUtils.getTodayAsNumber(), TimeUtils.getTodayAsNumber());

  // === State ===
  const [ maxPeriod, setMaxPeriod ] = useState<number | null>(null);
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);

  const [ selectedSourceTeacherName, setSelectedSourceTeacherName ] = useState<string>("");
  const [ selectedSourceTeacherId, setSelectedSourceTeacherId ] = useState<string | null>(null);
  const [ selectedDate, setSelectedDate ] = useState<number | null>(initialDate);
  const [ teacherDailyLessons, setTeacherDailyLessons ] = useState<DailyLesson[]>([]);
  const [ selectedDailyLesson, setSelectedDailyLesson ] = useState<DailyLesson | null>(null);
  const [ multipleTeacherOptions, setMultipleTeacherOptions ] = useState<TeacherOption[]>([]);
  const [ selectedTargetTeacherIds, setSelectedTargetTeacherIds ] = useState<string[]>([]);
  const [ reason, setReason ] = useState("");

  const [ hoveredId, setHoveredId ] = useState<string | number | null>(null);

  // === Utils for date handling ===
  const calendarRef = useRef(null);
  const [ activatedClassDays, setActivatedClassDays ] = useState<ActivateWeekday[]>([]);

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

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return selectedLessonDays.length > 0
      ? `${(100 - headerWidth) / selectedLessonDays.length}%`
      : "auto";
  }, [selectedLessonDays]);

  const showSelectedTeacherTimetable = useMemo(() => {
    return !!selectedDate && !!selectedSourceTeacherId;
  }, [selectedDate, selectedSourceTeacherId]);
  
  // const showMultipleTeacherOptions = useMemo(() => {
  // return !!selectedDailyLesson;
  // }, [selectedDailyLesson]);

  // 교사 선택시 하단 교사 선택 영역 보이기
  const showMultipleTeacherOptions = useMemo(() => {
    return showSelectedTeacherTimetable;
  }, [showSelectedTeacherTimetable]);

  const isReadOnly = useMemo(() => {
    return selectedTargetTeacherIds.length < 1;
  }, [selectedTargetTeacherIds]);

  const isClickableToSave = useMemo(() => {
    return !!selectedSourceTeacherId && !!selectedDailyLesson && selectedTargetTeacherIds.length > 0;
  }, [selectedSourceTeacherId, selectedDailyLesson, selectedTargetTeacherIds]);

  // === Renderers ===
  const renderSelectedTeacherDailyLesson = (lessonDate: number, period: number) => {
    const lesson = teacherDailyLessons.find(lesson => lesson.lessonDate === lessonDate && lesson.period === period);

    if (!lesson) {
      return null;
    }

    const isReadOnly = 
      period > (timetableConfig?.maxPeriod || 7) ||
      lesson.changeType !== TimetableDailyLessonChangeType.None;

    const isDisabled = lesson.changeType !== TimetableDailyLessonChangeType.None;

    const isEvent = lesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = lesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = !!lesson && lesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const isSelected = (
      !!selectedDailyLesson && 
      selectedDailyLesson.dailyLessonId === lesson.dailyLessonId
    );

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
      const combinedClassNames = teacherDailyLessons
          .filter(l => lesson.combinedGroupId === l.combinedGroupId)
          .map(l => classMap[l.classId])
          .filter(c => c !== null)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber)
          .map(c => `${c.grade}-${c.classNumber}`)
          .join(', ');

      lesson.className = combinedClassNames;
    }

    // 동시 수업이면서 합반인 경우, 모든 학반 명 표시
    if (!!lesson.concurrentCourseId) {
      const concurrentConf = concurrentConfMap[lesson.concurrentCourseId];
      const classNames = (!!concurrentConf && concurrentConf.isCombinedClass)
        ? getCombinedClassNames(lesson)
        : null;
      lesson.className = classNames;
    }

    if(hoveredId && lesson?.consecutiveGroupId) {
      option.isHoveredConsecutive = hoveredId === `${lesson?.consecutiveGroupId}${lessonDate}`;
    }

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = teacherDailyLessons.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.lessonDate === lessonDate
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
    }

    if (lesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = teacherDailyLessons
        .filter(l => lesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      lesson.className = buildClassNameFromLessons(combinedLessons);
    }

    if (lesson.concurrentCourseId) {
      const isCombined = concurrentConfMap[lesson.concurrentCourseId]?.isCombinedClass;
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(teacherDailyLessons, lesson)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        lesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
      }
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
        concurrentConfMap={concurrentConfMap}
        option={option}
        onClick={handleClickDailyLesson}
        onClickCancel={handleClickCancelSelection}
        onMouseOver={handleMouseOverDailyLesson}
        onMouseLeave={handleMouseLeaveDailyLesson}
      />
    );
  }

  // === API ===
  const fetchTeacherDailyLessons = async () => {
    if (!timetableId || !selectedStartLessonDate || !selectedEndLessonDate || !selectedSourceTeacherId) {
      console.warn("fetchTeacherDailyLessons: timetableId or lesson days are not set");
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
      setTeacherDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
    }
  }

  const fetchMultipleTeacherOptions = async () => {
    if (!selectedDailyLesson) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.getTeacherOptionsForMultipleMultipleteachers(
        timetableId,
        { lessonDate: selectedDailyLesson.lessonDate, period: selectedDailyLesson.period}
      );

      const { teacherOptions } = (res.data as EmbeddedListResponse<TeacherOptionWithCount>)._embedded;
      setMultipleTeacherOptions(
        teacherOptions
          .map((option) => {
            const teacher = teacherMap[option.teacherId];

            const courseBases = (teacherCourseBaseMap[option.teacherId] || []).map(
              ({ courseBaseId }) => courseBaseMap[courseBaseId]
            ) as CourseBase[];
            const courseNames = TimetableDataUtils.courseBaseNames(courseBases).sort().join(", ");

            return {
              text: `${teacher.teacherName} ${courseNames ? "(" + courseNames + ")" : ""}`,
              value: teacher.teacherId,
            };
          })
          .sort((a, b) => a.text.localeCompare(b.text))
      );

    } catch (error) {
      console.error("Error fetching multiple teacher options:", error);
    }
  };

  const handleClickSaveLessonChange = async () => {
    if (!timetableId || !selectedDailyLesson || selectedTargetTeacherIds.length === 0) {
      console.warn("handleClickSaveLessonChange: required parameters are missing");
      return;
    }

    const api = new Hc2Timetables();
    const payload = {
      status: TimetableLessonChangeStatus.Completed,
      sourceLesson: selectedDailyLesson,
      reason,
      targetTeacherIds: selectedTargetTeacherIds
    };
  
    try {
      const res = await api.requestToChangeForMultipleMultipleteachers(
        timetableId,
        payload
      );

      if (res.status === 204) {
        showToast('수업이 변경되었습니다.', 3000);
        resetAllParameters();
      }
    } catch (error) {
      console.error("Error patching multiple teachers:", error);
    }
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

  const resetAllParameters = () => {
    setSelectedDate(TimeUtils.getTodayAsNumber());
    setSelectedSourceTeacherName("");
    setSelectedSourceTeacherId(null);
    setTeacherDailyLessons([]);
    setSelectedDailyLesson(null);
    setMultipleTeacherOptions([]);
    setSelectedTargetTeacherIds([]);
    setReason("");
  };

  const resetSelectedDailyLesson = () => {
    setSelectedDailyLesson(null);
    setMultipleTeacherOptions([]);
    setSelectedTargetTeacherIds([]);
    setReason("");
  };

  const handleSelectSourceTeacher = async (teacherName: string) => {
    const teacher = teacherList.find(t => t.text === teacherName);
    const updated = teacher ? teacher.value : null;
    const isChanged = selectedSourceTeacherId !== updated;

    setSelectedSourceTeacherName(teacherName);
    setSelectedSourceTeacherId(updated);
    setTeacherDailyLessons(prev => isChanged ? [] : prev);
    resetSelectedDailyLesson();
  };

  const handleChangeSelectedDate = (closedTimestamp: number) => {
    const updated = TimeUtils.getTimestampToNumber(closedTimestamp);
    const isChanged = selectedDate !== updated;

    setSelectedDate(updated);
    setTeacherDailyLessons(prev => isChanged ? [] : prev);
    resetSelectedDailyLesson();
  }

  const handleClickDailyLesson = (lesson: DailyLesson) => {
    resetSelectedDailyLesson();
    const isSelected = !!selectedDailyLesson && selectedDailyLesson.dailyLessonId === lesson.dailyLessonId;
    setSelectedDailyLesson(isSelected ? null : lesson);
  };

  const handleClickCancelSelection = () => {
    resetSelectedDailyLesson();
  };

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

  // === UseEffects ===
  useEffect(() => {
    if (!selectedDate) setSelectedDate(initialDate);

    return () => {
      setSelectedDate(null);
    }
  }, [])

  useEffect(() => {
    if (!selectedSourceTeacherId || !selectedStartLessonDate || !selectedEndLessonDate) {
      return;
    }

    fetchTeacherDailyLessons();
  }, [selectedSourceTeacherId, selectedStartLessonDate, selectedEndLessonDate]);

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
    // on mounted
    if (!selectedDate) {
      setSelectedDate(TimeUtils.getTodayAsNumber());
    }

    // on unmounted
    return () => resetAllParameters();
  }, []);

  useEffect(() => {
    if (!selectedDailyLesson) return;

    fetchMultipleTeacherOptions();
  }, [selectedDailyLesson, selectedDate]);

  useEffect(() => {
    if (teacherDailyLessons.length === 0) {
      setMaxPeriod(timetableConfig?.maxPeriod || 7);
      return;
    }

    const configMax = timetableConfig?.maxPeriod || 7;
    const maxLessonPeriod = Math.max(...teacherDailyLessons.map(lesson => lesson.period));
    setMaxPeriod(Math.max(configMax, maxLessonPeriod));
  }, [teacherDailyLessons]);

  useEffect(() => {
    if (
      !!options && 
      options.lessonDate &&
      options.teacherId &&
      options.dailyLesson
    ) {
      setSelectedDailyLesson(options.dailyLesson);
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
          onChange={handleSelectSourceTeacher}
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

      {/* 복수교사 배정 */}
      <div className={`${styles["co-teacher"]}`}>
        {/* 선택 교사 시간표 */}
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
                {maxPeriod && Array.from({ length: maxPeriod }).map((_, periodIdx) => (
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



                {/* <tr>
                  <td className="th">1</td>
                  <td>
                    <button type="button" className="btn-table-cell">
                      <div className="class-name">2-3</div>
                      <div className="course-name">사문탐</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" className="btn-table-cell">
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
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
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
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div> */}
        
        {/* 학급 선택, 장소 선택 */}
        {showMultipleTeacherOptions && (
          <div className="gray-box !mt-5">
            <div className="!px-4">
              <div className="tb-col">
                <div className="h5-tit !mb-3">
                  <h5>
                    복수교사로 배정할 교사를 선택하세요.<p className="text-text-primary-base ml-1">(필수)</p>
                  </h5>
                </div>
                <div className="panel">
                  <div className="option-list custom-scr">
                    {multipleTeacherOptions.map((item) => (
                      <div className="item" key={item.value}>
                        <div className="form-ctr">
                          <input
                            type="checkbox"
                            id={item.value}
                            value={item.value}
                            checked={selectedTargetTeacherIds.includes(item.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTargetTeacherIds([
                                  ...selectedTargetTeacherIds,
                                  item.value,
                                ]);
                              } else {
                                setSelectedTargetTeacherIds(
                                  selectedTargetTeacherIds.filter((id) => id !== item.value)
                                );
                              }
                            }}
                          />
                          <label htmlFor={item.value}>
                            <span>{item.text}</span>
                          </label>
                        </div>
                      </div>
                    ))}

                    {multipleTeacherOptions.length === 0 && (
                      <div className="item hi-nodata">
                        <p>복수교사로 배정할 교사를 선택하세요.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default ChangeLessonMultiple;
