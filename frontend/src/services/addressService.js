import { requestJson } from './httpClient';

export const lookupZipCode = async (zipCode) => {
  const data = await requestJson(`/api/address/zip/${zipCode}`);
  return data?.data || null;
};

export default {
  lookupZipCode
};
