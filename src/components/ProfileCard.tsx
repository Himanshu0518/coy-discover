import Image from "next/image";
import type { PublicProfile } from "@/lib/types";
import { MapPinIcon } from "./icons";

interface ProfileCardProps {
  profile: PublicProfile;
  priority?: boolean;
  className?: string;
}

export default function ProfileCard({
  profile,
  priority = false,
  className = "",
}: ProfileCardProps) {
  return (
    <article
      className={`relative h-full w-full overflow-hidden rounded-[30px] bg-sand shadow-[0_30px_60px_-24px_rgba(30,27,26,0.5)] ring-1 ring-ink/[0.06] ${className}`}
    >
      <Image
        src={profile.photo}
        alt={`${profile.name}'s profile photo`}
        fill
        unoptimized
        priority={priority}
        draggable={false}
        sizes="(max-width: 440px) 100vw, 440px"
        className="pointer-events-none select-none object-cover"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-5 pb-5 pt-24 text-white">
        <div className="flex items-end gap-2">
          <h2 className="text-[27px] font-semibold leading-none tracking-tight">{profile.name}</h2>
          <span className="pb-0.5 text-[21px] font-light text-white/80">{profile.age}</span>
        </div>

        <p className="mt-2 flex items-center gap-1 text-[12.5px] font-medium text-white/75">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {profile.college} · {profile.city}
          </span>
        </p>

        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/85">{profile.bio}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {profile.interests.slice(0, 4).map((interest) => (
            <li
              key={interest}
              className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/90 backdrop-blur-sm"
            >
              {interest}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
