import { SpecialtyRoom } from "../core/types";
import { EmbeddedListResponse } from "../common/types";
import TimetableContextBase from "./timetableContextBase";

export default class TimetableSpecialtyRoomContext extends TimetableContextBase<SpecialtyRoom> {
  private static _instance: TimetableSpecialtyRoomContext;

  private constructor() {
    super();

    this._model = [] as SpecialtyRoom[];
  }

  public static getInstance(): TimetableSpecialtyRoomContext {
    if (!TimetableSpecialtyRoomContext._instance) {
      TimetableSpecialtyRoomContext._instance = new TimetableSpecialtyRoomContext();
    }
    return TimetableSpecialtyRoomContext._instance;
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableSpecialtyRoomsSpecialtyrooms } = this.api;
      const res = await getTimetableSpecialtyRoomsSpecialtyrooms(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch specialty rooms');
      }

      const { specialtyRooms } = (res.data as EmbeddedListResponse<SpecialtyRoom>)._embedded;
      this._model = specialtyRooms;

      this.notifyListeners();
    } catch (error) {
      console.error('Error fetching specialty-rooms:', error);
      throw new Error('Failed to fetch specialty-rooms');
    }
  }

  get specialtyRooms(): SpecialtyRoom[] {
    return this._model.map(room => ({
      specialtyRoomId: room.specialtyRoomId,
      roomName: room.roomName
    }));
  }

  get specialtyRoomMap(): Record<string, SpecialtyRoom> {
    return this._model.reduce((acc, cur) => {
      acc[cur.specialtyRoomId] = cur;
      return acc;
    }, {} as Record<string, SpecialtyRoom>);
  }

  public async createSpecialtyRoom(roomName: string, maxClass?: number): Promise<SpecialtyRoom | null> {
    try {
      const { createSpecialtyRoomSpecialtyrooms } = this.api;
      const payload: { roomName: string; maxClass?: number } = { roomName };
      if (!!maxClass) payload.maxClass = maxClass;

      const res = await createSpecialtyRoomSpecialtyrooms(this.timetableId, payload);

      if (res.status !== 200) {
        throw new Error('Failed to create specialty room');
      }

      const specialtyRoom = res.data as SpecialtyRoom | null;
      if (specialtyRoom) {
        this._model.push(specialtyRoom);
      }

      this.notifyListeners();

      return specialtyRoom;
    } catch (error) {
      console.error('Error creating specialty room:', error);
      throw new Error('Failed to create specialty room');
    }
  }

  public async updateSpecialtyRoomName(specialtyRoomId: string, roomName: string): Promise<SpecialtyRoom | null> {
    try {
      const { updateSpecialtyRoomNameRoomname } = this.api;
      const res = await updateSpecialtyRoomNameRoomname(this.timetableId, specialtyRoomId, { roomName });

      if (res.status !== 200) {
        throw new Error('Failed to update specialty room name');
      }

      const updatedRoom = res.data as SpecialtyRoom | null;
      
      if (!updatedRoom) {
        throw new Error('Updated specialty room data is null');
      }

      const index = this._model.findIndex((room: SpecialtyRoom) => room.specialtyRoomId === specialtyRoomId);
      if (index !== -1) {
        this._model.splice(index, 1, updatedRoom);
      }

      this.notifyListeners();

      return updatedRoom;

    } catch (error) {
      console.error('Error updating specialty room name:', error);
      throw new Error('Failed to update specialty room name');
    }
  }

}