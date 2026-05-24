// @File: combination.tsx
// @Description: 수업변경 > 합반 배정 
// @Modified: 2025-09-29
// 

// ==================      특별실 추가한 경우, 특별실 재조회하도록 추가 필요        ==================== //


import {
  useGradeContext, TimetableGradeContext,
  useClassContext, TimetableClassContext,
  useTeacherContext, TimetableTeacherContext,
  useCourseContext, TimetableCourseContext,
  useTeacherCourseContext, TeacherCourseContext,
  useLessonConfContext, TimetableLessonConfContext,
  useSpecialtyRoomContext, TimetableSpecialtyRoomContext,
  useConcurrentConfContext, TimetableConcurrentConfContext,
  useTeacherCourseBaseContext, TeacherCourseBaseContext,
  useCourseBaseContext, TimetableCourseBaseContext
} from '../../contexts';
import {
  Course, Class, TeacherCourse,
  Teacher, DailyLesson, TimetableDailyLessonChangeType,
  SpecialtyRoom, ConcurrentConf, TimetableLessonChangeStatus,
  CourseBase, TeacherCourseBase,
  TimetableIndex
} from "../../core/types";
import { LessonDay, ActivateWeekday, EmbeddedListResponse } from "../../common/types";
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import { TimetableDataUtils } from "../../core/mod/utils"
import { TimeUtils, TimetableDisplayUtils, TypeUtils } from "../../common/utils";

import { Hc2Timetables } from "../../apis";

import React, { useState, useRef, useMemo, useEffect } from "react";

import DailyLessonButton, { DailyLessonButtonOption } from "../components/dailyLessonButton";

import styles from "./combination.module.scss";
import { HiInput, HiSelectBox } from '@/components/uiux';
import { DatetimePicker } from "../../components/datetimePicker";
import AutocompleteInput from "../../../uiux/autocompleteInput";

import { Dialog, ShowAlert, ShowConfirm } from '@/components/uiux/modal';
import { showToast } from '@/unimplementeds/toast.js'
import { v4 as uuidv4 } from 'uuid';
import { HiButton } from '@/components/uiux/hiButton';
import { Pencil } from 'lucide-react';

// interface SpecialtyRoomOption {
//   specialtyRoomId: string;
//   roomName: string;
// }

interface TimetableDailyLessonModalOptions {
  dailyLesson: DailyLesson | null;
  teacherId: string | null;
  lessonDate: number | null;
}

interface SpecialtyRoomOption {
  roomName: string;
  specialtyRoomId?: string;
  isEditable: boolean;
}

interface CombinationOption {
  dailyLessonId: string;
  lessonTeacherIds: string[];
  name: string;
  gradeClass: string;
}

interface Props {
  selectedTimetable: TimetableIndex | null;
  options?: TimetableDailyLessonModalOptions;
  onClose?: () => void;
}

