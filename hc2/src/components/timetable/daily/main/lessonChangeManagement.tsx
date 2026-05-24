import qs from "qs";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import { TimetableClassContext, TimetableCourseContext, TimetableTeacherContext, useClassContext, useCourseContext, useGradeContext, useTeacherContext } from "../../contexts";
import {  Class, Course, Teacher, TimetableDailyLessonChangeType, TimetableIndex, TimetableLessonChange, TimetableLessonChangeStatus, TimetableLessonChangeType } from "../../core/types";
import {  DateType, PageResponse } from "../../common/types";
import { TimetableDisplayUtils, TimeUtils, TypeUtils } from "../../common/utils";
import { showToast } from "@/unimplementeds/toast";
import { Hc2Timetables } from "../../apis";
import styles from "./lessonChangeManagement.module.scss";
import { DatetimePicker } from "../../components/datetimePicker";
import DailyLessonsModal from "../components/dailyLessonModal";
import { lessonChangeTypeMap } from "./constants";
import LessonChangeRequestModal from "../components/lessonChangeRequestModal";
import { HiTab, HiInput } from '@/components/uiux/';
import { HiButton } from "@/components/uiux/hiButton";
import { useDailyTimetableStore } from "../my/store";
import { a } from "node_modules/vitest/dist/chunks/suite.d.udJtyAgw";
import { set } from "lodash";

// 수업 변경 상태 맵
export const lessonChangeStatusMap = {
  [TimetableLessonChangeStatus.Pending]: '승인 대기',
  [TimetableLessonChangeStatus.Completed]: '승인 완료',
  [TimetableLessonChangeStatus.Rejected]: '반려',
  [TimetableLessonChangeStatus.Canceled]: '취소',
  [TimetableLessonChangeStatus.Ignored]: '처리 불가',
  [TimetableLessonChangeStatus.Recovered]: '관리자 취소'
};


