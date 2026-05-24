import Vue from "vue";
import { LessonConf } from "../core/types";

import TimetableContextBase from "./timetable-context-base";
import { LessonConfRepository } from "../repositories/lesson-conf-repository";
import { EmbeddedListResponse } from "../common/types";



export default class LessonConfContext extends TimetableContextBase<LessonConf> {
  private static _instance: LessonConfContext;

  private _repository = LessonConfRepository;

  public constructor() {
    super();

    this._model = Vue.observable({
      lessonConfs: [] as LessonConf[],
      // lessonConfMap: {} as Record<string, LessonConf>,
    });
  }

  public static getInstance(): LessonConfContext {
    if (!LessonConfContext._instance) {
      LessonConfContext._instance = new LessonConfContext();
    }

    return LessonConfContext._instance;
  }

  public async fetch(): Promise<void> {
    try {
      const { getTimetableLessonConfsLessonconfs } = this.api;
      const res = await getTimetableLessonConfsLessonconfs(this.timetableId, { templateId: this.templateId });

      if (res.status !== 200) {
        throw new Error('Failed to fetch lesson-confs');
      }

      const { timetableLessonConfs } = (res.data as EmbeddedListResponse<LessonConf>)._embedded;
      this._model.lessonConfs = timetableLessonConfs;
    }
    catch (error) {
      console.error('Error fetching lesson-confs:', error);
      throw new Error('Failed to fetch lesson-confs');
    }
  }

  get lessonConfs(): LessonConf[] {
    return this._model.lessonConfs;
  }

  get lessonConfMap(): Record<string, LessonConf> {
    return this._model.lessonConfs.reduce((acc: Record<string, LessonConf>, conf: LessonConf) => {
      // 교사-과목-학급 으로 맵핑
      const key = this.getLessonConfUniqueKey(conf);
      acc[key] = conf;
      return acc;
    }, {} as Record<string, LessonConf>) || ({} as Record<string, LessonConf>); 
  }

  get lessonConfsMapByTeacher(): Record<string, LessonConf[]> {
    return this._model.lessonConfs.reduce((acc: Record<string, LessonConf[]>, conf: LessonConf) => {
      const key = conf.teacherId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(conf);
      return acc;
    }, {} as Record<string, LessonConf[]>) || ({} as Record<string, LessonConf[]>); 
  }

  get lessonConfsMapByConcurrentCourse(): Record<string, LessonConf[]> {
    return this._model.lessonConfs.reduce((acc: Record<string, LessonConf[]>, cur: LessonConf) => {
      if (!cur.concurrentCourseId) {
        return acc;
      }

      (acc[cur.concurrentCourseId] ||= [] as LessonConf[]).push(cur);

      return acc;
    }, {} as Record<string, LessonConf[]>) || {};
  }

  get lessonConfCourseIdsByTeacher(): Record<string, string[]> {
      return this._model.lessonConfs.reduce((acc: Record<string, string[]>, conf: LessonConf) => {
        if (!acc[conf.teacherId]) {
          acc[conf.teacherId] = [];
        }
        if (!acc[conf.teacherId].includes(conf.courseId)) {
          acc[conf.teacherId].push(conf.courseId);
        }
        return acc;
      }, {} as Record<string, string[]>) || ({} as Record<string, string[]>);
  }

  get attachConcurrentCourse() {
    const { attachConcurrentCourseLessonconfs } = this.api;
    return attachConcurrentCourseLessonconfs;
  }

  get detachConcurrentCourse() {
    const { detachConcurrentCourseLessonconfs } = this.api;
    return detachConcurrentCourseLessonconfs;
  }

  get swapLessonConfs() {
    const { swapLessonConfsSwap } = this.api;
    return swapLessonConfsSwap;
  }

  get tossLessonConf() {
    const { tossLessonConfToss } = this.api;
    return tossLessonConfToss;
  }

  public getByClassId(classId: string): LessonConf[] {
    return this._model.lessonConfs.filter(
      (lessonConf: LessonConf) => lessonConf.classId === classId
    );
  }

  public removeFromModelById(lessonConfId: string) {
    const idx = this._model.lessonConfs.findIndex((lc: LessonConf) => lc.lessonConfId === lessonConfId);
    if (idx !== -1) this._model.lessonConfs.splice(idx, 1);
  }

