"use client";

import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicProfile } from "@/lib/types";

const BURST = [
  { x: -128, y: -108, rotate: -28, size: 18, color: "#FFE477", delay: 0.02 },
  { x: 122, y: -124, rotate: 24, size: 14, color: "#FFFDF9", delay: 0.08 },
  { x: -158, y: 6, rotate: -14, size: 12, color: "#75D58A", delay: 0.12 },
  { x: 156, y: 20, rotate: 30, size: 20, color: "#FFE477", delay: 0.04 },
  { x: -106, y: 116, rotate: 16, size: 14, color: "#FFFDF9", delay: 0.16 },
  { x: 112, y: 128, rotate: -22, size: 17, color: "#FFE477", delay: 0.1 },
  { x: -54, y: -150, rotate: 8, size: 11, color: "#FFFDF9", delay: 0.2 },
  { x: 46, y: -158, rotate: -18, size: 15, color: "#75D58A", delay: 0.06 },
  { x: -170, y: -66, rotate: 32, size: 10, color: "#FFFDF9", delay: 0.18 },
  { x: 174, y: -48, rotate: -30, size: 11, color: "#FFE477", delay: 0.14 },
];

interface MatchDialogProps {
  profile: PublicProfile | null;
  onClose: () => void;
  onViewMatches: () => void;
}

export default function MatchDialog({
  profile,
  onClose,
  onViewMatches,
}: MatchDialogProps) {
  return (
    <Dialog open={Boolean(profile)} onOpenChange={(open) => !open && onClose()}>
      {profile ? (
        <DialogContent className="overflow-hidden border-ink bg-coy p-0 text-white shadow-[8px_8px_0_0_#17151D] sm:shadow-[10px_10px_0_0_#17151D]">
          <div className="relative px-5 pb-6 pt-8 text-center sm:px-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "15px 15px",
              }}
            />
            <Heart
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 -left-7 h-32 w-32 text-white/[0.08]"
              strokeWidth={1}
            />

            {BURST.map((piece, index) => (
              <motion.span
                key={index}
                aria-hidden="true"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.2, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: piece.x,
                  y: piece.y,
                  scale: [0.4, 1, 0.65],
                  rotate: piece.rotate,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.15 + piece.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 z-0"
              >
                <Heart
                  className="drop-shadow-sm"
                  style={{ width: piece.size, height: piece.size, color: piece.color }}
                  fill="currentColor"
                  strokeWidth={0}
                />
              </motion.span>
            ))}

            <div className="relative z-10">
              <p className="eyebrow justify-center text-white/65">Mutual like</p>
              <DialogTitle className="mt-2 font-display text-[46px] font-semibold leading-[0.88] tracking-[-0.055em] sm:text-[52px]">
                It&apos;s a
                <br />
                <span className="italic text-sun">match!</span>
              </DialogTitle>

              <div className="relative mx-auto mt-5 flex h-[128px] w-[238px] items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, x: 18, rotate: -16 }}
                  animate={{ opacity: 1, x: 0, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.08 }}
                  className="relative z-10 h-[106px] w-[88px] overflow-hidden rounded-[20px] border-[3px] border-white bg-cream shadow-xl"
                >
                  <Image
                    src="/portraits/me.jpg"
                    alt="You"
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-1.5 pt-5 text-[8px] font-bold uppercase tracking-[0.12em]">
                    You
                  </span>
                </motion.div>

                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.16 }}
                  className="relative z-20 -mx-2.5 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-coy text-white shadow-lg"
                >
                  <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                </motion.span>

                <motion.div
                  initial={{ opacity: 0, x: -18, rotate: 16 }}
                  animate={{ opacity: 1, x: 0, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.08 }}
                  className="relative z-10 h-[106px] w-[88px] overflow-hidden rounded-[20px] border-[3px] border-white bg-cream shadow-xl"
                >
                  <Image
                    src={profile.photo}
                    alt={`${profile.name}'s profile photo`}
                    fill
                    sizes="88px"
                    className="object-cover object-[center_28%]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-1.5 pt-5 text-[8px] font-bold uppercase tracking-[0.12em]">
                    {profile.name}
                  </span>
                </motion.div>
              </div>

              <p className="mt-3 font-display text-[20px] font-medium tracking-tight">
                {profile.name}, {profile.age}
              </p>
              <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/55">
                {profile.college}
              </p>

              <DialogDescription className="mx-auto mt-3 max-w-[290px] text-[12px] leading-relaxed text-white/75">
                You both said yes. Nobody else will ever know — that&apos;s the
                whole point of Coy.
              </DialogDescription>

              <Button
                variant="white"
                size="lg"
                onClick={onClose}
                className="mt-5 w-full"
              >
                Keep discovering
                <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={onViewMatches}
                className="mt-2 w-full rounded-full px-5 py-2.5 text-[12px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                See all your matches
              </button>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
