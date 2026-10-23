'use client';

import { useEffect, useMemo, useState } from 'react';

import { resolveSystemAlert, subscribeToSystemAlerts, type SystemAlertRecord } from '@/lib/firebase/system-alerts';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

export function AdminErrorsPage() {
  const [alerts, setAlerts] = useState<SystemAlertRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToSystemAlerts((items) => {
      setAlerts(items);
    });
  }, []);

  const openAlerts = useMemo(() => alerts.filter((item) => item.status === 'open'), [alerts]);
  const resolvedAlerts = useMemo(() => alerts.filter((item) => item.status === 'resolved'), [alerts]);

  return (
    <AdminShell
      activeKey="errors"
      pageTitle="System Errors"
      pageSummary="Track backend and system issues that were raised by the member app or the admin console, then resolve them after the root cause is fixed.">
      <div className={styles.stack}>
        <section className={styles.liveStrip}>
          <div className={styles.liveStripBlock}>
            <div className={styles.panelLabel}>Reminder queue</div>
            <h2 className={styles.liveStripTitle}>System issues that still need attention</h2>
            <p className={styles.mutedText}>
              Open issues stay visible here until an admin marks them resolved after the underlying backend problem has been fixed.
            </p>
          </div>
          <div className={styles.liveStripActions}>
            <div className={styles.statusTag}>{openAlerts.length} open</div>
            <div className={styles.statusTag}>{resolvedAlerts.length} resolved</div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Open issues</div>
              <h2 className={styles.panelTitle}>Backend and system faults</h2>
            </div>
          </div>

          <div className={styles.queueBoard}>
            {openAlerts.map((alert) => (
              <article key={alert.id} className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>{alert.message}</div>
                    <div className={styles.queueSecondary}>
                      {alert.sourceApp} / {alert.sourceArea} / {alert.updatedAtLabel}
                    </div>
                  </div>
                  <div className={styles.queuePill}>{alert.severity}</div>
                </div>
                <div className={styles.queueMiddle}>
                  {alert.code || 'No Firebase code'} {alert.userEmail ? ` / ${alert.userEmail}` : ''}
                </div>
                <div className={styles.rowActionArea}>
                  <button
                    className={styles.miniActionButton}
                    disabled={busyId === alert.id}
                    type="button"
                    onClick={async () => {
                      setBusyId(alert.id);
                      try {
                        await resolveSystemAlert(alert.id);
                      } finally {
                        setBusyId(null);
                      }
                    }}>
                    {busyId === alert.id ? 'Resolving...' : 'Mark resolved'}
                  </button>
                </div>
              </article>
            ))}

            {openAlerts.length === 0 ? (
              <article className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>No open system issues</div>
                    <div className={styles.queueSecondary}>The reminder queue is currently clear.</div>
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        </section>

        <section className={styles.noteCard}>
          <div className={styles.panelLabel}>Recently resolved</div>
          <h2 className={styles.noteTitle}>Closed reminders</h2>
          <div className={styles.noteBody}>
            {resolvedAlerts.slice(0, 5).map((alert) => (
              <p key={alert.id} className={styles.mutedText}>
                {alert.updatedAtLabel}: {alert.message}
              </p>
            ))}
            {resolvedAlerts.length === 0 ? (
              <p className={styles.mutedText}>No resolved issues have been recorded yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
