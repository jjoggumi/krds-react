import { Hc2Timetables } from "../../apis";
import { Core, PageResponse } from "../types";
import qs from 'qs';

const size = 10;
const lessonChangeTypes = [
    Core.TimetableDailyLessonChangeType.Addition,
    Core.TimetableDailyLessonChangeType.Adjustment, 
    Core.TimetableDailyLessonChangeType.Exchange,
    Core.TimetableDailyLessonChangeType.Replacement
];
/// page 0 부터 시작
export const getChangeHistoryPendingData = async (timetableId: string, page: number) => {
    console.log('Fetching pending change history data', { timetableId, page });
    if (!timetableId || page < 0) {
        const empty: Core.TimetableLessonChange[] = [];
        return {
            histories: empty,
            page: {
                number: page,
                size,
                totalElements: 0,
                totalPages: 0,
            }
        };
    }
    
    const api = new Hc2Timetables();
    const queryParams = {
      changeType: Core.TimetableLessonChangeType.Lesson,
      lessonChangeTypes: lessonChangeTypes,
      statuses: [Core.TimetableLessonChangeStatus.Pending],
      page: page,
      size: size,
      sort: 'requestedTimestamp,desc',
    };
    const res = await api.getMyLessonChangesRequestsMyrequests(
        timetableId,
        // @ts-ignore
        queryParams,
        { paramsSerializer: (params: any) => qs.stringify(params, {arrayFormat: 'repeat'})}
        );
    const response = (res.data as PageResponse<Core.TimetableLessonChange>);
    const histories = response._embedded ? response._embedded.lessonChanges : [];
    
    return {
        histories,
        page: response.page,
    };
}

/// page 0 부터 시작
export const getChangeHistoryCompletedData = async (timetableId: string, page: number) => {
    console.log('Fetching completed change history data', { timetableId, page });
    if (!timetableId || page < 0) {
        const empty: Core.TimetableLessonChange[] = [];
        return {
            histories: empty,
            page: {
                number: page,
                size,
                totalElements: 0,
                totalPages: 0,
            }
        };
    }
    
    const api = new Hc2Timetables();
    const queryParams = {
      changeType: Core.TimetableLessonChangeType.Lesson,
      lessonChangeTypes: lessonChangeTypes,
      statuses: [Core.TimetableLessonChangeStatus.Completed],
      page: page,
      size: size,
      sort: 'requestedTimestamp,desc',
    };
    const res = await api.getMyLessonChangesRequestsMyrequests(
        timetableId,
        // @ts-ignore
        queryParams,
        { paramsSerializer: (params: any) => qs.stringify(params, {arrayFormat: 'repeat'})}
        );
    const response = (res.data as PageResponse<Core.TimetableLessonChange>);
    const histories = response._embedded ? response._embedded.lessonChanges : [];
    
    return {
        histories,
        page: response.page,
    };
} 

/// page 0 부터 시작
export const getChangeHistoryCancelledData = async (timetableId: string, page: number) => {
    console.log('Fetching cancelled change history data', { timetableId, page });
    if (!timetableId || page < 0) {
        const empty: Core.TimetableLessonChange[] = [];
        return {
            histories: empty,
            page: {
                number: page,
                size,
                totalElements: 0,
                totalPages: 0,
            }
        };
    }
    
    const api = new Hc2Timetables();
    const queryParams = {
        changeType: Core.TimetableLessonChangeType.Lesson,
        lessonChangeTypes: lessonChangeTypes,
        statuses: [Core.TimetableLessonChangeStatus.Rejected,
            Core.TimetableLessonChangeStatus.Ignored, 
            Core.TimetableLessonChangeStatus.Canceled, 
            Core.TimetableLessonChangeStatus.Recovered],
        page: page,
        size: size,
        sort: 'requestedTimestamp,desc',
    };
    const res = await api.getMyLessonChangesRequestsMyrequests(
        timetableId,
        // @ts-ignore
        queryParams,
        { paramsSerializer: (params: any) => qs.stringify(params, {arrayFormat: 'repeat'})}
        );
    const response = (res.data as PageResponse<Core.TimetableLessonChange>);
    const histories = response._embedded ? response._embedded.lessonChanges : [];
    
    return {
        histories,
        page: response.page,
    };
} 

export const requestCancelLessonChange = async (timetableId: string, lessonChangeId: string, reason?: string) => {
    const api = new Hc2Timetables();
    const payload = {
        status: Core.TimetableLessonChangeStatus.Canceled,
        reason: reason,
    }
    await api.requestToPatchLessonChangeStatusAndReasonStatusandreason(
        timetableId,
        lessonChangeId,
        payload,
    );
}
/** Pending 상태의 변경 수업 사유 업데이트 */
export const updateReasonPendingLessonChange = async (timetableId: string, lessonChangeId: string, reason: string) => {
    const api = new Hc2Timetables();
    const payload = {
        status: Core.TimetableLessonChangeStatus.Pending,
        reason: reason,
    }
    await api.requestToPatchLessonChangeStatusAndReasonStatusandreason(
        timetableId,
        lessonChangeId,
        payload,
    );
}

export const getLessonChangeHistoryDetail = async (timetableId: string, lessonChangeId: string) => {
    const api = new Hc2Timetables();
    const res = await api.getLessonChangeDetailsLessonchangedetailsLessonChangeId(timetableId, lessonChangeId);
    
    return res.data as { 
        details: Core.TimetableLessonChangeDetail[], 
        dailyLessons: Core.DailyLesson[],
        basicLessons: Core.DailyLesson[],
        lessonChangeId: string,
        status: string,
        statusUpdatedTimestamp?: number,
        statusUpdatedName?: string,
        changeType: Core.TimetableLessonChangeType,
        lessonChangeType: Core.TimetableDailyLessonChangeType, 
        reason?: string,
        approvedTimestamp?: number,
        approvedUserName?: string,
    };
}