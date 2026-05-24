import { useEffect, useMemo, useState } from "react";
import {
  TimetableTeacherContext,
  TimetableClassContext,
  useClassContext,
  useCourseBaseContext,
  useCourseContext,
  useGradeContext,
  useSpecialtyRoomContext,
  useTeacherContext,
  useTeacherCourseBaseContext,
  TimetableCourseContext,
  TimetableSpecialtyRoomContext,
  TeacherCourseBaseContext,
  TimetableCourseBaseContext } from "../../contexts";
import {
  Class,
  Course,
  CourseBase,
  DailyLesson,
  Lesson,
  SpecialtyRoom,
  Teacher,
  TeacherCourseBase,
  TimetableDailyLessonChangeType,
  TimetableLessonChange,
  TimetableLessonChangeDetail, 
  TimetableLessonChangeDetailType,
  TimetableLessonChangeStatus} from "../../core/types";
import styles from "./lessonChangeRequestModal.module.scss";
import { ActivateWeekday, LessonDay } from "../../common/types";
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import DailyLessonButton, { DailyLessonButtonOption } from "./dailyLessonButton";
import { TimeUtils } from "../../common/utils";
import { Hc2Timetables } from "../../apis";
import SideModal from "@/components/uiux/sideModal";
import { HiInput, HiSelectBox, ShowConfirm } from '@/components/uiux';
import HiTooltip from "@/components/uiux/hiTooltip";
import { showToast } from "@/unimplementeds/toast";
import { lessonChangeStatusMap } from "../main/lessonChangeManagement";
import { lessonChangeTypeMap, RecoveryErrMsgMap, RecoveryErrorType } from "../main/constants";
import { dispatchLessonChangeRequestCountRefresh } from "../../common/events";
import { HiButton } from "@/components/uiux/hiButton";

// 수업 변경 관리 탭 내 수업변경신청 사이드 모달
interface LessonChangeRequestModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  emitLessonChange: ((updated?: TimetableLessonChange | null) => void);
  lessonChange: TimetableLessonChange | null;
  isManagerView: boolean;
}

const disabledLessonChangeStatuses = [
  TimetableLessonChangeStatus.Completed,
  TimetableLessonChangeStatus.Rejected,
  TimetableLessonChangeStatus.Canceled,
  TimetableLessonChangeStatus.Ignored,
  TimetableLessonChangeStatus.Recovered,
] as TimetableLessonChangeStatus[];

