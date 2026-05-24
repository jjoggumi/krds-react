import Vue from "vue";
import { SimilarCourse } from "../core/types";

import TimetableContextBase from "./timetable-context-base";
import { EmbeddedListResponse } from "../common/types";

export default class SimilarCourseContext extends TimetableContextBase<SimilarCourse> {
  private static _instance: SimilarCourseContext;

  public constructor() {
    super();

    this._model = Vue.observable({
      similarCourses: [] as SimilarCourse[],
    });
  }

  public static getInstance(): SimilarCourseContext {
    if (!SimilarCourseContext._instance) {
      SimilarCourseContext._instance = new SimilarCourseContext();
    }

    return SimilarCourseContext._instance;
  }

  public addItem(similarCourse: SimilarCourse) {
    this._model.similarCourses.push(similarCourse);
  }

  public async fetch(): Promise<void> {
    try {
      const { getSimilarCoursesSimilarcourses } = this.api;
      const res = await getSimilarCoursesSimilarcourses(this.timetableId, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to fetch similar-courses');
      }
      const { similarCourses } = (res.data as EmbeddedListResponse<SimilarCourse>)._embedded;
      this._model.similarCourses = similarCourses;
    } catch (error) {
      console.error('Error fetching similar-courses:', error);
      throw new Error('Failed to fetch similar-courses');
    }
  }

  get similarCourses(): SimilarCourse[] {
    return this._model.similarCourses;
  }

  get mapBySimilarCourseConfId(): Record<string, string[]> {
    return this._model.similarCourses.reduce((acc: Record<string, string[]>, sc: SimilarCourse) => {
      if (!acc[sc.similarCourseConfId]) {
        acc[sc.similarCourseConfId] = [] as string[];
      }
      acc[sc.similarCourseConfId].push(sc.courseBaseId);
      return acc;
    }, {} as Record<string, string[]>);
  }
}