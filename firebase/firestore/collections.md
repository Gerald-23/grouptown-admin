# Firestore Collections

Define the shared data model here before both clients start writing records.

Suggested sections:

- `users`
- `profiles`
- `cohorts`
- `groupCategories`
- `groups`
- `groupCreationRequests`
- `shopInterests`
- `waitingInterestRequests`
- `group_members`
- `events`
- `messages`
- `notifications`
- `financeTemplates`
- `shopUsers/{uid}/transactions`

For each collection, document:

- document id strategy
- required fields
- optional fields
- who can read
- who can write
- indexes needed

## `cohorts`

- document id strategy:
  - stable slug, for example `city-of-angels`
- required fields:
  - `projectName`
  - `cohortName`
  - `cohortCode`
  - `status`
  - `interestOptions`
  - `paymentYearOptions`
  - `maxMembersPerGroup`
- optional fields:
  - `description`
  - `location`
  - `createdAt`
  - `updatedAt`
- who can read:
  - web admin, mobile app, public broadcast builders where needed
- who can write:
  - admin only
- indexes needed:
  - `status`

## `groups`

- document id strategy:
  - `<cohortId>-<interest>-<payment-term>-cohort-<n>`
- required fields:
  - `cohortId`
  - `cohortName`
  - `projectName`
  - `categoryKey`
  - `cohortNumber`
  - `interest`
  - `interestLabel`
  - `paymentTerm`
  - `maxMembers`
  - `members`
  - `status`
- optional fields:
  - `createdAt`
  - `updatedAt`
- who can read:
  - web admin, eligible mobile members
- who can write:
  - admin and controlled assignment logic
- indexes needed:
  - `cohortId + categoryKey`
  - `cohortId + cohortNumber`

## `groupCreationRequests`

- document id strategy:
  - `<userId>__<categoryKey>` so one member can have one active request for a home and payment category
- required fields:
  - `userId`
  - `requesterName`
  - `requesterEmail`
  - `cohortId`
  - `categoryKey`
  - `interest`
  - `paymentTerm`
  - `status`
  - `groupId`
  - `createdAt`
  - `updatedAt`
- optional fields:
  - `notes`
  - `reviewNote`
  - `reviewedBy`
  - `reviewedAt`
  - who can read:
  - owning member and admin
- who can write:
  - callable group-request functions only; members cannot write the collection directly
- indexes needed:
  - `status` for the admin review queue

## `financeTemplates`

- document id strategy:
  - one doc per cohort, for example `city-of-angels`
- required fields:
  - `cohortId`
  - `comparisonLabel`
  - `currencySymbol`
  - `contributionGoalLabel`
  - `downPaymentRate`
  - `unitPrices`
  - `deliveryTracks`
- optional fields:
  - `adminNote`
  - `paymentGateway`
  - `createdAt`
  - `updatedAt`
- who can read:
  - web admin, authenticated mobile members
- who can write:
  - admin only
- indexes needed:
  - none in first pass

## `shopInterests`

- document id strategy:
  - stable, URL-safe interest slug, for example `4-bedroom-villa`
- required fields:
  - `programmeId`
  - `label`
  - `status` (`draft` or `published`)
  - `createdAt`
  - `updatedAt`
- published-only fields:
  - `cohortId`
  - `maxMembers`
  - `price`
  - `downPaymentRate`
  - `paymentTerms`
- who can read:
  - admins can read drafts and published records; members can read published records only
- who can write:
  - admins save drafts; the `launchShopInterest` callable publishes and links the cohort atomically

## `waitingInterestRequests`

- document id strategy:
  - generated document id
- required fields:
  - `programmeId`
  - `userId`
  - `userName`
  - `phone`
  - `requestedHome`
  - `status`
  - `createdAt`
  - `updatedAt`
- optional fields:
  - `email`
  - `monthlyBudget`
  - `notes`
- who can read:
  - owning member and admins
- who can write:
  - signed-in member creates their own request; admins manage the lifecycle

## `cohorts/{cohortId}/deliverySlotClaims`

- document id strategy:
  - `<unitInterest>__<paymentTerm>__<deliveryTrack>__<deliverySlot>`
- required fields:
  - `cohortId`
  - `unitInterest`
  - `paymentTerm`
  - `deliveryTrack`
  - `deliverySlot`
  - `userId`
  - `updatedAt`
- optional fields:
  - `createdAt`
- who can read:
  - owning member and admin
- who can write:
  - signed-in owner for their own claim, admin for corrections
- indexes needed:
  - none in first pass

## `cohorts/{cohortId}/deliverySlotAvailability`

- document id strategy:
  - mirror the claim id so Functions can sync directly from the private claim document
- required fields:
  - `cohortId`
  - `deliveryTrack`
  - `deliverySlot`
  - `isAvailable`
  - `updatedAt`
- optional fields:
  - `unitInterest`
  - `paymentTerm`
- who can read:
  - mobile app, web admin, onboarding slot selectors
- who can write:
  - Firebase Functions and admin-only correction flows
- indexes needed:
  - none in first pass

## `shopUsers/{uid}/transactions`

- document id strategy:
  - auto id for each finance event
- required fields:
  - `title`
  - `dateLabel`
  - `amountLabel`
  - `amountValue`
  - `status`
  - `kind`
- optional fields:
  - `icon`
  - `createdAt`
  - `updatedAt`
- who can read:
  - owning member, admin
- who can write:
  - admin or controlled finance workflows
- indexes needed:
  - `createdAt desc`
