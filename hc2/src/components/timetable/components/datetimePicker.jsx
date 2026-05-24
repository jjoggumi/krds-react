import Styles from './datetimePicker.module.scss'
import { Icon } from '../../uiux/icon'
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { RoundedButton } from '../../uiux/buttons'
import { SelectBox } from '../../uiux/selectBox'
import { showToast } from '@/unimplementeds/toast.js'
import { HiInput } from '@/components/uiux/hiInput';
import { set } from 'lodash'
import { TimeUtils } from '../common/utils'

const weedDay = (day) => ['일', '월', '화', '수', '목', '금', '토'][day] || ''

export const formatDateFromYmd = (ymd, {withWeekday = true, showYear = true, spaceBeforeWeekday = false}) => {
  if (!ymd) return ''
  return formatDate(new Date([[0, 4], [4, 6], [6, 8]]
      .map(([s, e]) => ymd.slice(s, e)).join('-')), withWeekday, showYear, spaceBeforeWeekday)
}

export const formatDate = (timestamp, withWeekday = true, showYear = true, spaceBeforeWeekday = false) => {
  const date = new Date(timestamp)
  return `${showYear ? date.getFullYear() + '년 ' : ''}${date.getMonth() + 1}월 ${date.getDate()}일` + (withWeekday ? `${spaceBeforeWeekday?' ':''}(${weedDay(date.getDay())})` : '')
}

const formatDateTime = (timestamp, withTime = true) => {
  const date = new Date(timestamp)
  return `${formatDate(timestamp)} ${withTime ? `${date.getHours()}시 ${date.getMinutes()}분` : ''}`
}

const firstDayOfMonth = (timestamp) => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const lastDayOfMonth = (timestamp) => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

const setDateBy = (dist, src) => {
  dist.setDate(Math.min(src.getDate(), lastDayOfMonth(dist).getDate()))
  return dist
}

const prevMonthOf = date => setDateBy(new Date(date.getFullYear(), date.getMonth() - 1, 1), date)
const nextMonthOf = date => setDateBy(new Date(date.getFullYear(), date.getMonth() + 1, 1), date)

