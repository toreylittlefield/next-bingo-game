import faunadb from 'faunadb';
import type { FaunaLoggedInApiResponse, FaunaLoggedInResponse } from '../../../types/types';
import { serverClient } from '../server';
const { Call } = faunadb.query;

export async function loginFaunaAccount(userId: string, password: string): Promise<FaunaLoggedInApiResponse> {
  try {
    const { user, tokens } = (await serverClient.query(Call('login', [userId, password]))) as FaunaLoggedInResponse;
    if (user.lastUpdated !== false) {
      const [lastUpdated] = Object.values(user.lastUpdated);
      const copyUser = { ...user, lastUpdated };
      return { faunaUser: copyUser, faunaTokens: tokens };
    }
    const lastUpdated = user.lastUpdated;
    const copyUser = { ...user, lastUpdated };
    return { faunaUser: copyUser, faunaTokens: tokens };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
