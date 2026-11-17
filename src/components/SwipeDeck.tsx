"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { PublicProfile, SwipeDirection } from "@/lib/types";
import ProfileCard from "./ProfileCard";
import { HeartIcon, XIcon } from "./icons";

const SWIPE_THRESHOLD = 108;
const VELOCITY_THRESHOLD = 0.45;
const EXIT_MS = 280;

interface SwipeDeckProps {
  profiles: PublicProfile[];
  disabled?: boolean;
  onSwipe: (profile: PublicProfile, direction: SwipeDirection) => Promise<void>;
  onSwiped: (profileId: string) => void;
}

interface Point {
  x: number;
  y: number;
  t: number;
}

export default function SwipeDeck({
  profiles,
  disabled = false,
  onSwipe,
  onSwiped,
}: SwipeDeckProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<{ id: string; direction: SwipeDirection } | null>(null);
  const [busy, setBusy] = useState(false);

  const startRef = useRef<Point | null>(null);
  const lastRef = useRef<Point | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const top = profiles[0];
  const second = profiles[1];
  const third = profiles[2];

  const resetDrag = useCallback(() => {
    startRef.current = null;
    lastRef.current = null;
    pointerIdRef.current = null;
    setDragging(false);
    setOffset({ x: 0, y: 0 });
  }, []);

  const commit = useCallback(
    async (direction: SwipeDirection) => {
      if (!top || busy || disabled) return;

      setBusy(true);
      setDragging(false);
      startRef.current = null;
      lastRef.current = null;
      pointerIdRef.current = null;
      setOffset({ x: 0, y: 0 });
      setExiting({ id: top.id, direction });

      try {
        await onSwipe(top, direction);
        await new Promise((resolve) => setTimeout(resolve, EXIT_MS));
        onSwiped(top.id);
      } catch {
        // The parent shows a toast; keeping the card here keeps the deck and
        // the database in sync.
      } finally {
        setExiting(null);
        setBusy(false);
      }
    },
    [busy, disabled, onSwipe, onSwiped, top],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void commit("pass");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        void commit("like");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commit]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || busy || !top) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY, t: performance.now() };
    startRef.current = point;
    lastRef.current = point;
    pointerIdRef.current = event.pointerId;
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start || pointerIdRef.current !== event.pointerId) return;

    setOffset({
      x: event.clientX - start.x,
      y: (event.clientY - start.y) * 0.35,
    });
    lastRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start || pointerIdRef.current !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const dx = event.clientX - start.x;
    const elapsed = Math.max(performance.now() - start.t, 1);
    const velocity = dx / elapsed;

    const liked = dx > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD;
    const passed = dx < -SWIPE_THRESHOLD || velocity < -VELOCITY_THRESHOLD;

    resetDrag();

    if (liked) {
      void commit("like");
    } else if (passed) {
      void commit("pass");
    }
  };

  if (!top) return null;

  const exitingDirection = exiting?.id === top.id ? exiting.direction : null;
  const translateX =
    exitingDirection === "like" ? 640 : exitingDirection === "pass" ? -640 : offset.x;
  const rotate =
    exitingDirection === "like" ? 18 : exitingDirection === "pass" ? -18 : offset.x * 0.055;
  const likeOpacity =
    exitingDirection === "like" ? 1 : Math.min(Math.max(offset.x / SWIPE_THRESHOLD, 0), 1);
  const passOpacity =
    exitingDirection === "pass" ? 1 : Math.min(Math.max(-offset.x / SWIPE_THRESHOLD, 0), 1);

  return (
    <div className="flex flex-col">
      <div className="relative h-[clamp(380px,56vh,520px)] w-full select-none">
        {third ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-y-4 scale-[0.91] opacity-60"
          >
            <ProfileCard profile={third} />
          </div>
        ) : null}

        {second ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-y-2 scale-[0.955] opacity-90"
          >
            <ProfileCard profile={second} />
          </div>
        ) : null}

        <div
          key={top.id}
          role="group"
          aria-roledescription="profile card"
          aria-label={`${top.name}, ${top.age}, ${top.college}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={resetDrag}
          onLostPointerCapture={() => {
            if (!busy) resetDrag();
          }}
          className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate3d(${translateX}px, ${offset.y}px, 0) rotate(${rotate}deg)`,
            transition: dragging
              ? "none"
              : `transform ${EXIT_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
            touchAction: "none",
          }}
        >
          <ProfileCard profile={top} priority />

          <div
            className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-xl border-[3px] border-coral px-3 py-1.5 text-xl font-extrabold uppercase tracking-[0.12em] text-coral"
            style={{ opacity: likeOpacity }}
          >
            Like
          </div>
          <div
            className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-xl border-[3px] border-ink/50 px-3 py-1.5 text-xl font-extrabold uppercase tracking-[0.12em] text-ink/50"
            style={{ opacity: passOpacity }}
          >
            Nope
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => void commit("pass")}
          disabled={busy || disabled}
          aria-label={top ? `Pass on ${top.name}` : "Pass"}
          className="press grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-white text-ink/60 shadow-[0_14px_30px_-16px_rgba(30,27,26,0.5)] hover:text-ink disabled:opacity-40"
        >
          <XIcon className="h-7 w-7" />
        </button>

        <button
          type="button"
          onClick={() => void commit("like")}
          disabled={busy || disabled}
          aria-label={top ? `Like ${top.name}` : "Like"}
          className="press grid h-[72px] w-[72px] place-items-center rounded-full bg-coral text-white shadow-[0_18px_35px_-14px_rgba(244,67,90,0.9)] disabled:opacity-40"
        >
          <HeartIcon className="h-8 w-8" filled />
        </button>
      </div>

      <p className="mt-4 text-center text-[10.5px] text-ink/35">
        Swipe right to like · left to pass
        <span className="hidden sm:inline"> · or use ← →</span>
      </p>

      <p className="sr-only" aria-live="polite">
        {`${top.name}, ${top.age}. ${top.bio}`}
      </p>
    </div>
  );
}
