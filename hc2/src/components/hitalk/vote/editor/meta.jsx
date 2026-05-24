import styles from "./editor.module.css"
import { useContext, useState, forwardRef, useRef, useImperativeHandle, useEffect } from "react";
import { Context } from "../context";
import { RadioGroup, DatetimePicker, IconButton } from "@/components/uiux/hitalk";
import { RoomPicker } from "./roomPicker";
import { RoomItem } from "../../components/roomItem";
import { showToast } from '@/unimplementeds/toast.js'

const Wrap = ({ children, title, style }) => (
  <div style={{ ...thisStyle.wrap, ...style }}>
    <div style={thisStyle.wrapHeader}>
      <span style={thisStyle.wrapTitle}>{title}</span>
    </div>
    {children}
  </div>
)

const formatExpirationDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDay = weekDays[date.getDay()];
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${month}월 ${day}일(${weekDay}) ${hour}시 ${minute}분`;
}

export const MetaEditor = forwardRef((_, ref) => {
  const { model, dispatch } = useContext(Context);
  const { chatRooms, room, roomIds, closedType, editMode, isClosed } = model;
  const [ showRoomPicker, setShowRoomPicker ] = useState(false)
  const [ displayedRoom, setDisplayedRoom ] = useState(chatRooms?.find(r => r.room === room) || {});

  useEffect(() => {
    if (roomIds.length > 0) {
      setDisplayedRoom(chatRooms?.find(r => r.room === roomIds[0]))
    }
  }, [roomIds, chatRooms]);

  const popupRef = useRef(null);
  const calendarRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openCalendar: () => popupRef.current?.open(),
  }));

  return (
    <div className={`${styles['meta-editor']}`}>
      <Wrap title="대화방" style={{ height: '64px', marginBottom: '38px'}}>
        {!editMode && <IconButton icon="plus"
          onClick={() => setShowRoomPicker(!showRoomPicker)}
          className={`${styles['plus-btn']}`}
          iconSize={15}>          
          <span>추가</span>
        </IconButton>}
        <div className={styles['room-list']}>
          {!showRoomPicker && roomIds.length > 0 &&
            <RoomItem
              room={displayedRoom}
              showRecent={false}
              roomName={<>{`${displayedRoom?.roomName || ''}${roomIds.length > 1 ? ` 외 ${roomIds.length - 1}` : ''}`}</>}
            />}
          {roomIds.length === 0 && <div className={styles['no-rooms']}>대화방을 선택해 주세요.</div>}
        </div>
        { showRoomPicker && (
          <RoomPicker onClose={() => setShowRoomPicker(false)}/>
        )}
      </Wrap>
      <Wrap title="투표 마감 시간" style={{ height: '138px', marginBottom: '34px'}}>
        <RadioGroup onChange={closedType => dispatch({ closedType })} selected={closedType} disabled={isClosed}>
          {(
            <>
              <label value='auto' selected>자동 마감</label>
              <DatetimePicker
                disabled={closedType !== 'auto' || isClosed}
                timestamp={model.closedTimestamp || (Date.now() + 3 * 60 * 60 * 1000)}
                onChange={closedTimestamp => dispatch({ closedTimestamp })}
                formatter={formatExpirationDate}
                showYear={false}
                allowPast={false}
                popup={popupRef}
                calendar={calendarRef}
                position={{ right: -145, bottom: -85 }}
                onBeforeSelect={selected => onBeforeSelectDate(selected, calendarRef.current)}
              />
            </>
          )}
          {(
              <label value='none'> 자동 마감 없음 </label>
          )}
        </RadioGroup>
      </Wrap>
      <Wrap title="투표 결과" style={{ height: '128px'}}>
        <RadioGroup onChange={resultStatus => dispatch({ resultStatus })} selected={model.resultStatus}>
          {(<label value='PUBLIC' selected> 전체 공개 (득표수+응답자) </label>)}
          {(<label value='COUNT_ONLY'> 득표수만 공개 </label>)}
          {(<label value='PRIVATE'> 비공개 </label>)}
        </RadioGroup>
      </Wrap>
    </div>
  );
})

const thisStyle = {
  wrap: {
    width: '220px'
  },
  wrapHeader: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'left'
  },
  wrapTitle: {
    marginBottom: '5px',
    fontFamily: 'Pretendard Variable',
    fontWeight: 700,
    fontSize: '15px',
    lineHeight: '23px',
    letterSpacing: '-0.2px'
  }
}

const onBeforeSelectDate = (date, calendar) => {
  const paramDate = new Date(date);
  const today = new Date();
  paramDate.setSeconds(0, 0);
  today.setSeconds(0, 0);
  if (paramDate.getTime() < today.getTime() + 60 * 10 * 1000) {
    showToast('투표 마감시간은 10분 후부터 설정이 가능합니다.');
    calendar?.setSelectedTimestamps([today.getTime() + 60 * 10 * 1000]);
    return false;
  }
  if ((paramDate - today) > 3 * 24 * 60 * 60 * 1000) {
    showToast('투표 마감일은 3일 이내로 설정할 수 있습니다.');
    calendar?.setSelectedTimestamps([today.getTime() + 3 * 24 * 60 * 60 * 1000]);
    return false;
  }
  return true;
}