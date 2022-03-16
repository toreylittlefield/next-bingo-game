import faunadb from 'faunadb';
import type { FaunaLoggedInResponse } from '../../../types/types';
const { Call, CurrentToken } = faunadb.query;

type FaunaAccessTokenRes = Exclude<FaunaLoggedInResponse, 'user'>;

export async function getFaunaAccessToken(
  faunaRefreshClient: faunadb.Client,
  refresh_token: string,
): Promise<{ faunaTokens: FaunaAccessTokenRes['tokens'] } | undefined> {
  try {
    const { tokens } = (await faunaRefreshClient.query(
      Call('create_access_token', CurrentToken()),
    )) as FaunaAccessTokenRes;
    return { faunaTokens: tokens };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
