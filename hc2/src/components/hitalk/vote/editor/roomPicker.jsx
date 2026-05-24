import Style from './roomPicker.module.css';
import { useContext, useState } from 'react';
import { Context } from '../context';
import { RoundedButton, CheckGroup } from '@/components/uiux/hitalk';
import { RoomItem } from '../../components/roomItem';

export const RoomPicker = ({ onClose }) => {
  const { model, dispatch } = useContext(Context);
  const { chatRooms, roomIds, room } = model;
  const [ thisRoomIds, setThisRoomIds ] = useState(roomIds);

  const filteredChatRooms = chatRooms.filter(r => !r.isEnding);

  return (
    <div className={Style['room-picker']}>
      <div className={Style['room-list']}>
        {(filteredChatRooms || []).length > 0 && <CheckGroup
          direction="column"
          onChange={selectedItems => {
            setThisRoomIds([...(room ? [ room ] : []), ...selectedItems])
          }}
          selectedItems={thisRoomIds.filter(r => r !== room)}
          disabledItems={[room]}
        >
          {(filteredChatRooms || []).map((room) => (
            <RoomItem key={room.room} room={room} />
          ))}
        </CheckGroup>}
        {filteredChatRooms.length === 0 && (
          <div className={Style['empty']}>생성된 대화방이 없습니다.</div>
        )}
      </div>
      <div className={Style['footer']}>
        <RoundedButton
          filled={false}
          onClick={onClose}
        >
          취소
        </RoundedButton>
        <RoundedButton
          onClick={() => {
            dispatch({ roomIds: thisRoomIds });
            onClose();
          }}
        >
          { thisRoomIds.length }개 선택
        </RoundedButton>
      </div>
    </div>
  );
}