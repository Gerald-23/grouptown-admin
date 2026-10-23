'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  adminModules,
  adminPlatformPrinciples,
  type AdminModuleConfig,
  type AdminModuleKey,
  type AdminTableRow,
  adminMetrics,
} from '@/lib/firebase/admin-platform-map';
import { routes } from '@/lib/routes';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

const routeMap: Record<Exclude<AdminModuleKey, 'overview'>, string> = {
  programmes: routes.adminProgrammes,
  interests: routes.adminInterests,
  community: routes.adminCommunity,
  applications: routes.adminApplications,
  broadcasts: routes.adminBroadcasts,
  groups: routes.adminGroups,
  members: routes.adminMembers,
  media: routes.adminMedia,
  settings: routes.adminSettings,
  errors: routes.adminErrors,
  audit: routes.adminAudit,
};

export function AdminOverviewPage() {
  return (
    <AdminShell
      activeKey="overview"
      pageTitle="SHOP Admin Overview"
      pageSummary="This admin console is where the platform will manage applications, broadcasts, groups, members, settings, and audit evidence before and after Firebase wiring lands.">
      <div className={styles.stack}>
        <section className={styles.liveStrip}>
          <div className={styles.liveStripBlock}>
            <div className={styles.panelLabel}>Live posture</div>
            <h2 className={styles.liveStripTitle}>Operational command surface for SHOP</h2>
            <p className={styles.mutedText}>
              Review queues, trigger admin actions, and track system state without exposing raw Firebase mechanics.
            </p>
          </div>
          <div className={styles.liveStripActions}>
            <Link className={styles.primaryButton} href={routes.adminApplications}>
              Open review queue
            </Link>
            <Link className={styles.secondaryButton} href={routes.adminAudit}>
              Check audit trail
            </Link>
          </div>
        </section>

        <div className={styles.metricsGrid}>
          {adminMetrics.map((metric) => (
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
                <div className={styles.panelLabel}>Platform posture</div>
                <h2 className={styles.panelTitle}>How the admin should handle Firebase tasks</h2>
              </div>
            </div>
            <div className={styles.panelBody}>
              <ul className={styles.bulletList}>
                {adminPlatformPrinciples.map((principle) => (
                  <li key={principle}>{principle}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Recommended backend split</div>
            <h2 className={styles.noteTitle}>Use Firestore for records, Functions for privilege</h2>
            <p className={styles.noteBody}>
              Reads and simple controlled updates can live in Firestore with strict rules. Sensitive approvals,
              role assignment, certificate generation, and group lock operations should move through Cloud
              Functions.
            </p>
          </section>
        </div>

        <div className={styles.threeColumn}>
          {adminModules.map((module) => (
            <article key={module.key} className={styles.moduleCard}>
              <div className={styles.moduleTop}>
                <div>
                  <div className={styles.panelLabel}>{module.queueLabel}</div>
                  <div className={styles.queueValue}>{module.queueValue}</div>
                </div>
                <div className={styles.statusTag}>{module.status}</div>
              </div>
              <div className={styles.moduleBody}>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <p className={styles.mutedText}>{module.summary}</p>
                {module.key === 'overview' ? null : (
                  <Link className={styles.secondaryButton} href={routeMap[module.key]}>
                    {module.primaryAction}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminModulePage({
  moduleKey,
  pageSummary,
}: {
  moduleKey: Exclude<AdminModuleKey, 'overview'>;
  pageSummary: string;
}) {
  const module = adminModules.find((item) => item.key === moduleKey) as AdminModuleConfig;
  const rows = module.tableRows;

  const queueValue = useMemo(() => deriveQueueValue(moduleKey, rows), [moduleKey, rows]);

  return (
    <AdminShell activeKey={moduleKey} pageTitle={module.title} pageSummary={pageSummary}>
      <div className={styles.stack}>
        <section className={styles.commandBar}>
          <div className={styles.commandCopy}>
            <div className={styles.panelLabel}>Admin command bar</div>
            <h2 className={styles.commandTitle}>{module.primaryAction}</h2>
            <p className={styles.mutedText}>
              This workspace describes the admin action flow and responsibility map for the live Firebase-backed build.
            </p>
          </div>
          <div className={styles.commandActions}>
            <Link className={styles.secondaryButton} href={routes.admin}>
              Back to overview
            </Link>
          </div>
        </section>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>{module.queueLabel}</div>
                <h2 className={styles.panelTitle}>{queueValue}</h2>
              </div>
              <div className={styles.statusTag}>{module.status}</div>
            </div>

            <div className={styles.panelBody}>
              <p className={styles.mutedText}>{module.summary}</p>
              <div className={styles.inlineStats}>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>Visible rows</span>
                  <strong>{rows.length}</strong>
                </div>
                <div className={styles.inlineStat}>
                  <span className={styles.inlineStatLabel}>State engine</span>
                  <strong>Read-only reference</strong>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Primary admin action</div>
            <h2 className={styles.noteTitle}>{module.primaryAction}</h2>
            <p className={styles.noteBody}>
              This module should keep the admin focused on platform actions like approval, publishing,
              assignment, suspension, or configuration, not raw Firebase operations.
            </p>
          </section>
        </div>

        {module.responsibilities.map((responsibility) => (
          <section key={responsibility.area} className={styles.responsibilityCard}>
            <div className={styles.panelLabel}>{responsibility.area}</div>
            <h2 className={styles.responsibilityTitle}>Firebase responsibility map</h2>

            <div className={styles.threeColumn}>
              <div className={styles.responsibilityBody}>
                <div className={styles.listLabel}>Firestore collections</div>
                <ul className={styles.bulletList}>
                  {responsibility.firestore.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.responsibilityBody}>
                <div className={styles.listLabel}>Privileged functions</div>
                <ul className={styles.functionList}>
                  {(responsibility.functions ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                  {!responsibility.functions?.length ? <li>Not required in the first backend pass</li> : null}
                </ul>
              </div>

              <div className={styles.responsibilityBody}>
                <div className={styles.listLabel}>Admin panel capabilities</div>
                <ul className={styles.capabilityList}>
                  {responsibility.adminActions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {(responsibility.auth?.length ?? 0) > 0 || (responsibility.storage?.length ?? 0) > 0 ? (
              <div className={styles.table}>
                {responsibility.auth?.length ? (
                  <div className={styles.tableRow}>
                    <div className={styles.tableHead}>Auth responsibilities</div>
                    <div className={styles.tableCell}>{responsibility.auth.join(', ')}</div>
                  </div>
                ) : null}
                {responsibility.storage?.length ? (
                  <div className={styles.tableRow}>
                    <div className={styles.tableHead}>Storage responsibilities</div>
                    <div className={styles.tableCell}>{responsibility.storage.join(', ')}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ))}

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>{module.recordsLabel}</div>
                <h2 className={styles.panelTitle}>Operational queue board</h2>
              </div>
            </div>

            <div className={styles.queueBoard}>
              {rows.map((row, index) => (
                <article key={`${row.primary}-${row.middle}`} className={styles.queueCard}>
                  <div className={styles.queueTop}>
                    <div>
                      <div className={styles.queuePrimary}>{row.primary}</div>
                      <div className={styles.queueSecondary}>{row.secondary}</div>
                    </div>
                    <div className={styles.queuePill}>{module.tableHeaders[1]}</div>
                  </div>
                  <div className={styles.queueMiddle}>{row.middle}</div>
                  <div className={styles.queueFoot}>
                    <div className={styles.queueFootCopy}>
                      <strong>{row.trailing}</strong>
                      <div className={styles.tableCellSecondary}>{row.trailingMeta}</div>
                    </div>
                    <div className={styles.rowActionArea}>
                      <span className={styles.tableCellSecondary}>{getActionLabel(moduleKey, row)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className={styles.sideStack}>
            <section className={styles.noteCard}>
              <div className={styles.panelLabel}>Quick admin actions</div>
              <h2 className={styles.noteTitle}>Module cockpit</h2>
              <ul className={styles.capabilityList}>
                {module.quickActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </section>

            <section className={styles.noteCard}>
              <div className={styles.panelLabel}>Action outcome</div>
              <h2 className={styles.noteTitle}>Operational reference</h2>
              <p className={styles.noteBody}>
                Queue cards remain read-only here so the admin console does not imply local mock mutations are part of the live workflow.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function deriveQueueValue(moduleKey: Exclude<AdminModuleKey, 'overview'>, rows: AdminTableRow[]) {
  switch (moduleKey) {
    case 'applications':
      return `${rows.filter((row) => !row.middle.toLowerCase().includes('approved')).length}`;
    case 'programmes':
      return `${rows.length}`;
    case 'broadcasts':
      return `${rows.filter((row) => !row.middle.toLowerCase().includes('archived')).length}`;
    case 'groups':
      return `${rows.filter((row) => !row.middle.toLowerCase().includes('locked')).length}`;
    case 'members':
      return `${rows.filter((row) => !row.middle.toLowerCase().includes('restored')).length}`;
    case 'settings':
      return `${rows.length}`;
    case 'audit':
      return `${rows.length}`;
    default:
      return `${rows.length}`;
  }
}

function getActionLabel(moduleKey: Exclude<AdminModuleKey, 'overview'>, row: AdminTableRow) {
  switch (moduleKey) {
    case 'applications':
      return row.middle.toLowerCase().includes('approved') ? 'Mark reviewed' : 'Apply action';
    case 'programmes':
      return 'Open';
    case 'broadcasts':
      return row.middle.toLowerCase().includes('archived') ? 'Restore' : 'Moderate';
    case 'groups':
      return row.middle.toLowerCase().includes('locked') ? 'Reopen' : 'Advance';
    case 'members':
      return row.middle.toLowerCase().includes('restored') ? 'Suspend again' : 'Resolve';
    case 'settings':
      return 'Publish';
    case 'audit':
      return 'Log event';
    default:
      return 'Update';
  }
}
