import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  //   const basicAuth = req.headers.get('authorization');
  let readReq: Record<string, string> = {};
  for (let key of Object.values(req)) {
    if (typeof key !== 'function') {
      readReq[key] = key;
    }
  }
  console.log(
    JSON.stringify({
      readReq,
      body: req.body,
      // cache: req.cache,
      // credentials: req.credentials,
      // destination: req.destination,
      // integrity: req.integrity,
      headers: req.headers,
      mode: req.mode,
      redirect: req.redirect,
      method: req.method,
      //@ts-expect-error
      netlifyFunctionParams: req.netlifyFunctionParams,
    }),
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
}
