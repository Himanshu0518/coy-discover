/**
 * Generates the local, license-free avatar placeholders in public/avatars.
 * Design: abstract portrait silhouettes on soft gradients, deterministic per
 * profile so re-running the script never churns the images.
 *
 * Run with: npm run avatars
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { seedProfiles } from "../src/lib/profiles.seed.ts";

const palettes: Array<[string, string]> = [
  ["#FCE7DD", "#F2BFA9"],
  ["#EAE4F8", "#C9BCEB"],
  ["#E2F0E7", "#B4DCC6"],
  ["#FBE9C8", "#F2CE93"],
  ["#E3EEF7", "#B9D3EA"],
  ["#F7E1E7", "#EAB2C4"],
  ["#ECE7DF", "#D3C5B3"],
  ["#E6F1F0", "#B8DAD6"],
  ["#F6E8D3", "#E2C49A"],
  ["#E8E9F3", "#BFC3DA"],
  ["#FDEBD3", "#F4CB99"],
  ["#EAF2DA", "#CCE0AC"],
];

const skins = ["#F2C9A4", "#E5B183", "#CE9463", "#AE7345", "#8C5A36", "#F7D9BE"];
const clothes = ["#2F3E46", "#6D597A", "#355070", "#B56576", "#4A5759", "#3D5A80", "#8C6A5D", "#7A5C58"];
const hairs = ["#2B2118", "#3B2A20", "#1F1A17", "#4A3426", "#5C4033", "#241C16"];

function fringe(hair: string): string {
  return `<path d="M208 332C204 238 246 200 300 200C354 200 396 238 392 332C374 274 340 252 300 252C260 252 226 274 208 332Z" fill="${hair}"/>`;
}

function longHair(hair: string): string {
  return `
    <path d="M204 330C204 226 246 194 300 194C354 194 396 226 396 330L396 566C396 590 360 596 356 566L356 420L244 420L244 566C240 596 204 590 204 566Z" fill="${hair}"/>
    ${fringe(hair)}
    <path d="M206 420C196 470 200 520 210 566" stroke="${hair}" stroke-width="26" stroke-linecap="round" fill="none" opacity="0.9"/>
    <path d="M394 420C404 470 400 520 390 566" stroke="${hair}" stroke-width="26" stroke-linecap="round" fill="none" opacity="0.9"/>
  `;
}

function shortHair(hair: string): string {
  return `
    <path d="M206 338C200 240 244 198 300 198C356 198 400 240 394 338C382 300 356 268 300 268C244 268 218 300 206 338Z" fill="${hair}"/>
  `;
}

function curlyHair(hair: string): string {
  return `
    <g fill="${hair}">
      <circle cx="212" cy="300" r="54"/>
      <circle cx="244" cy="238" r="52"/>
      <circle cx="300" cy="208" r="56"/>
      <circle cx="356" cy="238" r="52"/>
      <circle cx="388" cy="302" r="54"/>
      <circle cx="300" cy="264" r="62"/>
    </g>
  `;
}

function bunHair(hair: string): string {
  return `
    <circle cx="386" cy="212" r="42" fill="${hair}"/>
    ${fringe(hair)}
  `;
}

function wavyHair(hair: string): string {
  return `
    <path d="M202 330C202 228 246 194 300 194C354 194 398 228 398 330C406 390 400 440 408 494C412 528 386 536 376 508C362 464 368 418 356 386L244 386C232 418 238 464 224 508C214 536 188 528 192 494C200 440 194 390 202 330Z" fill="${hair}"/>
    ${fringe(hair)}
  `;
}

const hairStyles = [longHair, shortHair, bunHair, curlyHair, wavyHair, shortHair];

function renderAvatar(index: number): string {
  const [bgA, bgB] = palettes[index % palettes.length];
  const skin = skins[index % skins.length];
  const cloth = clothes[(index * 3) % clothes.length];
  const hairColor = hairs[(index * 5) % hairs.length];
  const hair = hairStyles[index % hairStyles.length](hairColor);
  const earrings =
    index % 3 === 0
      ? `<circle cx="203" cy="368" r="9" fill="#E8B65A"/><circle cx="397" cy="368" r="9" fill="#E8B65A"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" role="img" aria-label="Illustrated avatar">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bgA}"/>
      <stop offset="1" stop-color="${bgB}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.25" cy="0.15" r="0.75">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="600" height="800" fill="url(#bg)"/>
  <rect width="600" height="800" fill="url(#glow)"/>
  <circle cx="486" cy="150" r="150" fill="#FFFFFF" opacity="0.16"/>
  <circle cx="96" cy="620" r="190" fill="#FFFFFF" opacity="0.10"/>
  <path d="M-40 560C120 500 190 610 330 570C430 542 520 480 640 520" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" fill="none"/>

  <ellipse cx="300" cy="792" rx="230" ry="46" fill="#000000" opacity="0.08"/>
  ${hair}
  <ellipse cx="300" cy="348" rx="92" ry="108" fill="${skin}"/>
  <ellipse cx="300" cy="444" rx="52" ry="22" fill="#000000" opacity="0.06"/>
  <path d="M268 426H332V486H268Z" fill="${skin}"/>
  <path d="M268 462C282 488 318 488 332 462V486H268Z" fill="#000000" opacity="0.07"/>
  <path d="M112 800C122 646 208 578 300 578C392 578 478 646 488 800Z" fill="${cloth}"/>
  <path d="M252 584L300 660L348 584" fill="none" stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M300 660V800" stroke="#000000" stroke-opacity="0.08" stroke-width="3"/>
  ${earrings}
  <rect width="600" height="800" filter="url(#grain)" opacity="0.055"/>
</svg>
`;
}

const outDir = join(process.cwd(), "public", "avatars");
mkdirSync(outDir, { recursive: true });

for (const [index, profile] of seedProfiles.entries()) {
  writeFileSync(join(outDir, `${profile.id}.svg`), renderAvatar(index), "utf8");
}

console.log(`Generated ${seedProfiles.length} avatars in ${outDir}`);