const MergedClass: React.FC<Props> = ({ selectedTimetable, options, onClose }) => {

  const MAX_CLASS_NUMBER = 5;

  // === Contexts ===
  const [maxPeriod, setMaxPeriod] = useState<number | null>(null);
  const [startPeriod, setStartPeriod] = useState<number | null>(1);

  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const specialtyRooms = useSpecialtyRoomContext();
  const concurrentConfs = useConcurrentConfContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const courseBases = useCourseBaseContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
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

  const concurrentConfMap = useMemo(
    () => concurrentConfContext.concurrentConfMap || ({} as Record<string, ConcurrentConf>),
    [concurrentConfs]
  );

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  const initialDate = Math.max(selectedTimetable?.operationStartDate || TimeUtils.getTodayAsNumber(), TimeUtils.getTodayAsNumber());

  // === States ===
  // const [ combinationClassOption, setCombinationClassOption ] = useState<CombinationOption[]>([]);
  const [ combinationOptions, setCombinationOptions ] = useState<DailyLesson[]>([]);
  const [ teacherDailyLessons, setTeacherDailyLessons ] = useState<DailyLesson[]>([]);
  const [ selectedDate, setSelectedDate ] = useState<number | null>(initialDate);
  const [ selectedDailyLesson, setSelectedDailyLesson ] = useState<DailyLesson | null>(null);
  const [ selectedSourceTeacherName, setSelectedSourceTeacherName ] = useState<string>("");
  const [ selectedSourceTeacherId, setSelectedSourceTeacherId ] = useState<string | null>(null);
  const [ hoveredId, setHoveredId ] = useState<number | string | null>(null);
  const [ reason, setReason ] = useState("");
  const [ selectedCombinationOptions, setSelectedCombinationOptions ] = useState<string[]>([]);
  const [ specialtyRoomOptions, setSpecialtyRoomOptions ] = useState<SpecialtyRoomOption[]>([]);
  const [ selectedSpecialtyRoom, setSelectedSpecialtyRoom ] = useState<SpecialtyRoomOption | null>(null);
  const [ selectedCombinationTeacherOptionId, setSelectedCombinationTeacherOptionId ] = useState<string | null>(null);
  const [ showSpecialtyRoomInput, setShowSpecialtyRoomInput ] = useState<boolean>(false);
  const [ editRoom, setEditRoom ] = useState<SpecialtyRoomOption | null>(null);
  // 26.02.27 추가
  const [editingRoomName, setEditingRoomName] = useState<string | null>(null);

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

  const getAllSubsetsForTeacherOptions = (lessonTeacherIds: string[]) => {
    const results = [];
    const n = lessonTeacherIds.length;

    for (let i = 1; i < (1 << n); i++) {
        const subset = [];
        for (let j = 0; j < n; j++) {
            if ((i >> j) & 1) {
                subset.push(lessonTeacherIds[j]);
            }
        }
        results.push(subset);
    }
    return results;
  };

  // === useMemo ===
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

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return selectedLessonDays.length > 0
      ? `${(100 - headerWidth) / selectedLessonDays.length}%`
      : "auto";
  }, [selectedLessonDays]);

  const selectedDailyLessonId = useMemo(() => {
    return selectedDailyLesson ? selectedDailyLesson.dailyLessonId : null;
  }, [selectedDailyLesson]);

  const combinationTeacherOptions = useMemo(() => {
    if (!selectedSourceTeacherId || selectedCombinationOptions.length === 0) return [];

    const teacherOptions = { value: uuidv4(), teacherIds: [selectedSourceTeacherId], title: teacherMap[selectedSourceTeacherId]?.teacherName || "" };

    const subsetOptions = selectedCombinationOptions.flatMap(dailyLessonId => {
      const lesson = combinationOptions.find(lesson => lesson.dailyLessonId === dailyLessonId);
      if (!lesson) return [];

      const lessonTeacherIds = lesson.lessonTeacherIds;
      const subsets = getAllSubsetsForTeacherOptions(lessonTeacherIds);

      return subsets.map(subset => ({
        value: uuidv4(),
        teacherIds: subset,
        title: subset.map(id => teacherMap[id]?.teacherName || "").join(", ")
      }));
    });

    return [ teacherOptions, ...subsetOptions ];
  }, [selectedCombinationOptions]);

  const showSelectedTeacherTimetable = useMemo(() => {
    return !!selectedSourceTeacherId && !!selectedDate;
  }, [selectedSourceTeacherId, selectedDate]);

  const showCombinationOptions = useMemo(() => {
    if (!selectedDailyLesson) return false;
    return !!selectedDailyLesson;
  }, [selectedDailyLesson]);

  // const hasAddedSpecialtyRoomOption = useMemo(() => {
  //   return specialtyRoomOptions.some(room => room.isEditable);
  // }, [specialtyRoomOptions]);

  const isReadOnly = useMemo(() => {
    return selectedCombinationOptions.length < 1 ||
     !selectedCombinationTeacherOptionId ||
     !selectedSpecialtyRoom;
  }, [selectedCombinationOptions, selectedCombinationTeacherOptionId, selectedSpecialtyRoom]);

  const isClickableToSave = useMemo(() => {
    return (
      !!selectedSourceTeacherId && 
      !!selectedDailyLesson && 
      selectedCombinationOptions.length > 0 &&
      !!selectedSpecialtyRoom &&
      !!selectedCombinationTeacherOptionId
    );
  }, [selectedSourceTeacherId, selectedDailyLesson, selectedCombinationOptions, selectedSpecialtyRoom, selectedCombinationTeacherOptionId]);

  const combinationLessonOptions = useMemo(() => {
    if (combinationOptions.length === 0) return [];

    const key = (ids: string[] = []) => ids.slice().sort().join(',');
    const counts = combinationOptions.reduce((map, l) => {
      const k = key(l.lessonTeacherIds);
      map.set(k, (map.get(k) || 0) + 1);
      return map;
    }, new Map<string, number>());

    return combinationOptions
      .filter(l => l.changeType === TimetableDailyLessonChangeType.None && counts.get(key(l.lessonTeacherIds)) === 1)
      .map(lesson => {
        const crs = courseMap[lesson.courseId];
        const lessonTeacherIds = lesson.lessonTeacherIds;
        const teacherNames = lessonTeacherIds.map(id => teacherMap[id]?.teacherName || "").join(", ");
        const courseName = lessonTeacherIds.length > 1 ? `(복)${crs?.displayedTitle}` : `${crs?.displayedTitle}`;
        const clazz = classMap[lesson.classId];
        const gradeClass = clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : "";
        return {
          dailyLessonId: lesson.dailyLessonId,
          grade: clazz?.grade,
          classNumber: clazz?.classNumber,
          name: `${gradeClass} ${courseName} ${teacherNames}`
        }
      })
      .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
  }, [combinationOptions]);

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
    const isDuplicated = lesson.changeType === TimetableDailyLessonChangeType.Duplication;

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
  };

  const fetchCombinationOptions = async (selectedLesson: DailyLesson) => {
    if (!timetableId || !selectedLesson) return;

    const api = new Hc2Timetables();
    const params = {
      dailyLessonId: selectedLesson.dailyLessonId,
      lessonDate: selectedLesson.lessonDate,
      period: selectedLesson.period,
    };

    try {
      const res = await api.searchTeacherOptionsForCombinationCombinationoptions(
        timetableId,
        params
      );

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      setOnCombinationOptions(dailyLessons, selectedLesson);

    } catch (error) {
      console.error("Error fetching combination options:", error);
    }
  };

  const fetchToCreateSpecialtyRoom = async (roomName: string) => {
    if (!roomName) return;
    return await specialtyRoomContext.createSpecialtyRoom(roomName, MAX_CLASS_NUMBER);
  };

  const fetchToUpdateSpecialtyRoom = async (specialtyRoomId: string, roomName: string) => {
    if (!specialtyRoomId || !roomName) return;
    return await specialtyRoomContext.updateSpecialtyRoomName(specialtyRoomId, roomName);
  };

  const handleClickSaveLessonChange = async () => {
    if (!timetableId || !selectedDailyLesson || !selectedCombinationTeacherOptionId || !selectedSpecialtyRoom || !selectedCombinationOptions) return;

    const combinedDailyLessons: DailyLesson[] = selectedCombinationOptions
      .map(id => {
        const lesson = combinationOptions.find(lesson => lesson.dailyLessonId === id)
        return !!lesson ? lesson : null;
      })
      .filter(lesson => !!lesson);
    if (combinedDailyLessons.length === 0) return;

    const option = combinationTeacherOptions.find(option => option.value === selectedCombinationTeacherOptionId);
    if (!option) return;

    const specialtyRoom = specialtyRooms.find(room => room.roomName === selectedSpecialtyRoom.roomName);
    if (!specialtyRoom && !specialtyRoom.specialtyRoomId) return;

    const api = new Hc2Timetables();
    const params = {
      status: TimetableLessonChangeStatus.Completed,
      sourceLesson: selectedDailyLesson,
      targetLessons: combinedDailyLessons,
      specialtyRoomId: specialtyRoom.specialtyRoomId,
      roomName: selectedSpecialtyRoom.roomName,
      targetTeacherIds: option.teacherIds,
      reason
    };

    try {
      const res = await api.requestToChangeForCombinationCombinations(timetableId, params);
      
      if (res.status === 204) {
        showToast('수업이 변경되었습니다.', 3000);
        resetAllParameters();
      }
    } catch (error) {
      console.error("Error patching combination:", error);
      showToast('변경에 실패했습니다. 다시 시도해주세요.', 3000);
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

  const setOnCombinationOptions = async (dailyLessons: DailyLesson[], selectedLesson: DailyLesson) => {
      const isConcurrentCombinedClasses = getConcurrentCombinedClasses(dailyLessons, selectedLesson).length > 0;
      if (isConcurrentCombinedClasses) {
        await ShowConfirm(`해당 수업은 이미 합반으로 배정되어 있어 추가 합반 배정이 불가합니다. 다시 선택해 주세요.`,
          {
            confirmLabel: '확인',
            hideCancel: true,   
            className: 'time-table-alert'
          }
        );
        setSelectedDailyLesson(null);
        return;
      }
      
      setCombinationOptions(dailyLessons);
  }

  const handleChangeTeacherOptionId = (teacherOptionId: string) => {
    if (!teacherOptionId) return;
    
    setSelectedCombinationTeacherOptionId(teacherOptionId);
  };

  const checkAssignableSpecialtyRoom = async (roomOption: SpecialtyRoomOption, selectedCombs: string[]) => {
    if (!selectedDailyLessonId) return {result: false, reason: "선택된 수업이 없습니다."};

    const specialtyRoom = specialtyRooms.find(room => room.specialtyRoomId === roomOption.specialtyRoomId);
    if (!specialtyRoom) return {result: false, reason: "특별실 정보를 불러올 수 없습니다."};

    const allSelectedCombs = [...selectedCombs, selectedDailyLessonId]; // 현재 선택된 옵션 수 + 1(원수업)

    const roomUsedCountOnNonSelected = combinationOptions
      .filter(option => !allSelectedCombs.includes(option.dailyLessonId) && !!option.specialtyRoomId && option.specialtyRoomId === specialtyRoom.specialtyRoomId)
      .length;

    // 확인 필요
    if (roomUsedCountOnNonSelected) return {result: false, reason: `${specialtyRoom.roomName}은(는) 선택하신 시간에 수업이 있습니다. 확인해주세요.`};

    const roomUsedCount = allSelectedCombs.length;

    if (roomUsedCount > specialtyRoom.maxClass) {
      return {result: false, reason: `선택한 특별실은 최대 ${specialtyRoom.maxClass}개 반까지 사용 가능합니다.`};
    }

    return {result: true};
  };

  const handleClickSpecialtyRoom = async (roomOption: SpecialtyRoomOption) => {
    if (selectedCombinationOptions.length === 0) return;
    const response = await checkAssignableSpecialtyRoom(roomOption, selectedCombinationOptions);
    if (!response.result) {
      await ShowConfirm(`${response.reason}`,
        {
          confirmLabel: '확인',
          hideCancel: true,   
          className: 'time-table-alert'
        }
      );
      return;
    }

    setSelectedSpecialtyRoom(roomOption);
  };

  const handleClickShowSpecialtyRoomInput = () => {
    setSelectedSpecialtyRoom(null);
    setShowSpecialtyRoomInput(true);

    setEditRoom({
      roomName: "",
      specialtyRoomId: "",
      isEditable: true
    } as SpecialtyRoomOption);
  };

  const handleEditSpecialtyRoom = (roomOption: SpecialtyRoomOption) => {
    setSpecialtyRoomOptions((prev) => prev.filter(room => room.specialtyRoomId !== roomOption.specialtyRoomId));

    setSelectedSpecialtyRoom(null);
    setEditRoom(roomOption);
    setShowSpecialtyRoomInput(true);
  };

  const handleSaveSpecialtyRoom = async () => {
    // if (hasAddedSpecialtyRoomOption) {
    //   showToast('이미 추가된 장소가 있습니다.', 3000);
    //   return;
    // }

    const isUpdated = !!editRoom.specialtyRoomId;
    const roomNameTrim = editRoom.roomName.trim();
    if (isUpdated && specialtyRooms.some(r => r.specialtyRoomId === editRoom.specialtyRoomId && r.roomName === roomNameTrim)) {
      setShowSpecialtyRoomInput(false);
      // setSpecialtyRoomOptions((prev) => [...prev, { roomName: roomNameTrim, specialtyRoomId: editRoom.specialtyRoomId, isEditable: true }]);
      // 이름 변경 없음 — 기존 항목을 교체(append 아님)
      setSpecialtyRoomOptions((prev) => prev.map(r => r.specialtyRoomId === editRoom.specialtyRoomId ? { roomName: roomNameTrim, specialtyRoomId: editRoom.specialtyRoomId, isEditable: true } : r));
      return;
    }

    const roomName = editRoom.roomName.trim();
    if (roomName === "") {
      // if (isUpdated) {
      //   const origin = specialtyRooms.find(room => room.specialtyRoomId === editRoom.specialtyRoomId);
      //   setSpecialtyRoomOptions((prev) => !!origin ? [...prev, { roomName: origin.roomName, specialtyRoomId: origin.specialtyRoomId, isEditable: true }] : prev);
      // }
      // 빈 이름으로 저장 시 목록 변경 없이 입력창만 닫음
      setShowSpecialtyRoomInput(false);
      return;
    }

    const isDuplicated = specialtyRooms.some(room => room.roomName === roomName);
    if (isDuplicated) {
      showToast('이미 존재하는 장소입니다.', 3000);
      return;
    }

    const addedRoom = isUpdated 
      ? await fetchToUpdateSpecialtyRoom(editRoom.specialtyRoomId, roomName)
      : await fetchToCreateSpecialtyRoom(roomName);

    if (!addedRoom) {
      showToast('특별실 추가에 실패했습니다. 다시 시도해주세요.', 3000);
      return;
    }

    const option = { roomName: addedRoom.roomName, specialtyRoomId: addedRoom.specialtyRoomId, isEditable: true };

    // 수정이면 기존 항목 교체, 신규이면 append
    setSpecialtyRoomOptions((prev) => isUpdated ? prev.map(r => r.specialtyRoomId === option.specialtyRoomId ? option : r) : [...prev, option]);
    await handleClickSpecialtyRoom(option);

    setEditRoom(null);
    setShowSpecialtyRoomInput(false);
  };

  const resetAllParameters = () => {
    setSelectedDate(TimeUtils.getTodayAsNumber());
    setSelectedSourceTeacherName("");
    setSelectedSourceTeacherId(null);
    setTeacherDailyLessons([]);
    setSelectedDailyLesson(null);
    setCombinationOptions([]);
    setSelectedCombinationOptions([]);
    setSelectedSpecialtyRoom(null);
    setSelectedCombinationTeacherOptionId(null);
    setReason("");
  };
  
  const resetSelectedDailyLesson = () => {
    setSelectedDailyLesson(null);
    setCombinationOptions([]);
    setSelectedCombinationOptions([]);
    setSelectedSpecialtyRoom(null);
    setSelectedCombinationTeacherOptionId(null);
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
  };

  const handleClickDailyLesson = (lesson: DailyLesson) => {
    resetSelectedDailyLesson();
    const isSelected = !!selectedDailyLesson && selectedDailyLesson.dailyLessonId === lesson.dailyLessonId;
    setSelectedDailyLesson(isSelected ? null : lesson);
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

  const handleClickCombinationOption = async (e) => {
    setSelectedCombinationTeacherOptionId(null);

    const { checked, value } = e.target;
    const currentCheckedOptions = checked ? [...selectedCombinationOptions, value] : selectedCombinationOptions.filter(id => id !== value)

    const res = !!selectedSpecialtyRoom ? await checkAssignableSpecialtyRoom(selectedSpecialtyRoom as SpecialtyRoomOption, currentCheckedOptions) : {result: true};
    if (!res.result) {
      if (checked) await ShowConfirm(`${res.reason}`, { confirmLabel: '확인', hideCancel: true, className: 'time-table-alert' } );
      setSelectedCombinationOptions(prev => !checked? prev.filter(id => id !== value) : prev);
      setSelectedSpecialtyRoom(null);
      return;
    }

    setSelectedCombinationOptions(currentCheckedOptions);
  };

  // === UseEffects ===
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(initialDate);
    }

    return () => resetAllParameters();
  }, []);

  useEffect(() => {
    if (!selectedTimetable) return;

    specialtyRoomContext.reloadWithTimetableId(selectedTimetable.timetableId);
  }, [selectedTimetable]);

  useEffect(() => {
    const filteredRooms = specialtyRooms
      .filter(room => room.maxClass > 1)
      .map(({ roomName, specialtyRoomId  }) => ({ roomName, specialtyRoomId, isEditable: false }))
    setSpecialtyRoomOptions(filteredRooms);
  }, [specialtyRooms]);

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
  }, [selectedDate, selectedSourceTeacherId]);

  useEffect(() => {
    if (!selectedDailyLesson) return;

    fetchCombinationOptions(selectedDailyLesson);
  }, [selectedDailyLesson]);

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
      {/* 교사선택 */}
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

      <div className={styles.mergedClass}>
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

        {/* <div className="table-content sm time-table mt-5">
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
        <div className="gray-box !mt-5">
          <div className="tb-row !px-4">
            {/* 학급 선택 */}
            <div className="tb-col">
              <div className="h5-tit !mb-3">
                <h5>
                  1. 합반으로 배정할 학급을 선택하세요. <p className="text-text-primary-base mr-1">(필수)</p>
                </h5>
              </div>
              <div className='panel'>
                <div className="option-list custom-scr lg">
                {showCombinationOptions && (
                  <>
                    {
                    combinationLessonOptions.map((option) => (
                      <div className="item" key={option.dailyLessonId}>
                        <div className="form-ctr">
                          <input
                            type="checkbox"
                            id={option.dailyLessonId}
                            value={option.dailyLessonId}
                            checked={selectedCombinationOptions.includes(option.dailyLessonId)}
                            onChange={(e) => handleClickCombinationOption(e)}
                          />
                          <label htmlFor={option.dailyLessonId}>
                            <span>{option.name}</span>
                          </label>
                        </div>
                      </div>))
                    }
                  </>
                  )}
                  {showCombinationOptions || combinationLessonOptions.length === 0 && (
                    <div className="item hi-nodata">
                      <p>합반 배정할 수업을 선택하세요.</p>
                    </div>
                  )}
                  </div>
              </div>
            </div>

            {/* 장소 선택 */}
            <div className="tb-col">
              <div className="h5-tit !mb-3">
                <h5>
                  2. 합반 수업할 장소를 선택하세요. <p className="text-text-primary-base mr-05">(필수)</p> 
                </h5>
              </div>
              <div className="panel">
                <div className="option-list custom-scr">
                  {selectedCombinationOptions.length > 0 ? (
                    <>
                      {specialtyRoomOptions.map((room) => (
                        <div
                          key={room.roomName}
                          // className={`item ${selectedSpecialtyRoom?.roomName === room.roomName ? "selected" : ""}`}
                          className={(editingRoomName === room.roomName ? '' : 'item') + ' ' + (selectedSpecialtyRoom?.roomName === room.roomName ? 'selected' : '') + ' cursor-pointer'}
                          onClick={() => handleClickSpecialtyRoom(room)}
                        >
                          {/* <span>{room.roomName}</span>
                          {room.isEditable && (
                            <button
                              type="button"
                              className="ml-05"
                              onClick={(e) => { e.stopPropagation(); handleEditSpecialtyRoom(room); }}
                            >
                              <i className="ico ico-pen ico-size-20 ico-gray ml-1"></i>
                            </button>
                          )} */}
                          {editingRoomName === room.roomName && room.isEditable ? (
                            <div className="flex items-center w-full">
                              <HiInput
                                type="text"
                                value={editRoom.roomName}
                                maxLength={10}
                                onChange={(e) => setEditRoom(prev => ({ ...prev, roomName: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
                                placeholder="직접입력"
                                autoFocus
                                onBlur={() => {
                                  handleSaveSpecialtyRoom();
                                  setEditingRoomName(null);
                                }}
                                spellCheck={false}
                                wrapClass="w-full"
                              />
                            </div>
                          ) : (
                            <>
                              <span>{room.roomName}</span>
                              {room.isEditable && (
                                <HiButton
                                  type="button"
                                  variant="link"
                                  className="ml-05 px-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingRoomName(room.roomName);
                                    setEditRoom({ roomName: room.roomName, specialtyRoomId: room.specialtyRoomId, isEditable: room.isEditable });
                                  }}
                                >
                                  <Pencil size={18} color='var(--text-neutral-strong)' className='!ml-2' />
                                </HiButton>
                              )}
                            </>
                          )}
                        </div>
                      ))}                      

                      {!showSpecialtyRoomInput && (
                        <div className="item cursor-pointer" onClick={() => handleClickShowSpecialtyRoomInput()}>
                          <span className='flex items-center'>
                            직접입력 
                            <Pencil size={18} color='var(--text-neutral-strong)' className='!ml-2' />
                          </span>
                        </div>
                      )}

                      {showSpecialtyRoomInput && (
                        <div className="mt-05">
                          <HiInput
                            type="text"
                            value={editRoom.roomName}
                            maxLength={10}
                            onChange={(e) => setEditRoom(prev => ({ ...prev, roomName: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                            placeholder="직접입력"
                            autoFocus
                            onBlur={() => handleSaveSpecialtyRoom()}
                            spellCheck={false}
                            wrapClass="w-full"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="item hi-nodata">
                      <p>합반 수업을 선택하세요.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 합반 교사 선택 */}
        <div className={`form-group-inline !mt-5`}>
          <label>
            합반 교사<span className="text-text-primary-base !mr-1">(필수)</span>
          </label>
          <HiSelectBox
            style={{width : 200}}
            value={selectedCombinationTeacherOptionId}
            items={combinationTeacherOptions}
            onChange={handleChangeTeacherOptionId}
            emptyTitle={`${selectedCombinationTeacherOptionId || "선택"}`}
            disabled={!selectedSpecialtyRoom || selectedCombinationOptions.length === 0}
          />
        </div>
      </div>

      {/* 변경 사유 */}
      <div className={`form-group-inline !mt-5`}>
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

export default MergedClass;
