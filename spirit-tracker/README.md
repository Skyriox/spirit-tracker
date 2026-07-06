# 🌟 Spirit Tracker

A playful, glowing collectible tracker for a friend group — mark which "spirits" you own,
see your friends' collections, and request the ones you're missing.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase**.

## ✨ Features

- Username + PIN login — no email, no password reset flows, just first names + a 4-digit code you choose
- Create or join a friend group with a 6-character invite code
- Grid of spirit cards with rarity glow (common / rare / epic / legendary)
- One-tap "mark as owned" toggle, saved instantly
- Friend view: see anyone's progress, owned list, and missing list
- Request system: ask a specific friend for a spirit they own, with accept/decline
- Live-updating request notifications (Supabase Realtime)
- Dashboard with progress %, missing spirits, and active requests
- Automatic suggestions: "who can help you" and "spirits you can share"
- Fully responsive, mobile-first, glassy/gradient UI with hover glow animations

## 🗂 File structure

```
spirit-tracker/
├── app/
│   ├── layout.tsx                 # Root layout, fonts, ambient background
│   ├── page.tsx                   # Redirects to /login or /dashboard
│   ├── globals.css
│   ├── not-found.tsx
│   ├── login/page.tsx             # Username + PIN login form
│   ├── group/page.tsx             # Create/join group, member list
│   ├── dashboard/page.tsx         # Home: progress, missing, suggestions, requests
│   ├── spirits/page.tsx           # Full spirit catalog with filters + toggle
│   ├── friends/[id]/page.tsx      # A friend's progress, owned & missing lists
│   ├── requests/page.tsx          # Incoming/outgoing request inbox
│   └── api/
│       ├── auth/{login,logout,me}/route.ts
│       ├── groups/{create,join}/route.ts
│       ├── spirits/route.ts
│       ├── spirits/owners/route.ts
│       ├── user-spirits/toggle/route.ts
│       ├── requests/route.ts
│       ├── requests/[id]/route.ts
│       └── suggestions/route.ts
├── components/
│   ├── Navbar.tsx, Avatar.tsx, Loader.tsx
│   ├── SpiritCard.tsx             # The signature glowing collectible card
│   ├── SpiritsBoard.tsx           # Catalog grid + filters (client)
│   ├── RarityBadge.tsx, ProgressBar.tsx
│   ├── RequestModal.tsx, RequestPanel.tsx, RequestRow.tsx
│   ├── SuggestionPanel.tsx
│   └── GroupForms.tsx, InviteCodeChip.tsx
├── lib/
│   ├── supabaseAdmin.ts           # Server-only client (service role)
│   ├── supabaseClient.ts          # Browser client (anon key, realtime only)
│   ├── session.ts                 # JWT session cookie (jose)
│   ├── auth.ts                    # getCurrentUser / requireUser helpers
│   ├── data.ts                    # Shared server-side data queries
│   └── utils.ts
├── types/index.ts
├── scripts/create-user.mjs        # CLI to create username+PIN accounts
├── supabase/schema.sql            # Full DB schema, RLS, seed spirits
├── middleware.ts                  # Route protection
└── .env.local.example
```

## 🚀 Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then open
**SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and run it.
This creates all five tables, indexes, RLS policies, enables Realtime on `requests`,
and seeds a starter catalog of 15 spirits.

### 2. Configure environment variables

Copy the example file and fill in your project's values (Project Settings → API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # keep this secret!
SESSION_SECRET=<run: openssl rand -hex 32>
```

### 3. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Create your accounts (username + PIN, no email)

This app intentionally skips email/password auth. Instead, create accounts for
you and your friends directly, choosing your own usernames and PINs:

```bash
npm run create-user -- maya 0000
npm run create-user -- alex 1234
npm run create-user -- sam 4321
```

Each person then logs in at `/login` with their username and PIN. The first
person to log in should create the group and share the invite code shown on
the **Group** page; everyone else joins with that code.

## 🔐 How auth works

There's no Supabase Auth involved. The `users` table stores a bcrypt hash of
each person's PIN. `/api/auth/login` checks the username + PIN against that
hash and, if it matches, signs a small JWT (via `jose`) into an `httpOnly`
cookie. `middleware.ts` checks for that cookie to protect `/dashboard`,
`/spirits`, `/friends`, `/requests`, and `/group`. All actual database reads
and writes happen server-side in API routes using the Supabase **service
role** key, which is never exposed to the browser — the anon key is only
used client-side for the Realtime subscription on the `requests` table.

## 🗄 Database schema

See `supabase/schema.sql` for the full, runnable schema. Summary:

| Table | Columns |
|---|---|
| `groups` | `id, name, invite_code, created_at` |
| `users` | `id, username, pin_hash, avatar, group_id, created_at` |
| `spirits` | `id, name, rarity, image, created_at` |
| `user_spirits` | `user_id, spirit_id, owned, updated_at` (composite PK) |
| `requests` | `id, from_user, to_user, spirit_id, status, created_at, updated_at` |

## 🎨 Design notes

Dark space-gradient background (violet/cyan/pink blobs), glassmorphism panels,
and spirit cards with rarity-colored glow rings (grey → sky → purple → gold)
that intensify on hover, plus a floating icon and sparkle accents on
legendary cards. Headings use **Baloo 2** (rounded, playful); body text uses
**Nunito** for readability. Everything is mobile-first and touch-friendly.

## 📝 Adding more spirits

Insert directly into the `spirits` table in Supabase (Table Editor or SQL):

```sql
insert into spirits (name, rarity, image) values ('New Spirit', 'rare', '');
```

They'll show up automatically for everyone.
