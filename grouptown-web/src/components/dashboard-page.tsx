'use client';

import { useSearchParams } from 'next/navigation';

import type { DashboardPageData, DashboardState } from '@/lib/firebase/dashboard-data';

import shellStyles from './workspace-shell.module.css';
import styles from './dashboard-page.module.css';
import { WorkspaceShell } from './workspace-shell';

type DashboardPageProps = {
  data: DashboardPageData;
};

const allowedStates: DashboardState[] = [
  'active-participant',
  'new-user',
  'action-required',
  'loading',
  'error',
];

function isDashboardState(value: string | null): value is DashboardState {
  return value !== null && allowedStates.includes(value as DashboardState);
}

export function DashboardPage({ data }: DashboardPageProps) {
  const searchParams = useSearchParams();
  const requestedState = searchParams.get('state');
  const currentState = isDashboardState(requestedState) ? requestedState : data.defaultState;

  return (
    <WorkspaceShell
      activeNav="dashboard"
      currentUserName={data.currentUserName}
      currentUserRole={data.currentUserRole}
      pageTitle={data.pageTitle}
      workspaceLabel={data.workspaceLabel}
      workspaceName={data.workspaceName}>
      <div className={styles.stateWrap}>
        {currentState === 'active-participant' ? <ActiveParticipantState data={data} /> : null}
        {currentState === 'new-user' ? <NewUserState /> : null}
        {currentState === 'action-required' ? <ActionRequiredState /> : null}
        {currentState === 'loading' ? <LoadingState /> : null}
        {currentState === 'error' ? <ErrorState /> : null}
      </div>
    </WorkspaceShell>
  );
}

function ActiveParticipantState({ data }: { data: DashboardPageData }) {
  return (
    <>
      <div className={styles.dualGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderStack}>
              <h2 className={styles.sectionTitle}>Good morning, {data.currentUserName.split(' ')[0]}</h2>
              <p className={styles.mutedText}>Status: Active Participation</p>
            </div>
            <div>
              <div className={styles.smallMeta}>Property Enquiries</div>
              <div className={styles.mainMetric}>02</div>
            </div>
          </div>

          <div className={styles.programCardGrid}>
            <div className={styles.programCard}>
              <div className={styles.programTop}>
                <div>
                  <h3 className={styles.cardTitle}>S.H.O.P.</h3>
                  <p className={styles.mutedText}>Sedan Home Ownership</p>
                </div>
                <span className="material-symbols-outlined">apartment</span>
              </div>
              <div className={styles.programBottom}>
                <span className={styles.programState}>
                  <span className={styles.stateDot} />
                  In Progress
                </span>
                <span className={styles.programRef}>Ref: 992-01</span>
              </div>
            </div>

            <div className={styles.programCard}>
              <div className={styles.programTop}>
                <div>
                  <h3 className={styles.cardTitle}>Collective Ownership</h3>
                  <p className={styles.mutedText}>Group A-12</p>
                </div>
                <span className="material-symbols-outlined">groups_3</span>
              </div>
              <div className={styles.programBottom}>
                <span className={styles.programState}>
                  <span className="material-symbols-outlined">check_circle</span>
                  Up to date
                </span>
                <span className={styles.programRef}>5 Members</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.timelinePanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.sectionTitle}>Recent activity</h3>
          </div>
          <div className={styles.timelineList}>
            <div className={styles.timelineItem}>
              <span className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
              <div className={styles.timelineText}>
                <p className={styles.strongText}>Document verified</p>
                <p className={styles.timelineMeta}>2 hours ago</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDot} />
              <div className={styles.timelineText}>
                <p className={styles.mutedText}>Group notice posted</p>
                <p className={styles.timelineMeta}>Yesterday</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDot} />
              <div className={styles.timelineText}>
                <p className={styles.mutedText}>Enquiry status updated</p>
                <p className={styles.timelineMeta}>3 days ago</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.dualGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.sectionTitle}>Upcoming actions</h3>
          </div>
          <div className={styles.actionList}>
            <div className={`${styles.actionRow} ${styles.actionRowPrimary}`}>
              <div className={styles.actionIcon}>
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <div className={styles.actionContent}>
                <p className={styles.strongText}>Upload Proof of Residence</p>
                <p className={styles.mutedText}>Verification documents are ready for review once uploaded.</p>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
            <div className={styles.actionRow}>
              <div className={styles.actionIcon}>
                <span className="material-symbols-outlined">event</span>
              </div>
              <div className={styles.actionContent}>
                <p className={styles.strongText}>Confirm Group Meeting</p>
                <p className={styles.mutedText}>Digital session scheduled for Thursday at 14:00 GMT.</p>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </div>
        </section>

        <section className={shellStyles.supportCard}>
          <div className={styles.supportHeader}>
            <span className="material-symbols-outlined">contact_support</span>
            <h4>{data.supportLabel}</h4>
          </div>
          <p className={shellStyles.supportDescription}>{data.supportDescription}</p>
          <button className={shellStyles.secondaryButton} type="button">
            {data.supportButtonLabel}
          </button>
        </section>
      </div>
    </>
  );
}

