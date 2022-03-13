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

    const res = await fetch(siteUrl + identityPath + params, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Use-Cookie': '1',
      },
    });
    if (res.status === 200) {
      const cookie = res.headers.get('set-cookie');
      const json = (await res.json()) as TokenAPI;
      return { json, cookie };
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
  if (!identityToken?.json?.access_token) return;
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
      const response = await getIdentityForLocalTesting();
      return {
        token: response?.json,
        cookie: response?.cookie,
        set: function setLocalCookie(res: NextResponse) {
          if (response?.json?.access_token && response.cookie) {
            cookieAccessToken = response.json.access_token;
            res.headers.set('set-cookie', response.cookie);
            // res.cookie('nf_jwt', response.cookie);
          }
          return cookieAccessToken;
        },
      };
    }
  }
}

export { getLocalTestCookie };
