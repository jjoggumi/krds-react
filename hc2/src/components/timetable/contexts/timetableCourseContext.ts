import {Course} from "../core/types";
import TimetableContextBase from "./timetableContextBase";
import {EmbeddedListResponse} from "../common/types";
import {AxiosError} from "axios";

export default class TimetableCourseContext extends TimetableContextBase<Course> {
  private static _instance: TimetableCourseContext;

  public constructor() {
    super();

    this._model = [] as Course[];
  }

  public static getInstance(): TimetableCourseContext {
    if (!TimetableCourseContext._instance) {
      TimetableCourseContext._instance = new TimetableCourseContext();
    }

    return TimetableCourseContext._instance;
  }

  get courses(): Course[] {
    return this._model;
  }

  get courseMap(): Record<string, Course> {

    return this.courses?.reduce((acc: Record<string, Course>, course: Course) => {
      acc[course.courseId] = course;
      return acc;
    }, {} as Record<string, Course>) || ({} as Record<string, Course>);
  }

  get coursesOfLesson(): Course[] {
    return this.courses.filter(
      (course: Course) => !(course.isConcurrent || course.isUnified)
    );
  }

    public addItem(course: Course): void {
    this._model.push(course);
  }

  public removeByIds(courseIds: string[]): void {
    this._model = this._model.filter(
      (course: Course) => !courseIds.includes(course.courseId)
    );
  }

  public replace(courses: Course[]): void {
    this._model = this._model.map((course: Course) => {
      const updatedCourse = courses.find(c => c.courseId === course.courseId);
      return updatedCourse ? updatedCourse : course;
    });
  }
  
  public async fetch(): Promise<void> {
    try {
      const { getTimetableCoursesCourses } = this.api;
      const res = await getTimetableCoursesCourses(this.timetableId);

      if (res.status !== 200) {
        throw new Error('Failed to fetch courses');
      }

      const { courses } = (res.data as EmbeddedListResponse<Course>)._embedded;
      this._model = courses;
      
      this.notifyListeners();
    }
    catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  public async add(course: Course): Promise<Course> {
    try {
      const { saveCourseCourses } = this.api;
      const res = await saveCourseCourses(this.timetableId, course);
      if (res.status !== 200) {
        throw new Error('Failed to add course');
      }

      const addedCourse = res.data as Course;

      return addedCourse;
    }
    catch(error) {
      this.showErrorDialog(error as AxiosError);

      console.error('Error adding course:', (error as AxiosError).response);
      throw new Error('Failed to add course');
    }    
  }

  public async update(course: Course): Promise<Course> {
    try {
      if(!course.courseId) {
        throw new Error('courseId is required');
      }

      const { updateCourseCoursesCourseId } = this.api;
      const res = await updateCourseCoursesCourseId(this.timetableId, course.courseId, course);
      if (res.status !== 200) {
        throw new Error('Failed to add course');
      }

      const updatedCourse = res.data as Course;
      // console.log('updatedCourse', updatedCourse);
      return updatedCourse;
    }
    catch(error) {
      this.showErrorDialog(error as AxiosError);

      console.error('Error adding course:', (error as AxiosError).response);
      throw new Error('Failed to add course');
    }    

    // return await this._repository.update(course);
  }

  public async deleteWithIds(courseIds: string[]): Promise<void> {
    try {
      const { deleteCourseCourses } = this.api;
      const res = await deleteCourseCourses(this.timetableId,{ courseIds });
      if (res.status !== 200) {
        throw new Error('Failed to delete courses');
      }
    }
    catch(error) {
      this.showErrorDialog(error as AxiosError);

      console.error('Error deleting courses:', (error as AxiosError).response);
      throw new Error('Failed to delete courses');
    }
    //return await this._repository.deleteWithIds(courseIds);
  }

  public async addUnifiedCourse(courseName: string) {
    try {
      const { createUnifiedCourseUnifiedcourse } = this.api;
      const res = await createUnifiedCourseUnifiedcourse(this.timetableId, { 
        displayedTitle: courseName,
      });

      if (res.status !== 200) {
        throw new Error('Failed to add unified course');
      }

      const addedCourse = res.data as Course;
      this._model.push(addedCourse);

      this.notifyListeners();
      
      return addedCourse;
    }
    catch (error) {
      console.error('Error adding unified course:', (error as AxiosError).response);
      throw new Error('Failed to add unified course');
    }
  }
  
  public async addConcurrentCourse(course: Course) {
    course.isConcurrent = true;
    course.isUnified = false;
    course.isDoubleTeacher = false;
    course.similarCourseConfId = '';

    return await this.add(course);
  }

  public async attachSimilarCourseConfId(courseIds: string[], similarCourseConfId: string): Promise<void> {
    try {
      const { attachSimilarCourseCourses } = this.api;
      const res = await attachSimilarCourseCourses(this.timetableId, similarCourseConfId, { courseIds });
      if (res.status !== 200) {
        throw new Error('Failed to attach similar course conf');
      }

      const { courses } = (res.data as EmbeddedListResponse<Course>)._embedded;
      this._model = this._model.map((course: Course) => {
        const updatedCourse = courses.find(c => c.courseId === course.courseId);
        return updatedCourse ? updatedCourse : course;
      });

      this.notifyListeners();
    } catch (error) {
      console.error('Error attaching course:', error);
      throw new Error('Failed to attach similar course');
    }
  }

  public async detachSimilarCourseConfId(similarCourseConfId: string, courseId: string): Promise<void> {
    try {
      const { detachSimilarCourseCoursesCourseId } = this.api;
      const res = await detachSimilarCourseCoursesCourseId(this.timetableId, similarCourseConfId, courseId);
      if (res.status !== 200) {
        throw new Error('Failed to detach similar course conf');
      }

      const { courses } = (res.data as EmbeddedListResponse<Course>)._embedded;
      this._model = this._model.map((course: Course) => {
        const updatedCourse = courses.find(c => c.courseId === course.courseId);
        return updatedCourse ? updatedCourse : course;
      });

      this.notifyListeners();
    } catch (error) {
      console.error('Error detaching course:', error);
      throw new Error('Failed to detach similar course');
    }
  }

  public async changeSequence(courseId: string, updatedSortNo: number) {
    try {
      const { changeSequenceSequence } = this.api;
      const res = await changeSequenceSequence(this.timetableId, courseId, { updatedSortNo });
      if (res.status !== 200) {
        throw new Error('Failed to change course sequence');
      }

      const { courses } = (res.data as EmbeddedListResponse<Course>)._embedded;
      this._model = this._model.map((course: Course) => {
        const updatedCourse = courses.find(c => c.courseId === course.courseId);
        return updatedCourse ? updatedCourse : course;
      });

      this.notifyListeners();
    } catch (error) {
      console.error('Error changing course sequence:', error);
      throw new Error('Failed to change course sequence');
    }
  }
}