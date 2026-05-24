import { ClazzSubscribeView } from "../clazz"
import { Links, Page } from "../common"

/**
 * 클래스 구독 목록 API 응답 전체 인터페이스
 */
export interface ClazzSubscribeViewListResponse {
    /**
     * 포함된 리소스
     */
    _embedded: ClazzSubscribeView[]
    /**
     * API 링크 정보
     */
    _links: Links
    /**
     * 페이지 정보
     */
    page: Page
  }