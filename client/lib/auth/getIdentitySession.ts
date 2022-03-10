// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { NETLIFY_ROLE } from '../constants/constants';
import { getLocalTestCookie } from './localIdentityLogin';
import { verifyIdentity } from './verifyIndentity';

export async function getIdentitySession(req: NextRequest) {
  let cookieAccessToken = req.cookies['nf_jwt'];

  const setLocalTestCookie = await getLocalTestCookie(req, cookieAccessToken);
  if (setLocalTestCookie?.token) {
    cookieAccessToken = setLocalTestCookie.token.access_token;
  }

  if (!cookieAccessToken) {
    console.log('Not authorized, no user cookie!');
  }

  if (cookieAccessToken) {
    var user = await verifyIdentity(cookieAccessToken);

    if (!user || !user.token?.access_token || !user.app_metadata.roles.includes(NETLIFY_ROLE)) {
      console.log('Not authorized, no user cookie!');
      user = undefined;
    }
  }

  return { user, cookieAccessToken, setLocalTestCookie };
}
