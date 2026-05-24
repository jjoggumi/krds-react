import qs from 'qs';
import { FC, useEffect, useState, useMemo } from "react";
import clsx from 'clsx';
import { Hc2Timetables } from "../../apis";
import { Class, Course, Teacher, TimetableDailyLessonChangeType, TimetableLessonChange, TimetableLessonChangeStatus, TimetableLessonChangeType } from "../../core/types";
import { TimetableDisplayUtils, TimeUtils, TypeUtils, } from "../../common/utils";
import { lessonChangeTypeMap } from '../main/constants';
import { PageResponse } from '../../common/types';
import { 
  TimetableClassContext,
  TimetableCourseContext,
  TimetableTeacherContext,
  useClassContext,
  useCourseContext,
  useGradeContext,
  useTeacherContext
} from '../../contexts';
import NoData from '@/components/uiux/noData';
import { start } from 'repl';
import { isReturnStatement } from 'typescript';


interface LessonChangeHistoryOnMyHomeProps {
  timetableId: string;
  teacherId?: string;
  classId?: string;
  startDateNumber?: number;
  endDateNumber?: number;
  onClickOpenChangeLessonModal: () => void;
}

interface LessonChangeHistory {
  lessonChangeId: string;
  changeTypeNames: string[];
  classNames: string[];
  contents: string[];
  approvedDate: string;
}

interface LessonChangeContent {
  date: string;
  from: string;
  to: string;
}

const DOT_PSEUDO = "relative before:content-[''] before:absolute before:left-1 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-graphic-coral";

