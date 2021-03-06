import faunadb from 'faunadb';
import type { FaunaLoggedInResponse } from '../../../types/types';
const { Call } = faunadb.query;

type FaunaRefreshTokenRes = Exclude<FaunaLoggedInResponse, 'user'>;

export async function getFaunaRefreshToken(
  faunaRefreshClient: faunadb.Client,
): Promise<{ faunaTokens: FaunaRefreshTokenRes['tokens'] } | undefined> {
  try {
    const { tokens } = (await faunaRefreshClient.query(
      Call('create_refresh_and_access_token', []),
    )) as FaunaRefreshTokenRes;
    return { faunaTokens: tokens };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
