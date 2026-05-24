import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
// import Item from '@/components/Profile/List/Item.vue'; // Not needed in React version
//import './templateListModal.module.scss'; // Assuming styles are moved to a CSS module
import { Hc2Timetables } from '../../apis';
import { EmbeddedListResponse } from '../../common/types';
import { TimetableStatus } from '../../core/types';
import HiModal from '@/components/uiux/hiModal';
import { TimeUtils } from '../../common/utils';
import { ShowConfirm } from '@/components/uiux/modal';
import styles from './templateListModal.module.scss';
import { HiInput} from '@/components/uiux';
import { HiButton } from '@/components/uiux/hiButton';
import { Pencil } from 'lucide-react';
interface TemplateListProps {
  onCancel: () => void;
  onMove: (id: string, status: TimetableStatus) => void;
  isOpen?: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedTimetableId?: string;
}

interface TimetableBasicTemplate {
  templateId: string;
  templateName?: string;
  status?: TimetableStatus;
  insertedTimestamp?: number;
  updatedTimestamp?: number;
  updatedUserName?: string;  
}

const TemplateListModal: React.FC<TemplateListProps> = ({ 
  onCancel, 
  onMove,
  isOpen,
  setIsOpen,
  selectedTimetableId
}) => {

  const [selectedTemplateId, setSelectedLessonHistoryId] = useState<string>('');
  const [list, setList] = useState<TimetableBasicTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [editingId, setEditingId] = useState<string>('');
  const [editingText, setEditingText] = useState<string>('');

  const initData = async () => {
    await fetchTemplates();
  }

  const resetData = () => {
    setList([]);
    setIsLoading(false);
    setHasLoaded(false);
    setEditingId('');
    setEditingText('');
  }

  useEffect(() => {
    if(isOpen && selectedTimetableId) {
      initData();
      return;
    }

    resetData();
  }, [selectedTimetableId, isOpen]);


  const updateTemplateName = async (templateId: string, newName: string) => {
    if(!selectedTimetableId || !templateId) return;

    const api = new Hc2Timetables();
    try {

      const { updateTimetableBasicTemplateNameName } = api;
      await updateTimetableBasicTemplateNameName(selectedTimetableId, templateId, { templateName: newName });

      // 이름 변경 후 템플릿 목록을 다시 불러온다.
      await fetchTemplates();
    } catch (error) {
      console.error('Failed to update template name:', error);
    }
  }

  const handleEditInputStop = async (index: number, item: TimetableBasicTemplate) => {
    
    if(editingText.trim().length > 0 || editingId === item.templateId) {
      await updateTemplateName(editingId, editingText);
    }

    setEditingId('');
    setEditingText('');
  };

  const handleClickEdit = (index: number, item: TimetableBasicTemplate) => {
    setEditingId(item.templateId);
    setEditingText(item.templateName || '');

    console.log('handleClickEdit');
  };

  const handleClickDuplicate = async (item: TimetableBasicTemplate) => {
    const confirmMsg = '선택한 시간표를 복사하여 새로운 사본을 생성하시겠습니까?';
    if(!await ShowConfirm(confirmMsg, { 
      className: 'text-alert',
      reverse: true,
     })) {
      return;
    }

    await duplicateTemplate(item.templateId);    
  };

  const handleClickMove = (item: TimetableBasicTemplate) => {
    onMove(item.templateId, item.status || TimetableStatus.Init);
    setIsOpen(false);
    onCancel();
  };
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
    onCancel();
  }, [onCancel, setIsOpen]);

  const fetchTemplates = async () => {
    if(!selectedTimetableId) return;

    const api = new Hc2Timetables();
    try {
      setIsLoading(true);
      const res = await api.getTimetableBasicTemplatesBasictemplates(selectedTimetableId);
      const { templates } = (res.data as EmbeddedListResponse<TimetableBasicTemplate>)._embedded;
      
      setList(templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  const duplicateTemplate = async (templateId: string) => {

    if(!selectedTimetableId || !templateId) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.duplicateTimetableBasicTemplateDuplicate(selectedTimetableId, templateId);
      const { templateId: newTemplateId, status: newStatus } = res.data as TimetableBasicTemplate;

      // 모달창을 닫고,
      setIsOpen(false);
      onCancel();

      // 복사된 기초 시간표로 이동한다.
      onMove(newTemplateId, newStatus || TimetableStatus.Init);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  }

  const formatTimestamp = (ms: number): string => {
    return TimeUtils.formatTimestamp(ms, true);
  }

  return (
    <HiModal
      size="lg"      
      modalLayerStyle={{ maxWidth: '950px' }}
      isOpen={isOpen}
      onClose={handleClose}
      className={styles.historyModal}
      heading={'기초 시간표 관리'}
      desc= {'생성된 기초시간표 목록을 관리하는 화면입니다.'}       
      content={
        <div className="table-content sticky-wrap table-box h-[600px]">
          <table style={list.length === 0 ? { height: '100%' } : {}}>
            <caption>기초시간표 목록</caption>
            <colgroup>
              <col style={{ width: '68px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '198px' }} />
              <col style={{ width: '198px' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="sticky-top">NO</th>
                <th scope="col" className="sticky-top">기초 시간표 이름</th>
                <th scope="col" className="sticky-top">최종 업데이트</th>
                <th scope="col" className="sticky-top">수정/복사</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((item, index) => (
                  <tr
                    key={`${index}-${item.templateId}`}
                    className={`cursor-pointer ${selectedTemplateId === item.templateId ? 'selected' : ''} ${editingId === item.templateId ? 'edited' : ''}`}
                  >
                    <td >{index + 1}</td>
                    <td className={`txt-left`}>
                      {editingId === item.templateId ? (
                        <>
                          <HiInput
                            type="text"
                            value={editingText}
                            showClearButton={false}
                            maxLength={100}
                            spellCheck={false}
                            ref={el => (inputRefs.current[index] = el)}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={() => handleEditInputStop(index, item)}
                            onKeyUp={(e) => {
                              if (e.key === 'Enter') {
                                handleEditInputStop(index, item);
                              }
                            }}
                            className="pr-15"
                            onChange={(e) => setEditingText(e.target.value)}                            
                          />
                          <span className="absolute top-5 right-7.5 text-leading-d2 text-text-neutral-base">{editingText.length}/100</span>
                        </>
                      ) : (
                        <div className="d-flex a-middle j-between history-txt">
                          {item.templateName}
                          <HiButton type="button" variant='link' onClick={(e) => { e.stopPropagation(); handleClickEdit(index, item); }}>
                            <Pencil size={18} color='var(--text-neutral-strong)' />
                          </HiButton>
                        </div>
                      )}
                    </td>
                    <td>{item.updatedTimestamp && formatTimestamp(item.updatedTimestamp)} {item.updatedUserName}</td>
                    <td>
                      <HiButton variant="primary" size="sm" className="mr-1" onClick={() => handleClickMove(item)}>수정하기</HiButton>
                      <HiButton variant="tertiaryBlue" size="sm" onClick={() => handleClickDuplicate(item)}>복사하기</HiButton>
                    </td>
                  </tr>
                ))
              ) : !isLoading && hasLoaded ? (
                <tr>
                  <td colSpan={4}>
                    <div className="hi-nodata">
                      <p>내역이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      }
    />
  );
};

export default TemplateListModal;