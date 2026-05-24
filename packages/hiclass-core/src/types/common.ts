/**
 * 공통 타입 관련 정의
 * @fileoverview 여러 타입에서 공통적으로 쓰이는 타입을 해당 파일에서 정의합니다.
 */

/**
 * 링크 정보를 담는 인터페이스
 */
export interface Link {
    /**
     * 리소스 URL
     */
  href: string
}
  
  /**
   * API 응답의 링크 정보를 담는 인터페이스
   */
export interface Links {
    /**
     * 리소스 자신을 가리키는 링크
     */
    self: Link
    /**
     * 사용자와 관련된 링크
     */
    user?: Link
}

/**
 * 페이지 정보를 담는 인터페이스
 */
export interface Page {
  /**
   * 페이지 당 항목 수
   */
  size: number
  /**
   * 전체 항목 수
   */
  totalElements: number
  /**
   * 전체 페이지 수
   */
  totalPages: number
  /**
   * 현재 페이지 번호
   */
  number: number
}

export type UUID = string;