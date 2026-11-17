"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { Heart, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicProfile, SwipeDirection, SwipeResponse } from "@/lib/types";
import ProfileCard from "./profile-card";

const SWIPE_DISTANCE = 100;
const SWIPE_VELOCITY = 520;

interface SwipeCardProps {
  profile: PublicProfile;
  upcoming: PublicProfile[];
  position: number;
  total: number;
  disabled?: boolean;
  onSwipe: (profile: PublicProfile, direction: SwipeDirection) => Promise<SwipeResponse>;
  onSwiped: (profileId: string, outcome: SwipeResponse) => void;
}

export default function SwipeCard({
  profile,
  upcoming,
  position,
  total,
  disabled = false,
  onSwipe,
  onSwiped,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [24, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -24], [1, 0]);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const commit = useCallback(
    async (direction: SwipeDirection) => {
      if (busyRef.current || disabled) return;

      busyRef.current = true;
      setBusy(true);

      await animate(x, direction === "like" ? 640 : -640, {
        duration: 0.28,
        ease: [0.22, 0.61, 0.36, 1],
      }).finished;

      try {
        const outcome = await onSwipe(profile, direction);
        onSwiped(profile.id, outcome);
      } catch {
        // The parent shows a toast; spring the same card back so the deck
        // and the database never drift apart.
        await animate(x, 0, {
          type: "spring",
          stiffness: 300,
          damping: 26,
        }).finished;
        busyRef.current = false;
        setBusy(false);
      }
    },
    [disabled, onSwiped, onSwipe, profile, x],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

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
  }, [commit, disabled]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (busyRef.current || disabled) return;

      if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
        void commit("like");
        return;
      }

      if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
        void commit("pass");
        return;
      }

      void animate(x, 0, { type: "spring", stiffness: 420, damping: 32 }).finished;
    },
    [commit, disabled, x],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="flex flex-col"
    >
      <div className="relative h-[clamp(430px,calc(100dvh_-_392px),520px)] w-full sm:h-[clamp(480px,58vh,600px)]">
        {upcoming.map((nextProfile, index) => (
          <motion.div
            key={nextProfile.id}
            aria-hidden="true"
            initial={false}
            animate={{
              y: (index + 1) * 12,
              scale: 1 - (index + 1) * 0.035,
              rotate: index % 2 === 0 ? 1.3 : -1.3,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="pointer-events-none absolute inset-0 origin-bottom"
            style={{ zIndex: 10 - index, opacity: index === 0 ? 0.85 : 0.55 }}
          >
            <ProfileCard profile={nextProfile} />
          </motion.div>
        ))}

        <motion.div
          role="group"
          aria-roledescription="profile card"
          aria-label={`${profile.name}, ${profile.age}, ${profile.college}`}
          drag={disabled || busy ? false : "x"}
          dragMomentum={false}
          dragElastic={0.8}
          onDragEnd={handleDragEnd}
          style={{ x, rotate }}
          className="absolute inset-0 z-20 cursor-grab touch-none select-none active:cursor-grabbing"
        >
          <ProfileCard
            profile={profile}
            priority
            position={position}
            total={total}
          />

          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-4 top-5 z-30 -rotate-12"
          >
            <span className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-coy bg-white/90 px-3 py-1.5 font-display text-[20px] font-bold uppercase tracking-[0.14em] text-coy shadow-[2px_2px_0_0_#17151D]">
              <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              Like
            </span>
          </motion.div>

          <motion.div
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute right-4 top-5 z-30 rotate-12"
          >
            <span className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-white/90 px-3 py-1.5 font-display text-[20px] font-bold uppercase tracking-[0.14em] text-ink shadow-[2px_2px_0_0_#17151D]">
              <X className="h-4 w-4" strokeWidth={3} />
              Nope
            </span>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-4 flex items-end justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => void commit("pass")}
            disabled={busy || disabled}
            aria-label={`Pass on ${profile.name}`}
            aria-keyshortcuts="ArrowLeft"
            className="grid h-[62px] w-[62px] place-items-center rounded-full border-2 border-ink bg-white text-ink shadow-[3px_3px_0_0_#17151D] transition-colors hover:bg-sand disabled:opacity-40"
          >
            <X className="h-6 w-6" strokeWidth={2.4} />
          </motion.button>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Pass
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ rotate: -4, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => void commit("like")}
            disabled={busy || disabled}
            aria-label={`Like ${profile.name}`}
            aria-keyshortcuts="ArrowRight"
            className="grid h-[74px] w-[74px] place-items-center rounded-full border-2 border-ink bg-coy text-white shadow-[4px_4px_0_0_#17151D] transition-colors hover:bg-[#e0437c] disabled:opacity-40"
          >
            <Heart className="h-7 w-7" fill="currentColor" strokeWidth={0} />
          </motion.button>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Like
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`${profile.name}, ${profile.age}. ${profile.bio}`}
      </p>
    </motion.div>
  );
}
