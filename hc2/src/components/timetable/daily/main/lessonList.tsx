// DatetimePicker import (ES6)
import React, { useState, useEffect, createContext, useContext, ReactNode, FC, useMemo, use, useRef } from 'react';
import styles from './lessonList.module.scss';
import { HiSelectBox, HiTooltip, FloatingPopup, HiButton, HiTab, HiCard } from '@/components/uiux';

import { 
  useGradeContext, TimetableGradeContext,
  useClassContext, TimetableClassContext,
  useTeacherContext, TimetableTeacherContext,
  useCourseContext, TimetableCourseContext,
  useTeacherCourseContext, TeacherCourseContext,
  useSpecialtyRoomContext, TimetableSpecialtyRoomContext,
  useTeacherCourseBaseContext, TeacherCourseBaseContext,
  useCourseBaseContext, TimetableCourseBaseContext,
  useTimetableOverviewContext, TimetableOverviewContext,
} from '../../contexts';
import { TimetableDataUtils } from "../../core/mod/utils"
import { TimeUtils, TimetableDisplayUtils, TypeUtils } from '../../common/utils';
import { Hc2Timetables } from '../../apis';
import { showToast } from '@/unimplementeds/toast.js';
import {
  TimetableDailyLessonChangeType, TimetableLessonChangeStatus, Class, Course, Teacher,
  TimetableLessonChangeType, TimetableLessonChange, TimetableLessonChangeSelectionType,
  SpecialtyRoom, TimetableLessonChangeDetail, Lesson, TeacherCourse, DailyLesson, TimetableLessonChangeDetailType,
  TimetableIndex, TimetableStatus, TeacherCourseBase, CourseBase, LessonChangeSimple, UploadLessonConf
} from '../../core/types.js';
import DailyLessonButton, { DailyLessonButtonOption } from "../components/dailyLessonButton";
import {
  PageResponse, LessonDay, ActivateWeekday, EmbeddedListResponse, DateType, CourseBaseTitle
} from "../../common/types";
import { ClassDayStatus, DAYS_OF_WEEK } from "../../common/constants";
import qs from 'qs'

import { ShowAlert, ShowConfirm } from '@/components/uiux/modal';
import { ConcurrentConf, TimetableProgress } from '../../../../../../src/apps/timetable/core/types.js';
import TemplateListModal from '../components/templateListModal.js';
import LessonStatsManagement from './lessonStatsManagement.js';
import DailyLessonsModal from '../components/dailyLessonModal.js';
import NewTimetableModal from '../components/newTimetableModal.js';
import BaseTimetableModal, { UploadLessonConfRequest } from '../components/baseTimetableModal.js';
import ClassScheduleRequestModal from '../components/classScheduleRequestModal.js';
import { classScheduleTypeMap, errMsgMapByType, lessonChangeTypeMap, RecoveryErrMsgMap, RecoveryErrorType } from './constants.js';
import LessonChangeRequestModal from '../components/lessonChangeRequestModal.js';
import ChangeClassScheduleModal from '../components/changeClassScheduleModal.js';

