import { use, useEffect, useMemo, useState } from 'react';
import { MobileHeader, Button, HiTab } from '@/components/uiux/';
import clsx from 'clsx';
import { LessonTable } from './LessonTable';
import type { DayHeader, PeriodRow } from './LessonTable';
import { Textarea } from '@/components/uiux/textarea';
import { Core, WeekRange, withWeekRange } from '../../types';
import { TimetableTeacherContext, useTeacherContext } from '../../context';

const formatSwapRow = (item: SwapItem) =>
  `${item.date} (${item.day}${item.period}) ${item.classNo} ${item.teacher} [${item.subject}]`;

/* ────────────────────────────────────────────────────────────
  샘플 데이터
──────────────────────────────────────────────────────────── */
const headers: DayHeader[] = [
  { day: '월', date: '5월 8일'  },
  { day: '화', date: '5월 9일'  },
  { day: '수', date: '5월 10일' },
  { day: '목', date: '5월 11일' },
  { day: '금', date: '5월 12일' },
];

// 각 탭(교사)별 변경 시간표: before(변경전) / after(변경후) 셀 포함
const tableDataByTab: Record<string, PeriodRow[]> = {
  '반인회': [
    { period: 1, time: '09:00', cells: [
        { classNo: '1-3', subject: '국어A', type: 'default' },
        { classNo: '1-5', subject: '국어A', type: 'default' },
        { classNo: '1-5', subject: '국어A', type: 'default' },
        null,
        { classNo: '1-5', subject: '국어A', type: 'default' },
    ]},
    { period: 2, time: '09:55', cells: [
        null,
        { classNo: '1-5', subject: '수학B', type: 'default' },
        { classNo: '1-5', subject: '수학B', type: 'default' },
        null,
        { classNo: '1-5', subject: '수학B', type: 'default' },
    ]},
    { period: 3, time: '10:50', cells: [
        { classNo: '1-3', subject: '영어A', type: 'default' },
        null,
        null,
        { classNo: '1-5', subject: '영어A', type: 'default' },
        null,
    ]},
    { period: 4, time: '11:45', cells: [
        { classNo: '1-3', subject: '과학', type: 'default' },
        { classNo: '1-5', subject: '과학', type: 'default' },
        null,
        { classNo: '1-5', subject: '과학', type: 'default' },
        null,
    ]},
    { period: 5, time: '13:20', cells: [
        null,
        { classNo: '1-5', subject: '국어A', type: 'before' },  // 변경전 (원래 수업)
        null,
        null,
        { classNo: '1-5', subject: '국어A', type: 'default' },
    ]},
    { period: 6, time: '14:15', cells: [
        { classNo: '1-3', subject: '체육', type: 'default' },
        { classNo: '1-5', subject: '국어A', type: 'after' },   // 변경후 (이동된 수업)
        null,
        null,
        { classNo: '1-5', subject: '미술', type: 'default' },
    ]},
    { period: 7, time: '15:10', cells: [
        null,
        null,
        { classNo: '1-5', subject: '도덕', type: 'default' },
        { classNo: '1-5', subject: '도덕', type: 'default' },
        null,
    ]},
    { period: 8, time: '15:15', cells: [null, null, null, null, null] },
  ],
  '무명속': [],
};

// const TABS = ['반인회', '무명속'];

/* ────────────────────────────────────────────────────────────
  컴포넌트
──────────────────────────────────────────────────────────── */
interface SwapItem {
  date: string;
  day: string;
  period: number;
  classNo: string;
  teacher: string;
  subject: string;
}

type SwapOption = {
  id: string;
  type: '1:1' | 'chain';
  items: SwapItem[];
}

interface OriginalSelection {
  classNo: string;
  subject: string;
  period: number;
  date?: string;
  day?: string;
}

interface LessonChangeConfirmProps {
  onBack: () => void;
  weekRange?: WeekRange | null;
  dailyLessons?: Core.DailyLesson[] | null;  
  selectedDailyLesson?: Core.DailyLesson | null;
  exchangePath?: Core.DailyLessonMoveInfo[] | null;
  className?: string;
  onSubmit?: (reason: string) => void;
}

