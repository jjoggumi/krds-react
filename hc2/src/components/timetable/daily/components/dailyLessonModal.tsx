import { FC, useEffect, useMemo, useState } from "react";
import { DailyLesson, TimetableDailyLessonChangeType, TimetableIndex } from "../../core/types";
import styles from "./dailyLessonModal.module.scss";
import SideModal from '../../../uiux/sideModal';
// import SideModal from "@/components/uiux/sideModal";
import ChangeLessonExchange from "../changelesson/exchange";
import ChangeLessonReplacement from '../changelesson/replacement';
import ChangeLessonAdjustment from '../changelesson/adjustment';
import ChangeLessonAddition from '../changelesson/addition';
import ChangeLessonCombination from '../changelesson/combination';
import ChangeLessonMultiple from '../changelesson/multiple';


export interface TimetableDailyLessonModalOptions {
  dailyLesson: DailyLesson;
  teacherId: string;
  lessonDate: number;
  period: number;
  classId?: string;
}

// 전체 시간표 탭 내 수업변경 사이드 모달
interface DailyLessonsModalProps {
  selectedTimetable?: TimetableIndex | null;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLessonChangeType: TimetableDailyLessonChangeType;
  setSelectedLessonChangeType: React.Dispatch<React.SetStateAction<TimetableDailyLessonChangeType>>;
  options?: TimetableDailyLessonModalOptions;
  reload?: () => void;
  isManagerView: boolean;
}

interface LessonChangeTypeOption {
  lessonChangeType: TimetableDailyLessonChangeType;
  label: string;
}

// 수업 변경 타입 리스트
/*
const LessonChangeList: LessonChangeTypeOption[] = [
  { lessonChangeType: TimetableDailyLessonChangeType.Exchange, label: '수업 교체' },
  { lessonChangeType: TimetableDailyLessonChangeType.Adjustment, label: '결, 보강' },
  { lessonChangeType: TimetableDailyLessonChangeType.Replacement, label: '수업 변경' },
  { lessonChangeType: TimetableDailyLessonChangeType.Addition, label: '수업 추가' },
  { lessonChangeType: TimetableDailyLessonChangeType.Combination, label: '합반 배정' },
  { lessonChangeType: TimetableDailyLessonChangeType.Multiple, label: '복수교사 배정' },
];
*/


const DailyLessonsModal: FC<DailyLessonsModalProps> = ({
  selectedTimetable,
  isOpen,
  setIsOpen,
  selectedLessonChangeType,
  setSelectedLessonChangeType,
  options,
  reload,
  isManagerView
 }) => {

  const LessonChangeList = useMemo(() => {
    if(isManagerView) {
      return [
        { lessonChangeType: TimetableDailyLessonChangeType.Exchange, label: '수업 교체' },
        { lessonChangeType: TimetableDailyLessonChangeType.Adjustment, label: '결, 보강' },
        { lessonChangeType: TimetableDailyLessonChangeType.Replacement, label: '수업 변경' },
        { lessonChangeType: TimetableDailyLessonChangeType.Addition, label: '수업 추가' },
        { lessonChangeType: TimetableDailyLessonChangeType.Combination, label: '합반 배정' },
        { lessonChangeType: TimetableDailyLessonChangeType.Multiple, label: '복수교사 배정' },
      ] as LessonChangeTypeOption[];
    }

    return [
      { lessonChangeType: TimetableDailyLessonChangeType.Exchange, label: '수업 교체' },
      { lessonChangeType: TimetableDailyLessonChangeType.Adjustment, label: '결, 보강' },
      { lessonChangeType: TimetableDailyLessonChangeType.Replacement, label: '수업 변경' },
      { lessonChangeType: TimetableDailyLessonChangeType.Addition, label: '수업 추가' },
    ] as LessonChangeTypeOption[];
  }, [isManagerView]);

  const [ selectedOptions, setSelectedOptions ] = useState<TimetableDailyLessonModalOptions | null>(null);

  // Vue의 `onMounted`는 React의 `useEffect`로 대체
  useEffect(() => {
    // console.log('TimetableDailyLessons mounted');
    // initialize();
  }, []); // 빈 배열은 컴포넌트가 마운트될 때 한 번만 실행됨

  useEffect(() => {
    setSelectedOptions(options || null);
  }, [options]);

  const close = async () => {
    setIsOpen(false);
    setSelectedOptions(null);
    setSelectedLessonChangeType(TimetableDailyLessonChangeType.Exchange);
    await reload?.();
  };

  const handleLessonChange = (type: TimetableDailyLessonChangeType) => {
    setSelectedOptions(null);
    setSelectedLessonChangeType(type);
  };

  const handleCloseLessonExchange = () => {
    close();
  }

  // 렌더링할 컴포넌트를 조건부로 선택
  const renderContent = () => {    
    switch (selectedLessonChangeType) {
      case TimetableDailyLessonChangeType.Exchange:
        return <ChangeLessonExchange key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />;
      case TimetableDailyLessonChangeType.Adjustment:
        return <ChangeLessonAdjustment key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />;
      case TimetableDailyLessonChangeType.Replacement:
        return <ChangeLessonReplacement key={selectedLessonChangeType} selectedTimetable={selectedTimetable} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />;
      case TimetableDailyLessonChangeType.Addition:
        return <ChangeLessonAddition key={selectedLessonChangeType} selectedTimetable={selectedTimetable} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />;
      case TimetableDailyLessonChangeType.Combination:
        return <ChangeLessonCombination key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />;
      case TimetableDailyLessonChangeType.Multiple:
        return <ChangeLessonMultiple key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />;
      default:
        return null;
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={close}
      size="xl"
      className={styles.lessonChangeSideModal}
      heading="수업 변경"
      desc="전체 시간표에서 선생님의 일정을 변경합니다."
    >
      <div className="form-group-inline">
        <label>수업 변경 선택</label>
        <>
          {LessonChangeList.map((item) => (
            <div className="form-ctr" key={item.lessonChangeType}>
              <input
                type="radio"
                name="courseChange"
                id={item.lessonChangeType}
                value={item.lessonChangeType}
                checked={selectedLessonChangeType === item.lessonChangeType}
                onChange={() => handleLessonChange(item.lessonChangeType)}
              />
              <label htmlFor={item.lessonChangeType}>
                <span>{item.label}</span>
              </label>
            </div>
          ))}
        </>
      </div>
      {/* renderContent() */}
      {selectedLessonChangeType === TimetableDailyLessonChangeType.Exchange && (
        <ChangeLessonExchange key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />)
      }
      {selectedLessonChangeType === TimetableDailyLessonChangeType.Adjustment && (
        <ChangeLessonAdjustment key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />)
      }
      {selectedLessonChangeType === TimetableDailyLessonChangeType.Replacement && (
        <ChangeLessonReplacement key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />)
      }
      {selectedLessonChangeType === TimetableDailyLessonChangeType.Addition && (
        <ChangeLessonAddition key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />)
      }
      {selectedLessonChangeType === TimetableDailyLessonChangeType.Combination && (
        <ChangeLessonCombination key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />)
      }
      {selectedLessonChangeType === TimetableDailyLessonChangeType.Multiple && (
        <ChangeLessonMultiple key={selectedLessonChangeType} selectedTimetable={selectedTimetable} options={selectedOptions} onClose={handleCloseLessonExchange} isManagerView={isManagerView} />)
      }
    </SideModal>
  );
};

export default DailyLessonsModal;