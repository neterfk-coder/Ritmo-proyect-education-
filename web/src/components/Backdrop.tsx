import { useEffect, useRef } from "react";

/**
 * The moving field behind the page.
 *
 * Constraints it is built under, because this is the highest-risk surface in
 * the product for the people it is for:
 *
 *   · It sits behind every card, and cards are opaque. The motion is visible
 *     in the margins and the gutters, never underneath a sentence somebody is
 *     trying to read.
 *   · It is drawn in the theme's own ink at very low alpha, so it is near-black
 *     on the light themes and near-white on dark. One accent colour is reserved
 *     for the step; nothing here is allowed to use it.
 *   · Reduced motion gets a single static frame. Not a slower animation — a
 *     still image, because "less movement" is not what that setting asks for.
 *   · It stops completely when the tab is hidden, and when the student turns
 *     it off.
 *
 * The interaction: the pointer sets up a slow swirl in the field around it,
 * and pressing sends a soft pulse outward. It follows you rather than reacting
 * sharply — anything faster reads as the page being startled.
 */

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  span: number;
}

/**
 * How much of itself the field is allowed to show.
 *
 * "calm" is what sits behind the workspace, and its restraint is the whole
 * point there: exactly one element on that screen carries attention, and it is
 * the lit step. A field competing with it would undo the thing the product is
 * for.
 *
 * "full" is the front door, where there is no step to protect and the page's
 * job is to be worth looking at. The same near-invisibility that is correct
 * behind a task reads as nothing at all on a landing page — the animation was
 * running the whole time at four percent opacity and nobody could see it.
 *
 * Only ink strength, stroke weight and trail length change. The motion itself
 * is identical, so the two are the same field seen at two exposures rather
 * than two different effects.
 */
export type BackdropIntensity = "calm" | "full";

const EXPOSURE = {
  calm: { base: 0.045, ceiling: 0.2, weight: 0.9, wash: 0.055 },
  full: { base: 0.115, ceiling: 0.3, weight: 1.25, wash: 0.032 },
} as const;

