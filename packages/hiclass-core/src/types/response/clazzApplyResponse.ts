import {UUID} from "../common";
import {ClazzApplyStatus} from "../clazzApply";

export interface UpdateAppliesStatusResponse {
    _embedded : {
        updateResults: {
            /**
             * 신청서 양식 ID
             */
            applyId: UUID,
            /**
             * 결재 처리 결과. 성공: true, 실패: false
             */
            result: boolean,
            /**
             * 결재 처리 상태. 성공시 성공 상태. 실패시 이전 상태
             */
            applyStatus: ClazzApplyStatus,
            /**
             * 결재 처리 메시지. 성공: Success. 실패: 실패 사유
             */
            message: string
        }[]
    }
}