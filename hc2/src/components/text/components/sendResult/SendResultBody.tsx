import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { InView } from 'react-intersection-observer';
import SideModal from '@/components/uiux/sideModal';
import {
  useTextSendResult,
  useTextSendResultInvalidate,
  useUpdateTextSendResultMessage,
  useTextSendResultMessage,
  useTextSendResultMessageResultType,
  useTextSendResultDetailInvalidate,
} from '@/components/text/queries/useSendResult';
import { useTextContext } from '@/components/text/context/TextContext';
import { ShowConfirm, CONFIRM_OPTIONS } from '@/components/uiux';
import { showToast } from '@/unimplementeds/toast';
import Tooltip from '@/components/uiux/tooltip';
import style from './SendResultBody.module.scss';
import {
  DisplayStatus,
  MsgType,
  ResultType,
  SendResultSort,
  SendResultType,
  SendType,
  SortDirection,
  SortType,
  WeblinkCode
} from '../../types';
import { ApiError } from '../../api/error';
import { ContentPreview } from '@/components/text/components/send/SendPreview';
import { TitleArea } from '@/components/uiux/titlearea';
import { HiTab, HiButton, Icon, Badge, Card, CheckBox, Loading , Button} from '@/components/uiux';
import { RadioBoxGroup } from '@/components/uiux/radiobox';
import { DatetimePicker } from '@/components/timetable/components/datetimePicker';
import { Table, TableBody, TableHead, TableRow, TableCell, TableCaption } from '@/components/uiux/table';
import { SEND_VERSION_2, SESSION_STORAGE_KEY_LAST_MESSAGE_ID, SESSION_STORAGE_KEY_LAST_SEND_TYPE } from '../../constants';
import {
  renderTimestamp,
  renderSenderNumber,
  renderCountValue,
  renderReceipientInfo,
  replaceMessage,
  renderPeriodTimestamp,
  applyHighlightMessage,
} from '../../utils';
import { SendResultStatusBadge } from './SendResultStatusBadge';
import NoData from '@/components/uiux/noData';
import { useApiErrorHandler } from '../../hooks/apiErrorHandler';
import { useLocation } from 'react-router-dom';
import { Link, RotateCcw, ChevronLeft } from 'lucide-react';
import { SendReceiverContextProvider, useSendReceiverContext } from '../../context/SendContext';
import { WeblinkViewPopup } from '../send/modal/WeblinkPreviewModal';
import { useWeblinkDetail } from '../../queries/useWeblink';
import {
  STAGGER_CONTAINER_VARIANTS,
  FADE_IN_UP_VARIANTS,
  FADE_IN_UP_ORDERED_VARIANTS,
} from '@/components/text/constants/animations';
import { useQueryClient } from '@tanstack/react-query';
import { sendResultKeys } from '../../queries/keys';
import { HiTable, HiTableBody, HiTableRow, HiTableTd, HiTableTh } from '@/components/uiux/hiTable';

const renderPoint = (point?: number | null) => {
  if (point === null || point === undefined) return '-';
  return `${(point).toLocaleString()}P`;
};

// 문자 2차 : 검색 필터 추가
type PeriodFilterMode = 'all' | 'range';

