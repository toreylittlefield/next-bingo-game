import { NextMiddleware, NextResponse } from 'next/server';
import { withNetlifySession } from '../lib/auth/withNetlifySession';
import { NETLIFY_SITE_URL } from '../lib/constants/constants';
import { NetlifyAppMetaData } from '../types/types';

export const middleware: NextMiddleware = async (req, event) => {
  const basicAuth = req.headers.get('authorization');
  const { pathname } = req.nextUrl;
  if (req.headers.get('host')?.startsWith('localhost')) {
    const cookie = req.cookies['nf_jwt'];
    // NextResponse.next().cookie()
  }
  if (pathname === '/' || pathname === '/login') {
    return NextResponse.next();
  }
  const token = req?.cookies?.[`nf_jwt`];
  // console.log(Array.from(req.headers.entries()), '****** HEADERS *******');
  // console.log(JSON.stringify({ cookies: req.cookies }), '******* cookies! *****');
  if (!token) {
    console.log('Not authorized, no user cookie!');
    return NextResponse.redirect('/login');
  }
  try {
    var user;
    const userRes = await fetch(`${NETLIFY_SITE_URL}/.netlify/identity/user`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    user = (await userRes.json()) as NetlifyAppMetaData;

    console.log({ user }, '****** middleware login *****');
  } catch (error) {
    console.error(error);
  }

  if (!user?.app_metadata || !user.id) {
    console.log('Not authorized, no user cookie!');
    return NextResponse.redirect('/login');
  }

  console.log(
    '******************* START MIDDLE WARE *******************',
    JSON.stringify({
      basicAuth,
      user,
      event,
      req,
      //@ts-expect-error
      netlifyFunctionParams: req.netlifyFunctionParams,
    }),
    '******************* END MIDDLE WARE *******************',
  );

  return NextResponse.next();
};
