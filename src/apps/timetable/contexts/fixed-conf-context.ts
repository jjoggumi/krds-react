import Vue from "vue";
import {FixedConf} from "../core/types";

import TimetableContextBase from "./timetable-context-base";
import {EmbeddedListResponse} from "../common/types";
import {FixedConfRepository} from "../repositories/fixed-conf-repository";

interface RearrangeFixedConfResponse {
  fixedConfs: FixedConf[];
  deletedFixedConfIds: string[];
}

export default class FixedConfContext extends TimetableContextBase<FixedConf> {
  private static _instance: FixedConfContext;

  private _repository = FixedConfRepository;

  public constructor() {
    super();

    this._model = Vue.observable({
      fixedConfs: [] as FixedConf[],
    });
  }

  public static getInstance(): FixedConfContext {
    if (!FixedConfContext._instance) {
      FixedConfContext._instance = new FixedConfContext();
    }

    return FixedConfContext._instance;
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableFixedConfsFixedconfs } = this.api;
      const res = await getTimetableFixedConfsFixedconfs(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch fixed-confs');
      }

      const { timetableFixedConfs } = (res.data as EmbeddedListResponse<FixedConf>)._embedded;
      this._model.fixedConfs = timetableFixedConfs;

    } catch (error) {
      console.error('Error fetching fixed-confs:', error);
      throw new Error('Failed to fetch fixed-confs');
    }
  }

  get fixedConfs(): FixedConf[] {
    return this._model.fixedConfs;
  }

  get fixedConfMap(): Record<string, FixedConf> {
    return this._model.fixedConfs.reduce((acc: Record<string, FixedConf>, cur: FixedConf) => {
      acc[cur.fixedConfId] = cur;
      return acc;
  }, {} as Record<string, FixedConf>);
  }

  public removeByIds(fixedConfIds: string[]) {
    this._model.fixedConfs = this._model.fixedConfs.filter((conf: FixedConf) => {
      return !fixedConfIds.includes(conf.fixedConfId);
    });
  }

  public async deleteByIds(courseIds: string[]) {
    return await this._repository.deleteWithCourseIds(courseIds);
  }

  public async deleteByCourseIds (courseIds: string[]) {
    const fixedConfs = await this._repository.getFixedConfs();

    const updatedFixedConfs = fixedConfs.filter(
      (conf: FixedConf) => !courseIds.includes(conf.courseId)
    );

    await this._repository.set(updatedFixedConfs);
  }

  public async delete (fixedConf: FixedConf) {
    try {
      const { deleteFixedConfFixedconfsFixedConfId } = this.api;
      const res = await deleteFixedConfFixedconfsFixedConfId(this.timetableId, fixedConf.fixedConfId);

      if (res.status !== 200) {
        throw new Error('Failed to delete fixed-conf');
      }

      // console.log('Fixed-conf deleted successfully:', res.data);

      const { uUIDs } = (res.data as EmbeddedListResponse<string>)._embedded;
      // console.log('Deleted fixed-conf IDs:', uUIDs);
      
      // 로컬 모델에서 삭제된 fixedConf를 제거
      this._model.fixedConfs = this._model.fixedConfs.filter(
        (conf: FixedConf) => !uUIDs.includes(conf.fixedConfId)
      );
      
    }
    catch (error) {
      console.error('Error deleting fixed-confs:', error);
      throw new Error('Failed to delete fixed-confs');
    }

    // return this._repository.deleteWithArray(fixedConfs);
  }

  /*
  public async delete (fixedConf: FixedConf) {
    if (fixedConf.consecutiveGroupId) {
      await this._repository.deleteWithConsecutiveGroupId(
        fixedConf.consecutiveGroupId
      );
      return;
    }

    await this._repository.delete(fixedConf);
  }
  */

  public async deleteItems (fixedConfs: FixedConf[]) {
    return this._repository.deleteWithArray(fixedConfs);
  }

  public async addManyWithoutConsecutiveGroup (fixedConfs: FixedConf[]) {
    // 연속된 시수가 있으면 연속된 그룹 아이디를 할당한다.
    return this.addMany(fixedConfs, false);
  }

  public async addMany (fixedConfs: FixedConf[], isConsecutiveGroup: boolean = true) {

    const parmas = { createDtos: fixedConfs };

    if (isConsecutiveGroup) { // 연속된 시수가 있으면 연속된 그룹 아이디를 할당한다.
      parmas.createDtos = await this.assignConseutiveGroupIds(fixedConfs);
    }

    try {
      const { createFixedConfsFixedconfs } = this.api;
      const res = await createFixedConfsFixedconfs(this.timetableId, parmas);

      if (res.status !== 200) {
        throw new Error('Failed to create fixed-confs');
      }

      const { timetableFixedConfs } = (res.data as EmbeddedListResponse<FixedConf>)._embedded;
      this._model.fixedConfs.push(...timetableFixedConfs);
    }
    catch (error) {
      console.error('Error creating fixed-confs:', error);
      throw new Error('Failed to create fixed-confs');
    }
  }

  public async assignConseutiveGroupIds (fixedConfs: FixedConf[]) {
    const result = [...fixedConfs];

    const groupedByDay = result.reduce((acc, fixedConf) => {
      if (!acc[fixedConf.dayOfWeek]) {
        acc[fixedConf.dayOfWeek] = [];
      }

      acc[fixedConf.dayOfWeek].push(fixedConf);
      return acc;
    }, {} as { [key: number]: FixedConf[] });

    Object.values(groupedByDay).forEach((group) => {
      group.sort((a, b) => a.period - b.period);

      let currentGroupId: string | undefined = undefined;
      let hasConsecutive = false;

      for (let i = 0; i < group.length; i++) {

        const prevIndex = i - 1;

        if (i === 0 || group[i].period !== group[prevIndex].period + 1) { // 연속되지 않은 경우
          currentGroupId = undefined; //  그룹 아이디 초기화
          group[i].consecutiveGroupId = undefined;
          hasConsecutive = false;
          continue;
        }
          
        // 연속된 경우

        if (!hasConsecutive) { // 이전에 연속된 그룹이 없었다면
          currentGroupId = this._repository.generateConsecutiveGroupId();
          group[i - 1].consecutiveGroupId = currentGroupId; // 이전 요소에도 할당

          hasConsecutive = true;
        }
        
        group[i].consecutiveGroupId = currentGroupId;
      }
    });

    return result;
  }

  public async rearrangeFixedConfs(request: { confIdsToDelete: string[], confsToAdd: FixedConf[] }) {
    try {
      const { rearrangeFixedConfsConcurrentcourse } = this.api;
      const res = await rearrangeFixedConfsConcurrentcourse(this.timetableId, request);
      if (res.status !== 200) {
        throw new Error('Failed to rearrange fixed-confs');
      }

      const { fixedConfs, deletedFixedConfIds } = res.data as RearrangeFixedConfResponse;
      this.removeByIds(deletedFixedConfIds);
      if (!fixedConfs || fixedConfs.length === 0) { return; }
      this._model.fixedConfs.push(...fixedConfs);
    } catch (error) {
      console.error('Error rearranging fixed-confs:', error);
      throw new Error('Failed to rearrange fixed-confs');
    }
  }
}