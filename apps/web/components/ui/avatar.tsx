import { cn } from "@/lib/utils";

export type AvatarSize = "list" | "profile" | "topbar";

const sizeStyles: Record<AvatarSize, string> = {
  list: "h-10 w-10 rounded-full text-sm",
  profile: "h-56 w-56 rounded-full text-4xl",
  topbar: "h-8 w-8 rounded-lg text-sm",
};

export function getAvatarInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({
  src,
  alt,
  fallback,
  size = "list",
  editable = false,
  loading = false,
  onEdit,
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: AvatarSize;
  editable?: boolean;
  loading?: boolean;
  onEdit?: () => void;
  className?: string;
}) {
  const getFullSrc = (url?: string | null) => {
    if (!url) return undefined;
    const normalizedUrl = url.trim();
    if (
      !normalizedUrl ||
      /(?:^|\/)default[-_]?avatar(?:\.[a-z0-9]+)?(?:\?.*)?$/i.test(normalizedUrl)
    ) {
      return undefined;
    }
    if (
      normalizedUrl.startsWith("http://") ||
      normalizedUrl.startsWith("https://") ||
      normalizedUrl.startsWith("data:") ||
      normalizedUrl.startsWith("blob:")
    ) {
      return normalizedUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;
    return `${cleanBase}${cleanPath}`;
  };

  const fullSrc = getFullSrc(src);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center bg-brand font-bold text-brand-foreground shadow-sm",
        sizeStyles[size],
        className,
      )}
    >
      {fallback}
      {fullSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fullSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
          onError={(event) => event.currentTarget.remove()}
        />
      ) : null}

      {editable && (
        <button
          type="button"
          aria-label="Đổi ảnh đại diện"
          disabled={loading}
          onClick={onEdit}
          className="absolute bottom-[4%] right-[4%] grid h-12 w-12 place-items-center rounded-full border-4 border-surface bg-slate-700 text-white shadow-lg transition hover:bg-slate-600 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <CameraIcon />
          )}
        </button>
      )}
    </span>
  );
}

function CameraIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
