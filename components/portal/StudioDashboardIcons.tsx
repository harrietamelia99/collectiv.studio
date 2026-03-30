import type { ComponentType, SVGProps } from "react";

function DashIconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

/** At a glance / overview */
export function DashIconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
    </DashIconBase>
  );
}

export function DashIconTasks(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </DashIconBase>
  );
}

/** Inbox & comms hub (mail tray) */
export function DashIconInbox(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </DashIconBase>
  );
}

export function DashIconProjects(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </DashIconBase>
  );
}

/** New project / add */
export function DashIconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </DashIconBase>
  );
}

export function DashIconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </DashIconBase>
  );
}

export function DashIconProfile(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </DashIconBase>
  );
}

export function DashIconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </DashIconBase>
  );
}

export function DashIconReply(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </DashIconBase>
  );
}

export function DashIconImageText(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </DashIconBase>
  );
}

export function DashIconMessages(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </DashIconBase>
  );
}

export function DashIconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </DashIconBase>
  );
}

export function DashIconHelp(props: SVGProps<SVGSVGElement>) {
  return (
    <DashIconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </DashIconBase>
  );
}

const headingIconWrap = "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy";

export function StudioSectionIcon({
  Icon,
  className,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}) {
  return (
    <span className={`${headingIconWrap}${className ? ` ${className}` : ""}`}>
      <Icon className="h-5 w-5" />
    </span>
  );
}
