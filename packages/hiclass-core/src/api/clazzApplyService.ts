import {Patch} from "./axios-client";
import {ClazzApplyStatus, UpdateAppliesStatusResponse, UUID} from "../types";

export const updateClazzAppliesStatus = async (
    clazzApplyIds: UUID[],
    clazzApplyStatus: ClazzApplyStatus,
    reportUserName = ""
) => {
    const response  = await Patch<UpdateAppliesStatusResponse>('/updateAppliesStatus', {
        applyIds: clazzApplyIds,
        applyStatus: clazzApplyStatus,
        reportUserName,
    })
    return response.data
}

export const updateClazzApplyStatus = async (clazzApplyId: UUID, clazzApplyStatus: ClazzApplyStatus) => {
    await Patch(
        `/clazzApplies/${clazzApplyId}/applyStatuses`, undefined, {
            params: {
                applyStatus: clazzApplyStatus
            }
        }
    )
}

// 하이 클래스 투약 의뢰서는 해당 API로 보내야 함
export const updateMedicationOrderStatus = async (clazzApplyId: UUID, clazzApplyStatus: ClazzApplyStatus, reportUserName?:string, memo?: string, dosageTimestamp?: number) => {
    const body: Record<string, string | number> = {
        applyStatus: clazzApplyStatus,
    }

    if (clazzApplyStatus == ClazzApplyStatus.COMPLETE) {
        body.reportUserName = reportUserName || ''
        body.memo = dosageTimestamp || ''
        body.dosageTimestamp = dosageTimestamp || new Date().getTime()
    }

    await Patch(`/clazzApplies/${clazzApplyId}/applyStatus/medicationOrder`, body)
}