function NewUserState() {
  return (
    <>
      <section className={styles.heroBanner}>
        <div className={styles.bannerText}>
          <h2 className={styles.sectionTitle}>Welcome to GroupTown.</h2>
          <p>Start your journey by exploring our verified investment programmes and community groups.</p>
        </div>
        <button className={shellStyles.secondaryButton} type="button">
          Start First Application
        </button>
      </section>

      <div className={styles.dualGrid}>
        <div className={styles.panel}>
          <div className={styles.emptyStateCard}>
            <span className={`material-symbols-outlined ${styles.emptyIcon}`}>event_busy</span>
            <h3 className={styles.sectionTitle}>No active programmes yet</h3>
            <p className={styles.emptyText}>
              Your application history and active portfolio will appear here once you begin. Explore our
              curated opportunities to get started.
            </p>
            <button className={shellStyles.secondaryButton} type="button">
              Explore Programmes
            </button>
          </div>

          <div className={styles.subMetricGrid}>
            <div className={styles.subMetricCard}>
              <div className={styles.metricLabel}>Active Groups</div>
              <div className={styles.metricValue}>0</div>
              <p className={styles.mutedText}>Join communities of interest.</p>
            </div>
            <div className={styles.subMetricCard}>
              <div className={styles.metricLabel}>Saved Items</div>
              <div className={styles.metricValue}>0</div>
              <p className={styles.mutedText}>Bookmark what inspires you.</p>
            </div>
          </div>
        </div>

        <div className={styles.notificationList}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Upcoming actions</h3>
            </div>
            <div className={styles.actionList}>
              <div className={`${styles.actionRow} ${styles.actionRowPrimary}`}>
                <div className={styles.actionIcon}>
                  <span className="material-symbols-outlined">task_alt</span>
                </div>
                <div className={styles.actionContent}>
                  <p className={styles.strongText}>Complete profile setup</p>
                  <p className={styles.mutedText}>Verification documents pending upload.</p>
                </div>
              </div>
              <div className={styles.actionRow}>
                <div className={styles.actionIcon}>
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div className={styles.actionContent}>
                  <p className={styles.strongText}>Link bank account</p>
                  <p className={styles.mutedText}>Unlock payments and withdrawals.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.timelinePanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Activity log</h3>
            </div>
            <div className={styles.timelineList}>
              <div className={styles.timelineItem}>
                <span className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                <div className={styles.timelineText}>
                  <p className={styles.strongText}>Account Verified</p>
                  <p className={styles.mutedText}>Your workspace access was approved.</p>
                  <p className={styles.timelineMeta}>2 hours ago</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                <div className={styles.timelineText}>
                  <p className={styles.strongText}>Workspace Created</p>
                  <p className={styles.mutedText}>Initial configuration successful.</p>
                  <p className={styles.timelineMeta}>5 hours ago</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className={styles.featuredPanel}>
        <div className={styles.featuredInner}>
          <div className={styles.bannerText}>
            <span className={`${styles.statusBadge} ${styles.statusBadgeSolid}`}>Featured Insight</span>
            <h2 className={styles.sectionTitle}>Navigating the new workspace ecosystem.</h2>
            <p className={styles.mutedText}>
              Learn how to maximize your group participation and property oversight with our institutional guide.
            </p>
            <button className={shellStyles.ghostButton} type="button">
              Read the guide
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className={styles.featuredMedia} />
        </div>
      </section>
    </>
  );
}

