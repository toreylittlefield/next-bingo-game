import { NextResponse } from 'next/server';

// pages/_middleware.ts

import type { NextFetchEvent, NextRequest } from 'next/server';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const someCookie = req.cookies['something'];
  //   const res = NextResponse.rewrite(`/something/${someCookie}`);
  console.log(req, '**************middleware*********');

  return null;
  return new Response('Hello, world!');
}
