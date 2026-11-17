import Image from "next/image";
import { BadgeCheck, MapPin } from "lucide-react";
import type { PublicProfile } from "@/lib/types";

const TAG_STYLES = ["bg-sun-soft", "bg-coy-soft", "bg-mint-soft", "bg-sand"];

interface ProfileCardProps {
  profile: PublicProfile;
  priority?: boolean;
  position?: number;
  total?: number;
  className?: string;
}

export default function ProfileCard({
  profile,
  priority = false,
  position,
  total,
  className = "",
}: ProfileCardProps) {
  return (
    <article
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-[30px] border border-ink/10 bg-paper shadow-[0_28px_60px_-32px_rgba(23,21,29,0.55)] ${className}`}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-sand">
        <Image
          src={profile.photo}
          alt={`${profile.name}'s profile photo`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 94vw, 500px"
          className="select-none object-cover object-[center_28%]"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 via-black/5 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.13em] text-ink shadow-sm backdrop-blur-sm">
            <BadgeCheck className="h-3.5 w-3.5 text-coy" strokeWidth={2.4} />
            Campus verified
          </span>
          {position && total ? (
            <span className="rounded-full bg-ink/50 px-2 py-1 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
              {String(position).padStart(2, "0")}{" "}
              <span className="text-white/50">/ {total}</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 px-5 pb-4 pt-3.5">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-[30px] font-semibold leading-none tracking-[-0.035em]">
            {profile.name}
            <span className="ml-1.5 text-[23px] font-light text-ink/40">{profile.age}</span>
          </h2>
          <BadgeCheck className="h-4 w-4 text-coy" strokeWidth={2.4} />
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-ink/50">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-coy" />
          <span className="truncate">
            {profile.college} <span className="text-ink/25">·</span> {profile.city}
          </span>
        </p>

        <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.55] text-ink/65">
          {profile.bio}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {profile.interests.slice(0, 3).map((interest, index) => (
            <li
              key={interest}
              className={`rounded-full border border-ink/[0.06] px-2.5 py-1 text-[10.5px] font-medium text-ink/65 ${
                TAG_STYLES[index % TAG_STYLES.length]
              }`}
            >
              {interest}
            </li>
          ))}
          {profile.interests.length > 3 ? (
            <li className="rounded-full border border-ink/[0.06] bg-sand px-2.5 py-1 text-[10.5px] font-medium text-ink/50">
              +{profile.interests.length - 3}
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}
