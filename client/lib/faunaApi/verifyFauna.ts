import { verify } from 'jsonwebtoken';
import { FAUNA_JWT_SECRET } from '../constants/constants';

async function verifyFaunaRefreshToken(faunaRefreshToken: string) {
  if (faunaRefreshToken) {
    var token = (await verify(faunaRefreshToken, FAUNA_JWT_SECRET, (error, payload) => {
      if (error) return undefined;
      return payload;
    })) as string | undefined;
  }
  return token;
}

export default verifyFaunaRefreshToken;
