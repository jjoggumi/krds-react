import { FC, useEffect, useMemo, useRef, useState } from "react";
import styles from "./changeClassScheduleModal.module.scss";
import { DatetimePicker } from '../../components/datetimePicker.jsx';
import { Class, TimetableConfig, TimetableDailyLessonChangeType, TimetableIndex, TimetableLessonChangeStatus } from "../../core/types";
import { TimetableClassContext, TimetableGradeContext, useClassContext, useGradeContext } from "../../contexts";
import { TimetableDisplayUtils, TimeUtils } from "../../common/utils";
import { showToast } from '@/unimplementeds/toast.js';
import { ShowAlert, ShowConfirm } from '@/components/uiux/modal';
import { Hc2Timetables } from "../../apis";
import SideModal from "@/components/uiux/sideModal";
import { ClassScheduleChangeType, ClassScheduleErrorType, classScheduleTypeMap, errMsgMapByType } from "../main/constants";
import { HiButton, HiInput, HiSelectBox } from '@/components/uiux';

enum TargetType {
  Grade = 'GRADE',
  Class = 'CLASS',
}

// 전체 시간표 탭 내 학급 일정 변경 사이드 모달
interface ChangeClassScheduleModalProps {
  selectedTimetable?: TimetableIndex | null;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reload?: () => void;
}

interface ClassOption {
  value: string;
  classNumber: number;
  title: string;
  isVirtual: boolean;
}

