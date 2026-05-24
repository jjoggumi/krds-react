import React, { useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { HiButton } from './index';
import clsx from 'clsx';

export interface KebabMenuItem {
  icon?: React.ReactNode;
  label: string;
  onClick: (event?: any) => void;
  className?: string;
}

interface KebabMenuProps {
  items: KebabMenuItem[];
  triggerIcon?: React.ReactNode;
  className?: string;
  /** 클릭 이벤트에서 event.stopPropagation()을 자동으로 호출할지 여부 (기본값: true) */
  isPreventEventPropagation?: boolean;
  /** 메뉴 open 상태 변경 알림 */
  onOpenChange?: (isOpen: boolean) => void;
}

export function KebabMenu({ items, triggerIcon, className, isPreventEventPropagation = true, onOpenChange }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className={clsx('relative inline-block', className)}>
        <HiButton
          variant="link"
          size="sm"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            //console.log('KebabMenu 트리거 클릭', event);
            if (isPreventEventPropagation) {
              event?.stopPropagation();
            }
            setOpen((prev) => {
              const next = !prev;
              onOpenChange?.(next);
              return next;
            });
          }}
          aria-expanded={open}
        >
          {triggerIcon ?? (
            <EllipsisVertical size={21} strokeWidth={1.6} className="stroke-text-neutral-strong" />
          )}
        </HiButton>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={(event) => {
              //console.log('KebabMenu 배경 클릭', event);
              if (isPreventEventPropagation) {
                event?.stopPropagation();
              }
              closeMenu();
            }} />
            <div className="absolute right-0 top-full mt-2 z-20 bg-bg-base border border-border-neutral-base rounded-md shadow-xl min-w-40 overflow-hidden">
              {items.map((item, idx) => (
                  <HiButton variant="link" size="sm"
                    key={idx}
                    type="button"
                    className={clsx(
                        'w-full flex items-center gap-3 p-4 text-left',
                        item.className
                    )}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        //console.log('KebabMenu 아이템 클릭', event);
                        if (isPreventEventPropagation) {
                          event?.stopPropagation();
                        }
                        closeMenu();
                        item.onClick(event);
                    }}
                  >
                    {item.icon && (
                        <span className="w-5 h-5 flex items-center justify-center">
                          {item.icon}
                        </span>
                    )}
                    <span className="flex-1 truncate text-leading-b3">{item.label}</span>
                  </HiButton>
              ))}
            </div>            
          </>
        )}
    </div>
  );
}