function ActionRequiredState() {
  return (
    <>
      <section className={styles.priorityBanner}>
        <div className={styles.priorityContent}>
          <span className={`material-symbols-outlined ${styles.priorityIcon}`}>warning</span>
          <div className={styles.bannerText}>
            <h2 className={styles.sectionTitle}>Action Required: Document Correction</h2>
            <p>
              Your submission for the 2024 Institutional Holdings Programme contains clerical
              discrepancies in Annex B. Corrective action is required within 48 hours to prevent
              processing delays.
            </p>
          </div>
        </div>
        <button className={shellStyles.secondaryButton} type="button">
          Review Changes
        </button>
      </section>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Active Assets</span>
          <span className={styles.metricValue}>08</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Pending Tasks</span>
          <span className={styles.metricValue}>03</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Portfolio Value</span>
          <span className={styles.metricValue}>$24.8M</span>
        </div>
      </div>

      <div className={styles.dualGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderStack}>
              <div className={styles.statusChipRow}>
                <span className={`${styles.statusBadge} ${styles.statusBadgeSolid}`}>Institutional</span>
                <span className={`${styles.statusBadge} ${styles.statusBadgeDanger}`}>
                  <span className="material-symbols-outlined">error</span>
                  Needs Attention
                </span>
              </div>
              <h3 className={styles.sectionTitle}>2024 Institutional Holdings Programme</h3>
              <p className={styles.mutedText}>Asset Allocation ID: GT-990-2024-X</p>
            </div>
            <div>
              <div className={styles.smallMeta}>Next Milestone</div>
              <div className={styles.strongText}>Quarterly Audit - Oct 15</div>
            </div>
          </div>

          <div className={styles.actionRowPrimary}>
            <div className={styles.actionRow}>
              <div className={styles.actionIcon}>
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className={styles.actionContent}>
                <p className={styles.strongText}>Amended Certification of Trust</p>
                <p className={styles.mutedText}>
                  Document must be notarized and uploaded in PDF/A format.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.panelHeader}>
            <div />
            <button className={shellStyles.secondaryButton} type="button">
              <span className="material-symbols-outlined">upload</span>
              Upload Document
            </button>
          </div>
        </section>

        <div className={styles.notificationList}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Upcoming actions</h3>
            </div>
            <div className={styles.actionList}>
              <div className={`${styles.actionRow} ${styles.actionRowPrimary}`}>
                <div className={styles.actionIcon}>
                  <span className="material-symbols-outlined">priority_high</span>
                </div>
                <div className={styles.actionContent}>
                  <p className={styles.strongText}>Annex B Discrepancy</p>
                  <p className={styles.mutedText}>Review and sign correction request.</p>
                </div>
                <span className={styles.metricNote}>2d Left</span>
              </div>
              <div className={styles.actionRow}>
                <div className={styles.actionIcon}>
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div className={styles.actionContent}>
                  <p className={styles.strongText}>Q3 Management Fees</p>
                  <p className={styles.mutedText}>Invoice #GT-88229 is ready for review.</p>
                </div>
              </div>
              <div className={styles.actionRow}>
                <div className={styles.actionIcon}>
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div className={styles.actionContent}>
                  <p className={styles.strongText}>Annual General Meeting</p>
                  <p className={styles.mutedText}>Confirm attendance for the digital session.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.timelinePanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Recent activity</h3>
            </div>
            <div className={styles.timelineList}>
              <div className={styles.timelineItem}>
                <span className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                <div className={styles.timelineText}>
                  <p className={styles.strongText}>System Alert: Correction request issued</p>
                  <p className={styles.timelineMeta}>Today, 09:14 AM</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDot} />
                <div className={styles.timelineText}>
                  <p className={styles.mutedText}>Portfolio Update: Blue Ridge Corporate added to Groups.</p>
                  <p className={styles.timelineMeta}>Yesterday, 04:30 PM</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <>
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <div className={styles.skeletonLine} style={{ width: index % 2 === 0 ? '40%' : '55%' }} />
            <div className={styles.skeletonBlock} style={{ width: index % 2 === 0 ? '60%' : '72%' }} />
            <div className={styles.skeletonSmall} style={{ width: index % 2 === 0 ? '32%' : '40%' }} />
          </div>
        ))}
      </div>

      <div className={styles.dualGrid}>
        <section className={styles.skeletonPanel}>
          <div className={styles.skeletonLine} style={{ width: '28%', marginBottom: '24px' }} />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.actionRow}>
              <div className={styles.skeletonBlock} style={{ width: '40px', height: '40px' }} />
              <div className={styles.actionContent}>
                <div className={styles.skeletonLine} style={{ width: index === 0 ? '72%' : '56%' }} />
                <div className={styles.skeletonSmall} style={{ width: index === 0 ? '24%' : '30%' }} />
              </div>
            </div>
          ))}
        </section>

        <section className={styles.skeletonPanel}>
          <div className={styles.skeletonBlock} style={{ width: '100%', height: '128px', marginBottom: '24px' }} />
          <div className={styles.skeletonLine} style={{ width: '100%', marginBottom: '12px' }} />
          <div className={styles.skeletonLine} style={{ width: '84%', marginBottom: '24px' }} />
          <div className={styles.skeletonSmall} style={{ width: '40%', marginBottom: '8px' }} />
          <div className={styles.skeletonSmall} style={{ width: '28%' }} />
        </section>
      </div>
    </>
  );
}

function ErrorState() {
  return (
    <>
      <section className={styles.errorPanel}>
        <div className={styles.errorIconWrap}>
          <span className="material-symbols-outlined">error_outline</span>
        </div>
        <h2 className={styles.errorTitle}>Data Connection Interrupted</h2>
        <p className={styles.mutedText}>Unable to load some data. Please try again.</p>
        <div style={{ marginTop: '24px' }}>
          <button className={shellStyles.secondaryButton} type="button">
            Retry Connection
          </button>
        </div>
      </section>

      <div className={styles.alertPanel}>
        <div className={styles.priorityContent}>
          <span className="material-symbols-outlined">info</span>
          <div className={styles.bannerText}>
            <p className={styles.strongText}>Last known state is preserved.</p>
            <p className={styles.mutedText}>
              Recent activity, metrics, and documents will repopulate automatically once the connection is
              restored.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