const LessonChangeHistoryOnMyHome: FC<LessonChangeHistoryOnMyHomeProps> = ({
  timetableId,
  teacherId,
  classId,
  startDateNumber,
  endDateNumber,
  onClickOpenChangeLessonModal
}) => {
  
  const timetableConfig = useGradeContext();
  const classes = useClassContext();
  const teachers = useTeacherContext();
  const courses = useCourseContext();

  const classContext = TimetableClassContext.getInstance();
  const teacherContext = TimetableTeacherContext.getInstance();
  const courseContext = TimetableCourseContext.getInstance();

  const [ startPeriod, setStartPeriod ] = useState<number | null>(1);

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


  const [lessonChanges, setLessonChanges] = useState<TimetableLessonChange[]>([]);

  const formatApprovedDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const fetchLessonsChanges = async () => {
    const lessonChangeTypes = [
      TimetableDailyLessonChangeType.Exchange,
      TimetableDailyLessonChangeType.Adjustment,
      TimetableDailyLessonChangeType.Replacement,
      TimetableDailyLessonChangeType.Addition,
      TimetableDailyLessonChangeType.Combination,
      TimetableDailyLessonChangeType.Multiple,
    ];
    
    const query = {
      changeType: TimetableLessonChangeType.Lesson,
      lessonChangeTypes,
      statuses: TimetableLessonChangeStatus.Completed,
      lessonDateStart: startDateNumber,
      lessonDateEnd: endDateNumber,
      // startTimestamp,
      // endTimestamp,
      teacherId,
      classId,
      page: 0,
      size: 20,
      sort: `updatedTimestamp,desc`,
    }

    const api = new Hc2Timetables();

    try {
      const res = await api.getLessonChangesLessonchanges(
        timetableId,
        query,
        { paramsSerializer: (params: any) => qs.stringify(params, {arrayFormat: 'repeat'})}
      );

      const { page, _embedded } = (res.data as PageResponse<TimetableLessonChange>);
      const result = _embedded ? _embedded.lessonChanges : [];

      setLessonChanges(result);
    }
    catch (error) {
      console.error(">>> Error fetching lesson changes:", error);
    }
  }

  useEffect(() => {
    if((!!startDateNumber !== !!endDateNumber)) {
      // 시작 날짜와 종료 날짜는 함께 있어야 하므로, 둘 중 하나만 있는 경우에는 API 호출을 하지 않음
      return;
    }

    fetchLessonsChanges();
  }, [teacherId, classId, startDateNumber, endDateNumber]);

  useEffect(() => {
    if (!timetableConfig) {
      return;
    }

    setStartPeriod(timetableConfig?.startPeriod ?? 1);
  }, [timetableConfig]);

  const lessonChangeHistories: LessonChangeHistory[] = useMemo(() => {
    if(!classes || classes.length === 0) {
      return [];
    }

    return lessonChanges.map(change => {
      const parsedContents = change.contents ? JSON.parse(change.contents) : [];

      // 변경 종류
      const changeTypeNames = [`${lessonChangeTypeMap[change.lessonChangeType]}`];
      if(change.lessonChangeType === TimetableDailyLessonChangeType.Exchange && parsedContents.length > 0) {
        changeTypeNames.push(`(${ parsedContents.length > 2 ? '연쇄교환' : '1:1 교환' })`);
      }

      const selectedClassNames = [];
      const originSelectedName = change.selectedClassName;
      if (Array.isArray(originSelectedName) && originSelectedName.length > 0 && TypeUtils.isUUID(originSelectedName[0])) {
        const [classId, extraCount] = originSelectedName;
        const classLabel = classMap[classId] ? TimetableDisplayUtils.formatFullClassName(classMap[classId]) : classId;
        const suffix = originSelectedName.length === 2 && extraCount ? ` 외 ${extraCount}개반` : '';
        // change.selectedClassName = [ `${classLabel}${suffix}` ];
        selectedClassNames.push(`${classLabel}${suffix}`);
      }      

      // 학반
      const classNames =  [
        ...(Array.isArray(change.selectedGrades) ? change.selectedGrades.map(g => `${g}학년 전체`) : []),
        ...(Array.isArray(selectedClassNames) ? selectedClassNames : [])
      ].filter(Boolean);

      let lessonChangeContents = !Array.isArray(parsedContents) ? parsedContents : [];
      if(Array.isArray(parsedContents)) {
        const formattedContents = parsedContents.map(content => {
          if (!content.lessonDate || !content.period) return content;

          const lessonDate = TimeUtils.getNumberAsDate(content.lessonDate);
          const formattedDate = `${lessonDate.getMonth() + 1}/${lessonDate.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][lessonDate.getDay()]}${startPeriod ? content.period : Number(content.period) - 1})`;

          const fromCourse = courseMap[content.sourceCourseId]?.displayedTitle.trim() || '';
          const fromTeacher = (content.sourceTeacherIds || []).map((tId: string) => teacherMap[tId]?.teacherName).join(', ');

          const toCourse = courseMap[content.targetCourseId]?.displayedTitle.trim() || '';
          const toTeacher = (content.targetTeacherIds || []).map((tId: string) => teacherMap[tId]?.teacherName).join(', ');

          return {date: formattedDate, from: `${fromCourse} ${fromTeacher}`, to: `${toCourse} ${toTeacher}`} as LessonChangeContent;
        });

        lessonChangeContents = formattedContents;
      }

      const isExchange = change.lessonChangeType === TimetableDailyLessonChangeType.Exchange;
      const contents = lessonChangeContents.map((c: LessonChangeContent) => {
        if(isExchange) {
          return `${c.date} ${c.from} → ${c.to}`;
        }
        return `${c.date} ${c.to}`;
      }) as string[];

      const approvedDate = change.approvedTimestamp ? formatApprovedDate(change.approvedTimestamp) : '';

      return {
        lessonChangeId: change.lessonChangeId,
        changeTypeNames,
        classNames,
        contents,
        approvedDate
      } as LessonChangeHistory;
    });
  }, [lessonChanges, classes, startPeriod]);


  const handleClickOpenChangeLessonModal = () => {
    onClickOpenChangeLessonModal && onClickOpenChangeLessonModal();
  };


  return (
    <div className="panel">
      <div className="panel-body">
        <div className="h4-tit mb-2 flex justify-between">
          <h4>시간표 변경사항</h4>
          <button 
            className="btn btn-md btn-tertiary-blue"
            onClick={handleClickOpenChangeLessonModal}
          >수업 변경</button>
        </div>
        <div className="table-content basic-table bottom-border sticky-wrap custom-scr">
          <table className={lessonChangeHistories.length === 0 ? 'h-full' : ''}>
            <caption>시간표 변경 사항</caption>
            <colgroup>
              <col style={{ width: "15%", minWidth: "120px" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="sticky-top">변경종류</th>
                <th className="sticky-top">학반</th>
                <th className="sticky-top">변경내용</th>
                <th className="sticky-top">변경일</th>
              </tr>            
            </thead>
            <tbody>
              {lessonChangeHistories.length === 0 ? (
                <tr className="no-data">
                  <td colSpan={4} style={{ textAlign: 'center'}}>
                    <NoData message="변경사항이 없습니다" />
                  </td>
                </tr>
              ) : (
                lessonChangeHistories.map((item, index) => (
                  <tr key={index}>
                    <td className={clsx(
                      // 새로운 변경사항인경우 DOT_PSEUDO 클래스 추가
                      item.isNew ? DOT_PSEUDO : ""
                    )} dangerouslySetInnerHTML={{ __html: item.changeTypeNames?.join('<br />') }}></td>
                    <td>{item.classNames?.join(', ')}</td>
                    <td className="!text-left" dangerouslySetInnerHTML={{ __html: item.contents?.join('<br />') }}></td>
                    <td>{item.approvedDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
};

export default LessonChangeHistoryOnMyHome;