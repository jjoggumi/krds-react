import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HiButton, Button, HiBottomSheet, MobileHeader, HiTab } from '@/components/uiux/';
import { Textarea } from '@/components/uiux/textarea';
import { showToast } from '@/unimplementeds/toast.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonTable } from '../components/replacement/LessonTable';
import { Core, TimetableMobileProps, WeekRange, DailyTimetable } from '../types';
import { TimeUtils, TimetableDisplayUtils, dispatchLessonChangeRequestFailed, dispatchLessonChangeRequestSuccess, goBackWithNative } from '../utils';
import { useDailyLessonsBetweenDates } from '../queries/useDailyLessons';
import { DAYS_OF_WEEK } from '../constants';
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
} from '../context';
import { requestReplacementForTeacher } from '../api';

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
  concurrentCourseId?: string;
  lessonTeacherIds: string[];
}

type CourseOption = {
  displayedTitle: string;
  classId: string;
  className: string;
  courseId: string;
  teacherId: string;
}

type CandidateTeacherOption = {
  teacherId: string;
  teacherName: string;
  label: string;
  sourceDailyLesson: Core.DailyLesson;
};

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
 * 수업 변경 신청 화면 
 * 
 * - 내 시간표 관리 (선생님) > 수업 변경
 * - 내 시간표에서 “공강 (수업 없는 시간)” 선택 시 교체 가능한 내 수업 목록 노출 
 * - ==> 교체 가능한 수업 조건 : 내가 들어가는 수업의 학반의 수업/교사 목록 
 * */
