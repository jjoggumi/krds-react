import React, { useState, FC, useEffect, use, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './myHome.module.scss';
import HiSelectBox from "../../../uiux/hiSelectBox";
import HiModal from '../../../uiux/hiModal';
import { HiTab } from '../../../uiux/hiTab';
import { Calendar, DatetimePicker } from '../../components/datetimePicker';
import { Hc2Timetables } from '../../apis';
import { TimetableDisplayUtils, TimeUtils, TypeUtils } from '../../common/utils';
import { LocalStorageUtils } from '../../common/utils';
import { TeacherCourseBaseContext, TeacherCourseContext, TimetableClassContext, TimetableConcurrentConfContext, TimetableCourseBaseContext, TimetableCourseContext, TimetableGradeContext, TimetableSpecialtyRoomContext, TimetableTeacherContext, useClassContext, useConcurrentConfContext, useCourseBaseContext, useCourseContext, useGradeContext, useSpecialtyRoomContext, useTeacherContext, useTeacherCourseBaseContext, useTeacherCourseContext } from '../../contexts';
import { ActivateWeekday, EmbeddedListResponse } from '../../common/types';
import { Class, Course, DailyLesson, LessonChangeSimple, LessonDay, SpecialtyRoom, Teacher, TimetableDailyLessonChangeType, TimetableIndex, TimetableLessonChangeStatus,  } from '../../core/types';
import { ClassDayStatus, DAYS_OF_WEEK } from '../../common/constants';
import DailyLessonButton, { DailyLessonButtonOption } from '../components/dailyLessonButton';
import HiTooltip from '@/components/uiux/hiTooltip';
import LessonChangeManagement from '../main/lessonChangeManagement';
import { useDailyTimetableStore } from './store';
import DailyLessonsModal, { TimetableDailyLessonModalOptions } from '../components/dailyLessonModal';
import LessonChangeHistoryOnMyHome from '../components/lessonChangeHistoryOnMyHome';
import { useDailyExternalQuery } from '../hooks/useDailyExternalQuery';
import { set } from 'lodash';
import { UNSAFE_RSCDefaultRootErrorBoundary } from 'react-router-dom';
import { HiButton } from '@/components/uiux/hiButton';

type TabName = 'LessonChangeRequest' | 'ChangeHistoryManagement' | 'LessonStatsManagement';
type MenuItem = {
  name: TabName;
  label: string;
  component: React.ComponentType<any>;
};

interface School {
  schoolId?: string;
  schoolName?: string;
}

interface TimetableMainProps {
  school?: School
}

interface SelecteIdBySchool {
  [schoolId: string]: string;
}

type SchoolTimetableUsage = {
  schoolId: string;
  hasTimetable: boolean;
  isSchoolTeacher: boolean | null;
  timetableId: string;
  classDays: string;
};

// 내 시간표 관리 전체
const MyHome: FC<TimetableMainProps> = ({ school }) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  // 상단 탭 메뉴
  const menuItems: MenuItem[] = [
    { name: "LessonChangeRequest", label: "수업 변경 신청", component: LessonChangeRequest },
    { name: "ChangeHistoryManagement", label: "변경 내역 관리", component: ChangeHistoryManagement },
    // { name: "LessonStatsManagement", label: "시수 누계 관리", component: LessonStatsManagement },
  ];
  const { initTab, timetableId: externalTimetableId, initStatus } = useDailyExternalQuery();
  const schoolId = school?.schoolId || undefined;

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [timetableUsage, setTimetableUsage] = useState<SchoolTimetableUsage | null>(null);
  const [timetableId, setTimetableId] = useState<string>('');
  const [timetables, setTimetables] = useState<TimetableIndex[]>([]);

  useEffect(() => {
    if (initTab) {
      const index = menuItems.findIndex(item => item.name === initTab);
      if (index !== -1) {
        setSelectedTabIndex(index);
      }
    }
  }, [initTab]);

  useEffect(() => {
    setSelectedDate(TimeUtils.getTodayAsNumber());
  }, []);

  useEffect(() => {
    if (!schoolId) {
      setTimetableUsage(null);
      setTimetableId('');
      setTimetables([]);
      return;
    }

    const fetchTimetables = async () => {
      const api = new Hc2Timetables();

      try {
        const res = await api.getTimetableListTimetables({ schoolId });
        const { timetables } = (res.data as EmbeddedListResponse<TimetableIndex>)._embedded;
        setTimetables(timetables);
      } catch (error) {
        console.error("Error fetching timetables:", error);
        setTimetables([]);
      }
    };

    fetchTimetables();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || !selectedDate) {
      return;
    }

    const fetchTimetableInfo = async () => {
      const api = new Hc2Timetables();
      const { getSchoolTimetableUsageStatusesBySchoolIdUsagestatus } = api;

      try {
        const res = await getSchoolTimetableUsageStatusesBySchoolIdUsagestatus(schoolId, { date: selectedDate });
        const usageInfo = res.data as SchoolTimetableUsage;
        setTimetableUsage(usageInfo);
        setTimetableId(usageInfo.timetableId);
      } catch (error) {
        console.error('시간표 정보 로드 실패:', error);
      }
    };

    fetchTimetableInfo();
  }, [schoolId, selectedDate]);

  const selectedTimetable = useMemo(() => {
    if (!timetableId || timetables.length === 0) return null;
    return timetables.find(t => t.timetableId === timetableId) || null;
  }, [timetableId, timetables]);

  return (
    <div className={styles.myHomeMain}>
      <div className="h3-tit mb-5">
        <h3>내 시간표 관리</h3>
      </div>
      {timetableUsage !== null && (
        !timetableUsage.hasTimetable ? (
        <div className="timetable-nodata hi-nodata">
          <p>등록된 전체 시간표가 없거나, 현재 운영 중인 시간표가 없습니다.</p>
        </div>
      ) : (
        <HiTab labels={menuItems.map(item => item.label)} variant="underline" size='xxl' className="border-b border-border-neutral-base" selectedTabIndex={selectedTabIndex}>
        {menuItems.map((item) => {
          const Comp = item.component;
          return (
            <Comp
              key={item.name}
              schoolId={school?.schoolId || undefined}
              selectedDate={item.name === 'LessonChangeRequest' ? selectedDate : undefined}
              timetableUsage={item.name === 'LessonChangeRequest' ? timetableUsage : undefined}
              timetableId={item.name === 'LessonChangeRequest' ? timetableId : undefined}
              // selectedTimetable={item.name === 'LessonChangeRequest' ? selectedTimetable : undefined}
              selectedTimetable={selectedTimetable}
              externalTimetableId={item.name === 'ChangeHistoryManagement' ? externalTimetableId : undefined}
              initStatus={item.name === 'ChangeHistoryManagement' ? initStatus : undefined}
            />
          );
        })}
      </HiTab>
      ))}
    </div>
  );
};

