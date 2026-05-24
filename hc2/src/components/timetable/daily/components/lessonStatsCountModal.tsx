import { HiButton } from "@/components/uiux/hiButton";
import HiModal from "@/components/uiux/hiModal";
import HiSelectBox from "@/components/uiux/hiSelectBox";

// 학점당 수업 횟수 변경 모달
interface LessonStatsCountModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gradeCounts: { [key: number]: number };
  setGradeCounts: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
}
const LessonStatsCountModal: React.FC<LessonStatsCountModalProps> = ({ isOpen, setIsOpen, gradeCounts, setGradeCounts }) => {
  const close = () => setIsOpen(false);
  return (
    <HiModal
      isOpen={isOpen}
      onClose={close}
      size="sm"
      heading={<span>학점당 수업 횟수 변경</span>}
      desc={<span>한 학기 동안의 각 학년별 수업 횟수를 수정할 수 있습니다.<br/>수정 시 계획 시수가 자동으로 변경됩니다.</span>}
      content={
        <div>
          {[1, 2, 3].map(grade => (
            <div key={grade} className='form-group-inline'>
              <label>{grade}학년</label>
              <HiSelectBox
                style={{ width: 140 }}
                value={gradeCounts[grade]}
                items={Array.from({ length: 20 }, (_, i) => ({ value: i + 1, title: String(i + 1) }))}
                onChange={val => setGradeCounts({ ...gradeCounts, [grade]: Number(val) })}
              />
            </div>
          ))}
        </div>
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
            onClick={() => {
              close();
            }}
          >확인</HiButton>
        </>
      }
      dimClose={true}
    />
  );
}

export default LessonStatsCountModal;