# Hubtel setup

The app now uses a server-mediated Hubtel checkout:

1. The mobile app calls `createHubtelCheckout` with the expected contribution amount.
2. The Firebase Function creates a pending transaction and asks Hubtel for a hosted checkout link.
3. The app opens that link. The customer chooses an available Hubtel payment method there.
4. Hubtel calls `hubtelPaymentWebhook`; the callback updates the pending transaction idempotently.

Before deployment, copy `.env.example` to the Functions environment and replace the placeholders. The three values to leave until the end are:

- `HUBTEL_API_ID`
- `HUBTEL_API_KEY`
- `HUBTEL_MERCHANT_ACCOUNT`

The API key must never be exposed to the Expo app or the Next.js public bundle. The OnlineCheckout endpoint defaults to `https://payproxyapi.hubtel.com/items/initiate`; keep the override only if Hubtel gives your account a different endpoint. The callback, success, cancellation, and logo values must be HTTPS URLs reachable by Hubtel.

After setting the values, deploy from the sibling Firebase directory:

```cmd
cd /d "C:\Users\lenovo\Desktop\grouptown App\firebase"
firebase deploy --only functions
```

The deployed callback URL is:

```text
https://us-central1-grouptown-app.cloudfunctions.net/hubtelPaymentWebhook
```

Do not mark a payment as completed from a return page. Only the Hubtel callback updates the Firestore transaction.
