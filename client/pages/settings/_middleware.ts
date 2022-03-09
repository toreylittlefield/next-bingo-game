// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { getLocalTestCookie } from '../../lib/auth/localIdentityLogin';
import { verifyIdentity } from '../../lib/auth/verifyIndentity';
// import { withNetlifySession } from '../../lib/auth/withNetlifySession';

export const middleware: NextMiddleware = async (req, event) => {
  const res = NextResponse;
  let cookieAccessToken = req.cookies['nf_jwt'];

  const setLocalTestCookie = await getLocalTestCookie(req, cookieAccessToken);
  if (setLocalTestCookie?.token) {
    cookieAccessToken = setLocalTestCookie.token.access_token;
  }

  if (!cookieAccessToken) {
    console.log('Not authorized, no user cookie!');
    return NextResponse.redirect('/login');
  }

  const user = await verifyIdentity(cookieAccessToken);

  if (!user || !user.app_metadata || !user.id) {
    console.log('Not authorized, no user cookie!');
    return NextResponse.redirect('/login');
  }

  const username = user.user_metadata.full_name;

  const rewrite = res.rewrite(`/settings/userprofile?username=${username}`);

  if (setLocalTestCookie?.token) {
    setLocalTestCookie.setLocalCookie(rewrite);
  }

  return rewrite;
};
