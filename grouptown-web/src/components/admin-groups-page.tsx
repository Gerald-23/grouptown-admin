'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';
import {
  CITY_OF_ANGELS_COHORT_ID,
  defaultCohortConfig,
  defaultInterestOptions,
  defaultPaymentYearOptions,
  getCohortAdminData,
  saveCohortConfig,
  type CohortConfig,
  type GroupCategory,
  type GroupSummary,
  type PaymentTerm,
  type UnitInterest,
} from '@/lib/firebase/cohort-admin-data';
import {
  approveGroupCreationRequest,
  declineGroupCreationRequest,
  getPendingGroupCreationRequests,
  type AdminGroupCreationRequest,
} from '@/lib/firebase/group-creation-admin-data';

const interestChoices: Array<{ value: UnitInterest; label: string }> = [...defaultInterestOptions];
const paymentChoices: PaymentTerm[] = [...defaultPaymentYearOptions];

export function AdminGroupsPage() {
  const [cohort, setCohort] = useState<CohortConfig>(defaultCohortConfig);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [groupRequests, setGroupRequests] = useState<AdminGroupCreationRequest[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);

  const loadPageData = async () => {
    const [cohortResult, requests] = await Promise.all([
      getCohortAdminData(),
      getPendingGroupCreationRequests(),
    ]);

    setCohort(cohortResult.activeCohort);
    setGroups(cohortResult.groups);
    setGroupRequests(requests);
    setIsLive(cohortResult.usedFirebase);
  };

  useEffect(() => {
    let active = true;

    Promise.all([getCohortAdminData(), getPendingGroupCreationRequests()]).then(([result, requests]) => {
      if (!active) {
        return;
      }

      setCohort(result.activeCohort);
      setGroups(result.groups);
      setGroupRequests(requests);
      setIsLive(result.usedFirebase);
    });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo<GroupCategory[]>(() => {
    return cohort.interestOptions.flatMap((interest) =>
      cohort.paymentYearOptions.map((paymentTerm) => ({
        key: `${cohort.id}|${interest.value}|${paymentTerm}`,
        interest: interest.value,
        interestLabel: interest.label,
        paymentTerm,
        label: `${interest.label} - ${paymentTerm}`,
      }))
    );
  }, [cohort]);

  const openGroups = groups.filter((group) => group.status !== 'full').length;

  const toggleInterest = (choice: { value: UnitInterest; label: string }) => {
    setCohort((current) => {
      const exists = current.interestOptions.some((item) => item.value === choice.value);
      const next = exists
        ? current.interestOptions.filter((item) => item.value !== choice.value)
        : [...current.interestOptions, choice];

      return {
        ...current,
        interestOptions: next.length > 0 ? next : current.interestOptions,
      };
    });
  };

  const togglePayment = (payment: PaymentTerm) => {
    setCohort((current) => {
      const exists = current.paymentYearOptions.includes(payment);
      const next = exists
        ? current.paymentYearOptions.filter((item) => item !== payment)
        : [...current.paymentYearOptions, payment];

      return {
        ...current,
        paymentYearOptions: next.length > 0 ? next : current.paymentYearOptions,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await saveCohortConfig({ ...cohort, id: CITY_OF_ANGELS_COHORT_ID });
    setSaving(false);
    setIsLive(true);
  };

  const handleRequestReview = async (requestId: string, action: 'approve' | 'decline') => {
    setReviewingRequestId(requestId);
    const ok = action === 'approve'
      ? await approveGroupCreationRequest(requestId)
      : await declineGroupCreationRequest(requestId);
    setReviewingRequestId(null);

    if (ok) {
      await loadPageData();
    }
  };

  return (
    <AdminShell
      activeKey="groups"
      pageTitle="City of Angels Cohort Management"
      pageSummary="Configure the categories members can choose, then review the member requests that create each live SHOP group.">
      <div className={styles.stack}>
        <section className={styles.commandBar}>
          <div className={styles.commandCopy}>
            <div className={styles.panelLabel}>Cohort admin surface</div>
            <h2 className={styles.commandTitle}>City of Angels is now the source of truth</h2>
            <p className={styles.mutedText}>
              Admin defines the project, available interests, payment years, and group size here. Approved members can join an open matching group or ask to start one. Nothing is created automatically.
            </p>
          </div>
          <div className={styles.commandActions}>
            <button className={styles.primaryButton} type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save cohort config'}
            </button>
            <div className={styles.statusTag}>{isLive ? 'Firebase connected' : 'Fallback mode'}</div>
          </div>
        </section>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>Project</div>
                <h2 className={styles.panelTitle}>{cohort.projectName}</h2>
              </div>
              <div className={styles.statusTag}>{cohort.status}</div>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.inlineStats}>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>Categories</span>
                  <strong>{categories.length}</strong>
                </div>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>Open groups</span>
                  <strong>{openGroups}</strong>
                </div>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>Max per group</span>
                  <strong>{cohort.maxMembersPerGroup}</strong>
                </div>
              </div>
              <p className={styles.mutedText}>{cohort.description}</p>
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Implemented rule</div>
            <h2 className={styles.noteTitle}>Interest + years creates the category</h2>
            <p className={styles.noteBody}>
              Every enabled interest is paired with every enabled payment year. Each category can have groups capped at {cohort.maxMembersPerGroup}. A new group begins only when an eligible member requests one and an admin approves it.
            </p>
          </section>
        </div>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>Cohort details</div>
                <h2 className={styles.panelTitle}>Editable Firestore config</h2>
              </div>
            </div>
            <div className={styles.panelBody}>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Project name</span>
                <input
                  className={styles.formInput}
                  value={cohort.projectName}
                  onChange={(event) => setCohort((current) => ({ ...current, projectName: event.target.value }))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Cohort name</span>
                <input
                  className={styles.formInput}
                  value={cohort.cohortName}
                  onChange={(event) => setCohort((current) => ({ ...current, cohortName: event.target.value }))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Cohort code</span>
                <input
                  className={styles.formInput}
                  value={cohort.cohortCode}
                  onChange={(event) => setCohort((current) => ({ ...current, cohortCode: event.target.value }))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Location</span>
                <input
                  className={styles.formInput}
                  value={cohort.location}
                  onChange={(event) => setCohort((current) => ({ ...current, location: event.target.value }))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Description</span>
                <textarea
                  className={styles.formTextarea}
                  value={cohort.description}
                  onChange={(event) => setCohort((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Enabled interests</div>
            <h2 className={styles.noteTitle}>Choose what the cohort can form groups for</h2>
            <div className={styles.buttonRow}>
              {interestChoices.map((choice) => {
                const active = cohort.interestOptions.some((item) => item.value === choice.value);

                return (
                  <button
                    key={choice.value}
                    className={active ? styles.primaryButton : styles.secondaryButton}
                    type="button"
                    onClick={() => toggleInterest(choice)}>
                    {choice.label}
                  </button>
                );
              })}
            </div>
            <div className={styles.panelLabel}>Enabled payment years</div>
            <div className={styles.buttonRow}>
              {paymentChoices.map((choice) => {
                const active = cohort.paymentYearOptions.includes(choice);

                return (
                  <button
                    key={choice}
                    className={active ? styles.primaryButton : styles.secondaryButton}
                    type="button"
                    onClick={() => togglePayment(choice)}>
                    {choice}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Generated categories</div>
              <h2 className={styles.panelTitle}>This is what members can register into</h2>
            </div>
          </div>
          <div className={styles.queueBoard}>
            {categories.map((category) => (
              <article key={category.key} className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>{category.label}</div>
                    <div className={styles.queueSecondary}>{cohort.projectName}</div>
                  </div>
                  <div className={styles.queuePill}>Category</div>
                </div>
                <div className={styles.queueMiddle}>Key: {category.key}</div>
                <div className={styles.queueFoot}>
                  <div className={styles.queueFootCopy}>
                    <strong>{cohort.maxMembersPerGroup} members per group</strong>
                    <div className={styles.tableCellSecondary}>
                      New group created only after a reviewed member request
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Group creation requests</div>
              <h2 className={styles.panelTitle}>Member requests awaiting review</h2>
            </div>
            <div className={styles.statusTag}>{groupRequests.length} pending</div>
          </div>
          <div className={styles.queueBoard}>
            {groupRequests.map((groupRequest) => (
              <article key={groupRequest.id} className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>{groupRequest.requesterName}</div>
                    <div className={styles.queueSecondary}>{groupRequest.requesterEmail}</div>
                  </div>
                  <div className={styles.queuePill}>Pending review</div>
                </div>
                <div className={styles.queueMiddle}>{groupRequest.categoryLabel} · {groupRequest.maxMembers} members</div>
                <div className={styles.queueFoot}>
                  <div className={styles.queueFootCopy}>
                    <strong>{groupRequest.notes}</strong>
                    <div className={styles.tableCellSecondary}>
                      Approval creates the new group and adds this requester as member one.
                    </div>
                  </div>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      disabled={reviewingRequestId !== null}
                      onClick={() => handleRequestReview(groupRequest.id, 'approve')}>
                      {reviewingRequestId === groupRequest.id ? 'Working...' : 'Approve group'}
                    </button>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      disabled={reviewingRequestId !== null}
                      onClick={() => handleRequestReview(groupRequest.id, 'decline')}>
                      Decline
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {groupRequests.length === 0 ? (
              <article className={styles.queueCard}>
                <div className={styles.queuePrimary}>No group requests awaiting review</div>
                <div className={styles.queueSecondary}>New groups appear here only after an approved member submits a request.</div>
              </article>
            ) : null}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Existing groups</div>
              <h2 className={styles.panelTitle}>City of Angels group rollout</h2>
            </div>
          </div>
          <div className={styles.queueBoard}>
            {groups.map((group) => (
              <article key={group.id} className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>{group.name}</div>
                    <div className={styles.queueSecondary}>
                      Cohort {String(group.cohortNumber).padStart(2, '0')} / {group.interestLabel} / {group.paymentTerm}
                    </div>
                  </div>
                  <div className={styles.queuePill}>{group.status}</div>
                </div>
                <div className={styles.queueMiddle}>
                  {group.memberCount} of {group.maxMembers} members assigned
                </div>
                <div className={styles.queueFoot}>
                  <div className={styles.queueFootCopy}>
                    <strong>{group.categoryKey}</strong>
                    <div className={styles.tableCellSecondary}>
                      This group belongs to the current {cohort.projectName} category rule set.
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
