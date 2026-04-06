import { useState } from "react";

interface UseModalResult<T> {
  isOpen: boolean;
  item: T | null;
  open: (item: T) => void;
  close: () => void;
}

/**
 * 모달 open/close 상태와 선택된 아이템을 관리한다.
 * item이 null이면 모달이 닫힌 상태를 의미한다.
 */
export function useModal<T>(): UseModalResult<T> {
  const [item, setItem] = useState<T | null>(null);

  return {
    isOpen: item !== null,
    item,
    open: (newItem: T) => setItem(newItem),
    close: () => setItem(null),
  };
}
