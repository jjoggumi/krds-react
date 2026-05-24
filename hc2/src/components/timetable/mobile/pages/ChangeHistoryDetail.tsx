import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Button, MobileHeader, Loading, HiTab } from '@/components/uiux/';
import { Textarea } from '@/components/uiux/textarea';
import { showToast } from '@/unimplementeds/toast.js';
import { LessonTable } from '../components/changeHistory/LessonTable';
import { Core, TimetableMobileProps, WeekRange } from '../types';
import { TimeUtils, TimetableDisplayUtils, dispatchLessonChangeHistoryUpdated, goBackWithNative } from '../utils';
import {
  TimetableClassContext,
  TimetableCourseBaseContext,
  TimetableCourseContext,
  TimetableGradeContext,
  TimetableSpecialtyRoomContext,
  TimetableTeacherContext,
  TeacherCourseBaseContext,
  TeacherCourseContext,
  useTeacherContext,
  useGradeContext,
  useClassContext,
} from '../context';
import { useParams, useSearchParams } from 'react-router-dom';
import { getLessonChangeHistoryDetail, updateReasonPendingLessonChange } from '../api/changeHistory';
import { useDailyLessonsBetweenDates } from '../queries/useDailyLessons';
import moment from 'moment';

const toastOptions = {
  duration: 3000,
  position: 'bottom-center' as const,
  className: ['type01'],
  containerClass: ['post-export-bottom-center'],
  containerStyle: {
    bottom: 'calc(env(safe-area-inset-bottom) + 32px)',
  },
};

type TeacherTab = { tabId: string; label: string; changeSeq: number, isTeacher: boolean };

/**
 * 변경 내역 상세 
 * 
 * - path: /timetable/change-history/:lessonChangeId
 * - query items:
 *    - timetableId: 시간표 아이디 (필수)
 *    - lessonChangeType: 변경 수업 유형(선택)  
 *    - status: 변경 수업 상태(선택)
 *  
 * @see TimetableDailyLessonChangeType: 변경 수업 유형
 * @returns 
 */

