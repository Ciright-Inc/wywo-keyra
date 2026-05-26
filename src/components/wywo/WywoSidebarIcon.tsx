type IconName =
  | "dashboard"
  | "inbox"
  | "pending"
  | "sent"
  | "compose"
  | "rings"
  | "contacts"
  | "world"
  | "admin"
  | "invites"
  | "audit";

type Props = { name: string };

/** WYWO sidebar nav icons — matches AdminSidebarIcon stroke style (1.75, line). */
export function WywoSidebarIcon({ name }: Props) {
  return (
    <span className="ds-sidebar-icon" aria-hidden>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {renderIcon(name as IconName)}
      </svg>
    </span>
  );
}

function renderIcon(name: IconName) {
  switch (name) {
    case "dashboard":
      return (
        <>
          <rect x="4" y="4" width="7" height="9" rx="1.5" />
          <rect x="13" y="4" width="7" height="5" rx="1.5" />
          <rect x="4" y="15" width="7" height="5" rx="1.5" />
          <rect x="13" y="11" width="7" height="9" rx="1.5" />
        </>
      );
    case "inbox":
      return (
        <>
          <path d="M4 13l2-7a2 2 0 0 1 2-1.5h8a2 2 0 0 1 2 1.5l2 7" />
          <path d="M4 13v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4h-5l-1.5 2h-3L9 13H4z" />
        </>
      );
    case "pending":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
        </>
      );
    case "sent":
      return (
        <>
          <path d="m4 12 16-8-6 18-3-7-7-3z" />
          <path d="M11 13 20 4" />
        </>
      );
    case "compose":
      return (
        <>
          <path d="M4 20h16" />
          <path d="M4 16v4l4 0L20 8a2 2 0 0 0-4-4L4 16z" />
          <path d="m14 6 4 4" />
        </>
      );
    case "rings":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="6.5" />
          <circle cx="12" cy="12" r="9.5" />
        </>
      );
    case "contacts":
      return (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
        </>
      );
    case "world":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <path d="M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8c-2-2.2-3-4.9-3-8s1-5.8 3-8" />
        </>
      );
    case "admin":
      return (
        <>
          <path d="M12 3 5 6v6c0 4.1 3 7.4 7 9 4-1.6 7-4.9 7-9V6l-7-3z" />
          <path d="M9 12l2 2 4-4" />
        </>
      );
    case "invites":
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 7l9 7 9-7" />
        </>
      );
    case "audit":
      return (
        <>
          <path d="M12 8v4l3 2" />
          <path d="M3.5 12A8.5 8.5 0 1 0 12 3.5V6" />
          <path d="M3 3v3h3" />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="2" />;
  }
}
