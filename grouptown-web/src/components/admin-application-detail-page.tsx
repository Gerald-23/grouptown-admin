'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';
import {
  approveApplicationAndAssign,
  getApplicationDetail,
  requestApplicationCorrection,
  type AdminApplicationDetail,
} from '@/lib/firebase/admin-applications-data';
import { routes } from '@/lib/routes';

export function AdminApplicationDetailPage({ applicationId }: { applicationId: string }) {
  const [detail, setDetail] = useState<AdminApplicationDetail | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    getApplicationDetail(applicationId).then((result) => {
      if (!active) {
        return;
      }

      setDetail(result);
    });

    return () => {
      active = false;
    };
  }, [applicationId]);

  const handleApprove = async () => {
    setBusy(true);
    const ok = await approveApplicationAndAssign(applicationId);
    if (ok) {
      setDetail((current) =>
        current
          ? {
              ...current,
              status: 'approved',
              reviewNote: 'Registration approved. Member can now join or create a group.',
            }
          : current
      );
    }
    setBusy(false);
  };

  const handleCorrection = async () => {
    setBusy(true);
    const ok = await requestApplicationCorrection(applicationId);
    if (ok) {
      setDetail((current) =>
        current
          ? {
              ...current,
              status: 'corrections_requested',
              reviewNote: 'Correction requested from admin dashboard.',
            }
          : current
      );
    }
    setBusy(false);
  };

  return (
    <AdminShell
      activeKey="applications"
      pageTitle="Application Detail"
      pageSummary="Open one SHOP application at a time so the queue stays lighter and admins only load the deeper record when it is actually needed.">
      <div className={styles.stack}>
        <section className={styles.commandBar}>
          <div className={styles.commandCopy}>
            <div className={styles.panelLabel}>Application review detail</div>
            <h2 className={styles.commandTitle}>{detail?.applicantName ?? 'Loading application...'}</h2>
            <p className={styles.mutedText}>
              Review the full record here, then approve registration or request corrections. Group membership is chosen separately by the member.
            </p>
          </div>
          <div className={styles.commandActions}>
            <Link className={styles.secondaryButton} href={routes.adminApplications}>
              Back to queue
            </Link>
          </div>
        </section>

        {detail ? (
          <>
            <div className={styles.twoColumn}>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelLabel}>Applicant</div>
                    <h2 className={styles.panelTitle}>{detail.applicantName}</h2>
                  </div>
                  <div className={styles.statusTag}>{detail.status}</div>
                </div>

                <div className={styles.panelBody}>
                  <div className={styles.inlineStats}>
                    <div className={styles.inlineStat}>
                      <span className={styles.inlineStatLabel}>Email</span>
                      <strong>{detail.email}</strong>
                    </div>
                    <div className={styles.inlineStat}>
                      <span className={styles.inlineStatLabel}>Employer</span>
                      <strong>{detail.employerLabel}</strong>
                    </div>
                    <div className={styles.inlineStat}>
                      <span className={styles.inlineStatLabel}>Telephone</span>
                      <strong>{detail.phoneLabel}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.noteCard}>
                <div className={styles.panelLabel}>Assignment</div>
                <h2 className={styles.noteTitle}>{detail.categoryLabel}</h2>
                <p className={styles.noteBody}>
                  Delivery selection: {detail.deliveryLabel}. Current note: {detail.reviewNote ?? 'No admin note yet.'}
                </p>
              </section>
            </div>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelLabel}>Review actions</div>
                  <h2 className={styles.panelTitle}>Admin controls</h2>
                </div>
              </div>

              <div className={styles.panelBody}>
                <div className={styles.buttonRow}>
                  <button className={styles.primaryButton} type="button" disabled={busy} onClick={handleApprove}>
                    {busy ? 'Working...' : 'Approve registration'}
                  </button>
                  <button className={styles.secondaryButton} type="button" disabled={busy} onClick={handleCorrection}>
                    Request correction
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.mutedText}>This application could not be loaded.</p>
            </div>
          </section>
        )}
      </div>
    </AdminShell>
  );
}
