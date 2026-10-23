'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';

import { routes } from '@/lib/routes';

import styles from './workspace-shell.module.css';

type WorkspaceNavKey =
  | 'dashboard'
  | 'programmes'
  | 'groups'
  | 'properties'
  | 'activity'
  | 'payments'
  | 'enquiries'
  | 'favourites'
  | 'notifications'
  | 'documents'
  | 'profile'
  | 'support';

type WorkspaceShellProps = {
  activeNav: WorkspaceNavKey;
  children: ReactNode;
  currentUserName: string;
  currentUserRole: string;
  pageTitle: string;
  workspaceLabel: string;
  workspaceName: string;
};

const primaryNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'programmes', label: 'Programmes', icon: 'event_note' },
  { key: 'groups', label: 'Groups', icon: 'groups' },
  { key: 'properties', label: 'Properties', icon: 'domain' },
  { key: 'activity', label: 'Activity', icon: 'history' },
] satisfies Array<{ key: WorkspaceNavKey; label: string; icon: string }>;

const utilityItems = [
  { key: 'payments', label: 'Payments', icon: 'payments' },
  { key: 'enquiries', label: 'Enquiries', icon: 'chat_bubble' },
  { key: 'favourites', label: 'Favourites', icon: 'favorite' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications' },
  { key: 'documents', label: 'Documents', icon: 'description' },
  { key: 'profile', label: 'Profile', icon: 'person' },
  { key: 'support', label: 'Support', icon: 'help_center' },
] satisfies Array<{ key: WorkspaceNavKey; label: string; icon: string }>;

function navClass(
  key: WorkspaceNavKey,
  activeKey: WorkspaceNavKey,
  baseClass: string,
  activeClass: string,
  passiveClass: string
) {
  return `${baseClass} ${key === activeKey ? activeClass : passiveClass}`;
}

export function WorkspaceShell({
  activeNav,
  children,
  currentUserName,
  currentUserRole,
  pageTitle,
  workspaceLabel,
  workspaceName,
}: WorkspaceShellProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <h1>GroupTown</h1>
          <p>{workspaceLabel}</p>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navList}>
            {primaryNavItems.map((item) => (
              <button
                key={item.key}
                className={navClass(
                  item.key,
                  activeNav,
                  styles.navItem,
                  styles.navItemActive,
                  styles.navItemPassive
                )}
                type="button">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.sidebarSectionLabel}>Utilities</div>

          <div className={styles.utilityList}>
            {utilityItems.map((item) => (
              <button
                key={item.key}
                className={navClass(
                  item.key,
                  activeNav,
                  styles.utilityItem,
                  styles.navItemActive,
                  styles.utilityItemPassive
                )}
                type="button">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className={styles.utilityWrap} />
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <button className={styles.mobileMenu} type="button">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <span className={styles.mobileBrand}>GroupTown</span>
              <button className={styles.workspaceToggle} type="button">
                <span>{workspaceName}</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>

            <div className={styles.headerRight}>
              <button className={styles.notifyButton} type="button">
                <span className="material-symbols-outlined">notifications</span>
                <span className={styles.notifyDot} />
              </button>
              <div className={styles.profileBlock}>
                <div className={styles.profileText}>
                  <span className={styles.profileName}>{currentUserName}</span>
                  <span className={styles.profileRole}>{currentUserRole}</span>
                </div>
                <div className={styles.avatar}>
                  <span className="material-symbols-outlined">account_circle</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.canvas}>
          <section>
            <div className={styles.breadcrumbRow}>
              <span className={styles.breadcrumb}>Workspace</span>
              <span className={`material-symbols-outlined ${styles.breadcrumb}`}>chevron_right</span>
              <span className={`${styles.breadcrumb} ${styles.breadcrumbCurrent}`}>{pageTitle}</span>
            </div>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
          </section>

          {children}
        </div>

        <nav className={styles.mobileNav}>
          {primaryNavItems.map((item) => (
            <button
              key={item.key}
              className={navClass(
                item.key,
                activeNav,
                styles.mobileNavItem,
                styles.mobileNavItemActive,
                styles.navItemPassive
              )}
              type="button">
              <span className="material-symbols-outlined">{item.icon === 'dashboard' ? 'home' : item.icon}</span>
              <span>{item.label === 'Dashboard' ? 'Home' : item.label}</span>
            </button>
          ))}
        </nav>

        <Link className={styles.fab} href={routes.properties}>
          <span className="material-symbols-outlined">add</span>
        </Link>
      </main>
    </div>
  );
}
