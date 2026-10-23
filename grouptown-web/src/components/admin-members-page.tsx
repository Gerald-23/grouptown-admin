'use client';

import { useEffect, useState } from 'react';

import { getAdminMembersLiveData, type LiveAdminMember } from '@/lib/firebase/admin-live-data';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

export function AdminMembersPage() {
  const [members, setMembers] = useState<LiveAdminMember[]>([]);
  const [usedFirebase, setUsedFirebase] = useState(false);

  useEffect(() => {
    let active = true;

    getAdminMembersLiveData().then((result) => {
      if (!active) {
        return;
      }

      setMembers(result.members);
      setUsedFirebase(result.usedFirebase);
    });

    return () => {
      active = false;
    };
  }, []);

  const approvedCount = members.filter((member) => member.statusLabel.toLowerCase() === 'approved').length;
  const pendingCount = members.filter((member) => member.statusLabel.toLowerCase().includes('pending')).length;

  return (
    <AdminShell
      activeKey="members"
      pageTitle="Live Member Records"
      pageSummary="Inspect live member identity, registration state, and current group assignment from Firebase-backed SHOP member records.">
      <div className={styles.stack}>
        <section className={styles.commandBar}>
          <div className={styles.commandCopy}>
            <div className={styles.panelLabel}>Live member surface</div>
            <h2 className={styles.commandTitle}>Firebase-backed member records</h2>
            <p className={styles.mutedText}>
              This page now reads real member accounts, registration state, and assigned group labels from the current SHOP backend records.
            </p>
          </div>
          <div className={styles.commandActions}>
            <div className={styles.statusTag}>{usedFirebase ? 'Firebase connected' : 'Fallback mode'}</div>
          </div>
        </section>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>Member totals</div>
                <h2 className={styles.panelTitle}>{members.length} live records</h2>
              </div>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.inlineStats}>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>Approved</span>
                  <strong>{approvedCount}</strong>
                </div>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>Pending</span>
                  <strong>{pendingCount}</strong>
                </div>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>Assigned groups</span>
                  <strong>{members.filter((member) => member.groupLabel !== 'No group assigned').length}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>What is live</div>
            <h2 className={styles.noteTitle}>Member state comes from current records</h2>
            <p className={styles.noteBody}>
              Status labels now derive from live `shopUsers` and registration records, while group labels resolve from the current `groups` collection.
            </p>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Members</div>
              <h2 className={styles.panelTitle}>Current live member list</h2>
            </div>
          </div>

          <div className={styles.queueBoard}>
            {members.map((member) => (
              <article key={member.id} className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>{member.name}</div>
                    <div className={styles.queueSecondary}>{member.email}</div>
                  </div>
                  <div className={styles.queuePill}>{member.statusLabel}</div>
                </div>
                <div className={styles.queueMiddle}>
                  {member.role} / {member.groupLabel}
                </div>
                <div className={styles.queueFoot}>
                  <div className={styles.queueFootCopy}>
                    <strong>Last update</strong>
                    <div className={styles.tableCellSecondary}>{member.updatedLabel}</div>
                  </div>
                </div>
              </article>
            ))}
            {members.length === 0 ? (
              <article className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>No live members found</div>
                    <div className={styles.queueSecondary}>Create or sign in member accounts to populate this page.</div>
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
