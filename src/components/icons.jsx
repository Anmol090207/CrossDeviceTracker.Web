function Svg({ children, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconClock({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M12 8v4.5l2.5 1.5" {...stroke} />
    </Svg>
  );
}

export function IconChart({ className }) {
  return (
    <Svg className={className}>
      <path d="M4 19h16" {...stroke} />
      <path d="M7 16V10" {...stroke} />
      <path d="M12 16V6" {...stroke} />
      <path d="M17 16v-4" {...stroke} />
    </Svg>
  );
}

export function IconPhone({ className }) {
  return (
    <Svg className={className}>
      <rect x="8" y="3" width="8" height="18" rx="2" {...stroke} />
      <path d="M11 18h2" {...stroke} />
    </Svg>
  );
}

export function IconLaptop({ className }) {
  return (
    <Svg className={className}>
      <rect x="5" y="5" width="14" height="10" rx="1.5" {...stroke} />
      <path d="M3.5 18h17" {...stroke} />
    </Svg>
  );
}

export function IconTablet({ className }) {
  return (
    <Svg className={className}>
      <rect x="6" y="3" width="12" height="18" rx="2" {...stroke} />
      <path d="M11 17.5h2" {...stroke} />
    </Svg>
  );
}

export function IconLayers({ className }) {
  return (
    <Svg className={className}>
      <path d="M12 4 4 8l8 4 8-4-8-4Z" {...stroke} />
      <path d="m4 12 8 4 8-4" {...stroke} />
      <path d="m4 16 8 4 8-4" {...stroke} />
    </Svg>
  );
}

export function IconTimeline({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M12 8v4h3" {...stroke} />
    </Svg>
  );
}

export function IconDownload({ className }) {
  return (
    <Svg className={className}>
      <path d="M12 4v10" {...stroke} />
      <path d="m8 10 4 4 4-4" {...stroke} />
      <path d="M5 19h14" {...stroke} />
    </Svg>
  );
}

export function IconSettings({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3" {...stroke} />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M4.8 6.2l1.6 1.6M17.6 16.2l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.8l1.6-1.6M17.6 7.8l1.6-1.6"
        {...stroke}
      />
    </Svg>
  );
}

export function IconChevron({ className }) {
  return (
    <Svg className={className}>
      <path d="m7 10 5 5 5-5" {...stroke} />
    </Svg>
  );
}

export function IconSync({ className }) {
  return (
    <Svg className={className}>
      <path d="M20 12a8 8 0 0 1-13.5 5.8" {...stroke} />
      <path d="M4 12a8 8 0 0 1 13.5-5.8" {...stroke} />
      <path d="M16 6h2.2V3.8" {...stroke} />
      <path d="M8 18H5.8v2.2" {...stroke} />
    </Svg>
  );
}

export function IconPlus({ className }) {
  return (
    <Svg className={className}>
      <path d="M12 6v12M6 12h12" {...stroke} />
    </Svg>
  );
}

export function IconInfo({ className }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M12 11v5" {...stroke} />
      <path d="M12 8h.01" {...stroke} />
    </Svg>
  );
}

export function IconCheck({ className }) {
  return (
    <Svg className={className}>
      <path d="m7 12.5 3.2 3.2L17 9" {...stroke} />
    </Svg>
  );
}

export function IconWifi({ className }) {
  return (
    <Svg className={className}>
      <path d="M5 10.5a10 10 0 0 1 14 0" {...stroke} />
      <path d="M8 13.2a6 6 0 0 1 8 0" {...stroke} />
      <path d="M12 17h.01" {...stroke} />
    </Svg>
  );
}

export function IconMenu({ className }) {
  return (
    <Svg className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" {...stroke} />
    </Svg>
  );
}

export function IconClose({ className }) {
  return (
    <Svg className={className}>
      <path d="m7 7 10 10M17 7 7 17" {...stroke} />
    </Svg>
  );
}

export function IconApp({ className }) {
  return (
    <Svg className={className}>
      <rect x="5" y="5" width="6" height="6" rx="1.2" {...stroke} />
      <rect x="13" y="5" width="6" height="6" rx="1.2" {...stroke} />
      <rect x="5" y="13" width="6" height="6" rx="1.2" {...stroke} />
      <rect x="13" y="13" width="6" height="6" rx="1.2" {...stroke} />
    </Svg>
  );
}

export function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <IconClock />
    </span>
  );
}

const FORM_ICONS = {
  mobile: IconPhone,
  desktop: IconLaptop,
  tablet: IconTablet,
};

export function FormFactorIcon({ formFactor, className }) {
  const Icon = FORM_ICONS[formFactor] || IconPhone;
  return <Icon className={className} />;
}
