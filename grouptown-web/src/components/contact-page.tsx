'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import type { ContactPageData } from '@/lib/firebase/contact-data';
import { routes } from '@/lib/routes';

import styles from './contact-page.module.css';

type ContactPageProps = {
  data: ContactPageData;
};

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  topic: 'shop',
  message: '',
  consent: false,
};

export function ContactPage({ data }: ContactPageProps) {
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');

    window.setTimeout(() => {
      setStatus('sent');
      setForm(initialFormState);

      window.setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1500);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link className={styles.brand} href={routes.home}>
            GroupTown
          </Link>
          <nav className={styles.nav}>
            <Link href={routes.programmes}>Programmes</Link>
            <Link href={routes.properties}>Property Search</Link>
            <Link href={routes.about}>About</Link>
            <Link className={styles.activeLink} href={routes.help}>
              Help
            </Link>
          </nav>
          <div className={styles.headerActions}>
            <Link className={styles.signInLink} href={routes.login}>
              Sign In
            </Link>
            <Link className={styles.joinButton} href={routes.register}>
              Join Now
            </Link>
          </div>
        </div>
      </header>

      <main className={`${styles.container} ${styles.main}`}>
        <section className={styles.introSection}>
          <p className={styles.supportLabel}>{data.supportLabel}</p>
          <h1>{data.title}</h1>
          <p className={styles.introText}>{data.intro}</p>
        </section>

        <section className={styles.cardGrid}>
          {data.cards.map((item) => (
            <article key={item.title} className={styles.infoCard}>
              <span className={`material-symbols-outlined ${styles.cardIcon}`}>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <strong>{item.primary}</strong>
              {item.secondary ? <span>{item.secondary}</span> : null}
            </article>
          ))}
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.formPanel}>
            <h2>{data.formTitle}</h2>
            <p>{data.formDescription}</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.twoColGrid}>
                <label>
                  <span>FULL NAME *</span>
                  <input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    placeholder="John Doe"
                    required
                    type="text"
                    value={form.fullName}
                  />
                </label>
                <label>
                  <span>EMAIL ADDRESS *</span>
                  <input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="john@example.com"
                    required
                    type="email"
                    value={form.email}
                  />
                </label>
              </div>

              <div className={styles.twoColGrid}>
                <label>
                  <span>GHANA PHONE NUMBER *</span>
                  <div className={styles.phoneWrap}>
                    <span className={styles.phoneCode}>+233</span>
                    <input
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="24 000 0000"
                      required
                      type="tel"
                      value={form.phone}
                    />
                  </div>
                </label>
                <label>
                  <span>ENQUIRY TOPIC *</span>
                  <select
                    onChange={(event) =>
                      setForm((current) => ({ ...current, topic: event.target.value }))
                    }
                    value={form.topic}>
                    {data.topics.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>MESSAGE *</span>
                <textarea
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="How can we assist you today?"
                  required
                  rows={5}
                  value={form.message}
                />
              </label>

              <label className={styles.checkboxRow}>
                <input
                  checked={form.consent}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, consent: event.target.checked }))
                  }
                  required
                  type="checkbox"
                />
                <span>
                  I consent to GroupTown storing my data to respond to my enquiry. I understand
                  that my information is protected under the Ghana Data Protection Act (Act 843).
                </span>
              </label>

              <div className={styles.formFooter}>
                <button className={styles.submitButton} disabled={status === 'sending'} type="submit">
                  {status === 'sending'
                    ? 'SENDING...'
                    : status === 'sent'
                      ? 'MESSAGE SENT'
                      : 'SUBMIT ENQUIRY'}
                </button>
                <p>{data.responseTime}</p>
              </div>
            </form>
          </div>

          <aside className={styles.sideColumn}>
            <div className={styles.officeCard}>
              <h3>{data.officeTitle}</h3>
              <div className={styles.addressRow}>
                <span className="material-symbols-outlined">location_on</span>
                <p>
                  {data.officeAddress.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>

              <div className={styles.mapFrame}>
                <img alt="GroupTown office location" src={data.officeImage} />
                <div className={styles.mapBadge}>{data.officeBadge}</div>
              </div>
            </div>

            <div className={styles.corporateCard}>
              <h4>{data.corporateTitle}</h4>
              <p>{data.corporateDescription}</p>
              <a href={`mailto:${data.corporateEmail}`}>{data.corporateEmail.toUpperCase()}</a>
            </div>
          </aside>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div className={styles.footerBrandBlock}>
            <div className={styles.footerBrand}>GroupTown</div>
            <p>
              Redefining property ownership in Ghana through collective investment and
              institutional trust.
            </p>
          </div>
          <div className={styles.footerLinkGroups}>
            <div>
              <p>COMPANY</p>
              {data.footerCompanyLinks.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div>
              <p>LEGAL</p>
              {data.footerLegalLinks.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div>
              <p>SUPPORT</p>
              {data.footerSupportLinks.map((item) => (
                <Link
                  key={item.label}
                  className={item.label === 'Contact Support' ? styles.supportActive : ''}
                  href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2024 GroupTown. All rights reserved. Registered in Ghana.</p>
            <div className={styles.footerIcons}>
              <span className="material-symbols-outlined">public</span>
              <span className="material-symbols-outlined">description</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
