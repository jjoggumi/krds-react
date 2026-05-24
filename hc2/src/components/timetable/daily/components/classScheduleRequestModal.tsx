
import { useEffect, useMemo, useState } from "react";
import { 
  TimetableClassContext,
  TimetableSpecialtyRoomContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  useClassContext,
  useCourseContext,
  useGradeContext,
  useSpecialtyRoomContext,
  useTeacherContext } from "../../contexts";
import { 
  Class,
  Course,
  DailyLesson,
  Lesson,
  SpecialtyRoom,
  Teacher,
  TimetableDailyLessonChangeType,
  TimetableLessonChange,
  TimetableLessonChangeDetail,
  TimetableLessonChangeStatus } from "../../core/types";
import { ActivateWeekday, LessonDay } from "../../common/types";
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import DailyLessonButton, { DailyLessonButtonOption } from "./dailyLessonButton";
import { TimetableDisplayUtils, TimeUtils } from "../../common/utils";
import { Hc2Timetables } from "../../apis";
import { showToast } from '@/unimplementeds/toast.js';
import SideModal from "@/components/uiux/sideModal";
import HiTooltip from "@/components/uiux/hiTooltip";
import { HiInput, HiSelectBox } from '@/components/uiux';
import { lessonChangeStatusMap } from "../main/lessonChangeManagement";
import { classScheduleTypeMap } from "../main/constants";
import { HiButton } from "@/components/uiux/hiButton";

