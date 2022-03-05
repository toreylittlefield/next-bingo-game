import { NextMiddleware, NextResponse } from 'next/server';

export const middleware: NextMiddleware = (req, event) => {
  const basicAuth = req.headers.get('authorization');
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
      // readReq,
      // body: req.body,
      // cache: req.cache,
      // credentials: req.credentials,
      // destination: req.destination,
      // integrity: req.integrity,
      // headers: req.headers,
      // mode: req.mode,
      // redirect: req.redirect,
      // method: req.method,
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
