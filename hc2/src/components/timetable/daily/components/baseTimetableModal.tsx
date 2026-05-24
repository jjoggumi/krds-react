import HiSelectBox from "@/components/uiux/hiSelectBox";
import { TimetableIndex, UploadLessonConf } from "../../core/types";
import { useEffect, useMemo, useState } from "react";
import { HiModal } from "@/components/uiux/hiModal";
import { LessonConfUploadButton } from "./lessonConfUploadButton";
import { Icon, Loading, HiInput } from '@/components/uiux';
import { downloadFromUrl } from '@/utils';
import { TimetableCreateRequest } from "../../contexts/timetableGradeContext";
import { CourseBaseTitle } from "../../common/types";
import { HiButton } from "@/components/uiux/hiButton";
import { Download } from 'lucide-react';

export enum BaseTimetableInitType {
  New = 'NEW',
  Import = 'IMPORT',
  Upload = 'UPLOAD'
}

// 시수표 업로드
export interface UploadLessonConfRequest {
  timetableConfig: TimetableCreateRequest
  titles: CourseBaseTitle[]
  teacherNames: string[]
  lessonConfs: UploadLessonConf[]
}


// 기초 시간표 생성 모달
// 기초 시간표 생성 모달
interface BaseTimetableModalProps {
  selectedTimetable: TimetableIndex | null;
  timetables: TimetableIndex[];
  isOpen: boolean;
  isLessonConfUploading: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openBasicTimetable: (timetableName: string, initType: BaseTimetableInitType) => void;
  setUploadLessonConfRequest: React.Dispatch<React.SetStateAction<UploadLessonConfRequest | null>>
}
const BaseTimetableModal: React.FC<BaseTimetableModalProps> = ({ isOpen, setIsOpen, selectedTimetable, timetables, isLessonConfUploading, openBasicTimetable, setUploadLessonConfRequest }) => {
  const close = () => setIsOpen(false);
  // 기초 시간표 생성 방법 옵션
  const createMethods = [
    { value: BaseTimetableInitType.New, label: '새로만들기', smr:'모든 자료를 처음부터 새롭게 입력합니다.' },
    // { value: BaseTimetableInitType.Import, label: '다른 전체 시간표에서 자료 불러오기', smr:'선택한 기초 시간표의 4단계까지의 정보를 불러옵니다.' },
    { value:  BaseTimetableInitType.Upload, label: '시수표 업로드', smr:'시수표 양식(엑셀 파일)을 업로드 합니다.' },
  ];

  // === States ===
  const [ selectedTimetableId, setSelectedTimetableId ] = useState<string>(''); // 불러올 시간표 ID
  const [createMethod, setCreateMethod] = useState<BaseTimetableInitType>(BaseTimetableInitType.New); // 기초 시간표 생성 방법 상태
  const [isNameDuplicated, setIsNameDuplicated] = useState(false); // 이름 중복 여부
  const [showNameEmptyErr, setShowNameEmptyErr] = useState(false); // 이름 미입력 에러
  const [timetableName, setTimetableName] = useState(''); // 입력값 상태

  useEffect(() => {
    setTimetableName('');
    setSelectedTimetableId('');
    setCreateMethod(BaseTimetableInitType.New);
    setIsNameDuplicated(false);
    setShowNameEmptyErr(false);
  }, [isOpen]);

  // === UseMemos ===
  const timetableOptions = useMemo(() => {
    if (!timetables || timetables.length === 0) return [];

    return timetables.map(timetable => ({ value: timetable.timetableId, title: timetable.timetableName }) );
  }, [timetables]);

  // === Methods ===
  const handleCreateTimetableBase = async () => {
    // 이름 입력 체크
    if (!timetableName || timetableName.trim() === '') {
      setShowNameEmptyErr(true);
      setIsNameDuplicated(false);
      return;
    }
    // 중복 체크
    const hasSameName = timetables.some(
      t => t.timetableName === timetableName
    );
    if (hasSameName) {
      setIsNameDuplicated(true);
      setShowNameEmptyErr(false);
      return;
    }
    setIsNameDuplicated(false);
    setShowNameEmptyErr(false);
    openBasicTimetable(timetableName, createMethod);
  };

  const downloadLessonConfUploadForm = () => {
    downloadFromUrl('기초시간표 시수표 양식', 'https://download.hiclass.net/static/document/timetable_lesson_conf_upload_form.xls');
  };

  return (
    <HiModal
      modalLayerStyle={{minHeight: '600px'}}
      isOpen={isOpen}
      onClose={close}
      size="lg"
      heading={'기초 시간표 생성하기'}
      desc={'기초 시간표의 이름을 설정하고 기초 자료 입력 방법을 선택해주세요.'}
      content={
        <>
          {isLessonConfUploading && <Loading variant="timetable" overlay />}          
          <div className='gray-box p-5'>
            <div className="h5-tit mb-4">
              <h5>1. 기초 시간표 이름 입력하기</h5>
            </div>
            <div className="form-ctr">
              <HiInput
                type="text"
                placeholder="이름을 입력하세요 (예: 하이중학교 2026년 1학기 시간표)"
                min="0"
                maxLength={50}
                value={timetableName}
                onChange={e => {
                  setShowNameEmptyErr(false);
                  setIsNameDuplicated(false);
                  setTimetableName(e.target.value);
                }}
                spellCheck={false}
                state={isNameDuplicated || showNameEmptyErr ? 'error' : undefined}
                message={isNameDuplicated ? '동일한 시간표 이름이 존재합니다.' : '시간표명을 입력해 주세요.'}
              />
            </div>
          </div>
          <div className='gray-box p-5'>
            <div className="h5-tit mb-4">
              <h5>2. 시간표 생성 방법을 선택하세요.</h5>
            </div>
            <div className="form-group !gap-4">
              {createMethods.map((type) => (
                <div key={type.value}>
                  <div className="form-ctr">
                    <input
                      type="radio"
                      name="createMethod"
                      id={`createMethod-${type.value}`}
                      checked={createMethod === type.value}
                      onChange={() => setCreateMethod(type.value)}
                    />
                    <label htmlFor={`createMethod-${type.value}`}>
                      <span>{type.label}</span>
                    </label>
                    <span className="desc ml-2">{type.smr}</span>
                  </div>
                  {createMethod === BaseTimetableInitType.Import && type.value === BaseTimetableInitType.Import && (
                    <div className="ml-6 mt-3">
                      <HiSelectBox
                        className=""
                        style={{ width: '320px' }}
                        value={selectedTimetableId}
                        items={timetableOptions}
                        onChange={setSelectedTimetableId}
                        emptyTitle={"Default Type"}
                      />
                    </div>
                  )}
                  {createMethod === BaseTimetableInitType.Upload && type.value === BaseTimetableInitType.Upload && (
                    <div className="ml-6 mt-3 inline-flex flex-wrap gap-2 items-center">
                      <HiButton type="button" variant="tertiaryBlue" style={{ minWidth: '130px' }} onClick={downloadLessonConfUploadForm}>
                        <Download color="var(--text-primary-base)" size="18" />
                        양식 다운로드
                      </HiButton>
                      <LessonConfUploadButton setUploadLessonConfRequest={setUploadLessonConfRequest} />
                    </div>
                  )}
                </div>
              ))}
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
            onClick={() => handleCreateTimetableBase()}
          >확인</HiButton>
        </>
      }
      dimClose={true}
    />
  );
}


export default BaseTimetableModal;