const SendResultSearchFilterCard = ({
  isDetailSearchOpen,
  setIsDetailSearchOpen,
}: {
  isDetailSearchOpen: boolean;
  setIsDetailSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // 임시 상태(추후 실제 검색 파라미터로 연결 가능)
  const [periodMode, setPeriodMode] = useState<PeriodFilterMode>('all');
  const [startTimestamp, setStartTimestamp] = useState<number>(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [endTimestamp, setEndTimestamp] = useState<number>(() => Date.now());

  // 유형(체크박스) - 임시 상태
  const [selectedMsgTypes, setSelectedMsgTypes] = useState<MsgType[]>([MsgType.SMS, MsgType.LMS]);

  // 진행 상황(체크박스)
  // - 빈 배열([])이면 '전체'로 간주
  const [selectedStatuses, setSelectedStatuses] = useState<DisplayStatus[]>([]);

  const periodOptions = [
    { label: '전체', value: 'all' as const },
    { label: '기간', value: 'range' as const },
  ];

  const formatter = (timestamp: number | null | undefined) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const date = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    return date;
  };

  const handleChangeStart = (timestamp: number) => {
    setStartTimestamp(timestamp);
    if (timestamp > endTimestamp) setEndTimestamp(timestamp);
  };

  const handleChangeEnd = (timestamp: number) => {
    setEndTimestamp(timestamp);
    if (timestamp < startTimestamp) setStartTimestamp(timestamp);
  };

  const toggleMsgType = (msgType: MsgType) => {
    setSelectedMsgTypes((prev) => {
      const next = prev.includes(msgType) ? prev.filter((t) => t !== msgType) : [...prev, msgType];
      // 둘 다 해제되는 케이스는 '전체' 의미로 다시 둘 다 선택 상태로 복구
      return next.length === 0 ? [MsgType.SMS, MsgType.LMS] : next;
    });
  };

  const toggleStatus = (status: DisplayStatus) => {
    setSelectedStatuses((prev) => {
      const next = prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status];
      // next가 빈 배열이면 '전체' 의미
      return next;
    });
  };

  return (
    <Card variant="border" size="md" className="mb-5 mt-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="txt-body-b2 font-medium min-w-20">기간</span>
          <div className="flex items-center flex-nowrap h-10">
            <RadioBoxGroup
              options={periodOptions}
              value={periodMode}
              onChange={(v) => setPeriodMode(v as PeriodFilterMode)}
              name="send-result-period"
              className="gap-10"
            />
            {periodMode === 'range' && (
              <div className="ml-2 shrink-0 flex items-center">
                <DatetimePicker
                  timestamp={startTimestamp}
                  onChange={handleChangeStart}
                  calendar={null}
                  position="top"
                  withTime={false}
                  allowPast={true}
                  disabled={false}
                  style={{ width: 180 }}
                  formatter={formatter}
                />
                <span className="mx-2">-</span>
                <DatetimePicker
                  timestamp={endTimestamp}
                  onChange={handleChangeEnd}
                  calendar={null}
                  position="top"
                  withTime={false}
                  allowPast={true}
                  disabled={false}
                  style={{ width: 180 }}
                  formatter={formatter}
                />
              </div>
            )}
          </div>
        </div>

          <HiButton
            variant="link"
          onClick={() => setIsDetailSearchOpen((v) => !v)}
          aria-expanded={isDetailSearchOpen}
          className="group"
        >
          <Icon
            icon="arrow-right"
            iconSize={16}
            className={`transition-transform ${isDetailSearchOpen ? '-rotate-90' : 'rotate-90'}`}
          />
          {isDetailSearchOpen ? '상세검색 닫기' : '상세검색'}
        </HiButton>
      </div>

      {isDetailSearchOpen && (
        <div className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="txt-body-b2 font-medium min-w-20">유형</span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedMsgTypes.includes(MsgType.SMS)}
                    onChange={() => toggleMsgType(MsgType.SMS)}
                  />
                  <span className="txt-body-b3">SMS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedMsgTypes.includes(MsgType.LMS)}
                    onChange={() => toggleMsgType(MsgType.LMS)}
                  />
                  <span className="txt-body-b3">LMS</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="txt-body-b2 font-medium min-w-20">진행 상황</span>
              <div className="flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedStatuses.length === 0}
                    onChange={() => setSelectedStatuses([])}
                  />
                  <span className="txt-body-b3">전체</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedStatuses.includes(DisplayStatus.RESERVED)}
                    onChange={() => toggleStatus(DisplayStatus.RESERVED)}
                  />
                  <span className="txt-body-b3">예약</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedStatuses.includes(DisplayStatus.CANCELED)}
                    onChange={() => toggleStatus(DisplayStatus.CANCELED)}
                  />
                  <span className="txt-body-b3">예약취소</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedStatuses.includes(DisplayStatus.SENT)}
                    onChange={() => toggleStatus(DisplayStatus.SENT)}
                  />
                  <span className="txt-body-b3">발송 중</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedStatuses.includes(DisplayStatus.PENDING)}
                    onChange={() => toggleStatus(DisplayStatus.PENDING)}
                  />
                  <span className="txt-body-b3">발송 대기</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedStatuses.includes(DisplayStatus.COMPLETED)}
                    onChange={() => toggleStatus(DisplayStatus.COMPLETED)}
                  />
                  <span className="txt-body-b3">처리 완료</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <CheckBox
                    checked={selectedStatuses.includes(DisplayStatus.FAILED)}
                    onChange={() => toggleStatus(DisplayStatus.FAILED)}
                  />
                  <span className="txt-body-b3">처리 실패</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const SendResultBody = () => {
  const { currentSchool } = useTextContext();
  const location = useLocation();
  const queryFrom = location.state.from;

  const {
    deleteTextSendResultMessageMutateAsync,
    updateStateTextSendResultMessageMutateAsync,
  } = useUpdateTextSendResultMessage();

  const invalidate = useTextSendResultInvalidate();

  const { handleError } = useApiErrorHandler();

  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const statusPopupRef = useRef<HTMLDivElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllSelectedMode, setIsAllSelectedMode] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectDetailTabIndex, setSelectDetailTabIndex] = useState(0);
  const [selectDetailMainTabIndex, setSelectDetailMainTabIndex] = useState(0);
  const [detailRow, setDetailRow] = useState<any>(null);
  const [isDetailSearchOpen, setIsDetailSearchOpen] = useState(false); // 문자 2차 : 검색 필터 오픈 상태
  const [sort, setSort] = useState<SendResultSort>({
    sort: SortType.DEFAULT,
    direction: SortDirection.DESC
  });
  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useTextSendResult(currentSchool.schoolId, sort);

  const rows = useMemo(() => {
    if (!pages) return [];
    return pages.flatMap((page) => page.lists);
  }, [pages])

  // 신규 추가 항목 하이라이트 관리
  const [newIds, setNewIds] = useState<string[]>([]);

  useEffect(() => {
    if (queryFrom !== 'send') return;
    const targetMessageId = sessionStorage.getItem(SESSION_STORAGE_KEY_LAST_MESSAGE_ID);
    const targetSendType = sessionStorage.getItem(SESSION_STORAGE_KEY_LAST_SEND_TYPE);
    if (!targetMessageId || !rows || !targetSendType) return;

    const curr = rows.find(r => r.messageId === targetMessageId);
    let added: string[] = [];
    if (curr) {
      added = [curr.messageId];
      if (!added.length) return;
      setNewIds(added);
      const t = setTimeout(() => {
        setNewIds([])
      }, 2000);
      sessionStorage.removeItem(SESSION_STORAGE_KEY_LAST_MESSAGE_ID);
      sessionStorage.removeItem(SESSION_STORAGE_KEY_LAST_SEND_TYPE);
      const toastMessage = targetSendType === SendType.IMMEDIATE
        ? '메시지가 성공적으로 발송 되었습니다.'
        : '메시지가 성공적으로 예약발송 되었습니다.'
      showToast(toastMessage);
      return () => clearTimeout(t);
    }
  }, [rows, queryFrom]);

  const renderRowTitle = (row) => {
    if (row.msgType === MsgType.LMS) {
      return row.title;
    } else {
      return row.content;
    }
  };


  const isDisableCheckBox = (displayStatus: DisplayStatus) => {
    return !(displayStatus === DisplayStatus.COMPLETED ||
      displayStatus === DisplayStatus.CANCELED ||
      displayStatus === DisplayStatus.FAILED)
  };


  // 전체 선택 여부
  const allChecked = rows.length > 0 && selectedIds.length > 0 && selectedIds.length === rows.filter(r => !isDisableCheckBox(r.displayStatus)).length;

  // 페이징 시 전체 선택 유지용도
  useEffect(() => {
    if (isAllSelectedMode) {
      const selectableIds = rows
        .filter(r => !isDisableCheckBox(r.displayStatus))
        .map(r => r.messageId);

      if (selectableIds.length !== selectedIds.length) {
        setSelectedIds(selectableIds);
      }
    }
  }, [rows, isAllSelectedMode, selectedIds.length]);

  const handleAllCheck = () => {
    setDetailOpen(false);
    if (isAllSelectedMode) {
      setIsAllSelectedMode(false);
      setSelectedIds([]);
    } else {
      setIsAllSelectedMode(true);
      setSelectedIds(rows
        .filter(r => !isDisableCheckBox(r.displayStatus))
        .map(r => r.messageId));
    }
  };

  const handleCheck = (messageId: string) => {
    setDetailOpen(false);
    const isSelected = selectedIds.includes(messageId);
    let nextSelected: string[];

    if (isSelected) {
      nextSelected = selectedIds.filter(i => i !== messageId);
      setIsAllSelectedMode(false);
    } else {
      nextSelected = [...selectedIds, messageId];
      const selectableCount = rows.filter(r => !isDisableCheckBox(r.displayStatus)).length;
      if (nextSelected.length === selectableCount) {
        setIsAllSelectedMode(true);
      }
    }
    setSelectedIds(nextSelected);
  };

  const handleSort = (sortType: SortType) => {
    setDetailOpen(false);
    setSort((prev) => {
      const isDesc = prev?.sort === sortType && prev.direction === SortDirection.DESC;
      return {
        sort: sortType,
        direction: isDesc ? SortDirection.ASC : SortDirection.DESC,
      };
    });
  };

  const handleCancleReservation = async (messageId: string) => {
    if (
      await ShowConfirm(`예약하신 문자를 취소하시겠습니까?`, {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '확인',
        cancelLabel: '취소',
      })
    ) {
      try {
        await updateStateTextSendResultMessageMutateAsync({
          schoolId: currentSchool.schoolId,
          messageId: messageId,
        });
      } catch (e) {
        await handleErrorCancelReservation(e);
      }
    }
  };


  const handleErrorCancelReservation = async (error) => {
    if (error instanceof ApiError) {
      handleError(error, async (errorCode: string) => {
        /*
      후처리가 달라질 수 있을 것 같아 다 나눠놓았음.
      isDeleted(이미삭제), 
      isNotReserved(예약메시지 아님), 
      isImminentReserved(발송 시간 임박),
      isPastReserved(예약시간 지남), 
      alreadyCancel(이미 취소),
      alreadySent(이미 발송중),
      alreadyCompleted(이미 완료)
      */
        switch (errorCode) {
          case 'isDeleted':
            await ShowConfirm('이미 삭제된 메시지입니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            invalidate(currentSchool.schoolId, sort);
            break;
          case 'isNotReserved':
            await ShowConfirm('예약된 메시지가 아닙니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            invalidate(currentSchool.schoolId, sort);
            break;
          case 'isImminentReserved':
            await ShowConfirm('발송 시간이 임박하여 취소 할 수 없습니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            invalidate(currentSchool.schoolId, sort);
            break;
          case 'alreadyCancel':
            await ShowConfirm('이미 취소된 메시지입니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            invalidate(currentSchool.schoolId, sort);
            break;
          case 'isPastReserved':
          case 'alreadySent':
            await ShowConfirm('이미 발송 처리 중인 메시지입니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            invalidate(currentSchool.schoolId, sort);
            break;
          case 'alreadyCompleted':
            await ShowConfirm('발송 요청이 완료된 메시지입니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            invalidate(currentSchool.schoolId, sort);
            break;
          default:
            await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            break;
        }
      })
    } else {
      await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '확인',
        hideCancel: true,
      });
    }
  };

  // 선택 항목 삭제 핸들러
  const handleDelete = async () => {
    setDetailOpen(false);
    if (selectedIds.length > 0 &&
      await ShowConfirm(`총 ${selectedIds.length}건을 삭제하시겠습니까? \n한번 삭제한 내역은 복구가 불가합니다.`, {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '삭제',
        cancelLabel: '취소',
      })
    ) {
      try {
        await deleteTextSendResultMessageMutateAsync({
          schoolId: currentSchool.schoolId,
          messageIds: selectedIds,
        });
        setSelectedIds([]);
        setIsAllSelectedMode(false);
        showToast('정상적으로 삭제 완료되었습니다.');
      } catch (e) {
        if (e instanceof ApiError) {
          handleError(e);
        } else {
          await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
            ...CONFIRM_OPTIONS.TEXT,
            confirmLabel: '확인',
            hideCancel: true,
          });
        }
      }
    }
  };

  const handleClickStatusCount = async (row: any, index: number) => {
    if (row.displayStatus === DisplayStatus.CANCELED) return
    setSelectDetailTabIndex(index);
    setSelectDetailMainTabIndex(1);
    setDetailRow(row);
    setDetailOpen(true);
  };

  const handleInvalidate = async () => {
    setDetailOpen(false);
    setIsRefreshDisabled(true);
    invalidate(currentSchool.schoolId, sort);
    showToast('업데이트 되었습니다.');
    setTimeout(() => {
      setIsRefreshDisabled(false);
    }, 5_000);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showStatusPopup) return;
      if (statusPopupRef.current && !statusPopupRef.current.contains(e.target as Node)) {
        setShowStatusPopup(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showStatusPopup]);

  // 상태 메타 정보: 상태값 -> CSS module dot 클래스, 제목, 설명 (간단화)
  const STATUS_META: Partial<Record<DisplayStatus, { dot: string; title: ReactNode; desc?: ReactNode }>> = {
    [DisplayStatus.RESERVED]: { dot: style.dotBlue, title: '예약', desc: (<>발송 예정 상태로, <span className='text-text-primary-base'>발송 시간 5분 전까지 취소 가능</span></>) },
    [DisplayStatus.PENDING]: { dot: style.dotOrange, title: '발송대기', desc: '발송 요청 접수 후 시스템 처리 대기 중 상태' },
    [DisplayStatus.SENT]: { dot: style.dotOrangeDark, title: '발송 중', desc: '통신사로부터 발송 요청이 진행되고 있는 상태' },
    [DisplayStatus.COMPLETED]: { dot: style.dotGreen, title: '처리완료', desc: (<span>발송 요청이 완료되고 <span className='text-[#00AD3A] text-leading-b3'>통신사로부터 수신 결과를<br /> 기다리거나 최종 결과 확인이 완료</span>된 상태</span>) },
    [DisplayStatus.FAILED]: { dot: style.dotRed, title: <strong className="text-graphic-red font-bold">처리실패</strong>, desc: <span className="text-graphic-red">시스템 오류 등 정상적으로 발송 요청이 이루어 지지 않은 상태</span> },
  };

  // 팝업에 표시할 상태 순서
  const STATUS_ORDER: DisplayStatus[] = [
    DisplayStatus.RESERVED,
    DisplayStatus.PENDING,
    DisplayStatus.SENT,
    DisplayStatus.COMPLETED,
    DisplayStatus.FAILED,
  ];

  // 결과 항목(대기, 성공, 실패)
  const renderValue = (displayStatus: DisplayStatus, value: string | number) => {
    if (displayStatus === DisplayStatus.CANCELED) return '-';
    if (value === '0' || value === 0) return 0;
    if (displayStatus === DisplayStatus.FAILED) {
      return <span className="text-graphic-red underline">{(value).toLocaleString()}</span>;
    } else {
      return <span className="underline">{(value).toLocaleString()}</span>;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER_VARIANTS}
    >
      <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
        <Card variant="lightgray" size="md" className="mb-5 mt-7">
          <ul className="flex flex-col gap-1">
            <li className="text-leading-b3">• 예약 취소는 <span className="text-graphic-red">발송 5분전까지 가능하며, 취소 시 포인트는 즉시 환불됩니다.</span></li>
            <li className="text-leading-b3">• 이미 예약된 건은 내용 수정이나 수신자 변경이 불가하므로, 취소 후 다시 발송해주시기 바랍니다.</li>
            <li className="text-leading-b3">• 전송 실패 건에 대한 포인트는 발송 시점으로부터 73시간 후 일괄 환불됩니다.</li>
            <li className="text-leading-b3">• LMS 웹 링크의 첨부파일은 발송일로부터 7일간 유지되며 이후에는 삭제됩니다.</li>
          </ul>
        </Card>
      </motion.div>
      {/* 문자 2차 : 검색 필터 컴포넌트 추가 퍼블 작업중 */}
      {/* <SendResultSearchFilterCard
      isDetailSearchOpen={isDetailSearchOpen}
      setIsDetailSearchOpen={setIsDetailSearchOpen}
    /> */}
      <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS} className="flex items-center justify-between w-full mb-3">
        <HiButton variant="secondary" disabled={selectedIds.length === 0} onClick={handleDelete} style={{ minWidth: 95 }}>
          {`${selectedIds.length}건 삭제`}
        </HiButton>
        <div className={`gap-[7px] flex ${style.statusContainer}`}>
          {
            //   <HiButton variant="tertiaryBlue" onClick={() => setShowStatusPopup(v => !v)} className="group">
            //   <Icon icon="download" iconSize={20} color="primary" />
            //   발송결과 다운로드
            // </HiButton>
          }
          <HiButton variant="tertiary" disabled={isRefreshDisabled} onClick={handleInvalidate}>
            <RotateCcw size={18} strokeWidth={1.5} className="text-text-default" />
            새로고침
          </HiButton>
        </div>
      </motion.div>
      <motion.div custom={1} variants={FADE_IN_UP_ORDERED_VARIANTS} className={`table-content table-box sticky-wrap ${style.sentResultTable}`}>
        <table className={rows.length <= 0 ? style.tableNodata : ''}>
          <caption>주소록</caption>
          <colgroup>
            <col style={{ width: '4%', minWidth: '56px' }} />
            <col style={{ width: '10%', minWidth: '160px' }} />
            <col style={{ width: 'auto', minWidth: '350px' }} />
            <col style={{ width: '9%', minWidth: '130px' }} />
            <col style={{ width: '8%', minWidth: '130px' }} />
            <col style={{ width: '5%', minWidth: '80px' }} />
            <col style={{ width: '7%', minWidth: '110px' }} />
            <col style={{ width: '7%', minWidth: '110px' }} />
            <col style={{ width: '5%', minWidth: '80px' }} />
            <col style={{ width: '5%', minWidth: '80px' }} />
            <col style={{ width: '5%', minWidth: '80px' }} />
            <col style={{ width: '9%', minWidth: '130px' }} />
          </colgroup>
          <thead>
            <tr>
              <th className="sticky-top" rowSpan={2}>
                <CheckBox
                  checked={isAllSelectedMode}
                  onChange={handleAllCheck}
                  disabled={rows.length === 0}
                  className="align-middle"
                />
              </th>
              <th className="sticky-top cursor-pointer" rowSpan={2} onClick={() => handleSort(SortType.DEFAULT)}>발송일시
                <Icon icon={sort.sort === SortType.DEFAULT
                  ? sort.direction === SortDirection.DESC ? 'arrow-down-sort' : 'arrow-up-sort'
                  : 'arrow-down-sort'} className="-mr-1.5" />
              </th>
              <th className="sticky-top" rowSpan={2}>내용</th>
              <th className="sticky-top" rowSpan={2}>발신번호</th>
              <th className="sticky-top cursor-pointer" rowSpan={2} onClick={() => handleSort(SortType.NAME)}>요청자
                <Icon icon={sort.sort === SortType.NAME
                  ? sort.direction === SortDirection.DESC ? 'arrow-down-sort' : 'arrow-up-sort'
                  : 'arrow-down-sort'} className="-mr-1.5" />
              </th>
              <th className="sticky-top cursor-pointer" rowSpan={2} onClick={() => handleSort(SortType.MSGTYPE)}>유형
                <Icon icon={sort.sort === SortType.MSGTYPE
                  ? sort.direction === SortDirection.DESC ? 'arrow-down-sort' : 'arrow-up-sort'
                  : 'arrow-down-sort'} className="-mr-1.5" />
              </th>
              <th className="sticky-top" rowSpan={2}>총 발송건수</th>
              <th className="sticky-top" rowSpan={2}>포인트</th>
              <th className={`sticky-top ${style.resultHeader}`} colSpan={3}>결과</th>
              <th className="sticky-top !z-7" rowSpan={2}>
                <div className={style.statusContainer} ref={statusPopupRef}>
                  <HiButton variant="link" onClick={() => setShowStatusPopup(v => !v)} className="group font-semibold">
                    진행 상황
                    <Icon icon="help-fill" iconSize={20} color="light-gray" className="group-hover:bg-bg-primary-base" />
                  </HiButton>
                  {showStatusPopup && (
                    <div className={style.statusPopup}>
                      <ul>
                        {STATUS_ORDER.map((st) => {
                          const m = STATUS_META[st];
                          const dotClass = m?.dot ? `${style.baseDot} ${m.dot}` : style.baseDot;
                          return (
                            <li key={st} className={`${style.statusItem}`}>
                              <span className={dotClass} />
                              <span className={style.tit}>{m?.title}</span>
                              {m?.desc ? <span className={style.desc}>{m.desc}</span> : null}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </th>
            </tr>
            <tr>
              <th className="sticky-top">대기</th>
              <th className="sticky-top">성공</th>
              <th className="sticky-top border-r">실패</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={12}>
                  <div className="flex items-center justify-center">
                    <Loading variant="spinner" className="static [transform:none]" />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={12}>
                  <NoData message="발송내역이 없습니다." size="md" />
                </td>
              </tr>
            ) : (
              rows.map(row => {
                const isNew = newIds.includes(row.messageId);
                return (
                  <tr key={row.messageId}>
                    <td style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}>
                      <CheckBox
                        checked={selectedIds.includes(row.messageId)}
                        onChange={() => handleCheck(row.messageId)}
                        disabled={isDisableCheckBox(row.displayStatus)}
                        className="align-middle"
                      />
                    </td>
                    <td style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}>{renderTimestamp(row.reservedTimestamp)}</td>
                    <td className="!text-left cursor-pointer " style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }} onClick={() => {
                      setSelectDetailTabIndex(0);
                      setSelectDetailMainTabIndex(0);
                      setDetailRow(row);
                      setDetailOpen(true);
                    }}>
                      <div className='flex items-center gap-1.5'>                        
                        {(
                          (row.isWeblink === true)
                            ? <Link size={14} strokeWidth={1.6} className='text-text-default'/>
                            : null
                        )}
                        {(
                          row.displayStatus === DisplayStatus.RESERVED
                        ) ? (
                          <span className="text-text-primary-base">[예약]</span>
                        ) : null}
                        <span className={style.titleTruncate}>
                          <span className={style.titleInner}>{renderRowTitle(row)}</span>
                        </span>
                      </div>
                    </td>
                    <td style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}>{renderSenderNumber(row.senderNumber)}</td>
                    <td style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}><div className='overflow-hidden break-all leading-[20px] h-[18px]'>{row.requesterName}</div></td>
                    <td style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}>
                      <Badge size='sm' style={{ background: row.msgType === MsgType.LMS ? '#EE1271' : '#4267B2' }}>{row.msgType}</Badge>
                    </td>
                    <td className='!text-right' style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}>{renderCountValue(row.targetCount)}</td>
                    <td className='!text-right' style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}>
                      {(row.displayStatus === DisplayStatus.CANCELED || row.displayStatus === DisplayStatus.FAILED) ? (
                        <span className='text-graphic-red'>{renderPoint(0)}</span>
                      ) : (
                        (row.isRefund === true && row.pointRefund)
                          ? renderPoint(row.point - row.pointRefund)
                          : renderPoint(row.point)
                      )}
                    </td>
                    <td className="cursor-pointer" style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}
                      onClick={() => handleClickStatusCount(row, 2)}
                    >{renderValue(row.displayStatus, row.targetCount - row.successCount - row.failCount)}</td>
                    <td className="cursor-pointer" style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}
                      onClick={() => handleClickStatusCount(row, 0)}
                    >{renderValue(row.displayStatus, row.successCount)}</td>
                    <td className="cursor-pointer" style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}
                      onClick={() => handleClickStatusCount(row, 1)}
                    >{renderValue(row.displayStatus, row.failCount)}</td>
                    <td className='!text-left' style={{ backgroundColor: isNew ? 'var(--light-orange)' : 'transparent' }}>
                      <SendResultStatusBadge
                        value={row.displayStatus}
                        reservedTimestamp={row.reservedTimestamp}
                        forceLabel={false}
                        onCancel={() => handleCancleReservation(row.messageId)}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        {hasNextPage && (
          <InView
            threshold={0}
            onChange={(inView) => {
              if (inView && !isFetchingNextPage) fetchNextPage().then();
            }}
          />
        )}
      </motion.div>

      <SendReceiverContextProvider>
        <SendResultDetail
          open={detailOpen}
          row={detailRow}
          selectTabIndex={selectDetailTabIndex}
          selectMainTabIndex={selectDetailMainTabIndex}
          onClose={() => setDetailOpen(false)} />
      </SendReceiverContextProvider>
    </motion.div>
  );
};

