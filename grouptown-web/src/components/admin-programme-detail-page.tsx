'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  createCohortForProgramme,
  getAdminProgrammeDetail,
  saveProgramme,
  uploadProgrammeMedia,
  type AdminProgrammeRecord,
} from '@/lib/firebase/admin-programme-data';
import {
  defaultCohortConfig,
  defaultInterestOptions,
  defaultPaymentYearOptions,
  saveCohortConfig,
  type CohortConfig,
  type PaymentTerm,
  type UnitInterest,
} from '@/lib/firebase/cohort-admin-data';
import {
  getInterestManagement,
  launchShopInterest,
  saveShopInterestDraft,
  type ShopInterestAdminRecord,
  type WaitingInterestAdminRecord,
} from '@/lib/firebase/interest-admin-data';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

const interestChoices: Array<{ value: UnitInterest; label: string }> = [...defaultInterestOptions];
const paymentChoices: PaymentTerm[] = [...defaultPaymentYearOptions];

export function AdminProgrammeDetailPage({ programmeId }: { programmeId: string }) {
  const [programme, setProgramme] = useState<AdminProgrammeRecord | null>(null);
  const [cohorts, setCohorts] = useState<CohortConfig[]>([]);
  const [activeCohortId, setActiveCohortId] = useState<string | null>(null);
  const [usedFirebase, setUsedFirebase] = useState(false);
  const [savingProgramme, setSavingProgramme] = useState(false);
  const [savingCohort, setSavingCohort] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [interests, setInterests] = useState<ShopInterestAdminRecord[]>([]);
  const [waitingRequests, setWaitingRequests] = useState<WaitingInterestAdminRecord[]>([]);
  const [interestLabel, setInterestLabel] = useState('');
  const [interestDescription, setInterestDescription] = useState('');
  const [interestImageUrl, setInterestImageUrl] = useState('');
  const [interestPrice, setInterestPrice] = useState('');
  const [interestGroupSize, setInterestGroupSize] = useState('12');
  const [interestDownPaymentRate, setInterestDownPaymentRate] = useState('5');
  const [interestTerms, setInterestTerms] = useState<PaymentTerm[]>(['10 Years', '15 Years', '20 Years']);
  const [interestNotice, setInterestNotice] = useState<string | null>(null);
  const [savingInterest, setSavingInterest] = useState(false);

  async function refresh() {
    const result = await getAdminProgrammeDetail(programmeId);
    setProgramme(result.programme);
    setCohorts(result.cohorts);
    setUsedFirebase(result.usedFirebase);
    setActiveCohortId((current) => current ?? result.cohorts[0]?.id ?? null);
  }

  useEffect(() => {
    void refresh();
  }, [programmeId]);

  useEffect(() => {
    getInterestManagement(programmeId).then((result) => {
      setInterests(result.interests);
      setWaitingRequests(result.requests);
    }).catch(() => setInterestNotice('Interest management data could not be loaded.'));
  }, [programmeId]);

  const activeCohort = useMemo(
    () => cohorts.find((item) => item.id === activeCohortId) ?? cohorts[0] ?? null,
    [activeCohortId, cohorts]
  );

  if (!programme) {
    return (
      <AdminShell activeKey="programmes" pageTitle="Programme Detail" pageSummary="Loading programme detail.">
        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.mutedText}>Loading programme detail...</p>
            </div>
          </section>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      activeKey="programmes"
      pageTitle={programme.title}
      pageSummary="Edit the programme details, attach media, create cohorts, and configure each cohort under this project.">
      <div className={styles.stack}>
        <section className={styles.commandBar}>
          <div className={styles.commandCopy}>
            <div className={styles.panelLabel}>Programme detail</div>
            <h2 className={styles.commandTitle}>{programme.title}</h2>
            <p className={styles.mutedText}>
              This is the project-level record. Media, base description, and the list of cohorts all live under this programme.
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
                <div className={styles.panelLabel}>Programme details</div>
                <h2 className={styles.panelTitle}>Project information and public-facing copy</h2>
              </div>
            </div>

            <div className={styles.panelBody}>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Title</span>
                <input
                  className={styles.formInput}
                  value={programme.title}
                  onChange={(event) => setProgramme((current) => (current ? { ...current, title: event.target.value } : current))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Slug</span>
                <input
                  className={styles.formInput}
                  value={programme.slug}
                  onChange={(event) => setProgramme((current) => (current ? { ...current, slug: event.target.value } : current))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Location</span>
                <input
                  className={styles.formInput}
                  value={programme.location}
                  onChange={(event) => setProgramme((current) => (current ? { ...current, location: event.target.value } : current))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Summary</span>
                <textarea
                  className={styles.formTextarea}
                  value={programme.summary}
                  onChange={(event) => setProgramme((current) => (current ? { ...current, summary: event.target.value } : current))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Description</span>
                <textarea
                  className={styles.formTextarea}
                  value={programme.description}
                  onChange={(event) => setProgramme((current) => (current ? { ...current, description: event.target.value } : current))}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Cover image URL</span>
                <input
                  className={styles.formInput}
                  value={programme.coverImage}
                  onChange={(event) => setProgramme((current) => (current ? { ...current, coverImage: event.target.value } : current))}
                />
              </label>
              <div className={styles.buttonRow}>
                <button
                  className={styles.primaryButton}
                  type="button"
                  disabled={savingProgramme}
                  onClick={async () => {
                    setSavingProgramme(true);
                    await saveProgramme(programme);
                    setSavingProgramme(false);
                    await refresh();
                  }}>
                  {savingProgramme ? 'Saving...' : 'Save programme'}
                </button>
              </div>
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Project media</div>
            <h2 className={styles.noteTitle}>Images and videos for this programme</h2>
            <div className={styles.panelBody}>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Upload image</span>
                <input
                  className={styles.formInput}
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    setUploading(true);
                    setUploadNotice(null);
                    try {
                      await uploadProgrammeMedia(programme.id, file, 'images');
                      setUploadNotice('Image uploaded and saved to the programme.');
                      await refresh();
                      event.target.value = '';
                    } catch (error) {
                      setUploadNotice(error instanceof Error ? error.message : 'Image upload failed.');
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              <label className={styles.formField}>
                <span className={styles.inlineStatLabel}>Upload video</span>
                <input
                  className={styles.formInput}
                  type="file"
                  accept="video/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    setUploading(true);
                    setUploadNotice(null);
                    try {
                      await uploadProgrammeMedia(programme.id, file, 'videos');
                      setUploadNotice('Video uploaded and saved to the programme.');
                      await refresh();
                      event.target.value = '';
                    } catch (error) {
                      setUploadNotice(error instanceof Error ? error.message : 'Video upload failed.');
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              <p className={styles.mutedText}>
                {uploading
                  ? 'Uploading media...'
                  : uploadNotice ?? 'Uploaded files are stored under the programme media path and saved to the programme record immediately.'}
              </p>
              <div className={styles.queueBoard}>
                {programme.galleryImages.map((item, index) => (
                  <article key={`${item}-${index}`} className={styles.queueCard}>
                    <div className={styles.queuePrimary}>Image {index + 1}</div>
                    <div className={styles.queueSecondary}>{item}</div>
                  </article>
                ))}
                {programme.videoUrls.map((item, index) => (
                  <article key={`${item}-${index}`} className={styles.queueCard}>
                    <div className={styles.queuePrimary}>Video {index + 1}</div>
                    <div className={styles.queueSecondary}>{item}</div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelLabel}>Interest catalogue</div>
              <h2 className={styles.panelTitle}>Launch only when a group can form immediately</h2>
            </div>
          </div>
          <div className={styles.twoColumn}>
            <div className={styles.panelBody}>
              <label className={styles.formField}><span className={styles.inlineStatLabel}>Interest name</span><input className={styles.formInput} value={interestLabel} onChange={(event) => setInterestLabel(event.target.value)} placeholder="e.g. 4 Bedroom Villa" /></label>
              <label className={styles.formField}><span className={styles.inlineStatLabel}>Description</span><textarea className={styles.formTextarea} value={interestDescription} onChange={(event) => setInterestDescription(event.target.value)} /></label>
              <label className={styles.formField}><span className={styles.inlineStatLabel}>Image URL</span><input className={styles.formInput} value={interestImageUrl} onChange={(event) => setInterestImageUrl(event.target.value)} /></label>
              <div className={styles.buttonRow}>
                <button className={styles.secondaryButton} type="button" disabled={savingInterest || !interestLabel.trim()} onClick={async () => {
                  setSavingInterest(true); setInterestNotice(null);
                  try { await saveShopInterestDraft({ programmeId, label: interestLabel, description: interestDescription, imageUrl: interestImageUrl }); setInterestNotice('Draft saved. It is hidden from members until launched.'); setInterests((await getInterestManagement(programmeId)).interests); }
                  catch (error) { setInterestNotice(error instanceof Error ? error.message : 'Draft could not be saved.'); }
                  finally { setSavingInterest(false); }
                }}>Save Draft</button>
              </div>
            </div>
            <div className={styles.panelBody}>
              <label className={styles.formField}><span className={styles.inlineStatLabel}>Active cohort</span><select className={styles.formInput} value={activeCohortId ?? ''} onChange={(event) => setActiveCohortId(event.target.value)}>{cohorts.filter((cohort) => cohort.status === 'active' && cohort.id === defaultCohortConfig.id).map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.cohortName}</option>)}</select></label>
              <label className={styles.formField}><span className={styles.inlineStatLabel}>Cash price</span><input className={styles.formInput} inputMode="numeric" value={interestPrice} onChange={(event) => setInterestPrice(event.target.value)} /></label>
              <label className={styles.formField}><span className={styles.inlineStatLabel}>Down payment rate (%)</span><input className={styles.formInput} inputMode="decimal" value={interestDownPaymentRate} onChange={(event) => setInterestDownPaymentRate(event.target.value)} /></label>
              <label className={styles.formField}><span className={styles.inlineStatLabel}>Members per group</span><input className={styles.formInput} inputMode="numeric" value={interestGroupSize} onChange={(event) => setInterestGroupSize(event.target.value)} /></label>
              <div className={styles.buttonRow}>{paymentChoices.map((term) => <button key={term} className={interestTerms.includes(term) ? styles.primaryButton : styles.secondaryButton} type="button" onClick={() => setInterestTerms((current) => current.includes(term) ? current.filter((item) => item !== term) : [...current, term])}>{term}</button>)}</div>
              <div className={styles.buttonRow}>
                <button className={styles.primaryButton} type="button" disabled={savingInterest || !interestLabel.trim() || !activeCohortId} onClick={async () => {
                  const cohort = cohorts.find((item) => item.id === activeCohortId);
                  if (!cohort) return;
                  setSavingInterest(true); setInterestNotice(null);
                  try { await launchShopInterest({ id: interestLabel, programmeId, label: interestLabel, description: interestDescription, imageUrl: interestImageUrl, cohortId: cohort.id, maxMembers: Number(interestGroupSize), price: Number(interestPrice), downPaymentRate: Number(interestDownPaymentRate), paymentTerms: interestTerms }); setInterestNotice('Interest launched. Members can now join or request a group.'); const next = await getInterestManagement(programmeId); setInterests(next.interests); setWaitingRequests(next.requests); await refresh(); }
                  catch (error) { setInterestNotice(error instanceof Error ? error.message : 'Interest could not be launched.'); }
                  finally { setSavingInterest(false); }
                }}>{savingInterest ? 'Launching...' : 'Launch Interest'}</button>
              </div>
              {interestNotice ? <p className={styles.mutedText}>{interestNotice}</p> : null}
            </div>
          </div>
          <div className={styles.queueBoard}>{interests.map((interest) => <article key={interest.id} className={styles.queueCard}><div className={styles.queuePrimary}>{interest.label}</div><div className={styles.queueSecondary}>{interest.status} {interest.cohortId ? `- ${interest.cohortId}` : '- hidden draft'}</div></article>)}</div>
          <div className={styles.panelBody}><div className={styles.panelLabel}>Unlisted demand</div>{waitingRequests.length ? waitingRequests.map((request) => <div className={styles.queueCard} key={request.id}><div className={styles.queuePrimary}>{request.requestedHome}</div><div className={styles.queueSecondary}>{request.userName} - {request.status}{request.monthlyBudget ? ` - budget ${request.monthlyBudget}` : ''}</div></div>) : <p className={styles.mutedText}>No waiting-interest demand yet.</p>}</div>
        </section>

        <div className={styles.twoColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>Cohorts</div>
                <h2 className={styles.panelTitle}>{cohorts.length} cohorts under this programme</h2>
              </div>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={async () => {
                  const created = await createCohortForProgramme(programme, cohorts.length);
                  await refresh();
                  setActiveCohortId(created.id);
                }}>
                Create cohort
              </button>
            </div>

            <div className={styles.queueBoard}>
              {cohorts.map((cohort) => (
                <article key={cohort.id} className={styles.queueCard}>
                  <div className={styles.queueTop}>
                    <div>
                      <div className={styles.queuePrimary}>{cohort.cohortName}</div>
                      <div className={styles.queueSecondary}>{cohort.cohortCode}</div>
                    </div>
                    <div className={styles.queuePill}>{cohort.status}</div>
                  </div>
                  <div className={styles.queueMiddle}>{cohort.location}</div>
                  <div className={styles.queueFoot}>
                    <div className={styles.queueFootCopy}>
                      <strong>{cohort.maxMembersPerGroup} members per group</strong>
                      <div className={styles.tableCellSecondary}>{cohort.interestOptions.length} interests / {cohort.paymentYearOptions.length} payment terms</div>
                    </div>
                    <div className={styles.rowActionArea}>
                      <button className={styles.miniActionButton} type="button" onClick={() => setActiveCohortId(cohort.id)}>
                        Open cohort
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.panelLabel}>Cohort meaning</div>
            <h2 className={styles.noteTitle}>A cohort is a batch under this programme</h2>
            <p className={styles.noteBody}>
              Each cohort can have its own configuration, interest options, payment terms, and group rollout while still belonging to the same project programme.
            </p>
          </section>
        </div>

        {activeCohort ? (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelLabel}>Open cohort</div>
                <h2 className={styles.panelTitle}>{activeCohort.cohortName}</h2>
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.panelBody}>
                <label className={styles.formField}>
                  <span className={styles.inlineStatLabel}>Cohort name</span>
                  <input
                    className={styles.formInput}
                    value={activeCohort.cohortName}
                    onChange={(event) =>
                      setCohorts((current) =>
                        current.map((item) => (item.id === activeCohort.id ? { ...item, cohortName: event.target.value } : item))
                      )
                    }
                  />
                </label>
                <label className={styles.formField}>
                  <span className={styles.inlineStatLabel}>Cohort code</span>
                  <input
                    className={styles.formInput}
                    value={activeCohort.cohortCode}
                    onChange={(event) =>
                      setCohorts((current) =>
                        current.map((item) => (item.id === activeCohort.id ? { ...item, cohortCode: event.target.value } : item))
                      )
                    }
                  />
                </label>
                <label className={styles.formField}>
                  <span className={styles.inlineStatLabel}>Location</span>
                  <input
                    className={styles.formInput}
                    value={activeCohort.location}
                    onChange={(event) =>
                      setCohorts((current) =>
                        current.map((item) => (item.id === activeCohort.id ? { ...item, location: event.target.value } : item))
                      )
                    }
                  />
                </label>
                <label className={styles.formField}>
                  <span className={styles.inlineStatLabel}>Description</span>
                  <textarea
                    className={styles.formTextarea}
                    value={activeCohort.description}
                    onChange={(event) =>
                      setCohorts((current) =>
                        current.map((item) => (item.id === activeCohort.id ? { ...item, description: event.target.value } : item))
                      )
                    }
                  />
                </label>
                <div className={styles.buttonRow}>
                  {interestChoices.map((choice) => {
                    const enabled = activeCohort.interestOptions.some((item) => item.value === choice.value);

                    return (
                      <button
                        key={choice.value}
                        className={enabled ? styles.primaryButton : styles.secondaryButton}
                        type="button"
                        onClick={() =>
                          setCohorts((current) =>
                            current.map((item) =>
                              item.id === activeCohort.id
                                ? {
                                    ...item,
                                    interestOptions: enabled
                                      ? item.interestOptions.filter((entry) => entry.value !== choice.value)
                                      : [...item.interestOptions, choice],
                                  }
                                : item
                            )
                          )
                        }>
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
                <div className={styles.buttonRow}>
                  {paymentChoices.map((choice) => {
                    const enabled = activeCohort.paymentYearOptions.includes(choice);

                    return (
                      <button
                        key={choice}
                        className={enabled ? styles.primaryButton : styles.secondaryButton}
                        type="button"
                        onClick={() =>
                          setCohorts((current) =>
                            current.map((item) =>
                              item.id === activeCohort.id
                                ? {
                                    ...item,
                                    paymentYearOptions: enabled
                                      ? item.paymentYearOptions.filter((entry) => entry !== choice)
                                      : [...item.paymentYearOptions, choice],
                                  }
                                : item
                            )
                          )
                        }>
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.panelBody}>
                <label className={styles.formField}>
                  <span className={styles.inlineStatLabel}>Max members per group</span>
                  <select
                    className={styles.formInput}
                    value={activeCohort.maxMembersPerGroup}
                    onChange={(event) =>
                      setCohorts((current) =>
                        current.map((item) =>
                          item.id === activeCohort.id ? { ...item, maxMembersPerGroup: Number(event.target.value) || defaultCohortConfig.maxMembersPerGroup } : item
                        )
                      )
                    }
                  >
                    {[6, 12, 18, 24, 30, 36].map((size) => <option key={size} value={size}>{size} members</option>)}
                  </select>
                </label>
                <p className={styles.mutedText}>
                  Groups are created only after an approved member submits a request and an admin approves it. New groups do not roll over automatically.
                </p>
                <div className={styles.buttonRow}>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={savingCohort}
                    onClick={async () => {
                      setSavingCohort(true);
                      const nextCohort = cohorts.find((item) => item.id === activeCohort.id);
                      if (nextCohort) {
                        await saveCohortConfig(nextCohort);
                        await refresh();
                      }
                      setSavingCohort(false);
                    }}>
                    {savingCohort ? 'Saving...' : 'Save cohort'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
