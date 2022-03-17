// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextMiddleware, NextResponse } from 'next/server';
import { verifyIdentity } from '../../lib/auth/verifyIndentity';
import { NETLIFY_ROLE } from '../../lib/constants/constants';

function unAuthResponse(message: string = 'Token Required', status: number = 401) {
  const res = new Response(message, {
    status,
  });
  res.headers.set('set-cookie', 'nf_jwt=""; Max-Age=0; path=/;');
  return res;
}

const authIdentityMiddleware: NextMiddleware = async (req, event) => {
  const token = req.headers.get('authorization');
  if (!token) return unAuthResponse();

  const [_, access_token] = token.split(' ');
  let user = await verifyIdentity(access_token);

  if (!user || !user.id || !user.app_metadata.roles.includes(NETLIFY_ROLE)) {
    console.log('Not authorized, no user cookie!');
    user = undefined;
  }

  if (!user) return unAuthResponse('User Is Not Authorized');
  return NextResponse.next();
};

export default authIdentityMiddleware;
