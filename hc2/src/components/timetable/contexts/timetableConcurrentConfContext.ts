import { ConcurrentConf } from "../core/types";
import TimetableContextBase from "./timetableContextBase";
import { EmbeddedListResponse } from "../common/types";

export default class TimetableConcurrentConfContext extends TimetableContextBase<ConcurrentConf> {
  private static _instance: TimetableConcurrentConfContext;

  public constructor() {
    super();

    this._model = [] as ConcurrentConf[];
  }

  public static getInstance(): TimetableConcurrentConfContext {
    if (!TimetableConcurrentConfContext._instance) {
      TimetableConcurrentConfContext._instance = new TimetableConcurrentConfContext();
    }

    return TimetableConcurrentConfContext._instance;
  }

  public get concurrentConfs(): ConcurrentConf[] {
    return this._model;
  }

  public get concurrentConfMap(): Record<string, ConcurrentConf> {
    return this._model.reduce((acc: Record<string, ConcurrentConf>, concurrentConf: ConcurrentConf) => {
      acc[concurrentConf.courseId] = concurrentConf;
      return acc;
    }, {} as Record<string, ConcurrentConf>) || ({} as Record<string, ConcurrentConf>);
  }

  public async fetch(): Promise<void> {
    try {
      const { getConcurrentConfListConcurrentconfs } = this.api;
      const res = await getConcurrentConfListConcurrentconfs(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { concurrentConfs } = (res.data as EmbeddedListResponse<ConcurrentConf>)._embedded;
      this._model = concurrentConfs || [];

      this.notifyListeners();
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
    this._model.push(concurrentConf);
  }

  public removeByIds(concurrentConfIds: string[]) {
    this._model = this._model.filter(
      (conf: ConcurrentConf) => !concurrentConfIds.includes(conf.courseId)
    );
  }

  public replace(concurrentConfs: ConcurrentConf[]) {
    this._model = this._model.map((conf: ConcurrentConf) => {
      const updatedConf = concurrentConfs.find(
        (c: ConcurrentConf) => c.courseId === conf.courseId
      );
      return updatedConf ? updatedConf : conf;
    });
  }
}