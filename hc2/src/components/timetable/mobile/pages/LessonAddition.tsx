import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HiButton, Button, HiBottomSheet, MobileHeader, Loading, HiTab } from '@/components/uiux/';
import { HiIcon } from '@/components/uiux/hiIcon';
import { Textarea } from '@/components/uiux/textarea';
import { showToast } from '@/unimplementeds/toast.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonTable } from '../components/addition/LessonTable';
import { Core, TimetableMobileProps, WeekRange, DailyTimetable, ActivateWeekday } from '../types';
import { TimeUtils, TimetableDisplayUtils, dispatchLessonChangeRequestFailed, dispatchLessonChangeRequestSuccess, goBackWithNative } from '../utils';
import { useDailyLessonsBetweenDates } from '../queries/useDailyLessons';
import { ClassDayStatus, DAYS_OF_WEEK } from '../constants';
import {
  TimetableClassContext,
  TimetableCourseBaseContext,
  TimetableCourseContext,
  TimetableGradeContext,
  TimetableSpecialtyRoomContext,
  TimetableTeacherContext,
  TeacherCourseBaseContext,
  TeacherCourseContext,
  useClassContext,
  useCourseContext,
  useTeacherContext,
  useTeacherCourseContext,
  useSpecialtyRoomContext,
  useCourseBaseContext,
  useTeacherCourseBaseContext,
  useConcurrentConfContext,
  useGradeContext,
} from '../context';
import { requestAdditionForTeacher } from '../api';
import NoData from '@/components/uiux/noData';

const getTitleDateAsString = (yyyymmdd: number): string => {
  const date = TimeUtils.getNumberAsDate(yyyymmdd);

  return `${String(date.getMonth() + 1)}월 ${String(date.getDate())}일`;
};

type LessonReplacementProps = TimetableMobileProps;
type ReplacementStep = 'selection' | 'confirm';

type SelectedCell = {
  lessonDate: number;
  period: number;
};

interface LessonInfo {
  teacherId: string;
  courseId: string;
  classId: string;
  specialtyRoomId?: string;
  isVirtualClass?: boolean;
  concurrentCourseId?: string;
  lessonTeacherIds: string[];
}

type CourseOption = {
  displayedTitle: string;
  classId: string;
  courseId: string;
  teacherId: string;
  className: string;
}

const toastOptions = {
  duration: 3000,
  position: 'bottom-center' as const,
  className: ['type01'],
  containerClass: ['post-export-bottom-center'],
  containerStyle: {
    bottom: 'calc(env(safe-area-inset-bottom) + 32px)',
  },
};

/** 
 * 수업 추가 신청 화면 
 * 
 * - 내 시간표 관리 (선생님) > 수업 추가
 * - 수업 없음 시간에 수업 추가하여 보충 수업 진행 
 *   ㄴ “수업 추가” 선택 시 1~10 교시까지 생성된 시간표 표기
 * ==> 수업 없음 교시를 선택하여 보충 진행
 * ==> 공강 선택 시 수업 가능한 학반 목록만 표시함
 * */