export const Calendar = forwardRef(({timestamp, value=[], onChange, onClose, withTime, maximum=1, onBeforeSelect, allowPast=true, className, schedules = [], autoApply=false, disablePrevNav=false, disableNextNav=false, disableTodayButton=false, showPrevNav=false, operationStartDate = null, operationEndDate = null, isPlaned = false}, ref) => {
  const multiple = maximum > 1
  const [selectedDates, setSelectedDates] = useState(multiple ? value.map(t => new Date(t)) : [new Date(timestamp)])
  const [selectedHour, setSelectedHour] = useState(new Date(timestamp).getHours())
  const [selectedMinute, setSelectedMinute] = useState(new Date(timestamp).getMinutes())
  const [shownDate, setShownDate] = useState(timestamp ? new Date(timestamp) : (isPlaned ? TimeUtils.getNumberAsDate(operationStartDate) : new Date()))

  const [firstDay, setFirstDay] = useState(firstDayOfMonth(shownDate))
  const [lastDay, setLastDay] = useState(lastDayOfMonth(shownDate))

  useEffect(() => {
    setFirstDay(firstDayOfMonth(shownDate))
    setLastDay(lastDayOfMonth(shownDate))
  }, [shownDate])

  const days = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array(lastDay.getDate()).fill(0).map((_, i) => i + 1)
  ]

  useImperativeHandle(ref, () => ({
    setSelectedTimestamps: (timestamps) => {
      setSelectedDates(timestamps.map(t => new Date(t)))
      setSelectedHour(new Date(timestamps[0]).getHours())
      setSelectedMinute(new Date(timestamps[0]).getMinutes())
    }
  }))

  const toSelectedTimestamp = (timestamp, hour, min) => {
    const date = new Date(timestamp)
    date.setHours(hour === undefined ? selectedHour : hour)
    date.setMinutes(min === undefined ? selectedMinute : min)
    return date.getTime()
  }

  const submit = () => {
    const result = selectedDates.map(d => {
      const newDate = new Date(d)
      newDate.setHours(selectedHour)
      newDate.setMinutes(selectedMinute)
      return newDate.getTime()
    })
    result.sort((a, b) => a - b)
    onChange(multiple ? result : result[0])
  }

  const isSelected = (date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString())
  }

  const toggleSelectedDate = async (date) => {
    if (onBeforeSelect && !(await onBeforeSelect(toSelectedTimestamp(date)))) return
    if (!allowPast) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const cmpDate = new Date(date)
      cmpDate.setHours(0, 0, 0, 0)
      if (cmpDate < today) {
        return showToast('과거 날짜는 선택할 수 없습니다.', 3000)
      }
    }
    if (multiple && !isSelected(date) && selectedDates.length >= maximum) {
      return showToast(`최대 ${maximum}개까지 선택할 수 있습니다.`, 3000)
    }
    if (multiple) {
      const dateStr = date.toDateString()
      if (isSelected(date)) {
        setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateStr))
      } else {
        setSelectedDates([...selectedDates, date])
      }
    } else {
      setSelectedDates([date])
      // 즉시 적용 옵션: 단일 선택일 때 날짜 클릭 즉시 반영 및 닫기
      if (autoApply) {
        const appliedTs = toSelectedTimestamp(date)
        onChange && onChange(appliedTs)
        onClose && onClose()
      }
    }
  }

  // 일정 있는 날짜 판별 함수 
  const normalizedSchedules = (Array.isArray(schedules) ? schedules : []).map(sch => {
    const d = new Date(sch);
    return new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()).getTime();
  });

  const hasSchedule = (date) => {
    if (!normalizedSchedules.length) return false;

    return normalizedSchedules.some(sch => {
      const schDate = new Date(sch);
      return (
        schDate.getFullYear() === date.getFullYear() &&
        schDate.getMonth() === date.getMonth() &&
        schDate.getDate() === date.getDate()
      );
    });
  };

  // 오늘 기준 이전 달인지 계산
  const isPrevMonthPast = (() => {
    const prev = prevMonthOf(shownDate);
    const today = new Date();
    return (
      prev.getFullYear() < today.getFullYear() ||
      (prev.getFullYear() === today.getFullYear() &&
        prev.getMonth() < today.getMonth())
    );
  })();

  const isPrevDisabled = 
    disablePrevNav || // 이전 달 네비게이션 비활성화 옵션 ||
    (!showPrevNav && (isPrevMonthPast)) || // 오늘 기준 이전 달 이동 비허용 && 이전 달 이동 허용 여부 조건 확인
    (!!operationStartDate && firstDayOfMonth(shownDate) <= TimeUtils.getNumberAsDate(operationStartDate)) // 운영 시작일 이후로만 이동 가능
    ;
  
  const isNextDisabled = 
    disableNextNav || // 다음 달 네비게이션 비활성화 옵션 ||
   (!!operationEndDate && lastDayOfMonth(shownDate) >= TimeUtils.getNumberAsDate(operationEndDate)) // 운영 종료일 이전으로만 이동 가능
   ;

  return (
    <div className={`${Styles['calendar']} ${className || ''}`} onClick={(e) => e.stopPropagation()}>
      <div className={`${Styles['calendar-header']} calendar-header`}>
        <Icon
          icon="calendar-prev"
          onClick={!isPrevDisabled ? () => setShownDate(prevMonthOf(shownDate)) : undefined}
          className={isPrevDisabled ? Styles['disabled'] : ''}
        />
        <span>{shownDate.getFullYear()}년 {shownDate.getMonth() + 1}월</span>
        <Icon
          icon="calendar-next"
          onClick={!isNextDisabled ? () => setShownDate(nextMonthOf(shownDate)) : undefined}
          className={isNextDisabled ? `${Styles['disabled']}` : ''}
        />
        {!isPlaned && <button
          onClick={() => {
            if (disableTodayButton) return;
            setShownDate(new Date());
            if (!multiple) setSelectedDates([new Date()])
          }}
          className={disableTodayButton ? `${Styles['disabled']}` : ''}
        >오늘</button>}
      </div>
      <div className={`${Styles['calendar-grid']} calendar-grid`}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={i} className={`${Styles['calendar-weekday']} calendar-weekday`}>{d}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) {
            return <div key={i} className={`${Styles['calendar-cell']} calendar-cell`} />
          }
          const date = new Date(shownDate.getFullYear(), shownDate.getMonth(), day)
          const isToday = date.toDateString() === new Date().toDateString()
          const dayOfWeek = i % 7;
          const classNames = [
            Styles['calendar-cell'],
            'calendar-cell',
            ...(isToday ? [Styles['today'], 'today'] : []),
            ...(dayOfWeek === 0 ? [Styles['sunday'], 'sunday'] : []),
            ...(dayOfWeek === 6 ? [Styles['saturday'], 'saturday'] : []),
            ...(isSelected(date) ? [Styles['selected'], 'selected'] : []),
            ...(hasSchedule(date) ? [Styles['has-schedule'], 'has-schedule'] : [])
          ];
          return (
            <div key={i} className={ classNames.join(' ')} onClick={() => toggleSelectedDate(date)}>
              <span>{day}</span>
            </div>
          )
        })}
      </div>
      {withTime && <div className={Styles['time-picker']}>
        <div className={Styles['selected-date']}>
            {selectedDates.length > 0 && formatDate(selectedDates[0].getTime(), false)}
        </div>
        <SelectBox
          className={Styles['select-box']}
          options={[...new Array(24)].map((_, i) => ({ value: i, label: `${i}시` }))}
          beforeChange={async (val) => {
            if (selectedDates.length === 0) return true
            if (onBeforeSelect && !(await onBeforeSelect(toSelectedTimestamp(selectedDates[0], val)))) return false
            return true;
          }}
          onChange={val => {
            setSelectedHour(val)
            // 시간 변경 즉시 반영 (닫지는 않음)
            if (autoApply && !multiple && selectedDates.length > 0) {
              const appliedTs = toSelectedTimestamp(selectedDates[0], val, undefined)
              onChange && onChange(appliedTs)
            }
          }} value={selectedHour} />
        <SelectBox
          className={Styles['select-box']}
          options={[...new Array(60)].map((_, i) => ({ value: i, label: `${i}분` }))}
          beforeChange={async (val) => {
            console.log('beforeChange minute', val, selectedDates)
            if (selectedDates.length === 0) return true
            if (onBeforeSelect && !(await onBeforeSelect(toSelectedTimestamp(selectedDates[0], undefined, val)))) return false
            return true;
          }}
          onChange={val => {
            setSelectedMinute(val)
            // 분 변경 즉시 반영 (닫지는 않음)
            if (autoApply && !multiple && selectedDates.length > 0) {
              const appliedTs = toSelectedTimestamp(selectedDates[0], undefined, val)
              onChange && onChange(appliedTs)
            }
          }} value={selectedMinute} />
      </div>}
      {!autoApply && (
        <div className={`${Styles['calendar-footer']} calendar-footer`}>
          <RoundedButton filled={false} className={Styles['cancel-btn']} onClick={() => onClose()}>
            취소
          </RoundedButton>
          <RoundedButton className={Styles['confirm-btn']} onClick={submit}>
            완료
          </RoundedButton>
        </div>
      )}
    </div>
  )
})

