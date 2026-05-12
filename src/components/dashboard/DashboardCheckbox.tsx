interface DashboardCheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export function DashboardCheckbox({ checked, onChange }: DashboardCheckboxProps) {
  return (
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
        checked
          ? "bg-primary border-primary shadow-[0_2px_6px_rgba(47,102,255,0.2)]"
          : "border-[var(--border)] bg-card hover:border-[var(--border-hover)]"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="block animate-in zoom-in-50 duration-200">
          <path
            d="M1.5 4L4 6.5L8.5 1.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
