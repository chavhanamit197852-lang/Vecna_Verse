# EventVerse — Next.js 15 + MongoDB + JavaScript

EventVerse is a modular campus-event SaaS starter. It uses Next.js 15 App Router, React 19, JavaScript, Mongoose, Auth.js credentials + optional Google OAuth, Razorpay Checkout, Cloudinary certificate storage and role-protected route handlers.

## Requirements
- Node.js 20.9+ (recommended)
- MongoDB Atlas cluster
- Google OAuth credentials (optional but needed for Google login)
- Razorpay test/live keys (needed for paid sponsorship checkout)
- Cloudinary credentials (needed for certificate uploads)

## Install
```bash
cp .env.example .env.local
npm install
```
Set `MONGODB_URI` to your Atlas connection string. In Atlas, add your current public IP to Network Access and create a database user. URL-encode special characters in the database password. Generate a secret with `openssl rand -base64 32` and set `AUTH_SECRET`.

## Google OAuth
Create a Google OAuth Web application. Authorized redirect URI:
`http://localhost:3000/api/auth/callback/google`
Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Google-created accounts always receive the STUDENT role; privileged roles must be assigned by a trusted database/admin process.

## Razorpay
Use Razorpay test mode first. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Configure a webhook endpoint:
`https://YOUR_DOMAIN/api/ads/webhook`
Subscribe to `payment.captured` and `payment.failed`, and set `RAZORPAY_WEBHOOK_SECRET` to the webhook secret. The checkout signature is verified server-side. Ads move to PENDING_REVIEW after verified payment; an ADMIN must approve them before they become visible. The app does not store card/UPI credentials.

## Cloudinary
Set the three Cloudinary variables. Certificate uploads accept PDF, PNG and JPEG up to 8 MB and use a user-specific folder.

## Seed demo data
```bash
npm run seed
```
Demo password: `EventVerse@123`
- `admin@eventverse.local` — ADMIN
- `clubadmin@eventverse.local` — CLUB_ADMIN
- `committee@eventverse.local` — STUDENT + club COMMITTEE (TechNova)
- `user@eventverse.local` — STUDENT
- `sponsor@eventverse.local` — SPONSOR

Change or remove these demo accounts before deployment. The seed script is for local/demo environments only.

## Run
```bash
npm run dev
```
Open http://localhost:3000.

## Main routes
- `/` landing page
- `/events` discovery/search
- `/events/[slug]` event details + registration
- `/login`, `/register`
- `/dashboard`, `/dashboard/attendance`, `/dashboard/aicte`, `/dashboard/portfolio`
- `/communities`, `/communities/hackathon`, `/code-arena`, `/communities/sponsorship`
- `/clubs`, `/clubs/new`
- `/club`, `/club/events` and `/club/checkin`
- `/admin`, `/admin/events`, `/admin/ads`, `/admin/users` (role assignment)

## Important implementation notes
- Global roles are `STUDENT`, `SPONSOR`, `CLUB_ADMIN`, `ADMIN`. Club-level roles (`ADMIN`/`COMMITTEE`/`MEMBER`) live in `ClubMember` and are what the club permission checks read. Public registration and OAuth can only create STUDENT accounts. Never expose role selection in signup.
- Club admin access is scoped to the club ID in the authenticated JWT. Assign club admins through a trusted admin workflow/database operation.
- Event registration is unique per `(eventId,userId)`. QR tokens are cryptographically random. Check-in uses a conditional atomic update, so duplicate scans cannot award points twice.
- AICTE point values are configured per event by the organizer. They are a tracker, not an official AICTE certification. Confirm institution-specific rules before using them for curriculum claims.
- LeetCode board is seeded demo data. Sync endpoint explicitly does not scrape or claim to fetch live LeetCode stats.
- Razorpay order creation is server-side. Checkout signature and webhook signature are checked with HMAC. Campaign activation requires payment verification and admin approval. Configure webhook retries and reconcile payment state before launch.
- This starter does not yet include camera-based QR decoding; the check-in desk accepts the token decoded by a scanner. The server-side check-in endpoint is implemented and protected.
- Socket.IO was removed from this scaffold rather than shipping an unauthenticated wildcard-CORS chat server. Add realtime chat only with authenticated socket middleware, membership checks, rate limits and a deployment that supports persistent WebSockets.

## Before production
1. Replace demo users/passwords; rotate `AUTH_SECRET` and all API keys.
2. Set `NEXT_PUBLIC_APP_URL`, `AUTH_URL` to the real HTTPS domain.
3. Restrict Atlas network access and enable backups.
4. Configure Google OAuth production callback URL.
5. Configure Razorpay live keys + webhook and test refunds, failed payments and webhook retries.
6. Add moderation/reporting, audit logs, rate limiting (Redis), email verification/password reset, privacy/terms, data export/deletion and monitoring.
7. Review AICTE point mapping with the institution. Do not represent demo points as official accreditation.
8. Run `npm run build` and test each role with separate accounts.

## Data model overview
`User`, `Club`, `Event`, `Registration`, `Community`, `TeamPost`, `TeamApplication`, `LeetCodeProfile`, `SponsorAd`, `ClubAd`, `SponsorshipInquiry`, `Sponsor`, `Achievement`, `Certificate`, `EventNote`.

## Sponsorship marketplace and club advertisements

These are intentionally separate workflows:

- **Sponsorship marketplace** (`/sponsors`): companies/individual sponsors discover clubs and submit proposals. Club Admins review proposals at `/club/sponsors`. After a proposal is accepted, its sponsor can record a demo contribution from `/sponsors/my-proposals`. The funding ledger is visible in the club sponsor workspace. Demo contributions do not transfer money.
- **Club advertisements** (`/club/ads`): an active Club Admin chooses a club, placement (homepage, event discovery, or club directory), creative and package. The demo checkout records a pending-review campaign. Platform Admin approves/rejects it at `/admin/club-ads`; approved campaigns are displayed in their selected placement and track impressions/clicks.
- **Platform advertisements** (`SponsorAd`, `/admin/ads`) remain a separate advertiser-to-platform product. Do not merge `SponsorAd` and `ClubAd` records.

Club ad demo pricing: BASIC ₹499/7 days, STANDARD ₹1,499/14 days, PREMIUM ₹3,999/30 days. These are demonstration prices and the demo checkout does not charge a payment method. A production release needs a real payment gateway, refund handling, campaign policy, audit trail and verified payment webhooks.
