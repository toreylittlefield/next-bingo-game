import { NextMiddleware, NextResponse } from 'next/server';
import { withNetlifySession } from '../lib/auth/withNetlifySession';
import { NETLIFY_SITE_URL } from '../lib/constants/constants';

export const middleware: NextMiddleware = async (req, event) => {
  const basicAuth = req.headers.get('authorization');
  const token = req?.cookies?.[`nf-jwt`];
  console.log(Array.from(req.headers.entries()));
  try {
    var user;
    const userRes = await fetch(`${NETLIFY_SITE_URL}/.netlify/identity/user`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    user = await userRes.json();
    console.log({ user }, '****** middleware login *****');
  } catch (error) {
    console.error(error);
  }
  // let readReq: Record<string, NextRequest> = {};
  // let reqKeys = Object.keys(req) as [keyof NextRequest];
  // reqKeys.forEach((key: keyof NextRequest) => {
  //   if (typeof key === 'boolean' || typeof key === 'object' || typeof key === 'number' || typeof key === 'string') {
  //     readReq[key] = req[key];
  //   }
  // });
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

  //   if (basicAuth) {
  // const auth = basicAuth.split(' ')[1];
  // const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

  // if (user === '4dmin' && pwd === 'testpwd123') {
  return NextResponse.next();
  // }
  //   }

  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
};