export function Backdrop({
  enabled = true,
  intensity = "calm",
}: {
  enabled?: boolean;
  intensity?: BackdropIntensity;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !enabled) return;

    const exposure = EXPOSURE[intensity];

    const ctx = el.getContext("2d", { alpha: true });
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let raf = 0;
    let running = true;

    // The pointer is tracked with easing so the field follows rather than snaps.
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

    interface Pulse {
      x: number;
      y: number;
      age: number;
      life: number;
      reach: number;
      width: number;
      strength: number;
    }
    const pulses: Pulse[] = [];

    /**
     * Writing lights the field.
     *
     * `energy` rises with each keystroke and decays over about a second and a
     * half, so the background is at its brightest and quickest while the
     * student is actually putting words down, and settles while they read.
     *
     * Only the fact of a keypress is used. Not the key, not the character, not
     * the field it landed in — the same rule the friction tracker follows, and
     * for the same reason.
     */
    const typing = { energy: 0, last: 0 };

    let ink = [22, 33, 30];
    let ground = [233, 236, 231];

    const readTheme = () => {
      const style = getComputedStyle(document.documentElement);
      const parse = (name: string, fallback: number[]) => {
        const raw = style.getPropertyValue(name).trim();
        const parts = raw.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
        return parts.length === 3 ? parts : fallback;
      };
      ink = parse("--c-ink", ink);
      ground = parse("--c-ground", ground);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = Math.floor(width * dpr);
      el.height = Math.floor(height * dpr);
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area and is capped, so a large monitor does not
      // turn into a busier page than a laptop.
      const count = Math.max(26, Math.min(90, Math.round((width * height) / 24000)));
      particles = Array.from({ length: count }, () => spawn());

      ctx.fillStyle = `rgb(${ground[0]} ${ground[1]} ${ground[2]})`;
      ctx.fillRect(0, 0, width, height);
    };

    function spawn(): Particle {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        x, y, px: x, py: y,
        vx: 0, vy: 0,
        life: 0,
        span: 260 + Math.random() * 460,
      };
    }

    /**
     * A smooth flow field from three offset sine waves. Cheap, has no visible
     * grid, and drifts slowly enough that the pattern never repeats obviously.
     */
    const angleAt = (x: number, y: number, t: number) => {
      const s = 0.0017;
      return (
        Math.sin(x * s + t * 0.00023) * 1.7 +
        Math.sin(y * s * 1.25 - t * 0.00019) * 1.7 +
        Math.sin((x + y) * s * 0.55 + t * 0.00013) * 1.1
      );
    };

    const step = (advance: boolean) => {
      const energy = typing.energy;

      // Trails: instead of clearing, lay down a thin wash of the page colour
      // so older strokes fade out over about a second. While the student is
      // writing the wash thins, and the trails hold on longer.
      const wash = advance ? exposure.wash - energy * 0.022 : 1;
      ctx.fillStyle = `rgba(${ground[0]}, ${ground[1]}, ${ground[2]}, ${wash})`;
      ctx.fillRect(0, 0, width, height);

      if (advance) {
        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;
        typing.energy *= 0.976;
        if (typing.energy < 0.001) typing.energy = 0;
      }

      ctx.lineCap = "round";

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;

        const a = angleAt(p.x, p.y, frame);
        const drive = 0.075 + energy * 0.055;
        p.vx += Math.cos(a) * drive;
        p.vy += Math.sin(a) * drive;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const radius = 190;
          if (d2 < radius * radius) {
            const d = Math.sqrt(d2) || 1;
            const falloff = (1 - d / radius) ** 2;
            // Tangential, so the field turns around the pointer instead of
            // fleeing it. Plus a little outward, to open a clearing.
            p.vx += (-dy / d) * falloff * 0.85 + (dx / d) * falloff * 0.32;
            p.vy += (dx / d) * falloff * 0.85 + (dy / d) * falloff * 0.32;
          }
        }

        for (const pulse of pulses) {
          const dx = p.x - pulse.x;
          const dy = p.y - pulse.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const ring = pulse.age * pulse.reach;
          const nearness = Math.max(0, 1 - Math.abs(d - ring) / pulse.width);
          const fade = 1 - pulse.age / pulse.life;
          p.vx += (dx / d) * nearness * pulse.strength * fade;
          p.vy += (dy / d) * nearness * pulse.strength * fade;
        }

        p.vx *= 0.93;
        p.vy *= 0.93;
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        const speed = Math.hypot(p.vx, p.vy);
        // Faster strokes read slightly stronger, which gives the field depth
        // without ever getting loud. Writing lifts the whole field's ceiling.
        const alpha = Math.min(
          exposure.ceiling + energy * 0.16,
          exposure.base + speed * 0.05 + energy * 0.11
        );

        const wrapped =
          p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20;

        if (!wrapped) {
          ctx.strokeStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${alpha})`;
          ctx.lineWidth = exposure.weight + speed * 0.16 + energy * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        if (wrapped || p.life > p.span) Object.assign(p, spawn());
      }

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        pulses[i].age += 1;
        if (pulses[i].age > pulses[i].life) pulses.splice(i, 1);
      }

      frame += 16;
    };

    const loop = () => {
      if (!running) return;
      step(true);
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      if (!pointer.active) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };
    const onPointerDown = (e: PointerEvent) => {
      pulses.push({
        x: e.clientX, y: e.clientY,
        age: 0, life: 70, reach: 9, width: 90, strength: 1.5,
      });
    };

    // Sliders and checkboxes fire `input` too, and dragging the line-spacing
    // control is not writing. Only surfaces that hold words count.
    const WRITING_INPUTS = new Set(["text", "search", "email", "url", "tel", "password", ""]);

    const isWritingSurface = (el: Element | null): el is HTMLElement => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.isContentEditable) return true;
      if (el.tagName === "TEXTAREA") return true;
      if (el.tagName === "INPUT") {
        return WRITING_INPUTS.has((el as HTMLInputElement).type.toLowerCase());
      }
      return false;
    };

    /**
     * One keystroke: a little more energy, and a small ripple leaving the box
     * being written in, so the movement comes from where the work is happening
     * rather than from nowhere.
     *
     * Nothing about the key is read. `e.key` is never touched.
     */
    const registerWriting = (target: Element | null) => {
      if (!isWritingSurface(target)) return;

      const now = performance.now();
      const gap = now - typing.last;
      typing.last = now;

      // A run of keys builds more than the same number spread out, so the
      // field brightens with the rhythm of writing rather than a key count.
      //
      // The floor matters more than the ceiling here. Tuned so that a slow,
      // one-finger typist still clearly lights the field — plenty of the
      // students this is for type that way, and a reward that only arrives
      // for fast hands is worse than no reward.
      typing.energy = Math.min(1, typing.energy + (gap < 400 ? 0.19 : 0.15));

      const r = target.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;

      // Tight and quick — a keystroke should stir the field, not shove it.
      pulses.push({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        age: 0, life: 26, reach: 6, width: 60, strength: 0.5,
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      registerWriting(document.activeElement);
    };

    // Dictation and paste never fire keydown, and both are ways students here
    // are expected to write.
    const onInput = (e: Event) => registerWriting(e.target as Element | null);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!still) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const themeWatcher = new MutationObserver(() => {
      readTheme();
      ctx.fillStyle = `rgb(${ground[0]} ${ground[1]} ${ground[2]})`;
      ctx.fillRect(0, 0, width, height);
    });

    readTheme();
    resize();

    if (still) {
      // One pass, held. A still field is texture; a slow field is still motion.
      for (let i = 0; i < 90; i += 1) step(true);
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("keydown", onKeyDown, { passive: true });
      document.addEventListener("input", onInput, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    themeWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("input", onInput);
      document.removeEventListener("visibilitychange", onVisibility);
      themeWatcher.disconnect();
    };
  }, [enabled, intensity]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
