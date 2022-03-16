import faunadb from 'faunadb';
import { FaunaLoggedInResponse } from '../../../types/types';
import { serverClient } from '../server';
const { Call } = faunadb.query;

export async function loginFaunaAccount(
  userId: string,
  password: string,
): Promise<{ faunaTokens: FaunaLoggedInResponse['tokens']; faunaUser: FaunaLoggedInResponse['user'] } | undefined> {
  try {
    const { user, tokens } = (await serverClient.query(Call('login', [userId, password]))) as FaunaLoggedInResponse;
    return { faunaUser: user, faunaTokens: tokens };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
