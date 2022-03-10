// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextMiddleware, NextResponse } from 'next/server';
import { getIdentitySession } from '../../lib/auth/getIdentitySession';
import { NETLIFY_SITE_URL } from '../../lib/constants/constants';

const authIdentityMiddleware: NextMiddleware = async (req, event) => {
  const { user, setLocalTestCookie } = await getIdentitySession(req);

  if (!user) return NextResponse.redirect(`${NETLIFY_SITE_URL}/login`);

  const res = NextResponse.next();
  if (setLocalTestCookie?.token) {
    setLocalTestCookie.setLocalCookie(res);
  }

  return res;
};

export default authIdentityMiddleware;
