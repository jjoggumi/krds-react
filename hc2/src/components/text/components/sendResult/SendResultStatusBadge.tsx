import moment from "moment";
import { STATUS_DOT_COLOR } from "../../constants";
import { DisplayStatus } from "../../types";
import { HiButton } from "@/components/uiux";

interface Props {
   value: DisplayStatus;
   reservedTimestamp: number; 
   forceLabel: boolean;
   onCancel?: () => void;     
}

export const SendResultStatusBadge = ({value, reservedTimestamp, forceLabel, onCancel}: Props) => {
   const dotColor = STATUS_DOT_COLOR[value]?.color;
   const label = STATUS_DOT_COLOR[value]?.label;
   const dot = dotColor ? (
      <span className={`inline-block align-middle rounded-full w-2 h-2 mr-1.5 bg-${dotColor}`} />
   ) : null;

   if (forceLabel === false && value === DisplayStatus.RESERVED) {
      const now = moment();
      const nowMinute = moment(now).startOf('minute');
      const reservedMinute = moment(reservedTimestamp).startOf('minute');
      const diff = reservedMinute.diff(nowMinute, 'minutes');

      if(diff < 5) {
         return <>{dot}{label} 
            {<HiButton size="xs" variant="tertiary" disabled className="ml-2 h-6 !px-2 text-d2" >취소불가</HiButton>}
            </>;
      } else {
         return <>{dot}{label} 
            <HiButton size="xs" variant="tertiaryBlue" className="ml-2 h-6 !px-2 text-d2" onClick={onCancel}>예약취소</HiButton>
            </>;  
      }
   }
   return <>{dot}{label}</>;
};