// 학급 일정 변경 관리 탭 내 학급 일정 변경신청 사이드 모달
interface ClassScheduleRequestModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  emitLessonChange: ((updated?: TimetableLessonChange | null) => void);
  lessonChange: TimetableLessonChange | null;
}
const ClassScheduleRequestModal: React.FC<ClassScheduleRequestModalProps> = ({ isOpen, setIsOpen, emitLessonChange, lessonChange }) => {
  // === Contexts ===
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const specialtyRooms = useSpecialtyRoomContext();

  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();

  const courseMap = useMemo(
    () => courseContext.courseMap || ({} as Record<string, Course>),
    [courses]
  );

  const classMap = useMemo(
    () => classContext.classMap || ({} as Record<string, Class>),
    [classes]
  );

  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Teacher>),
    [teachers]
  );

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  // === States ===
  const [ selectedLessonChange, setSelectedLessonChange ] = useState<TimetableLessonChange | null>(lessonChange);
  const [ lessonChangeDetails, setLessonChangeDetails ] = useState<TimetableLessonChangeDetail[]>([]);
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);
  const [ activatedClassDays, setActivatedClassDays ] = useState<ActivateWeekday[]>([]);
  const [ basicLessonMapByClass, setBasicLessonMapByClass ] = useState<Record<string, DailyLesson[]>>({});
  const [ editedReason, setEditedReason ] = useState<string>('');
  const [ editedEventName, setEditedEventName ] = useState<string>('');

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

  // === Renderers ===
  const renderLessons = (lessonDate: number, dayOfWeek: number, period: number, classId: string) => {
    const basicLessonsOnClass = basicLessonMapByClass[classId] || [];

    const lesson = basicLessonsOnClass.find(l => l.dayOfWeek === dayOfWeek && l.period === period);

    if (!lesson) return null;

    const isChangeInRange = (type: TimetableDailyLessonChangeType) => {
      if (!selectedLessonChange) return false;
      if (selectedLessonChange.lessonChangeType !== type) return false;
      if (lessonDate !== selectedLessonChange.selectedStartDate) return false;

      const startPeriod = selectedLessonChange.selectedStartPeriod;
      const endPeriod = selectedLessonChange.selectedEndPeriod;

      // 전체(종일)
      if (startPeriod == null && endPeriod == null) return true;

      // 반일(교시 범위)
      if (startPeriod != null && endPeriod != null) return period >= startPeriod && period <= endPeriod;

      return false;
    };

    const isEvent = isChangeInRange(TimetableDailyLessonChangeType.Event);
    const isRemoved = isChangeInRange(TimetableDailyLessonChangeType.Removal);
    const isDuplicated = isChangeInRange(TimetableDailyLessonChangeType.Duplication);
    
    const isDuplicatedTarget = () => {
      if(!selectedLessonChange || 
         selectedLessonChange.lessonChangeType !== TimetableDailyLessonChangeType.Duplication) {
        return false;
      }

      const { targetDate } = selectedLessonChange;
      if(targetDate !== lessonDate) {
        return false;
      }

      const { targetStartPeriod, selectedStartPeriod, selectedEndPeriod } = selectedLessonChange;

      // 전체(종일)
      if (!selectedStartPeriod || !selectedEndPeriod) return true;

      // 반일(교시 범위)
      const startPeriod = targetStartPeriod || 1;
      const targetEndPeriod = startPeriod + (selectedEndPeriod - selectedStartPeriod);
      
      return period >= startPeriod && period <= targetEndPeriod;
    };

    const dailyLesson = {
      dayOfWeek: lesson.dayOfWeek,
      period: lesson.period,
      classId: lesson.classId,
      courseId: lesson.courseId,
      concurrentCourseId: lesson.concurrentCourseId,
      consecutiveGroupId: lesson.consecutiveGroupId,
      specialtyRoomId: lesson.specialtyRoomId,
      changeType: TimetableDailyLessonChangeType.None,
      isRemoved: false,
      isMoved: false,
      // lessonTeacherIds: lesson.lessonTeachers?.map(lt => lt.teacherId)
      lessonTeacherIds: lesson.lessonTeacherIds
    } as DailyLesson;

    const option = {
      isDisabled: false,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isReadOnly: true,
      isEvent,
      isRemoved,
      isDuplicated,
      isTimetableByClass: true,
    } as DailyLessonButtonOption;

    if (isEvent) {
      dailyLesson.changeType = TimetableDailyLessonChangeType.Event;
      dailyLesson.eventName = selectedLessonChange?.eventName || '';
      dailyLesson.isRemoved = true;
    }

    if (isRemoved) {
      dailyLesson.changeType = TimetableDailyLessonChangeType.Removal;
      dailyLesson.isRemoved = true;
    }

    if (isDuplicated) {
      dailyLesson.changeType = TimetableDailyLessonChangeType.Duplication;
      // option.isChangedLesson = true;
      // dailyLesson.
    }

    if(isDuplicatedTarget()) {
      // 복사 대상 하이라이트
      option.isChangedLesson = true;
    }

    if(lesson && lesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = basicLessonsOnClass.filter(l =>
        l.consecutiveGroupId === lesson.consecutiveGroupId &&
        l.classId == lesson.classId &&
        l.dayOfWeek === dayOfWeek
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === lesson.dailyLessonId;
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


  // === UseMemos ===
  const lessonDays = useMemo(() => {
    if (!selectedLessonChange || !lessonChangeDetails) return [];

    // 복사인 경우 대상일 기준으로 수업일 생성, 그 외에는 선택한 시작일 기준으로 수업일 생성
    const startDate = selectedLessonChange.lessonChangeType === TimetableDailyLessonChangeType.Duplication ? 
      selectedLessonChange.targetDate : 
      selectedLessonChange.selectedStartDate;

    if(!startDate) {
      return [];
    }

    const [sunday, _] = TimeUtils.getWeekRange(startDate);

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

  const maxPeriodsByClass = useMemo(() => {
    if (!timetableConfig || !basicLessonMapByClass) return 7;

    const configMax = timetableConfig?.maxPeriod || 7;

    return Object.keys(basicLessonMapByClass).reduce((acc, classId) => {
      const basicLessons = basicLessonMapByClass[classId];

      acc[classId] = basicLessons.reduce((acc, cur) => Math.max(acc, cur.period, configMax), 0);
      return acc;
    }, {} as Record<string, number>);

  }, [timetableConfig, basicLessonMapByClass]);

  // === API ===
  const fetchLessonChangeDetails = async () => {
    if (!lessonChange || !lessonChange.timetableId || !lessonChange.lessonChangeId) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.getLessonChangeDetailsLessonchangedetailsLessonChangeId(lessonChange.timetableId, lessonChange.lessonChangeId);

      const { details, dailyLessons } = res.data as { details: TimetableLessonChangeDetail[], dailyLessons: DailyLesson[] };

      setOnLessonChangeDetails(details);
      // setOnBasicLessons(basicLessons, details)
      setOnDailyLessons(dailyLessons, details);
    } catch (error) {
      console.error('수업 변경 상세 정보 조회 중 오류 발생:', error);
      return;
    }
  };

  const handleClickSaveLessonChange = async () => {
    if (!selectedLessonChange) return;

    const payload = {
      lessonChange: selectedLessonChange
    };

    const api = new Hc2Timetables();
    try {
      const res = await api.requestToPatchLessonChangeLessonchangesLessonChangeId(
        selectedLessonChange.timetableId,
        selectedLessonChange.lessonChangeId,
        payload
      );

      const updated = res.data as TimetableLessonChange;

      showToast('저장되었습니다.', 3000);

      emitLessonChange(updated);
    } catch (error) {
      console.error('수업 변경 신청 수정 중 오류 발생:', error);
      return;
    }

  };

  // === Methods ===
  const handleClickClose = () => {
    setIsOpen(false);
  };

  const setOnLessonChangeDetails = (details: TimetableLessonChangeDetail[]) => {
    if (!details || details.length === 0) {
      setLessonChangeDetails([]);
      return;
    }

    setLessonChangeDetails(details);
  };

  const setOnDailyLessons = (lessons: DailyLesson[], lessonChangeDetails: TimetableLessonChangeDetail[]) => {
    const classIds = Array.from(
      new Set(lessonChangeDetails.map(lcd => lcd.sourceClassId).filter(classId => !!classId && classMap[classId] && !classMap[classId].isVirtual))
    ).sort((a, b) => {
      const classA = classMap[a];
      const classB = classMap[b];
      if (!classA || !classB) return 0;
      if (classA.grade !== classB.grade) {
        return classA.grade - classB.grade;
      }
      return classA.classNumber - classB.classNumber;
    });

    const lessonMapByClass = classIds.reduce((acc, id) => {
      acc[id] = lessons.filter(l => l.classId === id);
      return acc;
    }, {} as Record<string, DailyLesson[]>);

    setBasicLessonMapByClass(lessonMapByClass)
  };

  /*
  const setOnBasicLessons = (lessons: Lesson[], lessonChangeDetails: TimetableLessonChangeDetail[]) => {
    const classIds = Array.from(
      new Set(lessonChangeDetails.map(lcd => lcd.sourceClassId).filter(classId => !!classId && classMap[classId] && !classMap[classId].isVirtual))
    ).sort((a, b) => {
      const classA = classMap[a];
      const classB = classMap[b];
      if (!classA || !classB) return 0;
      if (classA.grade !== classB.grade) {
        return classA.grade - classB.grade;
      }
      return classA.classNumber - classB.classNumber;
    });

    const lessonMapByClass = classIds.reduce((acc, id) => {
      acc[id] = lessons.filter(l => l.classId === id);
      return acc;
    }, {} as Record<string, Lesson[]>);

    setBasicLessonMapByClass(lessonMapByClass)
  };
  */

  const resetAllStates = () => {
    setSelectedLessonChange(null);
    setLessonChangeDetails([]);
    setBasicLessonMapByClass({});
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
    if (!isOpen || !lessonChange || !lessonChange.lessonChangeId || !lessonChange.timetableId) return;

    setSelectedLessonChange(lessonChange);
    setEditedEventName(lessonChange.eventName || "");
    setEditedReason(lessonChange.reason || "");
    fetchLessonChangeDetails();
  }, [lessonChange, isOpen]);

  return (
    <SideModal isOpen={isOpen} onClose={handleClickClose} size="xl" heading={`학급 일정 변경 신청 (${!!selectedLessonChange && classScheduleTypeMap[selectedLessonChange.lessonChangeType]})`}
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
          수정
        </HiButton>
      </>
    }>
      <div>
        <div className="tb-row -mt-4">
          {(!!Object.keys(basicLessonMapByClass)
            && Object.keys(basicLessonMapByClass).map((classId, idx) =>
                <div key={`class-${idx}`} className="tb-col-2 my-4">
                  <div className="table-content table-form time-table">
                    <div className="h4-tit">
                      <h4>{`${TimetableDisplayUtils.formatFullClassName(classMap[classId])}`}</h4>
                      <p className="period">
                        {classMap[classId] && classMap[classId].homeroomTeacherName
                          ? `담임: ${classMap[classId].homeroomTeacherName}`
                          : ""}
                      </p>
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
                        <tr />
                        {!!maxPeriodsByClass[classId] && Array.from({ length: maxPeriodsByClass[classId] }).map((_, periodIdx) => (
                          <tr key={`selected-period-index-${periodIdx}-${classId}`}>
                            <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                            {lessonDays.map((d, dayIdx) => (
                              <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                                {renderLessons(d.lessonDate, d.dayOfWeek, periodIdx + 1, classId)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            )
          )}
        </div>
        {TimetableDailyLessonChangeType.Event === selectedLessonChange?.lessonChangeType && (
          <div className="form-group-inline !mt-5">
            <label>행사명</label>
            <HiInput
              wrapStyle={{ width: 280 }}
              placeholder="행사명 입력 (최대 10자)"
              maxLength={10}
              type="text"
              value={selectedLessonChange?.eventName || ""}
              onChange={e => setSelectedLessonChange({...selectedLessonChange, eventName: e.target.value})}
              spellCheck={false}
            />
          </div>
        )}
        <div className="form-group-inline !mt-5">
          <label>변경 사유</label>
          <HiInput
            wrapClass="md w-full placeholder:text-md"
            placeholder="선택사항 (최대 50자)"
            type="text"
            maxLength={50}
            value={selectedLessonChange?.reason || ""}
            onChange={e => setSelectedLessonChange({...selectedLessonChange, reason: e.target.value})}
            spellCheck={false}
          />
        </div>
        <div className="form-group-inline !mt-5">
          <label>상태
            {selectedLessonChange?.status === TimetableLessonChangeStatus.Ignored && (
              <HiTooltip ico='info-warning-fill' className={'tooltip-custom'} position='bottom' titleHtml="시간표가 변경되어 처리가 불가합니다." />
            )}
            {selectedLessonChange?.status === TimetableLessonChangeStatus.Canceled && (
              <HiTooltip ico='info-warning-fill' className={'tooltip-custom'} position='bottom' titleHtml={<span><strong>{selectedLessonChange?.statusUpdatedUser?.userName}</strong>선생님이 변경요청을 취소하였습니다.</span>} />
            )}
          </label>
          <HiSelectBox
            style={{ width: 200 }}
            value={selectedLessonChange?.status}
            items={Object.keys(lessonChangeStatusMap).map(key => ({
              value: key,
              title: lessonChangeStatusMap[key]
            }))}
            // disabled={true}
            readonly={true}
          />
{/*    학급일정 변경 신청 에서는 날짜와 이름 삭제        
          {!!selectedLessonChange && selectedLessonChange?.status === TimetableLessonChangeStatus.Completed && (
            <>
              <span className='text-neutral-strong ml-2'>
                {new Date(selectedLessonChange?.approvedTimestamp!).toLocaleDateString()}
              </span>
              <span className='text-neutral-strong ml-1'>
                {selectedLessonChange?.approvedUser?.userName!}
              </span>
            </>
          )}
          {!!selectedLessonChange && [TimetableLessonChangeStatus.Ignored, TimetableLessonChangeStatus.Canceled].includes(selectedLessonChange?.status) && (
            <>
              <span className='text-neutral-strong ml-2'>
                {new Date(selectedLessonChange?.statusUpdatedTimestamp!).toLocaleDateString()}
              </span>
              <span className='text-neutral-strong ml-1'>
                {selectedLessonChange?.statusUpdatedUser?.userName!}
              </span>
            </>
          )} */}
        </div>
        {![TimetableLessonChangeStatus.Pending, TimetableLessonChangeStatus.Completed].includes(selectedLessonChange?.status) && (
          <div className="form-group-inline mt-20">
            <label>비고</label>
              <HiInput
                wrapClass="w-full"
                placeholder="선택사항 (최대 50자)"
                type="text"
                maxLength={50}
                value={selectedLessonChange?.note || ''}
                onChange={e => setSelectedLessonChange({...selectedLessonChange, note: e.target.value})}
                spellCheck={false}
              />
          </div>
        )}
      </div>
    </SideModal>
  );
};

export default ClassScheduleRequestModal;