const ChangeHistoryDetail = ({ className, timetableId }: TimetableMobileProps) => {

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();

  const reloadContextAllWithTimetableId = async (id: string) => {
    await gradeContext.reloadWithTimetableId(id);
    await courseContext.reloadWithTimetableId(id);
    await courseBaseContext.reloadWithTimetableId(id);
    await teacherCourseContext.reloadWithTimetableId(id);
    await teacherCourseBaseContext.reloadWithTimetableId(id);
    await teacherContext.reloadWithTimetableId(id);
    await classContext.reloadWithTimetableId(id);
    await specialtyRoomContext.reloadWithTimetableId(id);

    setIsTimetableContextLoaded(true);
    console.debug('reloadContextAllWithTimetableId 완료 :: ');
  };

  const [searchParams] = useSearchParams();
  const { lessonChangeId } = useParams<{ lessonChangeId: string }>();
  const [lessonChangeType, setLessonChangeType] = useState<string | null>(searchParams.get("lessonChangeType"));
  const [status, setStatus] = useState<string | null>(searchParams.get("status"));
  const [statusUpdatedUserName, setStatusUpdatedUserName] = useState<string | null>(null);
  const [statusUpdatedTimestamp, setStatusUpdatedTimestamp] = useState<number | null>(null);
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const timetableConfig = useGradeContext();
  const [lessonChangeDetails, setLessonChangeDetails] = useState<Core.TimetableLessonChangeDetail[]>([]);
  /** 변경내역 조회에 포함된 일일 수업 */
  const [dailyLessons, setDailyLessons] = useState<Core.DailyLesson[]>([]);
  const [teacherTabs, setTeacherTabs] = useState<TeacherTab[]>([]);
  const [selectedTeacherTab, setSelectedTeacherTab] = useState<TeacherTab | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [sourceDailyLesson, setSourceDailyLesson] = useState<Core.DailyLesson | null>(null);
  const [targetDailyLesson, setTargetDailyLesson] = useState<Core.DailyLesson | null>(null);
  const [reason, setReason] = useState('');
  const [isTimetableContextLoaded, setIsTimetableContextLoaded] = useState<boolean>(false);

  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Core.Teacher>),
    [teachers]
  );

  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Core.Class>),
    [classes]
  );

  const isPending = useMemo(() => status === Core.TimetableLessonChangeStatus.Pending, [status]);
  const lessonChangeTypeLabel = useMemo(() => {
    switch (lessonChangeType) {
      case Core.TimetableDailyLessonChangeType.Exchange:
        return '수업 교체';
      case Core.TimetableDailyLessonChangeType.Adjustment:
        return '결,보강';
      case Core.TimetableDailyLessonChangeType.Replacement:
        return '수업 변경';
      case Core.TimetableDailyLessonChangeType.Addition:
        return '수업 추가';
      default:
        return '';
    }
  }, [lessonChangeType]);

  const statusUpdatedText = useMemo(() => {
    //if (!statusUpdatedTimestamp || !statusUpdatedUserId) { return ''; }
    let composition = '';
    if (statusUpdatedTimestamp) {
      moment.locale('ko'); // 한국어로 설정
      const day = moment(statusUpdatedTimestamp);
      const dateText = day?.format('YY.M.D') || ''; // 00.0.0
      composition += dateText;
    }

    if (statusUpdatedUserName) {
         composition += ` ${statusUpdatedUserName}`;
    }

    if (composition.length > 0) {
      return ` (${composition.trim()})`;
    }

    return '';
  }, [statusUpdatedTimestamp, statusUpdatedUserName]);

  const statusLabel = useMemo(() => {
    //     승인 대기 : 내가 요청, 수업계 승인 전
    // 관리자등록 : 관리자가 직접 등록한 건
    // 취소 : 내가 취소
    // 반려 : 수업계가 반려
    // 승인완료 : 수업계가 승인하여 변경 내역이 전체 시간표에 적용됨 (요청 취소 안되고, 변경 안됨 → 사유 변경도 안됨)
    switch (status) {
      case Core.TimetableLessonChangeStatus.Pending:
        return '승인 대기';
      case Core.TimetableLessonChangeStatus.Completed:
        return '승인 완료';
      case Core.TimetableLessonChangeStatus.Rejected:
        return '반려';
      case Core.TimetableLessonChangeStatus.Ignored:
        return '처리불가';
      case Core.TimetableLessonChangeStatus.Canceled:
        return '취소';
      case Core.TimetableLessonChangeStatus.Recovered:
        return '관리자 취소';
      default:
        return '';
    }
  }, [status]);

  /** 선택된 대상의 변경 내용에 해당하는 주간 범위 */
  const computeWeekRange: (lessonChangeDetails: Core.TimetableLessonChangeDetail[], selectedTeacherTab?: TeacherTab | null) => WeekRange | null = (lessonChangeDetails, selectedTeacherTab) => {
    if (lessonChangeDetails.length === 0 || !selectedTeacherTab) {
      return null;
    }
    const detail = lessonChangeDetails.find(detail =>{
      const isTeacherTab = selectedTeacherTab.isTeacher;
      if (isTeacherTab) {
        return detail.sourceTeacherId === selectedTeacherTab.tabId;
      } else {
        return detail.sourceClassId === selectedTeacherTab.tabId;
      }
    });
    
    if (!detail) {
      return null;
    }
    if (detail.lessonChangeDetailType === Core.TimetableLessonChangeDetailType.Move) {
      const beginDate = Math.min(detail.sourceLessonDate || 0, detail.targetLessonDate || 0);
      if (beginDate === 0) { return null; }
      const days = TimeUtils.generateLessonDays(beginDate, 3);
      if (days.length === 0) { return null; }

      const startDate = days[0].lessonDate;
      const endDate = days[days.length - 1].lessonDate;

      console.log("3 주간 범위 생성 :: ", { startDate, endDate });
      return { startDate, endDate };
    } else {
      const lessonDate = detail.sourceLessonDate || detail.targetLessonDate;
      if (!lessonDate) {
        return null;
      }
      const weekRange = TimeUtils.getWeekRange(lessonDate);
      return { startDate: weekRange[0], endDate: weekRange[1] };
    }

  };

  const selectedWeekRange = useMemo(() => computeWeekRange(lessonChangeDetails, selectedTeacherTab), [lessonChangeDetails, selectedTeacherTab]);

  const { data: allDailyLessons } = useDailyLessonsBetweenDates(
    timetableId || '',
    selectedWeekRange?.startDate || 0,
    selectedWeekRange?.endDate || 0
  );

  const sourceTargetMapByTeacher = useMemo(() => {
    if (!lessonChangeType || !lessonChangeDetails) return {};

    return lessonChangeDetails.reduce((acc, detail) => {
      if (!detail) return acc;
      const lessonChangeDetailType = detail.lessonChangeDetailType;
      if (lessonChangeDetailType === Core.TimetableLessonChangeDetailType.Move) {
        if (lessonChangeType === Core.TimetableDailyLessonChangeType.Exchange) {
          const sourceTeacherId = detail.sourceTeacherId;
          if (!sourceTeacherId) return acc;
          const sourceLessonDate = detail.sourceLessonDate;
          const sourceLesson = sourceLessonDate ? ({
            lessonDate: sourceLessonDate,
            dayOfWeek: TimeUtils.getDayOfWeek(sourceLessonDate),
            period: detail.sourcePeriod,
            classId: detail.sourceClassId,
            courseId: detail.sourceCourseId,
            dailyLessonId: detail.sourceDailyLessonId,
            concurrentCourseId: undefined,
            consecutiveGroupId: undefined,
            specialtyRoomId: detail.sourceSpecialtyRoomId || undefined,
            changeType: Core.TimetableDailyLessonChangeType.None
          } as Core.DailyLesson) : null;

          const targetLessonDate = detail.targetLessonDate;
          const targetLesson = targetLessonDate ? ({
            lessonDate: targetLessonDate,
            dayOfWeek: TimeUtils.getDayOfWeek(targetLessonDate),
            period: detail.targetPeriod,
            classId: detail.targetClassId,
            courseId: detail.targetCourseId,
            dailyLessonId: detail.targetDailyLessonId,
            concurrentCourseId: undefined,
            consecutiveGroupId: undefined,
            specialtyRoomId: detail?.sourceSpecialtyRoomId || undefined,
            changeType: Core.TimetableDailyLessonChangeType.None
          } as Core.DailyLesson) : null;

          acc[sourceTeacherId] = { source: sourceLesson, target: targetLesson };
        } else {
          const sourceTeacherId = detail.sourceTeacherId;
          const targetLessonDate = detail.targetLessonDate;
          if (!sourceTeacherId || !targetLessonDate) return acc;

          const targetLesson = {
            lessonDate: targetLessonDate,
            dayOfWeek: TimeUtils.getDayOfWeek(targetLessonDate),
            period: detail.targetPeriod,
            classId: detail.targetClassId,
            courseId: detail.targetCourseId,
            dailyLessonId: detail.targetDailyLessonId,
            concurrentCourseId: undefined,
            consecutiveGroupId: undefined,
            specialtyRoomId: detail.sourceSpecialtyRoomId,
            changeType: Core.TimetableDailyLessonChangeType.None,
          } as Core.DailyLesson;

          acc[sourceTeacherId] = { source: null, target: targetLesson };
        }

      } else if (lessonChangeDetailType === Core.TimetableLessonChangeDetailType.Add) {
        const sourceLessonDate = detail.sourceLessonDate;
        const sourceTeacherId = detail.sourceTeacherId;
        if (!sourceTeacherId || !sourceLessonDate) return acc;
        const targetLesson = {
          lessonDate: detail.sourceLessonDate,
          dayOfWeek: TimeUtils.getDayOfWeek(sourceLessonDate),
          period: detail.sourcePeriod,
          classId: detail.sourceClassId,
          courseId: detail.sourceCourseId,
          dailyLessonId: detail.sourceDailyLessonId,
          concurrentCourseId: undefined,
          consecutiveGroupId: undefined,
          specialtyRoomId: detail.sourceSpecialtyRoomId,
          changeType: Core.TimetableDailyLessonChangeType.None,
          lessonTeacherIds: [sourceTeacherId],
        } as Core.DailyLesson;

        acc[sourceTeacherId] = { source: null, target: targetLesson };

        if (lessonChangeType === Core.TimetableDailyLessonChangeType.Addition) {
          // 추가인 경우, 수업이 추가된 교사 탭 외에 학급 시간표도 보여주도록 추가
          const classId = detail.sourceClassId;
          if (classId) {
            console.debug("수업이 추가된 교사 탭 외에 학급 시간표도 보여주도록 추가");
            acc[classId] = { source: null, target: targetLesson };
          }
        }

      } else {
        const sourceLessonDate = detail.sourceLessonDate;
        const sourceTeacherId = detail.sourceTeacherId;
        if (!sourceTeacherId || !sourceLessonDate) return acc;
        const sourceLesson = {
          lessonDate: sourceLessonDate,
          dayOfWeek: TimeUtils.getDayOfWeek(sourceLessonDate),
          period: detail.sourcePeriod,
          classId: detail.sourceClassId,
          courseId: detail.sourceCourseId,
          dailyLessonId: detail.sourceDailyLessonId,
          concurrentCourseId: undefined,
          consecutiveGroupId: undefined,
          specialtyRoomId: detail?.sourceSpecialtyRoomId,
          changeType: Core.TimetableDailyLessonChangeType.None
        } as Core.DailyLesson;

        acc[sourceTeacherId] = { source: sourceLesson, target: null };
      }

      return acc;
    }, {} as Record<string, { source: Core.DailyLesson | null; target: Core.DailyLesson | null }>);
  }, [lessonChangeType, lessonChangeDetails]);

  const isReadyToDisplay = useMemo(() => {
    return timetableConfig && timetableConfig.classDays.length > 0 && (sourceDailyLesson || targetDailyLesson);
  }, [timetableConfig, sourceDailyLesson, targetDailyLesson]);

  useEffect(() => {
    if (!lessonChangeDetails || lessonChangeDetails.length === 0 || !selectedTeacherTab) {
      return;
    }

    // console.log("teacher id :: ", selectedTeacherTab.teacherId);
    const sourceTarget = sourceTargetMapByTeacher[selectedTeacherTab.tabId];

    console.log("source :: ", sourceTarget?.source?.dayOfWeek, sourceTarget?.source?.lessonDate, sourceTarget?.source?.period + "교시");
    console.log("target :: ", sourceTarget?.target?.dayOfWeek, sourceTarget?.target?.lessonDate, sourceTarget?.target?.period + "교시");

    setSourceDailyLesson(sourceTarget?.source || null);
    setTargetDailyLesson(sourceTarget?.target || null);

  }, [lessonChangeDetails, sourceTargetMapByTeacher, selectedTeacherTab]);

  const generateDailyLessonsForWeekRange = (weekRange: WeekRange, allDailyLessons: Core.DailyLesson[]) => {
    
    const days = TimeUtils.generateLessonDaysWithRange(weekRange.startDate, weekRange.endDate);
    const result: Core.DailyLesson[] = [];
    days.forEach(day => {
      const lessonsForADay = allDailyLessons.filter((lesson) => {
        return lesson.lessonDate === day.lessonDate;
        // return TimeUtils.getDayOfWeek(lesson.lessonDate) === day.dayOfWeek;
      }).map(lesson => {
        return {
          ...lesson,
          // lessonDate: day.lessonDate, // 주간 범위 내의 날짜로 일자 재설정?
        };
      });
      result.push(...lessonsForADay);
    });
    console.debug('주간 범위 내의 날짜로 재설정된 수업 수 :: ', result.length);
    // console.log(result.filter(l => l.lessonDate === 20260421 && l.period === 7 && l.className === '1-2'));
    return result;
  }

  const dailyLessonsInWeekRange = useMemo(() => {
    if (!selectedWeekRange || !allDailyLessons || allDailyLessons.length === 0) {
      return [];
    }
    return generateDailyLessonsForWeekRange(selectedWeekRange, allDailyLessons);
  }, [selectedWeekRange, allDailyLessons]);

  const handleClickBack = () => {
    if (!goBackWithNative()) {
      window.history.back();
    }
  };

  // MARK: handleClickConfirm
  const handleClickConfirm = async () => {
    if (!isPending || !timetableId || !lessonChangeId) {
      return;
    }
    try {
      await updateReasonPendingLessonChange(timetableId, lessonChangeId, reason);
    } catch (error) {
      console.error(error);
      showToast('요청을 처리하는 데 실패했습니다.', toastOptions);
      return;
    }
    
    if (!dispatchLessonChangeHistoryUpdated(timetableId, lessonChangeId)) {
      window.history.back();
    }
  }

  const handleSelectTeacherTab = (tab: TeacherTab) => {
    if (!tab || tab.tabId === selectedTeacherTab?.tabId) {
      return;
    }
    console.debug('교사 탭 변경 :: ', tab);
    setSelectedTeacherTab(tab);
  };

  const buildTeacherTabs = (changeDetails: Core.TimetableLessonChangeDetail[], lessonDailyChangeType: Core.TimetableDailyLessonChangeType) => {
    const teacherIdSet = new Set<string>();
    const teacherTabs = changeDetails.reduce((tabs, detail) => {
      if (detail.sourceTeacherId && !teacherIdSet.has(detail.sourceTeacherId)) {
        teacherIdSet.add(detail.sourceTeacherId);
        tabs.push({ tabId: detail.sourceTeacherId, label: teacherMap[detail.sourceTeacherId]?.teacherName || '교사', changeSeq: detail.changeSeq, isTeacher: true });
      }
      if (detail.targetTeacherId && !teacherIdSet.has(detail.targetTeacherId)) {
        teacherIdSet.add(detail.targetTeacherId);
        tabs.push({ tabId: detail.targetTeacherId, label: teacherMap[detail.targetTeacherId]?.teacherName || '교사', changeSeq: detail.changeSeq, isTeacher: true });
      }
      return tabs;
    }, [] as TeacherTab[]);

    if (changeDetails.length > 0 
      && lessonDailyChangeType === Core.TimetableDailyLessonChangeType.Addition) { // 추가인 경우, 수업이 추가된 교사 탭 외에 학급 시간표도 보여주도록 추가
        // 변경 수업이 추가인 경우, 학급 시간표도 표기 
        const detail = changeDetails[0];
        const classId = detail.sourceClassId;
        if (classId) {
          const classLabel = classMap[classId] ? TimetableDisplayUtils.formatFullClassName(classMap[classId]) : classId;
          teacherTabs.push({ tabId: classId, label: classLabel, changeSeq: 1, isTeacher: false });
        }
    }

    setTeacherTabs(teacherTabs);

    return teacherTabs;
  }

  // region: 변경사항 가져오기
  const fetchLessonChangeDetails = async (timetableId: string, lessonChangeId: string): Promise<{ details: Core.TimetableLessonChangeDetail[], lessonDailyChangeType: Core.TimetableDailyLessonChangeType }> => {
    try {
      const res = await getLessonChangeHistoryDetail(timetableId, lessonChangeId);
      setLessonChangeDetails(res.details);
      setDailyLessons(res.dailyLessons);
      setLessonChangeType(res.lessonChangeType);
      setStatus(res.status);
      if (res.status === Core.TimetableLessonChangeStatus.Completed) { // 승인 데이터를 먼저 고려
        setStatusUpdatedUserName(res.approvedUserName || res.statusUpdatedName || null);
        setStatusUpdatedTimestamp(res.approvedTimestamp || res.statusUpdatedTimestamp || null); 
      } else if (res.status === Core.TimetableLessonChangeStatus.Ignored) {
        // 처리 불가는 변경한 주체가 명확하지 않으므로 관리자 이름은 노출하지 않아야 함
        setStatusUpdatedUserName(null);
        setStatusUpdatedTimestamp(res.approvedTimestamp || res.statusUpdatedTimestamp || null); 
      } else {
        setStatusUpdatedUserName(res.statusUpdatedName || res.approvedUserName || null);
        setStatusUpdatedTimestamp(res.statusUpdatedTimestamp || res.approvedTimestamp || null);
      }
      setReason(res.reason || '');
      console.debug(res.status, res.lessonChangeType, res.reason);
      return { details: res.details, lessonDailyChangeType: res.lessonChangeType };
    } catch (error) {
      console.error('Failed to fetch lesson change details', error);
      showToast('변경 내역 상세 정보를 불러오는 데 실패했습니다.', toastOptions);
    }

    return { details: [], lessonDailyChangeType: Core.TimetableDailyLessonChangeType.None };
  }

  // endregion

  useEffect(() => {
    if (!isTimetableContextLoaded || !timetableId || !lessonChangeId) {
      console.debug('timetable context not loaded yet');
      return;
    }
    console.debug('timetableId and lessonChangeId 시작 :: ', { timetableId, lessonChangeId });
    if (!timetableId && !lessonChangeId) {
      return;
    }
    if (teachers.length === 0) {
      console.warn('교사 없음');
      return;
    }

    fetchLessonChangeDetails(timetableId, lessonChangeId).then(({ details, lessonDailyChangeType }) => {
      // 교사 탭 구성 
      const tabs = buildTeacherTabs(details, lessonDailyChangeType);
      // 기본 탭 선택 
      if (tabs.length > 0) {
        console.debug('기본 선택된 교사 탭 :: ', tabs[0]);
        setSelectedTeacherTab(tabs[0]);
      }
    });
  }, [timetableId, lessonChangeId, teachers, isTimetableContextLoaded, ]);

  useEffect(() => {
    console.log("수업 변경 타입" + searchParams.get("lessonChangeType"));
    setLessonChangeType(searchParams.get("lessonChangeType"));
  }, [searchParams]);

  useEffect(() => {
    if (!timetableId) return;
    reloadContextAllWithTimetableId(timetableId);
  }, [timetableId]);

  useEffect(() => {
    if (!timetableConfig) {
      return;
    }
    console.log('상세', timetableConfig);
  }, [timetableConfig]);

  useEffect(() => {
    if (!teacherTabs || teacherTabs.length === 0) return;
    const idx = selectedTeacherTab ? teacherTabs.findIndex(t => t.tabId === selectedTeacherTab.tabId) : 0;
    setActiveTabIndex(idx === -1 ? 0 : idx);
  }, [teacherTabs, selectedTeacherTab]);

  return (
    <div className={clsx('flex h-screen flex-col bg-bg-base select-none', className)}>
      <MobileHeader
        title={lessonChangeTypeLabel ? `신청 내역 (${lessonChangeTypeLabel})` : ''}
        onBack={handleClickBack}
        className="border-b-0"
        rightArea={
          isPending && (<Button
            variant="link"
            size="sm"
            className="pr-5 !text-b1 !leading-b1 mr-2 font-semibold"
            style={{ color: 'var(--text-primary-base)' }}
            onClick={handleClickConfirm}
          >
            저장
          </Button>)
        }
      />

        {teacherTabs.length > 0 && (     
          <div className="px-4 pt-6 pb-4 shrink-0">     
            <HiTab
              labels={teacherTabs.map(t => t.label)}
              variant="pills"
              size="sm"
              selectedTabIndex={activeTabIndex}
              isControlOuter
              onChange={(index: number) => {
                setActiveTabIndex(index);
                const tab = teacherTabs[index];
                if (tab) handleSelectTeacherTab(tab);
              }}
            />
          </div>
        )}
      <main
        className="flex-1 overflow-y-auto overscroll-contain px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 -left-4 z-[5] w-4 bg-[var(--bg-base)]" />
          {isReadyToDisplay
            ? (<LessonTable
              isTeacherTable={selectedTeacherTab?.isTeacher || false}
              timetableConfig={timetableConfig}
              className="-mx-4"
              selectedTeacherId={selectedTeacherTab?.tabId}
              dailyLessons={dailyLessonsInWeekRange}
              weekRange={selectedWeekRange}
              sourceDailyLesson={sourceDailyLesson}
              targetDailyLesson={targetDailyLesson}
              isHorizontalScrollable
              scrollContentInsetX={16}
            />) : (
              <div className="flex h-[300px] items-center justify-center">
                <Loading variant="spinner" className="static [transform:none]" />
              </div>
            )}
        </div>
        {isReadyToDisplay && (
          <div className="mt-6">
            <p className="mb-3 text-leading-b2 font-semibold text-text-default">변경 사유</p>
            <Textarea
              value={reason}
              onChange={(event) => {
                if (!isPending) return;
                const newValue = event.target.value;
                const sanitized = newValue.replace(/\n/g, ''); // 줄바꿈 제거
                setReason(sanitized);
              }}
              placeholder="선택 사항 (최대 50자)"
              rows={2}
              readOnly={!isPending}
              className="rounded-md"
              isAutoGrow={true}
              canNewLine={false}
            />
          </div>
        )}

        {isReadyToDisplay && (
          <div className="mt-6 flex items-start gap-2">
            <span className="w-10 text-leading-b2 font-semibold text-default">상태</span>
            <span className="flex-1 text-leading-b3 text-text-default">
              {statusLabel}{statusUpdatedText}
            </span>
          </div>
        )}

      </main>
    </div>
  );
};

export default ChangeHistoryDetail;
