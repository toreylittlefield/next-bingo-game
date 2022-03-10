// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextMiddleware, NextResponse } from 'next/server';
import { getIdentitySession } from '../../lib/auth/getIdentitySession';

const authIdentityMiddleware: NextMiddleware = async (req, event) => {
  const { user, setLocalTestCookie } = await getIdentitySession(req);

  if (!user) return NextResponse.redirect('/login');

  const res = NextResponse.next();
  if (setLocalTestCookie?.token) {
    setLocalTestCookie.setLocalCookie(res);
  }

  return res;
};

export default authIdentityMiddleware;
