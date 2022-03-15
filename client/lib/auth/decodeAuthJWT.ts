import { decode } from 'jsonwebtoken';
import type { NfJwtCookie } from '../../types/types';

export function decodeNFJWTAccessToken(token: string) {
  const [_, access_token] = token.split(' ');
  const decodedJWT = decode(access_token, { json: true }) as NfJwtCookie;
  if (!decodedJWT) return;
  return { access_token, ...decodedJWT };
}
