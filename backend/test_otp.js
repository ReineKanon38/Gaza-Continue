import { TOTP } from 'otplib';

const totp = new TOTP();
const secret = totp.generateSecret(20);
const uri = totp.generateURI({ issuer: 'SYSCOM-GAZA', label: 'test@test.com', secret });
console.log('Secret:', secret);
console.log('URI:', uri);
const token = totp.generate(secret);
console.log('Token:', token);
console.log('Verify:', totp.verify({ token, secret }));
