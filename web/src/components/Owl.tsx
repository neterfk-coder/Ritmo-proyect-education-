/**
 * The companion, drawn rather than illustrated.
 *
 * It is built from the same geometry as the rest of the interface — circles,
 * soft rectangles, one accent — so it reads as part of the product and not as
 * a sticker dropped on top of it. It takes its colours from the active theme,
 * which means it works in Calm, Dark and High contrast without a second asset.
 *
 * It blinks. Nothing else about it moves on its own: something that bobs in the
 * corner of the eye competes with the step for attention, and the step wins.
 */
export function Owl({
  size = 44,
  awake = true,
  className = "",
}: {
  size?: number;
  /** Asleep closes the eyes — used when the companion is muted. */
  awake?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="owl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-surface))" />
          <stop offset="100%" stopColor="rgb(var(--c-raised))" />
        </linearGradient>
      </defs>

      {/* Ear tufts */}
      <path
        d="M17 20 L13.5 7.5 L26 13.5 Z"
        fill="rgb(var(--c-pine))"
        stroke="rgb(var(--c-pine))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M47 20 L50.5 7.5 L38 13.5 Z"
        fill="rgb(var(--c-pine))"
        stroke="rgb(var(--c-pine))"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Body */}
      <path
        d="M32 9 C 17.5 9, 9 20, 9 33.5 C 9 48.5, 19 58, 32 58 C 45 58, 55 48.5, 55 33.5 C 55 20, 46.5 9, 32 9 Z"
        fill="url(#owl-body)"
        stroke="rgb(var(--c-pine))"
        strokeWidth="2.4"
      />

      {/* Chest — three light strokes, enough to read as feathers */}
      <g stroke="rgb(var(--c-line))" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M25 45 q7 5 14 0" />
        <path d="M27 51 q5 3.5 10 0" />
      </g>

      {/* Wings */}
      <path
        d="M12 31 C 8.5 39, 10.5 49, 16.5 53"
        fill="none"
        stroke="rgb(var(--c-pine))"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M52 31 C 55.5 39, 53.5 49, 47.5 53"
        fill="none"
        stroke="rgb(var(--c-pine))"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Eyes. The group scales on Y to blink, from its own centre. */}
      <g className={awake ? "owl-eyes" : undefined}>
        <circle cx="23.5" cy="29" r="8.6" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-pine))" strokeWidth="2.2" />
        <circle cx="40.5" cy="29" r="8.6" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-pine))" strokeWidth="2.2" />
        {awake ? (
          <>
            <circle cx="24.6" cy="29.6" r="3.6" fill="rgb(var(--c-ink))" />
            <circle cx="41.6" cy="29.6" r="3.6" fill="rgb(var(--c-ink))" />
            {/* The highlight is what makes it look awake rather than drawn. */}
            <circle cx="26.1" cy="27.9" r="1.15" fill="rgb(var(--c-surface))" />
            <circle cx="43.1" cy="27.9" r="1.15" fill="rgb(var(--c-surface))" />
          </>
        ) : (
          <g stroke="rgb(var(--c-ink))" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19.5 29.5 q4 3.4 8 0" fill="none" />
            <path d="M36.5 29.5 q4 3.4 8 0" fill="none" />
          </g>
        )}
      </g>

      {/* Beak */}
      <path
        d="M32 35.5 L28.2 41.5 L32 45.2 L35.8 41.5 Z"
        fill="rgb(var(--c-lit))"
        stroke="rgb(var(--c-lit))"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
