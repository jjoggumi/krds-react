import React, { useEffect, useMemo, useRef, useState } from "react";
import { showToast } from '@/unimplementeds/toast.js';
import { HiTab, HiInput } from '@/components/uiux';
import { TimetableClassContext, useClassContext, useGradeContext } from "../../contexts";
import { Class, TimetableConfig, TimetableDailyLessonChangeType, TimetableIndex, TimetableLessonChange, TimetableLessonChangeStatus, TimetableLessonChangeType } from "../../core/types";
import ChangeClassScheduleModal from "../components/changeClassScheduleModal";
import ClassScheduleRequestModal from "../components/classScheduleRequestModal";
import { classScheduleTypeMap } from "./constants";
import { DateType, PageResponse } from "../../common/types";
import { TimetableDisplayUtils, TimeUtils, TypeUtils } from "../../common/utils";
import { Hc2Timetables } from "../../apis";
import { DatetimePicker } from '../../components/datetimePicker.jsx';
import styles from './classScheduleManagement.module.scss';
import { lessonChangeStatusMap } from "./lessonChangeManagement";
import qs from 'qs';
import { HiButton } from "@/components/uiux/hiButton";


// 학급 일정 변경 관리 탭
interface ClassScheduleManagementProps {
  selectedTimetable?: TimetableIndex | null;
}
const ClassScheduleManagement: React.FC<ClassScheduleManagementProps> = ({ selectedTimetable }) => {

  // === Contexts ===
  const classes = useClassContext() as Class[];
  const timetableConfig = useGradeContext() as TimetableConfig;

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

  const tabLabels = ['전체', '등록완료', '취소/처리불가'];
  const getSelectedTabIndex = () => {
    if (!selectedStatus || selectedStatus.length === 0) return 0;
    if (selectedStatus.includes(TimetableLessonChangeStatus.Completed)) return 1;
    if ([TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].some(s => selectedStatus.includes(s))) return 2;
    return 0;
  };

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

    // forceSearch 시 컨테이너 높이를 잠궈 목록 교체 중 높이 축소로 인한 스크롤 이동 방지
    if (forceSearch && containerRef.current) {
      containerRef.current.style.minHeight = `${containerRef.current.offsetHeight}px`;
    }

    const api = new Hc2Timetables();
    const query = {
      changeType: TimetableLessonChangeType.Schedule,
      lessonChangeTypes: selectedLessonChangeTypes,
      statuses: selectedStatus,
      startTimestamp: selectedStartDate,
      endTimestamp: selectedEndDate,
      keyword: searchKeyword?.trim() || null,
      page: pageToFetch,
      size: pageSize,
      sort: `${sortField},${sortOrder}`,
    }

    setIsLoading(true);

    try {
      const res = await api.getLessonChangesLessonchanges(
        selectedTimetableId || '',
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

        const contents = lessonChange?.contents ? JSON.parse(lessonChange.contents) : null;
        if (!!contents && Array.isArray(contents)) {
          const contents = JSON.parse(lessonChange.contents || '[]');

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

    if(classMap && Object.keys(classMap).length === 0) return;

    if (selectedLessonChangeTypes.length === 0) {
      setLessonChanges([]);
      return;
    }

    setHasMore(true);
    fetchLessonChanges(true);
  }, [selectedTimetableId, searchDateType, selectedStartDate, selectedEndDate, selectedLessonChangeTypes, selectedStatus, sortField, sortOrder, classMap]);

  useEffect(() => {
    if (!selectedTimetable) return;

    setSelectedTimetableId(selectedTimetable.timetableId);
  }, [selectedTimetable]);

  return (
    <div ref={containerRef} className={`${styles.classScheduleManagement} mt-6`} >
      {/* <HiTab
        labels={tabLabels}
        selectedTabIndex={getSelectedTabIndex()}
        isControlOuter
        onChange={(idx) => {
          switch (idx) {
            case 0:
              setSelectedStatus([]);
              break;
            case 1:
              setSelectedStatus([TimetableLessonChangeStatus.Completed]);
              break;
            case 2:
              setSelectedStatus([TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored]);
              break;
            default:
              setSelectedStatus([]);
          }
        }}
        size="md"
        variant="pills"
      /> */}
      <div className="gray-box type01 !mt-6 !p-7 radius-lg">
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
          <HiButton type="button" variant="tertiaryBlue" onClick={() => setChangeClassScheduleModal(true)}>학급 일정 변경</HiButton>
          {/* <HiButton type="button" variant="tertiary" onClick={showComingSoon}>엑셀 다운로드</HiButton>
          <HiButton type="button" variant="tertiary" onClick={showComingSoon}>하이톡 발송</HiButton> */}
        </div>
      </div>

      <div className="table-content custom-scr table-box ">
        <table>
          <caption>학급 일정 변경 관리</caption>
          <colgroup>
            {/* <col style={{ width: '50px' }} /> */}
            <col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '350px' }} />
            <col style={{ width: '350px' }} />
            <col style={{ width: '120px' }} />
            {/* <col style={{ width: '100px' }} /> */}
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
              <th>변경 종류</th>
              <th>학반</th>
              <th>변경 내용</th>
              <th>사유</th>
              <th>상태</th>
              {/* <th>알림발송</th> */}
            </tr>
          </thead>
          <tbody>
            {lessonChanges.map((row) => (
              <tr key={row.lessonChangeId}>
                {/* <td>
                  <input type="checkbox" checked={selectedLessonChangeIds.includes(row.lessonChangeId)} onChange={e => handleRowCheck(row.lessonChangeId, e.target.checked)} id={`table-row-check-class-${row.lessonChangeId}`} />
                  <label htmlFor={`table-row-check-class-${row.lessonChangeId}`}></label>
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
                <td className='!text-left' onClick={() => handleClickLessonChange(row)}>
                  {!!row.contents &&
                    JSON.parse(row.contents).map((item, i) => (
                      <React.Fragment key={i}>
                        <span>{item.date} </span> 
                        <span>{item.eventName}</span>
                      </React.Fragment>
                    ))}
                </td>
                <td className='!text-left' onClick={() => handleClickLessonChange(row)}>{row.reason}</td>
                <td onClick={() => handleClickLessonChange(row)}>
                  {/* {[TimetableLessonChangeStatus.Completed, TimetableLessonChangeStatus.Canceled].includes(row.status) && <>{lessonChangeStatusMap[row.status]}</>}
                  {[TimetableLessonChangeStatus.Ignored].includes(row.status) && <span className='text-graphic-red'>{lessonChangeStatusMap[row.status]}</span>}
                  {TimetableLessonChangeStatus.Completed === row.status && <><br/><small className='text-text-neutral-strong'>{convertTimestampToDateNum(row?.approvedTimestamp)}({row?.approvedUser?.userName})</small></>}
                  {[TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].includes(row.status) && <><br/><small className='text-text-neutral-strong'>{convertTimestampToDateNum(row?.statusUpdatedTimestamp)}({row?.statusUpdatedUser?.userName})</small></>} */}
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
                            <HiButton type="button" variant="tertiaryBlue" size="xs" >확인</HiButton>
                          </>
                        )}
                        {row.status === TimetableLessonChangeStatus.Completed && (
                          <>
                            <br />
                            <small className="text-text-neutral-strong break-all block text-leading-d2">
                              {convertTimestampToDateNum(row?.approvedTimestamp)}({row?.approvedUser?.userName})
                            </small>
                          </>
                        )}

                        {[TimetableLessonChangeStatus.Rejected, TimetableLessonChangeStatus.Canceled, TimetableLessonChangeStatus.Ignored].includes(row.status) && (
                          <>
                            <br />
                            <small className="text-text-neutral-strong break-all block text-leading-d2">
                              {convertTimestampToDateNum(row?.statusUpdatedTimestamp)}({row?.statusUpdatedUser?.userName})
                            </small>
                          </>
                        )}
                      </>
                    );
                  })()}
                </td>
                {/* <td><button className="btn btn-sm btn-link" onClick={showComingSoon}><i className="ico ico-hitalk ico-gray ico-size-20" /></button></td> */}
              </tr>
            ))}

            {hasMore && (
              <tr ref={observerRef} style={{ border: 'none' }} />
            )}

            {/* 내용 없을 때 메시지 추가 */}
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

      <ChangeClassScheduleModal
        selectedTimetable={selectedTimetable}
        isOpen={changeClassScheduleModal}
        setIsOpen={setChangeClassScheduleModal}
        reload={() => fetchLessonChanges(true)}
      />

      <ClassScheduleRequestModal
        isOpen={classScheduleRequestModal}
        setIsOpen={setClassScheduleRequestModal}
        lessonChange={selectedLessonChange ? selectedLessonChange : null}
        emitLessonChange={handleRefreshLessonChanges}
      />
    </div>
  );
};

export default ClassScheduleManagement;
