import { useEffect, useRef } from "react";

/**
 * 일정 주기로 fn을 반복 실행한다.
 * enabled가 false이면 인터벌을 설정하지 않는다.
 * fn은 ref로 관리하므로 최신 클로저를 항상 참조한다.
 */
export function useAutoRefresh(
  fn: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      void fnRef.current();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs]);
}