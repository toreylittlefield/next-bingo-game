/* code from functions/todos-create.js */
import type { NextApiHandler } from 'next';
import { decodeNFJWTAccessToken } from '../../../../lib/auth/decodeAuthJWT';
import { FAUNA_JWT_SECRET, PWS } from '../../../../lib/constants/constants';
import { serialize } from 'cookie';
import { loginFaunaAccount } from '../../../../lib/faunaApi/udfs/loginFaunaAccount';
import { sign, verify } from 'jsonwebtoken';
import faunadb from 'faunadb';
import { getFaunaRefreshToken } from '../../../../lib/faunaApi/udfs/getFaunaRefreshToken';
import { getFaunaAccessToken } from '../../../../lib/faunaApi/udfs/getFaunaAccessToken';
import { serverClient } from '../../../../lib/faunaApi/server';

type GrantTypes = 'access_token' | 'refresh_token' | 'login';

async function verifyFaunaRefreshToken(faunaRefreshToken: string) {
  if (faunaRefreshToken) {
    var token = (await verify(faunaRefreshToken, FAUNA_JWT_SECRET, (error, payload) => {
      if (error) return undefined;
      return payload;
    })) as string | undefined;
  }
  return token;
}

async function createFaunaRefreshJWTCookie(refreshToken: string, ttl: string) {
  const faunaRefreshJWT = await sign(refreshToken, FAUNA_JWT_SECRET);
  const exp = new Date(ttl);
  const fn_tknCookie = serialize('fn_tkn', faunaRefreshJWT, {
    httpOnly: true,
    path: '/',
    secure: true,
    expires: exp,
    // 1 hour
    maxAge: 60 * 60 * 1,
  });
  return fn_tknCookie;
}

/* export our lambda function as named "handler" export */
const handler: NextApiHandler = async (req, res) => {
  try {
    const { grantType } = req.query;

    if (req.method !== 'GET' && req.method !== 'POST' && !grantType) {
      return res.status(400).send('Missing Query String GrantType And/Or Must Be A GET OR POST Request');
    }

    const token = req.headers.authorization;
    if (!token) return res.status(401).send('No Access Token');

    const decoded = decodeNFJWTAccessToken(token);
    if (!decoded) return res.status(400).send('Invalid Token');

    switch (grantType as GrantTypes) {
      case 'login': {
        const { sub } = decoded;

        const logRes = await loginFaunaAccount(sub, PWS);
        if (!logRes) return res.status(400).send('Invalid UserId or Password');

        const { faunaTokens, faunaUser } = logRes;

        if (!faunaUser || !faunaTokens?.access) throw Error('No User and/or Access Token');
        const fn_tknCookie = await createFaunaRefreshJWTCookie(
          faunaTokens.refresh.secret,
          faunaTokens.refresh.ttl.value,
        );

        return res
          .setHeader('set-cookie', fn_tknCookie)
          .status(200)
          .json({ faunaUser, access_token: { secret: faunaTokens.access.secret, ttl: faunaTokens.access.ttl.value } });
      }
      case 'access_token': {
        const { fn_tkn } = req.cookies;

        const refreshToken = await verifyFaunaRefreshToken(fn_tkn);
        if (!refreshToken) return res.status(401).send('Not Signed / Invalid Token');

        const faunaRefreshClient = new faunadb.Client({
          secret: refreshToken,
          domain: 'db.fauna.com',
          scheme: 'https',
        });

        const tokens = await getFaunaAccessToken(faunaRefreshClient, refreshToken);
        if (!tokens?.faunaTokens) return res.status(400).send('Could Not Issue Refresh & Access Token');

        const { access } = tokens.faunaTokens;

        return res.status(200).json({ access_token: { secret: access.secret, ttl: access.ttl.value } });
      }
      case 'refresh_token': {
        const { fn_tkn } = req.cookies;

        const refreshToken = await verifyFaunaRefreshToken(fn_tkn);
        if (!refreshToken) return res.status(401).send('Not Signed / Invalid Token');

        const faunaLoggedInClient = new faunadb.Client({
          secret: refreshToken,
          domain: 'db.fauna.com',
          scheme: 'https',
        });

        console.log('refresh & access');
        const tokens = await getFaunaRefreshToken(faunaLoggedInClient);
        if (!tokens?.faunaTokens) return res.status(400).send('Could Not Issue Refresh & Access Token');

        const { access, refresh } = tokens.faunaTokens;

        if (!access?.secret || !refresh?.secret) throw Error('No Fauna Refresh and/or Access Token');

        const fn_tknCookie = await createFaunaRefreshJWTCookie(refresh.secret, refresh.ttl.value);
        return res
          .setHeader('set-cookie', fn_tknCookie)
          .status(200)
          .json({ access_token: { secret: access.secret, ttl: access.ttl.value } });
      }
      default: {
        return res.status(400).send('Not A Valid GrantType');
      }
    }
  } catch (error) {
    console.log('error', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: JSON.stringify(error.message) });
    }
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

export default handler;
