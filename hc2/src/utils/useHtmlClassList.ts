import { useEffect } from "react";

type CounterMap = Record<string, number>;

declare global {
  // eslint-disable-next-line no-var
  var __hc2HtmlClassRefCount: CounterMap | undefined;
}

function getCounterMap(): CounterMap {
  if (!globalThis.__hc2HtmlClassRefCount) {
    globalThis.__hc2HtmlClassRefCount = {};
  }
  return globalThis.__hc2HtmlClassRefCount;
}

function makeKey(classes: readonly string[]): string {
  // add/remove 시에는 배열 순서가 중요하지만,
  // ref-count 키는 순서가 달라도 동일하게 취급되도록 안정적인 키가 필요합니다.
  return [...classes].sort().join("|");
}

/**
 * 컴포넌트가 마운트되어 있는 동안 <html>에 class를 추가합니다.
 * 같은 class 묶음을 여러 컴포넌트에서 동시에 요청하더라도,
 * 마지막 컴포넌트가 언마운트될 때에만 class를 제거하도록(ref-count) 동작합니다.
 */
export function useHtmlClassList(classes: readonly string[]): void {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const classArray = [...classes];
    const key = makeKey(classArray);
    const counter = getCounterMap();

    counter[key] = (counter[key] ?? 0) + 1;
    if (counter[key] === 1) {
      document.documentElement.classList.add(...classArray);
    }

    return () => {
      counter[key] = (counter[key] ?? 1) - 1;
      if (counter[key] <= 0) {
        delete counter[key];
        document.documentElement.classList.remove(...classArray);
      }
    };
    // 이 훅은 class 목록을 불변(마운트 시 1회 설정)으로 보고 동작합니다.
    // class가 동적으로 바뀌는 케이스가 필요하면 API를 별도로 설계하는 쪽이 안전합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
