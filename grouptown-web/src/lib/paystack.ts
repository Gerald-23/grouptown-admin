declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency?: string;
        metadata?: Record<string, unknown>;
        callback?: (response: { reference?: string; status?: string; trxref?: string }) => void;
        onClose?: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

const PAYSTACK_INLINE_URL = 'https://js.paystack.co/v1/inline.js';

function getExistingScript() {
  return document.querySelector<HTMLScriptElement>(`script[src="${PAYSTACK_INLINE_URL}"]`);
}

export async function loadPaystackInline() {
  if (typeof window === 'undefined') {
    throw new Error('Paystack checkout can only run in the browser.');
  }

  if (window.PaystackPop) {
    return window.PaystackPop;
  }

  const existing = getExistingScript();

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load the Paystack checkout script.')), {
        once: true,
      });
    });
  } else {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PAYSTACK_INLINE_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load the Paystack checkout script.'));
      document.head.appendChild(script);
    });
  }

  if (!window.PaystackPop) {
    throw new Error('Paystack checkout is unavailable after the script loaded.');
  }

  return window.PaystackPop;
}

export async function launchPaystackTestCheckout(input: {
  publicKey: string;
  email: string;
  amountMajor: number;
  currency: 'GHS' | 'USD';
  reference: string;
  metadata?: Record<string, unknown>;
  onSuccess?: (response: { reference?: string; status?: string; trxref?: string }) => void;
  onClose?: () => void;
}) {
  if (!input.publicKey.trim()) {
    throw new Error('Paystack test public key is missing.');
  }

  if (!input.email.trim()) {
    throw new Error('A customer email is required for Paystack checkout.');
  }

  if (!Number.isFinite(input.amountMajor) || input.amountMajor <= 0) {
    throw new Error('A positive test amount is required for Paystack checkout.');
  }

  const paystack = await loadPaystackInline();
  const handler = paystack.setup({
    key: input.publicKey.trim(),
    email: input.email.trim(),
    amount: Math.round(input.amountMajor * 100),
    ref: input.reference.trim(),
    currency: input.currency,
    metadata: input.metadata,
    callback: input.onSuccess,
    onClose: input.onClose,
  });

  handler.openIframe();
}

export function createPaystackTestReference(prefix = 'grouptown-test') {
  return `${prefix}-${Date.now()}`;
}

export {};
