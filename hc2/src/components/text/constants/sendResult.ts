import { DisplayStatus } from "../types";

export const STATUS_DOT_COLOR: Record<DisplayStatus, { color :string; label: string }> = {
      [DisplayStatus.RESERVED]: { color: 'primary', label : '예약'},
      [DisplayStatus.CANCELED]: { color: 'gray', label : '예약취소'},
      [DisplayStatus.PENDING]: { color: 'orange', label : '발송대기'},
      [DisplayStatus.SENT]: { color: 'orange', label : '발송 중'},
      [DisplayStatus.COMPLETED]: { color: 'success', label : '처리완료'},
      [DisplayStatus.FAILED]: { color: 'warning', label : '처리실패'},
};