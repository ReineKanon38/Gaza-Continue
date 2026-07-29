import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testSyscom() {
    try {
        console.log('Token syscom...');
        const tokenData = await axios.post('https://developers.syscom.mx/oauth/token', {
            client_id: process.env.SYSCOM_CLIENT_ID,
            client_secret: process.env.SYSCOM_CLIENT_SECRET,
            grant_type: 'client_credentials'
        });
        const token = tokenData.data.access_token;

        console.log('Fetching HIKVISION...');
        const res = await axios.get('https://developers.syscom.mx/api/v1/productos', {
            params: { marca: 'HIKVISION' },
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Result count:', res.data.productos.length);
        console.log('Total found:', res.data.paginas.total);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}
testSyscom();
