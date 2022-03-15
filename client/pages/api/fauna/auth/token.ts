/* code from functions/todos-create.js */
import faunadb from 'faunadb'; /* Import faunaDB sdk */
import type { NextApiHandler } from 'next';
import { decodeNFJWTAccessToken } from '../../../../lib/auth/decodeAuthJWT';
import { PWS } from '../../../../lib/constants/constants';
import type { FaunaLoggedInResponse } from '../../../../types/types';
import { serialize } from 'cookie';
import { serverClient } from '../../../../lib/faunaApi/server';

/* configure faunaDB Client with our secret */
const { Call } = faunadb.query;

type Data = {
  message: string | object;
};

interface Message {
  userName: string;
  message: string;
}

/* export our lambda function as named "handler" export */
const handler: NextApiHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(403).send('No Access Token');

    const decoded = decodeNFJWTAccessToken(token);
    if (!decoded) return res.status(400).send('Invalid Token');

    const { sub } = decoded;

    const { user, tokens } = (await serverClient.query(Call('login', [sub, PWS]))) as FaunaLoggedInResponse;

    if (!user || !tokens?.access) throw Error('No User and/or Access Token');
    const exp = new Date(tokens.refresh.ttl.value);
    // const maxAge = 60 * 60 * 1;
    // const fn_tknCookieString = `fn_tkn=${tokens.refresh.secret}; secure; httpOnly; Path=/; Expires=${exp}; Max-Age=${maxAge}`;
    const fn_tknCookie = serialize('fn_tkn', tokens.refresh.secret, {
      httpOnly: true,
      path: '/',
      secure: true,
      expires: exp,
      // 1 hour
      maxAge: 60 * 60 * 1,
    });

    return res
      .setHeader('set-cookie', fn_tknCookie)
      .status(200)
      .json({ user, access_token: { secret: tokens.access.secret, ttl: tokens.access.ttl.value } });
  } catch (error) {
    console.log('error', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: JSON.stringify(error.message) });
    }
    return res.status(500).json({ message: 'Something Went Wrong' });
  }
};

export default handler;
