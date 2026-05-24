import Vue from "vue";
import { ConsecutiveConf } from "../core/types";

// import { ConsecutiveConfDto } from "@/apis/data-contracts";
import { EmbeddedListResponse } from "../common/types";
import TimetableContextBase from "./timetable-context-base";

export default class ConsecutiveConfContext extends TimetableContextBase<ConsecutiveConf> {
  private static _instance: ConsecutiveConfContext;

  public constructor() {
    super();

    this._model = Vue.observable({
      consecutiveConfs: [] as ConsecutiveConf[],
    });
  }

  public static getInstance(): ConsecutiveConfContext {
    if (!ConsecutiveConfContext._instance) {
      ConsecutiveConfContext._instance = new ConsecutiveConfContext();
    }

    return ConsecutiveConfContext._instance;
  }

  get consecutiveConfs(): ConsecutiveConf[] {
    return this._model.consecutiveConfs;
  }

  public async fetch(): Promise<void> {
    try {
      const { getConsecutiveConfListConsecutiveconfs } = this.api;
      const res = await getConsecutiveConfListConsecutiveconfs(this.timetableId, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to fetch consecutive-confs');
      }
      const { consecutiveConfs } = (res.data as EmbeddedListResponse<ConsecutiveConf>)._embedded;
      this._model.consecutiveConfs = consecutiveConfs;
    } catch (error) {
      console.error('Error fetching consecutive-confs:', error);
      throw new Error('Failed to fetch consecutive-confs');
    }
  }

  public async createConsecutiveConfs(confs: Array<ConsecutiveConf>): Promise<void> {
    try {

      const consecutiveConfDtos = confs.map(({ 
        courseId, 
        teacherId, 
        grade, 
        consecutivePeriod, 
        teacherName 
      }) => ({
        courseId,
        teacherId,
        grade,
        consecutivePeriod,
        teacherName: teacherName || ""
      }));

      const { createConsecutiveConfsConsecutiveconfs } = this.api;
      const res = await createConsecutiveConfsConsecutiveconfs(this.timetableId, { consecutiveConfDtos, templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to create consecutive-confs');
      }
      const { consecutiveConfs } = (res.data as EmbeddedListResponse<ConsecutiveConf>)._embedded;
      this._model.consecutiveConfs.push(...consecutiveConfs);
    } catch (error) {
      console.error('Error creating consecutive-confs:', error);
      throw new Error('Failed to create consecutive-confs');
    }
  }

  public async updateConsecutivePeriodToConf(consecutiveConfId: string, consecutivePeriod: string): Promise<void> {
    try {
      const { updateConsecutiveConfConsecutiveconfsConsecutiveConfId } = this.api;
      const res = await updateConsecutiveConfConsecutiveconfsConsecutiveConfId(this.timetableId, consecutiveConfId, { consecutivePeriod, templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to update consecutive period to conf');
      }
      const updatedConsecutiveConf = res.data as ConsecutiveConf;

      if (!updatedConsecutiveConf) {
        throw new Error('Updated consecutive conf is undefined');
      }

      this._model.consecutiveConfs = this._model.consecutiveConfs.map((conf: ConsecutiveConf) => {
        if (conf.consecutiveConfId === updatedConsecutiveConf.consecutiveConfId) {
          return updatedConsecutiveConf;
        }
        return conf;
      });
    } catch (error) {
      console.error('Error updating consecutive period to conf:', error);
      throw new Error('Failed to update consecutive period to conf');
    }
  }

  public async deleteConsecutiveConfs(consecutiveConfIds: string[]): Promise<void> {
    try {
      const { deleteConsecutiveConfsConsecutiveconfs } = this.api;
      const res = await deleteConsecutiveConfsConsecutiveconfs(this.timetableId, { consecutiveConfIds, templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to delete consecutive-confs');
      }

      this._model.consecutiveConfs = this._model.consecutiveConfs.filter(
        (conf: ConsecutiveConf) => !consecutiveConfIds.includes(conf.consecutiveConfId)
      );
    } catch (error) {
      console.error('Error deleting consecutive-confs:', error);
      throw new Error('Failed to delete consecutive-confs');
    }
  }
  // public async createItems (consecutiveConfs: ConsecutiveConf[]) {
  //   const currentConsecutiveConfs =   (await ConsecutiveConfRepository.getConsecutiveConfs()) as ConsecutiveConf[];

  //   // 아이디 생성
  //   consecutiveConfs.forEach((consecutiveConf) => {
  //     consecutiveConf.consecutiveConfId = this._repository.generateId();
  //   });

  //   const newConsecutiveConfs = [
  //     ...currentConsecutiveConfs,
  //     ...consecutiveConfs,
  //   ];

  //   return this._repository.set(newConsecutiveConfs);
  // }

  // public async deleteItems (consecutiveConfs: ConsecutiveConf[]) {
  //   const newConsecutiveConfs = this.consecutiveConfs.filter(
  //     (currentConsecutiveConf) =>
  //       !consecutiveConfs.some(
  //         (consecutiveConf) =>
  //           currentConsecutiveConf.consecutiveConfId ===
  //           consecutiveConf.consecutiveConfId
  //       )
  //   );

  //   return this._repository.set(newConsecutiveConfs);
  // }
}