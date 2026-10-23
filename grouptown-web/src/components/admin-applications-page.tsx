'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';
import {
  getPendingApplications,
  type AdminApplicationItem,
} from '@/lib/firebase/admin-applications-data';
import { routes } from '@/lib/routes';

export function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplicationItem[]>([]);
  const [usedFirebase, setUsedFirebase] = useState(false);

  useEffect(() => {
    let active = true;

    getPendingApplications().then((result) => {
      if (!active) {
        return;
      }

      setApplications(result.applications);
      setUsedFirebase(result.usedFirebase);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell
      activeKey="applications"
      pageTitle="SHOP Applications"
      pageSummary="Review pending SHOP submissions, request corrections, and assign approved members into groups from the admin dashboard while Spark is still the active plan.">
      <div className={styles.stack}>
        <section className={styles.commandBar}>
          <div className={styles.commandCopy}>
            <div className={styles.panelLabel}>Live application queue</div>
            <h2 className={styles.commandTitle}>Admin-controlled approval and assignment</h2>
            <p className={styles.mutedText}>
              Members now submit into a pending review queue. Shared group membership is only changed from this admin surface.
            </p>
          </div>
          <div className={styles.commandActions}>
            <div className={styles.statusTag}>{usedFirebase ? 'Firebase connected' : 'Fallback mode'}</div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Pending registrations</div>
              <h2 className={styles.panelTitle}>{applications.length} awaiting review</h2>
            </div>
          </div>

          <div className={styles.queueBoard}>
            {applications.map((item) => (
              <article key={item.id} className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>{item.applicantName}</div>
                    <div className={styles.queueSecondary}>{item.email}</div>
                  </div>
                  <div className={styles.queuePill}>{item.readinessLabel}</div>
                </div>
                <div className={styles.queueMiddle}>
                  {item.categoryLabel} / {item.employerLabel}
                </div>
                <div className={styles.queueFoot}>
                  <div className={styles.queueFootCopy}>
                    <strong>{item.reviewNote ?? 'Open the detail view to review and assign this application.'}</strong>
                    <div className={styles.tableCellSecondary}>Current status: {item.status}</div>
                  </div>
                  <div className={styles.rowActionArea}>
                    <Link className={styles.miniActionButton} href={routes.adminApplicationDetail(item.id)}>
                      Open details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {applications.length === 0 ? (
              <article className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>No pending applications</div>
                    <div className={styles.queueSecondary}>The review queue is currently clear.</div>
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
