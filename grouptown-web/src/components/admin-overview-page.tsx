'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getAdminOverviewLiveData, type LiveAdminMember, type LiveAdminMetric } from '@/lib/firebase/admin-live-data';
import { routes } from '@/lib/routes';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

export function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<LiveAdminMetric[]>([]);
  const [recentMembers, setRecentMembers] = useState<LiveAdminMember[]>([]);
  const [usedFirebase, setUsedFirebase] = useState(false);

  useEffect(() => {
    let active = true;

    getAdminOverviewLiveData().then((result) => {
      if (!active) {
        return;
      }

      setMetrics(result.metrics);
      setRecentMembers(result.recentMembers);
      setUsedFirebase(result.usedFirebase);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell
      activeKey="overview"
      pageTitle="SHOP Admin Overview"
      pageSummary="Track live SHOP applications, member assignments, current group rollout, and delivery-slot usage from one admin command surface.">
      <div className={styles.stack}>
        <section className={styles.liveStrip}>
          <div className={styles.liveStripBlock}>
            <div className={styles.panelLabel}>Live posture</div>
            <h2 className={styles.liveStripTitle}>Operational command surface for SHOP</h2>
            <p className={styles.mutedText}>
              This overview now reflects live Firebase records for application volume, member approvals, group rollout, and slot uptake.
            </p>
          </div>
          <div className={styles.liveStripActions}>
            <Link className={styles.primaryButton} href={routes.adminApplications}>
              Open review queue
            </Link>
            <div className={styles.statusTag}>{usedFirebase ? 'Firebase connected' : 'Fallback mode'}</div>
          </div>
        </section>

        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <article key={metric.label} className={styles.metricCard}>
              <div className={styles.metricLabel}>{metric.label}</div>
              <div className={styles.metricValue}>{metric.value}</div>
              <p className={styles.metricMeta}>{metric.meta}</p>
            </article>
          ))}
        </div>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>Live members</div>
                <h2 className={styles.panelTitle}>Recent member records</h2>
              </div>
              <Link className={styles.secondaryButton} href={routes.adminMembers}>
                Open members page
              </Link>
            </div>

            <div className={styles.queueBoard}>
              {recentMembers.map((member) => (
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
              {recentMembers.length === 0 ? (
                <article className={styles.queueCard}>
                  <div className={styles.queueTop}>
                    <div>
                      <div className={styles.queuePrimary}>No live member records yet</div>
                      <div className={styles.queueSecondary}>Connect Firebase or create member accounts to populate this overview.</div>
                    </div>
                  </div>
                </article>
              ) : null}
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Current posture</div>
            <h2 className={styles.noteTitle}>Spark-safe admin flow</h2>
            <p className={styles.noteBody}>
              Admin reads are live from Firestore, and privileged approval, finance, cohort, slot-sync, and notification fanout now run through deployed Firebase Functions.
            </p>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
