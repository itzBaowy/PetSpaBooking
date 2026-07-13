import { cn } from "@/lib/utils";

type IconType = "bell" | "user" | "activity" | "logout" | "send";

export function TopbarIcon({ type }: { type: IconType }) {
  const paths: Record<IconType, string> = {
    bell:
      "M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h11Zm0 0a3 3 0 1 1-6 0",
    user:
      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    activity: "M3 3v18h18M7 15l3-3 3 2 5-6",
    logout:
      "m10 17 5-5-5-5m5 5H3m11-9h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5",
    send: "M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z",
  };

  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[type]} />
    </svg>
  );
}

export function TopbarChevron({ open }: { open: boolean }) {
  return (
    <svg className={cn("h-4 w-4 transition-transform", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
    </svg>
  );
}
