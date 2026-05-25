"use client";

type Props = {
  onSelect: (path: "email" | "calendar") => void;
};

export function ConsultationPathCards({ onSelect }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect("email")}
        className="group keyra-card keyra-home-card--lift flex flex-col border-keyra-border/80 p-6 text-left transition hover:border-keyra-text/25"
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-keyra-muted">
          Option 1
        </span>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-keyra-primary">
          Send a Consultation Request
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-keyra-muted">
          Submit your details and consultation objectives. A Keyra advisor will
          review your request and respond with the appropriate next step.
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-keyra-primary">
          Send Request
          <span
            className="transition group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </span>
        <p className="mt-3 text-[11px] text-keyra-muted/80">
          Powered by contact.keyra.ie
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelect("calendar")}
        className="group keyra-card keyra-home-card--lift flex flex-col border-keyra-border/80 bg-keyra-surface p-6 text-left transition hover:border-keyra-text/25"
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-keyra-muted">
          Option 2
        </span>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-keyra-primary">
          Schedule a Video Consultation
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-keyra-muted">
          Select an available date and time for a secure Keyra video consultation.
          A calendar invitation and secure video room link will be sent
          automatically.
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-keyra-primary">
          Schedule Video Call
          <span
            className="transition group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </span>
        <p className="mt-3 text-[11px] text-keyra-muted/80">
          mycalendar.ciright.com · ve.keyra.ie
        </p>
      </button>
    </div>
  );
}
