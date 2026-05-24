import Vue from "vue";
import { SpecialtyRoomConf } from "../core/types";

import { EmbeddedListResponse, SpecialtyRoomConfRequest } from "../common/types";
import TimetableContextBase from "./timetable-context-base";

export default class SpecialtyRoomConfContext extends TimetableContextBase<SpecialtyRoomConf> {
  private static _instance: SpecialtyRoomConfContext;

  public constructor() {
    super();

    this._model = Vue.observable({
      specialtyRoomConfs: [] as SpecialtyRoomConf[],
    });
  }

  public static getInstance(): SpecialtyRoomConfContext {
    if (!SpecialtyRoomConfContext._instance) {
      SpecialtyRoomConfContext._instance = new SpecialtyRoomConfContext();
    }

    return SpecialtyRoomConfContext._instance;
  }

  get specialtyRoomConfs(): SpecialtyRoomConf[] {
    return this._model.specialtyRoomConfs;
  }

  public deleteByIdsIn(confIds: string[]) {
    this._model.specialtyRoomConfs = this._model.specialtyRoomConfs.filter(
      (conf: SpecialtyRoomConf) => !confIds.includes(conf.specialtyRoomConfId)
    );
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableSpecialtyRoomConfsSpecialtyroomconfs } = this.api;
      const res = await getTimetableSpecialtyRoomConfsSpecialtyroomconfs(this.timetableId, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to fetch specialty room configurations');
      }
      const { specialtyRoomConfs } = (res.data as EmbeddedListResponse<SpecialtyRoomConf>)._embedded;
      this._model.specialtyRoomConfs = specialtyRoomConfs;
    } catch (error) {
      console.error('Error fetching specialty room configurations:', error);
      throw new Error('Failed to fetch specialty room configurations');
    }
  }

  public async createSpecialtyRoomConfs(specialtyRoomId: string, addedConfs: SpecialtyRoomConf[]): Promise<void> {
    try {
      const { createSpecialtyRoomConfsSpecialtyroomconfs } = this.api;
      const res = await createSpecialtyRoomConfsSpecialtyroomconfs(
        this.timetableId,
        { specialtyRoomId, roomConfs: addedConfs, templateId: this.templateId } 
      );
      if (res.status !== 200) {
        throw new Error('Failed to create specialty room configurations');
      }
      const { specialtyRoomConfs } = (res.data as EmbeddedListResponse<SpecialtyRoomConf>)._embedded;
      this._model.specialtyRoomConfs.push(...specialtyRoomConfs);
    } catch (error) {
      console.error('Error creating specialty room configurations:', error);
      throw new Error('Failed to create specialty room configurations');
    }
  }

  public async deleteSpecialtyRoomConfs(specialtyRoomConfs: Array<string>): Promise<void> {
    try {
      const { deleteSpecialtyRoomConfSpecialtyroomconfs } = this.api;
      const res = await deleteSpecialtyRoomConfSpecialtyroomconfs(
        this.timetableId,
        { specialtyRoomConfs, templateId: this.templateId }
      );

      if (res.status !== 200) {
        throw new Error('Failed to delete specialty room configurations');
      }
    } catch (error) {
      console.error('Error deleting specialty room configurations:', error);
      throw new Error('Failed to delete specialty room configurations');
    }
  }

  // public async updateSpecialtyRoomConf(specialtyRoomId: string, periodCount: number): Promise<void> {
  public async updateSpecialtyRoomConf(specialtyRoomId: string, { periodCount, consecutivePeriod }: SpecialtyRoomConfRequest): Promise<void> {
    try {
      const { updateSpecialtyRoomConfSpecialtyroomconfsSpecialtyRoomConfId } = this.api;
      const res = await updateSpecialtyRoomConfSpecialtyroomconfsSpecialtyRoomConfId( this.timetableId, specialtyRoomId, { 
        periodCount,
        consecutivePeriod,
        templateId: this.templateId
      });

      if (res.status !== 200) {
        throw new Error('Failed to update specialty room configuration');
      }

      const updatedConf = res.data as SpecialtyRoomConf;
      const index = this._model.specialtyRoomConfs.findIndex((conf: SpecialtyRoomConf) => conf.specialtyRoomConfId === updatedConf.specialtyRoomConfId);
      if (index !== -1) {
        this._model.specialtyRoomConfs.splice(index, 1, updatedConf);
      } else {
        throw new Error('Specialty room configuration not found');
      }
    } catch (error) {
      console.error('Error updating specialty room configuration:', error);
      throw new Error('Failed to update specialty room configuration');
    }
  }

  
}