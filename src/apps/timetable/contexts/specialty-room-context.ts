import Vue from "vue";
import { SpecialtyRoom } from "../core/types";

import { EmbeddedListResponse } from "../common/types";
import TimetableContextBase from "./timetable-context-base";
import { SpecialtyRoomRepository } from "../repositories/specialty-room-repository";
import { template } from "lodash";

export default class SpecialtyRoomContext extends TimetableContextBase<SpecialtyRoom> {
  private static _instance: SpecialtyRoomContext;

  public constructor() {
    super();

    this._model = Vue.observable({
      specialtyRooms: [] as SpecialtyRoom[],
    });
  }

  public static getInstance(): SpecialtyRoomContext {
    if (!SpecialtyRoomContext._instance) {
      SpecialtyRoomContext._instance = new SpecialtyRoomContext();
    }

    return SpecialtyRoomContext._instance;
  }

  get specialtyRooms(): SpecialtyRoom[] {
    return this._model.specialtyRooms;
  }

  get specialtyRoomMap(): Record<string, SpecialtyRoom> {
    return this._model.specialtyRooms.reduce((acc: Record<string, SpecialtyRoom>, room: SpecialtyRoom) => {
      acc[room.specialtyRoomId] = room;
      return acc;
    }, {});
  }

  get deleteSpecialtyRoom() {
    const { deleteSpecialtyRoomSpecialtyroomsSpecialtyRoomId } = this.api;
    return deleteSpecialtyRoomSpecialtyroomsSpecialtyRoomId;
  }

  public deleteById(specialtyRoomId: string) {
    const idx = this._model.specialtyRooms.findIndex((room: SpecialtyRoom) => room.specialtyRoomId === specialtyRoomId);
    if (idx !== -1) { this._model.specialtyRooms.splice(idx, 1); }
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableSpecialtyRoomsSpecialtyrooms } = this.api;
      const res = await getTimetableSpecialtyRoomsSpecialtyrooms(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch specialty rooms');
      }

      const { specialtyRooms } = (res.data as EmbeddedListResponse<SpecialtyRoom>)._embedded;
      this._model.specialtyRooms = specialtyRooms;
    } catch (error) {
      console.error('Error fetching specialty rooms:', error);
      throw new Error('Failed to fetch specialty rooms');
    }
  }

  public async createSpecialtyRoom(roomName: string): Promise<SpecialtyRoom | null> {
    try {
      const { createSpecialtyRoomSpecialtyrooms } = this.api;
      const res = await createSpecialtyRoomSpecialtyrooms(this.timetableId, { roomName });

      if (res.status !== 200) {
        throw new Error('Failed to create specialty room');
      }

      const specialtyRoom = res.data as SpecialtyRoom | null;
      if (specialtyRoom) {
        this._model.specialtyRooms.push(specialtyRoom);
      }
      return specialtyRoom;
    } catch (error) {
      console.error('Error creating specialty room:', error);
      throw new Error('Failed to create specialty room');
    }
  }

  public async updateSpecialtyRoomName(specialtyRoomId: string, roomName: string): Promise<void> {
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

      const index = this._model.specialtyRooms.findIndex((room: SpecialtyRoom) => room.specialtyRoomId === specialtyRoomId);
      if (index !== -1) {
        this._model.specialtyRooms.splice(index, 1, updatedRoom);
      }
    } catch (error) {
      console.error('Error updating specialty room name:', error);
      throw new Error('Failed to update specialty room name');
    }
  }

  public async updateMaxClassOnSpecialtyRoom(specialtyRoomId: string, maxClass: number): Promise<void> {
    try {
      const { updateMaxClassOnSpecialtyRoomMaxclass } = this.api;
      const res = await updateMaxClassOnSpecialtyRoomMaxclass(this.timetableId, specialtyRoomId, { 
        maxClass,
        templateId: this.templateId
      });

      if (res.status !== 200) {
        throw new Error('Failed to update max class on specialty room');
      }

      const updatedRoom = res.data as SpecialtyRoom | null;
      if (!updatedRoom) {
        throw new Error('Updated specialty room data is null');
      }

      const index = this._model.specialtyRooms.findIndex((room: SpecialtyRoom) => room.specialtyRoomId === specialtyRoomId);
      if (index !== -1) {
        this._model.specialtyRooms.splice(index, 1, updatedRoom);
      }
    } catch (error) {
      console.error('Error updating max class on specialty room:', error);
      throw new Error('Failed to update max class on specialty room');
    }
  }
}