import Styles from './datetimePicker.module.css'
import { Icon } from './icon'
import { MorePopup } from './hitalk/morePopup'
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { RoundedButton } from './buttons'
import { SelectBox } from './selectBox'
import { showToast } from '@/unimplementeds/toast.js'

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

export const Calendar = forwardRef(({timestamp, value=[], onChange, onClose, withTime, maximum=1, onBeforeSelect, allowPast=true}, ref) => {
  const multiple = maximum > 1
  const [selectedDates, setSelectedDates] = useState(multiple ? value.map(t => new Date(t)) : [new Date(timestamp)])
  const [selectedHour, setSelectedHour] = useState(new Date(timestamp).getHours())
  const [selectedMinute, setSelectedMinute] = useState(new Date(timestamp).getMinutes())
  const [shownDate, setShownDate] = useState(timestamp ? new Date(timestamp) : new Date())

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
    }
  }

  return (
    <div className={Styles['calendar']} onClick={(e) => e.stopPropagation()}>
      <div className={Styles['calendar-header']}>
        <Icon icon="calendar-prev" onClick={() => setShownDate(prevMonthOf(shownDate))}/>
        <span>{shownDate.getFullYear()}년 {shownDate.getMonth() + 1}월</span>
        <Icon icon="calendar-next" onClick={() => setShownDate(nextMonthOf(shownDate))}/>
        <button onClick={() => {setShownDate(new Date()); if (!multiple) setSelectedDates([new Date()])}}>오늘</button>
      </div>
      <div className={Styles['calendar-grid']}>
        {['S', 'M', 'Y', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className={Styles['calendar-weekday']}>{d}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) {
            return <div key={i} className={Styles['calendar-cell']} />
          }
          const date = new Date(shownDate.getFullYear(), shownDate.getMonth(), day)
          const isToday = date.toDateString() === new Date().toDateString()
          const classNames = [
            Styles['calendar-cell'],
            ...(isToday ? [Styles['today']] : []),
            ...([0, 6].includes(i % 7) ? [Styles['weekend']] : []),
            ...(isSelected(date) ? [Styles['selected']] : [])
          ]
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
          onChange={val => setSelectedHour(val)} value={selectedHour} />
        <SelectBox
          className={Styles['select-box']}
          options={[...new Array(60)].map((_, i) => ({ value: i, label: `${i}분` }))}
          beforeChange={async (val) => {
            console.log('beforeChange minute', val, selectedDates)
            if (selectedDates.length === 0) return true
            if (onBeforeSelect && !(await onBeforeSelect(toSelectedTimestamp(selectedDates[0], undefined, val)))) return false
            return true;
          }}
          onChange={val => setSelectedMinute(val)} value={selectedMinute} />
      </div>}
      <div className={Styles['calendar-footer']}>
        <RoundedButton filled={false} className={Styles['cancel-btn']} onClick={() => onClose()}>
          취소
        </RoundedButton>
        <RoundedButton className={Styles['confirm-btn']} onClick={submit}>
          완료
        </RoundedButton>
      </div>
    </div>
  )
})

export const CalendarPopup = ({ timestamp, value, children, onChange, withTime=true, maximum=1, disabled=false, allowPast=true, onBeforeSelect, popup, calendar, position }) => {
  const multiple = maximum > 1
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedTimestamp, setSelectedTimestamp] = useState(timestamp || new Date().getTime())

  return (
    <MorePopup
      className={Styles['datetime-picker-popup']}
      state={[showCalendar, setShowCalendar]}
      entry={ children }
      underbounds='100vh'
      whenOverflow={rect => ({...rect, left: rect.left + 100 })}
      disabled={disabled}
      ref={popup}
      position={position}
    >
      <Calendar timestamp={selectedTimestamp} onChange={v => {
          setShowCalendar(false)
          !multiple && setSelectedTimestamp(v)
          onChange && onChange(v)
        }} onClose={() => setShowCalendar(false)}
        withTime={withTime}
        maximum={maximum}
        value={value}
        allowPast={allowPast}
        ref={calendar}
        onBeforeSelect={onBeforeSelect}
      />
    </MorePopup>
  )
}

export const DatetimePicker = ({ timestamp, onChange, style, formatter, withTime=true, showYear=true, disabled=false, onBeforeSelect, allowPast=true, popup, calendar, position }) => {
  const [selectedTimestamp, setSelectedTimestamp] = useState(timestamp || new Date().getTime())
  const [formattedDate, setFormattedDate] = useState('')

  useEffect(() => {
    setFormattedDate((formatter || formatDateTime)(selectedTimestamp, withTime))
  }, [selectedTimestamp])

  useEffect(() => {
    setSelectedTimestamp(timestamp)
  }, [timestamp])

  return (
    <CalendarPopup
      timestamp={selectedTimestamp}
      onChange={v => {
        setSelectedTimestamp(v)
        onChange && onChange(v)
      }}
      disabled={disabled}
      withTime={withTime}
      allowPast={allowPast}
      popup={popup}
      calendar={calendar}
      showYear={showYear}
      position={position}
      onBeforeSelect={onBeforeSelect}
    >
      <div className={`${Styles['datetime-picker']} datetime-picker ${disabled ? Styles['disabled'] : ''}`} style={style}>
        <Icon icon="calendar"/>
        <span>{ formattedDate }</span>
      </div>
    </CalendarPopup>
  )
}