'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  defaultCityOfAngelsProgramme,
  getAdminProgrammes,
  saveProgramme,
  type AdminProgrammeListItem,
  type AdminProgrammeRecord,
} from '@/lib/firebase/admin-programme-data';
import { routes } from '@/lib/routes';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

const emptyProgrammeDraft: AdminProgrammeRecord = {
  ...defaultCityOfAngelsProgramme,
  id: '',
  slug: '',
  title: '',
  summary: '',
  description: '',
  location: '',
  status: 'draft',
  coverImage: '',
  galleryImages: [],
  videoUrls: [],
  sortOrder: 10,
};

export function AdminProgrammesPage() {
  const [programmes, setProgrammes] = useState<AdminProgrammeListItem[]>([]);
  const [usedFirebase, setUsedFirebase] = useState(false);
  const [draft, setDraft] = useState<AdminProgrammeRecord>(emptyProgrammeDraft);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const result = await getAdminProgrammes();
    setProgrammes(result.programmes);
    setUsedFirebase(result.usedFirebase);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AdminShell
      activeKey="programmes"
      pageTitle="Project Programmes"
      pageSummary="Create and manage project programmes like City of Angels, then open each programme to manage its cohorts and configuration.">
      <div className={styles.stack}>
        <section className={styles.commandBar}>
          <div className={styles.commandCopy}>
            <div className={styles.panelLabel}>Programme registry</div>
            <h2 className={styles.commandTitle}>Project-level programme control</h2>
            <p className={styles.mutedText}>
              A programme is the actual project opportunity. Each programme can contain one or more cohorts with their own live configuration.
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
                <div className={styles.panelLabel}>Create programme</div>
                <h2 className={styles.panelTitle}>Add a new project programme</h2>
              </div>
            </div>

            <div className={styles.panelBody}>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Programme title</span>
                <input
                  className={styles.formInput}
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Slug</span>
                <input
                  className={styles.formInput}
                  value={draft.slug}
                  onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Location</span>
                <input
                  className={styles.formInput}
                  value={draft.location}
                  onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Summary</span>
                <textarea
                  className={styles.formTextarea}
                  value={draft.summary}
                  onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
                />
              </label>
              <div className={styles.buttonRow}>
                <button
                  className={styles.primaryButton}
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true);
                    const createdId = await saveProgramme({
                      ...draft,
                      id: draft.slug || draft.title,
                      kind: 'project',
                    });
                    setSaving(false);
                    if (createdId) {
                      setDraft(emptyProgrammeDraft);
                      await refresh();
                    }
                  }}>
                  {saving ? 'Saving...' : 'Create programme'}
                </button>
              </div>
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Programme vs cohort</div>
            <h2 className={styles.noteTitle}>Keep the hierarchy clean</h2>
            <p className={styles.noteBody}>
              The programme is the project itself, for example City of Angels. The cohort is a specific intake or configuration batch under that programme.
            </p>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Existing programmes</div>
              <h2 className={styles.panelTitle}>{programmes.length} project programmes</h2>
            </div>
          </div>

          <div className={styles.queueBoard}>
            {programmes.map((item) => (
              <article key={item.programme.id} className={styles.queueCard}>
                <div className={styles.queueTop}>
                  <div>
                    <div className={styles.queuePrimary}>{item.programme.title}</div>
                    <div className={styles.queueSecondary}>{item.programme.location || 'Location pending'}</div>
                  </div>
                  <div className={styles.queuePill}>{item.programme.status}</div>
                </div>
                <div className={styles.queueMiddle}>
                  {item.cohortCount} cohorts / parent flow: {item.programme.parentProgrammeSlug.toUpperCase()}
                </div>
                <div className={styles.queueFoot}>
                  <div className={styles.queueFootCopy}>
                    <strong>{item.programme.summary || 'Open this programme to add its details, media, and cohorts.'}</strong>
                    <div className={styles.tableCellSecondary}>Slug: {item.programme.slug}</div>
                  </div>
                  <div className={styles.rowActionArea}>
                    <Link className={styles.miniActionButton} href={routes.adminProgrammeDetail(item.programme.id)}>
                      Open programme
                    </Link>
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
