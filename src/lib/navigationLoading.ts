export interface NavigationLoadingState {
  title: string;
  steps: string[];
}

const STORAGE_KEY = "workflowNavigationLoading";
const EVENT_NAME = "workflow-navigation-loading";

export function readNavigationLoading(): NavigationLoadingState | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NavigationLoadingState;
  } catch {
    return null;
  }
}

export function startNavigationLoading(state: NavigationLoadingState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function stopNavigationLoading() {
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeNavigationLoading(listener: () => void) {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
