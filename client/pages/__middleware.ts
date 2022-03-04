import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  //   const basicAuth = req.headers.get('authorization');
  console.log(
    JSON.stringify({
      body: req.body,
      cache: req.cache,
      credentials: req.credentials,
      destination: req.destination,
      headers: req.headers,
      integrity: req.integrity,
      mode: req.mode,
      redirect: req.redirect,
      req: req.method,
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
