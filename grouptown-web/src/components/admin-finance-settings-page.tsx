'use client';

import { useEffect, useState } from 'react';

import {
  CITY_OF_ANGELS_COHORT_ID,
  defaultFinanceTemplate,
  type FinanceGatewayChargeType,
  getFinanceTemplate,
  PAYMENT_TERM_OPTIONS,
  saveFinanceTemplate,
  type FinanceTemplate,
  type PaymentTerm,
} from '@/lib/firebase/finance-admin-data';
import { createPaystackTestReference, launchPaystackTestCheckout } from '@/lib/paystack';
import { logAdminSystemAlert } from '@/lib/firebase/system-alerts';

import { AdminShell } from './admin-shell';
import styles from './admin-finance-settings-page.module.css';

export function AdminFinanceSettingsPage() {
  const [template, setTemplate] = useState<FinanceTemplate>(defaultFinanceTemplate);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [usedFirebase, setUsedFirebase] = useState(false);
  const [pricingPublicationMissing, setPricingPublicationMissing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLaunchingTestCheckout, setIsLaunchingTestCheckout] = useState(false);
  const [paystackStatus, setPaystackStatus] = useState<string | null>(null);
  const [paystackError, setPaystackError] = useState<string | null>(null);
  const [testReference, setTestReference] = useState(createPaystackTestReference());

  const paystackTestPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY?.trim() ?? '';

  useEffect(() => {
    let active = true;

    getFinanceTemplate(CITY_OF_ANGELS_COHORT_ID).then((result) => {
      if (!active) {
        return;
      }

      setTemplate(result.template);
      setUsedFirebase(result.usedFirebase);
      setPricingPublicationMissing(
        result.usedFirebase && (!result.hasPublishedBedroomPrices || !result.hasPublishedDownPaymentRate)
      );
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const twoBedroomDownPayment = Math.round((template.unitPrices['2-bedroom'] * template.downPaymentRate) / 100);
  const threeBedroomDownPayment = Math.round((template.unitPrices['3-bedroom'] * template.downPaymentRate) / 100);
  const paystackUnitInterest = template.paymentGateway.defaultUnitInterest;
  const paystackSuggestedAmount = getPaystackTestAmount(template);
  const formatDeliveryMonths = (months: number) => {
    if (months <= 0) {
      return 'Immediate';
    }

    return `${months} months`;
  };
  const buildSlotPaymentTermMap = (
    slot: FinanceTemplate['deliveryTracks'][number]['slots'][number]
  ): NonNullable<FinanceTemplate['deliveryTracks'][number]['slots'][number]['paymentTermMonthlyContributions']> =>
    Object.fromEntries(
      PAYMENT_TERM_OPTIONS.map((term) => [
        term,
        {
          '2-bedroom': slot.paymentTermMonthlyContributions?.[term]?.['2-bedroom'] ??
            slot.unitMonthlyContributions?.['2-bedroom'] ??
            slot.monthlyContribution,
          '3-bedroom': slot.paymentTermMonthlyContributions?.[term]?.['3-bedroom'] ??
            slot.unitMonthlyContributions?.['3-bedroom'] ??
            slot.unitMonthlyContributions?.['2-bedroom'] ??
            slot.monthlyContribution,
        },
      ])
    ) as unknown as NonNullable<FinanceTemplate['deliveryTracks'][number]['slots'][number]['paymentTermMonthlyContributions']>;
  const updatePaymentTermAmount = (
    trackIndex: number,
    slotIndex: number,
    paymentTerm: PaymentTerm,
    unit: '2-bedroom' | '3-bedroom',
    amount: number
  ) => {
    setTemplate((current) => {
      const next = structuredClone(current);
      const slot = next.deliveryTracks[trackIndex].slots[slotIndex];
      const currentMap = buildSlotPaymentTermMap(slot);
      const existingTermValues = currentMap[paymentTerm];

      slot.paymentTermMonthlyContributions = {
        ...currentMap,
        [paymentTerm]: {
          ...existingTermValues,
          [unit]: amount,
        },
      };

      if (paymentTerm === '5 Years') {
        const baselineTerm = slot.paymentTermMonthlyContributions['5 Years'];
        slot.unitMonthlyContributions = {
          '2-bedroom':
            unit === '2-bedroom'
              ? amount
              : baselineTerm['2-bedroom'],
          '3-bedroom':
            unit === '3-bedroom'
              ? amount
              : baselineTerm['3-bedroom'],
        };
        slot.monthlyContribution = slot.unitMonthlyContributions['2-bedroom'];
      }

      return next;
    });
  };
  const updateGatewayField = <K extends keyof FinanceTemplate['paymentGateway']>(
    key: K,
    value: FinanceTemplate['paymentGateway'][K]
  ) => {
    setTemplate((current) => ({
      ...current,
      paymentGateway: {
        ...current.paymentGateway,
        [key]: value,
      },
    }));
  };

  return (
    <AdminShell
      activeKey="settings"
      pageTitle="Programme Settings"
      pageSummary="Programme Settings is where admins set the 2-bedroom cash price, the 5% down payment, the monthly amount for each delivery year, and the finance labels the member app reads. All values remain editable.">
      <div className={styles.stack}>
        <section className={styles.hero}>
          <div>
            <div className={styles.panelLabel}>Finance Template</div>
            <h2 className={styles.heroTitle}>Admin-owned pricing matrix for member finance requirements</h2>
            <p className={styles.muted}>
              This controls the 2-bedroom and 3-bedroom cash selling price per member and the monthly payment
              amount the Finance page shows after a member selects a delivery year during onboarding, while
              live slot claims and transaction history continue to come from Firestore.
            </p>
            <p className={styles.muted}>
              The current defaults are based on a $125,000 cash price for 2-bedroom units, a $175,000 cash
              price for 3-bedroom units, separate monthly amounts for both bedroom types, and a 5% down
              payment, but every amount in this screen can still be edited by the admin.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              disabled={isSaving || isLoading}
              type="button"
              onClick={async () => {
                setIsSaving(true);
                setError(null);
                setStatus(null);

                try {
                  const saved = await saveFinanceTemplate(template);
                  setPricingPublicationMissing(!saved);
                  setStatus(
                    saved
                      ? 'Finance template saved to Firestore.'
                      : 'Firebase config is missing in this web workspace, so the template could not be saved.'
                  );
                } catch (nextError) {
                  void logAdminSystemAlert({
                    message: nextError instanceof Error ? nextError.message : 'Unable to save finance template.',
                    sourceArea: 'finance-settings',
                  });
                  setError(nextError instanceof Error ? nextError.message : 'Unable to save finance template.');
                } finally {
                  setIsSaving(false);
                }
              }}>
              {isSaving ? 'Saving...' : 'Save Finance Template'}
            </button>
            <button
              className={styles.secondaryButton}
              disabled={isSaving}
              type="button"
              onClick={() => {
                setTemplate(defaultFinanceTemplate);
                setStatus('Reset to local default template values.');
                setError(null);
              }}>
              Reset Defaults
            </button>
          </div>
        </section>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.topRow}>
              <div>
                <div className={styles.panelLabel}>Header Controls</div>
                <h2 className={styles.panelTitle}>Comparison and contribution labels</h2>
              </div>
              <div className={styles.pill}>{usedFirebase ? 'Firebase linked' : 'Fallback mode'}</div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Comparison Label</span>
                <input
                  className={styles.input}
                  value={template.comparisonLabel}
                  onChange={(event) =>
                    setTemplate((current) => ({ ...current, comparisonLabel: event.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Currency Symbol</span>
                <input
                  className={styles.input}
                  value={template.currencySymbol}
                  onChange={(event) =>
                    setTemplate((current) => ({ ...current, currencySymbol: event.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Goal Label</span>
                <input
                  className={styles.input}
                  value={template.contributionGoalLabel}
                  onChange={(event) =>
                    setTemplate((current) => ({ ...current, contributionGoalLabel: event.target.value }))
                  }
                />
              </label>

              {Object.entries(template.unitPrices).map(([interestId, price]) => (
                <label className={styles.field} key={interestId}>
                  <span className={styles.fieldLabel}>
                    {interestId.replace(/-/g, ' ')} Cash Price
                  </span>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    value={price}
                    onChange={(event) =>
                      setTemplate((current) => ({
                        ...current,
                        unitPrices: {
                          ...current.unitPrices,
                          [interestId]: Number(event.target.value) || 0,
                        },
                      }))
                    }
                  />
                </label>
              ))}

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Down Payment Rate (%)</span>
                <input
                  className={styles.input}
                  inputMode="decimal"
                  value={template.downPaymentRate}
                  onChange={(event) =>
                    setTemplate((current) => ({
                      ...current,
                      downPaymentRate: Number(event.target.value) || 0,
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Admin Note</span>
              <textarea
                className={styles.textarea}
                value={template.adminNote}
                onChange={(event) =>
                  setTemplate((current) => ({ ...current, adminNote: event.target.value }))
                }
              />
            </label>
          </section>

          <aside className={styles.noteCard}>
            <div className={styles.panelLabel}>Backend Use</div>
            <h2 className={styles.panelTitle}>What the member app reads</h2>
            <p className={styles.muted}>
              The mobile Finance page combines this template with the member&apos;s selected unit interest,
              payment term, delivery track, and slot from registration.
            </p>
            {pricingPublicationMissing ? (
              <p className={styles.statusError}>
                This Firebase template has older delivery-slot data only. Enter the actual 2-bedroom and
                3-bedroom cash prices and the down-payment rate above, then save before publishing member prices.
              </p>
            ) : null}
            <p className={styles.muted}>
              Admin changes here affect the exact amount a member sees for their own combination, while slot
              status is derived from live registrations.
            </p>
            {status ? <p className={styles.statusOk}>{status}</p> : null}
            {error ? <p className={styles.statusError}>{error}</p> : null}
            {isLoading ? <p className={styles.muted}>Loading finance template...</p> : null}
          </aside>
        </div>

        <section className={styles.panel}>
          <div className={styles.topRow}>
            <div>
              <div className={styles.panelLabel}>Payment Gateway</div>
              <h2 className={styles.panelTitle}>Paystack test mode</h2>
              <p className={styles.muted}>
                This admin surface stores the test-mode payment settings with the finance template and can
                launch a real Paystack inline test checkout from the browser.
              </p>
            </div>
            <div className={styles.pill}>{paystackTestPublicKey ? 'Test key loaded' : 'Missing test key'}</div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.checkboxField}>
              <span className={styles.fieldLabel}>Gateway Status</span>
              <span className={styles.checkboxRow}>
                <input
                  checked={template.paymentGateway.enabled}
                  type="checkbox"
                  onChange={(event) => updateGatewayField('enabled', event.target.checked)}
                />
                <span>Enable Paystack test mode for this finance template</span>
              </span>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Mode</span>
              <input className={styles.input} disabled value={template.paymentGateway.mode} />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Currency</span>
              <select
                className={styles.input}
                value={template.paymentGateway.currency}
                onChange={(event) => updateGatewayField('currency', event.target.value as 'GHS' | 'USD')}>
                <option value="GHS">GHS</option>
                <option value="USD">USD</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Callback Path</span>
              <input
                className={styles.input}
                value={template.paymentGateway.callbackPath}
                onChange={(event) => updateGatewayField('callbackPath', event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Public Key Env Var</span>
              <input
                className={styles.input}
                value={template.paymentGateway.publicKeyEnvVar}
                onChange={(event) => updateGatewayField('publicKeyEnvVar', event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Default Customer Email</span>
              <input
                className={styles.input}
                inputMode="email"
                value={template.paymentGateway.defaultCustomerEmail}
                onChange={(event) => updateGatewayField('defaultCustomerEmail', event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Charge Type</span>
              <select
                className={styles.input}
                value={template.paymentGateway.defaultChargeType}
                onChange={(event) =>
                  updateGatewayField('defaultChargeType', event.target.value as FinanceGatewayChargeType)
                }>
                <option value="down-payment">Down Payment</option>
                <option value="full-price">Full Price</option>
                <option value="custom">Custom Amount</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Default Unit</span>
              <select
                className={styles.input}
                value={paystackUnitInterest}
                onChange={(event) =>
                  updateGatewayField('defaultUnitInterest', event.target.value as '2-bedroom' | '3-bedroom')
                }>
                <option value="2-bedroom">2 Bedroom</option>
                <option value="3-bedroom">3 Bedroom</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Custom Test Amount</span>
              <input
                className={styles.input}
                inputMode="decimal"
                value={template.paymentGateway.customTestAmount}
                onChange={(event) =>
                  updateGatewayField('customTestAmount', Number(event.target.value) || 0)
                }
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Test Reference</span>
              <input
                className={styles.input}
                value={testReference}
                onChange={(event) => setTestReference(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              disabled={isLaunchingTestCheckout || isLoading}
              type="button"
              onClick={async () => {
                setIsLaunchingTestCheckout(true);
                setPaystackError(null);
                setPaystackStatus(null);

                try {
                  if (!template.paymentGateway.enabled) {
                    throw new Error('Paystack test mode is disabled in the finance template.');
                  }

                  await launchPaystackTestCheckout({
                    publicKey: paystackTestPublicKey,
                    email: template.paymentGateway.defaultCustomerEmail,
                    amountMajor: paystackSuggestedAmount,
                    currency: template.paymentGateway.currency,
                    reference: testReference.trim() || createPaystackTestReference(),
                    metadata: {
                      mode: template.paymentGateway.mode,
                      cohortId: template.cohortId,
                      chargeType: template.paymentGateway.defaultChargeType,
                      unitInterest: template.paymentGateway.defaultUnitInterest,
                      callbackPath: template.paymentGateway.callbackPath,
                    },
                    onSuccess: (response) => {
                      setPaystackStatus(
                        `Paystack test checkout completed. Reference: ${response.reference ?? response.trxref ?? 'unknown'}.`
                      );
                      setTestReference(createPaystackTestReference());
                    },
                    onClose: () => {
                      setPaystackStatus((current) => current ?? 'Paystack test checkout closed before completion.');
                    },
                  });
                } catch (nextError) {
                  const message = nextError instanceof Error ? nextError.message : 'Unable to launch Paystack test mode.';
                  void logAdminSystemAlert({
                    message,
                    sourceArea: 'paystack-test-mode',
                  });
                  setPaystackError(message);
                } finally {
                  setIsLaunchingTestCheckout(false);
                }
              }}>
              {isLaunchingTestCheckout ? 'Launching...' : 'Launch Paystack Test Checkout'}
            </button>
            <button
              className={styles.secondaryButton}
              disabled={isLaunchingTestCheckout}
              type="button"
              onClick={() => {
                setTestReference(createPaystackTestReference());
                setPaystackStatus('Generated a new Paystack test reference.');
                setPaystackError(null);
              }}>
              Refresh Test Reference
            </button>
          </div>

          <div className={styles.gatewayNoteGrid}>
            <div className={styles.noteCard}>
              <div className={styles.panelLabel}>Resolved Amount</div>
              <h3 className={styles.trackTitle}>
                {template.paymentGateway.currency} {paystackSuggestedAmount.toLocaleString()}
              </h3>
              <p className={styles.muted}>
                This amount is derived from the selected unit and charge type. Down payment uses the finance
                template rate; custom uses the stored custom test amount.
              </p>
            </div>
            <div className={styles.noteCard}>
              <div className={styles.panelLabel}>Environment Binding</div>
              <p className={styles.muted}>
                The browser reads the Paystack test public key from `NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY`.
                Do not place a secret key in this web app.
              </p>
              {paystackStatus ? <p className={styles.statusOk}>{paystackStatus}</p> : null}
              {paystackError ? <p className={styles.statusError}>{paystackError}</p> : null}
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.topRow}>
            <div>
              <div className={styles.panelLabel}>Delivery Matrix</div>
              <h2 className={styles.panelTitle}>Editable member pricing by slot and payment term</h2>
              <p className={styles.muted}>
                Cash prices are set once in the pricing controls above. Each slot below carries the monthly
                contribution for each bedroom type and payment term.
              </p>
            </div>
          </div>

          <div className={styles.tracks}>
            {template.deliveryTracks.map((track, trackIndex) => {
              return (
                <article key={track.key} className={styles.trackCard}>
                  <div className={styles.trackCopy}>
                    <div className={styles.panelLabel}>{track.label}</div>
                    <h3 className={styles.trackTitle}>{track.description}</h3>
                  </div>

                  <div className={styles.slotGrid}>
                    {track.slots.map((slot, slotIndex) => (
                      <section key={slot.key} className={styles.slotCard}>
                        <div className={styles.slotMetrics}>
                          <div className={styles.metricField}>
                            <span className={styles.fieldLabel}>Slot</span>
                            <div className={styles.input}>{slot.label}</div>
                          </div>

                          <div className={styles.metricField}>
                            <span className={styles.fieldLabel}>2 Bed Cash</span>
                            <div className={styles.input}>
                              {template.currencySymbol} {template.unitPrices['2-bedroom'].toLocaleString()}
                            </div>
                          </div>

                          <div className={styles.metricField}>
                            <span className={styles.fieldLabel}>2 Bed Down</span>
                            <div className={styles.input}>{twoBedroomDownPayment}</div>
                          </div>

                          <div className={styles.metricField}>
                            <span className={styles.fieldLabel}>3 Bed Cash</span>
                            <div className={styles.input}>
                              {template.currencySymbol} {template.unitPrices['3-bedroom'].toLocaleString()}
                            </div>
                          </div>

                          <div className={styles.metricField}>
                            <span className={styles.fieldLabel}>3 Bed Down</span>
                            <div className={styles.input}>{threeBedroomDownPayment}</div>
                          </div>

                          <div className={styles.metricField}>
                            <span className={styles.fieldLabel}>Delivery Months</span>
                            <div className={styles.input}>{formatDeliveryMonths(slot.targetCompletionMonths)}</div>
                          </div>

                          <div className={styles.metricField}>
                            <span className={styles.fieldLabel}>Slot Status</span>
                            <div className={slot.isAvailable ? styles.statusLive : styles.statusClosed}>
                              {slot.isAvailable ? 'Open' : 'Taken'}
                            </div>
                          </div>
                        </div>

                        <div className={styles.slotGrid}>
                          {PAYMENT_TERM_OPTIONS.map((paymentTerm) => {
                            const termValues = buildSlotPaymentTermMap(slot)[paymentTerm];

                            return (
                              <div key={paymentTerm} className={styles.slotCard}>
                                <div className={styles.trackCopy}>
                                  <div className={styles.panelLabel}>{paymentTerm}</div>
                                  <h3 className={styles.trackTitle}>Monthly amount for this term and slot</h3>
                                </div>

                                <div className={styles.slotMetrics}>
                                  <label className={styles.metricField}>
                                    <span className={styles.fieldLabel}>2 Bed Monthly</span>
                                    <input
                                      className={styles.input}
                                      inputMode="numeric"
                                      value={termValues['2-bedroom']}
                                      onChange={(event) =>
                                        updatePaymentTermAmount(
                                          trackIndex,
                                          slotIndex,
                                          paymentTerm,
                                          '2-bedroom',
                                          Number(event.target.value) || 0
                                        )
                                      }
                                    />
                                  </label>

                                  <label className={styles.metricField}>
                                    <span className={styles.fieldLabel}>3 Bed Monthly</span>
                                    <input
                                      className={styles.input}
                                      inputMode="numeric"
                                      value={termValues['3-bedroom']}
                                      onChange={(event) =>
                                        updatePaymentTermAmount(
                                          trackIndex,
                                          slotIndex,
                                          paymentTerm,
                                          '3-bedroom',
                                          Number(event.target.value) || 0
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function getPaystackTestAmount(template: FinanceTemplate) {
  const unitPrice = template.unitPrices[template.paymentGateway.defaultUnitInterest];

  if (template.paymentGateway.defaultChargeType === 'full-price') {
    return unitPrice;
  }

  if (template.paymentGateway.defaultChargeType === 'custom') {
    return template.paymentGateway.customTestAmount;
  }

  return Math.round((unitPrice * template.downPaymentRate) / 100);
}
