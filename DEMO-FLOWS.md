# EventVerse demo flows

This revision uses demo-only checkout. It does not create Razorpay orders, load Razorpay Checkout, or collect real money.

## Event tickets

1. A Club Admin creates an event and sets `Ticket Price` and `Capacity` in the event form.
2. A student must have an `ACTIVE` `ClubMember` record for a club event. Platform-wide events do not require club membership.
3. Free events immediately create a `REGISTERED` Registration and QR token.
4. Paid events create a `PAYMENT_PENDING` Registration. The event page offers **Simulate successful payment**.
5. Demo confirmation changes the Registration to `REGISTERED`, marks `payment.status` as `PAID`, and makes the QR ticket available.
6. An active member of the event's club (or a platform Admin) can scan the QR. The server atomically changes `REGISTERED` to `CHECKED_IN` and awards AICTE points once.

`Registration` is now the canonical ticket and attendance collection. `Attendance` remains in the project only for legacy migration.

## Club memberships

- `/clubs` lists clubs and their configured membership fee.
- Club Admins can configure `membershipFee` and free-request approval in `/club/settings`.
- A free membership request is `PENDING` when approval is required; a Club Admin approves it from `/club/members`.
- A paid membership uses a demo checkout and becomes `ACTIVE` after the simulated payment confirmation.
- Club-specific authorization is checked against `ClubMember` (`clubId`, `userId`, `role`, `status`). A single `User.clubId` is not used as the permission source.

## Sponsor-to-club proposals

- Sponsors can submit proposals at `/sponsors/connect`.
- Club Admins review proposals at `/club/sponsors`.
- Accepting a proposal creates a `Sponsor` record linked to the originating `SponsorshipInquiry`.
- Platform banner advertisements remain a separate `SponsorAd` workflow. Their checkout is demo-only and ads require admin approval before activation.

## One-time migration from the old Attendance collection

Back up MongoDB first, then configure `.env.local` and run:

```bash
npm run migrate:attendance
```

The migration copies legacy `Attendance` rows into `Registration` when an event/user registration does not already exist, then recalculates each event's `registeredCount`. It does not delete the old Attendance collection.

## Important demo limitations

- Demo payment confirmation is intentionally simulated and is not proof of real payment.
- Do not deploy demo payment endpoints as a real-money payment system.
- Sponsor proposals are partnership inquiries, not contracts or verified funds received.
- The project still needs an end-to-end run against a configured MongoDB database and browser testing before production deployment.

## Student event discovery and registration

1. A Platform Admin or an active Club Admin creates an event in `/admin/events` or `/club/events`.
2. The organizer publishes the event. Only published events appear in the public homepage spotlight and `/events` discovery directory.
3. Students open `/events`, select an event card, and view its date, venue, entry fee, seat availability and AICTE points.
4. For a club event, the student must have an active membership in that club. If not, the event detail page offers the club join flow. Platform events do not require club membership.
5. Free registrations are confirmed immediately. Paid registrations use the clearly labelled demo checkout; no real payment is collected.
6. Confirmed registrations create a QR ticket visible at `/dashboard/attendance`.
7. Club committee/admin users can scan tickets from the check-in desk. Attendance and AICTE points are handled by the existing check-in workflow.

## Student communities, global team finder, and Code Arena

1. Open `/communities` and join a community. Membership is stored per user/community in `CommunityMember`.
2. Open `/communities/hackathon` to publish a team request. Add required skills, team size, remote/hybrid/in-person preference, and optional city/state/country.
3. Other signed-in students can apply with an introduction. The post creator reviews requests and accepts or rejects them.
4. Accepting an application adds the creator and accepted applicant to a private `TeamChat`. Further accepted applicants are added to the same room. The room is available at `/communities/teams/<teamPostId>/chat` and its API checks membership on every read/send.
5. Chat updates are polled every four seconds. This is near-real-time polling, not a WebSocket connection.
6. Open `/code-arena` to submit LeetCode and GitHub handles, self-reported stats, and city/state/country. These entries are explicitly marked self-reported; they are not verified by platform APIs in this implementation.

### New collections

- `CommunityMember`: community membership and join/leave state.
- `TeamChat`: one private room per team post and its accepted member IDs.
- `TeamChatMessage`: messages in a team room.
- `GitHubProfile`: student GitHub profile and self-reported public stats.

`TeamApplication` now references `TeamPost` and has `PENDING`, `ACCEPTED`, and `REJECTED` states. `TeamPost` includes team size, open positions, work mode, and city/state/country.