const LessonReplacement = ({ className, lessonDate, teacherId, timetableId }: LessonReplacementProps) => {
  const classes = useClassContext();
  const courses = useCourseContext();
  const teachers = useTeacherContext();
  const teacherCourses = useTeacherCourseContext();
  // const courseBases = useCourseBaseContext();
  // const teacherCourseBases = useTeacherCourseBaseContext();
  // const concurrentConfs = useConcurrentConfContext();

  const specialtyRooms = useSpecialtyRoomContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  // const courseBaseContext = TimetableCourseBaseContext.getInstance();
  // const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
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

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, Core.SpecialtyRoom>),
    [specialtyRooms]
  );
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
  /** 선택한 내 수업 정보 */
  const [selectedMyDailyLesson, setSelectedMyDailyLesson] = useState<Core.DailyLesson | null>(null);
  /** 교체 대상 교사,수업 정보 */
  const [sourceTeacherOption, setSourceTeacherOption] = useState<CandidateTeacherOption | null>(null);
  /** 활성화된 확인 교사 ID */
  const [activeTabTeacherId, setActiveTabTeacherId] = useState('');
  
  const [reason, setReason] = useState('');
  
  const [lessonInfoMap, setLessonInfoMap] = useState<Record<string, LessonInfo>>({});
  const [lessonInfoMapByTeacher, setLessonInfoMapByTeacher] = useState<Record<string, LessonInfo[]>>({});
  const { data: dailyLessons } = useDailyLessonsBetweenDates(
    timetableId || '',
    searchWeekRange?.startDate || 0,
    searchWeekRange?.endDate || 0
  );

  useEffect(() => {
    if (!dailyLessons || !classMap) {
      return;
    }
    // 수업 데이터에 학급명 보정 
    dailyLessons.forEach(lesson => {
      if (!lesson.className) {
        const cls = classMap[lesson.classId];
        lesson.className = cls ? TimetableDisplayUtils.formatFullClassName(cls) : '';
      }
    });
  }, [classMap, dailyLessons]);
  
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

  /** 교사 탭 */
  const teacherTabs = useMemo(() => {
    const ownerTeacherLabel = teacherMap[teacherId || '']?.teacherName || '교사';
    const selectedTargetTeacherLabel = sourceTeacherOption?.teacherName || '교사';

    return [
      { teacherId: teacherId || '', label: ownerTeacherLabel },
      { teacherId: sourceTeacherOption?.teacherId || '', label: selectedTargetTeacherLabel },
    ].filter((tab) => !!tab.teacherId);
  }, [sourceTeacherOption, teacherId, teacherMap]);


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
    console.debug('reloadContextAllWithTimetableId 시작 :: timetableId =', id);
    await gradeContext.reloadWithTimetableId(id);
    await courseContext.reloadWithTimetableId(id);
    // await courseBaseContext.reloadWithTimetableId(id);
    await teacherCourseContext.reloadWithTimetableId(id);
    // await teacherCourseBaseContext.reloadWithTimetableId(id);
    await teacherContext.reloadWithTimetableId(id);
    await classContext.reloadWithTimetableId(id);
    await specialtyRoomContext.reloadWithTimetableId(id);

    console.debug('==== reloadContextAllWithTimetableId 완료 :: ');
  };

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

  const getTitleDateWithDay = (yyyymmdd: number, period: number) => {
    const dayOfWeek = TimeUtils.getDayOfWeek(yyyymmdd);
    const dayTitle = DAYS_OF_WEEK.find((day) => day.index === dayOfWeek)?.title || '';

    return `${getTitleDateAsString(yyyymmdd)} (${dayTitle}${period})`;
  };

  const moveToConfirmStep = (targetOption: CandidateTeacherOption) => {
    if (!selectedCell || !targetOption) {
      return;
    }
    setSourceTeacherOption(targetOption);
    setActiveTabTeacherId(teacherId || '');
    setIsOpenCourseSelectSheet(false);
    setStep('confirm');
  };

  const moveToSelectionStep = useCallback(() => {
    setStep('selection');
    setReason('');
    setSourceTeacherOption(null);
    setActiveTabTeacherId('');
    setSelectedMyDailyLesson(null);
  }, []);

  const handleClickBack = () => {
    if (isOpenCourseSelectSheet) {
      setIsOpenCourseSelectSheet(false);
      setSelectedCell(null);
      return;
    }

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
        setSelectedCell(null);
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

    setActiveTabTeacherId(nextTeacherId);
  };

  // #region 교체 가능한 교사 옵션 계산 로직
  const calculateCandidateTeacherOptions = (clickedLessonDate: number, clickedPeriod: number, selectedCourse: CourseOption) => {
    if (!dailyLessons || dailyLessons.length === 0) {
      return [];
    }

    const candidateLessons = dailyLessons.filter((dailyLesson) => {
      if (dailyLesson.classId !== selectedCourse.classId) {
        return false;
      }
      if (dailyLesson.lessonDate !== clickedLessonDate || dailyLesson.period !== clickedPeriod) {
        return false;
      }
      if (dailyLesson.lessonType != Core.TimetableDailyLessonType.Lesson) {
        return false;
      }
      if (dailyLesson.changeType != Core.TimetableDailyLessonChangeType.None) {
        return false;
      }
      if (dailyLesson.concurrentCourseId) {
        return false;
      }
      return !!dailyLesson.lessonTeacherIds && dailyLesson.lessonTeacherIds.length > 0;
    });

    const resultTeacherOptions = new Map<string, CandidateTeacherOption>();

    candidateLessons.forEach((dailyLesson) => {
      const lessonTeacherIds = dailyLesson.lessonTeacherIds || [];

      lessonTeacherIds.forEach((lessonTeacherId) => {
        if (!lessonTeacherId || lessonTeacherId === teacherId || resultTeacherOptions.has(lessonTeacherId)) {
          return;
        }

        const nextTeacherName = teacherMap[lessonTeacherId]?.teacherName || '교사';
        const nextCourseName = dailyLesson.courseName || '과목';

        resultTeacherOptions.set(lessonTeacherId, {
          teacherId: lessonTeacherId,
          teacherName: nextTeacherName,
          label: `${getTitleDateWithDay(dailyLesson.lessonDate, dailyLesson.period)} ${nextTeacherName} [${nextCourseName}]`,
          sourceDailyLesson: dailyLesson,
        });
      });
    });

    return Array.from(resultTeacherOptions.values());
  };

  // #endregion

  useEffect(() => {
    console.log("코스 선택 options 설정 for teacherId:", teacherId);
    if (!classMap) {
      console.log("classMap이 아직 설정되지 않았습니다.");
    }
    if (!courseMap) {
      console.log("courseMap이 아직 설정되지 않았습니다.");
    }
    if (!teacherId || !classMap || !courseMap) {
      setCourseOptions([]);
      return;
    }

    const lessonInfosOnSelectedTeacher = lessonInfoMapByTeacher[teacherId];
    if (!lessonInfosOnSelectedTeacher || lessonInfosOnSelectedTeacher.length === 0) return;

    console.log("선택된 교사 수업 정보:", lessonInfosOnSelectedTeacher);

    const courseOptions: CourseOption[] = lessonInfosOnSelectedTeacher
      .slice()
      .sort((a, b) => {
        const classA = classMap[a.classId] || { grade: 0, classNumber: 0 };
        const classB = classMap[b.classId] || { grade: 0, classNumber: 0 };
        return classA.grade - classB.grade || classA.classNumber - classB.classNumber;
      })
      .filter(conf => !conf.concurrentCourseId && conf.teacherId === teacherId)
      .map(conf => {
        const course = courseMap[conf.courseId] || { displayedTitle: "", isDoubleTeacher: false };
        const clazz = classMap[conf.classId] || null;
        const className = clazz ? TimetableDisplayUtils.formatFullClassName(clazz) : "";
        const title = `${className}${course.isDoubleTeacher ? " (복)" : ""} ${course.displayedTitle}`;
        return { displayedTitle: title, classId: conf.classId, className: className, teacherId: conf.teacherId, courseId: conf.courseId };
      });

    console.log("설정된 코스 옵션:", courseOptions);

    setCourseOptions(courseOptions);

  }, [teacherId, lessonInfoMapByTeacher, classMap, courseMap]);

  // #region dailyLessons 변경 처리 
  useEffect(() => {
    if (!dailyLessons || dailyLessons.length === 0) {
      return;
    }
    const newLessonInfoMap = {} as Record<string, LessonInfo>;

    const keySet = new Set<string>();
    dailyLessons
      .filter(lesson => lesson.changeType === Core.TimetableDailyLessonChangeType.None)
      .forEach(lesson => {
        const teacherIds = lesson.lessonTeacherIds || [];

        teacherIds.forEach(teacherId => {
          const key = `${teacherId}-${lesson.classId}-${lesson.courseId}`;
          if (keySet.has(key)) {
            return;
          }
          keySet.add(key);
          newLessonInfoMap[key] = {
            teacherId: teacherId,
            courseId: lesson.courseId,
            classId: lesson.classId,
            specialtyRoomId: lesson.specialtyRoomId,
            concurrentCourseId: lesson.concurrentCourseId,
            lessonTeacherIds: teacherIds
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

  }, [dailyLessons]);

  const dailyLessonMapByDateAndPeriod = useMemo(() => {
    if (!dailyLessons || dailyLessons.length === 0) return {};

    return dailyLessons.reduce((map, lesson) => {
      const key = `${lesson.lessonDate}-${lesson.period}`;
      (map[key] ||= []).push(lesson);
      return map;
    }, {} as Record<string, Core.DailyLesson[]>);
  }, [dailyLessons]);

  // #endregion

  const hasCourseOptionOnSelectedCell = (slot: SelectedCell): boolean => {
    const key = `${slot.lessonDate}-${slot.period}`;
    const lessons = dailyLessonMapByDateAndPeriod[key];
    if (!lessons || lessons.length === 0) {
      return false;
    }
    return true;
  }

  const filteredCourseOptions = useMemo(() => {
    if (!teacherId || courseOptions.length === 0 || !selectedCell) return [];

    return courseOptions
      .filter(option => {
        const lessons = dailyLessonMapByDateAndPeriod[`${selectedCell.lessonDate}-${selectedCell.period}`];
        if (!lessons || lessons.length === 0) return false;

        const key = `${option.teacherId}-${option.classId}-${option.courseId}`;

        const lessonInfo = lessonInfoMap[key];
        if (!lessonInfo) return false;

        // 특별실을 이용하는 수업인 경우, 배정 가능한지 체크
        const specialtyRoomId = lessonInfo.specialtyRoomId;
        if (specialtyRoomId) {
          const occupiedCount = lessons.filter(lesson => !!lesson.specialtyRoomId && lesson.specialtyRoomId === specialtyRoomId && option.classId !== lesson.classId).length;
          const maxClass = specialtyRoomMap[specialtyRoomId]?.maxClass;
          if (maxClass) {
            if (occupiedCount + 1 > maxClass) return false;
          }
        }

        const selectableLessons = lessons.filter(lesson =>
          lesson.changeType === Core.TimetableDailyLessonChangeType.None &&
          !lesson.concurrentCourseId
        );

        return !!selectableLessons && selectableLessons.some(lesson => lesson.classId === option.classId);
      });
  }, [selectedCell, dailyLessonMapByDateAndPeriod]);

  // MARK: 교체할 내 수업을 클릭했을 때
  const handleClickCourseOption = (courseOption: CourseOption) => {
    console.log("클릭 course option:", courseOption);
    if (!timetableId) return;

    if (selectedMyDailyLesson) {
      showToast('이미 선택된 수업이 있습니다. 변경하려면 선택된 수업을 먼저 해제하세요.', 3000);
      return;
    }
    const period = selectedCell?.period;
    const lessonDate = selectedCell?.lessonDate;
    if (!period || !lessonDate) return;

    const key = `${courseOption.teacherId}-${courseOption.classId}-${courseOption.courseId}`;
    const myLessonInfo = lessonInfoMap[key];
    if (!myLessonInfo) return;

    const lessonTeacherIds = myLessonInfo.lessonTeacherIds;

    const myDailyLesson: Core.DailyLesson = {
      dailyLessonId: "",
      timetableId: timetableId,
      lessonType: Core.TimetableDailyLessonType.Lesson,
      classId: myLessonInfo.classId,
      lessonDate: lessonDate,
      dayOfWeek: new Date(lessonDate).getDay(),
      period: period,
      courseId: myLessonInfo.courseId,
      specialtyRoomId: myLessonInfo.specialtyRoomId,
      changeType: Core.TimetableDailyLessonChangeType.Replacement,
      isRemoved: false,
      isMoved: false,
      courseName: courseMap[myLessonInfo.courseId]?.displayedTitle || "",
      className: courseOption.className,
      teacherName: undefined,
      roomName: undefined,
      lessonTeacherIds
    };

    console.log("변경 대상 내 수업:", myDailyLesson);

    const candidateTeacherOptions = calculateCandidateTeacherOptions(lessonDate, period, courseOption);
    console.log("생성된 candidate teacher options:", candidateTeacherOptions);
    if (candidateTeacherOptions.length === 0) {
      showToast('해당 교시에는 교체 가능한 수업이 없습니다.', toastOptions);
      return;
    }


    setSelectedMyDailyLesson(myDailyLesson);
    moveToConfirmStep(candidateTeacherOptions[0]);
  };

  const handleClickEmptyCell = (clickedLessonDate: number, clickedPeriod: number, dailyLesson: Core.DailyLesson | null = null) => {
    console.log('handleClickLessonCell', { clickedLessonDate, clickedPeriod });
    if (clickedLessonDate < TimeUtils.getTodayAsNumber()) {
      console.log('오늘 이전의 수업은 선택할 수 없습니다.');
      return;
    }
    if (dailyLesson) {
      showToast('공강을 선택해주세요.', toastOptions);
      return;
    }

    const slot = { lessonDate: clickedLessonDate, period: clickedPeriod };
    if (!hasCourseOptionOnSelectedCell(slot)) {
      showToast('해당 교시에는 교체 가능한 수업이 없습니다.', toastOptions);
      return;
    }

    setSelectedCell(slot);
    setIsOpenCourseSelectSheet(true);
  }

  const handleClickConfirm = async () => {
    if (!timetableId || !selectedMyDailyLesson || !sourceTeacherOption) {
      return;
    }

    // console.log('최종 선택된 수업 변경 정보:', { from: sourceTeacherOption.sourceDailyLesson, to: selectedMyDailyLesson, reason });
    
    try {
      await requestReplacementForTeacher(timetableId, sourceTeacherOption.sourceDailyLesson, selectedMyDailyLesson, reason);
      // console.log('수업 교체 신청 결과:', result);
      if (!dispatchLessonChangeRequestSuccess(Core.TimetableDailyLessonChangeType.Replacement)) {
        // fallback to dispatch event
        showToast('수업 변경 신청이 완료되었습니다.', toastOptions);
        moveToSelectionStep();
      }
    } catch (error: any) {
      console.error(error);
      const status = error.response?.status
      let errorMessage = '수업 변경 신청 중 오류가 발생했습니다. 다시 시도해주세요.';
      if (status === 428) {
        errorMessage = '변경 할 수 있는 수업이 아닙니다.';
      } else {
        errorMessage = !!status ? errorMessage + '(' + status + ')' : errorMessage;
      }
      if(!dispatchLessonChangeRequestFailed(
        Core.TimetableDailyLessonChangeType.Replacement, errorMessage
      )) {
        alert(errorMessage);
      }
      return;
    }
  };

  useEffect(() => {
    if (weekRangeIdx === -1 || !weekRanges[weekRangeIdx]) {
      return;
    }

    setWeekRange(weekRanges[weekRangeIdx]);
  }, [weekRangeIdx, weekRanges]);

  // 초기 진입 시 3주간의 날짜 범위를 구해서
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
    console.log('Initializing DailyTimetable context data');
    initDailyTimetableContextData();
  }, [classes, courses, teachers, teacherCourses]);

  return (
    <div className={clsx('flex h-screen flex-col bg-bg-base select-none', className)}>
      <MobileHeader
        title={step === 'selection' ? '수업 변경' : '변경 시간표 확인'}
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
        <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center mb-4 gap-2">
            <HiButton
              aria-label="이전 주"
              variant="link"
              className={clsx('p-1')}
              onClick={handleClickPrevWeek}
              disabled={weekRangeIdx <= 0}
            >
              <ChevronLeft size={20} className={clsx(weekRangeIdx <= 0 ? 'stroke-text-default' : 'stroke-text-primary-base')}  strokeWidth={2} />
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

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 -left-4 z-[5] w-4 bg-[var(--bg-base)]" />
            <LessonTable
              className="-mx-4"
              onCellClick={handleClickEmptyCell}
              selectedTeacherId={teacherId}
              dailyLessons={dailyLessons}
              weekRange={weekRange}
              selectableMode="empty"
              sizeMode="compact"
              isHorizontalScrollable
              scrollContentInsetX={16}
              fitContentWidth
              allowDisabledClick
              selectedCell={selectedCell}
            />
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
                className="flex-nowrap min-w-max gap-1 pr-2"
              />
            </div>
          )}

          <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <LessonTable
              className="-mx-4"
              selectedTeacherId={activeTabTeacherId || teacherId}
              dailyLessons={dailyLessons}
              weekRange={selectedTargetWeekRange}
              sourceDailyLesson={activeTabTeacherId === teacherId ? null : (sourceTeacherOption?.sourceDailyLesson || null)}
              targetDailyLesson={activeTabTeacherId === teacherId ? selectedMyDailyLesson : null}
              selectableMode="none"
              sizeMode="compact"
              isHorizontalScrollable
              scrollContentInsetX={16}
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
        onClose={() => {
          setIsOpenCourseSelectSheet(false);
          setSelectedCell(null);
        }}
        title="수업 선택"
        className="rounded-t-[16px]"
      >
        <div className="flex flex-col gap-2 px-5">
          {filteredCourseOptions.length === 0 && (
            <div className="block h-12 w-full rounded text-left text-leading-b3 font-normal">
              수업 없음
            </div>
          )}

          {filteredCourseOptions.map((courseOption) => (
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

export default LessonReplacement;
