'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/components/auth-context';
import { routes } from '@/lib/routes';
import type { AdminModuleKey } from '@/lib/firebase/admin-platform-map';
import { subscribeToSystemAlerts } from '@/lib/firebase/system-alerts';

import styles from './admin-shell.module.css';

type AdminShellProps = {
  activeKey: AdminModuleKey;
  children: ReactNode;
  pageTitle: string;
  pageSummary: string;
};

const navItems = [
  { key: 'overview', label: 'Overview', icon: 'dashboard', href: routes.admin },
  { key: 'programmes', label: 'Programmes', icon: 'apartment', href: routes.adminProgrammes },
  { key: 'interests', label: 'Interests', icon: 'home_work', href: routes.adminInterests },
  { key: 'community', label: 'Community Feed', icon: 'forum', href: routes.adminCommunity },
  { key: 'applications', label: 'Applications', icon: 'assignment', href: routes.adminApplications },
  { key: 'broadcasts', label: 'Broadcasts', icon: 'campaign', href: routes.adminBroadcasts },
  { key: 'groups', label: 'Groups', icon: 'groups', href: routes.adminGroups },
  { key: 'members', label: 'Members', icon: 'person_search', href: routes.adminMembers },
  { key: 'media', label: 'App Media', icon: 'image', href: routes.adminMedia },
  { key: 'settings', label: 'Settings', icon: 'tune', href: routes.adminSettings },
  { key: 'errors', label: 'Errors', icon: 'error', href: routes.adminErrors },
  { key: 'audit', label: 'Audit', icon: 'history', href: routes.adminAudit },
] satisfies Array<{ key: AdminModuleKey; label: string; icon: string; href: string }>;

function navClass(isActive: boolean) {
  return `${styles.navItem} ${isActive ? styles.navItemActive : styles.navItemPassive}`;
}

export function AdminShell({ activeKey, children, pageTitle, pageSummary }: AdminShellProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [systemAlerts, setSystemAlerts] = useState<Array<{
    id: string;
    message: string;
    sourceApp: string;
    sourceArea: string;
    status: 'open' | 'resolved';
    updatedAtLabel: string;
  }>>([]);
  const [dismissedAlertId, setDismissedAlertId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToSystemAlerts((alerts) => {
      setSystemAlerts(alerts);
    });
  }, []);

  const openAlerts = useMemo(
    () => systemAlerts.filter((item) => item.status === 'open'),
    [systemAlerts]
  );
  const popupAlert = openAlerts.find((item) => item.id !== dismissedAlertId) ?? openAlerts[0] ?? null;

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h1>GroupTown</h1>
          <p>SHOP Admin Console</p>
        </div>

        <div className={styles.sectionLabel}>Modules</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.key} className={navClass(item.key === activeKey)} href={item.href}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerCard}>
            <h4>Firebase posture</h4>
            <p>Admin screens should trigger business actions. Sensitive writes move through Functions.</p>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <button className={styles.workspaceToggle} type="button">
                <span>SHOP Admin</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>

            <div className={styles.headerRight}>
              <button className={styles.notifyButton} type="button">
                <span className="material-symbols-outlined">notifications</span>
                {openAlerts.length > 0 ? <span className={styles.notifyDot} /> : null}
              </button>
              <div className={styles.profileBlock}>
                <div className={styles.profileMeta}>
                  <span className={styles.profileName}>{user?.name ?? 'Platform Admin'}</span>
                  <span className={styles.profileRole}>{user?.role ?? 'SHOP Operations'}</span>
                </div>
                <div className={styles.avatar}>
                  <span className="material-symbols-outlined">shield_person</span>
                </div>
              </div>
              <button
                className={styles.workspaceToggle}
                type="button"
                onClick={async () => {
                  await signOut();
                  router.replace(routes.adminLogin);
                }}>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <div className={styles.canvas}>
          {popupAlert ? (
            <section className={styles.systemAlertPopup}>
              <div className={styles.systemAlertCopy}>
                <div className={styles.systemAlertLabel}>System reminder</div>
                <h2 className={styles.systemAlertTitle}>A backend issue needs admin attention</h2>
                <p className={styles.systemAlertBody}>{popupAlert.message}</p>
                <p className={styles.systemAlertMeta}>
                  {popupAlert.sourceApp} / {popupAlert.sourceArea} / {popupAlert.updatedAtLabel}
                </p>
              </div>
              <div className={styles.systemAlertActions}>
                <Link className={styles.primaryButton} href={routes.adminErrors}>
                  Open error inbox
                </Link>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => setDismissedAlertId(popupAlert.id)}>
                  Dismiss
                </button>
              </div>
            </section>
          ) : null}

          <section>
            <div className={styles.breadcrumbRow}>
              <span className={styles.breadcrumb}>Admin</span>
              <span className={`material-symbols-outlined ${styles.breadcrumb}`}>chevron_right</span>
              <span className={`${styles.breadcrumb} ${styles.breadcrumbCurrent}`}>{pageTitle}</span>
            </div>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <p className={styles.pageSummary}>{pageSummary}</p>
          </section>

          {children}
        </div>
      </main>
    </div>
  );
}
