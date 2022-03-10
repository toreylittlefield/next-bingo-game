// eslint-disable-next-line @next/next/no-server-import-in-page
import type { NextRequest, NextResponse } from 'next/server';

type TokenAPI = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'bearer';
};

function getUserPasswordFromInput() {
  const username = process.env.TEST_USER_NAME as string;
  const password = process.env.TEST_PASSWORD as string;
  return { username, password };
}

async function loginIdentityUser({ username, password }: { username: string; password: string }) {
  try {
    const siteUrl = process.env.URL;
    const identityPath = '/.netlify/identity/token?';
    const params = `grant_type=password&username=${username}&password=${password}`;
    const url = siteUrl + identityPath + params;

    /** @type {fetch.Response} */
    const res = await fetch(siteUrl + identityPath + params, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const json = (await res.json()) as TokenAPI;
      return json;
    }

    const errorMessage = { status: res.status, statusText: res.statusText, url: url };
    throw Error(JSON.stringify(errorMessage));
  } catch (error) {
    console.error(error, 'Error in Identity Request');
  }
}

async function getIdentityForLocalTesting() {
  const identity = getUserPasswordFromInput();
  if (!identity.username) return;

  const identityToken = await loginIdentityUser(identity);
  if (!identityToken?.access_token) return;
  return { ...identityToken };
}

function isDevEnv(identityCookie: string | undefined, req: NextRequest) {
  if (!identityCookie && process.env.NODE_ENV === 'development' && req.headers.get('host')?.startsWith('localhost')) {
    console.log('local dev environment....');
    return true;
  }
  return false;
}

async function getLocalTestCookie(req: NextRequest, cookieAccessToken: string) {
  if (req.headers.get('host')?.startsWith('localhost')) {
    if (isDevEnv(cookieAccessToken, req)) {
      console.log('setting cookie for local dev');
      const token = await getIdentityForLocalTesting();
      return {
        token,
        set: function setLocalCookie(res: NextResponse) {
          if (token?.access_token) {
            cookieAccessToken = token.access_token;
            const date = new Date();
            const expires = token.expires_in / 60 / 60;
            if (expires !== 1) return;
            const hours = date.getHours();
            date.setHours(hours + expires);
            res.cookie('nf_jwt', token.access_token, { httpOnly: true, secure: true, sameSite: true, expires: date });
          }
          return cookieAccessToken;
        },
      };
    }
  }
}

export { getLocalTestCookie };
