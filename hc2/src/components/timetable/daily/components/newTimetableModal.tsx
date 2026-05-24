import { useEffect, useMemo, useRef, useState } from "react";
import { TimeUtils } from "../../common/utils";
import { showToast } from "@/unimplementeds/toast";
import { ShowAlert, ShowConfirm } from "@/components/uiux/modal";
import { Hc2Timetables } from "../../apis";
import { TimetableIndex } from "../../core/types";
import { HiModal } from "@/components/uiux/hiModal";
import { HiInput } from '@/components/uiux';
import styles from "./newTimetableModal.module.scss"
import { DatetimePicker } from "../../components/datetimePicker";
import { HiButton } from "@/components/uiux/hiButton";

// 새 시간표 생성 모달
interface NewTimetableModalProps {
  schoolId: string;
  selectedTimetable: TimetableIndex | null;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  emitTimetable: ((timetable: TimetableIndex) => void);
}

enum TimetableAlertType {
  overlappingPeriodError = 'overlappingPeriodError',
  operationDateChangeConfirm = 'operationDateChangeConfirm',
  etc = 'etc',
}

const NewTimetableModal: React.FC<NewTimetableModalProps> = ({ schoolId, selectedTimetable, isOpen, setIsOpen, emitTimetable }) => {

  const alertMsgMap = {
    [TimetableAlertType.overlappingPeriodError]: '운영 기간이 겹치는 다른 시간표가 있습니다.\n기간 수정 후 다시 시도해주세요.',
    [TimetableAlertType.operationDateChangeConfirm]: '운영 기간이 변경되었습니다. 적용하시겠습니까?\n운영 기간을 변경할 경우 전체 시간표 및 시수 누계가 변경됩니다.',
    [TimetableAlertType.etc]: '오류가 발생했습니다. 다시 시도해주세요.',
  };

  // === States ===
  const [ timetableName, setTimetableName ] = useState<string>('');
  const [ selectedStartDate, setSelectedStartDate ] = useState<number | null>(null);
  const [ selectedEndDate, setSelectedEndDate ] = useState<number | null>(null);
  const [ isNameDuplicated, setIsNameDuplicated ] = useState<boolean>(false);
  const [ showNameEmptyErr, setShowNameEmptyErr ] = useState<boolean>(false);
  const [ showStartDateEmptyErr, setShowStartDateEmptyErr ] = useState<boolean>(false);
  const [ showEndDateEmptyErr, setShowEndDateEmptyErr ] = useState<boolean>(false);

  // === Utils for date handling ===
  const sourceCalendarRef = useRef(null);
  const targetCalendarRef = useRef(null);

  const handleBeforeSelectStartDate = (date, calendar) => {
    // console.log('handleBeforeSelectStartDate', date, calendar);
    // const paramDate = new Date(date);
    // const paramDateNum = TimeUtils.getDateAsNumber(paramDate);

    // if (!!selectedEndDate && paramDateNum > selectedEndDate) {
    //   showToast('종료 날짜보다 미래 날짜를 선택할 수 없습니다.', 3000);
    //   const today = new Date();
    //   calendar?.setSelectedTimestamps([today.getTime()]);
    //   return false;
    // }
    return true;
  };

  const handleBeforeSelectEndDate = (date, calendar) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);

    if (!!selectedStartDate && paramDateNum < selectedStartDate) {
      showToast('시작 날짜보다 과거 날짜를 선택할 수 없습니다.', 3000);
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

  // === UseMemos ===
  const isClickableToCreate = useMemo(() => {
    return !(!!timetableName && !!selectedStartDate && !!selectedEndDate && !isNameDuplicated);
  }, [timetableName, selectedStartDate, selectedEndDate, isNameDuplicated]);

  const isEditMode = useMemo(() => {
    return !!selectedTimetable;
  }, [selectedTimetable]);

  const isExpired = useMemo(() => {
    if (!selectedTimetable) return false;

    const today = TimeUtils.getTodayAsNumber();
    if (selectedTimetable.operationEndDate < today) return true;

    return false;
  }, [selectedTimetable]);

  const isPlaned = useMemo(() => {
    if (!selectedTimetable) return false;

    const today = TimeUtils.getTodayAsNumber();
    if (selectedTimetable.operationStartDate > today) return true;

    return false;
  }, [selectedTimetable]);

  // === API ===
  const handleClickSaveTimetable = async () => {
    // const isNameValid = await checkTimetableName(timetableName);
    // if (!isNameValid) return;

    await (isEditMode ? handleClickUpdateTimetable : handleClickCreateTimetable)();
  };

  const handleClickUpdateTimetable = async () => {
    if (!schoolId || !selectedTimetable || !timetableName || !selectedStartDate || !selectedEndDate) return;

    const { timetableId, operationStartDate, operationEndDate } = selectedTimetable;

    if ((operationEndDate !== selectedEndDate) || (operationStartDate !== selectedStartDate)) {
      const confirmResult = await ShowConfirm(alertMsgMap[TimetableAlertType.operationDateChangeConfirm], { confirmLabel: '확인', reverse: true, className: 'time-table-alert' });
      if (!confirmResult) return;
    }

    const api = new Hc2Timetables();
    const payload = {
      timetableName: timetableName,
      schoolId,
      operationStartDate: selectedStartDate,
      operationEndDate: selectedEndDate
    };

    try {
      const res = await api.updateTimetableIndex(timetableId, payload);
      const timetable = res.data as TimetableIndex;

      emitTimetable(timetable);
      close();
    } catch (error) {
      console.error("Error updating timetable:", error);
      const errorCode = error?.response?.data?.error;

      if (errorCode !== undefined && errorCode !== null && !!alertMsgMap[errorCode]) {
        // showToast(errMsgMap[errorCode], 3000);
        await ShowAlert(alertMsgMap[errorCode]);
      } else {
        await ShowAlert(alertMsgMap[TimetableAlertType.etc]);
      }
      return;
    }
  };

  const handleClickCreateTimetable = async () => {
    if (!schoolId || !timetableName || !selectedStartDate || !selectedEndDate) {
      setShowNameEmptyErr(!timetableName || timetableName.trim() === '');
      setShowStartDateEmptyErr(!selectedStartDate);
      setShowEndDateEmptyErr(!selectedEndDate);
      return;
    }

    const api = new Hc2Timetables();
    const payload = {
      schoolId,
      timetableName: timetableName,
      operationStartDate: selectedStartDate,
      operationEndDate: selectedEndDate,
    };

    try {
      const res = await api.createTimetableIndex(payload);
      const timetable = res.data as TimetableIndex;
      emitTimetable(timetable);
      close();
    } catch (error) {
      console.error("Error creating timetable:", error);
      const errorCode = error?.response?.data?.error;

      if (errorCode !== undefined && errorCode !== null && !!alertMsgMap[errorCode]) {
        await ShowAlert(alertMsgMap[errorCode]);
      } else {
        await ShowAlert(alertMsgMap[TimetableAlertType.etc]);
      }
      return;
    }
  };

  const checkTimetableName = async (timetableName: string) => {
    if (!timetableName || timetableName.trim() === '') {
      setIsNameDuplicated(false);
      setTimetableName('');
      return false;
    }

    const api = new Hc2Timetables();
    const payload = {
      schoolId,
      timetableName,
      ...(isEditMode && !!selectedTimetable ? { timetableId: selectedTimetable.timetableId } : {})
    };

    try {
      const res = await api.checkTimetableNameDuplicate(payload);
      const { hasSameName } = res.data as { hasSameName: boolean };
      setIsNameDuplicated(hasSameName);
      setTimetableName(prev => (hasSameName ? prev : timetableName));
      return !hasSameName;
    } catch (error) {
      console.error("Error checking timetable name duplicate:", error);
      return false;
    }
  };

  // === Methods ===
  const close = () => setIsOpen(false);

  const handleChangeStartDate = (closedTimestamp: number) => {
    if (closedTimestamp === 0) return;
    const startDate = TimeUtils.getTimestampToNumber(closedTimestamp);
    setSelectedEndDate(prev => startDate > prev ? null : prev);
    setShowStartDateEmptyErr(false);
    setSelectedStartDate(startDate);
  };

  const handleChangeTargetDate = (closedTimestamp: number) => {
    if (closedTimestamp === 0) return;
    setShowEndDateEmptyErr(false);
    setSelectedEndDate(TimeUtils.getTimestampToNumber(closedTimestamp));
  };

  const resetAllStates = () => {
    setTimetableName('');
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsNameDuplicated(false);
    setShowNameEmptyErr(false);
    setShowStartDateEmptyErr(false);
    setShowEndDateEmptyErr(false);
  };

  // === UseEffects ===
  useEffect(() => {
    return () => resetAllStates();
  }, []);

  useEffect(() => {
    resetAllStates();

    if (!!selectedTimetable) {
      setTimetableName(selectedTimetable.timetableName);
      setSelectedStartDate(selectedTimetable.operationStartDate);
      setSelectedEndDate(selectedTimetable.operationEndDate);
    }
  }, [isOpen]);

  return (
    <HiModal
      isOpen={isOpen}
      onClose={close}
      size="lg"
      heading={isEditMode ?'시간표 수정하기' : '새 전체 시간표 만들기'}
      desc={'한 학기 동안 운영할 시간표의 이름 및 운영 기간을 설정해 주세요.'}
      className={styles.newTimetableModal}
      modalLayerStyle={{height: '688px'}}
      content={
        <>
          <div className='gray-box pt-20 pb-20 pr-24 pl-24'>
            <div className="h5-tit mb-4">
              <h5>1. 전체 시간표 이름 설정하기</h5>
              <div className="smr">
                운영할 전체 시간표의 이름을 설정해주세요.
              </div>
            </div>
            <div className="form-ctr">
              <HiInput
                type="text"
                placeholder="이름을 입력하세요 (예: 하이중학교 2026년 1학기 시간표)"
                min="0"
                state={(isNameDuplicated || showNameEmptyErr) ? 'error' : undefined}
                message={isNameDuplicated ? '동일한 시간표 이름이 존재합니다.' : '시간표명을 입력해 주세요.'}
                maxLength={50}
                value={timetableName}
                onChange={e => {
                  if (e.target.value.trim() !== '') setShowNameEmptyErr(false);
                  setIsNameDuplicated(false);
                  setTimetableName(e.target.value)
                }}
                onBlur={e => checkTimetableName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
                spellCheck={false}
              />
            </div>
          </div>
          <div className='gray-box pt-20 pb-20 pr-24 pl-24'>
            <div className="h5-tit mb-4">
              <h5>2. 전체 시간표 운영 기간 설정하기</h5>
              <div className="smr">
                운영할 전체 시간표의 시작일과 종료일을 설정해주세요.
              </div>
            </div>
            <div className="form-group-inline pb-5">
              <div>
                <DatetimePicker
                  timestamp={!!selectedStartDate ? TimeUtils.getNumberToTimestamp(selectedStartDate) : null}
                  onChange={closedTimestamp => handleChangeStartDate(closedTimestamp)}
                  formatter={formatExpirationDate}
                  allowPast={false}
                  calendar={sourceCalendarRef}
                  onBeforeSelect={selected => handleBeforeSelectStartDate(selected, sourceCalendarRef)}
                  withTime={false}
                  emptyLabel={"날짜 선택"}
                  autoApply // 하단 확인 취소 버튼 없이 자동 선택
                  disableTodayButton  // 오늘 클릭버튼 안보이게
                  disabled={isPlaned ? false : isEditMode}        
                  errorLabel={showStartDateEmptyErr ? "날짜를 선택하세요" : null}
                />
                <span className='ml-1 mr-1'> ~ </span>
                <DatetimePicker
                  timestamp={!!selectedEndDate ? TimeUtils.getNumberToTimestamp(selectedEndDate) : null}
                  onChange={closedTimestamp => handleChangeTargetDate(closedTimestamp)}
                  formatter={formatExpirationDate}
                  allowPast={false}
                  calendar={targetCalendarRef}
                  onBeforeSelect={selected => handleBeforeSelectEndDate(selected, targetCalendarRef)}
                  withTime={false}
                  emptyLabel={"날짜 선택"}
                  autoApply // 하단 확인 취소 버튼 없이 자동 선택
                  disableTodayButton  // 오늘 클릭버튼 안보이게
                  disabled={isExpired}     
                  errorLabel={showEndDateEmptyErr ? "날짜를 선택하세요" : null}
                />
              </div>
            </div>
          </div>
        </>
      }
      footer={
        <>
          <HiButton
            type="button"
            variant="tertiary"
            onClick={close}
          >취소</HiButton>
          <HiButton
            type="button"
            variant="primary"
            onClick={handleClickSaveTimetable}
          >확인</HiButton>
        </>
      }
      dimClose={true}
    />
  );
}
export default NewTimetableModal;