// DatetimePicker component below
export const DatetimePicker = ({ 
  timestamp, 
  onChange, 
  style = undefined, 
  formatter, 
  withTime=true, 
  disabled=false, 
  onBeforeSelect, 
  allowPast=true, 
  calendar, 
  position = 'bottom', 
  emptyLabel = '전체', 
  autoApply=false, 
  disablePrevNav=false, 
  disableNextNav=false, 
  disableTodayButton=false, 
  isError = false, 
  errorLabel= '', 
  isShowPrevMonth=false, 
  defaultToToday=false,
  operationStartDate = null,
  operationEndDate = null,
  isPlaned = false
}) => {
  const [selectedTimestamp, setSelectedTimestamp] = useState(timestamp || new Date().getTime());
  const [formattedDate, setFormattedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  // useEffect(() => {
  //   setFormattedDate((formatter || formatDateTime)(selectedTimestamp, withTime));
  // }, [selectedTimestamp]);

  useEffect(() => {
    if (timestamp == null) {
      setFormattedDate('');
    } else {
      setFormattedDate((formatter || formatDateTime)(selectedTimestamp, withTime));
    }
  }, [selectedTimestamp, timestamp, formatter, withTime]);

  useEffect(() => {
    // setSelectedTimestamp(timestamp);
    if (defaultToToday) {
      setSelectedTimestamp(new Date().getTime());
      return;
    }
    setSelectedTimestamp(timestamp);
  }, [timestamp, defaultToToday, isPlaned, operationStartDate]);

  // 외부 클릭 시 달력 닫기
  useEffect(() => {
    if (!showCalendar) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCalendar]);

  // 캘린더 열기
  const openCalendar = () => {
    if (disabled) return;
    if (defaultToToday && !timestamp) onChange(new Date().getTime());
    setShowCalendar(true);
  };

  const closeCalendar = () => setShowCalendar(false);

  // position prop에 따라 opt-top, opt-left, opt-bottom, opt-right 클래스명 추가
  const positionClass =
    position === 'top' ? 'opt-top'
    : position === 'left' ? 'opt-left'
    : position === 'right' ? 'opt-right'
    : 'opt-bottom';

  return (
    <div ref={pickerRef} className={positionClass} style={{ position: 'relative', display: 'inline-block' }}>
      <div className={`${Styles['datetime-picker-wrap']}`} onClick={openCalendar} style={style}>
        <HiInput
          type='text'
          ref={inputRef}
          wrapClass={`${Styles['datetime-picker']} datetime-picker}`}
          state={(isError || errorLabel) ? 'error' : undefined}          
          value={formattedDate}
          readOnly
          placeholder={emptyLabel}
          disabled={disabled} 
          spellCheck={false}
          showClearButton={false}
        />
        {errorLabel && <div className='text-action-red-base mt-1 text-leading-d1 absolute'>{errorLabel}</div>}
        <i
          className="ico ico-calendar ico-black ico-bg-transparent ico-size-20"
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={(e) => {
            if (disabled) return;
            e.stopPropagation();
            if (inputRef.current && typeof inputRef.current.focus === 'function') inputRef.current.focus();
            openCalendar();
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (inputRef.current && typeof inputRef.current.focus === 'function') inputRef.current.focus();
              openCalendar();
            }
          }}
          style={{ opacity: disabled ? 0.3 : 1, cursor: disabled ? 'default' : 'pointer' }}
        ></i>
      </div>
      {showCalendar && (
        <Calendar
          timestamp={selectedTimestamp}
          onChange={v => {
            setShowCalendar(false);
            setSelectedTimestamp(v);
            onChange && onChange(v);
          }}
          onClose={closeCalendar}
          withTime={withTime}
          maximum={1}
          value={[selectedTimestamp]}
          allowPast={allowPast}
          ref={calendar}
          onBeforeSelect={onBeforeSelect}
          autoApply={autoApply}
          disablePrevNav={disablePrevNav}
          disableNextNav={disableNextNav}
          disableTodayButton={disableTodayButton}
          showPrevNav={isShowPrevMonth}
          operationStartDate={operationStartDate}
          operationEndDate={operationEndDate}
          isPlaned={isPlaned}
        />
      )}
    </div>
  );
}