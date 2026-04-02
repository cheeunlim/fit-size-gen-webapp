import { GoogleAuth } from 'google-auth-library';

export const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
});