  public getByClassIdWithUniqueCourse (classId: string) {
    // 반별 수업 설정(lessonConf)목록을 가져오되, 복수 교사 과목인 경우
    // 대표교사(첫번째 교사)를 남기고 나머지는 제거한다.
    const lessonConfs =  this.getByClassId(classId);
    const courseIdSet = new Set<string>();
    return lessonConfs.filter((lessonConf) => {
      const { courseId } = lessonConf;
      if (courseIdSet.has(courseId)) {
        return false;
      }

      courseIdSet.add(courseId);
      return true;
    });
  }

  public getLessonConfUniqueKey(conf: LessonConf): string {
    return `${conf.teacherId}-${conf.courseId}-${conf.classId}`;
  }

  public replace(lessonConfs: LessonConf[]) {
    this._model.lessonConfs = this._model.lessonConfs.map((lessonConf: LessonConf) => {
      const updatedLessonConf = lessonConfs.find(
        (conf: LessonConf) => conf.lessonConfId === lessonConf.lessonConfId
      );
      return updatedLessonConf ? updatedLessonConf : lessonConf;
    });
  }

  public async create(
    courseId: string,
    teacherId: string,
    classId: string,
    grade: number
  ) {
    // 이미 존재하는 수업 설정인지 확인한다.
    // const lessonConfs = await this._repository.getByClassId(classId);
    const lessonConfs = await this.getByClassId(classId);

    const isExist = lessonConfs.some(
      (lessonConf: LessonConf) =>
        lessonConf.teacherId === teacherId &&
        lessonConf.courseId === courseId &&
        lessonConf.classId === classId
    );

    if (isExist) {
      return;
    }

    try {
      const { createLessonConfLessonconfs } = this.api;
      const res = await createLessonConfLessonconfs(this.timetableId, { courseId, teacherId, classId, grade, templateId: this.templateId });
      if (res.status !== 200) {
        throw new Error('Failed to create lesson-conf');
      }

      this._model.lessonConfs.push(res.data as LessonConf);

      return res.data as LessonConf;
    } catch (error) {
      console.error('Error creating lesson-conf:', error);
      throw new Error('Failed to create lesson-conf');
    }
  }

  public async delete (lessonConf: LessonConf) {
    try {
      const { deleteLessonConfLessonconfsLessonConfId } = this.api;
      const res = await deleteLessonConfLessonconfsLessonConfId(this.timetableId, lessonConf.lessonConfId, {
        templateId: this.templateId
      });
      
      if (res.status !== 200) {
        throw new Error('Failed to delete lesson-conf');
      }
      this.removeFromModelById(lessonConf.lessonConfId);
    } catch (error) {
      console.error('Error deleting lesson-conf:', error);
      throw new Error('Failed to delete lesson-conf');
    }
  }

  public async deleteByIds (lessonConfIds: string[]) {
    if (lessonConfIds.length === 0) {
      return;
    }

    try {
      const { deleteLessonConfsLessonconfs } = this.api;
      const res = await deleteLessonConfsLessonconfs(this.timetableId, {
        lessonConfIds,
        templateId: this.templateId
      });
      if (res.status !== 200) {
        throw new Error('Failed to delete lesson-conf');
      }
      
      lessonConfIds.forEach(lessonConfId => this.removeFromModelById(lessonConfId));

    } catch (error) {
      console.error('Error deleting lesson-conf:', error);
      throw new Error('Failed to delete lesson-conf');
    }
  }

  public async removeConcurrentCourseByLessonConf(lessonConf: LessonConf) {
    // courseId와 classId가 같은 lessonConf를 찾아서 concurrentCourseId를 업데이트한다.
    const concurrentCourseId = '';
    return await this._repository.updateConcurrentCourseIdWithCourseAndClass(
      lessonConf.courseId,
      lessonConf.classId,
      concurrentCourseId
    );
  }

  public async removeConcurrentCourseIdByConcurrentCourseId (concurrentCourseId: string) {
    // 동시 수업에 할당된 수업 설정(lessonConf)들의 동시 수업 정보를 제거한다.
    const lessonConfs = await this._repository.get();
    const updatedLessonConfs: LessonConf[] = lessonConfs
      .filter(
        (lessonConf: LessonConf) =>
          lessonConf.concurrentCourseId === concurrentCourseId
      )
      .map((lessonConf: LessonConf) => {
        lessonConf.concurrentCourseId = '';
        return lessonConf;
      });

    await this._repository.set(lessonConfs);
    return updatedLessonConfs;
  }

