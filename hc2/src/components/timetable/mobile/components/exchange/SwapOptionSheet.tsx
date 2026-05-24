import { useMemo } from 'react';
import { HiButton, HiBottomSheet } from '@/components/uiux/';

export type ChangeOption = {
   id: string;
   type: '1:1' | 'chain';
   itemTexts?: string[]; // UI 표시용 텍스트 (선택 사항)
};

/* ────────────────────────────────────────────────────────────
   바텀시트 — 교환 옵션 목록
──────────────────────────────────────────────────────────── */
interface SwapOptionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: ChangeOption) => void;
  exchangeOptions?: ChangeOption[]; // 1:1과 연쇄 교환 옵션을 합친 리스트
}

const SwapOptionSheet = ({
  isOpen,
  onClose,
  onSelect,
  exchangeOptions
}: SwapOptionSheetProps) => {
  
  const oneToOneOptions = useMemo(() => {
  return exchangeOptions?.filter(option => option.type === '1:1') || [];
  }, [exchangeOptions]);

  const chainOptions = useMemo(() => {
    return exchangeOptions?.filter(option => option.type === 'chain') || [];
  }, [exchangeOptions]);

  return (
    <HiBottomSheet isOpen={isOpen} onClose={onClose}>
      {oneToOneOptions.length === 0 && chainOptions.length === 0 && (
        <div className="flex flex-col gap-2 px-5">
          <div className="block h-12 w-full rounded text-left text-leading-b3 font-normal">교체 가능한 수업이 없습니다.</div>          
        </div>
      )}
      {/* 1:1 교환 */}
      {oneToOneOptions.length > 0 && (
      <div className="px-5">
        <p className="text-leading-h2 font-semibold mb-5">1:1 교환</p>
        <ul className="flex flex-col gap-2">
          {oneToOneOptions.map(option => (
            <li key={option.id}>
              <HiButton
                variant="secondary" block={true}
                className="min-h-12 !h-auto rounded px-4 !py-[15px] justify-start text-leading-b3 font-normal text-text-primary-base"
                onClick={() => onSelect(option)}
              >
                {option.itemTexts?.[0]}
              </HiButton>
            </li>
          ))}
        </ul>
      </div>)}
      {/* 연쇄교환 */}
      {chainOptions.length > 0 && (
      <div className="px-5 mt-8">
        <p className="text-leading-h2 font-semibold mb-5">연쇄교환</p>
        <ul className="flex flex-col gap-2">
          {chainOptions.map(option => (
            <li key={option.id}>
              <HiButton
                variant="secondary" block={true}
                className="min-h-12 !h-auto w-full rounded px-4 !py-[15px] text-leading-b3 font-normal text-text-primary-base flex-col items-start"
                onClick={() => onSelect(option)}
              >
                {option.itemTexts?.map((txt, i) => (
                  <div key={i} className="leading-b3 text-primary text-text-primary-base  font-normal">
                    {txt}
                  </div>
                ))}
              </HiButton>
            </li>
          ))}
        </ul>
      </div>
      )}
    </HiBottomSheet>
  );
}

export default SwapOptionSheet;