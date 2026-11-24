const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const paths = {
  flight: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  train: <><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 11h14M8 21l2-4M16 21l-2-4" /><circle cx="9" cy="14" r=".6" /><circle cx="15" cy="14" r=".6" /></>,
  bus: <><rect x="4" y="4" width="16" height="13" rx="2" /><path d="M4 11h16M7 17v3M17 17v3" /><circle cx="8" cy="14" r=".6" /><circle cx="16" cy="14" r=".6" /></>,
  cab: <><path d="M3 17h18M3 13l2-6h14l2 6v4H3z" /><circle cx="7.5" cy="17" r="1.6" /><circle cx="16.5" cy="17" r="1.6" /></>,
  bed: <><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.5" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.3a3.2 3.2 0 0 1 0 5.9M18 14.3c2 .8 3.4 2.8 3.4 5.2" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21z" /><circle cx="12" cy="9.500" r="2.500" /></>,
  compare: <path d="M4 7h11M4 12h16M4 17h8M18 5l2 2-2 2M15 15l2 2 3-3" />,
  route: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.500 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.500" /></>,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
};

export default function Icon({ name, size = 18, className = '' }) {
  return <svg {...base} width={size} height={size} className={className}>{paths[name] || paths.pin}</svg>;
}

export const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="m21.500 10.500-3.200 7.800-7.800 3.200 3.200-7.800z" fill="#e2603a" />
  </svg>
);
