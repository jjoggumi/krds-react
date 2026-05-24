import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { MobileHeader, Button, HiButton } from '@/components/uiux/';
import { showToast } from '@/unimplementeds/toast.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonTable } from '../components/exchange/LessonTable';
import LessonChangeConfirm from '../components/exchange/LessonChangeConfirm';
import { ActivateWeekday, Core, LessonDay, TimetableMobileProps, WeekRange } from '../types';
import { dispatchLessonChangeRequestFailed, dispatchLessonChangeRequestSuccess, goBackWithNative, TimetableDisplayUtils, TimeUtils } from '../utils';
import { useDailyLessonsBetweenDates } from '../queries/useDailyLessons';
import { TeacherCourseBaseContext, TeacherCourseContext, TimetableClassContext, TimetableConcurrentConfContext, TimetableCourseBaseContext, TimetableCourseContext, TimetableGradeContext, TimetableSpecialtyRoomContext, TimetableTeacherContext, useClassContext, useConcurrentConfContext, useCourseBaseContext, useCourseContext, useGradeContext, useSpecialtyRoomContext, useTeacherContext, useTeacherCourseBaseContext, useTeacherCourseContext } from '../context';


/* ────────────────────────────────────────────────────────────
   메인 컴포넌트
──────────────────────────────────────────────────────────── */
import { DailyTimetable } from '../../core';
import { ClassDayStatus, DAYS_OF_WEEK } from '../../common/constants';
import SwapOptionSheet, { ChangeOption } from '../components/exchange/SwapOptionSheet';
import { DailyLesson, DailyLessonMoveInfo, DailyTimetablePeriod, TimetableLessonChangeStatus } from '../../core/types';
import { useRequestExchangeForTeacher } from '../queries/useLessonChange';

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
 * 수업 교체 요청 화면 
 * @param props 
 * @returns 
 */
