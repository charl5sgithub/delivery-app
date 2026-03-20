import crypto from 'crypto';
// Node 18+ has fetch natively.

const GP_API_URL = process.env.GP_ENV === 'production'
  ? 'https://apis.globalpay.com/ucp'
  : 'https://apis.sandbox.globalpay.com/ucp';

/**
 * Generate a transient access token to create a payment link
 * Requires GP_APP_ID and GP_APP_KEY
 */
export async function getAccessToken() {
  const appId = process.env.GP_APP_ID;
  const appKey = process.env.GP_APP_KEY;

  if (!appId || !appKey) {
    throw new Error('Global Payments GP_APP_ID or GP_APP_KEY is missing in backend .env');
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const secret = crypto.createHash('sha512').update(nonce + appKey).digest('hex');

  // Using singular endpoint from user guide: /accesstoken
  const response = await fetch(`${GP_API_URL}/accesstoken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GP-Version': '2021-03-22'
    },
    body: JSON.stringify({
      app_id: appId,
      nonce: nonce,
      secret: secret,
      grant_type: 'client_credentials'
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to generate access token: ${data.message || JSON.stringify(data)}`);
  }

  return data.token;
}

export async function createHppLink(token, orderInfo) {
  const accountName = 'transaction_processing'; // Optional or from env

  // Transform orderInfo to expected GP JSON payload
  // const payload = {
  //   account_name: accountName,
  //   type: "HOSTED_PAYMENT_PAGE",
  //   name: `Order ${orderInfo.orderId}`,
  //   description: "Delivery App Order",
  //   reference: orderInfo.orderId.toString(),
  //   payer: {
  //     name: orderInfo.name,
  //     email: orderInfo.email,
  //     mobile_phone: {
  //       country_code: "44", // Assuming UK
  //       subscriber_number: orderInfo.phone.replace(/[^0-9]/g, '').slice(-10) // Basic clean up
  //     },
  //     billing_address: {
  //       line_1: orderInfo.address.slice(0, 50),
  //       line_2: orderInfo.city || "UK",
  //       line_3: "N/A",
  //       city: orderInfo.city || "UK",
  //       postal_code: orderInfo.postcode || "0000",
  //       country: "GB"
  //     }
  //   },
  //   order: {
  //     amount: parseInt(parseFloat(orderInfo.total) * 100).toString(), // in cents/pence, as string
  //     currency: "GBP",
  //     reference: orderInfo.orderId.toString(),
  //     transaction_configuration: {
  //        channel: "CNP",
  //        country: "GB",
  //        capture_mode: "AUTO",
  //        allowed_payment_methods: ["CARD"]
  //     }
  //   },
  //   notifications: {
  //     return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?order_id=${orderInfo.orderId}`,
  //     status_url: `http://localhost:5000/api/orders/webhook/gp` // Will handle async status notification. In prod needs absolute public URL
  //   }
  // };

  const payload = {
    account_name: accountName,
    type: "HOSTED_PAYMENT_PAGE",
    name: `Order ${orderInfo.orderId}`,
    description: "Delivery App Order",
    reference: orderInfo.orderId.toString(),
    currency: "GBP",                          // ✅ moved to root
    amount: parseInt(parseFloat(orderInfo.total) * 100), // ✅ number, not string
    payer: {
      name: orderInfo.name,
      email: orderInfo.email,
      billing_address: {
        line_1: orderInfo.address.slice(0, 50),
        line_2: orderInfo.city || "London",
        city: orderInfo.city || "London",
        postal_code: orderInfo.postcode || "SW1A 1AA",
        country: "GB"
      }
    },
    order: {
      reference: orderInfo.orderId.toString(),
      transaction_configuration: {
        channel: "CNP",
        country: "GB",
        capture_mode: "AUTO",
        allowed_payment_methods: ["CARD"]
      }
    },
    notifications: {
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?order_id=${orderInfo.orderId}`,
      status_url: `${process.env.WEBHOOK_URL || 'http://localhost:5000'}/api/orders/webhook/gp`
    }
  };
  const response = await fetch(`${GP_API_URL}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-GP-Version': '2021-03-22'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to create HPP link: ${data.message || JSON.stringify(data)}`);
  }

  return data.url;
}
