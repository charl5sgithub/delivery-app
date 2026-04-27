import crypto from 'crypto';
// Node 18+ has fetch natively.

const GP_API_URL = process.env.GP_ENV === 'production'
  ? 'https://apis.globalpay.com/ucp'
  : 'https://apis.sandbox.globalpay.com/ucp';

/**
 * Generate a transient access token to create a payment link
 * Requires GP_APP_ID and GP_APP_KEY
 */
export async function getAccessToken(permissions) {
  const appId = process.env.GP_APP_ID;
  const appKey = process.env.GP_APP_KEY;

  if (!appId || !appKey) {
    throw new Error('Global Payments GP_APP_ID or GP_APP_KEY is missing in backend .env');
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const secret = crypto.createHash('sha512').update(nonce + appKey).digest('hex');

  const payload = {
      app_id: appId,
      nonce: nonce,
      secret: secret,
      grant_type: 'client_credentials'
  };

  if (permissions) {
      payload.permissions = permissions;
  }

  console.log("[GP] Requesting access token...");

  // Using singular endpoint from user guide: /accesstoken
  const response = await fetch(`${GP_API_URL}/accesstoken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GP-Version': '2021-03-22'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("[GP] Access token error response:", JSON.stringify(data, null, 2));
    throw new Error(`Failed to generate access token: ${data.message || JSON.stringify(data)}`);
  }

  console.log("[GP] Access token obtained successfully.");
  return data.token;
}

/**
 * Create a Global Payments Hosted Payment Page (HPP) link.
 * Returns the redirect URL that the customer should be sent to.
 */
export async function createHppLink(accessToken, orderInfo) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('WEBHOOK_URL is missing in backend .env — set it to your ngrok URL for sandbox testing.');
  }

  // Safely convert total to pence (string). Guard against null/undefined.
  const totalNum = Number(orderInfo.total);
  if (!totalNum || isNaN(totalNum) || totalNum <= 0) {
    throw new Error(`Invalid order total: ${orderInfo.total}`);
  }
  const amountInPence = Math.round(totalNum * 100).toString();

  const payload = {
    account_name: process.env.GP_PAYLINK_ACCOUNT_NAME || process.env.GP_ACCOUNT_NAME || 'transaction_processing',
    type: "SALE",
    channel: "CNP",
    capture_mode: "AUTO",
    order: {
      amount: amountInPence,
      currency: "GBP",
      reference: orderInfo.orderId.toString(),
      description: `Order #${orderInfo.orderId}`
    },
    notifications: {
      return_url: `${webhookUrl}/api/orders/hpp/return`,
      status_url: `${webhookUrl}/api/orders/hpp/return`
    }
  };

  // Add payer info if available
  if (orderInfo.name || orderInfo.email) {
    payload.payer = {
      name: orderInfo.name || "Customer",
      email: orderInfo.email || undefined,
      reference: orderInfo.email || orderInfo.orderId.toString()
    };
  }

  // Add billing address if available
  if (orderInfo.address) {
    payload.payer = {
      ...payload.payer,
      billing_address: {
        line_1: orderInfo.address,
        city: orderInfo.city || "London",
        postal_code: orderInfo.postcode || "SW1A 1AA",
        country: "GB"
      }
    };
  }

  console.log("[GP] Creating HPP link with payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(`${GP_API_URL}/paybylink`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-GP-Version': '2021-03-22'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[GP] HPP link creation FAILED");
    console.error("[GP] HTTP Status:", response.status, response.statusText);
    console.error("[GP] Full error response:", JSON.stringify(data, null, 2));
    console.error("[GP] account_name used:", payload.account_name);
    console.error("[GP] Hint: Check your GP Developer Portal for the correct account_name for Pay By Link.");
    console.error("[GP] Hint: The 'transaction_processing' account may not support paybylink. Look for a separate paylink account.");
    throw new Error(
      data?.detailed_error_description ||
      data?.error?.message ||
      data?.message ||
      `HPP link creation failed (HTTP ${response.status})`
    );
  }

  console.log("[GP] HPP link created successfully:", data.id);
  console.log("[GP] Redirect URL:", data.url || data.redirect_url);

  // GP may return the link URL in different fields depending on version
  const redirectUrl = data.url || data.redirect_url;
  if (!redirectUrl) {
    console.error("[GP] Full HPP response (missing URL):", JSON.stringify(data, null, 2));
    throw new Error("HPP link was created but no redirect URL was returned.");
  }

  return redirectUrl;
}

/**
 * Process a direct card payment using a single-use payment token.
 * (Kept for reference — the main card flow now uses HPP via createHppLink)
 */
export async function processPayment(accessToken, payment_token, orderInfo) {
  const accountName = process.env.GP_ACCOUNT_NAME || 'transaction_processing';

  // Safely convert total to pence
  const totalNum = Number(orderInfo.total);
  if (!totalNum || isNaN(totalNum) || totalNum <= 0) {
    throw new Error(`Invalid order total for payment: ${orderInfo.total}`);
  }

  const payload = {
    account_name: accountName,
    type: "SALE",
    channel: "CNP",
    capture_mode: "AUTO",
    amount: Math.round(totalNum * 100).toString(),
    currency: "GBP",
    reference: orderInfo.orderId.toString(),
    payment_method: {
      entry_mode: "ECOM",
      id: payment_token
    }
  };

  console.log("[GP] Process Payment Payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(`${GP_API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-GP-Version': '2021-03-22'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[GP] Transaction error response:", JSON.stringify(data, null, 2));
    throw new Error(data?.detailed_error_description || data?.message || "Payment processing failed");
  }

  // The transaction was successful
  if (data.status !== "CAPTURED" && data.status !== "AUTHORIZED") {
      throw new Error(`Payment resulted in unexpected status: ${data.status}`);
  }

  return data;
}