import { downloadFromUrl } from '@/utils';
import ClassScheduleManagement from './classScheduleManagement.js';
import LessonChangeManagement from './lessonChangeManagement.js';
import { last } from 'lodash';
import { Trash2, Plus, Settings, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// 컨텍스트를 위한 기본값 및 타입 정의
interface ContextProps {
  // 실제 컨텍스트 API의 복잡한 로직을 단순화하여 예시로만 포함
  reloadWithTimetableId: (id: string) => Promise<void>;
}

type SubMenuChangeOptions = {
  initStatus?: TimetableLessonChangeStatus | null;
};

enum BaseTimetableInitType {
  New = 'NEW',
  Import = 'IMPORT',
  Upload = 'UPLOAD'
}
1
// 수업 변경 상태 맵
const lessonChangeStatusMap = {
  [TimetableLessonChangeStatus.Pending]: '승인 대기',
  [TimetableLessonChangeStatus.Completed]: '승인 완료',
  [TimetableLessonChangeStatus.Rejected]: '반려',
  [TimetableLessonChangeStatus.Canceled]: '취소',
  [TimetableLessonChangeStatus.Ignored]: '처리 불가',
  [TimetableLessonChangeStatus.Recovered]: '관리자 취소'
};

// 학년, 학급 임의 데이터( 전체시간표탭 : 학급일정변경모달에서 학년, 반 사용 / 시수누계관리탭에서 학년 사용/ )
const gradeClassData = [
  { value: '1', label: '1학년', classes: ['1-1', '1-2', '1-3'] },
  { value: '2', label: '2학년', classes: ['2-1', '2-2'] },
  { value: '3', label: '3학년', classes: ['3-1', '3-2', '3-3'] },
];

// SideModal에 전달할 컴포넌트들 (예시)
const customComponents = {
  HiButton: ({ onClick, color, className, children }: any) => <button onClick={onClick} className={className}>{children}</button>,
  HiIcon: ({ name, size, color }: any) => <i className={`ico-${name} ico-size-${size} ico-${color}`}></i>,
};

enum TimetableModalType {
  Create = 'CREATE',
  Edit = 'EDIT',
}

enum TimetableAlertType {
  overlappingPeriodError = 'overlappingPeriodError',
  operationDateChangeConfirm = 'operationDateChangeConfirm',
  etc = 'etc',
}

interface School {
  schoolId?: string;
  schoolName?: string;
}

interface TimetableMainProps {
  school?: School;
}

// 추후 업데이트 예정 알림
const showComingSoon = () => {
  ShowConfirm(
    '추후 업데이트 예정입니다.',
    {
      confirmLabel: '확인',
      hideCancel: true,   
      className: 'time-table-alert'
    }
  )
}

// 학교 시간표 관리 전체
const TimetableMain: FC<TimetableMainProps> = ({ school }) => {
  // 상단 탭 메뉴
  const menuItems = [
    { name: "TimetableManagement", label: "전체 시간표", component: TimetableManagement },
    { name: "LessonChangeManagement", label: "수업 변경 관리", component: LessonChangeManagement },
    { name: "ClassScheduleManagement", label: "학급 일정 변경 관리", component: ClassScheduleManagement },
    // { name: "LessonStatsManagement", label: "시수 누계 관리", component: LessonStatsManagement },
  ];

  const statusAddressMap = {
    [TimetableStatus.Init]: 'basic-info',
    [TimetableStatus.WeeklyPeriod]: 'weekly-period',
    [TimetableStatus.CourseBase]: 'courses',
    [TimetableStatus.Teacher]: 'teachers',
    [TimetableStatus.LessonConfig]: 'lesson-config',
    [TimetableStatus.AdditionalWork]: 'additional-work',
    [TimetableStatus.Generate]: 'generate',
    [TimetableStatus.Finish]: 'generate',
    [TimetableStatus.Edit]: 'generate', // 불필요하나 데이터 호환을 위해 유지
  };

  // === Contexts ===
  const timetableOverview = useTimetableOverviewContext();

  const gradeContext = TimetableGradeContext.getInstance();
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  // const lessonConfContext = TimetableLessonConfContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();
  // const concurrentConfContext = TimetableConcurrentConfContext.getInstance();
  const timetableOverviewContext = TimetableOverviewContext.getInstance();

  // === States ===
  const [ selectedSchoolId, setSelectedSchoolId ] = useState<string | null>(school?.schoolId || null); // 선택된 학교 ID
  const [ selectedSchoolName, setSelectedSchoolName ] = useState<string | null>(school?.schoolName || null); // 선택된 학교 이름
  const [ timetables, setTimetables ] = useState<TimetableIndex[]>([]); // 시간표 목록
  const [ selectedTimetableId, setSelectedTimetableId ] = useState<string>(''); // 선택된 시간표 ID
  const [ hasTimetables, setHasTimetables ] = useState<boolean>(true); // 시간표 목록 존재 여부
  const [ isEditMode, setIsEditMode ] = useState<boolean>(false); // 시간표 수정 모드 여부

  const [subMenu, setSubMenu] = useState(menuItems[0].name);
  const [lessonChangeInitStatus, setLessonChangeInitStatus] = useState<TimetableLessonChangeStatus | null>(null);
  const [newTimetableModal, setNewTimetableModal] = useState(false);  // 새 시간표 만들기 모달
  const [baseTimetableModal, setBaseTimetableModal] = useState(false);  // 기초 시간표 생성하기 모달
  const [uploadLessonConfRequest, setUploadLessonConfRequest] = useState<UploadLessonConfRequest | null>(null);
  const [isLessonConfUploading, setIsLessonConfUploading] = useState<boolean>(false);
  const [templateListModal, setTemplateListModal] = useState(false);  // 기초 시간표 템플릿 리스트 모달

  // === UseMemos ===
  const timetableOptions = useMemo(() => {
    if (!timetables || timetables.length === 0) return [];

    const today = TimeUtils.getTodayAsNumber();
    return timetables.map(timetable => ({ value: timetable.timetableId, title: timetable.timetableName, isOperating: timetable.operationStartDate <= today && timetable.operationEndDate >= today }) );
  }, [timetables]);

  const selectedTimetable = useMemo(() => {
    if (!selectedTimetableId) return null;

    return timetables.find(t => t.timetableId === selectedTimetableId) || null;
  }, [selectedTimetableId, timetables]);

  const isOperating = useMemo(() => {
    if (!selectedTimetableId || !timetables || timetables.length === 0) return false;

    const today = TimeUtils.getTodayAsNumber();
    const timetable = timetables.find(timetable => timetable.timetableId === selectedTimetableId);
    if (timetable && timetable.operationStartDate <= today && timetable.operationEndDate >= today) return true;

    return false;
  }, [selectedTimetableId]);

  const isPlaned = useMemo(() => {
    if (!selectedTimetableId) return false;

    const today = TimeUtils.getTodayAsNumber();
    const timetable = timetables.find(timetable => timetable.timetableId === selectedTimetableId);
    if (timetable && timetable.operationStartDate > today) return true;

    return false;
  }, [selectedTimetableId]);


  const isAppliedTimetable = useMemo(() => {
    return timetableOverviewContext.timetableStatus === TimetableStatus.Finish;
  }, [timetableOverview]);

  const templateButtonLabel = useMemo(() => {
    if (isAppliedTimetable) {
      return '기초시간표 관리';
    }
    return '기초시간표 생성';
  }, [isAppliedTimetable]);

  const fetchTimetables = async () => {
    if (!selectedSchoolId) return [];

    const api = new Hc2Timetables();
    try {
      const res = await api.getTimetableListTimetables({ schoolId: selectedSchoolId });
      const { timetables } = (res.data as EmbeddedListResponse<TimetableIndex>)._embedded;
      setTimetables(timetables);
      setHasTimetables(timetables.length > 0);
      return timetables;
    } catch (error) {
      console.error("Error fetching timetables:", error);
      return [];
    }
  }

  const reloadContextAllWithTimetableId = async (id: string) => {
    // 모든 컨텍스트의 reload 함수를 호출
    await timetableOverviewContext.reloadWithTimetableId(id);
    await gradeContext.reloadWithTimetableId(id);
    await courseContext.reloadWithTimetableId(id);
    await courseBaseContext.reloadWithTimetableId(id);
    await teacherCourseContext.reloadWithTimetableId(id);
    await teacherCourseBaseContext.reloadWithTimetableId(id);
    await teacherContext.reloadWithTimetableId(id);
    await classContext.reloadWithTimetableId(id);
    await specialtyRoomContext.reloadWithTimetableId(id);
    // await lessonConfContext.reloadWithTimetableId(id);
    // await concurrentConfContext.reloadWithTimetableId(id);
  };

  const handleClickDeleteTimetable = async (timetableId: string) => {
    if (!timetableId) return;

    if(!(await ShowConfirm(
      '선택한 시간표를 삭제하시겠습니까?\n시간표에 포함된 모든 데이터가 삭제되며, 복구할 수 없습니다.', { confirmLabel: '삭제', reverse: true, className: 'time-table-alert' }
    ))) return;
    
    const api = new Hc2Timetables();
    try {
      const res = await api.deleteTimetableTimetablesTimetableId(timetableId);

      if (res.status === 204) {
        const fetchedTimetables = await fetchTimetables();
        setSelectedTimetableId(!!fetchedTimetables ? fetchedTimetables[0].timetableId : '');
      }
    } catch (error) {
      console.error("Error deleting timetable:", error);
    }
  };

  const fetchTimetableProgressInfo = async (timetableId: string) => {
    if (!timetableId) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.getTimetableProgressInfoProgressinfo(timetableId);
      const progressInfo = res.data as TimetableProgress;
      return progressInfo?.status || TimetableStatus.Init;
    } catch (error) {
      console.log('Error fetching timetable progress info:', error);
    }
  };

  // === Methods ===
  const setOnSelectedTimetableId = (timetables: TimetableIndex[]) => {
    if (!timetables || timetables.length === 0) return;

    const today = TimeUtils.getTodayAsNumber();
    const timetable = timetables.find(t => t.operationStartDate <= today && t.operationEndDate >= today);
    if (!!timetable) {
      setSelectedTimetableId(timetable.timetableId);
      return;
    }

    setSelectedTimetableId(timetables[0].timetableId);
  };

  const handleRefreshTimetables = async (timetable: TimetableIndex) => {
    await fetchTimetables();
    setSelectedTimetableId(timetable.timetableId);
  };

  const resetAllStates = () => {
    setTimetables([]);
    setSelectedTimetableId('');
    setSubMenu(menuItems[0].name);
    setSelectedSchoolId('');
  };

  // Safari 브라우저 팝업 차단 방지용 빈 창 오픈
  const openBlankTimetableWindow = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.opener = null;
      try {
        win.blur();
        window.focus();
      } catch (error) {
        console.error('Error focusing windows:', error);
      }
    }
    return win;
  };

  const handleTemplateListModalMove = (templateId: string, status: TimetableStatus) => {
    if (!selectedTimetable || !selectedTimetable.timetableId) return;

    const pendingWindow = openBlankTimetableWindow();

    const step = statusAddressMap[status || TimetableStatus.Init] || 'basic-info';

    const url = `/timetable/${selectedTimetable.timetableId}/${templateId}/${step}?schoolId=${selectedSchoolId}`;
    const win = pendingWindow || openBlankTimetableWindow();
    if (!win) return;

    win.location.href = url;
  };

  const handleCancelTemplateListModal = () => {
    // 기초 시간표 관리 창이 닫힐때,
    setTemplateListModal(false);
  };

  const handleClickBaseTimetableButton = async () => {
    if (!selectedTimetable || !selectedTimetable.timetableId) return;

    if(!isAppliedTimetable && timetableOverviewContext.templateCount === 1) {
      openLatestTemplate();
      return;
    }

    if(isAppliedTimetable) {
      // 전체 시간표가 반영된 경우, 기초시간표 관리창 열기
      setTemplateListModal(true);
      return;
    }

    const shouldPreOpenWindow = selectedTimetable.status !== TimetableStatus.Init;
    const pendingWindow = shouldPreOpenWindow ? openBlankTimetableWindow() : null;

    // 기초 시간표 템플릿이 아직 생성되지 않은 경우
    const status = await fetchTimetableProgressInfo(selectedTimetable.timetableId);

    if (status === TimetableStatus.Init) {
      pendingWindow?.close();
      setBaseTimetableModal(true);
      return;
    }

    const targetWindow = pendingWindow || openBlankTimetableWindow();
    openNewBasicTimetable(statusAddressMap[status || TimetableStatus.Init] || 'basic-info', targetWindow);
  };

  const openBasicTimetableTabByInitType = async (templateName: string, initType: BaseTimetableInitType) => {
    await ({
      [BaseTimetableInitType.Import]: () => null,
      [BaseTimetableInitType.New]: async () => await createNewBasicTemplate(templateName),
      [BaseTimetableInitType.Upload]: async () => await uploadLessonConfs(templateName),
    })[initType]();

    setBaseTimetableModal(false);
  };

  const createNewBasicTemplate = async (templateName: string) => {
    const api = new Hc2Timetables();

    try {
      const { createFirstTemplateFirsttemplate } = api;
      const result = await createFirstTemplateFirsttemplate(selectedTimetableId, { templateName });

      const { timetableId, templateId } = result.data as { timetableId: string; templateId: string };
      openNewBasicTimetableAndTemplate(timetableId, templateId);
    } catch (error) {
      console.error('Error creating new basic timetable:', error);
      showToast('기초 시간표 생성에 실패했습니다. 다시 시도해주세요.', { type: 'error' });
      return;
    }

    
  }

  const openNewBasicTimetable = (step: string, targetWindow?: Window | null) => {
    if (!selectedTimetable?.timetableId) {
      targetWindow?.close();
      return;
    }

    const url = `/timetable/${selectedTimetable.timetableId}/${step}?schoolId=${selectedSchoolId}`;
    const win = targetWindow || openBlankTimetableWindow();
    if (!win) return;

    win.location.href = url;
  };

  const uploadLessonConfs = async (templateName: string) => {
    const api = new Hc2Timetables();

    try {
      setIsLessonConfUploading(true);

      if(uploadLessonConfRequest) {
        uploadLessonConfRequest.timetableConfig.templateName = templateName;
      }

      const result = await api.uploadTimetableLessonConfsLessonconfs(selectedTimetableId, uploadLessonConfRequest);
      const { timetableId, templateId } = result.data as { timetableId: string; templateId: string };

      if(!timetableId || !templateId) {
        return;
      }

      localStorage.setItem('isDoneLessonConfsUpload', 'true');
      openNewBasicTimetableAndTemplate(timetableId, templateId);
      await timetableOverviewContext.reloadWithTimetableId(selectedTimetableId);
    } finally {
      setIsLessonConfUploading(false);
    }
  }

  const openNewBasicTimetableAndTemplate = (timetableId: string, templateId: string) => {
    if (!selectedTimetable?.timetableId || selectedTimetable.timetableId !== timetableId || !templateId) {
      return;
    }

    const url = `/timetable/${selectedTimetable.timetableId}/${templateId}/basic-info?schoolId=${selectedSchoolId}`;
    const win = openBlankTimetableWindow();
    if (!win) return;

    win.location.href = url;
  };

  const openLatestTemplate = () => {
    const { latestTemplateId, latestTemplateStatus } = timetableOverviewContext;

    if (!selectedTimetable?.timetableId || !latestTemplateId) {
      return;
    }

    const shouldPreOpenWindow = selectedTimetable.status !== TimetableStatus.Init;
    const targetWindow = shouldPreOpenWindow ? openBlankTimetableWindow() : null;

    const status = latestTemplateStatus || TimetableStatus.Init;
    const step = statusAddressMap[latestTemplateStatus || TimetableStatus.Init] || 'basic-info';

    const url = `/timetable/${selectedTimetable.timetableId}/${latestTemplateId}/${step}?schoolId=${selectedSchoolId}`;
    const win = targetWindow || openBlankTimetableWindow();
    if (!win) return;

    win.location.href = url;
  };

  const openNewBasicTemplate = (url: string, targetWindow?: Window | null) => {
    if (!selectedTimetable?.timetableId) {
      targetWindow?.close();
      return;
    }

    // const url = `/timetable/${selectedTimetable.timetableId}/${step}?schoolId=${selectedSchoolId}`;
    const win = targetWindow || openBlankTimetableWindow();
    if (!win) return;

    win.location.href = url;
  };

  const handleOpenTimetableModal = (type: TimetableModalType) => {
    // document.dispatchEvent(new MouseEvent("mousedown"));
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    setIsEditMode(type === TimetableModalType.Edit);
    setNewTimetableModal(true);
  };

  const isDeletableTimetable = (item: {value: string, title: string}) => {
    const target = timetables.find(timetable => timetable.timetableId === item.value);
    if (!target) return false;

    const today = TimeUtils.getTodayAsNumber();
    return !(target.operationStartDate <= today && target.operationEndDate >= today);
  };

  const formatExpirationDate = (yyyyMMdd: number) => {
    if (!yyyyMMdd) return "";
    const date = TimeUtils.getNumberAsDate(yyyyMMdd);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일(${weekDay})`;
  };

  const handleChangeTimetable = (timetableId: string) => {
    if (!timetableId) return;
    setSelectedTimetableId(timetableId);
    setLessonChangeInitStatus(null);
    setSubMenu(menuItems[0].name);
  };

  const handleChangeSubMenu = (menuName: string, options?: SubMenuChangeOptions) => {
    setLessonChangeInitStatus(options?.initStatus ?? null);
    setSubMenu(menuName);
  }

  // === UseEffects ===
  useEffect(() => {
    return () => resetAllStates();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!selectedSchoolId) return;
      
      const fetchedTimetables = await fetchTimetables();
      setOnSelectedTimetableId(fetchedTimetables);
    };

    init();
  }, [selectedSchoolId]);

  useEffect(() => {
    if (!selectedTimetableId) return;

    reloadContextAllWithTimetableId(selectedTimetableId);
  }, [selectedTimetableId]);

  useEffect(() => {
    if (hasTimetables) return;

    setNewTimetableModal(true);
  }, [hasTimetables]);
  return (
    <div className={styles.timetableMain}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col justify-center items-start gap-1.5">
        <HiSelectBox
          className="type01 timetable-select"
          value={selectedTimetableId}
          items={timetableOptions}
          onChange={handleChangeTimetable}
          emptyTitle={"시간표를 선택하세요"}
          // 커스텀 트리거: 외형/아이콘/삭제 버튼 등을 내부에서 직접 구성
          renderTrigger={({ value, isOpen, toggle, getLabel }) => {
            const label = value ? getLabel(value) : '시간표를 선택하세요';
            const deletable = !!value && isDeletableTimetable({ value: value as string, title: label });
            return (
              <HiButton
                variant="link"
                type="button"
                className={`selected custom-trigger h-8  ${!value ? 'default' : ''} ${isOpen ? 'is-opened' : ''}`}
                onClick={toggle}
              >
                {isOperating && <span className="badge">운영중</span>}
                <span className="trigger-label">{label}</span>
              </HiButton>
            );
          }}
          renderCustomOption={(items, value, selectItem) => {
            if (!items || items.length === 0) {              
              return (
                <div className="hi-nodata list-empty">
                  <p>등록된 전체 시간표가 없습니다</p>
                </div>
              );
            }
            return (
              <>
                {items.map((item: { value: string; title: string; isOperating: boolean }, idx) => (
                  <div className='flex' key={idx}>
                    <HiButton variant="link" className={`item gap-1 !justify-start items-center ${item.value === value ? 'is-selected' : ''}`} onClick={() => selectItem(item)}>          
                      {item.isOperating && <span className="badge">운영중</span>}{item.title}
                    </HiButton>
                    {isDeletableTimetable(item) && (
                      <HiButton
                        variant="link"
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                        onClick={() => handleClickDeleteTimetable(item.value)}
                      >
                        <Trash2 color="var(--text-neutral-strong)" size={18}/>
                      </HiButton>
                    )}
                  </div>
                ))}
              </>
            );
          }}
          renderCustomBtnOption={() => (
            <>
            <HiButton
              type="button"
              variant="link"
              className="text-leading-b3 text-text-primary-base w-full justify-start pt-3 px-6 pb-3.5"
              onClick={() => handleOpenTimetableModal(TimetableModalType.Create)}
            >
              <Plus size={24} strokeWidth='1.6' color="var(--text-primary-base)"/>
              새 전체 시간표 만들기
            </HiButton>
            </>
          )}
        />
        <div className='flex items-center gap-2 operation-period'>
          {!!selectedTimetable && (
            <>
              <p className='text-neutral-stronger'>운영 기간 : {formatExpirationDate(selectedTimetable?.operationStartDate)} ~ {formatExpirationDate(selectedTimetable?.operationEndDate)}</p>
              <HiButton type='button' variant="tertiary" size="xs" onClick={() => handleOpenTimetableModal(TimetableModalType.Edit)}>
                <Settings size={16} strokeWidth={1.6} color="var(--text-default)" /> 설정
              </HiButton>
            </>
          )}
        </div>
        </div>
        {
          (isOperating || isPlaned) && 
          <HiButton className='btn btn-primary px-11 btn-lg' onClick={handleClickBaseTimetableButton}>{templateButtonLabel}</HiButton>
        }
      </div>

      {!selectedTimetable || (!!selectedTimetable && !selectedTimetable.dailyLessonAdjusted)
        ? (<div className="timetable-nodata hi-nodata">
          <p>적용된 기초시간표가 없습니다.<br/> 기초시간표를 생성 후 전체시간표에 적용해주세요.</p>
          </div>)
        : (
          <>
            <HiTab
              labels={menuItems.map(item => item.label)}
              selectedTabIndex={menuItems.findIndex(item => item.name === subMenu)}
              isControlOuter
              onChange={(idx) => handleChangeSubMenu(menuItems[idx].name)}
              size='xxl'
              className='border-b border-border-neutral-base'
            >
              {menuItems.map((item) => {
                const ActiveComponent = item.component;
                return <ActiveComponent
                  key={item.name}
                  selectedTimetable={selectedTimetable}
                  isManagerView={true}
                  onChangeSubMenu={handleChangeSubMenu}
                  initStatus={item.name === 'LessonChangeManagement' ? lessonChangeInitStatus : undefined}
                   />;
              })}
            </HiTab>
          </>
        )
      }

      <NewTimetableModal
        schoolId={selectedSchoolId || ''}
        selectedTimetable={isEditMode ? selectedTimetable : null}
        isOpen={newTimetableModal}
        setIsOpen={setNewTimetableModal}
        emitTimetable={handleRefreshTimetables}
      />
      <BaseTimetableModal
        selectedTimetable={selectedTimetable}
        timetables={timetables}
        isOpen={baseTimetableModal}
        isLessonConfUploading={isLessonConfUploading}
        setIsOpen={setBaseTimetableModal}
        openBasicTimetable={openBasicTimetableTabByInitType}
        uploadLessonConfRequest={uploadLessonConfRequest}
        setUploadLessonConfRequest={setUploadLessonConfRequest}
      />
      <FloatingPopup
        // imgSrc={FloatingImg}
        imgSrc='/files/img/banner/floating-timetable.png'
        onOpen={() => window.open("https://www.notion.so/hiclass/_-2b6d43c0e0b080168880d6b71b0696f1")}
      />

      <TemplateListModal
        selectedTimetableId={selectedTimetable?.timetableId}
        isOpen={templateListModal}
        setIsOpen={setTemplateListModal}
        onMove={handleTemplateListModalMove}
        onCancel={handleCancelTemplateListModal}
      />
    </div>
  );
};

enum SearchType {
  Teacher = "TEACHER",
  Class = "CLASS"
}

interface TimetableManagementProps {
  selectedTimetable: TimetableIndex | null;
  onChangeSubMenu?: (menuName: string, options?: SubMenuChangeOptions) => void;
}

const TimetableManagement: FC<TimetableManagementProps> = ({ selectedTimetable, onChangeSubMenu }) => {
  // Track if filter dropdown has been closed after a selection
  const [filterTouched, setFilterTouched] = useState(false);

  // 검색 구분
  const searchTypeList = [
    { value: SearchType.Teacher, title: '교사명' },
    { value: SearchType.Class, title: '학급별' }
  ];

  // === Contexts ===
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const courseBases = useCourseBaseContext();
  const teacherCourses = useTeacherCourseContext();
  // const concurrentConfs = useConcurrentConfContext();
  const teacherCourseBases = useTeacherCourseBaseContext();
  const specialtyRooms = useSpecialtyRoomContext();
  const timetableOverview = useTimetableOverviewContext();

  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  // const concurrentConfContext = TimetableConcurrentConfContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();
  const timetableOverviewContext = TimetableOverviewContext.getInstance();

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

  const teacherCourseMap = useMemo(
    () => teacherCourseContext.teacherCourseMap || ({} as Record<string, TeacherCourse[]>),
    [teacherCourses]
  );

  const courseBaseMap = useMemo(
    () => courseBaseContext.courseBaseMap || ({} as Record<string, CourseBase>),
    [courseBases]
  );

  const teacherCourseBaseMap = useMemo(
    () => teacherCourseBaseContext.teacherCourseBaseMap || ({} as Record<string, TeacherCourseBase[]>),
    [teacherCourseBases]
  );

  /*
  const concurrentConfMap = useMemo(
    () => concurrentConfContext.concurrentConfMap || ({} as Record<string, ConcurrentConf>),
    [concurrentConfs]
  );
  */

  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  // === States ===
  const [ activatedClassDays, setActivatedClassDays ] = useState<ActivateWeekday[]>([]);
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);
  const [ hoverId, setHoverId ] = useState<string>('');

  // const [ schoolId, setSchoolId ] = useState<string>('0aaa2672-d43a-11e9-86da-98be94437cd2');
  const [ selectedTimetableId, setSelectedTimetableId ] = useState<string | null>(null);

  const [ dailyLessons, setDailyLessons ] = useState<DailyLesson[]>([]); // 전체 수업 리스트

  // const [ teacherDailyLessonMap, setTeacherDailyLessonMap ] = useState<Record<string, DailyLesson[]>>({}); // 교사별 수업 맵
  // const [ classDailyLessonMap, setClassDailyLessonMap ] = useState<Record<string, DailyLesson[]>>({}); // 학급별 수업 맵

  const [ selectedWeekRangeIdx, setSelectedWeekRangeIdx ] = useState<number>(-1); // 선택된 주간 기간
  const [ searchType, setSearchType ] = useState<SearchType>(SearchType.Teacher);// 검색 구분 상태
  const [ selectedSearchOptions, setSelectedSearchOptions ] = useState<string[]>([]);   // 선택된 키워드 (초기값: 아무것도 선택되지 않음)
  const [ changeLessonModal, setChangeLessonModal ] = useState(false); // 수업변경 모달 오픈 상태
  const [ changeClassScheduleModal, setChangeClassScheduleModal ] = useState(false);  // 학급일정변경 모달 오픈 상태
  const [ selectedLessonChangeType, setSelectedLessonChangeType ] = useState<TimetableDailyLessonChangeType>(TimetableDailyLessonChangeType.Exchange); // 어떤 탭(타입)으로 열지 상태

  const [ operationStartDate, setOperationStartDate ] = useState<number | null>(null); // 시간표 운영 시작일
  const [ operationEndDate, setOperationEndDate ] = useState<number | null>(null); // 시간표 운영 종료일

  const [ lessonChangeRequestedCount, setLessonChangeRequestedCount ] = useState<number>(0); // 수업 변경 요청 수

  const [ selectedCell, setSelectedCell ] = useState<{
    teacherId: string;
    classId: string;
    lessonDate: number;
    period: number;
    dailyLesson: DailyLesson;
  } | null>(null); // 선택된 셀 정보

  const [ dailyLessonModalOptions, setDailyLessonModalOptions ] = useState<{
          teacherId: string | null,
          classId: string | null,
          lessonDate: number | null,
          period: number | null,
          dailyLesson: DailyLesson | null,
        } | null>(null);

  const [ lessonChanges, setLessonChanges ] = useState<Record<string, string>>({}); // 수업 변경 내역

  // === Utils ===
  const prevSelectedTimetableIdRef = useRef<string | null>(null);

  const readableLessonDay = (lessonDay: LessonDay) => {
    const monthAndDay = lessonDay.lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    const dayOfWeekTitle = DAYS_OF_WEEK.find((d) => d.index === lessonDay.dayOfWeek)?.title || "";
    return `${month}/${day}(${dayOfWeekTitle})`;
  };

  const adjustDisplayedPeriod = (period: number) => {
    return period + startPeriod;
  };

  // === UseMemos ===
  const concurrentCourseMap = useMemo(() => {
    if (!dailyLessons) return {};

    return dailyLessons
      .filter(lesson => !!lesson.concurrentCourseId)
      .reduce((acc, cur) => {
        (acc[cur.concurrentCourseId] ||= []).push(cur);
        return acc;
      }, {} as Record<string, DailyLesson[]>);
  }, [dailyLessons]);


  const teacherDailyLessonMap = useMemo(() => {
    return dailyLessons.reduce((acc, cur) => {
        const teacherIds = cur.lessonTeacherIds;
        teacherIds.forEach(teacherId => (acc[teacherId] ||= []).push(cur));
        return acc;
      }, {} as Record<string, DailyLesson[]>);
  }, [dailyLessons]);
  

  const classDailyLessonMap = useMemo(() => {
    return dailyLessons.reduce((acc, cur) => {
        const classId = cur.classId;
        (acc[classId] ||= []).push(cur);
        return acc;
      }, {} as Record<string, DailyLesson[]>);
  }, [dailyLessons]);

  const selectableSearchOptions = useMemo(() => {
    const requiredMaps = [teacherDailyLessonMap, classDailyLessonMap, teacherCourseBaseMap, courseBaseMap, courseMap, teacherMap];
    const hasData = requiredMaps.every(m => m && Object.keys(m).length > 0);
    if (!hasData) return { [SearchType.Teacher]: [], [SearchType.Class]: [] };

    const options: Record<SearchType, Array<{ value: string; title: string; }>> = {
      [SearchType.Teacher]: Object.entries(teacherDailyLessonMap || {})
        .map(([teacherId, lessons]) => {
          const courseBases = (teacherCourseBaseMap[teacherId] || [])
            .map(tc => courseBaseMap[tc.courseBaseId])
            .filter(Boolean) as CourseBase[];

          const coursesFromLessons = Array.from(new Set((lessons || []).map(l => l.courseId)))
            .map(id => courseMap[id])
            .filter(Boolean) as Course[];

          const courseNames = courseBases.length
            ? TimetableDataUtils.courseBaseNames(courseBases)
            : TimetableDataUtils.courseNames(coursesFromLessons);

          const teacher = teacherMap[teacherId] || null;
          if (!teacher) return null;
          const teacherOption = { value: teacher.teacherId, title: `${teacher.teacherName} ${courseNames ? `(${courseNames.sort().join(', ')})` : ''}` };
          return teacherOption;
        })
        .filter(Boolean)
        .sort((a, b) => a.title.localeCompare(b.title)),
      [SearchType.Class]: classes
        // .filter(clazz => !clazz.isVirtual)
        .sort((a, b) => {
            if (a.grade === b.grade) {
              if (a.isVirtual !== b.isVirtual) {
                return a.isVirtual ? 1 : -1;
              }
              return a.classNumber - b.classNumber;
            }
          return a.grade - b.grade;
        })
        .map(classItem => ({
          value: classItem.classId,
          title: TimetableDisplayUtils.formatFullClassName(classItem)
        }))
    };
    return options;
  }, [teacherDailyLessonMap, classDailyLessonMap, classes, teachers, teacherCourseBaseMap, courseBaseMap, courseMap, teacherMap]);

  const isAllChecked = useMemo(() => {
    return selectableSearchOptions[searchType].length > 0 && selectedSearchOptions.length === selectableSearchOptions[searchType].length;
  }, [selectedSearchOptions]);

  const operationWeeklyDates = useMemo(() => {
    if (operationStartDate === null || operationEndDate === null) return [];

    const firstWeek = TimeUtils.getWeekRange(operationStartDate); // [sun, sat]
    const endWeek = TimeUtils.getWeekRange(operationEndDate);     // [sun, sat]

    let startSundayNum = firstWeek[0];
    let endSundayNum = endWeek[0];

    const weeks: Array<[number, number]> = [];
    let cur = TimeUtils.getNumberAsDate(startSundayNum);

    while (TimeUtils.getDateAsNumber(cur) <= endSundayNum) {
      const sunNum = TimeUtils.getDateAsNumber(cur);
      const satDate = new Date(cur.getTime() + 6 * 24 * 60 * 60 * 1000);
      const satNum = TimeUtils.getDateAsNumber(satDate);
      weeks.push([sunNum, satNum]);

      cur = new Date(cur.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const weeklyDates = weeks.map((week, idx) => ({
        value: idx,
        title: `${readableLessonDay({ lessonDate: week[0], dayOfWeek: 0 })} ~ ${readableLessonDay({ lessonDate: week[1], dayOfWeek: 6 })}`,
        formattedDate: `${TimeUtils.getDateAsString(week[0])} ~ ${TimeUtils.getDateAsString(week[1])}`,
        weekRange: week
    }));

    return weeklyDates;
    }, [operationStartDate, operationEndDate]);

  const lessonDays = useMemo(() => {
    if (selectedWeekRangeIdx < 0 || !operationWeeklyDates || !operationWeeklyDates[selectedWeekRangeIdx]) return [];

    const weeks = 1;
    const weekRange = operationWeeklyDates[selectedWeekRangeIdx]?.weekRange;
    return TimeUtils.generateLessonDays(weekRange[0], weeks)
      .filter((lessonDay: LessonDay) =>
        activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
      );
  }, [operationWeeklyDates, activatedClassDays, selectedWeekRangeIdx]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 5;
    return !!lessonDays && lessonDays.length > 0
      ? `${(100 - headerWidth) / lessonDays.length}%`
      : "auto";
  }, [lessonDays]);

  const isOperating = useMemo(() => {
    if (!selectedTimetable) return false;

    const today = TimeUtils.getTodayAsNumber();
    return selectedTimetable.operationStartDate <= today && today <= selectedTimetable.operationEndDate;
  }, [selectedTimetable]);

  // === Renderers ===
  const renderTeacherLessons = (lessonDate: number, period: number, teacherId: string) => {
    const dailyLessons = teacherDailyLessonMap[teacherId] || [];
    if (!dailyLessons || dailyLessons.length === 0) return null;

    const dailyLesson = dailyLessons.find(l => l.lessonDate === lessonDate && l.period === period) as DailyLesson;
    if (!dailyLesson) return null;

    const isEvent = dailyLesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = dailyLesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = dailyLesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const isReadOnly = (
      lessonDate < TimeUtils.getTodayAsNumber() ||
      isEvent || isRemoved || isDuplicated
    );

    const option = {
      isChangedLesson: dailyLesson.changeType !== TimetableDailyLessonChangeType.None && !isEvent && !isRemoved,
      isDisabled: false,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isReadOnly: isReadOnly,
      isEvent,
      isRemoved,
      isDuplicated,
    } as DailyLessonButtonOption;

    if(dailyLesson && dailyLesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = teacherDailyLessonMap[teacherId].filter(l =>
        l.consecutiveGroupId === dailyLesson.consecutiveGroupId &&
        l.classId == dailyLesson.classId &&
        l.dayOfWeek === dailyLesson.dayOfWeek
      )
      .sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === dailyLesson.dailyLessonId;
    }

    if (dailyLesson.changeType === TimetableDailyLessonChangeType.Combination) {
      const combinedLessons = dailyLessons
        .filter(l => dailyLesson.combinedGroupId === l.combinedGroupId)
        .map(l => classMap[l.classId])
        .filter((c): c is Class => !!c)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      dailyLesson.className = buildClassNameFromLessons(combinedLessons);
    }

    if (dailyLesson.concurrentCourseId && dailyLesson.combineConfId) {
      const concurrentCombinedLessons = getConcurrentCombinedClasses(dailyLessons, dailyLesson).sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      dailyLesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
    }

    /*
    if (dailyLesson.concurrentCourseId) {
      const isCombined = concurrentConfMap[dailyLesson.concurrentCourseId]?.isCombinedClass;
      if (isCombined) {
        const concurrentCombinedLessons = getConcurrentCombinedClasses(dailyLessons, dailyLesson)
          .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
        dailyLesson.className = buildClassNameFromLessons(concurrentCombinedLessons);
      }
    }
    */

    // const handleMouseOverDailyLesson = async (dailyLesson: DailyLesson) => {
    //   if (!dailyLesson || !dailyLesson.lessonChangeId) return;
    //   setHoverId(dailyLesson.dailyLessonId);
    //   await getLessonChangeContents(dailyLesson);
    // };

    // const handleMouseLeaveDailyLesson = (_lesson: DailyLesson, event?: React.MouseEvent<HTMLButtonElement>) => {
    //   setHoverId('');
    // };
    const tooltipHtml = dailyLesson?.lessonChangeId ? lessonChanges[dailyLesson.lessonChangeId] : '';
    const buttonEl = (
      <DailyLessonButton
        dailyLesson={dailyLesson}
        lessonDate={lessonDate}
        period={period}
        classMap={classMap}
        courseMap={courseMap}
        teacherMap={teacherMap}
        specialtyRoomMap={specialtyRoomMap}
        option={option}
        onClick={(dailyLesson, lessonDate, period, option) => handleClickCell(SearchType.Teacher, dailyLesson, lessonDate, period, teacherId, null)}
        // onMouseEnter={handleMouseOverDailyLesson}
        // onMouseLeave={handleMouseLeaveDailyLesson}
      />
    );

    return (
      <div className='h-14'>
        {tooltipHtml
          ? (
              <HiTooltip position='center-top' titleHtml={tooltipHtml}>
                {buttonEl}
              </HiTooltip>
            )
          : buttonEl}
      </div>
    );
  };

  const renderClassLessons = (lessonDate: number, period: number, classId: string) => {
    const dailyLessons = classDailyLessonMap[classId] || [];
    if (!dailyLessons || dailyLessons.length === 0) return null;

    const dailyLesson = dailyLessons.find(l => l.lessonDate === lessonDate && l.period === period) as DailyLesson;

    const isEvent = !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Duplication;

    const isReadOnly = (
      lessonDate < TimeUtils.getTodayAsNumber() ||
      (!!dailyLesson && courseMap[dailyLesson.courseId]?.isUnified) ||
      isEvent || isRemoved || isDuplicated
    );

    const option = {
      isChangedLesson: !!dailyLesson && dailyLesson.changeType !== TimetableDailyLessonChangeType.None && !isEvent && !isRemoved,
      isDisabled: !dailyLesson,
      isDirectExchangeable: false,
      isChainExchangeable:  false,
      isFirstOfConsecutive: false,
      isHoveredConsecutive: false,
      isReadOnly: isReadOnly,
      isEvent,
      isRemoved,
      isDuplicated,
      isTimetableByClass: true,
    } as DailyLessonButtonOption;

    if(dailyLesson && dailyLesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = classDailyLessonMap[classId].filter(l =>
        l.consecutiveGroupId === dailyLesson.consecutiveGroupId &&
        l.classId == dailyLesson.classId &&
        l.dayOfWeek === dailyLesson.dayOfWeek
      ).sort((a, b) => a.period - b.period);

      option.isFirstOfConsecutive = consecutiveLessons.length > 0 && consecutiveLessons[0].dailyLessonId === dailyLesson.dailyLessonId;
    }

    const tooltipHtml = dailyLesson?.lessonChangeId ? lessonChanges[dailyLesson.lessonChangeId] : '';
    const buttonEl = (
      <DailyLessonButton
        dailyLesson={dailyLesson}
        lessonDate={lessonDate}
        period={period}
        classMap={classMap}
        courseMap={courseMap}
        teacherMap={teacherMap}
        specialtyRoomMap={specialtyRoomMap}
        option={option}
        onClick={(dailyLesson, lessonDate, period, option) => handleClickCell(SearchType.Class, dailyLesson, lessonDate, period, null, classId)}
      />
    );

    return tooltipHtml
      ? (
          <HiTooltip position='center-bottom' titleHtml={tooltipHtml}>
            {buttonEl}
          </HiTooltip>
        )
      : buttonEl;

  };

  // === APIs ===
  // const getTimetableInfoByActiveDate = async () => {
  //   // 현재 날짜에 활성화된 시간표 정보를 가져온다.
  //   const currentDate = TimeUtils.getTodayAsNumber();
  //   const api = new Timetables();

  //   try {
  //     const { data } = await api.getActiveTimetableByDateActivebydateDate(currentDate, { schoolId });

  //     console.log('현재 날짜에 활성화된 시간표 정보:', data);

  //     const { isActivated, timetableId, operationStartDate, operationEndDate } = data  as { isActivated: boolean; timetableId: string | null; operationStartDate: number | null; operationEndDate: number | null; };

  //     if(isActivated !== true || timetableId === null || operationStartDate === null || operationEndDate === null) {
  //       // 활성화된 시간표 정보가 있는 경우
  //       console.warn('현재 날짜에 활성화된 시간표 정보가 없습니다.');
  //       return;
  //     }

  //     setSelectedTimetableId(timetableId);
  //     setOperationStartDate(operationStartDate);
  //     setOperationEndDate(operationEndDate);
  //   } catch (error) {
  //     console.error('현재 날짜에 활성화된 시간표 정보를 가져오는 중 오류 발생:', error);
  //   }
  // };

  const fetchLessonChangeSimple = async (lessonChangeId: string) => {
    if (!selectedTimetableId || !lessonChangeId) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.getLessonChangeSimpleLessonchangesLessonChangeId(
        selectedTimetableId,
        lessonChangeId
      );
      const lessonChange = res.data as LessonChangeSimple;

      return lessonChange;
    } catch (error) {
      console.error("Error fetching lesson change simple info:", error);
    }
  };

  const fetchToGetCountOfRequestedLessonChange = async () => {
    if (!selectedTimetableId) {
      setLessonChangeRequestedCount(0);
      return;
    }

    const api = new Hc2Timetables();
    const query = {
      changeType: TimetableLessonChangeType.Lesson
    };

    try {
      const res = await api.getRequestedLessonChangesCountPending(selectedTimetableId, query);

      const { requestCount } = res.data as { requestCount: number };
      setLessonChangeRequestedCount(requestCount);
    } catch (error) {
      console.error('수업 변경 이력 조회 중 오류 발생:', error);
      setLessonChangeRequestedCount(0);
      return;
    }
  };

  const fetchDailyLessons = async () => {
    if (!selectedTimetableId || selectedWeekRangeIdx < 0 || !operationWeeklyDates || !operationWeeklyDates[selectedWeekRangeIdx]) {
      console.warn("fetchTeacherDailyLessons: timetableId or lesson days are not set");
      return;
    }

    const api = new Hc2Timetables();
    const [ selectedStartDate, selectedEndDate ] = operationWeeklyDates[selectedWeekRangeIdx].weekRange;

    try {
      const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
        selectedTimetableId,
        selectedStartDate,
        selectedEndDate
      );

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      // setDailyLessonsBySearchType(dailyLessons);
      setDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
    }
  };

  useEffect(() => {
    // console.log('Daily lessons updated:', dailyLessons);
  }, [dailyLessons]);

  const handleClickRecoverLessonChange = async (dailyLesson: DailyLesson) => {
    if (!dailyLesson || !selectedTimetableId || !dailyLesson.lessonChangeId) return;

    if(
      !await ShowConfirm(
        '선택한 수업의 수업변경을 관리자 취소 하시겠습니까?\n관리자 취소 시 변경 전 상태로 돌아갑니다.'
        , { confirmLabel: '확인', reverse: true , className: 'time-table-alert'})
    ) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.requestToRecoverLessonChangeRecovery(selectedTimetableId, dailyLesson.lessonChangeId);

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;

      setDailyLessons(prev => {
        if (!prev || prev.length === 0) return dailyLessons;
        if (!dailyLessons || dailyLessons.length === 0) {
          return prev.filter(d => d.dailyLessonId !== dailyLesson.dailyLessonId);
        }

        const incomingMap = dailyLessons.reduce((acc, dl) => {
          if (dl && dl.dailyLessonId) acc[dl.dailyLessonId] = dl;
          return acc;
        }, {} as Record<string, DailyLesson>);

        const replaced = prev.map(p => incomingMap[p.dailyLessonId] ? incomingMap[p.dailyLessonId] : p);

        const existingIds = new Set(prev.map(p => p.dailyLessonId));
        const additions = dailyLessons.filter(d => !existingIds.has(d.dailyLessonId));

        return additions.length ? [...replaced, ...additions] : replaced;
      });

      if (res.status === 200) {
        showToast('관리자 취소가 적용됐습니다.', 3000);
      }
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
  // const setDailyLessonsBySearchType = (dailyLessons: DailyLesson[]) => {
  //   setTeacherDailyLessonMap(
  //     dailyLessons.reduce((acc, cur) => {
  //       const teacherIds = cur.lessonTeacherIds;
  //       teacherIds.forEach(teacherId => (acc[teacherId] ||= []).push(cur));
  //       return acc;
  //     }, {} as Record<string, DailyLesson[]>)
  //   );

  //   setClassDailyLessonMap(
  //     dailyLessons.reduce((acc, cur) => {
  //       const classId = cur.classId;
  //       (acc[classId] ||= []).push(cur);
  //       return acc;
  //     }, {} as Record<string, DailyLesson[]>)
  //   );
  // };

  const getConcurrentCombinedClasses = (targets: DailyLesson[], selected: DailyLesson) => {
    if(!selected.combineConfId) {
      return [];
    }

    const combineConfId = selected.combineConfId;
    return targets
      .filter(l =>
              l.combineConfId === combineConfId &&
              l.lessonDate === selected.lessonDate &&
              l.period === selected.period &&
              l.concurrentCourseId === selected.concurrentCourseId &&
              TypeUtils.arraysEqual(l.lessonTeacherIds, selected.lessonTeacherIds))
      .map(l => classMap[l.classId])
      .filter((c): c is Class => !!c);
  };

  const buildClassNameFromLessons = (lessons: Class[]) => {
    const classes = lessons
      .map(l => classMap[l.classId])
      .filter(c => !!c)
      .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);

    if (classes.length === 0) return "";

    const classNames = classes
      .map(c => TimetableDisplayUtils.formatFullClassName(c))
      .filter(Boolean);

    if (classNames.length === 0) return "";
    if (classNames.length === 1) return classNames[0];
    if (classNames.length === 2) return classNames.join(", ");
    return `${classNames[0]} 외 ${classNames.length - 1}개반`;
  };

  const getLessonChangeContents = async (dailyLesson: DailyLesson) => {
    if (
      !dailyLesson ||
      ![TimetableDailyLessonChangeType.Exchange, TimetableDailyLessonChangeType.Adjustment].includes(dailyLesson.changeType) ||
      lessonChanges[dailyLesson.lessonChangeId]
    ) {
      return;
    }

    const lessonChange = await fetchLessonChangeSimple(dailyLesson.lessonChangeId);
    const contents = JSON.parse(lessonChange.contents);

    if (!Array.isArray(contents)) return;

    const formattedContents = contents.map(content => {
      if (!content.lessonDate || !content.period) return content;

      const lessonDate = TimeUtils.getNumberAsDate(content.lessonDate);
      const formattedDate = `${lessonDate.getMonth() + 1}/${lessonDate.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][lessonDate.getDay()]}${startPeriod ? content.period : Number(content.period) - 1})`;

      const fromCourse = courseMap[content.sourceCourseId]?.displayedTitle.trim() || '';
      const fromTeacher = (content.sourceTeacherIds || []).map(teacherId => teacherMap[teacherId]?.teacherName).join(', ');

      const toCourse = courseMap[content.targetCourseId]?.displayedTitle.trim() || '';
      const toTeacher = (content.targetTeacherIds || []).map(teacherId => teacherMap[teacherId]?.teacherName).join(', ');

      return {date: formattedDate, from: `${fromCourse} ${fromTeacher}`, to: `${toCourse} ${toTeacher}`};
    });

    const changeTypeStr = dailyLesson.changeType === TimetableDailyLessonChangeType.Exchange ? '수업 교체' : '수업 보강';

    const msg = `${changeTypeStr} <br/> ${formattedContents.map(c => `${c.date} ${c.from} → ${c.to}`).join('<br/>')}`;

    setLessonChanges(prev => ({
      ...prev,
      [dailyLesson.lessonChangeId]: msg
    }));
  };

  const toggleSelectAll = () => {
    setSelectedSearchOptions(isAllChecked ? [] : selectableSearchOptions[searchType].map(item => item.value));
  };

  const handleClickSearchOption = (value: string, checked: boolean) => {
    setSelectedSearchOptions(prev => checked 
      ? [...prev, value].sort((a, b) => {
        const optionA = selectableSearchOptions[searchType].find(item => item.value === a);
        const optionB = selectableSearchOptions[searchType].find(item => item.value === b);
        
        if (!optionA || !optionB) return 0;

        const classOptionA = searchType === SearchType.Class ? classes.find(c => c.classId === optionA.value) : null;
        const classOptionB = searchType === SearchType.Class ? classes.find(c => c.classId === optionB.value) : null;

        return searchType === SearchType.Teacher
          ? optionA.title.localeCompare(optionB.title)
          : classOptionA.grade !== classOptionB.grade ? classOptionA.grade - classOptionB.grade : classOptionA.classNumber - classOptionB.classNumber;
      })
      : prev.filter(v => v !== value)
    );
  };

  const handleClickPrevWeek = () => {
    if (selectedWeekRangeIdx === null || selectedWeekRangeIdx <= 0) return;
    setSelectedWeekRangeIdx(selectedWeekRangeIdx - 1);
  }

  const handleClickNextWeek = () => {
    if (selectedWeekRangeIdx === null || selectedWeekRangeIdx >= operationWeeklyDates.length - 1) return;
    setSelectedWeekRangeIdx(selectedWeekRangeIdx + 1);
  }

  const handleClickThisWeek = () => {
    if(!operationWeeklyDates || operationWeeklyDates.length === 0) {
      // console.warn('No operation weekly dates available to select this week.');
      return;
    }

    const today = TimeUtils.getTodayAsNumber();
    const todayWeek = operationWeeklyDates.find(week => week.weekRange[0] <= today && week.weekRange[1] >= today);
    const newIdx = todayWeek?.value || 0;

    setSelectedWeekRangeIdx(newIdx);
    };

  // const initialize = async () => {
  //   await getTimetableInfoByActiveDate();
  // };
  const resetAllStates = () => {};

  const getTeacherCourseNames = (teacherId: string) => {
    const teacherCourseBases = teacherCourseBaseMap[teacherId] || [];
    return teacherCourseBases.map(tc => courseBaseMap[tc.courseBaseId]?.displayedTitle).filter(c => !!c).join(', ');
  };

  const getMaxPeriod = (teacherDailyLessons: DailyLesson[]) => {
    const configMaxPeriod = timetableConfig?.maxPeriod || 7;
    return Math.max(...teacherDailyLessons.map(lesson => lesson.period), configMaxPeriod);
  };

  const handleClickCell = (searchType: SearchType, dailyLesson: DailyLesson, lessonDate: number, period: number, teacherId?: string, classId?: string) => {
    if (!lessonDate || !period) return;
    if (searchType === SearchType.Teacher && !teacherId) return;
    if (searchType === SearchType.Class && !classId) return;

    const selectedTeacherId = searchType === SearchType.Teacher ? teacherId : dailyLesson.lessonTeacherIds[0];
    setSelectedCell(prev =>
      (
        !!prev && (prev.teacherId === selectedTeacherId || prev.classId === classId) && prev.lessonDate === lessonDate && prev.period === period
          ? null
          : { teacherId: selectedTeacherId, classId: dailyLesson.classId, lessonDate, period, dailyLesson}
      )
    );
  };

  const handleClickOpenDailyLessonModal = (dailyLesson: DailyLesson, type: TimetableDailyLessonChangeType) => {  
    setDailyLessonModalOptions({
      teacherId: selectedCell?.teacherId || null,
      classId: selectedCell?.classId || null,
      lessonDate: selectedCell?.lessonDate || null,
      period: selectedCell?.period || null,
      dailyLesson: dailyLesson, 
    });

    setSelectedLessonChangeType(type);
    setChangeLessonModal(true);

    setSelectedCell(null);
  };

  const handleClickLessonChangeManagement = () => {
    onChangeSubMenu && onChangeSubMenu("LessonChangeManagement", {
      initStatus: TimetableLessonChangeStatus.Pending,
    });
  };

  const isConcurrentCombined = (dailyLesson: DailyLesson) => {
    if (!dailyLesson || !dailyLesson.concurrentCourseId) return false;

    const concurrentTeachersList = (concurrentCourseMap[dailyLesson.concurrentCourseId] || [])
      .filter(l => l.lessonDate === dailyLesson.lessonDate && l.period === dailyLesson.period)
      .map(l => l.lessonTeacherIds);

    return concurrentTeachersList.filter(teachers => TypeUtils.arraysEqual(teachers, dailyLesson.lessonTeacherIds)).length > 1;
  }

  // === UseEffects ===
  useEffect(() => {
    // initialize();
    return () => resetAllStates();
  }, []);

  useEffect(() => {
    if (!selectedTimetable) return;

    const prevSelectedTimetableId = prevSelectedTimetableIdRef.current;
    if (prevSelectedTimetableId !== selectedTimetable.timetableId) {
      setSelectedWeekRangeIdx(-1);
    }

    setSelectedTimetableId(selectedTimetable?.timetableId);
    setOperationStartDate(selectedTimetable?.operationStartDate);
    setOperationEndDate(selectedTimetable?.operationEndDate);
    setLessonChanges({});
    prevSelectedTimetableIdRef.current = selectedTimetable.timetableId;
    }, [selectedTimetable]);

  // Prefetch lesson change contents so tooltips can show without hover
  useEffect(() => {
    if (!dailyLessons || dailyLessons.length === 0) return;
    if(teacherMap === null || Object.keys(teacherMap).length === 0) return;
    if(courseMap === null || Object.keys(courseMap).length === 0) return;

    const targets = dailyLessons.filter(dl =>
      !!dl && !!dl.lessonChangeId &&
      [TimetableDailyLessonChangeType.Exchange, TimetableDailyLessonChangeType.Adjustment].includes(dl.changeType) &&
      !lessonChanges[dl.lessonChangeId]
    );

    if (targets.length === 0) return;

    // Fire and forget; populate lessonChanges as they resolve
    targets.forEach(dl => {
      getLessonChangeContents(dl).catch(() => {});
    });
  }, [dailyLessons, teacherMap, courseMap]);

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
    if (!operationWeeklyDates) return;
    handleClickThisWeek();
  }, [operationWeeklyDates]);

  useEffect(() => {
    // searchType 변경은 onChange에서 처리하므로, 여기서는 데이터 로드 완료 시에만 초기화
    if (!selectableSearchOptions[searchType]) return;

    setSelectedSearchOptions(selectableSearchOptions[searchType].map(item => item.value));
  }, [selectableSearchOptions]); // searchType 제거: onChange에서 배치 업데이트로 처리

useEffect(() => {
    if (!selectedTimetableId) return;
    setDailyLessons([]);
}, [selectedTimetableId]);

const lastActivatedClassDay = useMemo(() => {
    if (!activatedClassDays || activatedClassDays.length === 0) return null;
    return activatedClassDays.reduce((latest, current) => current.dayOfWeek > latest.dayOfWeek ? current : latest);
}, [activatedClassDays]);


useEffect(() => {
    if (!selectedTimetableId || selectedWeekRangeIdx < 0 || !operationWeeklyDates || !operationWeeklyDates[selectedWeekRangeIdx]) return;

    setLessonChanges({});
    fetchToGetCountOfRequestedLessonChange();
    fetchDailyLessons();
  }, [selectedTimetableId, selectedWeekRangeIdx, operationWeeklyDates]);

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (changeLessonModal || !selectedCell) return;

      const target = event.target as HTMLElement | null;
      if (!target || target.closest('.side-modal') || target.closest('.hi-modal')) return;

      const insideCell =
        target.closest('.btn-table-cell') ||
        target.closest('.option-layer');

      if (!insideCell) {
        setSelectedCell(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCell]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.querySelectorAll<HTMLButtonElement>('.btn-table-cell.selected').forEach(el => el.classList.remove('selected'));

    if (!selectedCell) return;

    const optionLayer = root.querySelector('.option-layer');
    if (!optionLayer) return;

    const td = optionLayer.closest('td');
    if (!td) return;

    const btn = td.querySelector<HTMLButtonElement>('.btn-table-cell');
    if (btn) btn.classList.add('selected');
  }, [selectedCell]);

  
  return (
    <div ref={rootRef} className={styles.timetableManagement}>      
      <HiCard color="var(--bg-secondary-subtlest)" className="week-select mt-6 flex-row justify-center !items-center gap-2">
        <HiButton type="button" variant="link" onClick={handleClickPrevWeek} disabled={selectedWeekRangeIdx === null || selectedWeekRangeIdx === 0}>
          <ChevronLeft size={24} strokeWidth={1.6}/>
        </HiButton>
        <HiSelectBox
          className="lg line-h-md"
          value={selectedWeekRangeIdx}
          items={operationWeeklyDates}
          onChange={setSelectedWeekRangeIdx}
          emptyTitle={"주간 선택"}
          renderTrigger={({ value, isOpen, disabled, readonly, toggle, getLabel }) => (
            <HiButton variant="link" size="lg" className="selected" disabled={disabled} onClick={toggle}>
              <div className="flex items-center gap-2 leading-none">
                <span>{operationWeeklyDates[selectedWeekRangeIdx]?.formattedDate}</span>
                <Calendar size={20} strokeWidth={1.6} color={isOpen ? 'var(--text-primary-base)' : 'var(--text-neutral-strong)'} />
              </div>
            </HiButton>
          )}
        />
        <HiButton type="button" variant="link" onClick={handleClickNextWeek} disabled={selectedWeekRangeIdx === null || selectedWeekRangeIdx === operationWeeklyDates.length - 1}>
          <ChevronRight size={24} strokeWidth={1.6}/>
        </HiButton>
        {isOperating && <HiButton type="button" variant="tertiary" size="xs" className="ml-2" onClick={handleClickThisWeek}>이번주</HiButton>}
      </HiCard>
      <div className="table-head mt-5">
        <div className="select-area gap-2 flex">
          <HiSelectBox
            style={{width : '200px'}}
            value={searchType}
            items={searchTypeList}
            onChange={(val) => {
              // searchType과 selectedSearchOptions를 한 번에 업데이트해 더블 렌더링(튕김) 방지
              const newOptions = selectableSearchOptions[val]?.map((item: any) => item.value) ?? [];
              setSearchType(val);
              setSelectedSearchOptions(newOptions);
            }}
            emptyTitle={"구분 선택"}
            />
          <HiSelectBox
            style={{width : '240px'}}
            className={`type01${filterTouched && selectedSearchOptions.length > 0 && selectedSearchOptions.length < selectableSearchOptions[searchType].length ? ' is-filtered' : ''}`}
            value={selectedSearchOptions}
            items={selectableSearchOptions[searchType]}
            onChange={v => {
              setSelectedSearchOptions(v);
              setFilterTouched(false);
            }}
            onClickOutside={() => {
              if (selectedSearchOptions.length > 0) setFilterTouched(true);
            }}
            emptyTitle={'선택'}
            defaultValue={'선택'}
            renderButtonType={() => {
              if (selectedSearchOptions.length > 0 && selectedSearchOptions.length < selectableSearchOptions[searchType].length) {
                if (searchType === SearchType.Teacher) {
                  return <>{<span className='text-text-primary-base'>{`${selectedSearchOptions.length}명 선택`}</span>}</>;
                } else if (searchType === SearchType.Class) {
                  return <>{<span className='text-text-primary-base'>{`${selectedSearchOptions.length}개 선택`}</span>}</>;
                } else {
                  return <>선택됨</>;
                }
              } else if (selectedSearchOptions.length > 0 && selectedSearchOptions.length === selectableSearchOptions[searchType].length) {
                return <>전체</>;
              } else {
                return <>선택</>;
              }
            }}
            renderCustomOption={(items) => (
              <>
                <div className="item">
                  <input
                    type="checkbox"
                    id="check-all"
                    checked={isAllChecked}
                    onChange={toggleSelectAll}
                  />
                  <label htmlFor="check-all">
                    <span className='!text-b3'>전체</span>
                  </label>
                </div>
                {items.map((item: any) => (
                  <div className="item
                  " key={item.value}>
                    <input
                      type="checkbox"
                      id={`check-${item.value}`}
                      value={item.value}
                      checked={selectedSearchOptions.includes(item.value)}
                      onChange={e => handleClickSearchOption(item.value, e.target.checked)}
                    />
                    <label className='w-full flex' htmlFor={`check-${item.value}`}>
                      <span className='truncate !text-b3'>{item.title}</span>
                    </label>
                  </div>
                ))}
              </>
            )}
          />
        </div>
        <div className="btn-area gap-2">
          <HiButton type="button" variant="tertiaryBlue" onClick={() => setChangeClassScheduleModal(true)}>학급 일정 변경</HiButton>
          <HiButton type="button" variant="tertiaryBlue" onClick={() => setChangeLessonModal(true)}>수업 변경</HiButton>
          <HiButton type="button" 
          variant={lessonChangeRequestedCount > 0 ? '' : 'tertiary'} 
          className={lessonChangeRequestedCount > 0 ? '!bg-graphic-coral' : ''}
          onClick={handleClickLessonChangeManagement}>수업 변경 신청 <strong className="ml-1">{lessonChangeRequestedCount}건</strong></HiButton>
        </div>
      </div>
      <div className="tb-row mt-3">
        {/* 교사 시간표 */}
        {searchType === SearchType.Teacher && !!selectedSearchOptions &&
          selectedSearchOptions.map(teacherId => {
            const teacherDailyLessons = teacherDailyLessonMap[teacherId] || [];
            const maxPeriod = getMaxPeriod(teacherDailyLessons);
            return (
              <div className="tb-col-2 my-4" key={`timetable-teacher-${teacherId}`}>
                <div className="table-content table-form time-table">
                  <div className="h4-tit">
                    <h4>{teacherMap[teacherId]?.teacherName}</h4>
                    <p className="period"> {getTeacherCourseNames(teacherId)}</p>
                  </div>
                  <table>
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
                      {maxPeriod > 0 &&
                        Array.from({ length: maxPeriod }).map((_, periodIdx) => (
                          <tr key={`selected-period-index-${periodIdx}-${teacherId}`}>
                            <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                            {lessonDays.map((d, dayIdx) => (
                              <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                                {renderTeacherLessons(d.lessonDate, periodIdx + 1, teacherId)}
                                {!!selectedCell && (selectedCell.teacherId === teacherId && selectedCell.lessonDate === d.lessonDate && selectedCell.period === periodIdx + 1) &&
                                  <div className='option-layer' >
                                    <div className={`option-list custom-scr sm`}>
                                      {selectedCell?.dailyLesson?.changeType === TimetableDailyLessonChangeType.None
                                        ? <>
                                            {
                                              !!selectedCell &&
                                              !!selectedCell.dailyLesson &&
                                              selectedCell.dailyLesson.changeType === TimetableDailyLessonChangeType.None &&
                                              !selectedCell.dailyLesson.concurrentCourseId &&
                                              !selectedCell.dailyLesson.consecutiveGroupId &&
                                              <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Exchange)}>수업교체</HiButton>
                                            }
                                            <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Adjustment)}>결,보강</HiButton>
                                            {
                                              !isConcurrentCombined(selectedCell?.dailyLesson) &&
                                              <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Combination)}>합반배정하기</HiButton>
                                            }
                                            <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Multiple)}>복수 교사 배정하기</HiButton>
                                          </>
                                        : <>
                                            <HiButton variant="link" className="item text-graphic-red" onClick={() => handleClickRecoverLessonChange(selectedCell?.dailyLesson)}>관리자취소</HiButton>
                                          </>
                                      }
                                    </div>
                                  </div>
                                }
                              </td>
                            ))}
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        {/* 학급 시간표 */}
        {searchType === SearchType.Class && !!selectedSearchOptions &&
          selectedSearchOptions.map(classId => {
            const classDailyLessons = classDailyLessonMap[classId] || [];
            const maxPeriod = getMaxPeriod(classDailyLessons);
            const clazz = classMap[classId];
            return (
              <div className="tb-col-2 my-4" key={`timetable-class-${classId}`}>
                <div className="table-content table-form time-table">
                  <div className="h4-tit h-6">
                    <h4>{!!clazz && TimetableDisplayUtils.formatFullClassName(clazz)}</h4>
                    {/* <p className="period"> {getTeacherCourseNames(classId)}</p> */}
                  </div>
                  <table>
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
                      {maxPeriod > 0 &&
                        Array.from({ length: maxPeriod }).map((_, periodIdx) => (
                          <tr key={`selected-period-index-${periodIdx}-${classId}`}>
                            <td className="th">{adjustDisplayedPeriod(periodIdx)}</td>
                            {lessonDays.map((d, dayIdx) => (
                              <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                                {renderClassLessons(d.lessonDate, periodIdx + 1, classId)}
                                {!!selectedCell && (selectedCell.classId === classId && selectedCell.lessonDate === d.lessonDate && selectedCell.period === periodIdx + 1) &&
                                  <div className='option-layer' >
                                    <div className={`option-list custom-scr sm`}>
                                      {selectedCell?.dailyLesson?.changeType === TimetableDailyLessonChangeType.None
                                        ? <>
                                            {
                                              !!selectedCell && 
                                              !!selectedCell.dailyLesson && 
                                              selectedCell.dailyLesson.changeType === TimetableDailyLessonChangeType.None &&
                                              !selectedCell.dailyLesson.concurrentCourseId &&
                                              !selectedCell.dailyLesson.consecutiveGroupId &&
                                              <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Exchange)}>수업교체</HiButton>
                                            }
                                            <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Adjustment)}>결,보강</HiButton>
                                            {
                                              !isConcurrentCombined(selectedCell?.dailyLesson) &&
                                              <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Combination)}>합반배정하기</HiButton>
                                            }
                                            <HiButton variant="link" className="item" onClick={() => handleClickOpenDailyLessonModal(selectedCell?.dailyLesson, TimetableDailyLessonChangeType.Multiple)}>복수 교사 배정하기</HiButton>
                                          </>
                                        : <>
                                            <HiButton variant="link" className="item text-graphic-red" onClick={() => handleClickRecoverLessonChange(selectedCell?.dailyLesson)}>관리자취소</HiButton>
                                          </>
                                      }
                                    </div>
                                  </div>
                                }
                              </td>
                            ))}
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

      </div>
      <DailyLessonsModal
        selectedTimetable={selectedTimetable}
        isOpen={changeLessonModal}
        setIsOpen={setChangeLessonModal}
        selectedLessonChangeType={selectedLessonChangeType}
        setSelectedLessonChangeType={setSelectedLessonChangeType}
        reload={() => fetchDailyLessons()}
        options={dailyLessonModalOptions}
        isManagerView={true}
      />
      <ChangeClassScheduleModal
        selectedTimetable={selectedTimetable}
        isOpen={changeClassScheduleModal}
        setIsOpen={setChangeClassScheduleModal}
        reload={fetchDailyLessons}      
      /> 
    </div>
  );
};


/*
//수업 변경 관리 탭
interface LessonChangeManagementProps {
  selectedTimetable?: TimetableIndex | null;
}
const LessonChangeManagement: React.FC<LessonChangeManagementProps> = ({ selectedTimetable }) => {

  // === Contexts ===
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();

  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();

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


  // === States ===
  const [ selectedTimetableId, setSelectedTimetableId ] = useState<string | null>('');
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);

  const [ lessonChanges, setLessonChanges ] = useState<TimetableLessonChange[]>([]); // 수업 변경 내역 데이터
  const [ selectedStartDate, setSelectedStartDate ] = useState<number | null>(null);
  const [ selectedEndDate, setSelectedEndDate ] = useState<number | null>(null);
  const [ searchKeyword, setSearchKeyword ] = useState<string>('');   // 검색어( 변경 사유 )
  const [ selectedStatus, setSelectedStatus ] = useState<TimetableLessonChangeStatus[]>([]);  // 변경 상태 필터 (승인/대기/취소,반려,처리불가 등)
  const [ hasPendingRequests, setHasPendingRequests ] = useState<boolean>(false);
  const [ selectedLessonChange, setSelectedLessonChange ] = useState<TimetableLessonChange | null>(null); // 선택된 수업 변경 내역 상세 정보 보기용 상태
  const [ selectedLessonChangeIds, setSelectedLessonChangeIds ] = useState<string[]>([]); // 체크된 수업 변경 내역 ID 목록
  const [ lessonChangeRequestModal, setLessonChangeRequestModal ] = useState<boolean>(false); // 수업변경신청 모달 props 상태
  const [ changeLessonModal, setChangeLessonModal ] = useState<boolean>(false); // 수업변경 모달 props 상태
  const [ selectedLessonChangeType, setSelectedLessonChangeType ] = useState<TimetableDailyLessonChangeType>(TimetableDailyLessonChangeType.Exchange); // 수업변경 모달 내 수업 변경 종류 상태
  const [ selectedLessonChangeTypes, setSelectedLessonChangeTypes ] = useState<TimetableDailyLessonChangeType[]>( Object.keys(lessonChangeTypeMap) as TimetableDailyLessonChangeType[] ); // 변경 종류 필터 (수업교체, 결/보강, 합반배정, 복수교사, 수업변경, 수업추가)

  const [ searchDateType, setSearchDateType ] = useState<DateType>(DateType.All);
  const [ currentPage, setCurrentPage ] = useState<number>(0);
  const [ pageSize, setPageSize ] = useState<number>(50);
  const [ sortField, setSortField ] = useState<string>('requestedTimestamp');
  const [ sortOrder, setSortOrder ] = useState<'asc' | 'desc'>('desc');
  const [ hasMore, setHasMore ] = useState<boolean>(true); // 무한 스크롤용( 더 불러올 데이터가 있는지 여부 )
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const observerRef = useRef(null); // 무한 스크롤용 옵저버 레퍼런스


  // === Utils for date handling ===
  const sourceCalendarRef = useRef(null);
  const targetCalendarRef = useRef(null);

  const handleBeforeSelectStartDate = (date) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);
    const endDateNum = TimeUtils.getDateAsNumber(new Date(selectedEndDate));

    if (!!selectedEndDate && paramDateNum > endDateNum) {
      setSelectedEndDate(null);
    }
    return true;
  };

  const handleBeforeSelectEndDate = (date) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);
    const startDateNum = TimeUtils.getDateAsNumber(new Date(selectedStartDate));

    if (!!selectedStartDate && paramDateNum < startDateNum) {
      showToast('시작 날짜보다 과거 날짜를 선택할 수 없습니다.', 3000);
      return false;
    }
    return true;
  };

  const formatExpirationDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const day = date.getDate();
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일(${weekDay})`;


  };

  // === UseMemo ===
  const classNamesOnPending = useMemo(() => {
    let classNames = [];
    if (!!selectedStatus && selectedStatus.includes(TimetableLessonChangeStatus.Pending)) classNames.push('active');
    if (hasPendingRequests) classNames.push('is-new');

    return classNames.join(' ');
  }, [selectedStatus, hasPendingRequests]);

  const allRowsChecked = useMemo(() => {
    return selectedLessonChangeIds.length === lessonChanges.length && selectedLessonChangeIds.length > 0;
  }, [lessonChanges, selectedLessonChangeIds]);

  const isAllChecked = useMemo(() => {
    return selectedLessonChangeTypes.length === Object.keys(lessonChangeTypeMap).length;
  }, [selectedLessonChangeTypes]);


  const fetchToCheckIfPendingExists = async () => {
    if (!selectedTimetableId) {
      setHasPendingRequests(false);
      return;
    }

    const api = new Hc2Timetables();
    const query = {
      changeType: TimetableLessonChangeType.Lesson
    };

    try {
      const res = await api.getRequestedLessonChangesCountPending(selectedTimetableId, query);

      const { requestCount } = res.data as { requestCount: number };
      setHasPendingRequests(requestCount > 0);
    } catch (error) {
      console.error('수업 변경 이력 조회 중 오류 발생:', error);
      setHasPendingRequests(false);
      return;
    }
  };

  const fetchLessonChanges = async (forceSearch : boolean) => {
    if (!forceSearch && (!hasMore || isLoading)) return;

    const pageToFetch = forceSearch ? 0 : currentPage;
    setCurrentPage(pageToFetch);

    const api = new Hc2Timetables();
    const query = {
      changeType: TimetableLessonChangeType.Lesson,
      lessonChangeTypes: selectedLessonChangeTypes,
      statuses: selectedStatus,
      startTimestamp: selectedStartDate,
      endTimestamp: selectedEndDate,
      keyword: !!searchKeyword ? searchKeyword.trim() : null,
      page: pageToFetch,
      size: pageSize,
      sort: `${sortField},${sortOrder}`,
    }

    setIsLoading(true);
    try {
      const res = await api.getLessonChangesLessonchanges(
        selectedTimetableId,
        // @ts-ignore
        query,
        { paramsSerializer: (params: any) => qs.stringify(params, {arrayFormat: 'repeat'})}
      );

      const { page, _embedded } = (res.data as PageResponse<TimetableLessonChange>);
      const LessonChanges = _embedded ? _embedded.lessonChanges : [];

      setOnLessonChanges(LessonChanges, forceSearch);

      if (page.number + 1 >= page.totalPages) {
        setHasMore(false);
      } else {
        setCurrentPage(prev => prev + 1);
      }

    } catch (error) {
      console.error('수업 변경 이력 조회 중 오류 발생:', error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setHasMore(true);
    await fetchLessonChanges(true);
  };

  // === Methods ===
  const [prevSearchKeyword, setPrevSearchKeyword] = useState<string>('');

  useEffect(() => {
    // 검색어 리셋 버튼 이벤트가 없어 현 코드로 초기화 감지
    if(searchKeyword === '' && prevSearchKeyword !== '') {
      handleAfterResetSearchKeyword();
    }

    setPrevSearchKeyword(searchKeyword);
  }
  , [searchKeyword]);

  const handleAfterResetSearchKeyword = async () => {
    // setSearchKeyword('');
    setHasMore(true);
    await fetchLessonChanges(true);
  };

  const handleBlurSearchKeyword = async (e: React.FocusEvent<HTMLInputElement>) => {
    setSearchKeyword((e.target as HTMLInputElement).value);
    setHasMore(true);
    await fetchLessonChanges(true);
  };

  const handleAllRowsCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLessonChangeIds(lessonChanges.map(lc => lc.lessonChangeId));
    } else {
      setSelectedLessonChangeIds([]);
    }
  };

  const handleRowCheck = (lessonChangeId: string, checked: boolean) => {
    setSelectedLessonChangeIds(prev => checked ? [...prev, lessonChangeId] : prev.filter(i => i !== lessonChangeId));
  };

  const handleAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedLessonChangeTypes(Object.keys(lessonChangeTypeMap) as TimetableDailyLessonChangeType[]);
    } else {
      setSelectedLessonChangeTypes([]);
    }
  };

  const handleTypeChange = (type: TimetableDailyLessonChangeType, checked: boolean) => {
    setSelectedLessonChangeTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleClickLessonChange = (lessonChange: TimetableLessonChange) => {
    setSelectedLessonChange(lessonChange);
    setLessonChangeRequestModal(true);
  };

  const setOnLessonChanges = (lessonChanges: TimetableLessonChange[], forceSearch: boolean) => {
    const formattedLessonChanges = lessonChanges
      .map(lessonChange => {
        if (!lessonChange.contents) return lessonChange;

        const originSelectedName = lessonChange.selectedClassName;
        if (Array.isArray(originSelectedName) && originSelectedName.length > 0 && TypeUtils.isUUID(originSelectedName[0])) {
          const [classId, extraCount] = originSelectedName;
          const classLabel = classMap[classId] ? TimetableDisplayUtils.formatFullClassName(classMap[classId]) : classId;
          const suffix = originSelectedName.length === 2 && extraCount ? ` 외 ${extraCount}개반` : '';
          lessonChange.selectedClassName = [ `${classLabel}${suffix}` ];
        }

        const contents = JSON.parse(lessonChange.contents);
        if (!Array.isArray(contents)) return lessonChange;

        const formattedContents = contents.map(content => {
          if (!content.lessonDate || !content.period) return content;

          const lessonDate = TimeUtils.getNumberAsDate(content.lessonDate);
          const formattedDate = `${lessonDate.getMonth() + 1}/${lessonDate.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][lessonDate.getDay()]}${startPeriod ? content.period : Number(content.period) - 1})`;
          

          const fromCourse = courseMap[content.sourceCourseId]?.displayedTitle.trim() || '';
          const fromTeacher = (content.sourceTeacherIds || []).map(teacherId => teacherMap[teacherId]?.teacherName).join(', ');

          const toCourse = courseMap[content.targetCourseId]?.displayedTitle.trim() || '';
          const toTeacher = (content.targetTeacherIds || []).map(teacherId => teacherMap[teacherId]?.teacherName).join(', ');

          return {date: formattedDate, from: `${fromCourse} ${fromTeacher}`, to: `${toCourse} ${toTeacher}`};
        });

        lessonChange.contents = JSON.stringify(formattedContents);
        return lessonChange;
      });

    setLessonChanges(prev => forceSearch ? [...formattedLessonChanges] : [...prev, ...formattedLessonChanges]);
  };

  // const initialize = async () => {
  //   await getTimetableInfoByActiveDate();
  // };

  const resetAllStates = () => {};

  const handleChangeStartDate = (closedTimestamp: number) => {
    const d = new Date(closedTimestamp);
    d.setHours(0, 0, 0, 0);
    setSelectedStartDate(d.getTime());
  };

  const handleChangeTargetDate = (closedTimestamp: number) => {
    const d = new Date(closedTimestamp);
    d.setHours(23, 59, 59, 999);
    setSelectedEndDate(d.getTime());
  };

  const convertTimestampToDateNum = (timestamp: number | null) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
      .format(date)
      .replace(/\s/g, '')
      .replace(/\.$/, '');
  };

  const handleRefreshLessonChanges = (lessonChange: TimetableLessonChange) => {
    setLessonChanges(prev => {
      const index = prev.findIndex(lc => lc.lessonChangeId === lessonChange.lessonChangeId);
      if (index !== -1) {
        const updated = { ...prev[index], ...lessonChange };
        return [...prev.slice(0, index), updated, ...prev.slice(index + 1)];
      }
      return prev;
    });
    setLessonChangeRequestModal(false);
  };

  const handleChangeSearchDateType = (type: DateType) => {
    setSearchDateType(type);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  // === UseEffects ===
  useEffect(() => {
    if (!timetableConfig) {
      return;
    }

    setStartPeriod(timetableConfig?.startPeriod ?? 1);
  }, [timetableConfig]);


  useEffect(() => {
    if (lessonChanges.length === 0) return;

    if (!observerRef.current || !hasMore) return;

    const observerCallback = (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading) {
        fetchLessonChanges(false);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [currentPage, hasMore, isLoading, lessonChanges]);

  useEffect(() => {
    // initialize();
    return () => resetAllStates();
  }, []);

  useEffect(() => {
    if (!selectedTimetableId || (!!selectedStartDate && !selectedEndDate) || (!selectedStartDate && !!selectedEndDate)) return;

    if (selectedLessonChangeTypes.length === 0) {
      setLessonChanges([]);
      return;
    }

    fetchToCheckIfPendingExists();
    setHasMore(true);
    fetchLessonChanges(true);
  }, [selectedTimetableId, searchDateType, selectedStartDate, selectedEndDate, selectedLessonChangeTypes, selectedStatus, sortField, sortOrder]);

  useEffect(() => {
    setSelectedTimetableId(selectedTimetable?.timetableId);
  }, [ selectedTimetable ]);

  return (
    <div className={styles.lessonChangeManagement}>
      <div className='tab-nav type03'>
        <button
          type="button"
          className={selectedStatus.length === 0 ? 'active' : ''}
          onClick={() => setSelectedStatus([])}
        >전체</button>
        <button
          type="button"
          className={!!selectedStatus && selectedStatus.includes(TimetableLessonChangeStatus.Completed) ? 'active' : ''}
          onClick={() => setSelectedStatus([TimetableLessonChangeStatus.Completed])}
        >승인완료</button>
        <button
          type="button"
          className={classNamesOnPending}
          onClick={() => setSelectedStatus([TimetableLessonChangeStatus.Pending])}
        >승인대기</button>
        <button
          type="button"
          className={!!selectedStatus && [TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Ignored].some(s => selectedStatus.includes(s)) ? 'active' : ''}
          onClick={() => setSelectedStatus([TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Ignored])}
        >취소/반려/처리불가/삭제</button>
      </div>
      <div className="gray-box type01 mt-6 p-7 radius-lg">
        <div className="form-group-inline">
          <label>기간</label>
          <div className="form-ctr">
            <input
              type="radio"
              name="dateType-on-lesson-change"
              id="all-date-on-lesson-change"
              checked={searchDateType === DateType.All}
              onChange={() => handleChangeSearchDateType(DateType.All)}
            />
            <label htmlFor="all-date-on-lesson-change"><span>전체</span></label>
          </div>
          <div className="form-ctr">
            <input
              type="radio"
              name="dateType-on-lesson-change"
              id="date-range-on-lesson-change"
              checked={searchDateType === DateType.Range}
              onChange={() => handleChangeSearchDateType(DateType.Range)}
            />
            <label htmlFor="date-range-on-lesson-change"><span>기간</span></label>
          </div>
          <div>
            <DatetimePicker
              timestamp={selectedStartDate}
              onChange={closedTimestamp => handleChangeStartDate(closedTimestamp)}
              formatter={formatExpirationDate}
              allowPast={true}
              calendar={sourceCalendarRef}
              onBeforeSelect={selected => handleBeforeSelectStartDate(selected)}
              withTime={false}
              isShowPrevMonth={true}
              defaultToToday={!selectedStartDate}
              disabled={searchDateType === DateType.All}
              autoApply // 하단 확인 취소 버튼 없이 자동 선택
            />
            <span className='ml-1 mr-1'> ~ </span>
            <DatetimePicker
              timestamp={selectedEndDate}
              onChange={closedTimestamp => handleChangeTargetDate(closedTimestamp)}
              formatter={formatExpirationDate}
              allowPast={true}
              calendar={targetCalendarRef}
              onBeforeSelect={selected => handleBeforeSelectEndDate(selected)}
              withTime={false}
              isShowPrevMonth={true}
              defaultToToday={!selectedEndDate}
              disabled={searchDateType === DateType.All}
              autoApply // 하단 확인 취소 버튼 없이 자동 선택
            />
          </div>
        </div>
        <div className="form-group-inline change-list">
          <label>변경 종류</label>
          <div className="form-ctr">
            <input
              type="checkbox"
              id="change-type-all"
              checked={isAllChecked}
              onChange={(e) => handleAllChange(e.target.checked)}
            />
            <label htmlFor="change-type-all">
              <span>전체</span>
            </label>
          </div>
          {Object.keys(lessonChangeTypeMap).map(item => (
            <div className="form-ctr" key={lessonChangeTypeMap[item]}>
              <input
                type="checkbox"
                id={`change-type-${item}`}
                checked={selectedLessonChangeTypes.includes(item as TimetableDailyLessonChangeType)}
                onChange={e => handleTypeChange(item as TimetableDailyLessonChangeType, e.target.checked)}
              />
              <label htmlFor={`change-type-${item}`}>
                <span>{lessonChangeTypeMap[item]}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="table-head mt-5">
        {/* <div className="input-wrap gap-2">
          <i className="ico ico-search ico-gray ico-size-20" ></i>
          <input
            type="text"
            className='pr-9'
            style={{ width: 260 }}
            placeholder="변경 사유 검색"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onBlur={e => handleBlurSearchKeyword(e)}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            spellCheck={false}
          />
          {searchKeyword && (
            <i
              className="ico ico-close-circle-fill ico-size-24 ico-gray absolute"
              onClick={() => setSearchKeyword('')}
            ></i>
          )}
        </div> * /}

        {/* 수동검색 UI 변경 : input -> TextInput component로 변경 * /}
        <TextInput
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          onBlur={e => handleBlurSearchKeyword(e)}
          onKeyDown={e => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          placeholder="변경 사유 검색"
          styles={{ width: 260 }}
          showSearch
          onSearch={() => handleSearch()}
        />

        <div className="btn-area gap-2">
          <button type="button" className="btn btn-tertiary-blue" onClick={() => setChangeLessonModal(true)}>수업변경</button>
          {/* <button type="button" className="btn btn-tertiary" onClick={showComingSoon}>엑셀 다운로드</button>
          <button type="button" className="btn btn-tertiary" onClick={showComingSoon}>하이톡 발송</button> * /}
        </div>
      </div>
      <div className="table-content custom-scr table-box ">
        <table>
          <caption>수업 변경 관리</caption>
          <colgroup>
            {/* <col style={{ width: '3.5%',  maxWidth: '50px', minWidth: '50px'  }} /> * /}
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            <col style={{ width: '7.0%',  maxWidth: '100px' }} />
            <col style={{ width: '24.5%', maxWidth: '350px' }} />
            <col style={{ width: '24.5%', maxWidth: '350px' }} />
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            {/* <col style={{ width: '6.9%',  maxWidth: '100px' }} /> * /}
          </colgroup>
          <thead>
            <tr>
              {/* <th>
                <input
                  type="checkbox"
                  checked={allRowsChecked}
                  onChange={handleAllRowsCheck}
                  disabled={lessonChanges.length === 0}
                  id="table-all-check"
                />
                <label htmlFor="table-all-check" className='inline-flex' ></label>
              </th> * /}
              <th>
                신청일시
                <button
                  type="button"
                  className={`btn btn-link btn-sort ${sortField === 'requestedTimestamp' ? `${sortOrder}` : 'asc'}`}
                  onClick={() => {
                    setSortField('requestedTimestamp');
                    setSortOrder(prev => (sortField === 'requestedTimestamp' && prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <span className="sr-only">정렬</span>
                </button>
              </th>
              <th>작성자</th>
              <th>
                변경 종류
                {/* <button
                  type="button"
                  className="btn btn-link btn-sort"
                >
                  <span className="sr-only">정렬</span>
                </button> * /}
              </th>
              <th>
                학반
                {/* <button
                  type="button"
                  className="btn btn-link btn-sort"
                >
                  <span className="sr-only">정렬</span>
                </button> * /}
              </th>
              <th>변경 내용</th>
              <th>사유</th>
              <th>상태</th>
              {/* <th>알림발송</th> * /}
            </tr>
          </thead>
          <tbody>
            {lessonChanges
              .map((row) => (
                <tr key={row.lessonChangeId}>
                {/* <td>
                  <input
                    type="checkbox"
                    checked={selectedLessonChangeIds.includes(row.lessonChangeId)}
                    onChange={e => handleRowCheck(row.lessonChangeId, e.target.checked)}
                    id={`table-row-check-${row.lessonChangeId}`}
                  />
                  <label htmlFor={`table-row-check-${row.lessonChangeId}`} ></label>
                </td> * /}
                <td onClick={() => handleClickLessonChange(row)}>
                  {new Date(row.requestedTimestamp).toLocaleDateString()}<br />{new Date(row.requestedTimestamp).toLocaleTimeString()}
                </td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {row?.requestedUser?.userName}<br />
                  <span>
                    ({row?.requestedUserAuth === 'MASTER' ? '관리자' : '일반'})
                  </span>
                </td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {lessonChangeTypeMap[row.lessonChangeType]}
                  {!!row.contents && TimetableDailyLessonChangeType.Exchange === row.lessonChangeType && <><br />({JSON.parse(row.contents).length > 2 ? '연쇄교환' : '1:1교환'})</>}
                </td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {(() => {
                    const parts = [
                      ...(Array.isArray(row.selectedGrades) ? row.selectedGrades.map(g => `${g}학년 전체`) : []),
                      ...(Array.isArray(row.selectedClassName) ? row.selectedClassName : [])
                    ].filter(Boolean);
                    return parts.length ? parts.join(', ') : '-';
                  })()}
                </td>
                <td className='text-left' onClick={() => handleClickLessonChange(row)}>
                  {!!row.contents && TimetableDailyLessonChangeType.Exchange === row.lessonChangeType &&
                    JSON.parse(row.contents).map((item, i) => (
                      <React.Fragment key={i}>
                        <span>{item.date} </span>
                        <span className='text-text-neutral-stronger'>{item.from}</span>
                        <span> → {item.to}</span><br />
                      </React.Fragment>
                    ))}
                  {!!row.contents && TimetableDailyLessonChangeType.Exchange !== row.lessonChangeType &&
                    JSON.parse(row.contents).map((item, i) => (
                      <React.Fragment key={i}>
                        <span>{item.date} </span>
                        <span>{item.to}</span>
                      </React.Fragment>
                    ))}
                </td>
                <td className='text-left' onClick={() => handleClickLessonChange(row)}>{row.reason}</td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {/* {[TimetableLessonChangeStatus.Completed, TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled].includes(row.status) && <>{lessonChangeStatusMap[row.status]}</>} * /}
                  {/* {row.status === TimetableLessonChangeStatus.Pending && <>{lessonChangeStatusMap[row.status]}<br /><button className="btn btn-tertiary-blue btn-xs">확인</button></>} * /}
                  {/* {[TimetableLessonChangeStatus.Ignored].includes(row.status) && <span className='text-graphic-red'>{lessonChangeStatusMap[row.status]}</span>} * /}
                  {/* {TimetableLessonChangeStatus.Completed === row.status && <><br/><small className='text-neutral-strong'>{convertTimestampToDateNum(row?.approvedTimestamp)}({row?.approvedUser?.userName})</small></>} * /}
                  {/* {[TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].includes(row.status) && <><br/><small className='text-neutral-strong'>{convertTimestampToDateNum(row?.statusUpdatedTimestamp)}({row?.statusUpdatedUser?.userName})</small></>} * /}
                  {(() => {
                    const label = lessonChangeStatusMap[row.status];
                    return (
                      <>
                        {[TimetableLessonChangeStatus.Ignored, TimetableLessonChangeStatus.Recovered].includes(row.status)
                          ? <span className="text-graphic-red">{label}</span>
                          : <>{label}</>
                        }

                        {row.status === TimetableLessonChangeStatus.Pending && (
                          <>
                            <br />
                            <button className="btn btn-tertiary-blue btn-xs">확인</button>
                          </>
                        )}

                        {row.status === TimetableLessonChangeStatus.Completed && (
                          <>
                            <br />
                            <small className="text-neutral-strong break-all">
                              {convertTimestampToDateNum(row?.approvedTimestamp)}({row?.approvedUser?.userName})
                            </small>
                          </>
                        )}

                        {[TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored, TimetableLessonChangeStatus.Recovered].includes(row.status) && (
                          <>
                            <br />
                            <small className="text-neutral-strong break-all">
                              {convertTimestampToDateNum(row?.statusUpdatedTimestamp)}({row?.statusUpdatedUser?.userName})
                            </small>
                          </>
                        )}
                      </>
                    );
                  })()}
                </td>
                {/* <td>
                  <button className="btn btn-sm btn-link" onClick={showComingSoon}>
                    <i className="ico ico-hitalk ico-gray ico-size-20" ></i>
                  </button>
                </td> * /}
              </tr>
            ))}

            {hasMore && (
              <tr ref={observerRef} style={{ border: 'none' }} />
            )}
            {!isLoading && lessonChanges.length === 0 && (
              <tr>
              <th colSpan={7}>
                <div className="hi-nodata">
                  <p>
                    {searchKeyword
                      ? "검색 결과가 없습니다."
                      : "목록이 없습니다."
                    }
                  </p>
                </div>
              </th>
            </tr>
            )}
          </tbody>
        </table>
      </div>
      <DailyLessonsModal
        selectedTimetable={selectedTimetable}
        isOpen={changeLessonModal}
        setIsOpen={setChangeLessonModal}
        selectedLessonChangeType={selectedLessonChangeType}
        setSelectedLessonChangeType={setSelectedLessonChangeType}
        reload={() => fetchLessonChanges(true)}
      />

      <LessonChangeRequestModal
        isOpen={lessonChangeRequestModal}
        setIsOpen={setLessonChangeRequestModal}
        lessonChange={!!selectedLessonChange ? selectedLessonChange : null}
        emitLessonChange={handleRefreshLessonChanges}
      />
    </div>
  );
};
*/


/*
// 학급 일정 변경 관리 탭
interface ClassScheduleManagementProps {
  selectedTimetable?: TimetableIndex | null;
}
const ClassScheduleManagement: React.FC<ClassScheduleManagementProps> = ({ selectedTimetable }) => {

  // === Contexts ===
  const classes = useClassContext();
  const timetableConfig = useGradeContext();

  const classContext = TimetableClassContext.getInstance();

  const classMap = useMemo(
      () => classContext.classMap || ({} as Record<string, Class>),
      [classes]
  );

  // === States ===
  // const [ schoolId, setSchoolId ] = useState<string>('0aaa2672-d43a-11e9-86da-98be94437cd2');
  const [ selectedTimetableId, setSelectedTimetableId ] = useState<string | null>('');
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);

  const [ changeClassScheduleModal, setChangeClassScheduleModal ] = useState<boolean>(false); // 학급일정변경 모달 상태

  const [ lessonChanges, setLessonChanges ] = useState<TimetableLessonChange[]>([]); // 수업 변경 내역 데이터
  const [ selectedStartDate, setSelectedStartDate ] = useState<number | null>(null);
  const [ selectedEndDate, setSelectedEndDate ] = useState<number | null>(null);
  const [ searchKeyword, setSearchKeyword ] = useState<string>('');   // 검색어( 변경 사유 )
  const [ selectedStatus, setSelectedStatus ] = useState<TimetableLessonChangeStatus[]>([]);  // 변경 상태 필터 (승인/대기/취소,반려,처리불가 등)
  const [ selectedLessonChange, setSelectedLessonChange ] = useState<TimetableLessonChange | null>(null); // 선택된 수업 변경 내역 상세 정보 보기용 상태
  const [ selectedLessonChangeIds, setSelectedLessonChangeIds ] = useState<string[]>([]); // 체크된 수업 변경 내역 ID 목록
  const [ classScheduleRequestModal, setClassScheduleRequestModal ] = useState<boolean>(false); // 학급일정변경 신청 모달 props 상태
  const [ selectedLessonChangeTypes, setSelectedLessonChangeTypes ] = useState<TimetableDailyLessonChangeType[]>( Object.keys(classScheduleTypeMap) as TimetableDailyLessonChangeType[] ); // 변경 종류 필터 (행사처리, 복사, 삭제 등)

  const [ searchDateType, setSearchDateType ] = useState<DateType>(DateType.All);
  const [ currentPage, setCurrentPage ] = useState<number>(0);
  const [ pageSize, setPageSize ] = useState<number>(50);
  const [ sortField, setSortField ] = useState<string>('requestedTimestamp');
  const [ sortOrder, setSortOrder ] = useState<'asc' | 'desc'>('desc');
  const [ hasMore, setHasMore ] = useState<boolean>(true); // 무한 스크롤용( 더 불러올 데이터가 있는지 여부 )
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const observerRef = useRef(null); // 무한 스크롤용 옵저버 레퍼런스

  // === Utils for date handling ===
  const sourceCalendarRef = useRef(null);
  const targetCalendarRef = useRef(null);

  const handleBeforeSelectStartDate = (date) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);
    const endDateNum = TimeUtils.getDateAsNumber(new Date(selectedEndDate));

    if (!!selectedEndDate && paramDateNum > endDateNum) {
      setSelectedEndDate(null);
    }
    return true;
  };

  const handleBeforeSelectEndDate = (date) => {
    const paramDate = new Date(date);
    const paramDateNum = TimeUtils.getDateAsNumber(paramDate);
    const startDateNum = TimeUtils.getDateAsNumber(new Date(selectedStartDate));

    if (!!selectedStartDate && paramDateNum < startDateNum) {
      showToast('시작 날짜보다 과거 날짜를 선택할 수 없습니다.', 3000);
      return false;
    }
    return true;
  };

  const formatExpirationDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const day = date.getDate();
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일(${weekDay})`;
  };

  // === UseMemo ===
  const allRowsChecked = useMemo(() => {
    return selectedLessonChangeIds.length === lessonChanges.length && selectedLessonChangeIds.length > 0;
  }, [lessonChanges, selectedLessonChangeIds]);

  const isAllChecked = useMemo(() => {
    return selectedLessonChangeTypes.length === Object.keys(classScheduleTypeMap).length;
  }, [selectedLessonChangeTypes]);

  
  const fetchLessonChanges = async (forceSearch : boolean) => {
    if (!forceSearch && (!hasMore || isLoading)) return;

    const pageToFetch = forceSearch ? 0 : currentPage;
    setCurrentPage(pageToFetch);

    const api = new Hc2Timetables();
    const query = {
      changeType: TimetableLessonChangeType.Schedule,
      lessonChangeTypes: selectedLessonChangeTypes,
      statuses: selectedStatus,
      startTimestamp: selectedStartDate,
      endTimestamp: selectedEndDate,
      keyword: !!searchKeyword ? searchKeyword.trim() : null,
      page: pageToFetch,
      size: pageSize,
      sort: `${sortField},${sortOrder}`,
    }

    setIsLoading(true);
    try {
      const res = await api.getLessonChangesLessonchanges(
        selectedTimetableId,
        // @ts-ignore
        query,
        { paramsSerializer: (params: any) => qs.stringify(params, {arrayFormat: 'repeat'})}
      );

      const { page, _embedded } = (res.data as PageResponse<TimetableLessonChange>);
      const LessonChanges = _embedded ? _embedded.lessonChanges : [];

      setOnLessonChanges(LessonChanges, forceSearch);

      if (page.number + 1 >= page.totalPages) {
        setHasMore(false);
      } else {
        setCurrentPage(prev => prev + 1);
      }

    } catch (error) {
      console.error('수업 변경 이력 조회 중 오류 발생:', error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // === Methods ===
  const [prevSearchKeyword, setPrevSearchKeyword] = useState<string>('');

  useEffect(() => {
    // 검색어 리셋 버튼 이벤트가 없어 현 코드로 초기화 감지
    if(searchKeyword === '' && prevSearchKeyword !== '') {
      handleAfterResetSearchKeyword();
    }

    setPrevSearchKeyword(searchKeyword);
  }
  , [searchKeyword]);

  const handleAfterResetSearchKeyword = async () => {
    // setSearchKeyword('');
    setHasMore(true);
    await fetchLessonChanges(true);
  };

  const handleBlurSearchKeyword = async (e: React.FocusEvent<HTMLInputElement>) => {
    setSearchKeyword((e.target as HTMLInputElement).value);
    setHasMore(true);
    await fetchLessonChanges(true);
  };

  const handleSearch = async () => {
    setHasMore(true);
    await fetchLessonChanges(true);
  };

  const setOnLessonChanges = (lessonChanges: TimetableLessonChange[], forceSearch: boolean) => {
    const fmt = (dateNum: number, start?: number | null, end?: number | null) => {
      const d = TimeUtils.getNumberAsDate(dateNum);
      const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
      const periodOffset = startPeriod ? 0 : -1
      const period = (start != null && end != null) ? ` ${start + periodOffset}~${end + periodOffset}` : '';
      return `${d.getMonth() + 1}/${d.getDate()} (${weekday}${period})`;
    };
    
    const formattedLessonChanges = lessonChanges
      .map(lessonChange => {
        if (!lessonChange.contents) return lessonChange;

        const originSelectedName = lessonChange.selectedClassName;
        if (Array.isArray(originSelectedName) && originSelectedName.length > 0 && TypeUtils.isUUID(originSelectedName[0])) {
          const [classId, extraCount] = originSelectedName;
          const classLabel = classMap[classId] ? TimetableDisplayUtils.formatFullClassName(classMap[classId]) : classId;
          const suffix = originSelectedName.length === 2 && extraCount ? ` 외 ${extraCount}개반` : '';
          lessonChange.selectedClassName = [ `${classLabel}${suffix}` ];
        }

        const contents = JSON.parse(lessonChange.contents);
        if (!Array.isArray(contents)) return lessonChange;

        const formattedContents = contents.map(content => {
          const {
            sourceDate,
            targetDate,
            sourceStartPeriod,
            sourceEndPeriod,
            targetStartPeriod,
            eventName
          } = content;

          const formattedSourceDate = fmt(sourceDate, sourceStartPeriod, sourceEndPeriod);

          if (targetDate != null) {
            const targetEnd = (targetStartPeriod != null && sourceStartPeriod != null && sourceEndPeriod != null)
              ? targetStartPeriod + (sourceEndPeriod - sourceStartPeriod)
              : (content.targetEndPeriod || null);

            const formattedTargetDate = fmt(targetDate, targetStartPeriod || null, targetEnd || null);
            return { date: `${formattedSourceDate} → ${formattedTargetDate}`, eventName };
          }

          return { date: formattedSourceDate, eventName };
        });

        lessonChange.contents = JSON.stringify(formattedContents);
        return lessonChange;
      });

    setLessonChanges(prev => forceSearch ? [...formattedLessonChanges] : [...prev, ...formattedLessonChanges]);
  };

  const handleAllRowsCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLessonChangeIds(lessonChanges.map(lc => lc.lessonChangeId));
    } else {
      setSelectedLessonChangeIds([]);
    }
  };

  const handleRowCheck = (lessonChangeId: string, checked: boolean) => {
    setSelectedLessonChangeIds(prev => checked ? [...prev, lessonChangeId] : prev.filter(i => i !== lessonChangeId));
  };

  const handleAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedLessonChangeTypes(Object.keys(classScheduleTypeMap) as TimetableDailyLessonChangeType[]);
    } else {
      setSelectedLessonChangeTypes([]);
    }
  };

  const handleTypeChange = (type: TimetableDailyLessonChangeType, checked: boolean) => {
    setSelectedLessonChangeTypes(prev =>
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleChangeStartDate = (closedTimestamp: number) => {
    const d = new Date(closedTimestamp);
    d.setHours(0, 0, 0, 0);
    setSelectedStartDate(d.getTime());
  };

  const handleChangeTargetDate = (closedTimestamp: number) => {
    const d = new Date(closedTimestamp);
    d.setHours(23, 59, 59, 999);
    setSelectedEndDate(d.getTime());
  };

  const handleClickLessonChange = (lessonChange: TimetableLessonChange) => {
    setSelectedLessonChange(lessonChange);
    setClassScheduleRequestModal(true);
  };

  const convertTimestampToDateNum = (timestamp: number | null) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
      .format(date)
      .replace(/\s/g, '')
      .replace(/\.$/, '');
  };

  const resetAllStates = () => {};

  // const initialize = async () => {
  //   await getTimetableInfoByActiveDate();
  // };

  const handleRefreshLessonChanges = (lessonChange: TimetableLessonChange) => {
    setLessonChanges(prev => {
      const index = prev.findIndex(lc => lc.lessonChangeId === lessonChange.lessonChangeId);
      if (index !== -1) {

        const contents = !!lessonChange.contents ? JSON.parse(lessonChange.contents) : null;
        if (!!contents && Array.isArray(contents)) {
          const contents = JSON.parse(lessonChange.contents);

          const formattedContents = contents.map(content => {
            const eventName = lessonChange.eventName;
            return { ...content, eventName };
          });

          lessonChange.contents = JSON.stringify(formattedContents);
        }

        const updated = { ...prev[index], ...lessonChange };
        return [...prev.slice(0, index), updated, ...prev.slice(index + 1)];
      }
      return prev;
    });
    setClassScheduleRequestModal(false);
  };

  const handleChangeSearchDateType = (type: DateType) => {
    setSearchDateType(type);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  // === UseEffects ===
  useEffect(() => {
    if (!timetableConfig) return;

    setStartPeriod(timetableConfig?.startPeriod ?? 1);
  }, [timetableConfig])
  useEffect(() => {
    if (lessonChanges.length === 0) return;

    if (!observerRef.current || !hasMore) return;

    const observerCallback = (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading) {
        fetchLessonChanges(false);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [currentPage, hasMore, isLoading, lessonChanges]);

  useEffect(() => {
    // initialize();
    return () => resetAllStates();
  }, []);

  useEffect(() => {
    // if (!selectedTimetableId) return;
    if (!selectedTimetableId || (!!selectedStartDate && !selectedEndDate) || (!selectedStartDate && !!selectedEndDate)) return;

    if (selectedLessonChangeTypes.length === 0) {
      setLessonChanges([]);
      return;
    }

    setHasMore(true);
    fetchLessonChanges(true);
  }, [selectedTimetableId, searchDateType, selectedStartDate, selectedEndDate, selectedLessonChangeTypes, selectedStatus, sortField, sortOrder]);

  useEffect(() => {
    if (!selectedTimetable) return;

    setSelectedTimetableId(selectedTimetable.timetableId);
  }, [selectedTimetable]);

  return (
    <div className={styles.classScheduleManagement}>
      <div className='tab-nav type03'>
         <button
          type="button"
          className={selectedStatus.length === 0 ? 'active' : ''}
          onClick={() => setSelectedStatus([])}
        >전체</button>
        <button
          type="button"
          className={!!selectedStatus && selectedStatus.includes(TimetableLessonChangeStatus.Completed) ? 'active' : ''}
          onClick={() => setSelectedStatus([TimetableLessonChangeStatus.Completed])}
        >등록완료</button>
        <button
          type="button"
          className={!!selectedStatus && [TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].some(s => selectedStatus.includes(s)) ? 'active' : ''}
          onClick={() => setSelectedStatus([TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored])}
        >취소/처리불가</button>
      </div>
      <div className="gray-box type01 mt-6 p-7 radius-lg">
        <div className="form-group-inline">
          <label>기간</label>
          <div className="form-ctr">
            <input
              type="radio"
              name="date-Type-on-class-schedule"
              id="all-date-on-class-schedule"
              checked={searchDateType === DateType.All}
              onChange={() => handleChangeSearchDateType(DateType.All)}
            />
            <label htmlFor="all-date-on-class-schedule"><span>전체</span></label>
          </div>
          <div className="form-ctr">
            <input
              type="radio"
              name="date-Type-on-class-schedule"
              id="date-range-on-class-schedule"
              checked={searchDateType === DateType.Range}
              onChange={() => handleChangeSearchDateType(DateType.Range)}
            />
            <label htmlFor="date-range-on-class-schedule"><span>기간</span></label>
          </div>
          <div>
            <DatetimePicker
              timestamp={selectedStartDate}
              onChange={closedTimestamp => handleChangeStartDate(closedTimestamp)}
              formatter={formatExpirationDate}
              allowPast={true}
              calendar={sourceCalendarRef}
              onBeforeSelect={selected => handleBeforeSelectStartDate(selected)}
              withTime={false}
              isShowPrevMonth={true}
              defaultToToday={!selectedStartDate}
              disabled={searchDateType === DateType.All}
              autoApply // 하단 확인 취소 버튼 없이 자동 선택
            />
            <span className='ml-1 mr-1'> ~ </span>
            <DatetimePicker
              timestamp={selectedEndDate}
              onChange={closedTimestamp => handleChangeTargetDate(closedTimestamp)}
              formatter={formatExpirationDate}
              allowPast={true}
              calendar={targetCalendarRef}
              onBeforeSelect={selected => handleBeforeSelectEndDate(selected)}
              withTime={false}
              isShowPrevMonth={true}
              defaultToToday={!selectedEndDate}
              disabled={searchDateType === DateType.All}
              autoApply // 하단 확인 취소 버튼 없이 자동 선택
            />
          </div>
        </div>
        <div className="form-group-inline change-list">
          <label>변경 종류</label>
          <div className="form-ctr">
            <input type="checkbox" id="change-type-all-class"
              checked={isAllChecked}
              onChange={(e) => handleAllChange(e.target.checked)}
            />
            <label htmlFor="change-type-all-class"><span>전체</span></label>
          </div>
          {Object.keys(classScheduleTypeMap).map(item => (
            <div className="form-ctr" key={classScheduleTypeMap[item]}>
              <input
                type="checkbox"
                id={`change-type-${item}`}
                checked={selectedLessonChangeTypes.includes(item as TimetableDailyLessonChangeType)}
                onChange={e => handleTypeChange(item as TimetableDailyLessonChangeType, e.target.checked)}
              />
              <label htmlFor={`change-type-${item}`}>
                <span>{classScheduleTypeMap[item]}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="table-head mt-5">
        {/* <div className="input-wrap gap-2">
          <i className="ico ico-search ico-gray ico-size-20" ></i>
          <input
            style={{ width: 260 }}
            className='pr-9'
            type="text"
            placeholder="변경 사유 검색"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onBlur={e => handleBlurSearchKeyword(e)}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            spellCheck={false}
          />
          {searchKeyword && (
            <i
              className="ico ico-close-circle-fill ico-size-24 ico-gray absolute"
              onClick={() => setSearchKeyword('')}
            ></i>
          )}
        </div> * /}

        {/* 수동검색 UI 변경 : input -> TextInput component로 변경 * /}
        <TextInput
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          onBlur={e => handleBlurSearchKeyword(e)}
          onKeyDown={e => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          placeholder="변경 사유 검색"
          styles={{ width: 260 }}
          showSearch
          onSearch={() => handleSearch()}
        />

        <div className="btn-area gap-2">
          <button type="button" className="btn btn-tertiary-blue" onClick={() => setChangeClassScheduleModal(true)}>학급 일정 변경</button>
          {/* <button type="button" className="btn btn-tertiary" onClick={showComingSoon}>엑셀 다운로드</button>
          <button type="button" className="btn btn-tertiary" onClick={showComingSoon}>하이톡 발송</button> * /}
        </div>
      </div>

      <div className="table-content custom-scr table-box ">
        <table>
          <caption>학급 일정 변경 관리</caption>
          <colgroup>
            {/* <col style={{ width: '50px' }} /> * /}
            <col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '350px' }} />
            <col style={{ width: '350px' }} />
            <col style={{ width: '120px' }} />
            {/* <col style={{ width: '100px' }} /> * /}
          </colgroup>
          <thead>
            <tr>
              {/* <th>
                <input
                  type="checkbox"
                  checked={allRowsChecked}
                  onChange={handleAllRowsCheck}
                  disabled={lessonChanges.length === 0}
                  id="table-all-check"                  
                />
                <label htmlFor="table-all-check" ></label>
              </th> * /}
              <th>
                신청일시
                <button
                  type="button"
                  className={`btn btn-link btn-sort ${sortField === 'requestedTimestamp' ? `${sortOrder}` : 'asc'}`}
                  onClick={() => {
                    setSortField('requestedTimestamp');
                    setSortOrder(prev => (sortField === 'requestedTimestamp' && prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <span className="sr-only">정렬</span>
                </button>
              </th>
              <th>작성자</th>
              <th>변경 종류</th>
              <th>학반</th>
              <th>변경 내용</th>
              <th>사유</th>
              <th>상태</th>
              {/* <th>알림발송</th> * /}
            </tr>
          </thead>
          <tbody>
            {lessonChanges.map((row) => (
              <tr key={row.lessonChangeId}>
                {/* <td>
                  <input type="checkbox" checked={selectedLessonChangeIds.includes(row.lessonChangeId)} onChange={e => handleRowCheck(row.lessonChangeId, e.target.checked)} id={`table-row-check-class-${row.lessonChangeId}`} />
                  <label htmlFor={`table-row-check-class-${row.lessonChangeId}`}></label>
                </td> * /}
                <td onClick={() => handleClickLessonChange(row)}>
                  {new Date(row.requestedTimestamp).toLocaleDateString()}<br />{new Date(row.requestedTimestamp).toLocaleTimeString()}
                </td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {row?.requestedUser?.userName}<br />
                  <span>
                    ({row?.requestedUserAuth === 'MASTER' ? '관리자' : '일반'})
                  </span>
                </td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {classScheduleTypeMap[row.lessonChangeType]}
                </td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {(() => {
                    const parts = [
                      ...(Array.isArray(row.selectedGrades) ? row.selectedGrades.map(g => `${g}학년 전체`) : []),
                      ...(Array.isArray(row.selectedClassName) ? row.selectedClassName : [])
                    ].filter(Boolean);
                    return parts.length ? parts.join(', ') : '-';
                  })()}
                </td>
                <td className='text-left' onClick={() => handleClickLessonChange(row)}>
                  {!!row.contents &&
                    JSON.parse(row.contents).map((item, i) => (
                      <React.Fragment key={i}>
                        <span>{item.date} </span> 
                        <span>{item.eventName}</span>
                      </React.Fragment>
                    ))}
                </td>
                <td className='text-left' onClick={() => handleClickLessonChange(row)}>{row.reason}</td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {/* {[TimetableLessonChangeStatus.Completed, TimetableLessonChangeStatus.Canceled].includes(row.status) && <>{lessonChangeStatusMap[row.status]}</>}
                  {[TimetableLessonChangeStatus.Ignored].includes(row.status) && <span className='text-graphic-red'>{lessonChangeStatusMap[row.status]}</span>}
                  {TimetableLessonChangeStatus.Completed === row.status && <><br/><small className='text-neutral-strong'>{convertTimestampToDateNum(row?.approvedTimestamp)}({row?.approvedUser?.userName})</small></>}
                  {[TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].includes(row.status) && <><br/><small className='text-neutral-strong'>{convertTimestampToDateNum(row?.statusUpdatedTimestamp)}({row?.statusUpdatedUser?.userName})</small></>} * /}
                  {(() => {
                    const label = lessonChangeStatusMap[row.status];
                    return (
                      <>
                        {[TimetableLessonChangeStatus.Ignored].includes(row.status)
                          ? <span className="text-graphic-red">{label}</span>
                          : <>{label}</>
                        }

                        {row.status === TimetableLessonChangeStatus.Pending && (
                          <>
                            <br />
                            <button className="btn btn-tertiary-blue btn-xs">확인</button>
                          </>
                        )}

                        {row.status === TimetableLessonChangeStatus.Completed && (
                          <>
                            <br />
                            <small className="text-neutral-strong break-all">
                              {convertTimestampToDateNum(row?.approvedTimestamp)}({row?.approvedUser?.userName})
                            </small>
                          </>
                        )}

                        {[TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].includes(row.status) && (
                          <>
                            <br />
                            <small className="text-neutral-strong break-all">
                              {convertTimestampToDateNum(row?.statusUpdatedTimestamp)}({row?.statusUpdatedUser?.userName})
                            </small>
                          </>
                        )}
                      </>
                    );
                  })()}
                </td>
                {/* <td><button className="btn btn-sm btn-link" onClick={showComingSoon}><i className="ico ico-hitalk ico-gray ico-size-20" /></button></td> * /}
              </tr>
            ))}

            {hasMore && (
              <tr ref={observerRef} style={{ border: 'none' }} />
            )}

            {/* 내용 없을 때 메시지 추가 * /}
            {!isLoading && lessonChanges.length === 0 && (
              <tr>
                <th colSpan={7}>
                  <div className="hi-nodata">
                    <p>
                      {searchKeyword
                        ? "검색 결과가 없습니다."
                        : "목록이 없습니다."
                      }
                    </p>
                  </div>
                </th>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ChangeClassScheduleModal
        selectedTimetable={selectedTimetable}
        isOpen={changeClassScheduleModal}
        setIsOpen={setChangeClassScheduleModal}
        reload={() => fetchLessonChanges(true)}
      />

      <ClassScheduleRequestModal
        isOpen={classScheduleRequestModal}
        setIsOpen={setClassScheduleRequestModal}
        lessonChange={!!selectedLessonChange ? selectedLessonChange : null}
        emitLessonChange={handleRefreshLessonChanges}
      />
    </div>
  );
};
*/


export default TimetableMain;
