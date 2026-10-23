'use client';

import { useEffect, useState } from 'react';

import {
  getGlobalInterestManagement,
  publishRecommendedStandaloneInterests,
  publishGlobalShopInterest,
  saveStarterHouseTypes,
  saveShopInterestDraft,
  uploadShopInterestImage,
  type ShopInterestAdminRecord,
  type WaitingInterestAdminRecord,
} from '@/lib/firebase/interest-admin-data';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

const STANDALONE_GROUP_SIZE_OPTIONS = [6, 12, 18, 24, 36] as const;
const STANDALONE_PAYMENT_TERM_OPTIONS = ['5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years'] as const;

export function AdminGlobalInterestsPage() {
  const [interests, setInterests] = useState<ShopInterestAdminRecord[]>([]);
  const [requests, setRequests] = useState<WaitingInterestAdminRecord[]>([]);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [groupSizeOptions, setGroupSizeOptions] = useState<number[]>([12]);
  const [paymentTerms, setPaymentTerms] = useState<string[]>(['20 Years']);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<ShopInterestAdminRecord['status'] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const result = await getGlobalInterestManagement();
    setInterests(result.interests);
    setRequests(result.requests);
  }

  useEffect(() => { void refresh(); }, []);

  function beginEdit(interest: ShopInterestAdminRecord) {
    setEditingId(interest.id);
    setEditingStatus(interest.status);
    setLabel(interest.label);
    setDescription(interest.description);
    setImageUrl(interest.imageUrl);
    setImageFile(null);
    setPrice(interest.price == null ? '' : String(interest.price));
    setMonthlyPayment(interest.monthlyPayment == null ? '' : String(interest.monthlyPayment));
    setPaymentTerm(interest.paymentTerm);
    setGroupSizeOptions(interest.groupSizeOptions.length ? interest.groupSizeOptions : [12]);
    setPaymentTerms(interest.paymentTerms.length ? interest.paymentTerms : (interest.paymentTerm ? [interest.paymentTerm] : ['20 Years']));
    setNotice(`Editing ${interest.label}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearEditor() {
    setEditingId(null);
    setEditingStatus(null);
    setLabel(''); setDescription(''); setImageUrl(''); setImageFile(null); setPrice(''); setMonthlyPayment(''); setPaymentTerm(''); setGroupSizeOptions([12]); setPaymentTerms(['20 Years']);
  }

  async function save(publish: boolean) {
    if (!label.trim()) return;
    setSaving(true);
    setNotice(null);
    try {
      const input = {
        label,
        description,
        imageUrl: imageFile ? await uploadShopInterestImage(label, imageFile) : imageUrl,
        price: price.trim() ? Number(price.replace(/,/g, '')) : null,
        monthlyPayment: monthlyPayment.trim() ? Number(monthlyPayment.replace(/,/g, '')) : null,
        paymentTerm: paymentTerms[0] ?? paymentTerm,
        paymentTerms: paymentTerms as any,
        groupSizeOptions,
      };
      if ((input.price !== null && (!Number.isFinite(input.price) || input.price <= 0)) || (input.monthlyPayment !== null && (!Number.isFinite(input.monthlyPayment) || input.monthlyPayment <= 0))) {
        setNotice('Enter valid positive numbers for price and monthly payment, or leave them blank.');
        return;
      }
      if (editingId && editingStatus === 'published') {
        await publishGlobalShopInterest({ id: editingId, ...input });
        setNotice('Published interest updated.');
      } else {
        const id = await saveShopInterestDraft(input);
        if (publish) await publishGlobalShopInterest({ id, ...input });
        setNotice(publish ? 'Global interest published.' : 'Global interest draft saved.');
      }
      clearEditor();
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Interest could not be saved.');
    } finally { setSaving(false); }
  }

  return (
    <AdminShell activeKey="interests" pageTitle="Global Interests" pageSummary="Create interests without attaching them to a programme or cohort.">
      <div className={styles.stack}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><div className={styles.panelLabel}>Global interest catalogue</div><h2 className={styles.panelTitle}>{editingId ? 'Edit an independent interest' : 'Create an independent interest'}</h2></div></div>
          <div className={styles.panelBody}>
            <button className={styles.secondaryButton} disabled={saving} onClick={() => { setSaving(true); void saveStarterHouseTypes().then(() => { setNotice('Five house-type drafts added. Add prices and publish each one.'); return refresh(); }).catch(() => setNotice('Starter house types could not be added.')).finally(() => setSaving(false)); }}>Add five house types as drafts</button>
            <button className={styles.primaryButton} disabled={saving} onClick={() => { setSaving(true); void publishRecommendedStandaloneInterests().then(() => { setNotice('Ten recommended standalone interests published. Review each one and replace indicative figures or images when approved.'); return refresh(); }).catch((error) => setNotice(error instanceof Error ? error.message : 'Recommended interests could not be published.')).finally(() => setSaving(false)); }}>Publish ten recommended standalone interests</button>
            <label className={styles.formField}><span className={styles.inlineStatLabel}>Interest name</span><input className={styles.formInput} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. 4 Bedroom Villa" /></label>
            <label className={styles.formField}><span className={styles.inlineStatLabel}>Description</span><textarea className={styles.formTextarea} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
            <label className={styles.formField}><span className={styles.inlineStatLabel}>Image file (optional)</span><input className={styles.formInput} type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label>
            <label className={styles.formField}><span className={styles.inlineStatLabel}>Image URL fallback (optional)</span><input className={styles.formInput} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /></label>
            {imageUrl ? <img src={imageUrl} alt="Selected interest" style={{ width: 160, height: 96, objectFit: 'cover', borderRadius: 8 }} /> : <p className={styles.mutedText}>Add an image so members can recognize this home at a glance.</p>}
            <label className={styles.formField}><span className={styles.inlineStatLabel}>Full house price (optional until confirmed)</span><input className={styles.formInput} inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. 250000" /></label>
            <label className={styles.formField}><span className={styles.inlineStatLabel}>Monthly payment (optional until confirmed)</span><input className={styles.formInput} inputMode="decimal" value={monthlyPayment} onChange={(event) => setMonthlyPayment(event.target.value)} placeholder="e.g. 1791" /></label>
            <div className={styles.formField}><span className={styles.inlineStatLabel}>Allowed group sizes</span><div className={styles.buttonRow}>{STANDALONE_GROUP_SIZE_OPTIONS.map((size) => <label key={size} className={styles.checkboxLabel}><input type="checkbox" checked={groupSizeOptions.includes(size)} onChange={() => setGroupSizeOptions((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size])} />{size} members</label>)}</div></div>
            <div className={styles.formField}><span className={styles.inlineStatLabel}>Allowed payment terms</span><div className={styles.buttonRow}>{STANDALONE_PAYMENT_TERM_OPTIONS.map((term) => <label key={term} className={styles.checkboxLabel}><input type="checkbox" checked={paymentTerms.includes(term)} onChange={() => setPaymentTerms((current) => current.includes(term) ? current.filter((item) => item !== term) : [...current, term])} />{term}</label>)}</div></div>
            <div className={styles.buttonRow}><button className={styles.secondaryButton} disabled={saving || !label.trim() || !groupSizeOptions.length || !paymentTerms.length || Boolean(editingId && editingStatus === 'published')} onClick={() => void save(false)}>{editingId ? 'Save changes as draft' : 'Save draft'}</button><button className={styles.primaryButton} disabled={saving || !label.trim() || !groupSizeOptions.length || !paymentTerms.length} onClick={() => void save(true)}>{editingStatus === 'published' ? 'Save published changes' : editingId ? 'Publish changes' : 'Publish globally'}</button>{editingId ? <button className={styles.secondaryButton} disabled={saving} onClick={clearEditor}>Cancel edit</button> : null}</div>
            {notice ? <p className={styles.mutedText}>{notice}</p> : null}
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><div className={styles.panelLabel}>Independent interests</div><h2 className={styles.panelTitle}>{interests.length} global interests</h2></div></div>
          <div className={styles.queueBoard}>{interests.map((interest) => <article key={interest.id} className={styles.queueCard}><div className={styles.queuePrimary}>{interest.label}</div><div className={styles.queueSecondary}>{interest.status} · not attached to a programme or cohort</div></article>)}</div>
          <div className={styles.queueBoard}>{interests.map((interest) => <button key={`edit-${interest.id}`} className={styles.secondaryButton} onClick={() => beginEdit(interest)}>Edit {interest.label}</button>)}</div>
          {interests.length === 0 ? <div className={styles.panelBody}><p className={styles.mutedText}>No global interests yet.</p></div> : null}
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><div className={styles.panelLabel}>Global waiting interest</div><h2 className={styles.panelTitle}>{requests.length} unlisted requests</h2></div></div>
          <div className={styles.queueBoard}>{requests.map((request) => <article key={request.id} className={styles.queueCard}><div className={styles.queuePrimary}>{request.requestedHome}</div><div className={styles.queueSecondary}>{request.userName} · {request.status}{request.monthlyBudget ? ` · budget ${request.monthlyBudget}` : ''}</div></article>)}</div>
          {requests.length === 0 ? <div className={styles.panelBody}><p className={styles.mutedText}>No global waiting-interest requests yet.</p></div> : null}
        </section>
      </div>
    </AdminShell>
  );
}