//수업 변경 관리 탭
interface LessonChangeManagementProps {
  selectedTimetable?: TimetableIndex | null;
  isManagerView: boolean;
  externalTimetableId?: string | null;
  initStatus?: TimetableLessonChangeStatus | null;
}
const LessonChangeManagement: React.FC<LessonChangeManagementProps> = ({
  selectedTimetable,
  isManagerView,
  externalTimetableId,
  initStatus,
}) => {

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
  const [ selectedTabIndex, setSelectedTabIndex ] = useState<number>(0);
  const [ lessonChanges, setLessonChanges ] = useState<TimetableLessonChange[]>([]); // 수업 변경 내역 데이터
  const [ selectedStartDate, setSelectedStartDate ] = useState<number | null>(null);
  const [ selectedEndDate, setSelectedEndDate ] = useState<number | null>(null);
  const [ searchKeyword, setSearchKeyword ] = useState<string>('');   // 검색어( 변경 사유 )
  // const [ selectedStatus, setSelectedStatus ] = useState<TimetableLessonChangeStatus[]>([]);  // 변경 상태 필터 (승인/대기/취소,반려,처리불가 등)
  const [ hasPendingRequests, setHasPendingRequests ] = useState<boolean>(false);
  const [ selectedLessonChange, setSelectedLessonChange ] = useState<TimetableLessonChange | null>(null); // 선택된 수업 변경 내역 상세 정보 보기용 상태
  const [ selectedLessonChangeIds, setSelectedLessonChangeIds ] = useState<string[]>([]); // 체크된 수업 변경 내역 ID 목록
  const [ lessonChangeRequestModal, setLessonChangeRequestModal ] = useState<boolean>(false); // 수업변경신청 모달 props 상태
  const [ changeLessonModal, setChangeLessonModal ] = useState<boolean>(false); // 수업변경 모달 props 상태
  const [ selectedLessonChangeType, setSelectedLessonChangeType ] = useState<TimetableDailyLessonChangeType>(TimetableDailyLessonChangeType.Exchange); // 수업변경 모달 내 수업 변경 종류 상태
  const [ selectedLessonChangeTypes, setSelectedLessonChangeTypes ] = useState<TimetableDailyLessonChangeType[]>([]); // 변경 종류 필터 (수업교체, 결/보강, 합반배정, 복수교사, 수업변경, 수업추가)

  /*
  const getSelectedTabIndex = () => {
    if (!selectedStatus || selectedStatus.length === 0) return 0;
    if (selectedStatus.includes(TimetableLessonChangeStatus.Completed)) return 1;
    if (selectedStatus.includes(TimetableLessonChangeStatus.Pending)) return 2;
    if ([TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Ignored].some(s => selectedStatus.includes(s))) return 3;
    return 0;
  };
  */

  const [ searchDateType, setSearchDateType ] = useState<DateType>(DateType.All);
  const [ currentPage, setCurrentPage ] = useState<number>(0);
  const [ pageSize, setPageSize ] = useState<number>(50);
  const [ sortField, setSortField ] = useState<string>('requestedTimestamp');
  const [ sortOrder, setSortOrder ] = useState<'asc' | 'desc'>('desc');
  const [ hasMore, setHasMore ] = useState<boolean>(true); // 무한 스크롤용( 더 불러올 데이터가 있는지 여부 )
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const observerRef = useRef(null); // 무한 스크롤용 옵저버 레퍼런스
  const containerRef = useRef<HTMLDivElement | null>(null); // 컨테이너 높이 잠금용


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

  const availableLessonChangeTypes = useMemo(() => {
    if(isManagerView) {
      return [
        TimetableDailyLessonChangeType.Exchange,
        TimetableDailyLessonChangeType.Adjustment,
        TimetableDailyLessonChangeType.Replacement,
        TimetableDailyLessonChangeType.Addition,
        TimetableDailyLessonChangeType.Combination,
        TimetableDailyLessonChangeType.Multiple,
      ] as TimetableDailyLessonChangeType[];
    }

    return [
      TimetableDailyLessonChangeType.Exchange,
      TimetableDailyLessonChangeType.Adjustment,
      TimetableDailyLessonChangeType.Replacement,
      TimetableDailyLessonChangeType.Addition,            
    ] as TimetableDailyLessonChangeType[];

  }, [isManagerView]);

  useEffect(() => {
    // 초기화
    setSelectedLessonChangeTypes([...availableLessonChangeTypes]);
  }, [availableLessonChangeTypes]);

  interface LessonChangeTabItem {
    label: string;
    statusFilter: TimetableLessonChangeStatus[]; // 해당 탭에서 보여줄 상태 필터
  }

  const lessonChangeTabs: LessonChangeTabItem[] = useMemo(() => {
    if (isManagerView) {
      return [
        { label: '전체', statusFilter: [] },
        { label: '승인완료', statusFilter: [TimetableLessonChangeStatus.Completed] },
        { label: '승인대기', statusFilter: [TimetableLessonChangeStatus.Pending] },
        { label: '취소/반려/처리불가', statusFilter: [TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Ignored, TimetableLessonChangeStatus.Recovered] },
      ];
    }

    return [
      { label: '승인완료', statusFilter: [TimetableLessonChangeStatus.Completed] },
      { label: '승인대기', statusFilter: [TimetableLessonChangeStatus.Pending] },
      { label: '취소/반려/처리불가', statusFilter: [TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Ignored, TimetableLessonChangeStatus.Recovered] },
    ];

  }, [isManagerView]);

  const initTabIndex = useMemo(() => {
    if (!initStatus) {
      return 0;
    }

    const foundIndex = lessonChangeTabs.findIndex((tab) => tab.statusFilter.includes(initStatus));
    return foundIndex >= 0 ? foundIndex : 0;
  }, [initStatus, lessonChangeTabs]);

  const selectedStatus = useMemo(() => {
    if (selectedTabIndex < 0 || selectedTabIndex >= lessonChangeTabs.length) {
      return lessonChangeTabs[0].statusFilter;
    }
    return lessonChangeTabs[selectedTabIndex].statusFilter;
  }, [selectedTabIndex, lessonChangeTabs]);

  // === UseMemo ===
  const tabLabels = useMemo(() => {
    return lessonChangeTabs.map(tab => tab.label);
  }, [lessonChangeTabs]);

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
    return selectedLessonChangeTypes.length === availableLessonChangeTypes.length;
    // return selectedLessonChangeTypes.length === Object.keys(lessonChangeTypeMap).length;
  }, [selectedLessonChangeTypes, availableLessonChangeTypes]);


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

    // forceSearch 시 컨테이너 높이를 잠궈 목록 교체 중 높이 축소로 인한 스크롤 이동 방지
    if (forceSearch && containerRef.current) {
      containerRef.current.style.minHeight = `${containerRef.current.offsetHeight}px`;
    }

    const api = new Hc2Timetables();
    const query = {
      changeType: TimetableLessonChangeType.Lesson,
      lessonChangeTypes: selectedLessonChangeTypes,
      statuses: selectedStatus,
      startTimestamp: selectedStartDate,
      endTimestamp: selectedEndDate,
      keyword: searchKeyword ? searchKeyword.trim() : null,
      page: pageToFetch,
      size: pageSize,
      sort: `${sortField},${sortOrder}`,
    }

    setIsLoading(true);
    try {

      const { getMyLessonChangesRequestsMyrequests, getLessonChangesLessonchanges } = api;
      const fetchFunction = isManagerView ? getLessonChangesLessonchanges : getMyLessonChangesRequestsMyrequests;

      const res = await fetchFunction(
        selectedTimetableId,
        // @ts-ignore
        query,
        { paramsSerializer: (params: any) => qs.stringify(params, {arrayFormat: 'repeat'})}
      );

      const { page, _embedded } = (res.data as PageResponse<TimetableLessonChange>);
      const LessonChanges = _embedded ? _embedded.lessonChanges : [];

      setOnLessonChanges(LessonChanges, forceSearch);

      // 새 목록이 그려진 뒤 높이 잠금 해제
      if (forceSearch && containerRef.current) {
        const el = containerRef.current;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.minHeight = '';
        }));
      }

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
      // setSelectedLessonChangeTypes(Object.keys(lessonChangeTypeMap) as TimetableDailyLessonChangeType[]);
      setSelectedLessonChangeTypes(availableLessonChangeTypes);
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

  const handleRefreshLessonChanges = async (lessonChange: TimetableLessonChange) => {
    /*
    setLessonChanges(prev => {
      const index = prev.findIndex(lc => lc.lessonChangeId === lessonChange.lessonChangeId);
      if (index !== -1) {
        const updated = { ...prev[index], ...lessonChange };
        return [...prev.slice(0, index), updated, ...prev.slice(index + 1)];
      }
      return prev;
    });
    */
    await fetchLessonChanges(true);
    setLessonChangeRequestModal(false);
  };

  const handleChangeSearchDateType = (type: DateType) => {
    setSearchDateType(type);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  

  const handleChangeStatusTab = (idx: number) => {
    if(idx < 0 || idx >= lessonChangeTabs.length) {
      setSelectedTabIndex(0);
      return;
    }

    setSelectedTabIndex(idx);
  };

  // === UseEffects ===
  useEffect(() => {
    if (!timetableConfig) {
      return;
    }

    setStartPeriod(timetableConfig?.startPeriod ?? 1);
  }, [timetableConfig]);

  useEffect(() => {
    if (!initStatus) {
      return;
    }

    setSelectedTabIndex(initTabIndex);
  }, [initStatus, initTabIndex]);


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
  }, [currentPage, hasMore, isLoading, lessonChanges, classes]);

  useEffect(() => {
    // initialize();
    return () => resetAllStates();
  }, []);

  useEffect(() => {
    if (!selectedTimetableId || (!!selectedStartDate && !selectedEndDate) || (!selectedStartDate && !!selectedEndDate)) return;

    if(classMap && Object.keys(classMap).length === 0) return;

    if (selectedLessonChangeTypes.length === 0) {
      setLessonChanges([]);
      return;
    }
    

    const fetchData = async () => {
      await fetchToCheckIfPendingExists();
      setHasMore(true);
      await fetchLessonChanges(true);
    };

    fetchData();
  }, [selectedTimetableId, searchDateType, selectedStartDate, selectedEndDate, selectedLessonChangeTypes, selectedStatus, sortField, sortOrder, classMap, isManagerView]);

  const storedTimetableId = useDailyTimetableStore((state) => state.storedTimetableId);

  useEffect(() => {
    const nextTimetableId =
      selectedTimetable?.timetableId ??
      externalTimetableId ??
      storedTimetableId ??
      '';

    if (nextTimetableId) {
      console.log('!!! Setting selected timetable ID:', nextTimetableId);

      setSelectedTimetableId(nextTimetableId);
    }
  }, [selectedTimetable, externalTimetableId, storedTimetableId]);

  return (
    <div ref={containerRef} className={`${styles.lessonChangeManagement} mt-6`}>
      <HiTab
        labels={tabLabels}
        // selectedTabIndex={getSelectedTabIndex()}
        selectedTabIndex={selectedTabIndex}
        isControlOuter
        onChange={handleChangeStatusTab}
        size="md"
        variant="pills"
      />
      <div className="gray-box type01 !mt-6 !p-7 radius-lg">
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
          {availableLessonChangeTypes.map(item => (
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
        </div> */}

        {/* 수동검색 UI 변경 : input -> HiInput component로 변경 */}
        <HiInput
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          onBlur={e => handleBlurSearchKeyword(e)}
          onKeyDown={e => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          placeholder="변경 사유 검색"
          wrapStyle={{ width: 260 }}
          showSearch
          onSearch={() => handleSearch()}
        />

        <div className="btn-area gap-2">
          <HiButton type="button" variant="tertiaryBlue" onClick={() => setChangeLessonModal(true)}>수업 변경</HiButton>
          {/* <HiButton type="button" variant="tertiary" onClick={showComingSoon}>엑셀 다운로드</HiButton>
          <HiButton type="button" variant="tertiary" onClick={showComingSoon}>하이톡 발송</HiButton> */}
        </div>
      </div>
      <div className="table-content custom-scr table-box ">
        <table>
          <caption>수업 변경 관리</caption>
          <colgroup>
            {/* <col style={{ width: '3.5%',  maxWidth: '50px', minWidth: '50px'  }} /> */}
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            <col style={{ width: '7.0%',  maxWidth: '100px' }} />
            <col style={{ width: '24.5%', maxWidth: '350px' }} />
            <col style={{ width: '24.5%', maxWidth: '350px' }} />
            <col style={{ width: '8.4%',  maxWidth: '120px' }} />
            {/* <col style={{ width: '6.9%',  maxWidth: '100px' }} /> */}
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
              </th> */}
              <th>
                신청일시
                <HiButton
                  type="button"
                  variant="link"
                  className={`btn btn-link btn-sort ${sortField === 'requestedTimestamp' ? `${sortOrder}` : 'asc'}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSortField('requestedTimestamp');
                    setSortOrder(prev => (sortField === 'requestedTimestamp' && prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <span className="sr-only">정렬</span>
                </HiButton>
              </th>
              <th>작성자</th>
              <th>
                변경 종류
                {/* <button
                  type="button"
                  className="btn btn-link btn-sort"
                >
                  <span className="sr-only">정렬</span>
                </button> */}
              </th>
              <th>
                학반
                {/* <button
                  type="button"
                  className="btn btn-link btn-sort"
                >
                  <span className="sr-only">정렬</span>
                </button> */}
              </th>
              <th>변경 내용</th>
              <th>사유</th>
              <th>상태</th>
              {/* <th>알림발송</th> */}
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
                </td> */}
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
                <td className='!text-left' onClick={() => handleClickLessonChange(row)}>
                  {!!row.contents && TimetableDailyLessonChangeType.Exchange === row.lessonChangeType &&
                    JSON.parse(row.contents).map((item, i) => (
                      <React.Fragment key={i}>
                        <span>{item.date} </span>
                        <span className='text-text-text-neutral-stronger'>{item.from}</span>
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
                <td className='!text-left' onClick={() => handleClickLessonChange(row)}>{row.reason}</td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {/* {[TimetableLessonChangeStatus.Completed, TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled].includes(row.status) && <>{lessonChangeStatusMap[row.status]}</>} */}
                  {/* {row.status === TimetableLessonChangeStatus.Pending && <>{lessonChangeStatusMap[row.status]}<br /><button className="btn btn-tertiary-blue btn-xs">확인</button></>} */}
                  {/* {[TimetableLessonChangeStatus.Ignored].includes(row.status) && <span className='text-graphic-red'>{lessonChangeStatusMap[row.status]}</span>} */}
                  {/* {TimetableLessonChangeStatus.Completed === row.status && <><br/><small className='text-text-neutral-strong'>{convertTimestampToDateNum(row?.approvedTimestamp)}({row?.approvedUser?.userName})</small></>} */}
                  {/* {[TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].includes(row.status) && <><br/><small className='text-text-neutral-strong'>{convertTimestampToDateNum(row?.statusUpdatedTimestamp)}({row?.statusUpdatedUser?.userName})</small></>} */}
                  {(() => {
                    const label = lessonChangeStatusMap[row.status];
                    return (
                      <>
                        {[TimetableLessonChangeStatus.Ignored, TimetableLessonChangeStatus.Recovered].includes(row.status)
                          ? <span className="text-graphic-red block text-leading-b3">{label}</span>
                          : <>{label}</>
                        }
                        {row.status === TimetableLessonChangeStatus.Pending && isManagerView && (
                          <>
                            <br />
                            <HiButton type="button" variant="tertiaryBlue" size="xs" >확인</HiButton>
                          </>
                        )}
                        {row.status === TimetableLessonChangeStatus.Completed && (
                          <>
                            <small className="text-text-neutral-strong break-all block text-leading-d2">
                              {convertTimestampToDateNum(row?.approvedTimestamp || null)}({row?.approvedUser?.userName})
                            </small>
                          </>
                        )}
                        {[TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Recovered].includes(row.status) && (
                          <>
                            <small className="text-text-neutral-strong break-all block text-leading-d2">
                              {convertTimestampToDateNum(row?.statusUpdatedTimestamp || null)}({row?.statusUpdatedUser?.userName})
                            </small>
                          </>
                        )}
                        {row.status === TimetableLessonChangeStatus.Ignored && (
                          <>
                            <small className="text-text-neutral-strong break-all block text-leading-d2">
                              {convertTimestampToDateNum(row?.statusUpdatedTimestamp || null)}
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
                </td> */}
              </tr>
            ))}

            {hasMore && (
              <tr ref={observerRef} style={{ border: 'none' }} />
            )}
            {/* 로딩 중 빈 목록일 때 높이 유지용 투명 행 */}
            {isLoading && lessonChanges.length === 0 && (
              <tr>
              <th colSpan={7}>
                <div className="hi-nodata" style={{ visibility: 'hidden' }}>
                  <p>&nbsp;</p>
                </div>
              </th>
            </tr>
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
        isManagerView={isManagerView}
      />

      <LessonChangeRequestModal
        isOpen={lessonChangeRequestModal}
        setIsOpen={setLessonChangeRequestModal}
        lessonChange={selectedLessonChange ? selectedLessonChange : null}
        emitLessonChange={handleRefreshLessonChanges}
        isManagerView={isManagerView}
      />
    </div>
  );
};

export default LessonChangeManagement;