const getResultTypeByIndex = (index: number): ResultType => {
  switch (index) {
    case 1: return ResultType.FAIL;
    case 2: return ResultType.PENDING;
    default: return ResultType.SUCCESS;
  }
};

// 상세 결과 컴포넌트 (SideModal 포함)
const SendResultDetail = ({ open, row, selectMainTabIndex, selectTabIndex, onClose }: { open: boolean, row: any, selectMainTabIndex: number, selectTabIndex: number, onClose: () => void }) => {
  // 상세 모달 내 탭
  // - 0: 전송정보(요약/미리보기)
  // - 1: 전송결과(성공/실패/대기 탭)
  const [selectedMainTabIndex, setSelectedMainTabIndex] = useState(selectMainTabIndex);
  const [selectedTabIndex, setSelectedTabIndex] = useState(selectTabIndex);
  const [currentResultType, setCurrentResultType] = useState<ResultType>(getResultTypeByIndex(selectTabIndex));
  const [weblinkCode, setWeblinkCode] = useState<WeblinkCode>({ code: '', targetCode: null });
  const { focusedRow, handleFocusRow } = useSendReceiverContext();
  const [isOpenWeblinkPopup, setIsOpenWeblinkPopup] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      // 모달을 열 때는 전송정보 탭을 기본으로 보여준다.
      setWeblinkCode(prev => ({ ...prev, targetCode: null }));
      handleFocusRow(null);
      setSelectedMainTabIndex(selectMainTabIndex);
      setSelectedTabIndex(selectTabIndex);
      setCurrentResultType(getResultTypeByIndex(selectTabIndex));
    }
  }, [open, selectTabIndex]);

  const { currentSchool } = useTextContext();
  const { handleError } = useApiErrorHandler();
  const queryClient = useQueryClient();
  const { data } = useTextSendResultMessage(currentSchool.schoolId, row?.messageId, !!open && !!row?.messageId);

  const { invalidateResult, invalidateResultType } = useTextSendResultDetailInvalidate();
  const { data: weblinkDetailData, error: weblinkDetailError, isError: weblinkDetailIsError } = useWeblinkDetail(
    data?.weblinkCode,
    null,
    data?.isWeblink === true && data?.weblinkCode != null
  );

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage } = useTextSendResultMessageResultType(currentSchool.schoolId, row?.messageId, currentResultType, !!open && !!row?.messageId);

  const rows = useMemo(() => {
    if (!pages) return [];
    const allLists = pages.flatMap((page) => page.lists);
    const uniqueMap = new Map();
    allLists.forEach(item => {
      if (!uniqueMap.has(item.targetId)) {
        uniqueMap.set(item.targetId, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [pages])

  useMemo(() => {
    if (!data) return;
    handleFocusRow(null);
    if (data.isWeblink === true && data.weblinkCode != null) {
      setWeblinkCode({ code: data.weblinkCode, targetCode: null })
    } else {
      return;
    }
  }, [data])

  const detail = data;

  const visibleInvalidateButton = detail && ( 
    ![DisplayStatus.CANCELED, DisplayStatus.FAILED].includes(detail.displayStatus) &&
    (detail.successCount + detail.failCount) != detail.targetCount
  );

  const handleSelectTab = async (index: number) => {
    setSelectedTabIndex(index);
    const resultType = getResultTypeByIndex(index);
    setCurrentResultType(resultType);
    const queryKey = sendResultKeys.detailResultType(currentSchool.schoolId, row?.messageId, resultType);
    queryClient.removeQueries({ queryKey });
  };

  const handleOpenWeblinkPopup = () => {
    if(weblinkDetailIsError && weblinkDetailError instanceof ApiError) {
      handleError(weblinkDetailError, async (errorCode: string) => {
        switch(errorCode) {
          case 'expiredWeblink':
            await ShowConfirm('만료된 페이지입니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            break;
          default:
            await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            break;
        }
      });
    } else {
      setIsOpenWeblinkPopup(true);
    }
  };

  const handleSelectReceipient = async (row: SendResultType) => {
    if (row.errorCode === '10000') {
      setWeblinkCode(prev => ({ ...prev, targetCode: row.targetCode }));
      handleFocusRow({
        phoneNumber: row.receiptNumber,
        contactName: renderReceipientInfo(row),
        depth1: row.depth1,
        depth2: row.depth2,
        field1: row.field1,
        field2: row.field2,
        field3: row.field3,
        field4: row.field4,
        field5: row.field5,
        field6: row.field6,
        field7: row.field7,
        field8: row.field8,
      });
    } else {
      setWeblinkCode(prev => ({ ...prev, targetCode: null }));
      handleFocusRow(null);
    }
  };

  const renderPreviewMessage = () => {
    const previewContent = focusedRow 
      ? replaceMessage(detail.content, focusedRow) 
      : applyHighlightMessage(detail.content)
    return previewContent;
  };

  const renderMsgType = (value: MsgType) => {
    return value === MsgType.LMS ? 'LMS (장문)' : 'SMS (단문)';
  };

  const renderPendingErrorMessage = (message?: string) => {
    if (detail.displayStatus === DisplayStatus.CANCELED) {
      return '예약 취소'
    } else {
      return message
    }
  };

  const renderPeriod = () => {
    return `보관기간 : ${renderPeriodTimestamp(weblinkDetailData.createTimestamp)} ~ ${renderPeriodTimestamp(weblinkDetailData.expireTimestamp)}`
  };

  const RESULT_TAB_DESCRIPTIONS: Record<ResultType, string> = {
    [ResultType.SUCCESS]: '수신자 목록을 선택하면 발송된 메시지를 확인하실 수 있습니다.',
    [ResultType.FAIL]: '수신 번호 오류 또는 통신사 사정으로 전송되지 않은 내역입니다.',
    [ResultType.PENDING]: '발송 준비중으로 순차적으로 전송됩니다.',
  };

  const handleInvalidate = async () => {
    if (detail) {
      invalidateResult(currentSchool.schoolId, detail.messageId);
      invalidateResultType(currentSchool.schoolId, detail.messageId, currentResultType);
      showToast('업데이트 되었습니다.');
    }
  };


  return (
    <>
      <SideModal
        isOpen={open}
        onClose={onClose}
        heading={
          <div className="flex items-center gap-6">
            <span>상세 결과 조회</span>
            {
              visibleInvalidateButton 
                ? (
                  <HiButton variant="tertiary" size="sm" onClick={handleInvalidate}>
                    <RotateCcw size={18} strokeWidth={1.5} />
                    새로고침
                  </HiButton>
                )
                : null
            }
          </div>
        }
        className={style.sendResultDetailModal}
        width="1350"
      >
        {row && detail && (
          <div className='overflow-auto'>
            <div className="flex gap-6 items-start">
              <div className="w-[calc(100%-334px)]">
                <HiTab
                  size="xl"
                  contentAnimation="fade"
                  contentAnimationDuration={0.2}
                  labels={['전송정보', '전송결과']}
                  variant="underline"
                  selectedTabIndex={selectedMainTabIndex}
                  onChange={setSelectedMainTabIndex}
                  // renderEtc={
                  //   <HiButton variant="tertiaryBlue" className="mr-2">
                  //     <ChevronLeft size={20} color="var(--primary)" strokeWidth={1.4} />
                  //     다시보내기
                  //   </HiButton>
                  // }
                  className="flex-1 "
                >
                  <div className="w-full">
                    {/* <TitleArea level={3} title="전송정보" className="justify-between mb-3">
                    <TitleArea.Etc>
                      {SEND_VERSION_2 ? (
                        <HiButton variant="tertiaryBlue" icon="email" className='mr-2' >
                          다시보내기
                        </HiButton>
                      ) : null }
                      { visibleInvalidateButton ? (
                        <HiButton variant="tertiary" icon="reload" onClick={handleInvalidate}>
                          새로고침
                        </HiButton>
                      ) : null }
                    </TitleArea.Etc>
                  </TitleArea> */}
                    <HiTable variant="tertiary" size="xl">
                      <TableCaption>전송정보</TableCaption>
                      <colgroup>
                        <col style={{ width: '120px' }} />
                        <col style={{ width: 'auto' }} />
                      </colgroup>
                      <HiTableBody>
                        {detail.msgType === MsgType.LMS ? (
                          <HiTableRow className="hover:bg-transparent">
                            <HiTableTh noBackground scope="row" >제목</HiTableTh>
                            <HiTableTd >{detail.title}</HiTableTd>
                          </HiTableRow>
                        ) : null}
                        <HiTableRow className="hover:bg-transparent">
                          <HiTableTh noBackground scope="row">유형</HiTableTh>
                          <HiTableTd>{renderMsgType(detail.msgType)}</HiTableTd>
                        </HiTableRow>
                        <HiTableRow className="hover:bg-transparent">
                          <HiTableTh noBackground scope="row">발신번호</HiTableTh>
                          <HiTableTd>{renderSenderNumber(detail.senderNumber)} ({detail.senderNumberName})</HiTableTd>
                        </HiTableRow>
                        <HiTableRow className="hover:bg-transparent">
                          <HiTableTh noBackground scope="row">발송일시</HiTableTh>
                          <HiTableTd>{renderTimestamp(detail.reservedTimestamp)} ({detail.requesterName})</HiTableTd>
                        </HiTableRow>
                        {
                          detail.displayStatus === DisplayStatus.CANCELED ? (
                            <HiTableRow className="hover:bg-transparent">
                              <HiTableTh noBackground scope="row">발송 취소 일시</HiTableTh>
                              <HiTableTd>{renderTimestamp(detail.canceledTimestamp)} ({detail.canceledName})</HiTableTd>
                            </HiTableRow>
                          ) : null
                        }
                        <HiTableRow className="hover:bg-transparent">
                          <HiTableTh noBackground scope="row">진행 상황</HiTableTh>
                          <HiTableTd>
                            <SendResultStatusBadge
                              value={detail.displayStatus}
                              reservedTimestamp={detail.reservedTimestamp}
                              forceLabel={true}
                            />
                          </HiTableTd>
                        </HiTableRow>
                        <HiTableRow className="hover:bg-transparent">
                          <HiTableTh noBackground scope="row">발송 요청 건수</HiTableTh>
                          <HiTableTd>{renderCountValue(detail.targetCount)}</HiTableTd>
                        </HiTableRow>
                        <HiTableRow className="hover:bg-transparent">
                          <HiTableTh noBackground scope="row">성공 건수</HiTableTh>
                          <HiTableTd>{renderCountValue(detail.successCount)}</HiTableTd>
                        </HiTableRow>
                        <HiTableRow className="hover:bg-transparent">
                          <HiTableTh noBackground scope="row">실패 건수</HiTableTh>
                          <HiTableTd>
                            <div className="flex items-center gap-1">
                              <span className={detail.displayStatus === DisplayStatus.FAILED ? 'text-graphic-red' : ''} >{renderCountValue(detail.failCount)}</span>
                            </div>
                          </HiTableTd>
                        </HiTableRow>
                      </HiTableBody>
                    </HiTable>
                  </div>
                  <div>
                    {/* <TitleArea level={3} title="전송결과" className="border-b-1 border-gray-10 pb-3" /> */}
                    <HiTab
                      labels={['성공', '실패', '전송 대기/진행 중']}
                      variant="pills"
                      selectedTabIndex={selectedTabIndex}
                      onChange={handleSelectTab}
                      renderEtc={SEND_VERSION_2 ? (
                        <HiButton variant='tertiary' icon="download" className='w-50'>전송 결과 다운로드</HiButton>
                      ) : null}
                    >
                      {
                        Object.values(ResultType).map((type) => (
                          <div key={`send-result-tab-${type}`}
                            className={`table-content table-box sticky-wrap overflow-x-auto w-full`} style={{ height: `calc(var(--vh) * 100 - 315px)`}}>
                              <table className={rows.length <= 0 ? 'h-full' : ''}>
                                <caption>주소록</caption>
                                <colgroup>
                                  <col style={{ width: '64px' }} />
                                  <col style={{ width: '200px' }} />
                                  <col style={{ width: '240px' }} />
                                  <col style={{ width: '178px' }} />
                                  <col style={{ width: '220px' }} />
                                </colgroup>
                                <thead>
                                  <tr>
                                    <th className='sticky-top'></th>
                                    <th className='sticky-top'>휴대폰번호</th>
                                    <th className='sticky-top'>수신자 정보</th>
                                    <th className='sticky-top'>전송시간</th>
                                    <th className='sticky-top'>결과</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="none-hover">
                                        <NoData message="내역이 없습니다." size="md" />
                                      </td>
                                    </tr>
                                  ) : (
                                    rows.map((row, index) => (
                                      // 문자 2차 :  active 상태일때 'active' className 추가
                                      <tr key={(row.targetId)} onClick={() => handleSelectReceipient(row)}>
                                        <td>{(index + 1)}</td>
                                        <td>{row.receiptNumber}</td>
                                        <td className='!text-left'>{renderReceipientInfo(row)}</td>
                                        <td>{renderTimestamp(row.sentTimestamp)}</td>
                                        <td>{selectedTabIndex < 2 ? row.errorMessage : renderPendingErrorMessage(row.errorMessage)}</td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                              {hasNextPage && (
                                <InView
                                  threshold={0}
                                  onChange={(inView) => {
                                    if (inView && !isFetchingNextPage) fetchNextPage().then();
                                  }}
                                />
                              )}
                          </div>
                        ))
                      }
                    </HiTab>
                  </div>
                </HiTab>
              </div>

              <ContentPreview
                isWeblink={detail.isWeblink}
                messageContent={renderPreviewMessage()}
                messageTitle={detail.title}
                senderNumberName={detail.senderNumberName}
                msgType={detail.msgType}
                senderNumber={renderSenderNumber(detail.senderNumber)}
                senderNumbers={[renderSenderNumber(detail.senderNumber)]}
                className="mt-15"
                isSetInnerHTML={focusedRow === null}
                generatedWebLink={weblinkCode}
                onOpenWeblinkPreview={handleOpenWeblinkPopup}
              />
            </div>
          </div>
        )}
      </SideModal>
      {/* 웹링크 미리보기 팝업 */}
      {row && detail && weblinkDetailData && (
        <WeblinkViewPopup
          senderName={weblinkDetailData.schoolName}
          period={renderPeriod()}
          isOpen={isOpenWeblinkPopup}
          onClose={() => setIsOpenWeblinkPopup(false)}
          messageTitle={detail.title}
          messageContent={renderPreviewMessage()}
          msgType={detail.msgType}
          isSetInnerHTML={ focusedRow === null }
          files={weblinkDetailData.files}
        />
      )}
    </>
  );
};

export default SendResultBody;