const LessonExchange = (props: TimetableMobileProps) => {
  const [step, setStep] = useState<'table' | 'confirm'>('table'); // 현재 단계 ('기본 시간표' 또는 '변경 시간표 확인') 상태

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
  // const concurrentConfContext = TimetableConcurrentConfContext.getInstance();

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

  const reloadContextAllWithTimetableId = async (id: string) => {
    // 모든 컨텍스트의 reload 함수를 호출
    // await timetableOverviewContext.reloadWithTimetableId(id);
    await gradeContext.reloadWithTimetableId(id);
    await courseContext.reloadWithTimetableId(id);
    await courseBaseContext.reloadWithTimetableId(id);
    await teacherCourseContext.reloadWithTimetableId(id);
    await teacherCourseBaseContext.reloadWithTimetableId(id);
    await teacherContext.reloadWithTimetableId(id);
    await classContext.reloadWithTimetableId(id);
    await specialtyRoomContext.reloadWithTimetableId(id);
    // await lessonConfContext.reloadWithTimetableId(id);
    // await concurrentConfContext.reloadWithTimetableId(id);
  };


  const [activatedClassDays, setActivatedClassDays] = useState<ActivateWeekday[]>([]);
  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);
  const [weekRangeIdx, setWeekRangeIdx] = useState(-1);
  const [searchWeekRange, setSearchWeekRange] = useState<WeekRange | null>(null);
  const [weeks, setWeeks] = useState<WeekRange[]>([]);
  const [selectedDailyLesson, setSelectedDailyLesson] = useState<Core.DailyLesson | null>(null);
  const [directExchangeableLessons, setDirectExchangeableLessons] = useState<Core.DailyLesson[]>([]);
  const [chainExchangeableLessons, setChainExchangeableLessons] = useState<Core.DailyChainExchangeable[]>([]);
  const [exchangePath, setExchangePath] = useState<Core.DailyLessonMoveInfo[]>([]); // 연쇄 교환 시 선택된 경로의 수업들

  const initDailyTimetableContextData = async () => {
    DailyTimetable.context.timetableConfig = gradeContext.timetableConfig;
    DailyTimetable.context.classes = classContext.classes;
    DailyTimetable.context.courses = courseContext.courses;
    DailyTimetable.context.teachers = teacherContext.teachers;
    DailyTimetable.context.teacherCourses = teacherCourseContext.teacherCourses;
  }

  const getTitleDateAsString = (yyyymmdd: number): string => {
    const date = TimeUtils.getNumberAsDate(yyyymmdd);
    return `${String(date.getMonth() + 1)}월 ${String(date.getDate())}일`;
  }

  const timetableId = useMemo(() => props.timetableId || '', [props.timetableId]);
  const lessonDate = useMemo(() => props.lessonDate, [props.lessonDate]);
  const selectedTeacherId = useMemo(() => props.teacherId, [props.teacherId]);

  const weekStartDate = useMemo(() => weekRange ? getTitleDateAsString(weekRange.startDate) : '', [weekRange]);
  const weekEndDate = useMemo(() => {
    if (!weekRange) return '';
    const startDateObj = TimeUtils.getNumberAsDate(weekRange.startDate);
    const endDateObj = TimeUtils.getNumberAsDate(weekRange.endDate);
    if (startDateObj.getMonth() === endDateObj.getMonth()) {
      return `${String(endDateObj.getDate())}일`;
    }
    return getTitleDateAsString(weekRange.endDate);
  }, [weekRange]);

  const searchWeekLessonDays = useMemo(() => {
    if (!searchWeekRange || activatedClassDays.length === 0) {
      return [];
    }

    const { startDate, endDate } = searchWeekRange;

    const lessonDays = TimeUtils.generateLessonDaysWithRange(startDate, endDate);
    return lessonDays.filter((lessonDay: LessonDay) =>
      activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
    );
  }, [searchWeekRange, activatedClassDays]);

  const { data: dailyLessons } = useDailyLessonsBetweenDates(
    timetableId,
    searchWeekRange?.startDate || 0,
    searchWeekRange?.endDate || 0
  );

  const { requestExchangeForTeacher } = useRequestExchangeForTeacher();

  const dailyLessonMap = useMemo(() => {
    if (!dailyLessons) {
      return {} as Record<string, Core.DailyLesson>;
    }

    return dailyLessons.reduce((map, lesson) => {
      map[lesson.dailyLessonId] = lesson;
      return map;
    }, {} as Record<string, Core.DailyLesson>);
  }, [dailyLessons]);

  // 수업 클릭 시 
  /*
  const handleCellClick = (cell: LessonCellData, period: number, dayIndex: number) => {
    setSelected({ cell, period, dayIndex });
  };
  */

  const resetSelectedDailyLesson = () => {
    // resetTargetSelection();
    setDirectExchangeableLessons([]);
    setChainExchangeableLessons([]);
    setSelectedDailyLesson(null);
  }

  const searchExchangeableDailyLessons = () => {
    if (!selectedDailyLesson) {
      return;
    }

    DailyTimetable.initWithPresetedLessons(dailyLessons || [], searchWeekLessonDays);

    // 오늘 일자 숫자 형태 (yyyymmdd)로 변환
    const todayNumber = TimeUtils.getTodayAsNumber();

     // 과거일자 제외
    const directExchangeableLessons = DailyTimetable.findOneToOneExchangeableLessons(selectedDailyLesson)
      .filter(lesson => (lesson.lessonDate >= todayNumber));

    // 이동할 수업이 오늘 이전인 경우, 교환 불가능 처리
    const chainExchangeableLessons = DailyTimetable.findChainExchangeableLessons(selectedDailyLesson)
      .filter(exchangeable => !(exchangeable.targetLesson.lessonDate < todayNumber));
      
    // 각 경로 내 수업 중 하나라도 오늘 이전인 경우, 해당 경로 전체를 교환 불가능 처리
    chainExchangeableLessons.forEach(exchangeable => {
      exchangeable.paths = exchangeable.paths.filter(path => {
        return !path.some(lesson => lesson.lessonDate < todayNumber);
      });
    });

    setDirectExchangeableLessons(directExchangeableLessons);
    setChainExchangeableLessons(chainExchangeableLessons);

    // console.log('1:1 교환 가능한 수업:', directExchangeableLessons);
    // console.log('연쇄 교환 가능한 수업:', chainExchangeableLessons);
  }

  const directlyExchangeOptions = useMemo(() => {
    return directExchangeableLessons.map(lesson => {

      const className = lesson.className || TimetableDisplayUtils.formatFullClassName(classMap[lesson.classId]);
      const courseName = lesson.courseName || courseMap[lesson.courseId]?.displayedTitle || '';
      const teacherNames = lesson.lessonTeacherIds?.map(teacherId => teacherMap[teacherId]?.teacherName)
        .filter(t => !!t)
        .join(', ');

      const wd = DAYS_OF_WEEK.find(day => day.index === lesson.dayOfWeek)?.title || '';
      const text = `${getTitleDateAsString(lesson.lessonDate)} (${wd}${lesson.period}) ${className} ${teacherNames} [${courseName}]`;

      return {
        id: lesson.dailyLessonId,
        type: '1:1' as const,
        itemTexts: [text]
      };
    });
  }, [directExchangeableLessons]);

  const chainExchangeOptions = useMemo(() => {
    if (!chainExchangeableLessons || chainExchangeableLessons.length === 0) {
      return [];
    }

    return chainExchangeableLessons.map(exchangeable => {
      const { targetLesson, paths } = exchangeable;

      if (!paths || paths.length === 0) {
        return [];
      }

      const pathOptions = paths.map((paths, idx) => {
        if (paths.length === 0) {
          return [];
        }

        // 경로를 사람이 읽을 수 있는 형태의 문자열로 변환
        // 첫번째 수업은 선택된 수업이므로 제외, 나머지 수업은 역순으로 표시
        const texts = paths.slice(1).reverse().map(lesson => {
          const className = lesson.className || TimetableDisplayUtils.formatFullClassName(classMap[lesson.classId]);
          const courseName = lesson.courseName || courseMap[lesson.courseId]?.displayedTitle || '';
          const teacherNames = lesson.lessonTeacherIds?.map(teacherId => teacherMap[teacherId]?.teacherName)
            .filter(t => !!t)
            .join(', ');

          const wd = DAYS_OF_WEEK.find(day => day.index === lesson.dayOfWeek)?.title || '';

          return `${getTitleDateAsString(lesson.lessonDate)} (${wd}${lesson.period}) ${className} ${teacherNames} [${courseName}]`;
        });

        return {
          id: `${targetLesson.dailyLessonId}-path-${idx}`,
          type: 'chain' as const,
          itemTexts: texts,
        } as ChangeOption;
      }) as ChangeOption[];

      return pathOptions;
    })
      .flat();
  }, [chainExchangeableLessons]);

  const isExchangeableStatus = useMemo(() => {
    // 변경 적용 가능 상태: 교환 경로가 선택된 상태
    return exchangePath && exchangePath.length > 0;
  }, [exchangePath]);

  const exchangeOptions = useMemo(() => {
    return [...directlyExchangeOptions, ...chainExchangeOptions];
  }, [directlyExchangeOptions, chainExchangeOptions]);

  const handleCellClick = (lessonDate: number, period: number, dailyLesson: Core.DailyLesson | null = null) => {
    if (!selectedDailyLesson && dailyLesson) { // 교체할 수업 선택
      // 동시 수업, 연속 수업 선택 불가
      if (dailyLesson?.concurrentCourseId || dailyLesson?.consecutiveGroupId) {
        return;
      }
      
      setSelectedDailyLesson(dailyLesson);
      return;
    }

    if (selectedDailyLesson && selectedDailyLesson.dailyLessonId === dailyLesson?.dailyLessonId) { // 이미 선택된 수업을 다시 클릭한 경우, 선택 해제
      resetSelectedDailyLesson();
      return;
    }

    showToast('변경할 수업을 선택하세요.', toastOptions);
  }

  // 교환 옵션 선택 시
  const handleSelectChangeOption = (option: ChangeOption) => {
    if (!selectedDailyLesson) {
      return;
    }

    const exchangePath = option.type === '1:1' ? getExchangePathOneToOne(option.id) :
      getExchangePathChain(option.id);

    setExchangePath(exchangePath || []);
    // setSelectedSwap(option);
    setStep('confirm');
  };

  useEffect(() => {
    if (weekRangeIdx === -1 || !weeks[weekRangeIdx]) {
      return;
    }

    setWeekRange(weeks[weekRangeIdx]);
  }, [weekRange, weekRangeIdx]);

  useEffect(() => {
    // 오늘 기준 3주를 셋팅
    const initWeeks = () => {
      const threeWeeks = TimeUtils.get3WeekRange();
      setWeeks(threeWeeks.map(([startDate, endDate]) => ({ startDate, endDate })));

      if (threeWeeks.length === 0) {
        return;
      }

      // 전체 시간표 조회 기준 (수업 교체는 3주)
      const searchStartDate = threeWeeks[0][0];
      const searchEndDate = threeWeeks[threeWeeks.length - 1][1];
      setSearchWeekRange({ startDate: searchStartDate, endDate: searchEndDate });

      const idx = lessonDate ?
        threeWeeks.findIndex(([startDate, endDate]) => lessonDate >= startDate && lessonDate <= endDate) :
        0;

      setWeekRangeIdx(idx);
    };

    initWeeks();
  }, []);

  useEffect(() => {
    if (timetableId) {
      reloadContextAllWithTimetableId(timetableId);
    }
  }, [timetableId]);

  useEffect(() => {
    if (!timetableConfig) {
      return;
    }

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

  useEffect(() => {
    initDailyTimetableContextData();
  }, [classes, courses, teachers, teacherCourses]);

  useEffect(() => {
    if (!selectedDailyLesson) {
      return;
    }

    searchExchangeableDailyLessons();
  }, [selectedDailyLesson]);


  const handlClickNextWeek = () => {
    if (weekRangeIdx === -1 || weekRangeIdx >= weeks.length - 1) {
      return;
    }

    setWeekRangeIdx(prev => prev + 1);
  };

  const handleClickPrevWeek = () => {
    if (weekRangeIdx <= 0) {
      return;
    }

    setWeekRangeIdx(prev => prev - 1);
  };

  const handleClickBack = () => {
    if (!goBackWithNative()) {
      window.history.back();
    }
  };

  const handleSubmit = (reason: string) => {
    console.log('사유:', reason);
    console.log('제출할 교환 경로:', exchangePath);

    if (!isExchangeableStatus) {
      return;
    }

    doExchangeLessons(reason);
  };

  const handleCancel = () => {
    setStep('table');
  }

  // 네이티브에서 뒤로가기 버튼을 눌렀을 때 웹에서도 뒤로가기를 처리
  useEffect(() => {
    window.handlePageBackPress = () => {
      if (selectedDailyLesson) {
        setSelectedDailyLesson(null);
        return true;
      }

      if (step === 'confirm') {
        setStep('table');
        return true;
      }

      return false;
    };

    return () => {
      delete window.handlePageBackPress;
    };
  }, [selectedDailyLesson, step]);


  const doExchangeLessons = async (reason: string) => {
    if (!exchangePath || exchangePath.length === 0 || !timetableId) {
      return;
    }

    // 1:1 교환인 경우, 선택된 경로 그대로 사용
    const exchangeDailyLessons = exchangePath.length > 2 ?
      getSelectedChainExchangeablePath() :
      exchangePath.map(p => p.sourceLesson) as Core.DailyLesson[];

    try {
      await requestExchangeForTeacher({ timetableId, reason, exchangeDailyLessons });
      //console.log('교체 요청 결과:', result);
      if (!dispatchLessonChangeRequestSuccess(Core.TimetableDailyLessonChangeType.Exchange)) {
        // fallback to dispatch event
        showToast('수업 교체 신청이 완료되었습니다.', toastOptions);
        setStep('table');
      }
    } catch (error: any) {
      console.error(error);
      const status = error.response?.status
      let errorMessage = '수업 교체 신청 중 오류가 발생했습니다. 다시 시도해주세요.';
      if (status === 428) {
        errorMessage = '교체 요청을 할 수 없는 수업이 있습니다.';
      } else {
        errorMessage = !!status ? errorMessage + '(' + status + ')' : errorMessage;
      }
      if(!dispatchLessonChangeRequestFailed(
        Core.TimetableDailyLessonChangeType.Exchange, errorMessage
      )) {
        alert(errorMessage);
      }
      return;
    }
  }

  // 연쇄 교환 시, 선택된 경로의 수업들을 교환 순서대로 정렬하여 반환
  const getSelectedChainExchangeablePath = (): DailyLesson[] => {

    const moveInfoOfSelected = exchangePath.find(p => {
      if (!p.sourceLesson) {
        return false;
      }
      const source = p.sourceLesson;
      return source.lessonDate === selectedDailyLesson?.lessonDate && source.period === selectedDailyLesson?.period;
    });

    // 연쇄 교환 경로 정렬
    if (!moveInfoOfSelected || !moveInfoOfSelected.targetPeriod) {
      return [];
    }

    const { lessonDate, period, dayOfWeek } = moveInfoOfSelected.sourceLesson || {};

    let tailTargetPeriod = {
      lessonDate,
      period,
      dayOfWeek
    } as DailyTimetablePeriod;

    const sortedExchangePath = [] as DailyLessonMoveInfo[];
    const pathForSort = [...exchangePath] as DailyLessonMoveInfo[];
    while (pathForSort.length > 0) {
      let idx = 0;
      for (const p of pathForSort) {
        const { lessonDate, period } = p.sourceLesson || {};
        if (tailTargetPeriod.lessonDate !== lessonDate || tailTargetPeriod.period !== period) {
          idx += 1;
          continue;
        }

        sortedExchangePath.push(p);

        tailTargetPeriod = {
          lessonDate: p.targetPeriod?.lessonDate || 0,
          period: p.targetPeriod?.period || 0,
          dayOfWeek: p.targetPeriod?.dayOfWeek || 0,
        };

        break;
      }

      // 처리된 수업은 경로에서 제거
      pathForSort.splice(idx, 1);
    }

    return sortedExchangePath.map(p => p.sourceLesson) as DailyLesson[];
  }


  const getExchangePathOneToOne = (optionId: string): Core.DailyLessonMoveInfo[] | null => {
    const targetDailyLesson = dailyLessonMap[optionId];
    if (!targetDailyLesson || !selectedDailyLesson) {
      return null;
    }

    const newExchangePath = [
      {
        sourceLesson: targetDailyLesson!,
        targetPeriod: {
          lessonDate: selectedDailyLesson.lessonDate,
          period: selectedDailyLesson.period,
          dayOfWeek: selectedDailyLesson.dayOfWeek
        }
      },
      {
        sourceLesson: selectedDailyLesson!,
        targetPeriod: {
          lessonDate: targetDailyLesson.lessonDate,
          period: targetDailyLesson.period,
          dayOfWeek: targetDailyLesson.dayOfWeek
        }
      },
    ] as Core.DailyLessonMoveInfo[];

    return newExchangePath;
  }

  const getExchangePathChain = (optionId: string): Core.DailyLessonMoveInfo[] | null => {
    if (!chainExchangeableLessons || chainExchangeableLessons.length === 0) {
      return null;
    }

    const [targetLessonId, optIdx] = optionId.split('-path-');
    const targetDailyLesson = dailyLessonMap[targetLessonId];

    if (!targetDailyLesson) {
      return null;
    }

    const pathIdx = parseInt(optIdx, 10);

    const exchangeable = chainExchangeableLessons.find(exchangeable => {
      const { targetLesson, paths } = exchangeable;
      if (!targetLesson || targetLesson.dailyLessonId !== targetLessonId) {
        return false;
      }


      if (!paths || paths.length < pathIdx + 1) {
        return false;
      }

      return true;
    });

    if (!exchangeable || !selectedDailyLesson) {
      return null;
    }

    const { paths } = exchangeable;

    const path = paths[pathIdx];
    const pathForSort = [] as Core.DailyLessonMoveInfo[];

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
      });
    });

    // 연쇄 교환 경로 정렬
    const { lessonDate, period, dayOfWeek } = targetDailyLesson;

    const sortedExchangePath = [] as Core.DailyLessonMoveInfo[];
    let tailTargetPeriod = {
      lessonDate,
      period,
      dayOfWeek
    } as Core.DailyTimetablePeriod;

    while (pathForSort.length > 0) {
      let idx = 0;
      for (const p of pathForSort) {
        const { lessonDate, period } = p.sourceLesson || {};
        if (tailTargetPeriod.lessonDate !== lessonDate || tailTargetPeriod.period !== period) {
          idx += 1;
          continue;
        }

        sortedExchangePath.push(p);

        tailTargetPeriod = {
          lessonDate: p.targetPeriod?.lessonDate || 0,
          period: p.targetPeriod?.period || 0,
          dayOfWeek: p.targetPeriod?.dayOfWeek || 0,
        };

        break;
      }

      // 처리된 수업은 경로에서 제거
      pathForSort.splice(idx, 1);
    }

    return sortedExchangePath;
  }


  // 기본 시간표 화면
  return (
    <>
      {step === 'table' && (
        <div className={clsx('flex flex-col h-screen bg-bg-base select-none', props.className)}>
          <MobileHeader
            title="수업 교체"
            onBack={handleClickBack}
            className="border-b-0"
          />

          <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center mb-4 gap-2">
              <HiButton aria-label="뒤로가기" variant="link" 
                className={clsx('p-1')}
                onClick={handleClickPrevWeek}                
                disabled={weekRangeIdx <= 0}
                >
                <ChevronLeft size={20} className={clsx(weekRangeIdx <= 0 ? 'stroke-text-default' : 'stroke-text-primary-base')}  strokeWidth={2} />
              </HiButton>
              <span className="text-leading-b1 font-bold text-text-default">{weekStartDate} ~ {weekEndDate}</span>
              <HiButton aria-label="앞으로가기" variant="link"
                className={clsx('p-1')}
                onClick={handlClickNextWeek}                             
                disabled={(weekRangeIdx === -1 || weekRangeIdx >= weeks.length - 1)}
                >
                <ChevronRight size={20} className={clsx((weekRangeIdx === -1 || weekRangeIdx >= weeks.length - 1) ? 'stroke-text-default' : 'stroke-text-primary-base')} strokeWidth={2} />
              </HiButton>
            </div>
            <LessonTable
              onCellClick={handleCellClick}
              selectedDailyLesson={selectedDailyLesson}
              selectedTeacherId={selectedTeacherId}
              dailyLessons={dailyLessons}
              weekRange={weekRange || undefined}
            />
          </main>

          {/* 수업 클릭 시 바텀시트 — 교환 옵션 목록 */}
          <SwapOptionSheet
            isOpen={!!selectedDailyLesson}
            onClose={() => setSelectedDailyLesson(null)}
            onSelect={handleSelectChangeOption}
            exchangeOptions={exchangeOptions}
          />
        </div>)}
      {step === 'confirm' && (
        <LessonChangeConfirm
          className={props.className}
          weekRange={searchWeekRange}
          dailyLessons={dailyLessons}
          selectedDailyLesson={selectedDailyLesson}
          exchangePath={exchangePath}
          onBack={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default LessonExchange;