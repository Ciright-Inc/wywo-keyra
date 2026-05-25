type IconName =
  | "public"
  | "category"
  | "footer"
  | "grid_view"
  | "layers"
  | "language"
  | "cell_tower"
  | "apps"
  | "perm_media"
  | "folder"
  | "dns"
  | "shield"
  | "inbox"
  | "group"
  | "history";

type Props = {
  name: string;
};

/** Sidebar nav icons — inline SVG avoids Material Symbols FOUT showing ligature names as text. */
export function AdminSidebarIcon({ name }: Props) {
  return (
    <span className="ds-sidebar-icon" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {renderIcon(name as IconName)}
      </svg>
    </span>
  );
}

function renderIcon(name: IconName) {
  switch (name) {
    case "public":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8c-2-2.2-3-4.9-3-8s1-5.8 3-8" />
        </>
      );
    case "category":
      return (
        <>
          <path d="M4 7h7v7H4zM13 7h7v4h-7zM13 13h7v7h-7zM4 16h7v4H4z" />
        </>
      );
    case "footer":
      return (
        <>
          <rect x="4" y="4" width="16" height="16" rx="1.5" />
          <path d="M4 14h16" />
          <path d="M7 17h3M14 17h3" />
        </>
      );
    case "grid_view":
      return (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </>
      );
    case "layers":
      return (
        <>
          <path d="M12 4 4 8.5 12 13l8-4.5L12 4z" />
          <path d="m4 12.5 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
        </>
      );
    case "language":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16M12 4a14 14 0 0 1 0 16M12 4a14 14 0 0 0 0 16" />
        </>
      );
    case "cell_tower":
      return (
        <>
          <path d="M12 3v3" />
          <path d="M8 21h8" />
          <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
          <path d="M6.5 9.5 12 15l5.5-5.5M4 7l8 8 8-8" />
        </>
      );
    case "apps":
      return (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </>
      );
    case "perm_media":
      return (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <path d="m4 17 5-5 4 4 3-3 4 4" />
        </>
      );
    case "folder":
      return (
        <>
          <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
          <path d="M8 12h8M8 15h6" />
        </>
      );
    case "dns":
      return (
        <>
          <rect x="4" y="5" width="16" height="5" rx="1" />
          <rect x="4" y="14" width="16" height="5" rx="1" />
          <path d="M7 7.5h.01M7 16.5h.01" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3 5 6v6c0 4.1 3 7.4 7 9 4-1.6 7-4.9 7-9V6l-7-3z" />
        </>
      );
    case "inbox":
      return (
        <>
          <path d="M4 6h16v12H4z" />
          <path d="M4 10h4l2 3h4l2-3h4" />
        </>
      );
    case "group":
      return (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16.5" cy="9.5" r="2.5" />
          <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M14.5 19c0-2 1.5-3.7 3.5-4.5" />
        </>
      );
    case "history":
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
