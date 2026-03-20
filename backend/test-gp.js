import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';

async function testToken() {
  const appId = process.env.GP_APP_ID;
  const appKey = process.env.GP_APP_KEY;
  const nonce = crypto.randomBytes(16).toString('hex');
  const secret = crypto.createHash('sha512').update(nonce + appKey).digest('hex');

  console.log("AppID:", appId);
  // Testing standard authorization payload with no permissions restriction
  const body = JSON.stringify({
    app_id: appId,
    nonce: nonce,
    secret: secret,
    grant_type: 'client_credentials'
  });

  const url = 'https://apis.sandbox.globalpay.com/ucp/accesstokens';
  console.log("Requesting Token...");
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GP-Version': '2021-03-22'
    },
    body: body
  });

  const data = await response.json();
  console.log("Token Response:", data);
}
testToken();