const LessonChangeRequestModal: React.FC<LessonChangeRequestModalProps> = ({ isOpen, setIsOpen, lessonChange, emitLessonChange, isManagerView }) => {
  
  // === Contexts ===
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const specialtyRooms = useSpecialtyRoomContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const courseBases = useCourseBaseContext();

  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();

  const courseMap = useMemo(
    () => courseContext.courseMap || ({} as Record<string, Course>),
    [courses]
  );

  const courseBaseMap = useMemo(
    () => courseBaseContext.courseBaseMap || ({} as Record<string, CourseBase>),
    [courseBases]
  );

  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Class>),
    [classes]
  );

  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Teacher>),
    [teachers]
  );

  const teacherCourseBaseMap = useMemo(
    () => teacherCourseBaseContext.teacherCourseBaseMap || ({} as Record<string, TeacherCourseBase[]>),
    [teacherCourseBases]
  );

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  // === States ===
  const [ selectedLessonChange, setSelectedLessonChange ] = useState<TimetableLessonChange | null>(null);
  const [ lessonChangeDetails, setLessonChangeDetails ] = useState<TimetableLessonChangeDetail[]>([]);
  const [ basicLessonMapByTeacher, setBasicLessonMapByTeacher ] = useState<Record<string, DailyLesson[]>>({});
  const [ activatedClassDays, setActivatedClassDays ] = useState<ActivateWeekday[]>([]);
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);
  const [ selectedSpecialtyRoom, setSelectedSpecialtyRoom ] = useState<SpecialtyRoom | null>(null);
  const [ editedSpecialtyRoomName, setEditedSpecialtyRoomName ] = useState<string>('');
  const [ oldLessonChangeStatus, setOldLessonChangeStatus ] = useState<TimetableLessonChangeStatus>(TimetableLessonChangeStatus.Pending);

  // === Utils ===
  const readableLessonDay = (lessonDay: LessonDay) => {
    const monthAndDay = lessonDay.lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    const dayOfWeekTitle = DAYS_OF_WEEK.find((d) => d.index === lessonDay.dayOfWeek)?.title || "";
    return `${month}/${day}(${dayOfWeekTitle})`;
  };

  const adjustDisplayedPeriod = (period: number) => {
    return period + (startPeriod || 0);
  };

  // === Renderer ===
  const renderLessons = (lessonDate: number, dayOfWeek: number, period: number, teacherId: string) => {
    const basicLessonsOnTeacher = basicLessonMapByTeacher[teacherId] || [];

    const lesson = basicLessonsOnTeacher.find(l => l.lessonDate === lessonDate && l.period === period);

    const detail = sourceTargetMapByTeacher[teacherId];

    const isSourceLesson = (
      !!detail && !!detail?.source &&
      detail.source.lessonDate === lessonDate &&
      detail.source.dayOfWeek === dayOfWeek &&
      detail.source.period === period
    );

    const isTargetLesson = (
      !!detail && !!detail?.target &&
      detail.target.lessonDate === lessonDate &&
      detail.target.dayOfWeek === dayOfWeek &&
      detail.target.period === period
    );

    const dailyLesson = isSourceLesson
      ? detail.source
      : (
        isTargetLesson
          ? detail.target
          : (lesson
              ? {
                  lessonDate: lesson.lessonDate,
                  dayOfWeek: lesson.dayOfWeek,
                  period: lesson.period,
                  classId: lesson.classId,
                  courseId: lesson.courseId,
                  concurrentCourseId: lesson.concurrentCourseId,
                  consecutiveGroupId: lesson.consecutiveGroupId,
                  specialtyRoomId: lesson.specialtyRoomId,
                  changeType: TimetableDailyLessonChangeType.None
                } as DailyLesson
              : null
            )
        );

    if (!dailyLesson) return null;

    const option = {
      isTargetLesson,
      isSourceLesson,
      isDisabled: false,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isReadOnly: true
    } as DailyLessonButtonOption;

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = basicLessonsOnTeacher.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.dayOfWeek === dayOfWeek
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].lessonId === lesson.lessonId;
    }

    return (
      <DailyLessonButton
        dailyLesson={dailyLesson}
        lessonDate={dayOfWeek}
        period={period}
        classMap={classMap}
        courseMap={courseMap}
        teacherMap={teacherMap}
        specialtyRoomMap={specialtyRoomMap}
        option={option}
      />
    );
  };

  // === UseMemo ===
  const availableLessonChangeStatuses = useMemo(() => {
    // 상태 변경 불가 상태인 경우 모든 상태 리턴
    if(disabledLessonChangeStatuses.includes(oldLessonChangeStatus)) {
      return [
        TimetableLessonChangeStatus.Pending,
        TimetableLessonChangeStatus.Completed,
        TimetableLessonChangeStatus.Rejected,
        TimetableLessonChangeStatus.Canceled,
        TimetableLessonChangeStatus.Ignored,
        TimetableLessonChangeStatus.Recovered
      ] as TimetableLessonChangeStatus[];
    }

    // 관리자 페이지인 경우 '취소'/거절 상태만 선택 불가
    if(isManagerView) {
      return [
        TimetableLessonChangeStatus.Pending,
        TimetableLessonChangeStatus.Completed,
        TimetableLessonChangeStatus.Rejected,
        // TimetableLessonChangeStatus.Recovered,
      ] as TimetableLessonChangeStatus[];
    }

    return [
        TimetableLessonChangeStatus.Pending,
        TimetableLessonChangeStatus.Canceled,
    ] as TimetableLessonChangeStatus[];

  }, [isManagerView, oldLessonChangeStatus]);

  const lessonDaysForExchange = useMemo(() => {
    if (!selectedLessonChange || !lessonChangeDetails) return [];

    const minSourceDate = Math.min(...lessonChangeDetails.map(detail => detail.sourceLessonDate));

    const weeks = selectedLessonChange.lessonChangeType === TimetableDailyLessonChangeType.Exchange ? 3 : 1;
    return TimeUtils.generateLessonDays(minSourceDate, weeks)
      .filter((lessonDay: LessonDay) =>
        activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
      );
  }, [selectedLessonChange, lessonChangeDetails]);

  const lessonDaysColWidthForExchange = useMemo(() => {
    const headerWidth = 2.5;
    return !!lessonDaysForExchange && lessonDaysForExchange.length > 0
      ? `${(100 - headerWidth) / lessonDaysForExchange.length}%`
      : "auto";
  }, [lessonDaysForExchange]);

  const lessonDays = useMemo(() => {
    if (!selectedLessonChange || !lessonChangeDetails) return [];

    const minStartDate = Math.min(...lessonChangeDetails.map(detail => detail.sourceLessonDate));
    const [sunday, _] = TimeUtils.getWeekRange(minStartDate);

    const weeks = 1;
    return TimeUtils.generateLessonDays(sunday, weeks)
      .filter((lessonDay: LessonDay) =>
        activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
      );
  }, [selectedLessonChange, lessonChangeDetails]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 2.5;
    return !!lessonDays && lessonDays.length > 0
      ? `${(100 - headerWidth) / lessonDays.length}%`
      : "auto";
  }, [lessonDays]);

  const sourceTargetMapByTeacher = useMemo(() => {
    if (!lessonChangeDetails) return {};

    return lessonChangeDetails.reduce((acc, detail) => {
      const lessonChangeDetailType = detail.lessonChangeDetailType;
      if (lessonChangeDetailType === TimetableLessonChangeDetailType.Move) {
        if (selectedLessonChange?.lessonChangeType === TimetableDailyLessonChangeType.Exchange) {
          const sourceLesson = {
            lessonDate: detail?.sourceLessonDate,
            dayOfWeek: detail?.sourceLessonDate ? TimeUtils.getDayOfWeek(detail?.sourceLessonDate) : null,
            period: detail?.sourcePeriod,
            classId: detail?.sourceClassId,
            courseId: detail?.sourceCourseId,
            concurrentCourseId: null,
            consecutiveGroupId: null,
            specialtyRoomId: detail?.sourceSpecialtyRoomId || null,
            changeType: TimetableDailyLessonChangeType.None
          } as DailyLesson;
          const targetLesson = {
            lessonDate: detail?.targetLessonDate,
            dayOfWeek: detail?.targetLessonDate ? TimeUtils.getDayOfWeek(detail?.targetLessonDate) : null,
            period: detail?.targetPeriod,
            classId: detail?.targetClassId,
            courseId: detail?.targetCourseId,
            concurrentCourseId: null,
            consecutiveGroupId: null,
            specialtyRoomId: detail?.sourceSpecialtyRoomId || null,
            changeType: TimetableDailyLessonChangeType.None
          } as DailyLesson;

          acc[detail.sourceTeacherId] = { source: sourceLesson, target: targetLesson };
        } else {
          const targetLesson = {
            lessonDate: detail?.targetLessonDate,
            dayOfWeek: detail?.targetLessonDate ? TimeUtils.getDayOfWeek(detail?.targetLessonDate) : null,
            period: detail?.targetPeriod,
            classId: detail?.targetClassId,
            courseId: detail?.targetCourseId,
            concurrentCourseId: null,
            consecutiveGroupId: null,
            specialtyRoomId: detail?.sourceSpecialtyRoomId || null,
            changeType: TimetableDailyLessonChangeType.None
          } as DailyLesson;

          acc[detail.sourceTeacherId] = { source: null, target: targetLesson };
        }
      } else if (lessonChangeDetailType === TimetableLessonChangeDetailType.Add) {
        const targetLesson = {
          lessonDate: detail?.sourceLessonDate,
          dayOfWeek: detail?.sourceLessonDate ? TimeUtils.getDayOfWeek(detail?.sourceLessonDate) : null,
          period: detail?.sourcePeriod,
          classId: detail?.sourceClassId,
          courseId: detail?.sourceCourseId,
          concurrentCourseId: null,
          consecutiveGroupId: null,
          specialtyRoomId: detail?.sourceSpecialtyRoomId || null,
          changeType: TimetableDailyLessonChangeType.None
        } as DailyLesson;

        acc[detail.sourceTeacherId] = { source: null, target: targetLesson };

      } else {
        const sourceLesson = {
          lessonDate: detail?.sourceLessonDate,
          dayOfWeek: detail?.sourceLessonDate ? TimeUtils.getDayOfWeek(detail?.sourceLessonDate) : null,
          period: detail?.sourcePeriod,
          classId: detail?.sourceClassId,
          courseId: detail?.sourceCourseId,
          concurrentCourseId: null,
          consecutiveGroupId: null,
          specialtyRoomId: detail?.sourceSpecialtyRoomId || null,
          changeType: TimetableDailyLessonChangeType.None
        } as DailyLesson;

        acc[detail.sourceTeacherId] = { source: sourceLesson, target: null };
      }

      return acc;
    }, {} as Record<string, { source: DailyLesson | null; target: DailyLesson | null }>);
  }, [lessonChangeDetails]);

  const maxPeriod = useMemo(() => {
    if (!timetableConfig || !basicLessonMapByTeacher) return 7;

    const configMax = timetableConfig?.maxPeriod || 7;

    const maxPeriod = Object.values(sourceTargetMapByTeacher).map(sourceTarget => {
      const sourceMax = sourceTarget.source ? sourceTarget.source.period : 0;
      const targetMax = sourceTarget.target ? sourceTarget.target.period : 0;
      return Math.max(sourceMax, targetMax);
    });

    return Math.max(configMax, ...maxPeriod);
  }, [timetableConfig, basicLessonMapByTeacher, sourceTargetMapByTeacher]);

  // === API ===
  const fetchLessonChangeDetails = async () => {
    if (!lessonChange || !lessonChange.lessonChangeId || !lessonChange.timetableId) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.getLessonChangeDetailsLessonchangedetailsLessonChangeId(lessonChange.timetableId, lessonChange.lessonChangeId);

      const { details, dailyLessons } = res.data as { details: TimetableLessonChangeDetail[], dailyLessons: DailyLesson[] };

      setOnLessonChangeDetails(details);
      setOnBasicLessons(dailyLessons, details);
      // setOnBasicLessons(basicLessons, details);
    } catch (error) {
      console.error('수업 변경 상세 정보 조회 중 오류 발생:', error);
      return;
    }
  };

  const handleClickSaveLessonChange = async () => {
    if (!selectedLessonChange) return;

    const api = new Hc2Timetables();
    const shouldRefreshLessonChangeRequestCount = selectedLessonChange.status !== oldLessonChangeStatus;

    try {
      if(isManagerView) {
        const payload = {
          lessonChange: selectedLessonChange,
          roomName: editedSpecialtyRoomName
        };
        const res = await api.requestToPatchLessonChangeLessonchangesLessonChangeId(
          selectedLessonChange.timetableId,
          selectedLessonChange.lessonChangeId,
          payload
        );

        // const updated = res.data as TimetableLessonChange;
      }
      else {
        const payload = {
          status: selectedLessonChange.status,
          reason: selectedLessonChange.reason
        };
        
        const res = await api.requestToPatchLessonChangeStatusAndReasonStatusandreason(
          selectedLessonChange.timetableId,
          selectedLessonChange.lessonChangeId,
          payload
        );

        // const updated = res.data as TimetableLessonChange;
      }

      emitLessonChange();
      if (shouldRefreshLessonChangeRequestCount) {
        dispatchLessonChangeRequestCountRefresh();
      }
      showToast('저장되었습니다.', 3000);
      
    } catch (error) {
      console.error('수업 변경 신청 수정 중 오류 발생:', error);
      return;
    }

  };

  // 관리자취소 팝업 추가
  const handleClickAdminRecover = async () => {
    const changeTypeTitle = selectedLessonChange
      ? lessonChangeTypeMap[selectedLessonChange.lessonChangeType]
      : '수업변경';

    const confirmed = await ShowConfirm(
      '선택한 수업의 ' + changeTypeTitle + '을 관리자 취소 하시겠습니까?\n' +
      '관리자 취소 시 변경 전 상태로 돌아갑니다.',
      {
        confirmLabel: '확인',
        cancelLabel: '취소',
        reverse: true,
        className: 'time-table-alert',
      }
    );

    if (!confirmed) return;

    const api = new Hc2Timetables();
    try {
      const timetableId = selectedLessonChange?.timetableId!;
      const lessonChangeId = selectedLessonChange?.lessonChangeId!;
      const res = await api.requestToRecoverLessonChangeRecovery(timetableId, lessonChangeId);

      emitLessonChange();

      setIsOpen(false);
      showToast('관리자 취소가 적용됐습니다.', 3000);
    } catch (error) {
      const errorCode = error?.response?.data?.error as RecoveryErrorType;
      console.error("Error recovering lesson change:", errorCode, error);
      if (RecoveryErrMsgMap[errorCode]) {
        const msg = RecoveryErrMsgMap[errorCode];
        await ShowConfirm(msg, { confirmLabel: '확인', hideCancel: true, className: 'time-table-alert' });
      } else {
        showToast('관리자 취소 중 오류가 발생했습니다. 다시 시도해주세요.', 3000);
      }
    }
  };

  // === Methods ===
  const handleClickClose = () => {
    setIsOpen(false);
  };

  const handleChangeLessonChangeStatus = (status: TimetableLessonChangeStatus) => {
    if(status === selectedLessonChange?.status) {
      return;
    }

    setSelectedLessonChange(prev => prev ? { ...prev, status } : prev);
  }

  const isShowNote = useMemo(() => {
    if(!isManagerView) {
      return false;
    }

    return true;

    /*
    if(selectedLessonChange?.status === TimetableLessonChangeStatus.Rejected) {
      return true;
    }

    return ![TimetableLessonChangeStatus.Pending, TimetableLessonChangeStatus.Completed].includes(oldLessonChangeStatus);
    */
  }, [isManagerView, oldLessonChangeStatus, selectedLessonChange]);

  
  const setOnLessonChangeDetails = (details: TimetableLessonChangeDetail[]) => {
    if (!details || details.length === 0) {
      setLessonChangeDetails([]);
      return;
    }

    setLessonChangeDetails(details);
  };

  const setOnBasicLessons = (lessons: DailyLesson[], lessonChangeDetails: TimetableLessonChangeDetail[]) => {
    const teacherIds = Array.from(
      new Set(lessonChangeDetails.flatMap(lcd => [lcd.sourceTeacherId, lcd.targetTeacherId]).filter(teacherId => !!teacherId))
    );

    const lessonMapByTeacher = teacherIds.reduce((acc, id) => {
      if(id) {
        acc[id] = lessons.filter(l => l.lessonTeacherIds?.some(tId => tId === id));        
      }
      
      return acc;
    }, {} as Record<string, DailyLesson[]>);

    setBasicLessonMapByTeacher(lessonMapByTeacher)
  };

  const getTeacherCourseNames = (teacherId: string) => {
    const teacherCourseBases = teacherCourseBaseMap[teacherId] || [];
    return teacherCourseBases.map(tc => courseBaseMap[tc.courseBaseId]?.displayedTitle).filter(c => !!c).join(', ');
  };

  const resetAllStates = () => {
    setSelectedSpecialtyRoom(null);
    setEditedSpecialtyRoomName('');
    setSelectedLessonChange(null);
    setOldLessonChangeStatus(null);
    setLessonChangeDetails([]);
    setBasicLessonMapByTeacher({});
  };

  const reloadSpecialtyRooms = async () => {
    if (!lessonChange || !lessonChange.timetableId || lessonChange.lessonChangeType !== TimetableDailyLessonChangeType.Combination) return;
    await specialtyRoomContext.reloadWithTimetableId(lessonChange.timetableId);
  };

  // === UseEffects ===
  useEffect(() => {
    return () => resetAllStates();
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
    if (!isOpen || !lessonChange || !lessonChange.lessonChangeId || !lessonChange.timetableId) {
      setOldLessonChangeStatus(null);
      return;
    }

    reloadSpecialtyRooms();
    setSelectedLessonChange(lessonChange);
    setOldLessonChangeStatus(lessonChange.status);
    fetchLessonChangeDetails();
  }, [lessonChange, isOpen]);

  useEffect(() => {
    if (lessonChange?.lessonChangeType !== TimetableDailyLessonChangeType.Combination) {
      setSelectedSpecialtyRoom(null);
      setEditedSpecialtyRoomName('');
      return;
    }

    if (!lessonChangeDetails || lessonChangeDetails.length === 0) {
      return;
    }

    const specialtyRoomId =
      lessonChangeDetails.find(
        (detail) =>
          detail.lessonChangeDetailType === TimetableLessonChangeDetailType.Add && detail.sourceSpecialtyRoomId
      )?.sourceSpecialtyRoomId || null;

    if (!specialtyRoomId) {
      setSelectedSpecialtyRoom(null);
      setEditedSpecialtyRoomName('');
      return;
    }

    const specialtyRoom = specialtyRoomMap[specialtyRoomId] || null;
    setSelectedSpecialtyRoom(specialtyRoom);
    setEditedSpecialtyRoomName(specialtyRoom?.roomName || '');
  }, [lessonChange?.lessonChangeType, lessonChangeDetails, specialtyRoomMap]);

  const isCompleted = useMemo(() => {
    return !!selectedLessonChange && oldLessonChangeStatus === TimetableLessonChangeStatus.Completed;
  }, [selectedLessonChange, oldLessonChangeStatus]);

  const isIgnored = useMemo(() => {
    return !!selectedLessonChange && oldLessonChangeStatus === TimetableLessonChangeStatus.Ignored;
  }, [selectedLessonChange, oldLessonChangeStatus]);

  const isNotCompleteAndFinal = useMemo(() => {
    return !!selectedLessonChange && ![TimetableLessonChangeStatus.Pending, TimetableLessonChangeStatus.Completed].includes(oldLessonChangeStatus);
  }, [selectedLessonChange, oldLessonChangeStatus]);

  return (
    <SideModal
      className={styles.lessonChangeRequestModal}
      isOpen={isOpen}
      onClose={handleClickClose}
      size="xl"
      heading={`수업 변경 신청 (${!!selectedLessonChange && lessonChangeTypeMap[selectedLessonChange.lessonChangeType]})`}
      desc='전체 시간표에서 선생님의 일정을 변경합니다.'
      footer={
        <>
          <HiButton
            variant="tertiary"
            size="md"
            onClick={handleClickClose}
          >
            취소
          </HiButton>
          <HiButton
            variant="primary"
            size="md"
            onClick={handleClickSaveLessonChange}
          >
            저장
          </HiButton>
        </>
      }
    >
      <div>
        <div className={`tb-row -mt-4`}>
          {!!selectedLessonChange && selectedLessonChange.lessonChangeType === TimetableDailyLessonChangeType.Exchange
          ? (
            !!Object.keys(basicLessonMapByTeacher)
              && Object.keys(basicLessonMapByTeacher).map((teacherId, idx) =>
                // 수업변경 신청 (수업교체 )
                <div key={`teacher-${idx}`} className="tb-col-1 my-4">
                  <div className="table-content table-form time-table">
                    <div className="h4-tit">
                      <h4>{teacherMap[teacherId]?.teacherName}</h4>
                      <p className="period"> {getTeacherCourseNames(teacherId)}</p>
                    </div>
                    <table className='event-none'>
                      <caption>시간표</caption>
                      <colgroup>
                        <col style={{ width: "5%", minWidth: "40px" }} />
                        {lessonDaysForExchange.map((d, idx) => (
                          <col key={`day-index-${idx}`} style={{ width: lessonDaysColWidthForExchange }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr>
                          <th></th>
                          {lessonDaysForExchange.map((d) => (
                            <th key={`day-header-${d.lessonDate}`}>
                              {readableLessonDay(d)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {maxPeriod && Array.from({ length: maxPeriod }).map((_, periodIdx) => (
                          <tr key={`selected-period-index-${periodIdx}-${teacherId}`}>
                            <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                            {lessonDaysForExchange.map((d, dayIdx) => (
                              <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                                {renderLessons(d.lessonDate, d.dayOfWeek, periodIdx + 1, teacherId)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            ))
          : (
            !!Object.keys(basicLessonMapByTeacher)
              && Object.keys(basicLessonMapByTeacher).map((teacherId, idx) =>
                // 수업변경 신청 (합반배정,결보강,복수교사 )
                <div key={`teacher-${idx}`} className="tb-col-2 my-4">
                  <div className="table-content table-form time-table">
                    <div className="h4-tit">
                      <h4>{teacherMap[teacherId]?.teacherName}</h4>
                      <p className="period"> {getTeacherCourseNames(teacherId)}</p>
                    </div>
                    <table className='event-none'>
                      <caption>시간표</caption>
                      <colgroup>
                        <col style={{ width: "5%", minWidth: "40px" }} />
                        {lessonDays.map((d, idx) => (
                          <col key={`day-index-${idx}`} style={{ width: lessonDaysColWidth }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr>
                          <th></th>
                          {lessonDays.map((d) => (
                            <th key={`day-header-${d.lessonDate}`}>
                              {readableLessonDay(d)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {maxPeriod && Array.from({ length: maxPeriod }).map((_, periodIdx) => (
                          <tr key={`selected-period-index-${periodIdx}-${teacherId}`}>
                            <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                            {lessonDays.map((d, dayIdx) => (
                              <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                                {renderLessons(d.lessonDate, d.dayOfWeek, periodIdx + 1, teacherId)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )
          }
        </div>
        {!!selectedLessonChange && selectedLessonChange?.lessonChangeType === TimetableDailyLessonChangeType.Combination && (
          <div className="form-group-inline !mt-5">
            <label>특별실 명</label>
            <HiInput
              wrapStyle={{ width: 200 }}
              placeholder="특별실 명"
              type="text"
              value={editedSpecialtyRoomName}
              onChange={e => setEditedSpecialtyRoomName(e.target.value)}
              readOnly={![TimetableLessonChangeStatus.Pending, TimetableLessonChangeStatus.Completed].includes(selectedLessonChange?.status) || !selectedSpecialtyRoom?.isAfterBasic}
              spellCheck={false}
            />
          </div>
        )}
        <div className="form-group-inline !mt-5">
          <label>변경 사유</label>
          <HiInput
            wrapClass="md w-full placeholder:text-md"
            placeholder="선택사항 (최대 50자)"
            maxLength={50}
            type="text"
            spellCheck={false}
            value={selectedLessonChange?.reason || ''}
            onChange={e => setSelectedLessonChange({...selectedLessonChange, reason: e.target.value})}
            readOnly={disabledLessonChangeStatuses.includes(oldLessonChangeStatus)}
            // disabled={![TimetableLessonChangeStatus.Pending, TimetableLessonChangeStatus.Completed].includes(selectedLessonChange?.status)}
          />
        </div>
        <div className="form-group-inline !mt-5">
          <label>상태
            {oldLessonChangeStatus === TimetableLessonChangeStatus.Ignored && (
              <HiTooltip ico='info-warning-fill' className={'tooltip-custom'} position='bottom' titleHtml="시간표가 변경되어 처리가 불가합니다." />
            )}
            {oldLessonChangeStatus === TimetableLessonChangeStatus.Canceled && (
              <HiTooltip ico='info-warning-fill' className={'tooltip-custom'} position='bottom' titleHtml={<span><strong>{selectedLessonChange?.statusUpdatedUser?.userName}</strong>선생님이 변경요청을 취소하였습니다.</span>} />
            )}
          </label>
          <div>
            <HiSelectBox
              style={{ width: 200 }}
              value={selectedLessonChange?.status || null}
              items={availableLessonChangeStatuses.map(key => ({
                value: key,
                title: lessonChangeStatusMap[key]
              }))}
              onChange={status => handleChangeLessonChangeStatus(status)}
              // onChange={status => setSelectedLessonChangeStatus(status)}
              readonly={disabledLessonChangeStatuses.includes(oldLessonChangeStatus)}
            />
            {isCompleted && (
              <>
                <span className='text-neutral-strong ml-2'>
                  {new Date(selectedLessonChange?.approvedTimestamp!).toLocaleDateString()}
                </span>
                <span className='text-neutral-strong ml-1'>
                  {selectedLessonChange?.approvedUser?.userName!}
                </span>
                <HiButton
                  variant="warningLine"
                  size="xs"
                  className="ml-3"
                  onClick={handleClickAdminRecover}
                >
                  관리자 취소
                </HiButton>
              </>
            )}
            {isNotCompleteAndFinal && (
              <>
                <span className='text-neutral-strong ml-2'>
                  {new Date(selectedLessonChange?.statusUpdatedTimestamp!).toLocaleDateString()}
                </span>
                {!isIgnored && ( // 처리불가인 경우는 상태 변경자가 없으므로 이름 미표시
                <span className='text-neutral-strong ml-1'>
                  {selectedLessonChange?.statusUpdatedUser?.userName!}
                </span>)}
              </>
            )}
          </div>
        </div>
        {isShowNote && (
          <div className="form-group-inline !mt-5">
            <label>비고</label>
              <HiInput
                wrapClass="w-full"
                placeholder="선택사항 (최대 50자)"
                type="text"
                maxLength={50}
                spellCheck={false}
                value={selectedLessonChange?.note || ''}
                onChange={e => setSelectedLessonChange({...selectedLessonChange, note: e.target.value})}
              />
        </div>)}
      </div>
    </SideModal>
  );
};

export default LessonChangeRequestModal;
