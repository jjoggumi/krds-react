import {CourseBase} from "../core/types";
import TimetableContextBase from "./timetableContextBase";
import {EmbeddedListResponse} from "../common/types";
import {AxiosError} from "axios";

export default class TimetableCourseBaseContext extends TimetableContextBase<CourseBase> {
  private static _instance: TimetableCourseBaseContext;

  public constructor() {
    super();

    this._model = [] as CourseBase[];
  }

  public static getInstance(): TimetableCourseBaseContext {
    if (!TimetableCourseBaseContext._instance) {
      TimetableCourseBaseContext._instance = new TimetableCourseBaseContext();
    }

    return TimetableCourseBaseContext._instance;
  }

  get courseBases(): CourseBase[] {
    return this._model;
  }

  get courseBaseMap(): Record<string, CourseBase> {
    return this.courseBases?.reduce((acc: Record<string, CourseBase>, courseBase: CourseBase) => {
      acc[courseBase.courseBaseId] = courseBase;
      return acc;
    }, {} as Record<string, CourseBase>) || ({} as Record<string, CourseBase>);
  }

  public addItem(courseBase: CourseBase): void {
    this._model.push(courseBase);
  }

  public removeByIds(courseBaseIds: string[]): void {
    this._model = this._model.filter(
      (courseBase: CourseBase) => !courseBaseIds.includes(courseBase.courseBaseId)
    );
  }

  public replace(courseBases: CourseBase[]): void {
    this._model = this._model.map((courseBase: CourseBase) => {
      const updatedCourseBase = courseBases.find(cb => cb.courseBaseId === courseBase.courseBaseId);
      return updatedCourseBase ? updatedCourseBase : courseBase;
    });
  }
  
  public async fetch(): Promise<void> {
    try {
      const { getTimetableCourseBasesCoursebases } = this.api;
      const res = await getTimetableCourseBasesCoursebases(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { courseBases } = (res.data as EmbeddedListResponse<CourseBase>)._embedded;
      this._model = courseBases;
      
      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  public async add(courseBase: CourseBase): Promise<CourseBase> {
    try {
      const { saveCourseBaseCourseBases } = this.api;
      const res = await saveCourseBaseCourseBases(this.timetableId, courseBase);
      if (res.status !== 200) {
        throw new Error('Failed to add courseBase');
      }

      const addedCourseBase = res.data as CourseBase;

      return addedCourseBase;
    }
    catch(error) {
      this.showErrorDialog(error as AxiosError);

      console.error('Error adding courseBase:', (error as AxiosError).response);
      throw new Error('Failed to add courseBase');
    }    
  } 

  public async update(courseBase: CourseBase): Promise<CourseBase> {
    try {
      if(!courseBase.courseBaseId) {
        throw new Error('courseBaseId is required');
      }

      const { updateCourseBaseCoursebasesCourseBaseId } = this.api;
      const res = await updateCourseBaseCoursebasesCourseBaseId(this.timetableId, courseBase.courseBaseId, courseBase);
      if (res.status !== 200) {
        throw new Error('Failed to add courseBase');
      }

      const updatedCourseBase = res.data as CourseBase;
      // console.log('updatedCourseBase', updatedCourseBase);
      return updatedCourseBase;
    }
    catch(error) {
      this.showErrorDialog(error as AxiosError);

      console.error('Error adding courseBase:', (error as AxiosError).response);
      throw new Error('Failed to add courseBase');
    }    

    // return await this._repository.update(course);
  }

  public async deleteWithIds(courseBaseIds: string[]): Promise<void> {
    try {
      const { deleteCourseBaseCoursebases } = this.api;
      const res = await deleteCourseBaseCoursebases(this.timetableId,{ courseBaseIds });
      if (res.status !== 200) {
        throw new Error('Failed to delete courseBases');
      }
    }
    catch(error) {
      this.showErrorDialog(error as AxiosError);

      console.error('Error deleting courseBases:', (error as AxiosError).response);
      throw new Error('Failed to delete courseBases');
    }
    //return await this._repository.deleteWithIds(courseIds);
  }

  public async attachSimilarCourseConfId(courseBaseIds: string[], similarCourseConfId: string): Promise<void> {
    try {
      const { attachSimilarCourseCoursebases } = this.api;
      const res = await attachSimilarCourseCoursebases(this.timetableId, similarCourseConfId, { courseBaseIds });
      if (res.status !== 200) {
        throw new Error('Failed to attach similar courseBase conf');
      }

      const { courseBases } = (res.data as EmbeddedListResponse<CourseBase>)._embedded;
      this._model.courseBases = this._model.courseBases.map((courseBase: CourseBase) => {
        const updatedCourse = courseBases.find(c => c.courseBaseId === courseBase.courseBaseId);
        return updatedCourse ? updatedCourse : courseBase;
      });
    } catch (error) {
      console.error('Error attaching courseBase:', error);
      throw new Error('Failed to attach similar courseBase');
    }
  }

  public async detachSimilarCourseConfId(similarCourseConfId: string, courseBaseId: string): Promise<void> {
    try {
      const { detachSimilarCourseCoursebasesCourseBaseId } = this.api;
      const res = await detachSimilarCourseCoursebasesCourseBaseId(this.timetableId, similarCourseConfId, courseBaseId);
      if (res.status !== 200) {
        throw new Error('Failed to detach similar courseBase conf');
      }

      const { courseBases } = (res.data as EmbeddedListResponse<CourseBase>)._embedded;
      this._model.courseBases = this._model.courseBases.map((courseBase: CourseBase) => {
        const updatedCourse = courseBases.find(c => c.courseBaseId === courseBase.courseBaseId);
        return updatedCourse ? updatedCourse : courseBase;
      });
    } catch (error) {
      console.error('Error detaching courseBase:', error);
      throw new Error('Failed to detach similar courseBase');
    }
  }

  public async changeSequence(courseBaseId: string, updatedSortNo: number) {
    try {
      const { changeCourseBaseSequenceSequence } = this.api;
      const res = await changeCourseBaseSequenceSequence(this.timetableId, courseBaseId, { updatedSortNo });
      if (res.status !== 200) {
        throw new Error('Failed to change courseBase sequence');
      }

      const { courseBases } = (res.data as EmbeddedListResponse<CourseBase>)._embedded;
      this._model.courseBases = this._model.courseBases.map((courseBase: CourseBase) => {
        const updatedCourse = courseBases.find(c => c.courseBaseId === courseBase.courseBaseId);
        return updatedCourse ? updatedCourse : courseBase;
      });
    } catch (error) {
      console.error('Error changing courseBase sequence:', error);
      throw new Error('Failed to change courseBase sequence');
    }
  }

}