const LessonChangeConfirm = ({ 
  onBack,
  weekRange,
  dailyLessons,
  selectedDailyLesson,
  exchangePath,
  className,
  onSubmit,
}: LessonChangeConfirmProps) => {
  const teachers = useTeacherContext();
  const teacherContext = TimetableTeacherContext.getInstance();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [reason, setReason] = useState('');
  const [sourceDailyLesson, setSourceDailyLesson] = useState<Core.DailyLesson | null>(null);
  const [targetDailyLesson, setTargetDailyLesson] = useState<Core.DailyLesson | null>(null);

  const teacherMap = useMemo(
    () => teacherContext.teacherMap || ({} as Record<string, Core.Teacher>),
    [teachers]
  );

  // test
  useEffect(() => {
    console.log('LessonChangeConfirm exchangePath updated:', exchangePath);
  }, [exchangePath]);

  const sortedExchangePath = useMemo(() => {
    // 시작 정보가 맨 뒤에 오기 때문에 순서를 조정한다. 가장 뒤 정보만 앞으로 보내면 된다. (2-3-4-5-6-7-8-1 형태)
    if(!exchangePath || exchangePath.length === 0) {
      return [];
    }

    const pathForSort = [...exchangePath];
    const last = pathForSort.pop()!;
    return [last, ...pathForSort];
  }, [exchangePath]);

  const allTeacherIds = useMemo(() => {
    if(!sortedExchangePath || sortedExchangePath.length === 0) {
      return [];
    }

    const teacherIds = sortedExchangePath.map(path => {
      return path.sourceLesson?.lessonTeacherIds || [];            
    }).flat();
    const uniqueTeacherIds = Array.from(new Set(teacherIds));
    return uniqueTeacherIds;
  }, [sortedExchangePath]);

  const activeTeacherId = useMemo(() => {
    if(!allTeacherIds || allTeacherIds.length === 0) {
      return null;
    }
    
    return allTeacherIds[activeTabIndex] || null;    
  }, [allTeacherIds, activeTabIndex]);


  const activeMoveInfo = useMemo(() => {
    if(!activeTeacherId || !exchangePath) {
      return null;
    }

    // 현재 선택된 탭(교사)에 해당하는 교체 경로 정보를 찾는다.
    const pathForTeacher = exchangePath.find(path => {
      return path.sourceLesson?.lessonTeacherIds?.includes(activeTeacherId);
    });

    return pathForTeacher || null;
  }, [activeTeacherId, exchangePath]);
  
  
  const tabLabels = useMemo(() => {
    if(!allTeacherIds || allTeacherIds.length === 0) {
      return [];
    }

    return allTeacherIds.map(teacherId => teacherMap[teacherId])
      .filter(t => t !== undefined)
      .map(t => t.teacherName);
  }, [allTeacherIds, teacherMap]);


  useEffect(() => {
    if(!activeMoveInfo) {
      setSourceDailyLesson(null);
      setTargetDailyLesson(null);
      return;
    }

    const { sourceLesson, targetPeriod } = activeMoveInfo;

    const targetLesson = {
      ...sourceLesson,
      lessonDate: targetPeriod?.lessonDate,
      period: targetPeriod?.period,
      dayOfWeek: targetPeriod?.dayOfWeek,
      dailyLessonId: '',
    } as Core.DailyLesson;

    setSourceDailyLesson(sourceLesson || null);
    setTargetDailyLesson(targetLesson || null);
  }, [activeMoveInfo]);

  const handleSendButtonClick = () => {
    onSubmit && onSubmit(reason);
  }

  return (
    <div className={clsx('flex flex-col h-screen bg-bg-base select-none', className)}>
        <MobileHeader
          title="변경 시간표 확인"
          onBack={onBack}          
          className="border-b-0"
          rightArea={
            <Button
              variant="link"
              size="sm"
              className="font-semibold pr-5 !text-b1 mr-2 !leading-b1"
              style={{ color: 'var(--text-primary-base)' }}
              onClick={handleSendButtonClick}>
              보내기
            </Button>
          }
        />

        {/* 탭 */}
        <div className="px-4 pt-6 pb-4 shrink-0">
          <HiTab
            labels={tabLabels}
            variant="pills"
            size="sm"
            selectedTabIndex={activeTabIndex}
            isControlOuter
            onChange={setActiveTabIndex}
          />
        </div>

        <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* 변경 전후 시간표 */}
          <LessonTable
            weekRange={weekRange}
            dailyLessons={dailyLessons || []}
            selectedTeacherId={activeTeacherId || ''}
            sourceDailyLesson={sourceDailyLesson}
            targetDailyLesson={targetDailyLesson}
          />

          {/* 변경 사유 */}
          <div className="mt-6">
              <p className="mb-3 text-leading-b2 font-semibold text-text-default">변경 사유</p>            
              <Textarea
                value={reason}
                onChange={e => {
                  const newValue = e.target.value;
                  const sanitized = newValue.replace(/\n/g, '');
                  setReason(sanitized);
                }}
                placeholder="선택 사항 (최대 50자)"
                rows={2}
                className='rounded-md'
                maxLength={50}
                isAutoGrow={true}
                canNewLine={false}
              />
          </div>
        </main>
    </div>
  );
};

export default LessonChangeConfirm;