const LessonAddition = ({ className, lessonDate, teacherId, timetableId }: LessonReplacementProps) => {

  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const courses = useCourseContext();
  const teachers = useTeacherContext();
  const teacherCourses = useTeacherCourseContext();
  // const courseBases = useCourseBaseContext();
  // const teacherCourseBases = useTeacherCourseBaseContext();
  // const concurrentConfs = useConcurrentConfContext();

  // const specialtyRooms = useSpecialtyRoomContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();

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

  // const specialtyRoomMap = useMemo(
  //   () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, Core.SpecialtyRoom>),
  //   [specialtyRooms]
  // );

  const initDailyTimetableContextData = () => {
    DailyTimetable.context.timetableConfig = gradeContext.timetableConfig;
    DailyTimetable.context.classes = classContext.classes;
    DailyTimetable.context.courses = courseContext.courses;
    DailyTimetable.context.teachers = teacherContext.teachers;
    DailyTimetable.context.teacherCourses = teacherCourseContext.teacherCourses;
    DailyTimetable.context.specialtyRooms = specialtyRoomContext.specialtyRooms;
    console.log('DailyTimetable context 설정');
  };

  const reloadContextAllWithTimetableId = async (id: string) => {
    await gradeContext.reloadWithTimetableId(id);
    await courseContext.reloadWithTimetableId(id);
    await courseBaseContext.reloadWithTimetableId(id);
    await teacherCourseContext.reloadWithTimetableId(id);
    await teacherCourseBaseContext.reloadWithTimetableId(id);
    await teacherContext.reloadWithTimetableId(id);
    await classContext.reloadWithTimetableId(id);
    await specialtyRoomContext.reloadWithTimetableId(id);

    console.debug('==== reloadContextAllWithTimetableId 완료 ======= ');
    setIsTimetableContextLoaded(true);
  };

  // #region State 정의

  const [isTimetableContextLoaded, setIsTimetableContextLoaded] = useState<boolean>(false);
  // const [teacherMaxPeriod, setTeacherMaxPeriod] = useState<number | null>(null);
  // const [teacherDailyLessons, setTeacherDailyLessons] = useState<Core.DailyLesson[]>([]);
  const [step, setStep] = useState<ReplacementStep>('selection');

  const [weekRanges, setWeekRanges] = useState<WeekRange[]>([]);
  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);
  const [weekRangeIdx, setWeekRangeIdx] = useState(-1);
  const [searchWeekRange, setSearchWeekRange] = useState<WeekRange | null>(null);

  const [isOpenCourseSelectSheet, setIsOpenCourseSelectSheet] = useState(false);
  /** 선택된 수업 영역 셀 */
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  /** 가능한 내 수업 옵션 */
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourseOption, setSelectedCourseOption] = useState<CourseOption | null>(null);
  /** 선택한 내 수업 정보 */
  const [selectedNewDailyLesson, setSelectedNewDailyLesson] = useState<Core.DailyLesson | null>(null);
  /** 교체 대상 교사,수업 정보 */
  // const [sourceTeacherOption, setSourceTeacherOption] = useState<CandidateTeacherOption | null>(null);
  /** 활성화된 확인 교사 ID */
  const [activeTabTeacherId, setActiveTabTeacherId] = useState('');

  const [reason, setReason] = useState('');
  /** key: `${tid}-${lesson.classId}-${lesson.courseId}` */
  const [lessonInfoMap, setLessonInfoMap] = useState<Record<string, LessonInfo>>({});
  /** 교사별 간단 수업 목록 */
  const [lessonInfoMapByTeacher, setLessonInfoMapByTeacher] = useState<Record<string, LessonInfo[]>>({});

  // TODO: 주간 수업에 포함되지 않는 교사 수업과정이 있을까? 확인.
  const { data: dailyLessons } = useDailyLessonsBetweenDates(
    timetableId || '',
    searchWeekRange?.startDate || 0,
    searchWeekRange?.endDate || 0
  );

  const weekStartDateLabelText = useMemo(() => weekRange ? getTitleDateAsString(weekRange.startDate) : '', [weekRange]);
  const weekEndDateLabelText = useMemo(() => {
    if (!weekRange) {
      return '';
    }

    const startDate = TimeUtils.getNumberAsDate(weekRange.startDate);
    const endDate = TimeUtils.getNumberAsDate(weekRange.endDate);
    const sameMonth = startDate.getMonth() === endDate.getMonth();
    const endText = getTitleDateAsString(weekRange.endDate);
    return sameMonth ? endText.replace(/^(\d+월 )/, '') : endText;
  }, [weekRange]);

  const selectedTargetWeekRange = useMemo(() => {
    if (!selectedCell?.lessonDate) {
      return null;
    }

    const [startDate, endDate] = TimeUtils.getWeekRange(selectedCell.lessonDate);
    return { startDate, endDate };
  }, [selectedCell]);

  /** 교사, 학반 탭 */
  const teacherTabs = useMemo(() => {
    const firstLabel = teacherMap[teacherId || '']?.teacherName || '교사';
    const secondLabel = selectedCourseOption?.className || '학급';

    return [
      { teacherId: teacherId || '', label: firstLabel },
      { teacherId: selectedCourseOption?.className || '', label: secondLabel },
    ].filter((tab) => !!tab.teacherId);

  }, [teacherId, selectedCourseOption, teacherMap]);

  const isReadyToDisplay = useMemo(() => {
    return timetableConfig && timetableConfig.classDays.length > 0 && weekRange;
  }, [timetableConfig, weekRange]);

  // #endregion

  // #region 선택 가능한 수업 옵션 설정
  //
  // - isTimetableContextLoaded 가 true가 되어야 context에서 데이터를 정상적으로 읽어올 수 있음
  useEffect(() => {
    if (!isTimetableContextLoaded) {
      console.debug('timetable context not loaded yet');
      return;
    }
    console.log("코스 선택 options 설정 for teacherId:", teacherId);
    if (!classMap) {
      console.warn("classMap이 아직 설정되지 않았습니다.");
    }
    if (!courseMap) {
      console.warn("courseMap이 아직 설정되지 않았습니다.");
    }
    if (!lessonInfoMapByTeacher) {
      console.warn("lessonInfoMapByTeacher가 아직 설정되지 않았습니다.");
    }
    if (!teacherId || !classMap || !courseMap || !lessonInfoMapByTeacher || Object.keys(lessonInfoMapByTeacher).length === 0) {
      setCourseOptions([]);
      return;
    }

    let lessonInfos = lessonInfoMapByTeacher[teacherId];
    if (!lessonInfos || lessonInfos.length === 0) {
      console.log("선택된 교사에 해당하는 수업 정보가 없습니다. teacherId:", teacherId);
      return;
    }
    console.debug("선택된 교사에 해당하는 수업 정보:", lessonInfos);
    
    const courseOptions = lessonInfos
      .slice()
      .sort((a, b) => {
        const classA = classMap[a.classId] || { grade: 0, classNumber: 0 };
        const classB = classMap[b.classId] || { grade: 0, classNumber: 0 };
        return classA.grade - classB.grade || classA.classNumber - classB.classNumber;
      })
      .filter(info => !info.concurrentCourseId) // 동시수업 제외
      .map(conf => {
        const course = courseMap[conf.courseId] || { displayedTitle: "", isDoubleTeacher: false };
        const clazz = classMap[conf.classId] || null;
        const title = `${clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : ""}${course.isDoubleTeacher ? " (복)" : ""} ${course.displayedTitle}`;
        const className = clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : '';
        return {
           displayedTitle: title, 
           classId: conf.classId,
           teacherId: conf.teacherId, 
           courseId: conf.courseId, 
           className: className } as CourseOption;
      });

    console.log("코스 옵션:", courseOptions);

    setCourseOptions(courseOptions);

    // 코스 선택 시트 표시 
    if (courseOptions.length > 0 && !selectedCourseOption) {
      setIsOpenCourseSelectSheet(true);
    }

  }, [isTimetableContextLoaded, teacherId, lessonInfoMapByTeacher, classMap, courseMap]);

  // #endregion

  // #region dailyLessons 업데이트 처리 
  useEffect(() => {
    if (!isTimetableContextLoaded || !dailyLessons || dailyLessons.length === 0) {
      return;
    }
    const newLessonInfoMap = {} as Record<string, LessonInfo>;

    const keySet = new Set<string>();
    dailyLessons
      .filter(lesson => lesson.changeType === Core.TimetableDailyLessonChangeType.None)
      .forEach(lesson => {
        // 수업 데이터에 학급명 보정 
        if (!lesson.className) {
          const cls = classMap[lesson.classId];
          lesson.className = cls ? TimetableDisplayUtils.formatFullClassName(cls) : '';
        }
        // if (lesson.concurrentCourseId) { return; } // 동시수업 제외
        const teacherIds = lesson.lessonTeacherIds || [];
        teacherIds.forEach(tid => {
          const key = `${tid}-${lesson.classId}-${lesson.courseId}`;
          if (keySet.has(key)) {
            return;
          }
          keySet.add(key);
          newLessonInfoMap[key] = {
            teacherId: tid,
            courseId: lesson.courseId,
            classId: lesson.classId,
            specialtyRoomId: lesson.specialtyRoomId,
            isVirtualClass: lesson.isVirtualClass,
            concurrentCourseId: lesson.concurrentCourseId,
            lessonTeacherIds: teacherIds
          } as LessonInfo;
        });
      });
    setLessonInfoMap(newLessonInfoMap);
      
    // lessonInfoMapByTeacher 생성
    const newLessonInfoMapByTeacher = {} as Record<string, LessonInfo[]>;

    Object.values(newLessonInfoMap).forEach(lessonInfo => {
      const teacherId = lessonInfo.teacherId;
      if (!newLessonInfoMapByTeacher[teacherId]) {
        newLessonInfoMapByTeacher[teacherId] = [];
      }
      newLessonInfoMapByTeacher[teacherId].push(lessonInfo);
      // if (teacherId === '589ce7d9-d8e6-45fb-9856-65985699ffb5') {
      //   console.debug('수업 정보 (선택된 교사)', lessonInfo);
      // }
    });

    setLessonInfoMapByTeacher(newLessonInfoMapByTeacher);

  }, [isTimetableContextLoaded, dailyLessons, classMap]);

  // #endregion

  const dailyLessonsForSelectedTab = useMemo(() => {
    if (!teacherId || !selectedCourseOption || !activeTabTeacherId) {
      return [];
    }
    if (activeTabTeacherId === teacherId) {
      return dailyLessons?.filter(lesson => {
        return lesson.lessonTeacherIds && lesson.lessonTeacherIds.includes(teacherId);
      }) || [];
    } else {
      return dailyLessons?.filter(lesson => {
        return lesson.className === selectedCourseOption.className;
      }) || [];
    }

  }, [dailyLessons, selectedCourseOption, activeTabTeacherId]);

  /**
   * 선택된 교사와 수업 옵션에 따른 수업 목록 필터링
   * 
   * - 주단위 수업 목록임.
   * - 수업이 있는 날의 정규 수업 이내 교시들을 선택할 수 없도록 빈수업을 채워 넣는다.
   */
  const dailyLessonsForSelection = useMemo(() => {
    if (!timetableConfig || !timetableConfig.operationStartDate || !timetableConfig.operationEndDate || !selectedCourseOption) {
      return [];
    }
    if (!weekRange || !weekRange.startDate || !weekRange.endDate) return [];
    
    const selectedClassName = selectedCourseOption.className;
    const maxPeriod = timetableConfig.maxPeriod || 0;
    const operationStartDate = timetableConfig.operationStartDate;
    const operationEndDate = timetableConfig.operationEndDate;
    const activatedClassDays = timetableConfig.classDays
      .map((isActive: ClassDayStatus, index: number) => ({
        dayOfWeek: index,
        title: DAYS_OF_WEEK.find((day) => day.index === index)?.title || '',
        isActive: isActive === ClassDayStatus.ACTIVATED,
      }))
      .filter((day: ActivateWeekday) => day.isActive);
    // console.debug("수업요일", activatedClassDays.map(day => day.title).join(', '));

    // 선택된 학반의 수업만 필터링
    const selectedClassLessons = dailyLessons?.filter(lesson => {
      if (!lesson.className) { // 수업 데이터에 학급명 보정
        const cls = classMap[lesson.classId];
        lesson.className = cls ? TimetableDisplayUtils.formatFullClassName(cls) : '';
      }
      if (lesson.lessonDate < weekRange.startDate || lesson.lessonDate > weekRange.endDate) {
        return false;
      }
      return lesson.className === selectedClassName;
    }) || [];

    const startDateNumber = TimeUtils.generateLessonDaysWithRange(weekRange.startDate, weekRange.endDate).find(lessonDay => {
      return activatedClassDays.some(day => day.dayOfWeek === lessonDay.dayOfWeek)
    })?.lessonDate ?? weekRange.startDate;

    // console.debug("weekRange", TimeUtils.getDateAsString(weekRange.startDate), TimeUtils.getDateAsString(weekRange.endDate));
    const filledLessons: Core.DailyLesson[] = [];
    activatedClassDays.forEach((classDay, index) => {
      const dayOfWeek = classDay.dayOfWeek;
      const date = TimeUtils.getNumberAsDate(startDateNumber);
      date.setDate(date.getDate() + index);
      const fillDateNumber = TimeUtils.getDateAsNumber(date); // yyyymmdd 형태의 숫자
      const lessons = selectedClassLessons.filter(lesson => lesson.lessonDate === fillDateNumber);
      // console.debug("fillDateNumber", TimeUtils.getDateAsString(fillDateNumber));
      const maxPeriodForDay = Math.max(...lessons.map(lesson => lesson.period), maxPeriod);
      for (let period = 1; period <= maxPeriodForDay; period++) {
        const isInOperationRange = fillDateNumber >= operationStartDate && fillDateNumber <= operationEndDate;
        const existingLesson = lessons.find(lesson => lesson.period === period && lesson.lessonDate === fillDateNumber);
        if (existingLesson && isInOperationRange) {
          filledLessons.push(existingLesson);
        } else {
          // 선택 불가 수업 생성
          filledLessons.push({
            dailyLessonId: '',
            timetableId: timetableId || '',
            lessonType: Core.TimetableDailyLessonType.Lesson,
            classId: '',
            lessonDate: fillDateNumber,
            dayOfWeek: dayOfWeek,
            period: period,
            courseId: '',
            changeType: Core.TimetableDailyLessonChangeType.None,
            isRemoved: false,
            isMoved: false,
            className: ' ',
            courseName: ' ',
            lessonTeacherIds: [],
          } as Core.DailyLesson);
        }
      }
    });

    // console.debug("filledLessons", filledLessons);

    return filledLessons;
  }, [timetableConfig, dailyLessons, selectedCourseOption, weekRange, classMap]);

  // weekRange를 설정
  useEffect(() => {
    if (weekRangeIdx === -1 || !weekRanges[weekRangeIdx]) {
      return;
    }

    setWeekRange(weekRanges[weekRangeIdx]);
  }, [weekRangeIdx, weekRanges]);

  // 초기 진입 시, 3주간의 날짜 범위를 구하여 설정
  useEffect(() => {
    const threeWeeks = TimeUtils.get3WeekRange();
    setWeekRanges(threeWeeks.map(([startDate, endDate]) => ({ startDate, endDate })));
    if (threeWeeks.length === 0) {
      return;
    }

    const searchStartDate = threeWeeks[0][0];
    const searchEndDate = threeWeeks[threeWeeks.length - 1][1];
    console.log('Setting search week range:', { searchStartDate, searchEndDate });
    setSearchWeekRange({ startDate: searchStartDate, endDate: searchEndDate });

    const idx = lessonDate
      ? threeWeeks.findIndex(([startDate, endDate]) => lessonDate >= startDate && lessonDate <= endDate)
      : 0;

    console.log('Initial week range index:', idx, lessonDate);
    setWeekRangeIdx(idx);

  }, [lessonDate]);

  useEffect(() => {
    if (!timetableId) {
      return;
    }
    console.log('Initializing contexts with timetableId:', timetableId);
    reloadContextAllWithTimetableId(timetableId);
  }, [timetableId]);

  useEffect(() => {
    initDailyTimetableContextData();
  }, [classes, courses, teachers, teacherCourses]);


  // MARK: - Functions

  const handleClickPrevWeek = () => {
    if (weekRangeIdx <= 0) { return; }
    setWeekRangeIdx((prev) => prev - 1);
  };

  const handleClickNextWeek = () => {
    if (weekRangeIdx === -1 || weekRangeIdx >= weekRanges.length - 1) {
      return;
    }
    setWeekRangeIdx((prev) => prev + 1);
  };

  const moveToSelectionStep = useCallback(() => {
    setStep('selection');
    setSelectedCell(null);
    setReason('');
    setActiveTabTeacherId('');
    setSelectedNewDailyLesson(null);
  }, []);

  const moveToConfirmStep = (newLesson: Core.DailyLesson) => {
    if (!newLesson) {
      return;
    }
    setActiveTabTeacherId(teacherId || '');
    setIsOpenCourseSelectSheet(false);
    setStep('confirm');
  };

  const handleClickBack = () => {
    if (step === 'confirm') {
      moveToSelectionStep();
      return;
    }

    goBackWithNative();
  };

  // 네이티브에서 뒤로가기 버튼을 눌렀을 때 웹에서도 뒤로가기를 처리
  useEffect(() => {
    window.handlePageBackPress = () => {
      if (isOpenCourseSelectSheet) {
        setIsOpenCourseSelectSheet(false);
        return true;
      }

      if (step === 'confirm') {
        moveToSelectionStep();
        return true;
      }

      return false;
    };

    return () => {
      delete window.handlePageBackPress;
    };
  }, [isOpenCourseSelectSheet, step, moveToSelectionStep]);


  const handleClickTeacherTab = (nextTeacherId: string) => {
    if (!nextTeacherId) {
      return;
    }
    // console.log("선택된 탭 ID:", nextTeacherId);
    setActiveTabTeacherId(nextTeacherId);
  };

  /**
   * 선택한 셀에 수업 추가가 가능한지 여부 판단
   * @param slot 
   * @returns 
   */
  const canAddCourseOnSelectedCell = (slot: SelectedCell): boolean => {
    if (!teacherId) return false;
    if (!selectedCourseOption) return false;
    const hasLesson = dailyLessonsForSelection.some(lesson => lesson.lessonDate === slot.lessonDate && lesson.period === slot.period);
    if (hasLesson) return false;

    return true;
  }

  const handleClickCourseOption = (courseOption: CourseOption) => {
    console.log("클릭 course option:", courseOption);
    setSelectedCell(null);
    setSelectedCourseOption(courseOption);
    setIsOpenCourseSelectSheet(false);
  }

  // #region 추가할 내 수업 생성 
  const makeMyDailyLesson = (timetableId: string, courseOption: CourseOption, cell: SelectedCell) => {

    const period = cell?.period;
    const lessonDate = cell?.lessonDate;
    if (!period || !lessonDate || !teacherId) return null;

    const key = `${teacherId}-${courseOption.classId}-${courseOption.courseId}`;
    const myLessonInfo = lessonInfoMap[key];
    if (!myLessonInfo) return null;

    const clazz = classMap[courseOption.classId] || null;
    // const title = `${clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : ""}${course.isDoubleTeacher ? " (복)" : ""} ${course.displayedTitle}`;
    const className = clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : '';

    const newDailyLesson: Core.DailyLesson = {
      dailyLessonId: uuidv4(),
      timetableId: timetableId,
      lessonType: Core.TimetableDailyLessonType.Lesson,
      classId: courseOption.classId,
      className: className,
      lessonDate: lessonDate,
      dayOfWeek: TimeUtils.getDayOfWeek(lessonDate),
      period: period,
      courseId: courseOption.courseId,
      specialtyRoomId: myLessonInfo.specialtyRoomId,
      isVirtualClass: myLessonInfo.isVirtualClass,
      changeType: Core.TimetableDailyLessonChangeType.Addition,
      isRemoved: false,
      isMoved: false,
      courseName: courseMap[myLessonInfo.courseId]?.displayedTitle || "",
      lessonTeacherIds: myLessonInfo.lessonTeacherIds,
      concurrentCourseId: undefined,
    };

    //console.log("변경 대상 내 수업:", newDailyLesson);

    return newDailyLesson;
  };
  // #endregion

  const handleClickEmptyCell = (clickedLessonDate: number, clickedPeriod: number, dailyLesson: Core.DailyLesson | null = null) => {
    console.log('handleClickLessonCell', { clickedLessonDate, clickedPeriod });
    if (!timetableId || !selectedCourseOption) return;

    if (clickedLessonDate < TimeUtils.getTodayAsNumber()) {
      console.log('오늘 이전의 수업은 선택할 수 없습니다.');
      return;
    }
    if (dailyLesson) {
      showToast('수업 없는 시간을 선택하세요.', toastOptions);
      return;
    }

    const cell = { lessonDate: clickedLessonDate, period: clickedPeriod };
    if (!canAddCourseOnSelectedCell(cell)) {
      showToast('해당 교시에는 수업이 있습니다.', toastOptions);
      return;
    }

    const newLesson = makeMyDailyLesson(timetableId, selectedCourseOption, cell);
    if (!newLesson) {
      showToast('선택한 수업 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.', toastOptions);
      return;
    }
    setSelectedCell(cell);
    setSelectedNewDailyLesson(newLesson);
    moveToConfirmStep(newLesson)
  }

  const handleClickConfirm = async () => {
    if (!timetableId || !selectedNewDailyLesson) {
      return;
    }

    //console.log('최종 선택된 수업 변경 정보:', { to: selectedNewDailyLesson, reason });

    try {
      await requestAdditionForTeacher(timetableId, selectedNewDailyLesson, reason);
      //console.log('수업 추가 신청 결과:', result);
      if (!dispatchLessonChangeRequestSuccess(Core.TimetableDailyLessonChangeType.Addition)) {
        // fallback to dispatch event
        showToast('수업 추가 신청이 완료되었습니다.', toastOptions);
        moveToSelectionStep();
      }
    } catch (error: any) {
      console.error(error);
      const status = error.response?.status
      let errorMessage = '수업 추가 신청 중 오류가 발생했습니다. 다시 시도해주세요.';
      if (status === 428) {
        errorMessage = '이미 교사가 다른 수업이 있는 시간, 학급이 다른 수업이 있는 시간, 혹은 동시 수업 등이 있습니다.';
      } else {
        errorMessage = status ? errorMessage + '(' + status + ')' : errorMessage;
      }
      if(!dispatchLessonChangeRequestFailed(
        Core.TimetableDailyLessonChangeType.Addition, errorMessage
      )) {
        alert(errorMessage);
      }
      return;
    }
  };

  return (
    <div className={clsx('flex h-screen flex-col bg-bg-base select-none', className)}>
      <MobileHeader
        title={step === 'selection' ? '수업 추가' : '변경 시간표 확인'}
        onBack={handleClickBack}
        className="border-b-0"
        rightArea={step === 'confirm' ? (
          <Button
            variant="link"
            size="sm"
            className="pr-5 !text-b1 !leading-b1 mr-2 font-semibold"
            style={{ color: 'var(--text-primary-base)' }}
            onClick={() => handleClickConfirm()}
          >
            보내기
          </Button>
        ) : null}
      />

      {step === 'selection' ? (
        <main
          className={clsx(
            'flex-1 overscroll-contain px-4 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
            selectedCourseOption ? 'overflow-y-auto' : 'overflow-hidden'
          )}
        >
          <div className="mb-4 flex items-center justify-between" >
            <div className="flex items-center gap-2">
              <HiButton
                aria-label="이전 주"
                variant="link"
                className={clsx('p-1')}
                onClick={handleClickPrevWeek}
                disabled={weekRangeIdx <= 0}
              >
                <ChevronLeft size={20} className={clsx(weekRangeIdx <= 0 ? 'stroke-text-default' : 'stroke-text-primary-base')} strokeWidth={2} />
              </HiButton>
              <span className="text-leading-b1 font-bold text-text-default">
                {weekStartDateLabelText} ~ {weekEndDateLabelText}
              </span>
              <HiButton
                aria-label="다음 주"
                variant="link"
                className={clsx('p-1')}
                onClick={handleClickNextWeek}
                disabled={weekRangeIdx === -1 || weekRangeIdx >= weekRanges.length - 1}
              >
                <ChevronRight size={20} className={clsx(weekRangeIdx === -1 || weekRangeIdx >= weekRanges.length - 1 ? 'stroke-text-default' : 'stroke-text-primary-base')} strokeWidth={2} />                
              </HiButton>
            </div>
            <Button
                aria-label="선택된 수업"
                variant="link"
                onClick={() => setIsOpenCourseSelectSheet(true)}
                className="!text-text-neutral-strong"
              >
                {selectedCourseOption?.displayedTitle || '과목 선택'}
                <HiIcon icon='arrow-down' size={20} color="text-neutral-strong" />
            </Button>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 -left-4 z-[5] w-4 bg-[var(--bg-base)]" />
            {isReadyToDisplay ? (
              <LessonTable
                className="-mx-4"
                isTeacherTable={false}
                onCellClick={selectedCourseOption ? handleClickEmptyCell : undefined}
                dailyLessons={selectedCourseOption ? dailyLessonsForSelection : []}
                weekRange={weekRange}
                selectableMode={selectedCourseOption ? 'empty' : 'none'}
                scrollContentInsetX={16}
                fitContentWidth
                minimumPeriod={15}
                emptyMessage={!selectedCourseOption ? <NoData message="과목을 선택하세요." size="md" /> : undefined}
                emptyMessageClassName="h-[364px]"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <Loading variant="spinner" className="static [transform:none]" />
              </div>
            )}
          </div>
        </main>
      ) : (
        // confirm step : 요청사항 미리보기 
        <>
          {teacherTabs.length > 0 && (
            <div className="px-4 pt-6 pb-4 shrink-0">              
              <HiTab
                variant="pills"
                size="sm"
                labels={teacherTabs.map((t) => t.label)}
                selectedTabIndex={teacherTabs.findIndex((t) => t.teacherId === activeTabTeacherId)}
                isControlOuter
                onChange={(index: number) => handleClickTeacherTab(teacherTabs[index].teacherId)}
              />
            </div>
          )}

          <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <LessonTable
              className="-mx-4"
              dailyLessons={dailyLessonsForSelectedTab}
              weekRange={selectedTargetWeekRange}
              sourceDailyLesson={null}
              targetDailyLesson={selectedNewDailyLesson}
              selectableMode="none"
              scrollContentInsetX={16}
              isTeacherTable={activeTabTeacherId === teacherId}
            />
            <div className="mt-6">
              <p className="mb-3 text-leading-b2 font-semibold text-text-default">변경 사유</p>  
              <Textarea
                value={reason}
                onChange={(event) =>  {
                  const newValue = event.target.value;
                  const sanitized = newValue.replace(/\n/g, ''); // 줄바꿈 제거
                  setReason(sanitized);
                }}
                placeholder="선택 사항 (최대 50자)"
                rows={2}
                className="rounded-md"
                maxLength={50}
                isAutoGrow={true}
                canNewLine={false}
              />
            </div>
          </main>
        </>
      )}

      <HiBottomSheet
        isOpen={isOpenCourseSelectSheet}
        onClose={() => setIsOpenCourseSelectSheet(false)}
        title="수업 선택"
        className="rounded-t-[16px]"
      >
        <div className="flex flex-col gap-2 px-5">
          {courseOptions.map((courseOption) => (
            <HiButton
              variant="secondary" block={true}
              key={courseOption.classId + courseOption.courseId}
              className="min-h-12 !h-auto rounded px-4 !py-[15px] justify-start text-leading-b3 font-normal text-text-primary-base"
              onClick={() => handleClickCourseOption(courseOption)}
            >
              {courseOption.displayedTitle}
            </HiButton>
          ))}
        </div>
      </HiBottomSheet>
    </div>
  );
};

export default LessonAddition;