interface LessonChangeRequestProps {
  schoolId?: string;
  selectedDate?: number | null;
  timetableUsage?: SchoolTimetableUsage | null;
  timetableId?: string;
  selectedTimetable?: TimetableIndex | null;
}

const LessonChangeRequest: FC<LessonChangeRequestProps> = ({
  schoolId,
  selectedDate,
  timetableUsage,
  timetableId = '',
  selectedTimetable = null,
}) => {
  // store
  const setStoredTimetableId = useDailyTimetableStore((state) => state.setStoredTimetableId);
  
  const [viewType, setViewType] = useState<string>('teacher'); 

  // 일정 등록 모달 상태
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<number>(Date.now());
  const [scheduleContent, setScheduleContent] = useState<string>('');
  
  // 시간표 데이터
  const gradeContext = TimetableGradeContext.getInstance();  
  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();
  const courseBaseContext = TimetableCourseBaseContext.getInstance();
  const teacherCourseContext = TeacherCourseContext.getInstance();
  const teacherCourseBaseContext = TeacherCourseBaseContext.getInstance();
  // const concurrentConfContext = TimetableConcurrentConfContext.getInstance();
  const specialtyRoomContext = TimetableSpecialtyRoomContext.getInstance();

  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();
  const courseBases = useCourseBaseContext();
  const teacherCourses = useTeacherCourseContext();
  // const concurrentConfs = useConcurrentConfContext();
  // const teacherCourseBases = useTeacherCourseBaseContext();
  const specialtyRooms = useSpecialtyRoomContext();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [operationStartDate, setOperationStartDate] = useState<number | null>(null);
  const [operationEndDate, setOperationEndDate] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [dailyLessons, setDailyLessons ] = useState<DailyLesson[]>([]); // 전체 수업 리스트
  const [teacherOptions, setTeacherOptions] = useState<{ value: string; title: string }[]>([]);
  const [classOptions, setClassOptions] = useState<{ value: string; title: string }[]>([]);
  const [ activatedClassDays, setActivatedClassDays ] = useState<ActivateWeekday[]>([]);
  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);
  const [ lessonChanges, setLessonChanges ] = useState<Record<string, string>>({}); // 수업 변경 내역
  const [ changeLessonModal, setChangeLessonModal ] = useState(false); // 수업변경 모달 오픈 상태
  const [ selectedLessonChangeType, setSelectedLessonChangeType ] = useState<TimetableDailyLessonChangeType>(TimetableDailyLessonChangeType.Exchange); // 어떤 탭(타입)으로 열지 상태

  const [ dailyLessonModalOptions, setDailyLessonModalOptions ] = useState<TimetableDailyLessonModalOptions | undefined | null>(null);


  const teacherIdStorageKey = 'timetable-my-teacher-id';
  const classIdStorageKey = 'timetable-my-class-id';

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


  const specialtyRoomMap = useMemo(
    () => specialtyRoomContext.specialtyRoomMap || ({} as Record<string, SpecialtyRoom>),
    [specialtyRooms]
  );

  /*
  const concurrentConfMap = useMemo(
    () => concurrentConfContext.concurrentConfMap || ({} as Record<string, ConcurrentConf>),
    [concurrentConfs]
  );
  */

  const fetchLessonChangeSimple = async (lessonChangeId: string) => {
    if (!timetableId || !lessonChangeId) return;

    const api = new Hc2Timetables();
    try {
      const res = await api.getLessonChangeSimpleLessonchangesLessonChangeId(
        timetableId,
        lessonChangeId
      );
      const lessonChange = res.data as LessonChangeSimple;

      return lessonChange;
    } catch (error) {
      console.error("Error fetching lesson change simple info:", error);
    }
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
  

  const getMaxPeriod = (lessons?: DailyLesson[]) => {
    const configMaxPeriod = timetableConfig?.maxPeriod || 7;
    if(!lessons || lessons.length === 0) {
      return configMaxPeriod;
    }
    
    return Math.max(...(lessons.map(lesson => lesson.period) || []), configMaxPeriod);
  };
  
    // === Renderers ===
  const renderTeacherLessons = (lessonDate: number, period: number, teacherId: string, onClick: (dailyLesson: DailyLesson) => void) => {
    const isSelected = selectedCell && (selectedCell.lessonDate === lessonDate && selectedCell.period === period && selectedCell.teacherId === teacherId);

    const dailyLessons = teacherDailyLessonMap[teacherId] || [];
    if (!dailyLessons || dailyLessons.length === 0) return null;

    const dailyLesson = dailyLessons.find(l => l.lessonDate === lessonDate && l.period === period) as DailyLesson;
    
    if (!dailyLesson) return null;

    const isEvent = dailyLesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = dailyLesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = dailyLesson.changeType === TimetableDailyLessonChangeType.Duplication;
    const isChanged = dailyLesson.changeType !== TimetableDailyLessonChangeType.None;

    const isReadOnly = (
      lessonDate < TimeUtils.getTodayAsNumber() ||
      isEvent || isRemoved || isDuplicated || isChanged
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
      isSelected
    } as DailyLessonButtonOption;

    if(dailyLesson && dailyLesson.consecutiveGroupId) { // 연속 수업인 경우, 첫번째 수업인지 여부 확인
      const consecutiveLessons = teacherDailyLessonMap[teacherId].filter(l =>
        l.consecutiveGroupId === dailyLesson.consecutiveGroupId &&
        l.classId == dailyLesson.classId &&
        l.dayOfWeek === dailyLesson.dayOfWeek
      ).sort((a, b) => a.period - b.period);

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
        onClick={(dl, ld, p, opt, ev) => onClick(dl, ev)}
        // onClick={(dailyLesson, lessonDate, period, option) => handleClickCell('teacher', dailyLesson, lessonDate, period, teacherId, null)}
        // onMouseEnter={handleMouseOverDailyLesson}
        // onMouseLeave={handleMouseLeaveDailyLesson}
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

  const renderClassLessons = (lessonDate: number, period: number, classId: string, onClick: (dailyLesson: DailyLesson) => void) => {
    const isSelected = selectedCell && (
      selectedCell.lessonDate === lessonDate &&
      selectedCell.period === period &&
      selectedCell.classId === classId
    );

    const dailyLessons = classDailyLessonMap[classId] || [];
    if (!dailyLessons || dailyLessons.length === 0) return null;

    const dailyLesson = dailyLessons.find(l => l.lessonDate === lessonDate && l.period === period) as DailyLesson;

    const isEvent = !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Event;
    const isRemoved = !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Removal;
    const isDuplicated = !!dailyLesson && dailyLesson.changeType === TimetableDailyLessonChangeType.Duplication;
    const isChanged = !!dailyLesson && dailyLesson.changeType !== TimetableDailyLessonChangeType.None;

    const isReadOnly = (
      lessonDate < TimeUtils.getTodayAsNumber() ||
      (!!dailyLesson && courseMap[dailyLesson.courseId].isUnified) ||
      isEvent || isRemoved || isDuplicated || isChanged
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
      isSelected,
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
        onClick={(dl, ld, p, opt, ev) => onClick(dl, ev)}        
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

  /*
  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Teacher>),
    [teachers]
  );
  */

  const readableLessonDay = (lessonDay: LessonDay) => {
    const monthAndDay = lessonDay.lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    return `${month}/${day}`;

    // const dayOfWeekTitle = DAYS_OF_WEEK.find((d) => d.index === lessonDay.dayOfWeek)?.title || "";
    // return `${month}/${day}(${dayOfWeekTitle})`;
  };

  const readableLessonDayWithDayOfWeek = (lessonDay: LessonDay) => {
    const monthAndDay = lessonDay.lessonDate % 10000;
    const month = Math.floor(monthAndDay / 100);
    const day = monthAndDay % 100;
    const dayOfWeekTitle = DAYS_OF_WEEK.find((d) => d.index === lessonDay.dayOfWeek)?.title || "";
    return `${month}/${day}(${dayOfWeekTitle})`;
  };

  /*
  const teacherOptions = [
    { value: 'teacher1', title: '김선생' },
    { value: 'teacher2', title: '박선생' },
    { value: 'teacher3', title: '이선생' },
  ];
  */

  const initSelectedValues = () => {
    setSelectedWeek(0);
  };

  const initStorageData = () => {
    if(!schoolId) {
      return;
    }

    const storageTeacher = LocalStorageUtils.get(teacherIdStorageKey) || {} as SelecteIdBySchool;
    const storageClass = LocalStorageUtils.get(classIdStorageKey) || {} as SelecteIdBySchool;

    const storageTeacherId = storageTeacher[schoolId || ''] || '';
    const storageClassId = storageClass[schoolId || ''] || '';

    setSelectedTeacherId(storageTeacherId);
    setSelectedClassId(storageClassId);
  };

  useEffect(() => {
    // 시간표 ID가 변경될 때마다 store에 저장
    setStoredTimetableId(timetableId);

    if(timetableId) {
      reloadContextAllWithTimetableId(timetableId);
    }
  }, [timetableId]);

  const operationWeeklyDates = useMemo(() => {
    if (!operationStartDate || !operationEndDate) return [];

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

    return weeks.map((week, idx) => ({
        value: idx,
        title: `${readableLessonDay({ lessonDate: week[0], dayOfWeek: 0 })} ~ ${readableLessonDay({ lessonDate: week[1], dayOfWeek: 6 })}`,
        formattedDate: `${TimeUtils.getDateAsString(week[0])} ~ ${TimeUtils.getDateAsString(week[1])}`,
        weekRange: week
      }
    ));
  }, [operationStartDate, operationEndDate]);


  const weekData = useMemo(() => {
    if(!operationWeeklyDates) {
      return [];
    }

    return operationWeeklyDates.map((week, idx) => ({
      week: idx + 1,
      period: week.title
    }));
  }, [operationWeeklyDates]);


  const reloadContextAllWithTimetableId = async (id: string) => {
    // 모든 컨텍스트의 reload 함수를 호출
    await gradeContext.reloadWithTimetableId(id);
    await courseContext.reloadWithTimetableId(id);
    await courseBaseContext.reloadWithTimetableId(id);
    await teacherContext.reloadWithTimetableId(id);
    await classContext.reloadWithTimetableId(id);
    await specialtyRoomContext.reloadWithTimetableId(id);
    await teacherCourseContext.reloadWithTimetableId(id);
    await teacherCourseBaseContext.reloadWithTimetableId(id);
    // await concurrentConfContext.reloadWithTimetableId(id);
  };

  const fetchDailyLessons = async () => {

    const { selectedStartDate, selectedEndDate } = selectedDates;
    if (!selectedStartDate || !selectedEndDate) {
      return;
    }

    const api = new Hc2Timetables();

    try {
      const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
        timetableId,
        selectedStartDate,
        selectedEndDate
      );

      const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson>)._embedded;
      setDailyLessons(dailyLessons);
    } catch (error) {
      console.error("Error fetching daily lessons:", error);
    }
  };

  const teacherDailyLessonMap = useMemo(() => {
    return dailyLessons.reduce((acc, cur) => {
        const teacherIds = cur.lessonTeacherIds;
        if(!teacherIds || teacherIds.length === 0) {
          return acc;
        }
        teacherIds.forEach(teacherId => (acc[teacherId] ||= []).push(cur));
        return acc;
      }, {} as Record<string, DailyLesson[]>)
  }, [dailyLessons]);

  const classDailyLessonMap = useMemo(() => {
    return dailyLessons.reduce((acc, cur) => {
        const classId = cur.classId;
        if(!classId) {
          return acc;
        }
        (acc[classId] ||= []).push(cur);
        return acc;
      }, {} as Record<string, DailyLesson[]>)
  }, [dailyLessons]);

  const selectedDailyLessons = useMemo(() => {
    if(viewType === 'teacher') {
      return teacherDailyLessonMap[selectedTeacherId] || [];
    } 
    
    if(viewType === 'class') {
      return classDailyLessonMap[selectedClassId] || [];
    }
    return [];
  }, [viewType, selectedTeacherId, selectedClassId, teacherDailyLessonMap, classDailyLessonMap]);

  // 교사 시간표, 학급 시간표 선택 옵션
  const viewTypeOptions = [
    { value: 'teacher', label: '교사 시간표', name: 'viewType' },
    { value: 'class', label: '학급 시간표', name: 'viewType' }
  ];

  const lessonDays = useMemo(() => {
    const weekIndex = selectedWeek - 1;
    if (selectedWeek === null || !operationWeeklyDates || !operationWeeklyDates[weekIndex]) return [];

    const weeks = 1;
    const weekRange = operationWeeklyDates[weekIndex]?.weekRange;
    return TimeUtils.generateLessonDays(weekRange[0], weeks)
      .filter((lessonDay: LessonDay) =>
        activatedClassDays.some((day) => day.dayOfWeek === lessonDay.dayOfWeek)
      );
  }, [operationWeeklyDates, activatedClassDays, selectedWeek]);

  const lessonDaysColWidth = useMemo(() => {
    const headerWidth = 5;
    return !!lessonDays && lessonDays.length > 0
      ? `${(100 - headerWidth) / lessonDays.length}%`
      : "auto";
  }, [lessonDays]);

  const adjustDisplayedPeriod = (period: number) => {
    return period + (startPeriod || 0);
  };

  const isNotSelected = useMemo(() => {
    if(viewType === 'teacher') {
      return !selectedTeacherId || teachers.some(teacher => teacher.teacherId === selectedTeacherId) === false;
    } 
      
    return !selectedClassId || classes.some(classItem => classItem.classId === selectedClassId) === false;
  }, [viewType, selectedTeacherId, selectedClassId, teachers, classes]);

  const isEmptyTimetable = useMemo(() => {
    const noTimetable = !timetableUsage?.hasTimetable || 
            selectedWeek === 0 ||
            !operationWeeklyDates ||
            operationWeeklyDates.length === 0;

    if(noTimetable) {
      return true;
    }

    const today = TimeUtils.getTodayAsNumber();
    if(!operationStartDate || !operationEndDate ||
      today < operationStartDate ||
      today > operationEndDate
    ) {
      return true;
    }

    return false;
  }, [timetableUsage, selectedWeek, operationWeeklyDates, dailyLessons]);

  const handleClickOpenChangeLessonModal = () => {
    const lessonDate = lessonDays.length > 0 ? lessonDays[0].lessonDate : null;

    if(viewType === 'teacher' && selectedTeacherId) {
      setDailyLessonModalOptions(prev => ({
        teacherId: selectedTeacherId,
        classId: undefined,
        lessonDate: lessonDate,
        period: undefined,
        dailyLesson: null,
      } as TimetableDailyLessonModalOptions));
    }
    else {
      setDailyLessonModalOptions({
        teacherId: undefined,
        classId: undefined,
        lessonDate: lessonDate,
        period: undefined,
        dailyLesson: null,
      } as TimetableDailyLessonModalOptions);
    }
    setChangeLessonModal(true);
  }


  //---- Effect Hooks ----
  useEffect(() => {
    return () => {
      initSelectedValues();
      setOperationStartDate(null);
      setOperationEndDate(null);
    }
  }, []);

  useEffect(() => {
    initStorageData();
  }, [schoolId]);

  useEffect(() => {
    setSelectedWeek(0);
  }, [operationStartDate, operationEndDate]);

  useEffect(() => {
    if (selectedWeek !== 0 || !selectedDate || operationWeeklyDates.length === 0) {
      return;
    }

    const nextWeek = operationWeeklyDates.findIndex(week =>
      selectedDate >= week.weekRange[0] && selectedDate <= week.weekRange[1]
    ) + 1;

    if (nextWeek > 0) {
      setSelectedWeek(nextWeek);
    }
  }, [selectedWeek, selectedDate, operationWeeklyDates]);

  const selectedDates = useMemo(() => {
    const weekIndex = selectedWeek - 1;
    if (!timetableId || selectedWeek === null || !operationWeeklyDates || !operationWeeklyDates[weekIndex]) {
      return { selectedStartDate: undefined, selectedEndDate: undefined };
    }

    const [ selectedStartDate, selectedEndDate ] = operationWeeklyDates[weekIndex].weekRange;

    return { selectedStartDate, selectedEndDate };
  }, [timetableId, selectedWeek, operationWeeklyDates]);

  useEffect(() => {
    const { selectedStartDate, selectedEndDate } = selectedDates;
    if (!selectedStartDate || !selectedEndDate) {
      return;
    }

    fetchDailyLessons();
  }, [timetableId, selectedDates]);


  useEffect(() => {
    if(!schoolId || viewType !== 'teacher' || teachers.length === 0) {
      return;
    }

    const storageTeacher = LocalStorageUtils.get(teacherIdStorageKey) || {} as SelecteIdBySchool;
    const storageTeacherId = storageTeacher[schoolId || ''] || '';

    const teacherIdToSet = selectedTeacherId ? selectedTeacherId : storageTeacherId;

    if(teacherIdToSet !== selectedTeacherId) {
      setSelectedTeacherId(teacherIdToSet);
    }

    if(teacherIdToSet !== storageTeacherId) {
      storageTeacher[schoolId || ''] = teacherIdToSet;
      LocalStorageUtils.set(teacherIdStorageKey, storageTeacher);
    }

  },[selectedTeacherId, teachers, viewType, schoolId]);

  useEffect(() => {
    if(!schoolId || viewType !== 'class' || classes.length === 0) {
      return;
    }

    const storageClass = LocalStorageUtils.get(classIdStorageKey) || {} as SelecteIdBySchool;
    const storageClassId = storageClass[schoolId || ''] || '';

    const classIdToSet = selectedClassId ? selectedClassId : storageClassId;

    if(classIdToSet !== storageClassId) {
      setSelectedClassId(classIdToSet);
    }

    if(classIdToSet !== storageClassId) {
      storageClass[schoolId || ''] = classIdToSet;
      LocalStorageUtils.set(classIdStorageKey, storageClass);
    }

  },[selectedClassId, classes, viewType, schoolId]);


  useEffect(() => {
    if(!teachers || teachers.length === 0) {
      return;
    }

    const options = teachers.map((teacher) => ({
      value: teacher.teacherId,
      title: teacher.teacherName
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

    setTeacherOptions(options);
  }, [teachers]);

  useEffect(() => {
    if(!classes || classes.length === 0) {
      return;
    }

    // 학년 순 -> 반 순 -> 가상 학급은 해당 학급 뒤에 오도록 정렬
    // 2026.03.10, notbadlife. 가상학급은 필터에서 제외
    const sortedClasses = [...classes]
      .filter(c => !c.isVirtual)
      .sort((a, b) => {
      if (a.grade !== b.grade) {
        return a.grade - b.grade;
      }
     
      /*
      if (a.isVirtual !== b.isVirtual) {
        return a.isVirtual ? 1 : -1; // 가상 학급은 뒤로
      }
      */

      if (a.classNumber !== b.classNumber) {
        return a.classNumber - b.classNumber;
      }
      return 0;
    });

    const options = sortedClasses.map((classItem) => ({
      value: classItem.classId,
      title: TimetableDisplayUtils.formatFullClassName(classItem)
    }));

    setClassOptions(options);
  }, [classes]);


  useEffect(() => {
    setStartPeriod(timetableConfig?.startPeriod ?? 1);
    setActivatedClassDays(
      timetableConfig?.classDays
        .map((isActive: ClassDayStatus, index: number) => ({
          dayOfWeek: index,
          title: DAYS_OF_WEEK.find((day) => day.index === index)?.title,
          isActive: isActive === ClassDayStatus.ACTIVATED,
        } as ActivateWeekday))
        .filter((day: ActivateWeekday) => day.isActive)
    );

    setOperationStartDate(gradeContext.timetableConfig.operationStartDate || null);
    setOperationEndDate(gradeContext.timetableConfig.operationEndDate || null);
  }, [timetableConfig]);


  useEffect(() => {
    if (!dailyLessons || dailyLessons.length === 0) return;

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
  }, [dailyLessons]);


  // ---- 퍼블리싱 데이터 -----
  const formatKoreanDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  };

  const handleSaveSchedule = () => {
    // TODO: 저장 API 연동
    // console.log('[내 일정 등록] 날짜:', new Date(scheduleDate), '내용:', scheduleContent);
    setScheduleModalOpen(false);
    setScheduleContent('');
  };
    
  const rootRef = useRef<HTMLDivElement>(null);

  const [ selectedCell, setSelectedCell ] = useState<{
    teacherId: string;
    classId: string;
    lessonDate: number;
    period: number;
    dailyLesson: DailyLesson;
  } | null>(null); // 선택된 셀 정보


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (changeLessonModal || !selectedCell) return;

      const target = event.target as HTMLElement | null;
      if (!target || target.closest('.side-modal') || target.closest('.hi-modal')) return;

      const insideCell =
        target.closest('.btn-table-cell') ||
        target.closest('.lessonChangeRequest-option-layer');

      if (!insideCell) {
        setSelectedCell(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCell]);

  const [optionLayerPos, setOptionLayerPos] = useState<{ left: number; top: number } | null>(null);

  const handleClickCell = (dailyLesson: DailyLesson, e?: React.MouseEvent) => {
    const { classId, lessonDate, period, changeType } = dailyLesson;

    if(changeType !== TimetableDailyLessonChangeType.None) {
      // 이미 변경된 수업은 클릭 불가
      return;
    }

    // If click target provided, compute position from it
    const clickedEl = e?.currentTarget as HTMLElement | undefined;

    // Toggle selection if same cell clicked again
    const prevSelected = selectedCell;
    if (prevSelected && prevSelected.classId === dailyLesson.classId && prevSelected.lessonDate === dailyLesson.lessonDate && prevSelected.period === dailyLesson.period && prevSelected.teacherId === selectedTeacherId) {
      // clear selection
      setSelectedCell(null);
      setOptionLayerPos(null);
      return;
    }

    const firstTeacherId = dailyLesson.lessonTeacherIds && dailyLesson.lessonTeacherIds.length > 0 ? dailyLesson.lessonTeacherIds[0] : '';

    setSelectedCell({
      teacherId: viewType === 'teacher' ? selectedTeacherId : firstTeacherId,
      classId: classId || '',
      lessonDate,
      period,
      dailyLesson
    });

    if (clickedEl) {
      const rect = clickedEl.getBoundingClientRect();
      // compute center x so CSS translateX(-50%) centers the portal
      setOptionLayerPos({ left: rect.left + (window.scrollX || window.pageXOffset) + rect.width / 2, top: rect.top + (window.scrollY || window.pageYOffset) + rect.height + 4 });
    } else {
      // fallback: compute later via query
      setTimeout(() => {
        const found = document.activeElement instanceof HTMLElement && document.activeElement.closest('.btn-table-cell')
          ? document.activeElement.closest('.btn-table-cell') as HTMLElement
          : null;
        if (found) {
          const r = found.getBoundingClientRect();
          setOptionLayerPos({ left: r.left + (window.scrollX || window.pageXOffset) + r.width / 2, top: r.top + (window.scrollY || window.pageYOffset) + r.height + 4 });
        }
      }, 0);
    }
  }

  // Hide option-layer when any scroll occurs
  useEffect(() => {
    if (!selectedCell) return;

    const hideOnScroll = () => {
      try {
        setOptionLayerPos(null);
        setSelectedCell(null);
      } catch (_e) {}
    };

    window.addEventListener('scroll', hideOnScroll, { passive: true });
    document.addEventListener('scroll', hideOnScroll, { passive: true, capture: true });

    const root = rootRef.current;
    const scrollEls: Element[] = [];
    if (root) {
      root.querySelectorAll('.table-content').forEach(el => {
        el.addEventListener('scroll', hideOnScroll, { passive: true });
        scrollEls.push(el);
      });
    }

    return () => {
      window.removeEventListener('scroll', hideOnScroll);
      document.removeEventListener('scroll', hideOnScroll, { capture: true } as any);
      scrollEls.forEach(el => el.removeEventListener('scroll', hideOnScroll as any));
    };
  }, [selectedCell]);

  const handleClickOpenDailyLessonModal = (dailyLesson: DailyLesson, type: TimetableDailyLessonChangeType) => {  
    const { classId, lessonDate, period } = dailyLesson;
    const { teacherId } = selectedCell || {};
    
    setDailyLessonModalOptions({
      teacherId: teacherId || null,
      classId: classId || null,
      lessonDate: lessonDate || null,
      period: period || null,
      dailyLesson: dailyLesson, 
    });

    setSelectedLessonChangeType(type);
    setChangeLessonModal(true);

    setSelectedCell(null);
  };

  const isShowExchangeButton = useMemo(() => {
    if(!selectedCell) {
      return false;
    }

    // 변경사항이 없고, 동시수업도 아니고, 연속수업도 아닌 수업만 교체 가능
    const { dailyLesson } = selectedCell;
    return dailyLesson.changeType === TimetableDailyLessonChangeType.None &&
      !dailyLesson.concurrentCourseId &&
      !dailyLesson.consecutiveGroupId;
    ;
  }, [selectedCell]);


  // 교사 시간표, 학급 시간표 선택 옵션 변경 핸들러
  const handleViewTypeChange = (value: string) => {
    setViewType(value);
  };

  const handleChange = (timestamp) => {
    //console.log('선택된 날짜:', new Date(timestamp))
  }

  return (
    <>
      <div className={`${styles.lessonChangeRequest} !mt-6`}> 
        <div ref={rootRef} className="lesson-change gray-box type01 !mt-0 !p-6">
          {/* 상단 필터 영역 */}
          <div className="flex justify-between a-center !mb-5">
            <div className="form-group-inline">
              {viewTypeOptions.map((option) => (
                <div key={option.value} className="form-ctr">
                  <input 
                    type="radio" 
                    name={option.name}
                    value={option.value}
                    id={`createMethod-${option.value}`}
                    checked={viewType === option.value}
                    onChange={(e) => handleViewTypeChange(e.target.value)}
                  />
                  <label htmlFor={`createMethod-${option.value}`} className="radio-item">
                    <span>{option.label}</span>
                  </label>
                </div>
              ))}       
            </div>
            {viewType === 'teacher' && (
            <div className="select-area">
              <label>교사명</label>
              <HiSelectBox
                value={selectedTeacherId}
                onChange={setSelectedTeacherId}
                items={teacherOptions}
                emptyTitle={"교사명"}
              />
            </div>)}
            {viewType === 'class' && (
            <div className="select-area">
              <label>학급명</label>
              <HiSelectBox
                value={selectedClassId}
                onChange={setSelectedClassId}
                items={classOptions}
                emptyTitle={"학급명"}
              />
            </div>)}
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex gap-4 items-start">
            {/* 주별 리스트 */}
            <div className="table-content basic-line-table table-box sticky-wrap custom-scr sm">
              <table>
                <caption>날짜선택</caption>
                <colgroup><col style={{ width: "45px" }} /><col style={{ width: "auto" }} /></colgroup>
                <thead>
                  <tr>
                    <th className="sticky-top">주</th>
                    <th className="sticky-top">기간 선택</th>
                  </tr>
                </thead>
                <tbody>
                  {weekData.map((item) => (
                    <tr key={`week-number-${item.week}`} className={selectedWeek === item.week ? 'selected' : ''} onClick={() => setSelectedWeek(item.week)}>
                      <td>{item.week}</td>
                      <td className="!text-left">{item.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 시간표 영역 */}
            <div className="table-content custom-scr table-box time-table sticky-wrap">
              <table>
                <caption>시간표</caption>
                <colgroup>
                  <col style={{ width: "32px", minWidth: "32px", maxWidth: "32px"}} />
                  {lessonDays.map((d, idx) => (
                    <col key={`day-index-${idx}`} style={{ width: lessonDaysColWidth, minWidth: "105px" }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="sticky-top stickry-left"></th>
                    {lessonDays.map((d) => (
                      <th className="sticky-top" key={`day-header-${d.lessonDate}`}>
                        {readableLessonDayWithDayOfWeek(d)}
                      </th>
                    ))}
                  </tr>
                </thead>                
                {/* 교사 미선택시 */}
                {isNotSelected && (
                <tbody className='no-data'>
                  <tr>
                    <td>1</td>
                    <td rowSpan={getMaxPeriod()} colSpan={lessonDays.length}>
                      {viewType === 'teacher' ? '교사를' : '학급을'} 선택하세요.
                      
                    </td>
                  </tr>
                  {[...Array(getMaxPeriod() - 1)].map((_, idx) => (
                    <tr key={`no-data-row-${idx}`}>
                      <td>{idx + 2}</td>
                    </tr>
                  ))}
                </tbody>)}
                {/* 교사 선택시 */}
                {!isNotSelected && (
                <tbody>
                  {Array.from({ length: getMaxPeriod(selectedDailyLessons) }).map((_, periodIdx) => (
                  <tr key={`selected-period-index-${periodIdx}-${selectedTeacherId}`}>
                    <td className="th sticky-left">{adjustDisplayedPeriod(periodIdx)}</td>
                      {lessonDays.map((d, dayIdx) => (
                      <td key={`selected-period-${periodIdx}-day-${dayIdx}`}>
                        {viewType === 'teacher' ? renderTeacherLessons(d.lessonDate, periodIdx + 1, selectedTeacherId, handleClickCell) : renderClassLessons(d.lessonDate, periodIdx + 1, selectedClassId, handleClickCell)}
                        
                        {false && selectedCell && selectedCell.lessonDate === d.lessonDate && selectedCell.period === periodIdx + 1 && (
                          <div className='lessonChangeRequest-option-layer' />
                        )}
                      </td>))}
                  </tr>))}
                </tbody>)}
              </table>
            </div>
          </div>
        </div>

        {/* 우측 사이드바 */}
        <div className="sidebar-content">
          {/* 학사일정 */}
          <div className="panel hidden">
            <div className="panel-body">            
              <div className="h4-tit !mb-2 flex justify-between">
                <h4>학사일정</h4>
                  <HiButton type="button" variant="tertiaryBlue" onClick={() => setScheduleModalOpen(true)}>일정 등록</HiButton>
              </div>
              <div className="school-calendar">
                <div className="calendar-wrap">
                  <Calendar
                    timestamp={new Date().getTime()}
                    onChange={handleChange}
                    onClose={() => {}}
                    withTime={false}
                    maximum={1}
                    allowPast={true}
                    className="custom-calendar"
                    schedules={[
                      new Date(2025, 11, 5).getTime(),
                      new Date(2025, 11, 7).getTime()
                    ]}
                  />           
                </div>
                <div className='divider'></div>
                <div className="schedule-wrap">
                  <div className="schedule-day">8월 12일 수요일</div>
                  <div className="event-item-list">
                    <div className="event-item">
                      <span className="event-label">내 일정</span>
                      <p>학교 가을 운동회 텍스트 길면 긴대로 작성하고 다 노출해주기 최대 100자까지 작성하고 모두 표기해주기학교 가을 운동회 텍스트 길면 긴대로 작성하고 다 노출해주기 최대 100자까지</p>
                    </div>
                    <div className="event-item">
                      <span className="event-label">학사일정</span>
                      <p>자율동아리</p>
                    </div>
                    <div className="event-item">
                      <span className="event-label">학사일정</span>
                      <p>학교 가을 운동회</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 시간표 변경사항 */}
          {/*
          <div className="panel">
            <div className="panel-body">
              <div className="h4-tit mb-2 flex justify-between">
                <h4>시간표 변경사항</h4>
                <HiButton type="button" variant="tertiaryBlue" 
                  onClick={handleClickOpenChangeLessonModal}>수업 변경</HiButton>
              </div>
              <div className="table-content basic-table sticky-wrap custom-scr">
                <table>
                  <caption>시간표 변경 사항</caption>
                  <colgroup>
                    <col style={{ width: "15%", minWidth: "120px" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "auto" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <tbody>
                    {scheduleData.map((item, index) => (
                      <tr key={index}>
                        <td className="!text-left new">{item.subject}</td>
                        <td className="!text-left">{item.class}</td>
                        <td className="!text-left" >
                          {item.change.map((changeItem, changeIndex) => (
                            <p key={changeIndex}>{changeItem}</p>
                          ))}
                        </td>
                        <td>{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          */}
          <LessonChangeHistoryOnMyHome
            timetableId={timetableId}
            classId={viewType === 'class' ? selectedClassId : undefined}
            teacherId={viewType === 'teacher' ? selectedTeacherId : undefined}
            startDateNumber={selectedDates.selectedStartDate}
            endDateNumber={selectedDates.selectedEndDate}
            onClickOpenChangeLessonModal={handleClickOpenChangeLessonModal}            
          />
        </div>
    </div>
    <DailyLessonsModal
      selectedTimetable={selectedTimetable}
      isOpen={changeLessonModal}
      setIsOpen={setChangeLessonModal}
      selectedLessonChangeType={selectedLessonChangeType}
      setSelectedLessonChangeType={setSelectedLessonChangeType}
      reload={() => fetchDailyLessons()}
      options={dailyLessonModalOptions}
      isManagerView={false}
    />
    {selectedCell && optionLayerPos && ReactDOM.createPortal(
      <div className="lessonChangeRequest-option-layer" style={{ position: 'fixed', left: optionLayerPos.left + 'px', top: optionLayerPos.top + 'px', zIndex: 99999 }}>
        <div className={`option-list custom-scr sm`}>
          {isShowExchangeButton && (
            <button className="item" onClick={() => { handleClickOpenDailyLessonModal(selectedCell.dailyLesson, TimetableDailyLessonChangeType.Exchange); }}>
              수업교체
            </button>
          )}
          <button className="item" onClick={() => { handleClickOpenDailyLessonModal(selectedCell.dailyLesson, TimetableDailyLessonChangeType.Adjustment); }}>
            결,보강
          </button>
        </div>
      </div>, document.body
    )}

    {/* 일정 등록 모달 */}
    <HiModal
      className={styles['my-schedule']}
      isOpen={scheduleModalOpen}
      onClose={() => setScheduleModalOpen(false)}
      size="md"
      heading={'내 일정 등록하기'}
      desc={'내 일정을 등록해주세요. 서브문구 필요 서브문구 서브문구'}
      content={
        <>
          <div className="form-group-inline">
            <DatetimePicker
              timestamp={scheduleDate}
              onChange={setScheduleDate}
              withTime={false}
              formatter={formatKoreanDate}
              onBeforeSelect={undefined}
              calendar={undefined}
            />
          </div>
          <div className="form-ctr mt-2">
            <textarea
              className="w-full"
              placeholder="내용을 입력해주세요."
              rows={8}
              value={scheduleContent}
              onChange={(e) => setScheduleContent(e.target.value)}
            />
          </div>
        </>
      }
      footer={
        <>
          <HiButton type="button" variant="tertiary" onClick={() => setScheduleModalOpen(false)}>취소</HiButton>
            <HiButton
              type="button"
              variant="primary"
              onClick={handleSaveSchedule}
              disabled={!scheduleContent.trim()}
            >
              저장
            </HiButton>
        </>
      }
      dimClose={true}
    />
  </>
  );
};

const ChangeHistoryManagement: FC<{ externalTimetableId?: string | null, selectedTimetable?: TimetableIndex | null, initStatus?: TimetableLessonChangeStatus | null }> = ({ externalTimetableId, selectedTimetable, initStatus }) => {
  return (    
    <LessonChangeManagement isManagerView={false} externalTimetableId={externalTimetableId} selectedTimetable={selectedTimetable} initStatus={initStatus} />
  );
};

const LessonStatsManagement: FC = () => {
  return (
    <div>시수 누계 관리</div>
  );
};
export default MyHome;
