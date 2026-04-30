import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconShieldCheck({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z" />
      <path d="M8.4 12.4 10.6 14.6 15.6 9.6" />
    </svg>
  );
}

export function IconSpark({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M12 2l1.2 4.4L18 8l-4.8 1.6L12 14l-1.2-4.4L6 8l4.8-1.6L12 2Z" />
      <path d="M5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14Z" />
    </svg>
  );
}

export function IconDevices({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M7 6h10a2 2 0 0 1 2 2v6H5V8a2 2 0 0 1 2-2Z" />
      <path d="M8 18h8" />
      <path d="M10 14v4" />
      <path d="M14 14v4" />
    </svg>
  );
}

export function IconPhone({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M22 16.9v2a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 4.2 2 2 0 0 1 5.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9Z" />
    </svg>
  );
}

