/* code from functions/todos-create.js */
import faunadb, { Collection, Create } from 'faunadb'; /* Import faunaDB sdk */
import type { NextApiHandler } from 'next';
import { serverClient } from '../../../../functions/faunaApi/server';
import { decodeNFJWTAccessToken } from '../../../../lib/auth/decodeAuthJWT';
import { NETLIFY_SITE_URL, PWS } from '../../../../lib/constants/constants';
import type { LoggedInResponse } from '../../../../types/types';

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

    const { user, tokens } = (await serverClient.query(Call('login', [sub, PWS]))) as LoggedInResponse;

    if (!user || !tokens?.access) throw Error('No User and/or Access Token');
    const exp = tokens.refresh.ttl;
    const fn_tknCookieString = `fn_tkn=${tokens.refresh.secret}; secure; httpOnly; domain='${NETLIFY_SITE_URL}'; path='/'; Expires=${exp}`;
    res.setHeader('set-cookie', fn_tknCookieString);

    return res.status(200).json({ user, access_token: tokens.access });
  } catch (error) {
    console.log('error', error);
    res.status(400).json({ message: JSON.stringify(error) });
  }
};

export default handler;
