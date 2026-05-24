
import { HiButton } from "@/components/uiux/hiButton";
import SideModal from "@/components/uiux/sideModal";

// 시수 누계 테이블 상세 모달
interface LessonStatsDetailModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const LessonStatsDetailModal: React.FC<LessonStatsDetailModalProps> = ({ isOpen, setIsOpen }) => {
  const close = () => setIsOpen(false);

  return (
    <SideModal
      isOpen={isOpen}
      onClose={close}
      size="md"
      className={styles.lessonStatsDetailModal}
      heading={'상세내용(1-2 국어)'}
    >
      <div className='form-group-inline'>
        <label>과목 담당</label>
        <div className="form-ctr">
          박무영 선생님
          <HiButton variant="tertiaryBlue" size="sm" className="ml-2 mr-2">하이톡 보내기</HiButton>
          <HiButton variant="tertiaryBlue" size="sm" >수업 변경</HiButton>
        </div>
      </div>
      <div className='form-group-inline mt-0'>
        <label>시수 누계</label>
        <div className="form-ctr">          
          <span className="text-graphic-red">박무영 선생님 </span>
          <span className="text-neutral-strong ml-1">(25.3.2~25.3.22) </span>
        </div>
      </div>
      <div className='form-group-inline mt-0'>
        <label>수업변경 내역</label>
      </div>
      <div className='table-content table-view gray-box custom-scr mt-2' style={{ maxHeight: 'calc(100% - 120px)' }}>
        <table>
          <caption>수업변경 내역</caption>
          <colgroup>
          <col style={{ width: '120px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: 'auto' }} />
          </colgroup>
          <tbody>
            <tr>
              <td className='text-center'>3/2(월) 3교시</td>
              <td className='text-center'>수업교체</td>
              <td>교체된 사유를 작성하는 부분 내용은 오십자까지 표시하면됨 교체된 사유를 작성하는 부분 내용</td>
            </tr>
            <tr>
              <td className='text-center'>3/9(월) 3교시</td>
              <td className='text-center'>일정변경<br/>(행사처리)</td>
              <td>수학 여행</td>
            </tr>
            <tr>
              <td className='text-center'>3/3(수) 2교시</td>
              <td className='text-center'>수업교체</td>
              <td>출장</td>
            </tr>
            <tr>
              <td className='text-center'>3/2(월) 3교시</td>
              <td className='text-center'>수업교체</td>
              <td>교체된 사유를 작성하는 부분 내용은 오십자까지 표시하면됨 교체된 사유를 작성하는 부분 내용</td>
            </tr>
            <tr>
              <td className='text-center'>3/9(월) 3교시</td>
              <td className='text-center'>일정변경<br/>(행사처리)</td>
              <td>수학 여행</td>
            </tr>
            <tr>
              <td className='text-center'>3/3(수) 2교시</td>
              <td className='text-center'>수업교체</td>
              <td>출장</td>
            </tr>
            <tr>
              <td className='text-center'>3/2(월) 3교시</td>
              <td className='text-center'>수업교체</td>
              <td>교체된 사유를 작성하는 부분 내용은 오십자까지 표시하면됨 교체된 사유를 작성하는 부분 내용</td>
            </tr> 
          </tbody>
        </table>
      </div>    
    </SideModal>
    
  );
};

export default LessonStatsDetailModal;