const ChangeClassScheduleModal: FC<ChangeClassScheduleModalProps> = ({ selectedTimetable, isOpen, setIsOpen, reload }) => {

  // === 학급일정 변경 타입 매핑 ===
  const typeMap = {
    [ClassScheduleChangeType.Event]: TimetableDailyLessonChangeType.Event,
    [ClassScheduleChangeType.Reassignment]: TimetableDailyLessonChangeType.Reassignment,
    [ClassScheduleChangeType.Duplication]: TimetableDailyLessonChangeType.Duplication,
    [ClassScheduleChangeType.Removal]: TimetableDailyLessonChangeType.Removal,
    [ClassScheduleChangeType.Swap]: TimetableDailyLessonChangeType.InternalSwap
  };
  
  // === 교환 옵션 ===
  const swapTypes = [
    { value: TimetableDailyLessonChangeType.InternalSwap, label: '동일학급 내 수업 교환' },
    { value: TimetableDailyLessonChangeType.ExternalSwap, label: '다른 학급과 수업 교환' }
  ];

  // === Contexts ===
  const timetableConfig = useGradeContext() as TimetableConfig;
  const classes = useClassContext() as Class[];

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();

  const gradeNameMap = useMemo(
    () => gradeContext.gradeNameMap || ({} as Record<number, string>),
    [timetableConfig]
  );

  const initialDate = Math.max(selectedTimetable?.operationStartDate || TimeUtils.getTodayAsNumber(), TimeUtils.getTodayAsNumber());

  // === States ===
  // const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);
  const [changeType, setChangeType] = useState<ClassScheduleChangeType>(ClassScheduleChangeType.Event);
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType>(TargetType.Grade); // 'grade' or 'class'
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]); // 학년별 선택용
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]); // 학급별 선택용
  const [selectedSourceDate, setSelectedSourceDate] = useState<number | null>(initialDate); // 기준 일자 선택용
  const [selectedSourceStartPeriod, setSelectedSourceStartPeriod] = useState<number | null>(null); // 기준 일자 첫 교시
  const [selectedSourceEndPeriod, setSelectedSourceEndPeriod] = useState<number | null>(null); // 기준 일자 마지막 교시
  const [selectedTargetDate, setSelectedTargetDate] = useState<number | null>(null); // 변경 일자 선택용
  const [selectedTargetStartPeriod, setSelectedTargetStartPeriod] = useState<number | null>(null); // 변경 일자 첫 교시
  const [eventName, setEventName] = useState<string>(''); // 행사명
  const [reason, setReason] = useState<string>(''); // 변경 사유
  const [periodCheckboxChecked, setPeriodCheckboxChecked] = useState(true); // 교시 체크박스 상태  
  const [selectedLessonChangeType, setSelectedLessonChangeType] = useState<TimetableDailyLessonChangeType | null>(null);// 교환 방법 선택 상태 
  const [selectedSourceClassOnSwap, setSelectedSourceClassOnSwap] = useState<string | null>(null); // 기준 학급( 교환 )
  const [selectedTargetClassOnSwap, setSelectedTargetClassOnSwap] = useState<string | null>(null); // 변경 학급( 교환 )

  // === Utils for date handling ===
  const sourceCalendarRef = useRef(null);
  const targetCalendarRef = useRef(null);

  const handleBeforeSelectDate = (date, calendar) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);
    const todayNum = TimeUtils.getTodayAsNumber();
    const todayTimestamp = Date.now();

    let invalidMsg = "";
    if (selectedTimetable && (paramDateNum < selectedTimetable.operationStartDate || paramDateNum > selectedTimetable.operationEndDate)) {
      invalidMsg = "운영 기간이 아닌 날짜는 선택할 수 없습니다.";
    } else if (!isEventOrDuplication && paramDateNum < todayNum) {
      invalidMsg = "과거 날짜는 선택할 수 없습니다.";
    }

    if (invalidMsg) {
      showToast(invalidMsg, 3000);
      calendar?.setSelectedTimestamps([todayTimestamp]);
      return false;
    }
    return true;
  }

  const handleBeforeSelectTargetDate = (date, calendar) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);
    const todayNum = initialDate;

    let invalidMsg = "";
    if (selectedTimetable && (paramDateNum < selectedTimetable.operationStartDate || paramDateNum > selectedTimetable.operationEndDate)) {
      invalidMsg = "운영 기간이 아닌 날짜는 선택할 수 없습니다.";
    } else if (paramDateNum < todayNum) {
      invalidMsg = "과거 날짜는 선택할 수 없습니다.";
    } /* else if (paramDateNum === todayNum) {
      invalidMsg = "오늘 날짜는 선택할 수 없습니다.";
    } */ else if (!!selectedSourceDate && paramDateNum === selectedSourceDate) {
      invalidMsg = "기준 일자와 동일한 날짜는 선택할 수 없습니다.";
    }

    if (invalidMsg) {
      showToast(invalidMsg, 3000);
      calendar?.setSelectedTimestamps([null]);
      return false;
    }
    return true;
  };

  const formatExpirationDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일(${weekDay})`;
  };

  // === UseMemo ===
  const isEventOrDuplication = useMemo(() => {
    if (!changeType) return false;
    return [ClassScheduleChangeType.Event, ClassScheduleChangeType.Duplication].includes(changeType);
  }, [changeType])

  const targetGradeOptions = useMemo(() => {
    if (!timetableConfig || !Array.isArray(timetableConfig.grades) || timetableConfig.grades.length === 0) return [];

    const grades = timetableConfig.grades
      .sort((a, b) => a.grade - b.grade)
      .map(grade => ({ value: grade.grade.toString(), title: `${gradeNameMap[grade.grade]}` }));
    return [ { value: 'ALL', title: '전체' }, ...grades ];
  }, [timetableConfig]);

  const targetClassOptions = useMemo(() => {
    if (!classes) return [];

    const classesByGrade = classes.reduce((acc, cur) => {
      const grade = cur.grade;
      acc[grade] ||= [];
      // if (cur.isVirtual) return acc;
      acc[grade].push({
        value: cur.classId,
        classNumber: cur.classNumber,
        title: TimetableDisplayUtils.formatFullClassName(cur),
        isVirtual: cur.isVirtual
      } as ClassOption);
      return acc;
    }, {} as Record<string, ClassOption[]>);

    const res =  Object.entries(classesByGrade)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([grade, classOptions]) => {
        classOptions.sort((a, b) => {
          if (a.isVirtual != b.isVirtual) { // 가상 수업은 항상 마지막에 오도록 설정
            return a.isVirtual ? 1 : -1;
          }
          return a.classNumber - b.classNumber;
        });
        return { value: grade, classes: classOptions };
      });

    return res;
  }, [classes]);

  const classOptionsOnSwap = useMemo(() => {
    if (!classes) return [];

    const classesByGrade = classes.reduce((acc, cur) => {
      const grade = cur.grade;
      acc[grade] ||= [];
      if (cur.isVirtual) return acc;
      acc[grade].push(cur);
      return acc;
    }, {} as Record<string, Class[]>);

    return Object.entries(classesByGrade)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .flatMap(([_, classes]) => {
        classes.sort((a, b) => a.classNumber - b.classNumber);
        return classes.map(clazz => ({ value: clazz.classId, title: TimetableDisplayUtils.formatFullClassName(clazz) }));
      });
  }, [classes]);

  const periodOptions = useMemo(() => {
    if (!timetableConfig) return [];

    const periodOffset = timetableConfig?.startPeriod ?? 1;
    const periods = Array.from({ length: timetableConfig.maxPeriod })
      .map((_, index) => ({ value: index + periodOffset, title: `${index + periodOffset}교시` }));
    return periods;
  }, [timetableConfig]);

  const isClickableToSave = useMemo(() => {
    if (
      [TimetableDailyLessonChangeType.Event, TimetableDailyLessonChangeType.Removal].includes(selectedLessonChangeType) &&
      (
        !selectedTargetType ||
        (TargetType.Grade === selectedTargetType && selectedGrades.length === 0) ||
        (TargetType.Class === selectedTargetType && selectedClasses.length === 0) ||
        !selectedSourceDate ||
        (periodCheckboxChecked && (typeof selectedSourceStartPeriod !== 'number' || typeof selectedSourceEndPeriod !== 'number')) ||
        (TimetableDailyLessonChangeType.Event === selectedLessonChangeType && !eventName.trim())
      )
    ) return false;

    if (
      [TimetableDailyLessonChangeType.Duplication].includes(selectedLessonChangeType) &&
      (
        !selectedTargetType ||
        (TargetType.Grade === selectedTargetType && selectedGrades.length === 0) ||
        (TargetType.Class === selectedTargetType && selectedClasses.length === 0) ||
        !selectedSourceDate ||
        !selectedTargetDate ||
        (periodCheckboxChecked && (typeof selectedSourceStartPeriod !== 'number' || typeof selectedSourceEndPeriod !== 'number' || typeof selectedTargetStartPeriod !== 'number'))
      )
    ) return false;

    // 1차 오픈 범위 제외
    if ([
      TimetableDailyLessonChangeType.Reassignment, 
      TimetableDailyLessonChangeType.ExternalSwap, 
      TimetableDailyLessonChangeType.InternalSwap
    ].includes(selectedLessonChangeType)) return false;

    return true;
  }, [
    changeType, 
    selectedTargetType,
    periodCheckboxChecked,
    selectedGrades, 
    selectedClasses, 
    selectedSourceDate, 
    selectedSourceStartPeriod,
    selectedSourceEndPeriod,
    selectedTargetDate,
    selectedTargetStartPeriod,
    eventName,
    selectedLessonChangeType,
    selectedSourceClassOnSwap,
    selectedTargetClassOnSwap
  ]);
  
  const handleClickClose = async () => {
    const initChangeType = ClassScheduleChangeType.Event;
    setChangeType(initChangeType);
    setSelectedLessonChangeType(typeMap[initChangeType]);
    resetAllParameters();
    setIsOpen(false);
    await reload?.();
  };

  const handleChangeTargetType = (type: TargetType) => {
    setSelectedGrades([]);
    setSelectedClasses([]);
    setSelectedTargetType(type);
  };

  const handleClickGradeOption = (grade: string) => {
    if (grade === 'ALL') setSelectedGrades(prev =>
      prev.includes('ALL')
        ? []
        : [...targetGradeOptions.map(option => option.value), 'ALL']
    );
    else {
      setSelectedGrades((prev) => {
        let nextGrades: string[];
        const isGradeSelected = prev.includes(grade);

        nextGrades = isGradeSelected ? prev.filter((v) => v !== grade && v !== 'ALL') : [...prev.filter((v) => v !== 'ALL'), grade];
        const hasAllGrades = targetGradeOptions
          .map(option => option.value)
          .filter(value => value !== 'ALL')
          .every(val => nextGrades.includes(val));

        return hasAllGrades ? [...nextGrades, 'ALL'] : nextGrades;
      });
    }
  };

  const handleClickClassOption = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((v) => v !== classId)
        : [...prev, classId]
    );
  };

  const handleChangeSourceDate = (closedTimestamp: number) => {
    // 연계 파라미터 초기화
    setSelectedSourceStartPeriod(null);
    setSelectedSourceEndPeriod(null);
    setSelectedTargetStartPeriod(null);

    const selectedDateNum = TimeUtils.getTimestampToNumber(closedTimestamp);
    setSelectedTargetDate(prev => (prev <= selectedDateNum ? null : prev));
    setSelectedSourceDate(selectedDateNum);
  };

  const handleChangeTargetDate = (closedTimestamp: number) => {
    // 연계 파라미터 초기화
    setSelectedTargetStartPeriod(null);

    setSelectedTargetDate(TimeUtils.getTimestampToNumber(closedTimestamp));
  };

  const handleClickChangeType = (type: ClassScheduleChangeType) => {
    // 각종 파라미터 초기화
    resetAllParameters();

    setChangeType(type);
    setSelectedLessonChangeType(typeMap[type]);
  };

  const handleClickPeriodCheckbox = (checked: boolean) => {
    if (!checked) {
      setSelectedSourceStartPeriod(null);
      setSelectedSourceEndPeriod(null);
      setSelectedTargetStartPeriod(null);
    }

    setPeriodCheckboxChecked(checked);
  };

  const resetAllParameters = () => {
    // const resetChangeType = ClassScheduleChangeType.Event;
    const resetTargetType = TargetType.Grade;

    setSelectedTargetType(resetTargetType);
    setSelectedGrades([]);
    setSelectedClasses([]);

    setSelectedSourceDate(initialDate);
    setSelectedSourceStartPeriod(null);
    setSelectedSourceEndPeriod(null);
    setPeriodCheckboxChecked(true);

    setSelectedSourceClassOnSwap(null);
    setSelectedTargetClassOnSwap(null);

    setSelectedTargetDate(null);
    setSelectedTargetStartPeriod(null);

    setEventName('');
    setReason('');

    // setChangeType(resetChangeType);
    // setSelectedLessonChangeType(typeMap[resetChangeType]);
  };

  const apiHandler = (type: TimetableDailyLessonChangeType) => {
    const api = new Hc2Timetables();
    const apiMap = {
      [TimetableDailyLessonChangeType.Event]: api.requestToChangeForEventEvents,
      [TimetableDailyLessonChangeType.Removal]: api.requestToChangeForRemovalRemovals,
      [TimetableDailyLessonChangeType.Duplication]: api.requestToChangeForDuplicationDuplications
    };
    return apiMap[type] || null;
  };

  const payloadHandler = (type: TimetableDailyLessonChangeType) => {
    const payloadMap = {
      [TimetableDailyLessonChangeType.Event]: () => getPayloadForEvent(),
      [TimetableDailyLessonChangeType.Removal]: () => getPayloadForRemoval(),
      [TimetableDailyLessonChangeType.Duplication]: () => getPayloadForDuplication()
    };
    return payloadMap[type]();
  };

  const getPayloadForEvent = () => {
    if (
      !selectedTargetType ||
      (TargetType.Grade === selectedTargetType && selectedGrades.length === 0) ||
      (TargetType.Class === selectedTargetType && selectedClasses.length === 0) ||
      !selectedSourceDate ||
      (periodCheckboxChecked && (typeof selectedSourceStartPeriod !== 'number' || typeof selectedSourceEndPeriod !== 'number')) ||
      !eventName.trim()
    ) return null;

    return {
      lessonChangeType: TimetableDailyLessonChangeType.Event,
      status: TimetableLessonChangeStatus.Completed,
      selectedType: selectedTargetType,
      selectedGrades: TargetType.Grade === selectedTargetType ? selectedGrades.filter(grade => grade !== 'ALL') : [],
      selectedSourceClassIds: TargetType.Class === selectedTargetType ? selectedClasses : [],
      dateType: periodCheckboxChecked ? 'HALF_DAY' : 'FULL_DAY',
      sourceStartDate: selectedSourceDate,
      sourceStartPeriod: periodCheckboxChecked ? handleAdjustPeriod(selectedSourceStartPeriod) : null,
      sourceEndPeriod: periodCheckboxChecked ? handleAdjustPeriod(selectedSourceEndPeriod) : null,
      eventName,
      reason
    };
  };

  const getPayloadForRemoval = () => {
    if (
      !selectedTargetType ||
      (TargetType.Grade === selectedTargetType && selectedGrades.length === 0) ||
      (TargetType.Class === selectedTargetType && selectedClasses.length === 0) ||
      !selectedSourceDate ||
      (periodCheckboxChecked && (typeof selectedSourceStartPeriod !== 'number' || typeof selectedSourceEndPeriod !== 'number'))
    ) return null;

    return {
      lessonChangeType: TimetableDailyLessonChangeType.Removal,
      status: TimetableLessonChangeStatus.Completed,
      selectedType: selectedTargetType,
      selectedGrades: TargetType.Grade === selectedTargetType ? selectedGrades.filter(grade => grade !== 'ALL') : [],
      selectedSourceClassIds: TargetType.Class === selectedTargetType ? selectedClasses : [],
      dateType: periodCheckboxChecked ? 'HALF_DAY' : 'FULL_DAY',
      sourceStartDate: selectedSourceDate,
      sourceStartPeriod: periodCheckboxChecked ? handleAdjustPeriod(selectedSourceStartPeriod) : null,
      sourceEndPeriod: periodCheckboxChecked ? handleAdjustPeriod(selectedSourceEndPeriod) : null,
      reason
    };
  };

  const getPayloadForDuplication = () => {
    if (
      !selectedTargetType ||
      (TargetType.Grade === selectedTargetType && selectedGrades.length === 0) ||
      (TargetType.Class === selectedTargetType && selectedClasses.length === 0) ||
      !selectedSourceDate ||
      !selectedTargetDate ||
      (periodCheckboxChecked && (typeof selectedSourceStartPeriod !== 'number' || typeof selectedSourceEndPeriod !== 'number' || typeof selectedTargetStartPeriod !== 'number'))
    ) return null;
    
    return {
      lessonChangeType: TimetableDailyLessonChangeType.Duplication,
      status: TimetableLessonChangeStatus.Completed,
      selectedType: selectedTargetType,
      selectedGrades: TargetType.Grade === selectedTargetType ? selectedGrades.filter(grade => grade !== 'ALL') : [],
      selectedSourceClassIds: TargetType.Class === selectedTargetType ? selectedClasses : [],
      dateType: periodCheckboxChecked ? 'HALF_DAY' : 'FULL_DAY',
      sourceStartDate: selectedSourceDate,
      sourceStartPeriod: periodCheckboxChecked ? handleAdjustPeriod(selectedSourceStartPeriod) : null,
      sourceEndPeriod: periodCheckboxChecked ? handleAdjustPeriod(selectedSourceEndPeriod) : null,
      targetDate: selectedTargetDate,
      targetStartPeriod: periodCheckboxChecked ? handleAdjustPeriod(selectedTargetStartPeriod) : null,
      reason
    };
  };

  const handleAdjustPeriod = (period: number) => {
    return startPeriod ? period : period + 1;
  };

  const handleClickSaveLessonChange = async () => {
    if (!selectedTimetable) return;

    const fetchToChange = apiHandler(selectedLessonChangeType);
    const payload = payloadHandler(selectedLessonChangeType);

    if (!fetchToChange) return;

    if (!payload) {
      showToast('필수 입력 항목을 모두 입력해주세요.', 3000);
      return;
    }

    try {
      const res = await fetchToChange(selectedTimetable.timetableId, payload);

      if (res.status === 204) {
        showToast('학급 일정이 변경되었습니다.', 3000);
        resetAllParameters();
      }
    } catch (error) {
      console.error('학급 일정 변경 중 오류 발생:', error);
      const errorCode = error?.response?.data?.error;

      if(errorCode == ClassScheduleErrorType.conflictingLessonExists) {
        // 수업 중복만 예외처리
        await ShowConfirm(`동일 교시에 학급 또는 교사가 중복으로 배정되어 복사할 수 없습니다. 붙여넣기 할 날짜의 수업을 삭제 후 다시 시도해 주세요.`,
            { confirmLabel: '확인', hideCancel: true, className: 'time-table-alert'}
          );
        return;
      }

      const errMsgMap = errMsgMapByType[selectedLessonChangeType] || {};
      if (errorCode !== undefined && errorCode !== null && !!errMsgMap[errorCode]) {
        showToast(errMsgMap[errorCode], 3000);
      } else {
        showToast('학급 일정 변경 중 오류가 발생했습니다. 다시 시도해주세요.', 3000);
      }
      return;
    }
  };

  // === UseEffects ===
  useEffect(() => {
    if (!timetableConfig) return;

    setStartPeriod(timetableConfig?.startPeriod ?? 1);
  }, [timetableConfig]);
  
  useEffect(() => {
    const initChangeType = ClassScheduleChangeType.Event;
    setChangeType(initChangeType);
    setSelectedLessonChangeType(typeMap[initChangeType]);
    // initialize();
    return () => resetAllParameters();
  }, []);


  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClickClose}
      size="lg"
      className={styles.classScheduleChangeSideModal}
      heading="학급 일정 변경"
      desc="전체 시간표에서 학급의 일정을 변경합니다."
      footer={    
      <>
        <HiButton variant='tertiary' onClick={handleClickClose}>취소</HiButton>
        <HiButton variant='primary' disabled={!isClickableToSave} onClick={handleClickSaveLessonChange}>변경하기</HiButton>
      </>  
      }
    >
      {/* 일정 변경 선택 */}
      <div className="form-group-inline">
        <label>일정 변경 선택</label>
        {Object.keys(classScheduleTypeMap).map((type) => (
          <div className="form-ctr" key={type}>
            <input
              type="radio"
              name="scheduleType"
              id={`scheduleType-${type}`}
              checked={changeType === type}
              onChange={() => handleClickChangeType(type as ClassScheduleChangeType)}
            />
            <label htmlFor={`scheduleType-${type}`}>
              <span>{classScheduleTypeMap[type]}</span>
            </label>
          </div>
        ))}
      </div>

      {[TimetableDailyLessonChangeType.InternalSwap, TimetableDailyLessonChangeType.ExternalSwap].includes(selectedLessonChangeType) ? (
        <>
        {/* 교환 방법 선택 */}
          <div className="form-group-inline">
            <label>교환 방법 선택</label>
            {swapTypes.map((type) => (
              <div className="form-ctr" key={type.value}>
                <input
                  type="radio"
                  name="exchangeType"
                  id={`exchangeType-${type.value}`}
                  checked={selectedLessonChangeType === type.value}
                  onChange={() => setSelectedLessonChangeType(type.value)}
                />
                <label htmlFor={`exchangeType-${type.value}`}>
                  <span>{type.label}</span>
                </label>
              </div>
            ))}
          </div>
          
          {/* 학급 선택 */}
          <div className="form-group-inline">
            <label>학급선택</label>
            <div>
              <HiSelectBox
                value={selectedSourceClassOnSwap}
                items={classOptionsOnSwap}
                onChange={setSelectedSourceClassOnSwap}
                style={{ width: 240 }}
                emptyTitle={"교환 주체 학급 선택"}
              />
              {selectedLessonChangeType === TimetableDailyLessonChangeType.ExternalSwap && (
                <>
                  <i className="ico ico-exchange-direct ico-primary ico-size-36 ml-2 mr-2 p-0"></i>
                  <HiSelectBox
                    value={selectedTargetClassOnSwap}
                    items={classOptionsOnSwap.filter(c => c.value !== selectedSourceClassOnSwap)}
                    onChange={setSelectedTargetClassOnSwap}
                    style={{ width: 240 }}
                    emptyTitle={"교환 상대 학급 선택"}
                  />
                </>
              )}
            </div>
          </div> 
        </>
        ) : (
        <>
        {/* 대상 학급 선택 */}
        <div className="form-group-inline flex-wrap">
          <label>대상 학급 선택</label>
          <div className='w-full'>
            <div className='tab-nav type02'>
              <button type="button" className={`${selectedTargetType === TargetType.Grade ? ' active' : ''}`} onClick={() => handleChangeTargetType(TargetType.Grade)}>학년별</button>
              <button type="button" className={`${selectedTargetType === TargetType.Class ? ' active' : ''}`} onClick={() => handleChangeTargetType(TargetType.Class)}>학급별</button>
            </div>
            {selectedTargetType === TargetType.Grade ? (
              <div className="tab-con p-4">
                <div className='gray-box flex gap-x-6 gap-y-1 !flex-wrap !p-6 !mt-0'>
                  {targetGradeOptions.map((gradeOption) => (
                    <div key={gradeOption.value} className="form-ctr">
                      <input
                        type="checkbox"
                        id={`grade-${gradeOption.value}`}
                        checked={selectedGrades.includes(gradeOption.value)}
                        onChange={() => handleClickGradeOption(gradeOption.value)}
                      />
                      <label htmlFor={`grade-${gradeOption.value}`}>
                        <span className='w-18'>{gradeOption.value === 'ALL' ? gradeOption.title : `${gradeOption.title}학년`}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="tab-con p-4">
                <div className='gray-box !p-6 flex !flex-col gap-2 !mt-0'>
                  {targetClassOptions.map(({ value: grade, classes }) => (
                    <div key={grade} className='flex gap-x-6 gap-y-1 flex-wrap'>
                      {classes.map((c) => (
                        <div key={c.value} className="form-ctr">
                          <input
                            type="checkbox"
                            id={`class-${c.value}`}
                            checked={selectedClasses.includes(c.value)}
                            onChange={() => handleClickClassOption(c.value)}
                          />
                          <label htmlFor={`class-${c.value}`}><span className='w-18'>{c.title}</span></label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div> 
      </>
      )}

      {/* 적용 날짜 */}
      <div className="form-group-inline a-start">
        <label className="sm mt-2">적용 날짜</label>
        {selectedLessonChangeType === TimetableDailyLessonChangeType.Event || selectedLessonChangeType === TimetableDailyLessonChangeType.Removal ? (
        <div>
          <div className="flex gap-1 items-center">
            <div className="form-ctr mr-1">
              <input type="radio" id="dateType-half" name="dateType-half" checked={periodCheckboxChecked} onChange={() => handleClickPeriodCheckbox(true)} />
              <label htmlFor="dateType-half"><span>반일</span></label>
            </div>
            <DatetimePicker
              timestamp={TimeUtils.getNumberToTimestamp(selectedSourceDate)}
              onChange={closedTimestamp => handleChangeSourceDate(closedTimestamp)}
              formatter={formatExpirationDate}
              allowPast={isEventOrDuplication}
              calendar={sourceCalendarRef}
              onBeforeSelect={selected => handleBeforeSelectDate(selected, sourceCalendarRef.current)}
              withTime={false}
              isShowPrevMonth={isEventOrDuplication}
              isPlaned={!!selectedTimetable && TimeUtils.getTodayAsNumber() < selectedTimetable?.operationStartDate}
              operationStartDate={selectedTimetable?.operationStartDate}
              operationEndDate={selectedTimetable?.operationEndDate}
              disabled={!periodCheckboxChecked}
              autoApply={true}
            />
            <div>
              <HiSelectBox
                value={selectedSourceStartPeriod}
                items={periodOptions}
                onChange={setSelectedSourceStartPeriod}
                style={{ width: 100 }}
                emptyTitle={"선택"}
                disabled={!periodCheckboxChecked}
              />
              <span className='ml-1 mr-1'> ~ </span>
              <HiSelectBox
                value={selectedSourceEndPeriod}
                items={periodOptions.filter(p => p.value >= selectedSourceStartPeriod)}
                onChange={setSelectedSourceEndPeriod}
                style={{ width: 100 }}
                emptyTitle={"선택"}
                disabled={!periodCheckboxChecked}
              />
            </div>
          </div>
          <div className="flex gap-1 items-center mt-2">
            <div className="form-ctr mr-1">
              <input type="radio" id="dateType-period" name="dateType-period" checked={!periodCheckboxChecked} onChange={() => handleClickPeriodCheckbox(false)} />
              <label htmlFor="dateType-period"><span>종일</span></label>
            </div>
            <div>
              <DatetimePicker
                timestamp={TimeUtils.getNumberToTimestamp(selectedSourceDate)}
                onChange={closedTimestamp => handleChangeSourceDate(closedTimestamp)}
                formatter={formatExpirationDate}
                allowPast={isEventOrDuplication}
                calendar={sourceCalendarRef}
                onBeforeSelect={selected => handleBeforeSelectDate(selected, sourceCalendarRef.current)}
                withTime={false}
                isShowPrevMonth={isEventOrDuplication}
                isPlaned={!!selectedTimetable && TimeUtils.getTodayAsNumber() < selectedTimetable?.operationStartDate}
                operationStartDate={selectedTimetable?.operationStartDate}
                operationEndDate={selectedTimetable?.operationEndDate}
                disabled={periodCheckboxChecked}
                autoApply={true}
              />
            </div>
          </div>
        </div>
        ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center flex-wrap">
            <div style={{position: 'relative'}} className='flex'>
              <div className="form-group-inline !gap-2">           
                <DatetimePicker
                  timestamp={TimeUtils.getNumberToTimestamp(selectedSourceDate)}
                  onChange={closedTimestamp => handleChangeSourceDate(closedTimestamp)}
                  formatter={formatExpirationDate}
                  allowPast={isEventOrDuplication}
                  calendar={sourceCalendarRef}
                  onBeforeSelect={selected => handleBeforeSelectDate(selected, sourceCalendarRef.current)}
                  withTime={false}
                  isShowPrevMonth={isEventOrDuplication}
                  isPlaned={!!selectedTimetable && TimeUtils.getTodayAsNumber() < selectedTimetable?.operationStartDate}
                  operationStartDate={selectedTimetable?.operationStartDate}
                  operationEndDate={selectedTimetable?.operationEndDate}
                  autoApply={true}
                />            
                <div className="form-ctr ml-2 mr-1">
                  <input
                    type="checkbox"
                    id="period-checkbox"
                    checked={periodCheckboxChecked}
                    onChange={e => handleClickPeriodCheckbox(e.target.checked)}
                  />
                  <label htmlFor="period-checkbox"><span>교시</span></label>
                </div>
                <div>
                  <HiSelectBox
                    value={selectedSourceStartPeriod}
                    items={periodOptions}
                    onChange={setSelectedSourceStartPeriod}
                    style={{ width: 100 }}
                    emptyTitle={"선택"}
                    disabled={!periodCheckboxChecked}
                  />
                  <span className='ml-1 mr-1'> ~ </span>
                  <HiSelectBox
                    value={selectedSourceEndPeriod}
                    items={periodOptions.filter(p => p.value >= selectedSourceStartPeriod)}
                    onChange={setSelectedSourceEndPeriod}
                    style={{ width: 100 }}
                    emptyTitle={"선택"}
                    disabled={!periodCheckboxChecked}
                  />
                </div>
              </div>
              <i className="ico ico-exchange-chain ico-primary ico-size-36 ml-2 mr-2" />
            </div>
            {selectedLessonChangeType !== TimetableDailyLessonChangeType.InternalSwap && (
              <>              
              <div className="form-group-inline !gap-2">
                <DatetimePicker
                  timestamp={!!selectedTargetDate ? TimeUtils.getNumberToTimestamp(selectedTargetDate) : null}
                  onChange={closedTimestamp => handleChangeTargetDate(closedTimestamp)}
                  formatter={formatExpirationDate}
                  allowPast={false}
                  calendar={targetCalendarRef}
                  onBeforeSelect={selected => handleBeforeSelectTargetDate(selected, targetCalendarRef.current)}
                  withTime={false}
                  isShowPrevMonth={false}
                  isPlaned={!!selectedTimetable && TimeUtils.getTodayAsNumber() < selectedTimetable?.operationStartDate}
                  operationStartDate={selectedTimetable?.operationStartDate}
                  operationEndDate={selectedTimetable?.operationEndDate}
                  emptyLabel={"선택"}
                  defaultToToday={false}
                  autoApply={true}
                />
                <HiSelectBox
                  value={selectedTargetStartPeriod}
                  items={periodOptions}
                  onChange={setSelectedTargetStartPeriod}
                  style={{ width: 100 }}
                  emptyTitle={"선택"}                
                  disabled={!periodCheckboxChecked}
                /> 부터 적용
              </div>
              </>
            )}
          </div>
          {/* {
            [TimetableDailyLessonChangeType.Duplication, TimetableDailyLessonChangeType.Reassignment].includes(selectedLessonChangeType) && 
            <span className='text-neutral-stronger'>*선택한 날짜의 기초 시간표를 기준으로 반영합니다.</span>
          } */}
        </div>
        )}
      </div>  

      {/* 행사명 */}
      {changeType === ClassScheduleChangeType.Event && (
        <div className="form-group-inline">
        <label>행사명</label>
        <HiInput type="text" placeholder="행사명 입력 (최대 10자)" maxLength={10} value={eventName} onChange={e => setEventName(e.target.value)} wrapStyle={{ width: 400 }} spellCheck={false}/>
      </div>
      )}

      {/* 변경 사유 */}
      <div className="form-group-inline">
        <label>변경 사유</label>
        <HiInput wrapClass='w-full placeholder:text-md' type="text" placeholder="선택사항 (최대 50자)" maxLength={50} value={reason} onChange={e => setReason(e.target.value)}  spellCheck={false}/>
      </div>
    </SideModal>
  );
};

export default ChangeClassScheduleModal;