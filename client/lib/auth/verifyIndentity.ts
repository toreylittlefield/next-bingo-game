import type { NetlifyAppMetaData } from '../../types/types';
import { NETLIFY_SITE_URL } from '../constants/constants';

export async function verifyIdentity(access_token: string) {
  try {
    const userRes = await fetch(`${NETLIFY_SITE_URL}/.netlify/identity/user`, {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });
    const user = (await userRes.json()) as NetlifyAppMetaData;
    return user;
  } catch (error) {
    console.error(error);
  }
}
