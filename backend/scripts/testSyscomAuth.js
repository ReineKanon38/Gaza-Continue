await import('../src/utils/dns-fix.js');

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const clientId = process.env.SYSCOM_CLIENT_ID;
const clientSecret = process.env.SYSCOM_API_KEY;

console.log('Testing SYSCOM Auth...');
console.log('Client ID:', clientId ? `${clientId.substring(0, 5)}...` : 'MISSING');
console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 5)}...` : 'MISSING');

async function testAuth() {
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');

    console.log('Requesting OAuth token from https://developers.syscom.mx/oauth/token ...');
    const response = await axios.post('https://developers.syscom.mx/oauth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('OAuth Token response SUCCESS! Data:', response.data);

    // Try search with token
    const token = response.data.access_token;
    console.log('Testing /api/v1/productos?busqueda=camara with Bearer token...');
    const searchRes = await axios.get('https://developers.syscom.mx/api/v1/productos?busqueda=camara', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Search response status:', searchRes.status);
    console.log('Products returned:', searchRes.data?.productos?.length || searchRes.data?.length || 0);

  } catch (err) {
    console.error('AUTH ERROR:', err.response?.status, err.response?.data || err.message);
  }
  process.exit(0);
}

testAuth();
