import type { LangCode } from "@/config/languages";

const FLAGS: Record<LangCode, React.ReactElement> = {
  pt: (
    <svg viewBox="0 0 60 42" xmlns="http://www.w3.org/2000/svg" aria-label="Brazilian flag">
      <rect width="60" height="42" fill="#009b3a" />
      <polygon points="30,4 56,21 30,38 4,21" fill="#fedd00" />
      <circle cx="30" cy="21" r="9" fill="#002776" />
      <path
        d="M21,21 a 9,9 0 0 1 18,0"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        transform="rotate(180 30 21) translate(0 -2)"
      />
    </svg>
  ),
  nl: (
    <svg viewBox="0 0 60 42" xmlns="http://www.w3.org/2000/svg" aria-label="Dutch flag">
      <rect width="60" height="14" fill="#ae1c28" />
      <rect y="14" width="60" height="14" fill="#fff" />
      <rect y="28" width="60" height="14" fill="#21468b" />
    </svg>
  ),
};

export function Flag({ code, className = "h-4 w-6" }: { code: LangCode; className?: string }) {
  return (
    <span className={`inline-block overflow-hidden rounded-sm ring-1 ring-black/5 ${className}`}>
      {FLAGS[code]}
    </span>
  );
}
