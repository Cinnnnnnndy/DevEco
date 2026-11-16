import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" {...props}>
      {props.children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4.2" {...stroke} />
      <path d="M10.2 10.2 13 13" {...stroke} />
    </Svg>
  );
}

export function IconFolder(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M1.5 4.5h4l1.2 1.5H14.5v7.2H1.5V4.5Z" {...stroke} />
    </Svg>
  );
}

export function IconFile(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 1.8h5.2L13 5.6v8.6H4V1.8Z" {...stroke} />
      <path d="M9 1.8v4h4" {...stroke} />
    </Svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <Svg {...props}>
      <title>采样</title>
      <path d="M5.2 3.8 11 8 5.2 12.2Z" fill="currentColor" />
    </Svg>
  );
}

export function IconCommit(props: IconProps) {
  return (
    <Svg {...props}>
      <title>采样</title>
      <path d="M2.5 8h5" {...stroke} />
      <circle cx="10.2" cy="8" r="2.1" {...stroke} />
    </Svg>
  );
}

export function IconBookmark(props: IconProps) {
  return (
    <Svg {...props}>
      <title>采样</title>
      <path d="M4.5 2.5h7v11L8 11.2 4.5 13.5Z" {...stroke} />
    </Svg>
  );
}

export function IconMore(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="4" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 4l8 8M12 4 4 12" {...stroke} />
    </Svg>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 8h9" {...stroke} />
    </Svg>
  );
}

export function IconSquare(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="9" height="9" rx="1" {...stroke} />
    </Svg>
  );
}

export function IconPreview(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="12" height="10" rx="1.2" {...stroke} />
      <path d="M8 3v10" {...stroke} />
    </Svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 7.2 8 2.8l5.5 4.4V13H10V9.2H6V13H2.5V7.2Z" {...stroke} />
    </Svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 3.2v9.6M3.2 8h9.6" {...stroke} />
    </Svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 3.5v9l7-4.5-7-4.5Z" {...stroke} />
    </Svg>
  );
}

export function IconBug(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="3" {...stroke} />
      <path d="M8 5V2.8M5.2 6.2 3.4 4.6M10.8 6.2l1.8-1.6M5.2 9.8 3.4 11.4M10.8 9.8l1.8 1.6" {...stroke} />
    </Svg>
  );
}

export function IconHammer(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 7 4.2 11.8M6 4.5l2.2-2.2 3.5 3.5L9.5 8" {...stroke} />
    </Svg>
  );
}

export function IconTerminal(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="12" height="10" rx="1.2" {...stroke} />
      <path d="M4.5 6.5 7 8.2 4.5 10M8.2 10.2H11" {...stroke} />
    </Svg>
  );
}
