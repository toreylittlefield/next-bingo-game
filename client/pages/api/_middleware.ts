// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextMiddleware, NextResponse } from 'next/server';
import { getIdentitySession } from '../../lib/auth/getIdentitySession';
import { NETLIFY_SITE_URL } from '../../lib/constants/constants';

const authIdentityMiddleware: NextMiddleware = async (req, event) => {
  const { user, localTestCookie } = await getIdentitySession(req);

  let url = process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : NETLIFY_SITE_URL;
  if (!user) return NextResponse.redirect(`${url}/login`);

  const res = NextResponse.next();
  if (localTestCookie?.token) {
    localTestCookie.set(res);
  }

  return res;
};

export default authIdentityMiddleware;
