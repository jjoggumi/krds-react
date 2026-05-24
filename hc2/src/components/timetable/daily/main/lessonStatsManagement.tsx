import HiModal from '@/components/uiux/hiModal';
import styles from './lessonStatsManagement.module.scss';
import HiTooltip from "@/components/uiux/hiTooltip";
import SideModal from "@/components/uiux/sideModal";
import { useState } from 'react';
import HiSelectBox from '@/components/uiux/hiSelectBox';
import LessonStatsDetailModal from '../components/lessonStatsDetailModal';
import LessonStatsCountModal from '../components/lessonStatsCountModal';
import { HiButton } from '@/components/uiux/hiButton';

// 학년, 학급 임의 데이터( 전체시간표탭 : 학급일정변경모달에서 학년, 반 사용 / 시수누계관리탭에서 학년 사용/ )
const gradeClassData = [
  { value: '1', label: '1학년', classes: ['1-1', '1-2', '1-3'] },
  { value: '2', label: '2학년', classes: ['2-1', '2-2'] },
  { value: '3', label: '3학년', classes: ['3-1', '3-2', '3-3'] },
];


interface LessonStatsManagementProps {}
//시수 누계 관리 탭
const LessonStatsManagement: React.FC<LessonStatsManagementProps> = () => {
  const grades = [ { value: 'all', label: '전체' }, ...gradeClassData.map(g => ({ value: g.value, label: g.label })) ];

  const dateOptions = ['3/2~3/8','3/9~3/15','3/16~3/22','3/23~3/29','3/30~4/5','4/6~4/12','4/13~4/19','4/20~4/26','4/27~5/3','5/4~5/10','5/11~5/17','5/18~5/24','5/25~5/31','6/1~6/7','6/8~6/14','6/15~6/21','6/22~6/28','6/29~7/5','7/6~7/12','7/13~7/19'];

  const [checkedDates, setCheckedDates] = useState<string[]>(['전체']);
  const allChecked = checkedDates.length === dateOptions.length;
  const classLabels = ['1반', '2반', '3반', '4반', '5반', '6반', '7반', '8반', '9반', '10반'];
  const [selectedGrades, setSelectedGrades] = useState(['all']); // 학년 선택

  const handleAllCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setCheckedDates([...dateOptions]);
    else setCheckedDates([]);
  };

  const handleDateCheck = (date: string, checked: boolean) => {
    setCheckedDates(prev =>
      checked ? [...prev, date] : prev.filter(d => d !== date)
    );
  };

  const [LessonStatsDetailModalIsOpen, setLessonStatsDetailModalIsOpen] = useState(false);  // 시수누계 상세 모달 상태
  const [LessonStatsCountModalIsOpen, setLessonStatsCountModalIsOpen] = useState(false);  // 학점당 수업 횟수 변경 모달 상태
  const [gradeCounts, setGradeCounts] = useState<{ [key: number]: number }>({
    1: 16,
    2: 17,
    3: 17,
  });

  return (
    <div className={styles.lessonStatsManagement}>
      <div className="table-head mt-5">
        <div className="form-group-inline">
          <label>일정 변경 선택</label>
          {grades.map((type) => (
            <div className="form-ctr" key={type.value}>
              <input
                type="radio"
                name="scheduleType"
                id={`scheduleType-${type.value}`}
                checked={selectedGrades.includes(type.value)}
                onChange={() => setSelectedGrades([type.value])}
              />
              <label htmlFor={`scheduleType-${type.value}`}>
                <span>{type.label}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="btn-area gap-2">
          <HiButton type="button" variant="tertiaryBlue"  onClick={() => setLessonStatsCountModalIsOpen(true)} style={{ cursor: 'pointer' }}>학점당 수업 횟수 변경</HiButton>
          <HiButton type="button" variant="tertiary">엑셀 다운로드</HiButton>
          <HiButton type="button" variant="tertiary">수업 변경</HiButton>
        </div>
      </div>
      <div className="tb-row">
        <div className="table-content basic-table table-box sticky-wrap custom-scr date-check">
          <table>
            <caption>날짜선택</caption>
            <colgroup>
              <col style={{ width: '40px' }} />
              <col style={{ width: '40px' }} />
              <col style={{ width: 'auto' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="sticky-top"></th>
                <th className="sticky-top text-left">주</th>
                <th className="sticky-top text-left">기간 선택</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='pl-4'>
                  <input
                    type="checkbox"
                    id="date-all"
                    checked={allChecked}
                    onChange={handleAllCheck}
                  />
                  <label htmlFor="date-all"></label>
                </td>
                <td className="!text-left" colSpan={2}>전체</td>
              </tr>
              {dateOptions.map((date, idx) => (
                <tr key={date}>
                  <td className='pl-4'>
                    <input
                      type="checkbox"
                      id={`date-${date}`}
                      checked={checkedDates.includes(date)}
                      onChange={e => handleDateCheck(date, e.target.checked)}
                    />
                    <label htmlFor={`date-${date}`}></label>
                  </td>
                  <td>{idx + 1}</td>
                  <td className="!text-left">{date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-content table-box custom-scr">
          <table>
            <thead>
              <tr>
                <th>과목명<br/><small>(시수/계획)</small></th>
                {classLabels.map(label => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => setLessonStatsDetailModalIsOpen(true)} style={{ cursor: 'pointer' }}>
                <td>국어<span className="text-neutral-strong">(4/68)</span></td>
                <td><span>12/12/68</span> </td>
                <td><span>12/12/68</span> </td>
                <td>
                  <HiTooltip position='center-bottom'
                  titleHtml="기간계/누계/계획 입니다. <br />빨간색은 시수 부족 표시입니다." >
                    <span className='text-graphic-red'>11/11/67</span>
                  </HiTooltip>
                </td>
                <td><span>12/12/68</span> </td>
                <td><span>12/12/68</span> </td>
                <td><span>12/12/68</span> </td>
                <td><span>12/12/68</span> </td>
                <td><span>12/12/68</span> </td>
                <td><span>12/12/68</span> </td>
                <td><span>12/12/68</span> </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <LessonStatsDetailModal isOpen={LessonStatsDetailModalIsOpen} setIsOpen={setLessonStatsDetailModalIsOpen} />
      <LessonStatsCountModal
        isOpen={LessonStatsCountModalIsOpen}
        setIsOpen={setLessonStatsCountModalIsOpen}
        gradeCounts={gradeCounts}
        setGradeCounts={setGradeCounts}
      />
    </div>
  );
};

export default LessonStatsManagement;
