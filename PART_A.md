# Part A — Using Coy, and two core features it should build

## The product in one paragraph

Coy is a **double-blind crush app**, not a dating app. You add up to five people you already know by phone number or email. They receive one anonymous heads-up ("someone who has your number added you") and never your name. If they add you too, you both see a match at the same moment, with the contact each person used and a button to say hi on WhatsApp or email. If they don't, nothing happens: no rejection, no "seen", no hint. Adding is final, unmatched entries expire after 180 days, and extra slots are the only thing for sale. The product's whole promise is that **a like is never revealed unless it is mutual** — not directly, not through counts, and not through paid upgrades.

## What the shipped flows are doing well

- **Phone OTP login without a password** keeps the first step to a number and a code. The invite/heads-up link lands a non-user straight into that flow, so the growth loop and the product loop are the same action.
- **Asking for an email separately, in settings, is a smart second handle.** A user can join with a number and become findable by the email their college friends actually have.
- **The extra-slots screen is honest.** It sells room on your own list and explicitly refuses to sell hints or "see who liked you" upgrades. The invite link that earns a slot for every three friends who join is the right kind of monetisation: it buys density, not information.
- **The match moment is the product.** Showing the contact each side used, at the same instant, and then getting out of the way (no chat) is a confident, coherent design.

The two features below strengthen the two weakest points in that loop: **getting the right person onto your list**, and **turning a match into an actual conversation**.

> Research basis: Coy's public product pages, "How Coy works", the privacy and safety explainer, pricing/terms, and the onboarding checklist in the assignment (phone OTP → add a crush → verify email → invite link → extra slots). No personal account data is included here.

---

## Feature 1 — Verified campus circles, with adding by name

### What it is

A one-time **campus verification** (college email domain or student ID plus an invite code) that unlocks a private, verified circle for that campus. Inside the circle you can find a person by their **exact name** and add them — still by consuming a slot, still with a final add, still with the same anonymous heads-up.

There is no directory to browse, no photos, no profiles, and no way to see who is in the circle. Search returns a match only for a sufficiently specific query, shows just the name and course/year needed to disambiguate two people, and is rate-limited. Campus membership never changes what a non-match can learn.

### Why Coy needs it

1. **The current input is the biggest activation blocker.** Coy requires a phone number or an email. In the exact audience Coy launched for — college campuses — people know a crush's name, face, branch, and Instagram handle, not their phone number. The product is designed for people you already know, then asks for the one identifier you are least likely to have. Every user who cannot add their actual crush is an activated user lost at step one.
2. **Double-blind matching is a density product.** A match needs both people in the same graph and both paying a slot. Campus circles create dense, overlapping graphs where mutual likes are far more likely, which raises time-to-first-match and makes the free slots feel valuable instead of empty. This is also the natural expansion of the campus-first launch strategy.
3. **Verification makes the promise safer at scale.** A verified campus population reduces prank adds, under-18 accounts, and strangers guessing numbers. It protects the person being added, which is the population Coy's safety model is built around.
4. **It creates a defensible growth loop.** Campus invite codes, verified domains, and a "your campus is live" moment give the invite link a purpose beyond one free slot, without weakening anonymity.

### Privacy guardrails (non-negotiable)

- No browse, no alphabetical list, no suggestions, no "people in your campus" count. Exact search plus rate limiting, so the circle cannot be enumerated.
- No campus-level or per-person "X people added you" breakdown; the existing global count stays global.
- Adding remains final and slot-priced, so nobody can cycle through suspects.
- No photos or bios in search results — just enough identity to avoid adding the wrong namesake.
- 18+ verification and the same report/block path as the rest of Coy.

### Risks and how to de-risk them

- **Small-campus inference.** In a batch of 200 students, a campus-specific "3 people like you" is dangerously narrowing. Ship circles with **no campus-specific like counts at all**, and only reveal mutual matches.
- **Verification friction.** Start with college email domains and a manual invite-code fallback for campuses that do not issue student email.
- **Density cold start.** Launch one campus at a time with a founding cohort, rather than opening a thin national directory.

**Success metric:** share of new verified users who add at least one crush within 24 hours, and match rate per campus. Both should beat the phone-number-only funnel, or the feature is not earning its complexity.

---

## Feature 2 — A mutual-only "crush note"

### What it is

An optional, short (≤140 characters) note attached to an add — "the econ lecture would be better if you sat closer" — stored encrypted and **revealed only on a mutual match**, at the same instant as the match itself. It is not a chat message, not a profile, and not visible to anyone who has not matched. The note is fixed once sent, consistent with Coy's existing "adding is final" rule.

### Why Coy needs it

1. **The match is currently the end of the product, but it should be the start of a conversation.** Coy deliberately hands off to WhatsApp or email, but the first message is still the hardest one. A match screen with a name, a contact, and no context turns a high-emotion moment into an awkward "hey". The note gives both people something specific and kind to respond to, and it is the only artefact in the product that can break the ice.
2. **It increases the value of a slot, without selling information.** Today every slot is a binary bet. A note makes an add more thoughtful and the match more likely to turn into a conversation. That is a legitimate reason to buy extra slots: more room for higher-intent adds, not more visibility into who likes you.
3. **It deepens the emotional payoff that makes Coy shareable.** The product's growth depends on people telling friends about the moment it worked. "We matched and she quoted the note I wrote three weeks ago" is a far stronger story than a contact card.
4. **It is additive to the promise, not a crack in it.** The note is encrypted at rest, never sent to a non-match, and revealed simultaneously to both sides. It cannot be used to fish for information, because it never reaches anyone unless they already said yes.

### Guardrails

- Notes are visible **only** on a mutual match; never in a heads-up, a notification preview, or an API response for a non-match.
- Hard character cap, no links, phone numbers, or media, plus a lightweight moderation pass before delivery so the note cannot become a harassment vector.
- One note per add, uneditable, so it cannot be used to probe or bargain; reporting and blocking are available from the match screen.
- The note is not a paid feature. Charging for expression would turn the match moment into a paywall and weaken the product's honesty about slots.

### Risks

- **Harassment.** A note is more content than Coy currently carries. Moderation, report/block, and a strict "no links or numbers" rule are the price of the feature.
- **Lower match quality if notes become generic.** Prompt users with a light question ("what would you want them to know?") rather than a blank box, and do not let notes become a profile field.
- **Scope creep into chat.** The note must stay a single sealed message. If it becomes threaded, it becomes the chat Coy deliberately does not have.

**Success metric:** match-to-first-reply rate, reported notes per 1,000 matches, and slot purchases per activated user. Track reported notes as a guardrail before celebrating conversion.

---

## Sequencing

| Order | Feature | Why first |
| --- | --- | --- |
| 1 | Verified campus circles | Fixes activation and creates the density everything else depends on |
| 2 | Mutual-only crush note | Improves the payoff once there are enough matches to learn from |

**What I would deliberately not build:** a "see who liked you" view, a hints/clues store, public profiles, photo browsing, or in-app chat. Each one would raise short-term revenue or engagement by breaking the single promise the brand is built on.
