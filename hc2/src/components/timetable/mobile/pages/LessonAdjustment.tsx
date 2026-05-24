import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HiButton, Button, HiBottomSheet, MobileHeader, Loading, HiTab } from '@/components/uiux/';
import { Textarea } from '@/components/uiux/textarea';
import { showToast } from '@/unimplementeds/toast.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonTable } from '../components/adjustment/LessonTable';
import { Core, TimetableMobileProps, WeekRange, DailyTimetable } from '../types';
import { TimeUtils, TimetableDisplayUtils, dispatchLessonChangeRequestFailed, dispatchLessonChangeRequestSuccess, goBackWithNative } from '../utils';
import { useDailyLessonsBetweenDates } from '../queries/useDailyLessons';
import { TimetableClassContext, TimetableCourseBaseContext, TimetableCourseContext, TimetableGradeContext, TimetableSpecialtyRoomContext, TimetableTeacherContext, TeacherCourseBaseContext, TeacherCourseContext, useClassContext, useCourseContext, useTeacherContext, useTeacherCourseContext, useGradeContext } from '../context';
import { requestAdjustmentForTeacher } from '../api';

const getTitleDateAsString = (yyyymmdd: number): string => {
  const date = TimeUtils.getNumberAsDate(yyyymmdd);

  return `${String(date.getMonth() + 1)}월 ${String(date.getDate())}일`;
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

type AdjustmentStep = 'selection' | 'confirm';

type CandidateTeacherOption = {
  teacherId: string;
  label: string;
};


/**
 * 수업 결보강 신청 화면 
 * 
 * 내 시간표 관리 (선생님) >결보강 신청
 * - 내 시간표에서 “빼는 수업 (내 수업)” 선택 시 교체 가능한 교사 목록 노출
 * - 선택한 시간에 공강인 교사 목록 
 */
const LessonAdjustment = ({ className, lessonDate, teacherId, timetableId }: TimetableMobileProps) => {

  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const courses = useCourseContext();
  const teachers = useTeacherContext();
  const teacherCourses = useTeacherCourseContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();

  const initDailyTimetableContextData = () => {
    DailyTimetable.context.timetableConfig = gradeContext.timetableConfig;
    DailyTimetable.context.classes = classContext.classes;
    DailyTimetable.context.courses = courseContext.courses;
    DailyTimetable.context.teachers = teacherContext.teachers;
    DailyTimetable.context.teacherCourses = teacherCourseContext.teacherCourses;
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
  };

  // #region State 정의

  const [step, setStep] = useState<AdjustmentStep>('selection');
  const [selectedDailyLesson, setSelectedDailyLesson] = useState<Core.DailyLesson | null>(null);
  const [reason, setReason] = useState('');
  const [isTeacherSheetOpen, setIsTeacherSheetOpen] = useState(false);
  const [candidateTeacherIds, setCandidateTeacherIds] = useState<string[]>([]);
  const [candidateTeacherOptions, setCandidateTeacherOptions] = useState<CandidateTeacherOption[]>([]);
  const [selectedCandidateTeacherId, setSelectedCandidateTeacherId] = useState('');
  const [activeConfirmTeacherId, setActiveConfirmTeacherId] = useState('');
  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);
  const [weekRangeIdx, setWeekRangeIdx] = useState(-1);
  const [searchWeekRange, setSearchWeekRange] = useState<WeekRange | null>(null);
  const [weeks, setWeeks] = useState<WeekRange[]>([]);

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
  const isPrevWeekDisabled = useMemo(() => weekRangeIdx <= 0, [weekRangeIdx]);
  const isNextWeekDisabled = useMemo(() => weekRangeIdx === -1 || weekRangeIdx >= weeks.length - 1, [weekRangeIdx, weeks.length]);
  const selectedLessonWeekRange = useMemo(() => {
    if (!selectedDailyLesson?.lessonDate) {
      return null;
    }
    const [startDate, endDate] = TimeUtils.getWeekRange(selectedDailyLesson.lessonDate);
    return { startDate, endDate };
  }, [selectedDailyLesson]);

  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Core.Teacher>),
    [teachers]
  );

  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Core.Class>),
    [classes]
  );

  const adjustmentTargetDailyLesson = useMemo(() => {
    if (!selectedDailyLesson || !selectedCandidateTeacherId) {
      return null;
    }

    return {
      ...selectedDailyLesson,
      lessonTeacherIds: [selectedCandidateTeacherId], // 교체 대상 수업은 선택된 교사로 설정
      changeType: Core.TimetableDailyLessonChangeType.Adjustment,
    } as Core.DailyLesson;
  }, [selectedCandidateTeacherId, selectedDailyLesson]);

  const confirmTeacherTabs = useMemo(() => {
    const ownerTeacherLabel = teacherMap[teacherId || '']?.teacherName || '교사';
    const selectedTargetTeacherLabel = teacherMap[selectedCandidateTeacherId]?.teacherName || '교사';

    return [
      { teacherId: teacherId || '', label: ownerTeacherLabel },
      { teacherId: selectedCandidateTeacherId, label: selectedTargetTeacherLabel },
    ].filter((tab) => !!tab.teacherId);
  }, [selectedCandidateTeacherId, teacherId, teacherMap]);

  const { data: dailyLessons } = useDailyLessonsBetweenDates(
    timetableId || '',
    searchWeekRange?.startDate || 0,
    searchWeekRange?.endDate || 0
  );

  const isReadyToDisplay = useMemo(() => {
    return timetableConfig && timetableConfig.classDays.length > 0 && weekRange;
  }, [timetableConfig, weekRange]);

  // #endregion

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

  const buildCandidateTeacherOptions = (teachers: Core.Teacher[], dailyLessons: Core.DailyLesson[], selectedDailyLesson: Core.DailyLesson) => {
    if (!dailyLessons?.length || !selectedDailyLesson.lessonDate || !selectedDailyLesson.period
      || !teachers?.length) {
      return [];
    }

    const occupiedTeacherIds = new Set<string>();
    dailyLessons.filter((lesson) => {
      return lesson.lessonDate === selectedDailyLesson.lessonDate
        && lesson.period === selectedDailyLesson.period
        && lesson.lessonType === Core.TimetableDailyLessonType.Lesson;
    }).flatMap((lesson) => (lesson.lessonTeacherIds || []).forEach((lessonTeacherId) => {
      if (lessonTeacherId) {
        occupiedTeacherIds.add(lessonTeacherId);
      }
    }));

    return teachers
      .filter((teacher) => !!teacher.teacherId && teacher.teacherId !== teacherId)
      .filter((teacher) => !occupiedTeacherIds.has(teacher.teacherId))
      .map((teacher) => ({
        teacherId: teacher.teacherId,
        label: teacher.teacherName || '교사',
      }));
  };

  const moveToSelectionStep = useCallback(() => {
    setStep('selection');
    setSelectedDailyLesson(null);
    setCandidateTeacherOptions([]);
    setCandidateTeacherIds([]);
    setSelectedCandidateTeacherId('');
    setActiveConfirmTeacherId('');
    setReason('');
  }, []);

  const moveToConfirmStep = (dailyLesson: Core.DailyLesson, nextCandidateTeacherIds: string[], nextTeacherId: string) => {
    setSelectedDailyLesson(dailyLesson);
    setCandidateTeacherIds(nextCandidateTeacherIds);
    setSelectedCandidateTeacherId(nextTeacherId);
    setActiveConfirmTeacherId(teacherId || '');
    setIsTeacherSheetOpen(false);
    setStep('confirm');
  };

  const handleClickLessonCell = (_lessonDate: number, _period: number, dailyLesson: Core.DailyLesson | null = null) => {
    if (!dailyLessons || !dailyLesson) {
      showToast('변경할 수업을 선택하세요.', toastOptions);
      return;
    }

    const nextCandidateTeacherOptions = buildCandidateTeacherOptions(teachers, dailyLessons, dailyLesson);
    const nextCandidateTeacherIds = nextCandidateTeacherOptions.map((option) => option.teacherId);

    if (nextCandidateTeacherOptions.length === 0) {
      showToast('교체 가능한 교사가 없습니다.', toastOptions);
      return;
    }

    setSelectedDailyLesson(dailyLesson);
    setCandidateTeacherOptions(nextCandidateTeacherOptions);
    setCandidateTeacherIds(nextCandidateTeacherIds);
    setSelectedCandidateTeacherId(nextCandidateTeacherIds[0] || '');
    setIsTeacherSheetOpen(true);
  };

  const handleClickNextWeek = () => {
    if (isNextWeekDisabled) {
      return;
    }

    setWeekRangeIdx(prev => prev + 1);
  };

  const handleClickPrevWeek = () => {
    if (isPrevWeekDisabled) {
      return;
    }

    setWeekRangeIdx(prev => prev - 1);
  };

  const handleClickBack = () => {
    if (isTeacherSheetOpen) {
      setIsTeacherSheetOpen(false);
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
      if (isTeacherSheetOpen) {
        setIsTeacherSheetOpen(false);
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
  }, [isTeacherSheetOpen, step, moveToSelectionStep]);

  const handleClickConfirm = async () => {
    if (!timetableId || !selectedDailyLesson || !selectedCandidateTeacherId) { return; }

    try {
      await requestAdjustmentForTeacher(timetableId, selectedDailyLesson, selectedCandidateTeacherId, reason);
      // console.log('수업 변경 신청 성공', result);
      if (!dispatchLessonChangeRequestSuccess(Core.TimetableDailyLessonChangeType.Adjustment)) {
        // fallback to dispatch event
        showToast('수업 변경 신청이 완료되었습니다.', toastOptions);
        moveToSelectionStep();
      }
    } catch (error: any) {
      console.error(error);
      const status = error.response?.status
      let errorMessage = '수업 결보강 신청 중 오류가 발생했습니다. 다시 시도해주세요.';
      if (status === 428) {
        errorMessage = '이미 교사가 다른 수업이 있거나 동시 수업 등이 있습니다.';
      } else {
        errorMessage = status ? errorMessage + '(' + status + ')' : errorMessage;
      }
      if(!dispatchLessonChangeRequestFailed(
        Core.TimetableDailyLessonChangeType.Adjustment, errorMessage
      )) {
        alert(errorMessage);
      }
      return;
    }
  };

  const handleClickTeacherTab = (nextTeacherId: string) => {
    if (!nextTeacherId) {
      return;
    }

    setActiveConfirmTeacherId(nextTeacherId);
  };

  const handleClickCandidateTeacher = (teacherOption: CandidateTeacherOption) => {
    if (!selectedDailyLesson) {
      return;
    }

    moveToConfirmStep(selectedDailyLesson, candidateTeacherIds, teacherOption.teacherId);
  };

  useEffect(() => {
    if (weekRangeIdx === -1 || !weeks[weekRangeIdx]) {
      return;
    }

    setWeekRange(weeks[weekRangeIdx]);
  }, [weekRangeIdx, weeks]);

  useEffect(() => {
    const threeWeeks = TimeUtils.get3WeekRange();

    setWeeks(threeWeeks.map(([startDate, endDate]) => ({ startDate, endDate })));

    if (threeWeeks.length === 0) {
      return;
    }

    const searchStartDate = threeWeeks[0][0];
    const searchEndDate = threeWeeks[threeWeeks.length - 1][1];
    setSearchWeekRange({ startDate: searchStartDate, endDate: searchEndDate });

    const targetWeekRangeIdx = lessonDate
      ? threeWeeks.findIndex(([startDate, endDate]) => lessonDate >= startDate && lessonDate <= endDate)
      : 0;

    setWeekRangeIdx(targetWeekRangeIdx);

  }, [lessonDate]);

  useEffect(() => {
    if (!timetableId) {
      return;
    }

    reloadContextAllWithTimetableId(timetableId);
  }, [timetableId]);

  useEffect(() => {
    initDailyTimetableContextData();
  }, [classes, courses, teachers, teacherCourses]);

  return (
    <div className={clsx('flex h-screen flex-col bg-bg-base select-none', className)}>
      <MobileHeader
        title={step === 'selection' ? '결, 보강' : '변경 시간표 확인'}
        onBack={handleClickBack}
        className="border-b-0"
        rightArea={step === 'confirm' ? (
          <Button
            variant="link"
            size="sm"
            className="pr-5 !text-b1 !leading-b1 mr-2 font-semibold"
            style={{ color: 'var(--text-primary-base)' }}
            onClick={handleClickConfirm}
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
              disabled={isPrevWeekDisabled}
            >
              <ChevronLeft size={20} className={clsx(isPrevWeekDisabled ? 'stroke-text-default' : 'stroke-text-primary-base')} strokeWidth={2} />
            </HiButton>
            <span className="text-leading-b1 font-bold text-text-default">{weekStartDate} ~ {weekEndDate}</span>
            <HiButton
              aria-label="다음 주"
              variant="link"
              className={clsx('p-1')}
              onClick={handleClickNextWeek}
              disabled={isNextWeekDisabled}
            >
              <ChevronRight size={20} className={clsx(isNextWeekDisabled ? 'stroke-text-default' : 'stroke-text-primary-base')} strokeWidth={2} />
            </HiButton>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 -left-4 z-[5] w-4 bg-[var(--bg-base)]" />
            {isReadyToDisplay ? (
              <LessonTable
                className="-mx-4"
                onCellClick={handleClickLessonCell}
                selectedDailyLesson={selectedDailyLesson}
                selectedTeacherId={teacherId}
                dailyLessons={dailyLessons}
                weekRange={weekRange}
                selectableMode="enabled"
                scrollContentInsetX={16}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <Loading variant="spinner" className="static [transform:none]" />
              </div>
            )}
          </div>
        </main>
      ) : (
        <>
          {/* 교사 변경 탭 */}
          {confirmTeacherTabs.length > 0 && (
            <div className="px-4 pt-6 pb-4 shrink-0">
              <HiTab
                variant="pills"
                size="sm"
                labels={confirmTeacherTabs.map((t) => t.label)}
                selectedTabIndex={confirmTeacherTabs.findIndex((t) => t.teacherId === activeConfirmTeacherId)}
                isControlOuter
                onChange={(index: number) => handleClickTeacherTab(confirmTeacherTabs[index].teacherId)}
              />
            </div>
          )}
          <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <LessonTable
              className="-mx-4"
              selectedTeacherId={activeConfirmTeacherId || selectedCandidateTeacherId || teacherId}
              dailyLessons={dailyLessons}
              weekRange={selectedLessonWeekRange}
              sourceDailyLesson={activeConfirmTeacherId === teacherId ? selectedDailyLesson : null}
              targetDailyLesson={activeConfirmTeacherId === selectedCandidateTeacherId ? adjustmentTargetDailyLesson : null}
              selectableMode='none'
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
        isOpen={isTeacherSheetOpen}
        onClose={() => {
          setSelectedDailyLesson(null);
          setIsTeacherSheetOpen(false)
        }}
        title="교체 가능 교사"
        className="rounded-t-[16px]"
      >
        <div className="flex flex-col gap-2 px-5">
          {candidateTeacherOptions.map((teacherOption) => (
            <HiButton
              variant="secondary" block={true}
              key={teacherOption.teacherId}
              className="min-h-12 !h-auto rounded px-4 !py-[15px] justify-start text-leading-b3 font-normal text-text-primary-base"
              onClick={() => handleClickCandidateTeacher(teacherOption)}
            >
              {teacherOption.label}
            </HiButton>
          ))}
        </div>
      </HiBottomSheet>
    </div>
  );
};

export default LessonAdjustment;