  public async deleteConcurrentCourseByConcurrentCourseIds (
    concurrentCourseIds: string[]
  ) {
    // 여러 동시수업의 수업 설정들을 삭제하는 경우, storage를 여러번 저장하는 것을 방지하기 위해 해당 함수를 사용한다.
    // 동시 수업에 할당된 수업 설정(lessonConf)들의 동시 수업 정보를 제거한다.
    const lessonConfs = await this._repository.get();

    const updatedLessonConfs: LessonConf[] = lessonConfs
      .filter((lessonConf: LessonConf) => {
        if (!lessonConf.concurrentCourseId) {
          return false;
        }
        return concurrentCourseIds.includes(lessonConf.concurrentCourseId);
      })
      .map((lessonConf: LessonConf) => {
        lessonConf.concurrentCourseId = '';
        return lessonConf;
      });

    await this._repository.set(lessonConfs);
    return updatedLessonConfs;
  }

  public async updateLessonConfs (lessonConfs: LessonConf[]) {
    const currentLessonConfs = (await this._repository.get()) as LessonConf[];

    const updatedLessonConfs = currentLessonConfs.map((currentLessonConf) => {
      const lessonConf = lessonConfs.find(
        (lessonConf) =>
          lessonConf.lessonConfId === currentLessonConf.lessonConfId
      );

      if (lessonConf) {
        return lessonConf;
      }

      return currentLessonConf;
    });

    await this._repository.set(updatedLessonConfs);
    return updatedLessonConfs;
  }

  public async updateConcurrentCourseIdByLessonConf (
    lessonConf: LessonConf,
    concurrentCourseId: string
  ) {
    // courseId와 classId가 같은 lessonConf를 찾아서 concurrentCourseId를 업데이트한다.
    return await this._repository.updateConcurrentCourseIdWithCourseAndClass(
      lessonConf.courseId,
      lessonConf.classId,
      concurrentCourseId
    );
  }

  public async attachSpecialtyRoomConfOnLessonConf(specialtyRoomConfId: string, lessonConfId: string): Promise<void> {
    try {
      const { attachSpecialtyRoomConfOnLessonConfLessonconfs } = this.api;
      const res = await attachSpecialtyRoomConfOnLessonConfLessonconfs(this.timetableId, specialtyRoomConfId, { lessonConfId });

      if (res.status !== 200) {
        throw new Error('Failed to attach specialty room conf on lesson conf');
      }

      const lessonConf = res.data as LessonConf | null;
      if (lessonConf) {
        const index = this._model.lessonConfs.findIndex((lc: LessonConf) => lc.lessonConfId === lessonConf.lessonConfId);
        if (index !== -1) {
          this._model.lessonConfs.splice(index, 1, lessonConf);
        }
      }
    } catch (error) {
      console.error('Error attaching specialty room conf on lesson conf:', error);
      throw new Error('Failed to attach specialty room conf on lesson conf');
    }
  }

  public async detachSpecialtyRoomConfOnLessonConf(specialtyRoomConfId: string, lessonConfId: string): Promise<void> {
    try {
      const { detachSpecialtyRoomConfOnLessonConfLessonconfsLessonConfId } = this.api;
      const res = await detachSpecialtyRoomConfOnLessonConfLessonconfsLessonConfId(this.timetableId, specialtyRoomConfId, lessonConfId);

      if (res.status !== 200) {
        throw new Error('Failed to detach specialty room conf on lesson conf');
      }

      const lessonConf = res.data as LessonConf | null;
      if (lessonConf) {
        const index = this._model.lessonConfs.findIndex((lc: LessonConf) => lc.lessonConfId === lessonConf.lessonConfId);
        if (index !== -1) {
          this._model.lessonConfs.splice(index, 1, lessonConf);
        }
      }
    } catch (error) {
      console.error('Error detaching specialty room conf on lesson conf:', error);
      throw new Error('Failed to detach specialty room conf on lesson conf');
    }
  }
}