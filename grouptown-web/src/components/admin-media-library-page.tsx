'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/admin-shell';
import {
  appMediaSlots,
  subscribeToAppMedia,
  uploadAppMedia,
  type AdminAppMediaAsset,
  type AppMediaSlotId,
} from '@/lib/firebase/app-media-admin-data';

import styles from './admin-media-library-page.module.css';

export function AdminMediaLibraryPage() {
  const [assets, setAssets] = useState<Partial<Record<AppMediaSlotId, AdminAppMediaAsset>>>({});
  const [uploadingSlot, setUploadingSlot] = useState<AppMediaSlotId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeToAppMedia(setAssets), []);

  return (
    <AdminShell
      activeKey="media"
      pageTitle="App Media"
      pageSummary="Replace the member app's managed images without releasing a new app build. The current bundled image remains available until a replacement is published.">
      <div className={styles.stack}>
        <section className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>Firebase-backed media library</div>
            <h2>Publish a replacement once, then every app screen reads it.</h2>
            <p>
              Upload JPG, PNG, or WebP files under 10 MB. We keep the previous file in Storage rather than deleting it, so a published replacement is recoverable by uploading the prior image again.
            </p>
          </div>
          <div className={styles.heroNote}>
            App icons and the operating-system splash image are packaged into Android/iOS and still need an app build to change. The images below update in the live app manifest.
          </div>
        </section>

        {notice ? <p className={styles.statusOk}>{notice}</p> : null}
        {error ? <p className={styles.statusError}>{error}</p> : null}

        <section className={styles.grid} aria-label="Managed app images">
          {appMediaSlots.map((slot) => {
            const asset = assets[slot.id];
            const isUploading = uploadingSlot === slot.id;

            return (
              <article className={styles.card} key={slot.id}>
                <div className={styles.preview}>
                  {asset?.url ? <img alt={asset.alt || slot.label} src={asset.url} /> : <span>No replacement published</span>}
                </div>
                <div className={styles.copy}>
                  <div className={styles.eyebrow}>{slot.id}</div>
                  <h2>{slot.label}</h2>
                  <p>{slot.description}</p>
                  <p className={styles.meta}>{asset ? `Published ${asset.updatedAtLabel}` : 'Using the app’s bundled fallback image.'}</p>
                </div>
                <label className={styles.uploadButton}>
                  <span className="material-symbols-outlined">upload</span>
                  <span>{isUploading ? 'Uploading…' : asset ? 'Replace image' : 'Upload image'}</span>
                  <input
                    accept="image/*"
                    disabled={Boolean(uploadingSlot)}
                    type="file"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.currentTarget.value = '';
                      if (!file) return;

                      setUploadingSlot(slot.id);
                      setError(null);
                      setNotice(null);
                      try {
                        await uploadAppMedia(slot, file);
                        setNotice(`${slot.label} has been published to the member app.`);
                      } catch (nextError) {
                        setError(nextError instanceof Error ? nextError.message : 'Unable to upload the image.');
                      } finally {
                        setUploadingSlot(null);
                      }
                    }}
                  />
                </label>
              </article>
            );
          })}
        </section>
      </div>
    </AdminShell>
  );
}
