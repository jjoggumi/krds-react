import Vue from "vue";
import { SimilarCourseConf } from "../core/types";

import TimetableContextBase from "./timetable-context-base";
import { EmbeddedListResponse } from "../common/types";
import { SimilarCourseConfRepository } from "../repositories/similar-course-conf-repository";

export default class SimilarCourseConfContext extends TimetableContextBase<SimilarCourseConf> {
  private static _instance: SimilarCourseConfContext;

  public constructor() {
    super();

    this._model = Vue.observable({
      similarCourseConfs: [] as SimilarCourseConf[],
    });
  }

  public static getInstance(): SimilarCourseConfContext {
    if (!SimilarCourseConfContext._instance) {
      SimilarCourseConfContext._instance = new SimilarCourseConfContext();
    }

    return SimilarCourseConfContext._instance;
  }

  public addItem(similarCourseConf: SimilarCourseConf) {
    this._model.similarCourseConfs.push(similarCourseConf);
  }

  public async fetch(): Promise<void> {
    try {
      const { getSimilarCourseConfsSimilarcourseconfs } = this.api;
      const res = await getSimilarCourseConfsSimilarcourseconfs(this.timetableId, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to fetch similar-course-confs');
      }
      const { similarCourseConfs } = (res.data as EmbeddedListResponse<SimilarCourseConf>)._embedded;
      this._model.similarCourseConfs = similarCourseConfs;
    } catch (error) {
      console.error('Error fetching similar-course-confs:', error);
      throw new Error('Failed to fetch similar-course-confs');
    }
  }

  public async createSimilarCourseConf(
    groupName: string
  ) {
    try {
      const { createSimilarCourseConfSimilarcourseconfs } = this.api;
      const res = await createSimilarCourseConfSimilarcourseconfs(this.timetableId, { 
        groupName,
        templateId: this.templateId,
       });

      if (res.status !== 200) {
        throw new Error('Failed to create similar-course-conf');
      }
      const similarCourseConf = res.data as SimilarCourseConf | null;
      if (similarCourseConf) {
        this._model.similarCourseConfs.push(similarCourseConf);
      }
      return similarCourseConf;
    } catch (error) {
      console.error('Error creating similar-course-conf:', error);
      throw new Error('Failed to create similar-course-conf');
    }
  }

  get similarCourseConfs(): SimilarCourseConf[] {
    return this._model.similarCourseConfs;
  }

  public async deleteSimilarCourseConfs(similarCourseConfIds: string[]): Promise<void> {
    try {
      const { deleteSimilarCourseConfSimilarcourseconfs } = this.api;

      const res = await deleteSimilarCourseConfSimilarcourseconfs(this.timetableId, { 
        similarCourseConfIds,
        templateId: this.templateId,
      });

      if (res.status !== 200) {
        throw new Error('Failed to delete similar-course-confs');
      }

      this._model.similarCourseConfs = this._model.similarCourseConfs.filter((conf: SimilarCourseConf) => {
        return !similarCourseConfIds.includes(conf.similarCourseConfId);
      });

    } catch (error) {
      console.error('Error deleting similar-course-confs:', error);
      throw new Error('Failed to delete similar-course-confs');
    }
  }

  // public async updateSimilarCourseConf(similarCourseConfId: string, similarCourseName: string): Promise<void> {
  //   try {
  //     const { updateSimilarCourseConf } = this.api;
  //     const res = await updateSimilarCourseConf(this.timetableId, similarCourseConfId, { similarCourseName });

  //     if (res.status !== 200) {
  //       throw new Error('Failed to update similar-course-conf');
  //     }
  //     const { updatedSimilarCourseConf } = res.data;
  //     const index: number = this._model.similarCourseConfs.findIndex(
  //       (conf: SimilarCourseConf) => conf.similarCourseConfId === (updatedSimilarCourseConf as SimilarCourseConf).similarCourseConfId
  //     );
  //     if (index !== -1) {
  //       this._model.similarCourseConfs[index] = updatedSimilarCourseConf;
  //     } else {
  //       console.warn(`Similar course conf with ID ${similarCourseConfId} not found.`);
  //     }
  //   } catch (error) {
  //     console.error('Error updating similar-course-conf:', error);
  //     throw new Error('Failed to update similar-course-conf');
  //   }
  // }
  public async updateSimilarCourseConf(similarCourseConfId: string, similarCourseName: string): Promise<void> {
    try {
      if (!similarCourseConfId) {
        return;
      }

      const { updateSimilarCourseConfSimilarcourseconfsSimilarCourseConfId } = this.api;
      const res = await updateSimilarCourseConfSimilarcourseconfsSimilarCourseConfId(
        this.timetableId,
        similarCourseConfId,
        { similarCourseName }
      );

      if (res.status !== 200) {
        throw new Error('Failed to update similar-course-conf');
      }

      const updatedSimilarCourseConf = (res.data || {}).updatedSimilarCourseConf as SimilarCourseConf;

      const confArray = this._model.similarCourseConfs;
      const localIndex: number = confArray.findIndex(
        (conf: SimilarCourseConf) => conf.similarCourseConfId === similarCourseConfId
      );

      if (updatedSimilarCourseConf && localIndex !== -1) {
        confArray[localIndex] = updatedSimilarCourseConf;
      }
    } catch (error) {
      console.error('Error updating similar-course-conf:', error);
      throw new Error('Failed to update similar-course-conf');
    }
  }
}