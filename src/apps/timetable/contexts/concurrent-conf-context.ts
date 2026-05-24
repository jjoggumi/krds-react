import Vue from "vue";
import { ConcurrentConf } from "../core/types";
import { ConcurrentConfRespository } from "../repositories/concurrent-conf-repository";
import TimetableContextBase from "./timetable-context-base";
import { EmbeddedListResponse } from "../common/types";

export default class ConcurrentConfContext extends TimetableContextBase<ConcurrentConf> {
  private static _instance: ConcurrentConfContext;

  private _repository = ConcurrentConfRespository;

  public constructor() {
    super();

    this._model = Vue.observable({
      concurrentConfs: [] as ConcurrentConf[],
    });
  }

  public static getInstance(): ConcurrentConfContext {
    if (!ConcurrentConfContext._instance) {
      ConcurrentConfContext._instance = new ConcurrentConfContext();
    }

    return ConcurrentConfContext._instance;
  }

  public get concurrentConfs(): ConcurrentConf[] {
    return this._model.concurrentConfs;
  }

  public get concurrentConfMap(): Record<string, ConcurrentConf> {
    return this._model.concurrentConfs.reduce((acc: Record<string, ConcurrentConf>, concurrentConf: ConcurrentConf) => {
      acc[concurrentConf.courseId] = concurrentConf;
      return acc;
    }, {} as Record<string, ConcurrentConf>) || ({} as Record<string, ConcurrentConf>);
  }

  public async fetch(): Promise<void> {
    try {
      const { getConcurrentConfListConcurrentconfs } = this.api;
      const res = await getConcurrentConfListConcurrentconfs(this.timetableId, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { concurrentConfs } = (res.data as EmbeddedListResponse<ConcurrentConf>)._embedded;
      this._model.concurrentConfs = concurrentConfs || [];
    }
    catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  get updateConcurrentConf() {
    const { updateConcurrentConfConcurrentconfsConcurrentConfId } = this.api;
    return updateConcurrentConfConcurrentconfsConcurrentConfId;
  }

  get createConcurrentCourse() {
      const { createConcurrentCourseConcurrentconfs } = this.api;
      return createConcurrentCourseConcurrentconfs;
  }

  get deleteConcurrentCourses() {
    const { deleteConcurrentConfsConcurrentconfs } = this.api;
    return deleteConcurrentConfsConcurrentconfs;
  }

  public addItem(concurrentConf: ConcurrentConf) {
    this._model.concurrentConfs.push(concurrentConf);
  }

  public removeByIds(concurrentConfIds: string[]) {
    this._model.concurrentConfs = this._model.concurrentConfs.filter(
      (conf: ConcurrentConf) => !concurrentConfIds.includes(conf.courseId)
    );
  }

  public replace(concurrentConfs: ConcurrentConf[]) {
    this._model.concurrentConfs = this._model.concurrentConfs.map((conf: ConcurrentConf) => {
      const updatedConf = concurrentConfs.find(
        (c: ConcurrentConf) => c.courseId === conf.courseId
      );
      return updatedConf ? updatedConf : conf;
    });
  }

  // public async add(concurrentConf: ConcurrentConf) {
  //   return await this._repository.add(concurrentConf);
  // }

  public async update(concurrentConf: ConcurrentConf) {
    return await this._repository.update(concurrentConf);
  }

  public async deleteWithIds (courseIds: string[]) {
    const concurrentConfs = await this._repository.getConcurrentConfs();

    const updatedConcurrentConfs = concurrentConfs.filter(
      (conf: ConcurrentConf) => !courseIds.includes(conf.courseId)
    );

    await this._repository.set(
      ConcurrentConfRespository.key,
      updatedConcurrentConfs
    );
  }
}